import db from '../models/index.js';
import { uploadFilesToIPFS } from '../utils/ipfsClient.ts';
import { retryOperation } from '../utils/retry.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class UploadService {
  static MAX_RETRIES = 3;
  static RETRY_DELAY = 1000;

  static async uploadToIpfs(files) {
    const fileErrors = [];
    const uploadedFiles = [];
    const cids = [];

    for (const file of files) {
      try {
        const cid = await retryOperation(
          async () => {
            const [fileCid] = await uploadFilesToIPFS([file]);
            return fileCid;
          },
          this.MAX_RETRIES,
          this.RETRY_DELAY
        );
        cids.push(cid);
        uploadedFiles.push(file);
      } catch (error) {
        fileErrors.push({ file: file.originalname, error: error.message });
      }
    }

    if (cids.length === 0) {
      throw new Error('All files failed to upload to IPFS');
    }

    return { cids, fileErrors, uploadedFiles };
  }

  static async createMangaUpload(uploadData, files, userId) {
    const { title, malId, volume, chapter, chapterTitle, language, isOneshot } = uploadData;

    const commonChapterId = uuidv4();

    const uploads = await Promise.all(files.cids.map((cid, index) => {
      const uploadDataObj = {
        title,
        malId: malId ? parseInt(malId) : null,
        volume: volume ? parseInt(volume) : null,
        chapter: chapter ? parseInt(chapter) : null,
        chapterTitle: chapterTitle || null,
        language,
        isOneshot: Boolean(isOneshot),
        fileOrder: index,
        filePath: cid,
        uploaderId: userId,
        chapterId: commonChapterId
      };
      return db.MangaUpload.create(uploadDataObj);
    }));

    return {
      chapterId: commonChapterId,
      uploads,
      fileErrors: files.fileErrors
    };
  }

  static async getChapterInfo(mangaId, chapterId) {
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
      throw new Error('Chapter not found');
    }

    return {
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
        filePath: `https://ipfs.io/ipfs/${page.filePath}`
      }))
    };
  }

  static async getChapterInfoPreview(mangaId, chapterId) {
    const pages = await db.MangaUpload.findAll({
      where: {
        chapterId,
        malId: mangaId,
        status: {
          [Op.in]: ['pending', 'rejected']
        }
      },
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username']
      }],
      order: [['fileOrder', 'ASC']]
    });

    if (!pages || pages.length === 0) {
      throw new Error('Chapter not found');
    }

    return {
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
        filePath: `https://ipfs.io/ipfs/${page.filePath}`
      }))
    };
  }

  static async getChapters(mangaId) {
    const chapters = await db.MangaUpload.findAll({
      where: {
        malId: mangaId,
        status: 'approved'
      },
      attributes: [
        'chapterId',
        'chapter',
        'volume',
        'chapterTitle',
        'language',
        'isOneshot',
        [db.Sequelize.fn('MIN', db.Sequelize.col('MangaUpload.createdAt')), 'uploadedAt']
      ],
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username']
      }],
      group: ['chapterId', 'chapter', 'volume', 'chapterTitle', 'language', 'isOneshot', 'uploader.uuid', 'uploader.username'],
      order: [
        ['volume', 'ASC'],
        ['chapter', 'ASC']
      ]
    });

  return chapters.map(chapter => ({
    chapterId: chapter.chapterId,
    chapterNumber: chapter.chapter,
    volume: chapter.volume,
    chapterTitle: chapter.chapterTitle,
    language: chapter.language,
    isOneshot: chapter.isOneshot,
    uploadedAt: chapter.get('uploadedAt'),
    uploader: chapter.uploader?.username
  }));
}

static async getAllPendingChapters() {
  const uploads = await db.MangaUpload.findAll({
    where: { status: 'pending' },
    include: [{ model: db.User, as: 'uploader', attributes: ['username'] }],
    order: [['chapterId', 'ASC'], ['fileOrder', 'ASC']]
  });
  // Group by chapterId
  const chapters = {};
  uploads.forEach(upload => {
    if (!chapters[upload.chapterId]) {
      chapters[upload.chapterId] = {
        chapterId: upload.chapterId,
        malId: upload.malId,
        title: upload.title,
        chapter: upload.chapter,
        volume: upload.volume,
        chapterTitle: upload.chapterTitle,
        language: upload.language,
        isOneshot: upload.isOneshot,
        status: upload.status,
        rejectionReason: upload.rejectionReason,
        uploader: upload.uploader,
        createdAt: upload.createdAt,
        pages: []
      };
    }
    chapters[upload.chapterId].pages.push({
      id: upload.id,
      fileOrder: upload.fileOrder,
      filePath: upload.filePath
    });
  });
  return Object.values(chapters);
}

static async getAllRejectedChapters() {
  const uploads = await db.MangaUpload.findAll({
    where: { status: 'rejected' },
    include: [{ model: db.User, as: 'uploader', attributes: ['username'] }],
    order: [['chapterId', 'ASC'], ['fileOrder', 'ASC']]
  });
  // Group by chapterId
  const chapters = {};
  uploads.forEach(upload => {
    if (!chapters[upload.chapterId]) {
      chapters[upload.chapterId] = {
        chapterId: upload.chapterId,
        malId: upload.malId,
        title: upload.title,
        chapter: upload.chapter,
        volume: upload.volume,
        chapterTitle: upload.chapterTitle,
        language: upload.language,
        isOneshot: upload.isOneshot,
        status: upload.status,
        rejectionReason: upload.rejectionReason,
        uploader: upload.uploader,
        createdAt: upload.createdAt,
        pages: []
      };
    }
    chapters[upload.chapterId].pages.push({
      id: upload.id,
      fileOrder: upload.fileOrder,
      filePath: upload.filePath
    });
  });
  return Object.values(chapters);
}

static async reviewChapter(id, status, rejectionReason = null) {
  const upload = await db.MangaUpload.findByPk(id);
  if (!upload) throw new Error('Upload not found');
  upload.status = status;
  upload.rejectionReason = status === 'rejected' ? rejectionReason : null;
  await upload.save();
  return upload;
}
}

export default UploadService;
