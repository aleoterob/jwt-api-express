import { generateToken, verifyToken } from '../../src/utils/jwt';
import jwt from 'jsonwebtoken';

describe('JWT Utils', () => {
  const mockEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing';
  });

  afterAll(() => {
    process.env.JWT_SECRET = mockEnv;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        role: 'user',
      };

      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified).toHaveProperty('sub', payload.sub);
      expect(verified).toHaveProperty('role', payload.role);
    });

    it('should fail with an invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('should fail with a token with incorrect format', () => {
      expect(() => {
        verifyToken('not.a.valid.token.format');
      }).toThrow();
    });

    it('should fail with an invalid payload', () => {
      const invalidToken = generateToken({
        sub: 'user-id',
        role: 'user',
      });

      const decoded = jwt.decode(invalidToken);
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('Failed to decode token');
      }
      const invalidPayload = { ...decoded };
      delete invalidPayload.sub;

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        return invalidPayload as jwt.JwtPayload;
      });

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Invalid token payload');

      jest.restoreAllMocks();
    });
  });
});
