// redis.js — FINAL production-safe version for Cloud Run + Upstash
import { Redis } from '@upstash/redis';

/**
 * SAFE REDIS CLIENT FOR CLOUD RUN
 *
 * - If UPSTASH_REDIS_URL + UPSTASH_REDIS_TOKEN exist → use Upstash (recommended)
 * - If they do NOT exist → gracefully fall back to an in-memory implementation
 *   (this prevents Cloud Run startup crashes)
 */

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;

let client;

if (url && token) {
  try {
    client = new Redis({ url, token });
    console.log("Using Upstash Redis");
  } catch (err) {
    console.error("Failed to create Upstash Redis client. Falling back to memory store:", err);
    client = null;
  }
}

if (!client) {
  console.warn("Upstash Redis not configured. Using in-memory fallback.");
  
  const memoryStore = new Map();

  client = {
    // Append value to list
    rpush: async (key, value) => {
      const list = memoryStore.get(key) || [];
      list.push(value);
      memoryStore.set(key, list);
      return list.length;
    },
    // Expire - no-op
    expire: async (key, seconds) => {
      return 1;
    },
    // List range
    lrange: async (key, start = 0, stop = -1) => {
      const list = memoryStore.get(key) || [];
      if (stop === -1) stop = list.length - 1;
      return list.slice(start, stop + 1);
    },
    // Delete key
    del: async (key) => {
      return memoryStore.delete(key) ? 1 : 0;
    }
  };
}

export default client;
