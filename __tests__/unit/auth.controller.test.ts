import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, ERROR_CODES } from '../../src/config/errors';

const mockAuthService = {
  login: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../../src/modules/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => mockAuthService),
  };
});

import { login, refresh, logout } from '../../src/modules/auth/auth.controller';

jest.mock('../../src/utils/auth', () => ({
  getCookieMaxAge: jest.fn(() => 3600000),
  getRefreshTokenCookieMaxAge: jest.fn(() => 604800000),
}));

describe('auth.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      body: {},
      cookies: {},
      headers: {},
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '127.0.0.1',
      } as Request['socket'],
    };
    mockResponse = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('login', () => {
    it('should throw error when email is missing', async () => {
      mockRequest.body = { password: 'password123' };

      await expect(
        login(mockRequest as Request, mockResponse as Response, nextFunction)
      ).rejects.toThrow();

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ERROR_MESSAGES.AUTH.MISSING_EMAIL_PASSWORD,
          statusCode: 400,
          code: ERROR_CODES.AUTH_MISSING_CREDENTIALS,
        })
      );
    });

    it('should throw error when password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await expect(
        login(mockRequest as Request, mockResponse as Response, nextFunction)
      ).rejects.toThrow();

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ERROR_MESSAGES.AUTH.MISSING_EMAIL_PASSWORD,
          statusCode: 400,
          code: ERROR_CODES.AUTH_MISSING_CREDENTIALS,
        })
      );
    });

    it('should throw error when the email is invalid', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(
        login(mockRequest as Request, mockResponse as Response, nextFunction)
      ).rejects.toThrow();

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ERROR_MESSAGES.AUTH.INVALID_EMAIL,
          statusCode: 400,
          code: ERROR_CODES.AUTH_INVALID_EMAIL,
        })
      );
    });

    it('should login successfully and set cookies', async () => {
      const mockResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
        },
      } as never;

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.headers = { 'user-agent': 'test-agent' };

      mockAuthService.login.mockResolvedValue(mockResult);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'test-agent',
        '127.0.0.1'
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'access-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 3600000,
        }
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 604800000,
        }
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 'user-id',
            email: 'test@example.com',
            role: 'user',
          },
          profile: {
            id: 'user-id',
            email: 'test@example.com',
            full_name: 'Test User',
          },
        },
      });

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should use req.socket.remoteAddress when req.ip is not available', async () => {
      const mockResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as never;

      const testRequest = {
        ...mockRequest,
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
        ip: undefined,
        socket: {
          remoteAddress: '192.168.1.1',
        } as Partial<Request['socket']>,
      } as Request;

      mockAuthService.login.mockResolvedValue(mockResult);

      await login(testRequest, mockResponse as Response, nextFunction);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        undefined,
        '192.168.1.1'
      );
    });

    it('should set secure to true when NODE_ENV is production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as never;

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'access-token',
        expect.objectContaining({
          secure: true,
        })
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          secure: true,
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('refresh', () => {
    it('should throw error when there is no refresh_token', async () => {
      mockRequest.cookies = {};

      await expect(
        refresh(mockRequest as Request, mockResponse as Response, nextFunction)
      ).rejects.toThrow();

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ERROR_MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND,
          statusCode: 401,
          code: ERROR_CODES.AUTH_REFRESH_TOKEN_NOT_FOUND,
        })
      );
    });

    it('should refresh tokens successfully and set cookies', async () => {
      const mockResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
        },
      } as never;

      mockRequest.cookies = { refresh_token: 'old-refresh-token' };
      mockRequest.headers = { 'user-agent': 'test-agent' };

      mockAuthService.refreshTokens.mockResolvedValue(mockResult);

      await refresh(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'old-refresh-token',
        'test-agent',
        '127.0.0.1'
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'new-access-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 3600000,
        }
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 604800000,
        }
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 'user-id',
            email: 'test@example.com',
            role: 'user',
          },
          profile: {
            id: 'user-id',
            email: 'test@example.com',
            full_name: 'Test User',
          },
        },
      });

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should use req.socket.remoteAddress when req.ip is not available', async () => {
      const mockResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as never;

      const testRequest = {
        ...mockRequest,
        cookies: { refresh_token: 'old-refresh-token' },
        ip: undefined,
        socket: {
          remoteAddress: '192.168.1.1',
        } as Partial<Request['socket']>,
      } as Request;

      mockAuthService.refreshTokens.mockResolvedValue(mockResult);

      await refresh(testRequest, mockResponse as Response, nextFunction);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'old-refresh-token',
        undefined,
        '192.168.1.1'
      );
    });

    it('should set secure to true when NODE_ENV is production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as never;

      mockRequest.cookies = { refresh_token: 'old-refresh-token' };

      mockAuthService.refreshTokens.mockResolvedValue(mockResult);

      await refresh(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'new-access-token',
        expect.objectContaining({
          secure: true,
        })
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh-token',
        expect.objectContaining({
          secure: true,
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logout', () => {
    it('should logout successfully without refresh_token', async () => {
      mockRequest.cookies = {};

      await logout(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockAuthService.logout).not.toHaveBeenCalled();

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout exitoso',
      });

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should logout successfully with refresh_token', async () => {
      mockRequest.cookies = { refresh_token: 'refresh-token' };

      mockAuthService.logout.mockResolvedValue(undefined);

      await logout(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockAuthService.logout).toHaveBeenCalledWith('refresh-token');

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout exitoso',
      });

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should set secure to true when NODE_ENV is production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockRequest.cookies = {};

      await logout(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
