import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import UserModel from './user.model.js';
import MangaUploadModel from './mangaUpload.model.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
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
