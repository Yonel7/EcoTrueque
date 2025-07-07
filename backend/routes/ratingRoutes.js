import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRating,
  getUserRatings
} from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', protect, createRating);
router.get('/user/:userId', getUserRatings);

export default router;