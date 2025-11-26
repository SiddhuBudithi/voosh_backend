import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_HOST = process.env.QDRANT_HOST || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;

const qdrantClient = new QdrantClient({
  url: QDRANT_HOST,
  apiKey: QDRANT_API_KEY || undefined
});

export default qdrantClient;