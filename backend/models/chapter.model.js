import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Chapter = sequelize.define('Chapter', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    chapterNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isOneshot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Chapter.associate = (models) => {
    Chapter.belongsTo(models.User, { foreignKey: 'uploaderId', as: 'uploader' });
    Chapter.hasMany(models.ChapterPage, { foreignKey: 'chapterId', as: 'pages' });
  };

  return Chapter;
};
