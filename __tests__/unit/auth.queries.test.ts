import { login } from '../../src/db/queries/auth.queries';
import { getUserByEmail } from '../../src/db/queries/user.queries';
import { getProfileById } from '../../src/db/queries/profile.queries';
import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES } from '../../src/config/errors';
import bcrypt from 'bcrypt';

jest.mock('../../src/db/queries/user.queries');
jest.mock('../../src/db/queries/profile.queries');
jest.mock('bcrypt');

describe('auth.queries', () => {
  const mockGetUserByEmail = getUserByEmail as jest.MockedFunction<
    typeof getUserByEmail
  >;
  const mockGetProfileById = getProfileById as jest.MockedFunction<
    typeof getProfileById
  >;
  const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw error when the user does not exist', async () => {
      mockGetUserByEmail.mockResolvedValue(null);

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        AppError
      );

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
      );
    });

    it('should throw error when the user does not have encrypted password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: null,
      } as never;

      mockGetUserByEmail.mockResolvedValue(mockUser);

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        AppError
      );

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
      );
    });

    it('should throw error when the password is invalid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
      } as never;

      mockGetUserByEmail.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(false as never);

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow(
        AppError
      );

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow(
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
      );
    });

    it('should throw error when the profile does not exist', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
      } as never;

      mockGetUserByEmail.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true as never);
      mockGetProfileById.mockResolvedValue(null);

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        AppError
      );

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        ERROR_MESSAGES.AUTH.PROFILE_NOT_FOUND
      );
    });

    it('should return user and profile when credentials are valid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
      } as never;

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
      } as never;

      mockGetUserByEmail.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true as never);
      mockGetProfileById.mockResolvedValue(mockProfile);

      const result = await login('test@example.com', 'password');

      expect(result).toEqual({
        user: mockUser,
        profile: mockProfile,
      });
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        'password',
        'hashed-password'
      );
    });
  });
});
