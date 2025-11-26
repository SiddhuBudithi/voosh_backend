import "dotenv/config";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import sessionRoutes from "./routes/session.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { ensureQdrantCollection } from "./services/ingest.service.js";
import { runIngestion } from "./scripts/ingest.js";

const PORT = process.env.PORT || 8080;
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

app.post("/api/admin/ingest", async (req, res) => {
  try {
    const secret = req.headers["x-cron-key"];

    if (!secret || secret !== process.env.INGEST_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await runIngestion();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server and ensure Qdrant collection exists
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Non-blocking background task
ensureQdrantCollection()
  .then(() => console.log("Qdrant collection checked/created."))
  .catch(err =>
    console.warn("Qdrant collection check failed:", err.message || err)
  );


export default app;
