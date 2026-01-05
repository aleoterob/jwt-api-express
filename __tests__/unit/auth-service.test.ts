import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../src/config/errors';
import { getUserById } from '../../src/db/queries/user.queries';
import { getProfileById } from '../../src/db/queries/profile.queries';
import { generateToken } from '../../src/utils/jwt';
import { generateRefreshToken } from '../../src/db/queries/refresh-token.queries';
import { getRefreshTokenExpirationDate } from '../../src/utils/auth';

jest.mock('../../src/modules/auth/auth.repository');
jest.mock('../../src/utils/jwt');
jest.mock('../../src/db/queries/refresh-token.queries');
jest.mock('../../src/utils/auth');
jest.mock('../../src/db/queries/user.queries');
jest.mock('../../src/db/queries/profile.queries');

describe('AuthService', () => {
  let authService: AuthService;
  let mockRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    mockRepository = {
      login: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshTokenByToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    authService = new AuthService(mockRepository);
  });

  describe('login', () => {
    it('should fail with invalid credentials', async () => {
      mockRepository.login.mockRejectedValue(
        new AppError(
          ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
          401,
          ERROR_CODES.AUTH_INVALID_CREDENTIALS
        )
      );

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(AppError);

      expect(mockRepository.login).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword'
      );
    });
  });

  describe('refreshTokens', () => {
    it('should fail with refresh token not found', async () => {
      mockRepository.findRefreshTokenByToken.mockResolvedValue(undefined);

      await expect(authService.refreshTokens('invalid-token')).rejects.toThrow(
        AppError
      );

      expect(mockRepository.findRefreshTokenByToken).toHaveBeenCalledWith(
        'invalid-token'
      );
    });

    it('should fail with revoked refresh token', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        revokedAt: new Date(),
      };

      mockRepository.findRefreshTokenByToken.mockResolvedValue(
        mockToken as never
      );

      await expect(authService.refreshTokens('revoked-token')).rejects.toThrow(
        AppError
      );

      expect(mockRepository.revokeAllUserTokens).toHaveBeenCalledWith(
        'user-id'
      );
    });

    it('should fail with expired refresh token', async () => {
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 1);

      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: expiredDate,
      };

      mockRepository.findRefreshTokenByToken.mockResolvedValue(
        mockToken as never
      );

      await expect(authService.refreshTokens('expired-token')).rejects.toThrow(
        AppError
      );
    });

    it('should fail when the user does not exist', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 60);

      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: futureDate,
      };

      const mockGetUserById = jest.mocked(getUserById);

      mockRepository.findRefreshTokenByToken.mockResolvedValue(
        mockToken as never
      );
      mockGetUserById.mockResolvedValue(null);

      await expect(authService.refreshTokens('valid-token')).rejects.toThrow(
        AppError
      );
    });

    it('should fail when the profile does not exist', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 60);

      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: futureDate,
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };

      const mockGetUserById = jest.mocked(getUserById);
      const mockGetProfileById = jest.mocked(getProfileById);

      mockRepository.findRefreshTokenByToken.mockResolvedValue(
        mockToken as never
      );
      mockGetUserById.mockResolvedValue(mockUser as never);
      mockGetProfileById.mockResolvedValue(null);

      await expect(authService.refreshTokens('valid-token')).rejects.toThrow(
        AppError
      );
    });

    it('should refresh tokens successfully', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 60);

      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: futureDate,
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      const newToken = {
        id: 'new-token-id',
        userId: 'user-id',
      };

      const mockGetUserById = jest.mocked(getUserById);
      const mockGetProfileById = jest.mocked(getProfileById);
      const mockGenerateToken = jest.mocked(generateToken);
      const mockGenerateRefreshToken = jest.mocked(generateRefreshToken);
      const mockGetRefreshTokenExpirationDate = jest.mocked(
        getRefreshTokenExpirationDate
      );

      mockRepository.findRefreshTokenByToken.mockResolvedValue(
        mockToken as never
      );
      mockGetUserById.mockResolvedValue(mockUser as never);
      mockGetProfileById.mockResolvedValue(mockProfile as never);
      mockGenerateToken.mockReturnValue('new-access-token');
      mockGenerateRefreshToken.mockReturnValue('new-refresh-token');
      mockGetRefreshTokenExpirationDate.mockReturnValue(new Date());
      mockRepository.createRefreshToken.mockResolvedValue(newToken as never);
      mockRepository.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await authService.refreshTokens('valid-token');

      expect(result).toHaveProperty('user', mockUser);
      expect(result).toHaveProperty('profile', mockProfile);
      expect(result).toHaveProperty('access_token', 'new-access-token');
      expect(result).toHaveProperty('refresh_token', 'new-refresh-token');
      expect(mockRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'token-id',
        'new-token-id'
      );
    });
  });

  describe('logout', () => {
    it('should revoke the token if it exists', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        revokedAt: null,
      };

      mockRepository.findRefreshTokenByToken.mockResolvedValue(
        mockToken as never
      );
      mockRepository.revokeRefreshToken.mockResolvedValue(undefined);

      await authService.logout('refresh-token');

      expect(mockRepository.findRefreshTokenByToken).toHaveBeenCalledWith(
        'refresh-token'
      );
      expect(mockRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'token-id'
      );
    });

    it('should not do anything if the token does not exist', async () => {
      mockRepository.findRefreshTokenByToken.mockResolvedValue(undefined);

      await authService.logout('non-existent-token');

      expect(mockRepository.findRefreshTokenByToken).toHaveBeenCalledWith(
        'non-existent-token'
      );
      expect(mockRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });
});
