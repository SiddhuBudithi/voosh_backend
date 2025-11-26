import redis from '../config/redis.js';

const SESSION_TTL = parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10);

function sessionKey(sessionId) {
  return `session:${sessionId}:history`;
}

export async function pushMessage(sessionId, message) {
  const key = sessionKey(sessionId);
  await redis.rpush(key, JSON.stringify(message));
  await redis.expire(key, SESSION_TTL);
}

export async function getHistory(sessionId) {
  const key = sessionKey(sessionId);
  const items = await redis.lrange(key, 0, -1);
  return items.map(i => JSON.parse(i));
}

export async function clearHistory(sessionId) {
  const key = sessionKey(sessionId);
  await redis.del(key);
}
