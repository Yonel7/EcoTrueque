import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);
router.delete('/all', protect, deleteAllNotifications);

export default router;