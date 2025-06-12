import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ChapterPage = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Chapters',
        key: 'id',
      },
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  ChapterPage.associate = (models) => {
    ChapterPage.belongsTo(models.Chapter, { foreignKey: 'chapterId', as: 'chapter' });
  };

  return ChapterPage;
};
