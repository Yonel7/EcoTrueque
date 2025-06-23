import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  proposeTrade,
  respondToTrade,
  completeTrade,
  getUserTrades
} from '../controllers/tradeController.js';

const router = express.Router();

router.post('/', protect, proposeTrade);
router.put('/:id/respond', protect, respondToTrade);
router.put('/:id/complete', protect, completeTrade);
router.get('/user', protect, getUserTrades);

export default router;