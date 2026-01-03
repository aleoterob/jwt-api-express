import { TOKEN_EXPIRATION_MINUTES } from '../config/constants';

export function getTokenExpirationString(): string {
  return `${TOKEN_EXPIRATION_MINUTES}m`;
}

export function getCookieMaxAge(): number {
  return TOKEN_EXPIRATION_MINUTES * 60 * 1000;
}
