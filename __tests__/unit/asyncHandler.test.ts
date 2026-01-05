import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../src/utils/asyncHandler';
import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../src/config/errors';

describe('asyncHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should execute the async function correctly', async () => {
    const mockHandler = jest.fn().mockResolvedValue(undefined);

    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockHandler).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      nextFunction
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should pass the error to next() if an error occurs', async () => {
    const error = new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );

    const mockHandler = jest.fn().mockRejectedValue(error);

    const wrappedHandler = asyncHandler(mockHandler);

    await expect(
      wrappedHandler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )
    ).rejects.toThrow(error);

    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should pass generic errors to next()', async () => {
    const error = new Error('Generic error');

    const mockHandler = jest.fn().mockRejectedValue(error);

    const wrappedHandler = asyncHandler(mockHandler);

    await expect(
      wrappedHandler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )
    ).rejects.toThrow(error);

    expect(nextFunction).toHaveBeenCalledWith(error);
  });
});
