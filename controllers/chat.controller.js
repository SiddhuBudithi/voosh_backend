import { pushMessage, getHistory as getSessionHistory, clearHistory } from '../services/session.service.js';
import { retrieveRelevantPassages } from '../services/rag.service.js';
import { generateFromGemini } from '../services/gemini.service.js';

// RAG-enhanced prompt
function buildPrompt(passages, history, userQuestion) {
  const contextText = passages
    .map((p, i) => `Passage ${i + 1} (score: ${p.score}):\n${p.text}`)
    .join("\n\n");

  const chatHistoryText = (history || [])
    .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n");

  return `
You are a helpful assistant. Use the context passages *only if relevant*.
If the answer cannot be found in the context, respond: "Aww sweetie, Try asking something related to the news".

Context:
${contextText}

Chat History:
${chatHistoryText}

User Question:
${userQuestion}

Answer concisely. Cite context passages when relevant.
`;
}

export async function postChat(req, res) {
  try {
    const { sessionId, text } = req.body;
    if (!sessionId || !text) {
      return res.status(400).json({ error: "sessionId and text required" });
    }
    // 1. Save user's question
    await pushMessage(sessionId, {
      sender: "user",
      text,
      ts: Date.now(),
    });

    // 2. Retrieve session history (last 10 messages)
    const history = await getSessionHistory(sessionId);
    const lastHistory = history.slice(-10);

    // 3. Retrieve RAG context
    const passages = await retrieveRelevantPassages(text);

    // 4. Build final prompt
    const prompt = buildPrompt(passages, lastHistory, text);

    // 5. Generate answer from Gemini 1.5 Flash
    const answer = await generateFromGemini(prompt, {
      maxTokens: 512,
      temperature: 0.2,
    });

    // 6. Save bot's answer
    await pushMessage(sessionId, {
      sender: "bot",
      text: answer,
      ts: Date.now(),
    });

    // 7. Send back to frontend
    return res.json({
      answer,
      passages,
    });

  } catch (err) {
    console.error("chat.postChat error", err);
    return res.status(500).json({
      error: err.message || "server error",
    });
  }
}

export async function getHistory(req, res) {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  const history = await getSessionHistory(sessionId);
  res.json({ history });
}

export async function deleteHistory(req, res) {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  await clearHistory(sessionId);
  res.json({ ok: true });
}
