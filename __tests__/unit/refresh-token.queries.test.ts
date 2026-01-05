import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanupExpiredTokens,
  hashToken,
  generateRefreshToken,
} from '../../src/db/queries/refresh-token.queries';
import { db } from '../../src/db/index';
import crypto from 'crypto';

jest.mock('../../src/db/index');
jest.mock('crypto');

describe('refresh-token.queries', () => {
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashToken', () => {
    it('should generate a SHA256 hash of the token', () => {
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed-token'),
      };

      const mockCreateHash = crypto.createHash as jest.MockedFunction<
        typeof crypto.createHash
      >;
      mockCreateHash.mockReturnValue(mockHash as never);

      const result = hashToken('test-token');

      expect(result).toBe('hashed-token');
      expect(mockCreateHash).toHaveBeenCalledWith('sha256');
      expect(mockHash.update).toHaveBeenCalledWith('test-token');
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a random token in base64url', () => {
      const mockRandomBytes = crypto.randomBytes as jest.MockedFunction<
        typeof crypto.randomBytes
      >;
      const mockBuffer = Buffer.from('random-bytes');
      mockRandomBytes.mockReturnValue(mockBuffer as never);

      const result = generateRefreshToken();

      expect(result).toBe(mockBuffer.toString('base64url'));
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
    });
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token successfully', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockToken]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed-token'),
      };

      const mockCreateHash = crypto.createHash as jest.MockedFunction<
        typeof crypto.createHash
      >;
      mockCreateHash.mockReturnValue(mockHash as never);

      const result = await createRefreshToken({
        token: 'test-token',
        userId: 'user-id',
        expiresAt: new Date(),
      });

      expect(result).toEqual(mockToken);
    });

    it('should create a refresh token with userAgent and ipAddress', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockToken]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed-token'),
      };

      const mockCreateHash = crypto.createHash as jest.MockedFunction<
        typeof crypto.createHash
      >;
      mockCreateHash.mockReturnValue(mockHash as never);

      const result = await createRefreshToken({
        token: 'test-token',
        userId: 'user-id',
        expiresAt: new Date(),
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual(mockToken);
      const expectedValues = {
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: expect.any(Date) as unknown,
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      };
      expect(mockInsert.values).toHaveBeenCalledWith(
        expect.objectContaining(expectedValues)
      );
    });

    it('should throw error when creation fails', async () => {
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashed-token'),
      };

      const mockCreateHash = crypto.createHash as jest.MockedFunction<
        typeof crypto.createHash
      >;
      mockCreateHash.mockReturnValue(mockHash as never);

      await expect(
        createRefreshToken({
          token: 'test-token',
          userId: 'user-id',
          expiresAt: new Date(),
        })
      ).rejects.toThrow('Failed to create refresh token');
    });
  });

  describe('findRefreshTokenByHash', () => {
    it('should find a valid refresh token', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
        revokedAt: null,
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockToken]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await findRefreshTokenByHash('hashed-token');

      expect(result).toEqual(mockToken);
    });

    it('should return undefined when the token does not exist', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await findRefreshTokenByHash('non-existent-hash');

      expect(result).toBeUndefined();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.update = jest.fn().mockReturnValue(mockUpdate);

      await revokeRefreshToken('token-id');

      expect(mockUpdate.set).toHaveBeenCalledWith({
        revokedAt: expect.any(Date) as Date,
        replacedByToken: null,
      });
    });

    it('should revoke a refresh token with replacedByTokenId', async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.update = jest.fn().mockReturnValue(mockUpdate);

      await revokeRefreshToken('token-id', 'new-token-id');

      expect(mockUpdate.set).toHaveBeenCalledWith({
        revokedAt: expect.any(Date) as Date,
        replacedByToken: 'new-token-id',
      });
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should revoke all tokens of a user', async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.update = jest.fn().mockReturnValue(mockUpdate);

      await revokeAllUserRefreshTokens('user-id');

      expect(mockUpdate.set).toHaveBeenCalledWith({
        revokedAt: expect.any(Date) as Date,
      });
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      const mockDelete = {
        where: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.delete = jest.fn().mockReturnValue(mockDelete);

      await cleanupExpiredTokens();

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
