import "dotenv/config";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import sessionRoutes from "./routes/session.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { ensureQdrantCollection } from "./services/ingest.service.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());

// Middleware
app.use(
  cors({
    origin: ["https://vogueblend.com", "https://www.vogueblend.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// app.use(express.json());

// routes
app.use("/api/session", sessionRoutes);
app.use("/api/chat", chatRoutes);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// start server and ensure Qdrant collection exists
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  try {
    await ensureQdrantCollection();
    console.log("Qdrant collection checked/created.");
  } catch (err) {
    console.warn(
      "Qdrant collection check failed (you can still proceed):",
      err.message || err
    );
  }
});

export default app;
