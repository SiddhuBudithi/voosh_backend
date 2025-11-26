import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "https://b100ef9c-0f2b-4e37-b98a-940cb353cc4d.europe-west3-0.gcp.cloud.qdrant.io:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY || undefined,
  timeout: 30_000,
  checkCompatibility: false,
});

export default qdrantClient;
