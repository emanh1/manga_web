import express from 'express';
import { uploadMangaChapter, getChapter, getChapters } from '../controllers/upload.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { uploadValidation } from '../middlewares/validation.js';
import { upload } from '../controllers/upload.controller.js';
const router = express.Router();

router.post('/upload', verifyToken, uploadValidation, upload, uploadMangaChapter);
router.get('/:mangaId/chapters', getChapters);
router.get('/:mangaId/:chapterId', getChapter);

export default router;
