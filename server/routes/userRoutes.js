import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { userRegisterSchema, userLoginSchema } from '../validators/schemas.js';

const router = express.Router();

router.route('/').post(validate(userRegisterSchema), registerUser).get(protect, admin, getUsers);
router.post('/login', validate(userLoginSchema), authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
