'use strict';

const bcrypt = require('bcrypt');
const db = require('../models/index.js');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [admins] = await queryInterface.sequelize.query(
      "SELECT * FROM \"Users\" WHERE role='admin' LIMIT 1"
    );
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await queryInterface.bulkInsert('Users', [{
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  async down (queryInterface, Sequelize) {
  }
};