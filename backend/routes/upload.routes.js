import express from 'express';
import { uploadMangaChapter, getUploads, reviewUpload } from '../controllers/upload.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/upload', verifyToken, uploadMangaChapter);
router.get('/uploads', verifyToken, getUploads);
router.put('/review/:id', verifyToken, isAdmin, reviewUpload);

export default router;
