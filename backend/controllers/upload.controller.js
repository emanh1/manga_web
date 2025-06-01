import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';
import UploadService from '../services/upload.service.js';
import dotenv from 'dotenv';

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new AppError('Only support .jpeg, .jpg, .png files', 400));
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).array('files', 100);

async function cleanupFiles(files) {
  if (!files || files.length === 0) return;
  await Promise.all(files.map(async (file) => {
    try {
      if (fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
      }
    } catch (err) {
      console.error('Error deleting file:', file.path, err);
    }
  }));
}

function formatSequelizeError(error) {
  return {
    status: 'fail',
    message: 'Database validation error',
    errors: error.errors?.map(e => ({ message: e.message, path: e.path })) || error.message
  };
}

export const uploadMangaChapter = async (req, res, next) => {
  const uploadedFiles = [];
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    // Upload files to IPFS
    const ipfsResult = await UploadService.uploadToIpfs(files);
    uploadedFiles.push(...ipfsResult.uploadedFiles);

    // Create manga upload records
    const result = await UploadService.createMangaUpload(req.body, ipfsResult, req.user.uuid);

    // Clean up local files
    await cleanupFiles(uploadedFiles);

    const response = {
      message: result.fileErrors.length > 0 ? 'Upload completed with some errors' : 'Files uploaded successfully',
      uploads: result
    };

    res.status(201).json(response);
  } catch (error) {
    await cleanupFiles(uploadedFiles);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json(formatSequelizeError(error));
    }
    next(new AppError(error.message, 500));
  }
};

export const getChapter = async (req, res, next) => {
  try {
    const { mangaId, chapterId } = req.params;
    const chapterInfo = await UploadService.getChapterInfo(mangaId, chapterId);
    res.json(chapterInfo);
  } catch (error) {
    next(new AppError(error.message, error.message.includes('not found') ? 404 : 500));
  }
};

export const getChapters = async (req, res, next) => {
  try {
    const { mangaId } = req.params;
    const chapters = await UploadService.getChapters(mangaId);
    res.json({ chapters });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getAllPendingChapters = async (req, res, next) => {
  try {
    const chapters = await UploadService.getAllPendingChapters();
    res.json({ chapters });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getAllRejectedChapters = async (req, res, next) => {
  try {
    const chapters = await UploadService.getAllRejectedChapters();
    res.json({ chapters });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const reviewChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    const upload = await UploadService.reviewChapter(id, status, rejectionReason);
    res.json({ upload });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const previewChapter = async (req, res, next) => {
  try {
    const { mangaId, chapterId } = req.params;
    const chapterInfo = await UploadService.getChapterInfoPreview(mangaId, chapterId);
    res.json(chapterInfo);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
}