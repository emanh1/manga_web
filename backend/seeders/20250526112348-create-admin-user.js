'use strict';

import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const admin = await User.findOne({ where: { role: 'admin'}})
    if (!admin) {
      const admin_username = process.env.ADMIN_USERNAME;
      const admin_email = process.env.ADMIN_EMAIL;
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        username: admin_username,
        email: admin_email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  },

  async down (queryInterface, Sequelize) {
  }
};
