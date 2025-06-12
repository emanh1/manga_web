import db from '../models/index.js';
import { Op } from 'sequelize';

class TitleService {

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

export default TitleService;