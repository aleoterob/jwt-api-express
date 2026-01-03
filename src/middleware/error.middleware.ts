import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  console.error('Unexpected error:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: {
      message: isDevelopment ? err.message : 'Error interno del servidor',
      code: 'SERVER_001',
      statusCode: 500,
      ...(isDevelopment && { stack: err.stack }),
    },
  });
}
