import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

if (!GEMINI_API_KEY || !GEMINI_API_URL) {
  console.warn('GEMINI_API_KEY or GEMINI_API_URL not configured. Gemini calls will fail until configured.');
}

const geminiClient = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    Authorization: `Bearer ${GEMINI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

export default geminiClient;
