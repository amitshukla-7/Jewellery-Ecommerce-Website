import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMetalRates,
  updateMetalRates,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { productSchema, productUpdateSchema, ratesSchema } from '../validators/schemas.js';

const router = express.Router();

router.route('/rates').get(getMetalRates).post(protect, admin, validate(ratesSchema), updateMetalRates);
router.route('/').get(getProducts).post(protect, admin, validate(productSchema), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, validate(productUpdateSchema), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
