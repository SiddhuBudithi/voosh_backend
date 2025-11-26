import 'dotenv/config';
import { ensureQdrantCollection, ingestRSS, ingestLocalPdf, indexDocuments } from '../services/ingest.service.js';

export async function runIngestion() {
  try {
    await ensureQdrantCollection();

    const RSS_URL = process.env.INGEST_RSS || 'http://feeds.bbci.co.uk/news/world/rss.xml';
    console.log('Fetching RSS from', RSS_URL);
    const rssDocs = await ingestRSS(RSS_URL, 50);
    console.log('RSS docs fetched:', rssDocs.length);

    const PDF_PATH = process.env.LOCAL_PDF_PATH || '/mnt/data/Assignment-Full Stack Developer.pdf';
    console.log('Attempting to ingest local PDF at', PDF_PATH);
    const pdfDocs = await ingestLocalPdf(PDF_PATH);
    console.log('Local PDF docs:', pdfDocs.length);

    const docs = [...rssDocs, ...pdfDocs];
    console.log('Total docs to index:', docs.length);

    if (docs.length > 0) {
      await indexDocuments(docs);
      console.log('Ingestion & indexing complete.');
    } else {
      console.log('No documents found to index.');
    }
  } catch (err) {
    console.error('Ingest script error', err);
    throw err; // don't exit Cloud Run container
  }
}
