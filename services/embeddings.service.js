import axios from "axios";

export async function embedTexts(texts = []) {
  if (!Array.isArray(texts)) texts = [texts];

  const url = process.env.JINA_EMBEDDINGS_URL;
  const apiKey = process.env.JINA_API_KEY;

  if (!url) throw new Error("JINA_EMBEDDINGS_URL not set");
  if (!apiKey) throw new Error("JINA_API_KEY not set");

  try {
    const response = await axios.post(
      url,
      {
        model: "jina-embeddings-v2-base-en",
        input: texts
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        }
      }
    );

    // Jina Cloud returns: { data: [ { embedding: [...] }, ... ] }
    return response.data.data.map(item => item.embedding);
  } catch (err) {
    console.error("Jina Cloud Error:", err.response?.data || err.message);
    throw err;
  }
}
