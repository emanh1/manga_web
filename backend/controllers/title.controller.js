import TitleService from "../services/title.service.js";
import AppError from "../utils/appError.js";

export const getChapter = async (req, res, next) => {
  try {
    const { titleId, chapterId } = req.params;
    const chapterInfo = await TitleService.getChapterInfo(titleId, chapterId);
    res.json(chapterInfo);
  } catch (error) {
    next(new AppError(error.message, error.message.includes('not found') ? 404 : 500));
  }
};

export const getChapters = async (req, res, next) => {
  try {
    const { titleId } = req.params;
    const chapters = await TitleService.getChapters(titleId);
    res.json({ chapters });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getAllPendingChapters = async (req, res, next) => {
  try {
    const chapters = await TitleService.getAllPendingChapters();
    res.json({ chapters });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getAllRejectedChapters = async (req, res, next) => {
  try {
    const chapters = await TitleService.getAllRejectedChapters();
    res.json({ chapters });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const reviewChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    const upload = await TitleService.reviewChapter(chapterId, status, rejectionReason);
    res.json({ upload });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const previewChapter = async (req, res, next) => {
  try {
    const { titleId, chapterId } = req.params;
    const chapterInfo = await TitleService.getChapterInfoPreview(titleId, chapterId);
    res.json(chapterInfo);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
}