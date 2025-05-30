import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MangaUpload = sequelize.define('MangaUpload', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chapterId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    malId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    volume: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapterTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isOneshot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fileOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploaderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'uuid',
      },
    },
  });

  MangaUpload.associate = (models) => {
    MangaUpload.belongsTo(models.User, {
      foreignKey: 'uploaderId',
      as: 'uploader',
    });
  };

  return MangaUpload;
};
