import express from 'express';
import { uploadTitleChapter, upload } from '../controllers/upload.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import { uploadValidation } from '../middlewares/validation.js';
const router = express.Router();

router.post('/', verifyToken, upload, uploadValidation, uploadTitleChapter);

export default router;
