import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const cookies = req.cookies as { access_token?: string } | undefined;
  const token: string | undefined = cookies?.access_token;

  if (!token || typeof token !== 'string') {
    res.sendStatus(401);
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.sendStatus(401);
  }
}
