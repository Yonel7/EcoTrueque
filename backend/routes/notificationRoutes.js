import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);

export default router;