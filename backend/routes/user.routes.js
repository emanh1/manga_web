import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile/:uuid', getProfile);
router.put('/profile/:uuid', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;
