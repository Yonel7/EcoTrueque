import express from 'express';
import { 
  register, 
  login, 
  updateProfile, 
  updateAvatar,
  googleAuth, 
  facebookAuth, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rutas protegidas
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

export default router;