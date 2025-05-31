import db from '../models/index.js';
import AppError from '../utils/appError.js';

export const getProfile = async (req, res, next) => {
  try {
    let user;
    if (req.params.uuid) {
      user = await db.User.findOne({ where: { uuid: req.params.uuid } });
    } else {
      user = await db.User.findByPk(req.user.uuid);
    }
    if (!user) return next(new AppError('User not found', 404));
    res.json({
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatarUrl, username } = req.body;
    const user = await db.User.findByPk(req.user.uuid);
    if (!user) return next(new AppError('User not found', 404));
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (username !== undefined) user.username = username;
    await user.save();
    res.json({
      message: 'Profile updated',
      user: {
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.User.findByPk(req.user.uuid);
    if (!user) return next(new AppError('User not found', 404));
    const valid = await user.validatePassword(currentPassword);
    if (!valid) return next(new AppError('Current password is incorrect', 400));
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getUserUploads = async (req, res, next) => {
  try {
    let userId;
    if (req.params.uuid) {
      const user = await db.User.findOne({ where: { uuid: req.params.uuid } });
      if (!user) return next(new AppError('User not found', 404));
      userId = user.uuid;
    } else {
      userId = req.user.uuid;
    }
    const uploads = await db.MangaUpload.findAll({
      where: { uploaderId: userId },
      order: [['malId', 'ASC'], ['volume', 'ASC'], ['chapterNumber', 'ASC']],
    });
    const grouped = {};
    for (const upload of uploads) {
      if (!grouped[upload.malId]) {
        grouped[upload.malId] = {
          malId: upload.malId,
          title: upload.title,
          chapters: []
        };
      }
      grouped[upload.malId].chapters.push({
        chapterId: upload.chapterId,
        chapterNumber: upload.chapterNumber,
        volume: upload.volume,
        chapterTitle: upload.chapterTitle,
        language: upload.language,
        isOneshot: upload.isOneshot,
        uploadedAt: upload.createdAt
      });
    }
    res.json({ uploads: Object.values(grouped) });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
