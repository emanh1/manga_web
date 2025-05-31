import express from 'express';
import { getProfile, updateProfile, changePassword, getUserUploads } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile/:uuid', getProfile);
router.put('/profile/:uuid', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.get('/uploads', verifyToken, getUserUploads);
router.get('/uploads/:uuid', getUserUploads);

export default router;
