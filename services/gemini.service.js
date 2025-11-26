import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });

export async function generateFromGemini(prompt, opts = {}) {
  try {
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: opts.maxTokens || 512,
        temperature: opts.temperature ?? 0.2
      }
    });

  
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err?.response || err?.message || err);
    if (err?.status === 404) {
      console.error(
        `Model "${modelName}" returned 404. Try GEMINI_MODEL=gemini-2.5-flash and ensure the API key has access.`
      );
    }
    throw err;
  }
}
