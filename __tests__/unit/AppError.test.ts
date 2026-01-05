import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../src/config/errors';

describe('AppError', () => {
  it('should create an error with message and status code', () => {
    const error = new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );

    expect(error.message).toBe(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    expect(error).toBeInstanceOf(Error);
  });

  it('should create an error without custom code', () => {
    const error = new AppError(
      ERROR_MESSAGES.USER.NOT_FOUND,
      404,
      ERROR_CODES.USER_NOT_FOUND
    );

    expect(error.message).toBe(ERROR_MESSAGES.USER.NOT_FOUND);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ERROR_CODES.USER_NOT_FOUND);
  });

  it('should create an error without code (code undefined)', () => {
    const error = new AppError(ERROR_MESSAGES.USER.NOT_FOUND, 404);

    expect(error.message).toBe(ERROR_MESSAGES.USER.NOT_FOUND);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBeUndefined();
    expect(error.isOperational).toBe(true);
  });

  it('should create an error with default values (message only)', () => {
    const error = new AppError('Error de prueba');

    expect(error.message).toBe('Error de prueba');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBeUndefined();
    expect(error.isOperational).toBe(true);
  });

  it('should create an error with isOperational false', () => {
    const error = new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      false
    );

    expect(error.message).toBe(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    expect(error.isOperational).toBe(false);
  });
});
