import AuthService from '../services/auth.service.js';
import AppError from '../utils/appError.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await AuthService.register(username, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login(username, password);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(new AppError(error.message, 401));
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json(AuthService.sanitizeUser(req.user));
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
