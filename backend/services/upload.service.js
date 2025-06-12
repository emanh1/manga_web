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

  static async createTitleUpload(uploadData, files, userId) {
    let { title, malId, volume, chapterNumber, chapterTitle, language, isOneshot } = uploadData;

    if (isOneshot === true || isOneshot === 'true') {
      chapterTitle = 'Oneshot';
    }

    const commonChapterId = uuidv4();

    const uploads = await Promise.all(files.cids.map((cid, index) => {
      const uploadDataObj = {
        title,
        malId: malId ? parseInt(malId) : null,
        volume: volume ? parseInt(volume) : null,
        chapterNumber: chapterNumber ? parseInt(chapterNumber) : null,
        chapterTitle: chapterTitle || null,
        language,
        isOneshot: Boolean(isOneshot),
        fileOrder: index,
        filePath: cid,
        uploaderId: userId,
        chapterId: commonChapterId
      };
      return db.TitleUpload.create(uploadDataObj);
    }));

    return {
      chapterId: commonChapterId,
      uploads,
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
    const whereStatus = { [Op.in]: statuses };
    await db.TitleUpload.increment('viewCount', {
      by: 1,
      where: { chapterId, malId: titleId }
    });
    const pages = await db.TitleUpload.findAll({
      where: {
        chapterId,
        malId: titleId,
        status: whereStatus
      },
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username', 'uuid']
      }],
      order: [['fileOrder', 'ASC']]
    });
    if (!pages || pages.length === 0) {
      throw new AppError('Chapter not found');
    }
    return this._formatChapterResult(pages);
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
    const chapters = await db.TitleUpload.findAll({
      where: {
        malId: titleId,
        status: 'approved'
      },
      attributes: [
        'chapterId',
        'chapterNumber',
        'volume',
        'chapterTitle',
        'language',
        'isOneshot',
        'viewCount',
        [db.Sequelize.fn('MIN', db.Sequelize.col('TitleUpload.createdAt')), 'uploadedAt']
      ],
      include: [{
        model: db.User,
        as: 'uploader',
        attributes: ['username', 'uuid']
      }],
      group: ['chapterId', 'chapterNumber', 'volume', 'chapterTitle', 'language', 'isOneshot', 'uploader.uuid', 'uploader.username', 'viewCount'],
      order: [
        ['volume', 'ASC'],
        ['chapterNumber', 'ASC']
      ]
    });

  return chapters.map(chapter => ({
    chapterId: chapter.chapterId,
    chapterNumber: chapter.chapterNumber,
    volume: chapter.volume,
    chapterTitle: chapter.chapterTitle,
    language: chapter.language,
    isOneshot: chapter.isOneshot,
    uploadedAt: chapter.get('uploadedAt'),
    uploader: chapter.uploader ? { username: chapter.uploader.username, uuid: chapter.uploader.uuid } : null,
    viewCount: chapter.viewCount
  }));
}

  static _groupUploadsByChapter(uploads) {
    const chapters = {};
    uploads.forEach(upload => {
      if (!chapters[upload.chapterId]) {
        chapters[upload.chapterId] = {
          chapterId: upload.chapterId,
          malId: upload.malId,
          title: upload.title,
          chapterNumber: upload.chapterNumber,
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

  static async getAllPendingChapters() {
    const uploads = await db.TitleUpload.findAll({
      where: { status: 'pending' },
      include: [{ model: db.User, as: 'uploader', attributes: ['username', 'uuid'] }],
      order: [['chapterId', 'ASC'], ['fileOrder', 'ASC']]
    });
    return this._groupUploadsByChapter(uploads);
  }

  static async getAllRejectedChapters() {
    const uploads = await db.TitleUpload.findAll({
      where: { status: 'rejected' },
      include: [{ model: db.User, as: 'uploader', attributes: ['username', 'uuid'] }],
      order: [['chapterId', 'ASC'], ['fileOrder', 'ASC']]
    });
    return this._groupUploadsByChapter(uploads);
  }

  static async reviewChapter(id, status, rejectionReason = null) {
    const upload = await db.TitleUpload.findByPk(id);
    if (!upload) throw new AppError('Upload not found', 404);
    upload.status = status;
    upload.rejectionReason = status === 'rejected' ? rejectionReason : null;
    await upload.save();
    return upload;
  }

}

export default UploadService;