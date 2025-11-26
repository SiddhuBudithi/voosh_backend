import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { randomUUID } from "crypto";

// These packages are CommonJS → must use require()
const RSSParser = require("rss-parser");
const cheerio = require("cheerio");
const pdfParse = require("pdf-parse");

// These are ES modules → normal import is fine
import fs from "fs";
import qdrantClient from "../config/qdrant.js";
import { embedTexts } from "./embeddings.service.js";

export const COLLECTION_NAME = "news_articles";
const CHUNK_SIZE = 800; // characters per chunk

export async function ensureQdrantCollection() {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.find(
      (c) => c.name === COLLECTION_NAME
    );
    if (!exists) {
      // choosing vector size expected from Jina embeddings. Jina vector dimension depends on model.
      await qdrantClient.recreateCollection(COLLECTION_NAME, {
        vectors: { size: 768, distance: "Cosine" },
      });
      console.log("Created Qdrant collection", COLLECTION_NAME);
    } else {
      console.log("Qdrant collection exists:", COLLECTION_NAME);
    }
  } catch (err) {
    console.error("Error ensuring Qdrant collection:", err);
    throw err;
  }
}

function chunkText(text, size = CHUNK_SIZE) {
  const out = [];
  for (let i = 0; i < text.length; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out;
}

export async function ingestRSS(rssUrl, limit = 50) {
  const parser = new RSSParser();
  const feed = await parser.parseURL(rssUrl);
  const items = (feed.items || []).slice(0, limit);
  const docs = [];

  for (const it of items) {
    const html = it["content:encoded"] || it.content || it.summary || "";
    const $ = cheerio.load(html || "");
    const text = $.text().trim() || it.title || "";
    docs.push({
      id: it.link || it.guid || it.title,
      title: it.title,
      text,
      url: it.link,
    });
  }
  return docs;
}

export async function ingestLocalPdf(pdfPath) {
  if (!fs.existsSync(pdfPath)) {
    console.warn("Local PDF path does not exist:", pdfPath);
    return [];
  }
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text || "";
  // Use the file path as the source URL
  return [
    {
      id: `local-pdf-${Date.now()}`,
      title: "Assignment PDF (seed)",
      text,
      url: pdfPath,
    },
  ];
}

export async function indexDocuments(docs = []) {
  if (!docs.length) return;
  const points = [];

  for (const doc of docs) {
    const passages = chunkText(doc.text, CHUNK_SIZE);
    for (let i = 0; i < passages.length; i++) {
      const passage = passages[i].trim();
      if (!passage) continue;
      points.push({
        id: `${doc.id}::${i}`,
        text: passage,
        meta: { title: doc.title, url: doc.url },
      });
    }
  }

  const BATCH = 16;
  for (let i = 0; i < points.length; i += BATCH) {
    const batch = points.slice(i, i + BATCH);
    const texts = batch.map((b) => b.text);
    const embeddings = await embedTexts(texts);

    const qdrantPoints = batch.map((b, idx) => ({
      id: randomUUID(),
      vector: embeddings[idx],
      payload: { text: b.text, ...b.meta },
    }));

    await qdrantClient.upsert(COLLECTION_NAME, {
      points: qdrantPoints,
    });
    console.log(`Indexed ${i + qdrantPoints.length}/${points.length}`);
  }
}
