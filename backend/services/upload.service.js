import db from '../models/index.js';
import { uploadFilesToIPFS } from '../utils/ipfsClient.ts';
import { retryOperation } from '../utils/retry.js';
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
}

export default UploadService;