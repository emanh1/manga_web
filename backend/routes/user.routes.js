import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile/:uuid', getProfile);
router.put('/profile/:uuid', verifyToken, updateProfile);

export default router;
