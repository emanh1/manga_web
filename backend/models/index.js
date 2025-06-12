import { Sequelize } from 'sequelize';
import UserModel from './user.model.js';
import chapterModel from './chapter.model.js';
import chapterPageModel from './chapter.page.model.js';
import dbConfig from "../config/config.js";
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port
  }
);

const db = {
  sequelize,
  Sequelize,
  User: UserModel(sequelize),
  Chapter: chapterModel(sequelize),
  ChapterPage: chapterPageModel(sequelize),
};

// Initialize associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
