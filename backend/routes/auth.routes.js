import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import { registerValidation, loginValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', verifyToken, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
