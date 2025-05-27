import { z } from 'zod';
import AppError from '../utils/appError.js';

const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors[0].message, 400);
    }
    throw error;
  }
};

const registerSchema = z.object({
  username: z.string()
    .trim()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30, { message: 'Username must be at most 30 characters' }),
  email: z.string()
    .trim()
    .email({ message: 'Please provide a valid email' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
});

const loginSchema = z.object({
  username: z.string()
    .trim()
    .min(1, { message: 'Username is required' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
});

const uploadSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: 'Title is required' }),
  language: z.string()
    .trim()
    .min(1, { message: 'Language is required' })
});

export const registerValidation = validateRequest(registerSchema);
export const loginValidation = validateRequest(loginSchema);
export const uploadValidation = validateRequest(uploadSchema);
