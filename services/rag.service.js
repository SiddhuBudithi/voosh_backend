import qdrantClient from '../config/qdrant.js';
import { embedTexts } from './embeddings.service.js';
import { COLLECTION_NAME } from './ingest.service.js';

const TOP_K = parseInt(process.env.TOP_K || '4', 10);

/**
 * retrieveRelevantPassages(query: string) => Promise<Array<{id, text, score, meta}>> 
 *
 * - Embeds the query via embedTexts()
 * - Uses qdrantClient.search(collectionName, { vector, limit, with_payload: true })
 *   (API shape used by @qdrant/js-client-rest)
 * - Returns clean array of passages
 */
export async function retrieveRelevantPassages(query) {
  if (!query || typeof query !== 'string') return [];

  try {
    // 1) embed the query
    const embeddings = await embedTexts([query]);
    if (!Array.isArray(embeddings) || embeddings.length === 0) {
      console.warn('No embedding returned for query');
      return [];
    }
    const qVec = embeddings[0];

    // 2) call Qdrant search (REST client)
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: qVec,
      limit: TOP_K,
      with_payload: true
    });

    // 3) map results into a stable shape
    const passages = (searchResult || []).map((r) => {
      const payload = r.payload || {};
      const text = payload.text ?? payload.content ?? payload.title ?? '';
      return {
        id: r.id,
        text,
        score: r.score,
        meta: payload
      };
    });

    return passages;
  } catch (err) {
    console.error('rag.service.retrieveRelevantPassages error', err?.response?.data || err.message || err);
    throw err;
  }
}
