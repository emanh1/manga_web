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
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only support .jpeg, .jpg, .png, .pdf files'));
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('file');

export const uploadMangaChapter = async (req, res) => {
  try {
    const { title, chapter } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const mangaUpload = await db.MangaUpload.create({
      title,
      chapter,
      filePath: file.path,
      uploaderId: req.user.id
    });

    res.status(201).json({
      message: 'Chapter uploaded successfully',
      upload: mangaUpload
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading chapter',
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
      }]
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
