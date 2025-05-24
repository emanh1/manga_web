import { Sequelize } from 'sequelize';
import UserModel from './user.model.js';
import MangaUploadModel from './mangaUpload.model.js';
import dbConfig from "../config/db.config.js";

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT
  }
);

const db = {
  sequelize,
  Sequelize,
  User: UserModel(sequelize),
  MangaUpload: MangaUploadModel(sequelize),
};

// Initialize associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
