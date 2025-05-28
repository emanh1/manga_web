import express from 'express';
import { uploadMangaChapter, getChapter, getChapters, upload, getAllPendingChapters, getAllRejectedChapters, reviewChapter, previewChapter } from '../controllers/upload.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { uploadValidation } from '../middlewares/validation.js';
const router = express.Router();

// TODO upload validation
// router.post('/upload', verifyToken, uploadValidation, upload, uploadMangaChapter);
router.post('/upload', verifyToken, upload, uploadMangaChapter);
router.get('/admin/pending', verifyToken, isAdmin, getAllPendingChapters);
router.get('/admin/rejected', verifyToken, isAdmin, getAllRejectedChapters);
router.post('/admin/review/:id', verifyToken, isAdmin, reviewChapter);
router.get('/:mangaId/chapters', getChapters);
router.get('/:mangaId/:chapterId', getChapter);
router.get('/:mangaId/:chapterId/preview', verifyToken, isAdmin, previewChapter);

export default router;
