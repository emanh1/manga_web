import db from '../models/index.js';
import { uploadFilesToIPFS } from '../utils/ipfsClient.ts';

class UploadService {
  static MAX_RETRIES = 3;
  static RETRY_DELAY = 1000;

  static async uploadToIpfs(files) {
    const fileErrors = [];
    const uploadedFiles = [];
    const cids = [];

    for (const file of files) {
      try {
        const cid = await this.retryOperation(async () => {
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

    return { cids, fileErrors, uploadedFiles };
  }

  static async createMangaUpload(uploadData, files, userId) {
    const { title, malId, volume, chapter, chapterTitle, language, isOneshot } = uploadData;

    const commonChapterId = await db.sequelize.query('SELECT uuid_generate_v4() as uuid',
      { type: db.Sequelize.QueryTypes.SELECT }
    ).then(results => results[0].uuid);

    const uploads = await Promise.all(files.cids.map((cid, index) => {
      return db.MangaUpload.create({
        title,
        malId: malId ? parseInt(malId) : null,
        volume: volume ? parseInt(volume) : null,
        chapter: chapter ? parseInt(chapter) : null,
        chapterTitle: chapterTitle || null,
        language,
        isOneshot: isOneshot === 'true',
        chapterId: commonChapterId,
        fileOrder: index,
        filePath: cid,
        uploaderId: userId
      });
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

  static async retryOperation(operation, retries = 0) {
    try {
      return await operation();
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retries + 1)));
        return this.retryOperation(operation, retries + 1);
      }
      throw error;
    }
  }
}

export default UploadService;
