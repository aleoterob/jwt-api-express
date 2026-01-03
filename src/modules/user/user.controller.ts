import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../config/errors';

const userService = new UserService();

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        ERROR_MESSAGES.USER.MISSING_ID,
        400,
        ERROR_CODES.USER_MISSING_DATA
      );
    }

    const user = await userService.getUserById(id);

    if (!user) {
      throw new AppError(
        ERROR_MESSAGES.USER.NOT_FOUND,
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: user,
    });
  }
);

export const getUserByEmail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.params;

    if (!email) {
      throw new AppError(
        ERROR_MESSAGES.USER.MISSING_EMAIL,
        400,
        ERROR_CODES.USER_MISSING_DATA
      );
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new AppError(
        ERROR_MESSAGES.USER.NOT_FOUND,
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: user,
    });
  }
);

export const getStats = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const stats = await userService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  }
);

export const createUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const profileData = req.body as {
      id: string;
      email: string;
      [key: string]: unknown;
    };

    if (!profileData.id || !profileData.email) {
      throw new AppError(
        ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileData.id)) {
      throw new AppError(
        ERROR_MESSAGES.USER.INVALID_ID,
        400,
        ERROR_CODES.USER_INVALID_ID
      );
    }

    try {
      const user = await userService.createUser(profileData);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('foreign key') ||
          error.message.includes('violates foreign key') ||
          error.message.includes('debe existir primero en auth.users')
        ) {
          throw new AppError(
            ERROR_MESSAGES.VALIDATION.FOREIGN_KEY_VIOLATION,
            400,
            ERROR_CODES.VALIDATION_FOREIGN_KEY
          );
        }

        if (
          error.message.includes('duplicate key') ||
          error.message.includes('unique constraint') ||
          error.message.includes('ya existe')
        ) {
          throw new AppError(
            ERROR_MESSAGES.USER.ALREADY_EXISTS,
            409,
            ERROR_CODES.USER_ALREADY_EXISTS
          );
        }
      }
      throw new AppError(
        ERROR_MESSAGES.USER.CREATE_FAILED,
        500,
        ERROR_CODES.SERVER_INTERNAL_ERROR
      );
    }
  }
);

export const createUserWithProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, full_name, role, bio, avatar_url } = req.body as {
      email: string;
      password: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
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

    if (password.length < 6) {
      throw new AppError(
        ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD_LENGTH,
        400,
        ERROR_CODES.VALIDATION_INVALID_PASSWORD
      );
    }

    const userData: {
      email: string;
      password: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    } = {
      email,
      password,
    };

    if (full_name !== undefined) userData.full_name = full_name;
    if (role !== undefined) userData.role = role;
    if (bio !== undefined) userData.bio = bio;
    if (avatar_url !== undefined) userData.avatar_url = avatar_url;

    try {
      const result = await userService.createUserWithProfile(userData);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            created_at: result.user.created_at,
          },
          profile: result.profile,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('duplicate key') ||
          error.message.includes('unique constraint') ||
          error.message.includes('ya existe'))
      ) {
        throw new AppError(
          ERROR_MESSAGES.USER.ALREADY_EXISTS,
          409,
          ERROR_CODES.USER_ALREADY_EXISTS
        );
      }
      throw new AppError(
        ERROR_MESSAGES.USER.CREATE_FAILED,
        500,
        ERROR_CODES.SERVER_INTERNAL_ERROR
      );
    }
  }
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { email, password, full_name, role, bio, avatar_url } = req.body as {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    };

    if (!id) {
      throw new AppError(
        ERROR_MESSAGES.USER.MISSING_ID,
        400,
        ERROR_CODES.USER_MISSING_DATA
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new AppError(
        ERROR_MESSAGES.USER.INVALID_ID,
        400,
        ERROR_CODES.USER_INVALID_ID
      );
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError(
          ERROR_MESSAGES.AUTH.INVALID_EMAIL,
          400,
          ERROR_CODES.AUTH_INVALID_EMAIL
        );
      }
    }

    if (password !== undefined && password.length < 6) {
      throw new AppError(
        ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD_LENGTH,
        400,
        ERROR_CODES.VALIDATION_INVALID_PASSWORD
      );
    }

    const updateData: {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    } = {};

    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    try {
      const result = await userService.updateUserWithProfile(id, updateData);

      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            updated_at: result.user.updated_at,
          },
          profile: result.profile,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('no encontrado')) {
          throw new AppError(
            ERROR_MESSAGES.USER.NOT_FOUND,
            404,
            ERROR_CODES.USER_NOT_FOUND
          );
        }

        if (
          error.message.includes('duplicate key') ||
          error.message.includes('unique constraint')
        ) {
          throw new AppError(
            ERROR_MESSAGES.VALIDATION.EMAIL_ALREADY_IN_USE,
            409,
            ERROR_CODES.VALIDATION_EMAIL_IN_USE
          );
        }
      }
      throw new AppError(
        ERROR_MESSAGES.USER.UPDATE_FAILED,
        500,
        ERROR_CODES.SERVER_INTERNAL_ERROR
      );
    }
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        ERROR_MESSAGES.USER.MISSING_ID,
        400,
        ERROR_CODES.USER_MISSING_DATA
      );
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      throw new AppError(
        ERROR_MESSAGES.USER.NOT_FOUND,
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    res.status(204).send();
  }
);
