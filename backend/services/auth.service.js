import jwt from 'jsonwebtoken';
import db from '../models/index.js';

class AuthService {
  static async register(username, email, password) {
    const existingUser = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const user = await db.User.create({
      username,
      email,
      password
    });

    const token = this.generateToken(user.uuid);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  static async login(username, password) {
    const user = await db.User.findOne({
      where: { username }
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new Error('Invalid username or password');
    }

    const token = this.generateToken(user.uuid);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  static generateToken(userId) {
    return jwt.sign({ uuid: userId }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
  }

  static sanitizeUser(user) {
    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl
    };
  }
}

export default AuthService;
