import fs from 'fs';
import db from '../models/index.js';
import dotenv from 'dotenv';
import { uploadFilesToIPFS } from '../utils/ipfsClient.ts';

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryOperation = async (operation, retries = 0) => {
  try {
    return await operation();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
      return retryOperation(operation, retries + 1);
    }
    throw error;
  }
};

export const uploadMangaChapter = async (req, res) => {
  const uploadedFiles = [];
  try {
    const { title, volume, chapter, chapterTitle, language, isOneshot, malId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (!language) {
      return res.status(400).json({ message: 'Language is required' });
    }

    // Upload files to IPFS with retry mechanism
    const fileErrors = [];
    const cids = [];
    
    for (const file of files) {
      try {
        const cid = await retryOperation(async () => {
          const [fileCid] = await uploadFilesToIPFS([file]);
          return fileCid;
        });
        cids.push(cid);
        uploadedFiles.push(file);
      } catch (error) {
        fileErrors.push({ file: file.originalname, error: error.message });
      }
    }

    if (cids.length === 0) {
      throw new Error('All files failed to upload to IPFS');
    }

    const commonChapterId = await db.sequelize.query('SELECT uuid_generate_v4() as uuid',
      { type: db.Sequelize.QueryTypes.SELECT }
    ).then(results => results[0].uuid);

    const uploads = await Promise.all(cids.map((cid, index) => {
      return db.MangaUpload.create({
        title,
        malId: malId ? parseInt(malId) : null,
        volume: volume ? parseInt(volume) : null,
        chapter: chapter ? parseInt(chapter) : null,
        chapterTitle: chapterTitle || null,
        language,
        isOneshot: isOneshot === 'true',
        chapterId: commonChapterId,  // Use the same chapterId for all files
        fileOrder: index,
        filePath: cid,
        uploaderId: req.user.id
      });
    }));

    // Clean up local files
    uploadedFiles.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Failed to delete local file:', file.path, err);
      });
    });

    const response = {
      message: fileErrors.length > 0 ? 'Upload completed with some errors' : 'Files uploaded successfully',
      uploads: {
        chapterId: commonChapterId,
        title,
        chapter,
        volume,
        chapterTitle,
        pageCount: uploads.length,
        status: 'pending'
      }
    };

    if (fileErrors.length > 0) {
      response.errors = fileErrors;
    }

    res.status(201).json(response);
  } catch (error) {
    // Clean up local files if error
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
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
    const { malId } = req.query;
    const where = {};

    if (malId) {
      where.malId = malId;
      where.status = 'approved';
    } else if (req.user) {
      // Only filter by uploader if user is authenticated and not admin
      if (req.user.role !== 'admin') {
        where.uploaderId = req.user.id;
      }
    } else {
      // For unauthenticated users, only show approved uploads
      where.status = 'approved';
    }

    const uploads = await db.MangaUpload.findAll({
      where,
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username']
      }],
      order: [['volume', 'ASC'], ['chapter', 'ASC'], ['fileOrder', 'ASC']]
    });

    // Group uploads by chapter
    const chaptersMap = new Map();

    uploads.forEach(upload => {
      if (!chaptersMap.has(upload.chapterId)) {
        // Create a new chapter entry
        chaptersMap.set(upload.chapterId, {
          id: upload.chapterId,
          title: upload.title,
          malId: upload.malId,
          volume: upload.volume,
          chapter: upload.chapter,
          chapterTitle: upload.chapterTitle,
          language: upload.language,
          isOneshot: upload.isOneshot,
          status: upload.status,
          uploader: upload.uploader,
          createdAt: upload.createdAt,
          pageCount: 0,
          pages: []
        });
      }

      const chapter = chaptersMap.get(upload.chapterId);
      chapter.pageCount++;
      chapter.pages.push({
        order: upload.fileOrder,
        path: `https://ipfs.io/ipfs/${upload.filePath}` //TODO add more gateways dynamically
      });
    });

    // Sort pages within each chapter by fileOrder
    for (const chapter of chaptersMap.values()) {
      chapter.pages.sort((a, b) => a.order - b.order);
    }

    res.json(Array.from(chaptersMap.values()));
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

    const uploads = await db.MangaUpload.findAll({
      where: {
        chapterId: id
      }
    });

    if (!uploads || uploads.length === 0) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Update all pages in the chapter
    await Promise.all(uploads.map(upload => {
      upload.status = status;
      if (status === 'rejected') {
        upload.rejectionReason = rejectionReason;
      }
      return upload.save();
    }));

    res.json({
      message: 'Chapter reviewed successfully',
      chapterId: id,
      status: status
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error reviewing upload',
      error: error.message
    });
  }
};

export const getChapter = async (req, res) => {
  try {
    const { mangaId, chapterId } = req.params;

    const pages = await db.MangaUpload.findAll({
      where: {
        chapterId,
        malId: mangaId,
        status: 'approved'
      },
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username']
      }],
      order: [['fileOrder', 'ASC']]
    });

    if (!pages || pages.length === 0) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const chapterInfo = {
      id: pages[0].chapterId,
      title: pages[0].title,
      chapter: pages[0].chapter,
      volume: pages[0].volume,
      chapterTitle: pages[0].chapterTitle,
      language: pages[0].language,
      isOneshot: pages[0].isOneshot,
      uploader: pages[0].uploader,
      pages: pages.map(page => ({
        id: page.id,
        fileOrder: page.fileOrder,
        filePath: `https://ipfs.io/ipfs/${page.filePath}` //TODO: implement other gateways
      }))
    };

    res.json(chapterInfo);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching chapter',
      error: error.message
    });
  }
};

export const getChapterPages = async (req, res) => {
  try {
    const { mangaId, chapterId } = req.params;

    const pages = await db.MangaUpload.findAll({
      where: {
        id: chapterId,
        malId: mangaId,
        status: 'approved'
      },
      order: [['fileOrder', 'ASC']],
      attributes: ['filePath']
    });

    if (!pages || pages.length === 0) {
      return res.status(404).json({ message: 'Chapter pages not found' });
    }

    res.json(pages.map(page => page.filePath));
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching chapter pages',
      error: error.message
    });
  }
};
