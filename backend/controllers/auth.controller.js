import AuthService from '../services/auth.service.js';
import AppError from '../utils/appError.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

async function sendResetEmail(to, link) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: ${link}`,
    html: `<p>You requested a password reset.</p><p><a href="${link}">Reset your password</a></p>`
  });
}

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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      return res.json({ message: 'If your email is registered, you will receive a password reset link.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 mins
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    // Send email with link
    try {
      await sendResetEmail(user.email, resetLink);
    } catch (err) {
      return next(new AppError('Failed to send reset email. Please try again later.', 500));
    }
    res.json({ message: 'If your email is registered, you will receive a password reset link.' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await AuthService.findUserByResetToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return next(new AppError('Invalid or expired reset token', 400));
    }
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
