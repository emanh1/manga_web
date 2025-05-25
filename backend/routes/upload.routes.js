import express from 'express';
import { uploadMangaChapter, getUploads, reviewUpload, getChapter, getChapterPages } from '../controllers/upload.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { upload } from '../controllers/upload.controller.js';
const router = express.Router();

router.post('/upload', verifyToken, upload, uploadMangaChapter);
router.get('/uploads', verifyToken, getUploads);
router.put('/review/:id', verifyToken, isAdmin, reviewUpload);
router.get('/:mangaId/chapters/:chapterId', verifyToken, getChapter);
router.get('/:mangaId/chapters/:chapterId/pages', verifyToken, getChapterPages);

export default router;
