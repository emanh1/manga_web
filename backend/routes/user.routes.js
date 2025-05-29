import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/profile/:uuid', getProfile);

export default router;
