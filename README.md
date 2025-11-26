Voosh RAG Chatbot — Backend README

This backend powers a Retrieval-Augmented Generation (RAG) chatbot using:
- Node.js + Express.js (ESM)
- Qdrant Vector Database
- Jina Embeddings (768-dim)
- Gemini 2.5 Flash
- Redis (Session Chat History)

Features:
1. RAG Search Pipeline
2. Gemini 2.5 Flash Integration
3. Redis Session History
4. RSS Ingestion (BBC News)
5. Clean Express Architecture

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