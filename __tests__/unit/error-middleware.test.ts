import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../../src/middleware/error.middleware';
import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../src/config/errors';

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
      },
    });
  });

  it('should handle generic errors with code 500', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const error = new Error('Generic error');

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'SERVER_001',
        statusCode: 500,
      },
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should use the default error code if not provided', () => {
    const error = new AppError(ERROR_MESSAGES.USER.NOT_FOUND, 404);

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: ERROR_MESSAGES.USER.NOT_FOUND,
        code: undefined,
        statusCode: 404,
      },
    });
  });

  it('should handle generic errors in development with message and stack', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const error = new Error('Generic error');
    error.stack = 'Error stack trace';

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Generic error',
        code: 'SERVER_001',
        statusCode: 500,
        stack: 'Error stack trace',
      },
    });

    process.env.NODE_ENV = originalEnv;
  });
});
