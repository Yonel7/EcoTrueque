import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTradeMessages,
  sendMessage,
  getUnreadMessageCount
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/unread-count', protect, getUnreadMessageCount);
router.get('/trade/:tradeId', protect, getTradeMessages);
router.post('/trade/:tradeId', protect, sendMessage);

export default router;