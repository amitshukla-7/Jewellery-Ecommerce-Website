import express from 'express';
import {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/investments')
  .get(protect, admin, getInvestments)
  .post(protect, admin, createInvestment);
router
  .route('/investments/:id')
  .put(protect, admin, updateInvestment)
  .delete(protect, admin, deleteInvestment);

export default router;
