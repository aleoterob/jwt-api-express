import { Request, Response } from 'express';
import { UserService } from '../../src/modules/user/user.service';
import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES } from '../../src/config/errors';

const mockUserService = {
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  getStats: jest.fn(),
  createUser: jest.fn(),
  createUserWithProfile: jest.fn(),
  updateUser: jest.fn(),
  updateUserWithProfile: jest.fn(),
  deleteUser: jest.fn(),
} as unknown as jest.Mocked<UserService>;

jest.mock('../../src/modules/user/user.service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => mockUserService),
  };
});

import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getStats,
  createUser,
  createUserWithProfile,
  updateUser,
  deleteUser,
} from '../../src/modules/user/user.controller';

describe('user.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];

      mockUserService.getAllUsers.mockResolvedValue(mockUsers as never);

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      mockRequest.params = { id: '1' };
      mockUserService.getUserById.mockResolvedValue(mockUser as never);

      await getUserById(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should throw error when ID is missing', async () => {
      mockRequest.params = {};

      await expect(
        getUserById(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(AppError);

      await expect(
        getUserById(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.MISSING_ID);
    });

    it('should throw error when the user does not exist', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockUserService.getUserById.mockResolvedValue(null);

      await expect(
        getUserById(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(AppError);

      await expect(
        getUserById(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.NOT_FOUND);
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      mockRequest.params = { email: 'test@example.com' };
      mockUserService.getUserByEmail.mockResolvedValue(mockUser as never);

      await getUserByEmail(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should throw error when email is missing', async () => {
      mockRequest.params = {};

      await expect(
        getUserByEmail(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(AppError);

      await expect(
        getUserByEmail(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(ERROR_MESSAGES.USER.MISSING_EMAIL);
    });

    it('should throw error when the user does not exist', async () => {
      mockRequest.params = { email: 'non-existent@example.com' };
      mockUserService.getUserByEmail.mockResolvedValue(null);

      await expect(
        getUserByEmail(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(AppError);

      await expect(
        getUserByEmail(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(ERROR_MESSAGES.USER.NOT_FOUND);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const mockStats = { total: 10, active: 8 };

      mockUserService.getStats.mockResolvedValue(mockStats);

      await getStats(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      mockRequest.body = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      mockUserService.createUser.mockResolvedValue(mockUser as never);

      await createUser(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should throw error when required fields are missing', async () => {
      mockRequest.body = {};

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(AppError);

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS);
    });

    it('should throw error when ID is not a valid UUID', async () => {
      mockRequest.body = {
        id: 'invalid-id',
        email: 'test@example.com',
      };

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(AppError);

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.INVALID_ID);
    });

    it('should handle foreign key error', async () => {
      mockRequest.body = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const error = new Error('violates foreign key constraint');
      mockUserService.createUser.mockRejectedValue(error);

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.VALIDATION.FOREIGN_KEY_VIOLATION);
    });

    it('should handle user already exists error', async () => {
      mockRequest.body = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const error = new Error('duplicate key value violates unique constraint');
      mockUserService.createUser.mockRejectedValue(error);

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.ALREADY_EXISTS);
    });

    it('should handle generic creation error', async () => {
      mockRequest.body = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const error = new Error('Database error');
      mockUserService.createUser.mockRejectedValue(error);

      await expect(
        createUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.CREATE_FAILED);
    });
  });

  describe('createUserWithProfile', () => {
    it('should create a user with profile successfully', async () => {
      const mockResult = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
          created_at: new Date(),
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
        },
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      mockUserService.createUserWithProfile.mockResolvedValue({
        user: {
          ...mockResult.user,
          email: mockResult.user.email,
          created_at: mockResult.user.created_at,
          updated_at: new Date(),
          instance_id: null,
          aud: null,
          role: mockResult.user.role,
          encrypted_password: null,
          confirmation_token: null,
          confirmation_sent_at: null,
          recovery_token: null,
          recovery_sent_at: null,
          email_change_token_new: null,
          email_change: null,
          email_change_sent_at: null,
          last_sign_in_at: null,
          raw_app_meta_data: {},
          raw_user_meta_data: {},
          is_super_admin: false,
          phone: null,
          phone_confirmed_at: null,
          phone_change: null,
          phone_change_token: null,
          phone_change_sent_at: null,
          email_confirmed_at: null,
          invited_at: null,
          email_change_confirm_status: 0,
          banned_until: null,
          reauthentication_token: null,
          reauthentication_sent_at: null,
          is_sso_user: false,
          deleted_at: null,
          confirmed_at: null,
          email_change_token_current: null,
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          bio: null,
          avatar_url: null,
          status: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await createUserWithProfile(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      const mockJson = mockResponse.json as jest.Mock;
      const jsonCall = (mockJson.mock.calls[0] as [unknown])[0] as {
        success: boolean;
        data: {
          user: { id: string; email: string; role: string; created_at: Date };
          profile: {
            id: string;
            email: string;
            full_name: string;
            bio: null;
            avatar_url: null;
            status: null;
            created_at: Date;
            updated_at: Date;
          };
        };
      };
      expect(jsonCall).toMatchObject({
        success: true,
        data: {
          user: {
            id: mockResult.user.id,
            email: mockResult.user.email,
            role: mockResult.user.role,
            created_at: mockResult.user.created_at,
          },
          profile: {
            id: 'user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            bio: null,
            avatar_url: null,
            status: null,
          },
        },
      });
      expect(jsonCall.data.profile.created_at).toBeInstanceOf(Date);
      expect(jsonCall.data.profile.updated_at).toBeInstanceOf(Date);
    });

    it('should throw error when email or password are missing', async () => {
      mockRequest.body = {};

      await expect(
        createUserWithProfile(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(ERROR_MESSAGES.AUTH.MISSING_EMAIL_PASSWORD);
    });

    it('should throw error when the email is invalid', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(
        createUserWithProfile(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
    });

    it('should throw error when the password is too short', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: '12345',
      };

      await expect(
        createUserWithProfile(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD_LENGTH);
    });

    it('should handle user already exists error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('duplicate key value violates unique constraint');
      mockUserService.createUserWithProfile.mockRejectedValue(error);

      await expect(
        createUserWithProfile(
          mockRequest as Request,
          mockResponse as Response,
          jest.fn()
        )
      ).rejects.toThrow(ERROR_MESSAGES.USER.ALREADY_EXISTS);
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const mockResult = {
        user: {
          id: 'user-id',
          email: 'updated@example.com',
          role: 'user',
          created_at: new Date(),
          updated_at: new Date(),
          instance_id: null,
          aud: null,
          encrypted_password: null,
          confirmation_token: null,
          confirmation_sent_at: null,
          recovery_token: null,
          recovery_sent_at: null,
          email_change_token_new: null,
          email_change: null,
          email_change_sent_at: null,
          last_sign_in_at: null,
          raw_app_meta_data: {},
          raw_user_meta_data: {},
          is_super_admin: false,
          phone: null,
          phone_confirmed_at: null,
          phone_change: null,
          phone_change_token: null,
          phone_change_sent_at: null,
          email_confirmed_at: null,
          invited_at: null,
          email_change_confirm_status: 0,
          banned_until: null,
          reauthentication_token: null,
          reauthentication_sent_at: null,
          is_sso_user: false,
          deleted_at: null,
          confirmed_at: null,
          email_change_token_current: null,
        },
        profile: {
          id: 'user-id',
          email: 'updated@example.com',
          full_name: 'Updated User',
          bio: null,
          avatar_url: null,
          status: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = {
        email: 'updated@example.com',
        full_name: 'Updated User',
      };

      mockUserService.updateUserWithProfile.mockResolvedValue(mockResult);

      await updateUser(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: mockResult.user.id,
            email: mockResult.user.email,
            role: mockResult.user.role,
            updated_at: mockResult.user.updated_at,
          },
          profile: mockResult.profile,
        },
      });
    });

    it('should throw error when ID is missing', async () => {
      mockRequest.params = {};

      await expect(
        updateUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.MISSING_ID);
    });

    it('should throw error when ID is not a valid UUID', async () => {
      mockRequest.params = { id: 'invalid-id' };

      await expect(
        updateUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.INVALID_ID);
    });

    it('should throw error when the email is invalid', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = { email: 'invalid-email' };

      await expect(
        updateUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
    });

    it('should throw error when the password is too short', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = { password: '12345' };

      await expect(
        updateUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD_LENGTH);
    });

    it('should handle user not found error', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = { email: 'updated@example.com' };

      const error = new Error('Usuario no encontrado');
      mockUserService.updateUserWithProfile.mockRejectedValue(error);

      await expect(
        updateUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.NOT_FOUND);
    });

    it('should handle email already in use error', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = { email: 'existing@example.com' };

      const error = new Error('duplicate key value violates unique constraint');
      mockUserService.updateUserWithProfile.mockRejectedValue(error);

      await expect(
        updateUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.VALIDATION.EMAIL_ALREADY_IN_USE);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockUserService.deleteUser.mockResolvedValue(true);

      await deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should throw error when ID is missing', async () => {
      mockRequest.params = {};

      await expect(
        deleteUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.MISSING_ID);
    });

    it('should throw error when the user does not exist', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockUserService.deleteUser.mockResolvedValue(false);

      await expect(
        deleteUser(mockRequest as Request, mockResponse as Response, jest.fn())
      ).rejects.toThrow(ERROR_MESSAGES.USER.NOT_FOUND);
    });
  });
});
