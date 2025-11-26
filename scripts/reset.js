import qdrantClient from "../config/qdrant.js";

async function reset() {
  try {
    await qdrantClient.deleteCollection("news_articles");
    console.log("Deleted old collection");
  } catch (err) {
    console.error("Delete error:", err);
  }
}

reset();
