import {
  getTokenExpirationString,
  getCookieMaxAge,
  getRefreshTokenExpirationDate,
  getRefreshTokenCookieMaxAge,
} from '../../src/utils/auth';
import {
  TOKEN_EXPIRATION_MINUTES,
  REFRESH_TOKEN_EXPIRATION_MINUTES,
} from '../../src/config/constants';

describe('auth utils', () => {
  describe('getTokenExpirationString', () => {
    it('should return the correct expiration string', () => {
      const result = getTokenExpirationString();

      expect(result).toBe(`${TOKEN_EXPIRATION_MINUTES}m`);
    });
  });

  describe('getCookieMaxAge', () => {
    it('should return the maxAge in milliseconds', () => {
      const result = getCookieMaxAge();

      expect(result).toBe(TOKEN_EXPIRATION_MINUTES * 60 * 1000);
    });
  });

  describe('getRefreshTokenExpirationDate', () => {
    it('should return a future date with the correct minutes', () => {
      const now = new Date();
      const result = getRefreshTokenExpirationDate();

      const expectedTime =
        now.getTime() + REFRESH_TOKEN_EXPIRATION_MINUTES * 60 * 1000;
      const resultTime = result.getTime();

      expect(resultTime).toBeGreaterThan(now.getTime());
      expect(resultTime).toBe(expectedTime);
    });
  });

  describe('getRefreshTokenCookieMaxAge', () => {
    it('should return the maxAge in milliseconds', () => {
      const result = getRefreshTokenCookieMaxAge();

      expect(result).toBe(REFRESH_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
    });
  });
});
