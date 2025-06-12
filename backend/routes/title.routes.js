import express from 'express';

import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { getChapter, getChapters, getAllPendingChapters, getAllRejectedChapters, reviewChapter, previewChapter } from '../controllers/title.controller.js';

const router = express.Router();

router.get('/pending_chapters', verifyToken, isAdmin, getAllPendingChapters);
router.get('/rejected_chapters', verifyToken, isAdmin, getAllRejectedChapters);
router.post('/review_chapter/:chapterId', verifyToken, isAdmin, reviewChapter);
router.get('/:titleId/chapters', getChapters);
router.get('/:titleId/:chapterId/preview', verifyToken, isAdmin, previewChapter);
router.get('/:titleId/:chapterId', getChapter);


export default router;