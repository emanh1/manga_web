import express from 'express';
import { uploadTitleChapter, getChapter, getChapters, upload, getAllPendingChapters, getAllRejectedChapters, reviewChapter, previewChapter } from '../controllers/upload.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { uploadValidation } from '../middlewares/validation.js';
const router = express.Router();

router.post('/upload', verifyToken, upload, uploadValidation, uploadTitleChapter);
router.get('/admin/pending', verifyToken, isAdmin, getAllPendingChapters);
router.get('/admin/rejected', verifyToken, isAdmin, getAllRejectedChapters);
router.post('/admin/review/:id', verifyToken, isAdmin, reviewChapter);
router.get('/:titleId/chapters', getChapters);
router.get('/:titleId/:chapterId', getChapter);
router.get('/:titleId/:chapterId/preview', verifyToken, isAdmin, previewChapter);

export default router;
