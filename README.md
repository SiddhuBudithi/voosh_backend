Voosh RAG Chatbot — Backend README

This backend powers a Retrieval-Augmented Generation (RAG) chatbot using:
- Node.js + Express.js (ESM)
- Qdrant Cloud - Vector Database
- Jina Embeddings (768-dim)
- Google Gemini AI(Gemini 2.5 Flash)
- Upstash Redis (serverless)(Session Chat History)

Cloud Infrastructure:
1. Google Cloud Run(serverless container)
2. Google Secret Manager(env secrets)
3. Google Artifact Registry/GCR
4. Google Cloud Scheduler(cron ingestion)

Features:
- RAG-enabled chat system
- Semantic search using Qdrant
- Streamlined ingestion of documents
- Redis-backed session & chat history
- Cloud-native deployment
- Automatic ingestion every 3 hours
- Error handling and logging
- Environment-secured secrets
- Supports multiple sessions & users

Backend Setup:
npm install
Configure .env
Run Qdrant & Redis
npm run ingest
npm start

API Endpoints:
POST /api/session
POST /api/chat
GET /api/chat/history/:id
DELETE /api/chat/history/:id

Folder Structure:
controllers/
routes/
services/
config/
scripts/
server.js