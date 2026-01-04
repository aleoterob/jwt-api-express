import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { getCookieMaxAge } from '../../utils/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../config/errors';

const authService = new AuthService();

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.MISSING_EMAIL_PASSWORD,
        400,
        ERROR_CODES.AUTH_MISSING_CREDENTIALS
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.INVALID_EMAIL,
        400,
        ERROR_CODES.AUTH_INVALID_EMAIL
      );
    }

    const result = await authService.login(email, password);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: getCookieMaxAge(),
    });

    res.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        profile: result.profile,
      },
    });
  }
);
