import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  createProduct,
  getProducts,
  getUserProducts,
  updateProduct,
  deleteProduct,
  toggleProductAvailability
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, upload.array('images', 5), createProduct);
router.get('/user', protect, getUserProducts);
router.put('/:id', protect, upload.array('images', 5), updateProduct);
router.put('/:id/availability', protect, toggleProductAvailability);
router.delete('/:id', protect, deleteProduct);

export default router;