import express from 'express';
import { postChat, getHistory, deleteHistory } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', postChat);
router.get('/history/:sessionId', getHistory);
router.delete('/history/:sessionId', deleteHistory);

export default router;
