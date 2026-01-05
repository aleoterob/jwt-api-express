import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/middleware/auth.middleware';
import { generateToken } from '../../src/utils/jwt';

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  const mockEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-middleware-testing';
  });

  afterAll(() => {
    process.env.JWT_SECRET = mockEnv;
  });

  beforeEach(() => {
    mockRequest = {
      cookies: {},
    };
    mockResponse = {
      sendStatus: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should call next() with a valid token', () => {
    const token = generateToken({
      sub: '123e4567-e89b-12d3-a456-426614174000',
      role: 'user',
    });

    mockRequest.cookies = {
      access_token: token,
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.sendStatus).not.toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
  });

  it('should return 401 without token', () => {
    mockRequest.cookies = {};

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 with invalid token', () => {
    mockRequest.cookies = {
      access_token: 'invalid-token',
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 without cookies', () => {
    delete mockRequest.cookies;

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
