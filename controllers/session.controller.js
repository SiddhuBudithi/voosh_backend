import { v4 as uuidv4 } from 'uuid';

export function createSession(req, res) {
  const sessionId = uuidv4();
  res.json({ sessionId });
}
