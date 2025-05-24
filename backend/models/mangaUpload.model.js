import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MangaUpload = sequelize.define('MangaUpload', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapter: {
      type: DataTypes.STRING,
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
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
