import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../models/index.js';
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
    cb(new Error('Only support .jpeg, .jpg, .png files'));
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).array('files', 100); 

export const uploadMangaChapter = async (req, res) => {
  try {
    const { title, volume, chapter, chapterTitle, language, isOneshot, malId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (!language) {
      return res.status(400).json({ message: 'Language is required' });
    }

    const uploads = await Promise.all(files.map((file, index) => {
      return db.MangaUpload.create({
        title,
        malId: malId ? parseInt(malId) : null,
        volume: volume ? parseInt(volume) : null,
        chapter: chapter ? parseInt(chapter) : null,
        chapterTitle: chapterTitle || null,
        language,
        isOneshot: isOneshot === 'true',
        fileOrder: index,
        filePath: file.path,
        uploaderId: req.user.id
      });
    }));

    res.status(201).json({
      message: 'Files uploaded successfully',
      uploads
    });
  } catch (error) {
    // Clean up any uploaded files if the database operation fails
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    res.status(500).json({
      message: 'Error uploading files',
      error: error.message
    });
  }
};

export const getUploads = async (req, res) => {
  try {
    const uploads = await db.MangaUpload.findAll({
      where: req.user.role === 'admin' ? {} : { uploaderId: req.user.id },
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username']
      }],
      order: [['volume', 'ASC'], ['chapter', 'ASC'], ['fileOrder', 'ASC']]
    });

    res.json(uploads);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching uploads',
      error: error.message
    });
  }
};

export const reviewUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const upload = await db.MangaUpload.findByPk(id);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    upload.status = status;
    if (status === 'rejected') {
      upload.rejectionReason = rejectionReason;
    }

    await upload.save();

    res.json({
      message: 'Upload reviewed successfully',
      upload
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error reviewing upload',
      error: error.message
    });
  }
};
