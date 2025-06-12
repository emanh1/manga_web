import db from '../models/index.js';
import { uploadFilesToIPFS } from '../utils/ipfsClient.ts';
import { retryOperation } from '../utils/retry.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/appError.js';

class UploadService {
  static MAX_RETRIES = 3;
  static RETRY_DELAY = 1000;

  static async uploadToIpfs(files, nodeUrl) {
    const fileErrors = [];
    const uploadedFiles = [];
    const cids = [];

    for (const file of files) {
      try {
        const cid = await retryOperation(
          async () => {
            const [fileCid] = await uploadFilesToIPFS([file], nodeUrl);
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
      throw new AppError('All files failed to upload to IPFS', 400);
    }

    return { cids, fileErrors, uploadedFiles };
  }

  static async createChapterWithPages(uploadData, files) {
    const {
      title,
      malId,
      volume,
      chapterNumber,
      chapterTitle: rawTitle,
      language,
      isOneshot,
      userId
    } = uploadData;

    const chapterTitle = (isOneshot === true || isOneshot === 'true') ? 'Oneshot' : rawTitle;
    const newChapter = await db.Chapter.create({
      title,
      malId: malId ? parseInt(malId) : null,
      volume: volume ? parseInt(volume) : null,
      chapterNumber: chapterNumber ? parseInt(chapterNumber) : null,
      chapterTitle: chapterTitle || null,
      language,
      isOneshot: Boolean(isOneshot),
      uploaderId: userId
    });

    const pages = await Promise.all(files.cids.map((cid, index) => {
      return db.ChapterPage.create({
        chapterId: newChapter.id,
        fileOrder: index,
        filePath: cid
      });
    }));

    return {
      chapterId: newChapter.id,
      chapter: newChapter,
      pages,
      fileErrors: files.fileErrors
    };
  }


  static _formatChapterResult(pages) {
    if (!pages || pages.length === 0) return null;
    return {
      id: pages[0].chapterId,
      title: pages[0].title,
      chapterNumber: pages[0].chapterNumber,
      volume: pages[0].volume,
      chapterTitle: pages[0].chapterTitle,
      language: pages[0].language,
      isOneshot: pages[0].isOneshot,
      uploader: pages[0].uploader,
      viewCount: pages[0].viewCount,
      pages: pages.map(page => ({
        id: page.id,
        fileOrder: page.fileOrder,
        filePath: page.filePath
      }))
    };
  }

  static async _getChapterByStatus(titleId, chapterId, statuses) {
    const chapter = await db.Chapter.findOne({
      where: {
        id: chapterId,
        malId: titleId,
        status: { [Op.in]: statuses }
      },
      include: [
        { model: db.User, as: 'uploader', attributes: ['username', 'uuid'] },
        { model: db.ChapterPage, as: 'pages', order: [['fileOrder', 'ASC']] }
      ]
    });

    if (!chapter) throw new AppError('Chapter not found', 404);

    // Increment view count
    // await chapter.increment('viewCount');

    return {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      volume: chapter.volume,
      chapterTitle: chapter.chapterTitle,
      language: chapter.language,
      isOneshot: chapter.isOneshot,
      uploader: chapter.uploader,
      viewCount: chapter.viewCount,
      pages: chapter.pages.map(page => ({
        id: page.id,
        fileOrder: page.fileOrder,
        filePath: page.filePath
      }))
    };
  }


  static async getChapterInfo(titleId, chapterId) {
    return this._getChapterByStatus(titleId, chapterId, ['approved']);
  }

  static async getChapterInfoPreview(titleId, chapterId) {
    return this._getChapterByStatus(titleId, chapterId, ['pending', 'rejected']);
  }

  static async findUploadsByChapter(titleId, chapterId) {
    const pages = await db.TitleUpload.findAll({
      where: { malId: titleId, chapterId },
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username', 'uuid']
      }],
      order: [['fileOrder', 'ASC']]
    });
    return this._formatChapterResult(pages);
  }

  static async getChapters(titleId) {
    const chapters = await db.Chapter.findAll({
      where: {
        malId: titleId,
        status: 'approved'
      },
      include: [
        { model: db.User, as: 'uploader', attributes: ['username', 'uuid'] }
      ],
      order: [['volume', 'ASC'], ['chapterNumber', 'ASC']]
    });

    return chapters.map(ch => ({
      chapterId: ch.id,
      chapterNumber: ch.chapterNumber,
      volume: ch.volume,
      chapterTitle: ch.chapterTitle,
      language: ch.language,
      isOneshot: ch.isOneshot,
      uploadedAt: ch.createdAt,
      uploader: ch.uploader ? { username: ch.uploader.username, uuid: ch.uploader.uuid } : null,
      viewCount: ch.viewCount
    }));
  }


  static async getAllChaptersByStatus(status) {
    const chapters = await db.Chapter.findAll({
      where: { status },
      include: [
        { model: db.User, as: 'uploader', attributes: ['username', 'uuid'] },
        { model: db.ChapterPage, as: 'pages', order: [['fileOrder', 'ASC']] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return chapters.map(ch => ({
      chapterId: ch.id,
      malId: ch.malId,
      title: ch.title,
      chapterNumber: ch.chapterNumber,
      volume: ch.volume,
      chapterTitle: ch.chapterTitle,
      language: ch.language,
      isOneshot: ch.isOneshot,
      status: ch.status,
      rejectionReason: ch.rejectionReason,
      uploader: ch.uploader,
      createdAt: ch.createdAt,
      pages: ch.pages.map(pg => ({
        id: pg.id,
        fileOrder: pg.fileOrder,
        filePath: pg.filePath
      }))
    }));
  }

  static getAllPendingChapters() {
    return this.getAllChaptersByStatus('pending');
  }

  static getAllRejectedChapters() {
    return this.getAllChaptersByStatus('rejected');
  }


  static async reviewChapter(chapterId, status, rejectionReason = null) {
    const chapter = await db.Chapter.findByPk(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404);
    chapter.status = status;
    chapter.rejectionReason = status === 'rejected' ? rejectionReason : null;
    await chapter.save();
    return chapter;
  }


}

export default UploadService;