import 'dotenv/config';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { type Request } from 'express';
import { getTokenExpirationString } from './auth';

const JWT_SECRET = ((): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
})();

export interface TokenPayload {
  sub: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  const expiration = getTokenExpirationString();
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiration,
  } as SignOptions);
}

export function verifyToken(token: string): NonNullable<Request['user']> {
  const payload = jwt.verify(token, JWT_SECRET);

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('sub' in payload) ||
    !('role' in payload)
  ) {
    throw new Error('Invalid token payload');
  }

  return payload as NonNullable<Request['user']>;
}
