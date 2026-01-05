import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { login as loginQuery } from '../../src/db/queries/auth.queries';
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  hashToken,
} from '../../src/db/queries/refresh-token.queries';

jest.mock('../../src/db/queries/auth.queries');
jest.mock('../../src/db/queries/refresh-token.queries');

describe('AuthRepository', () => {
  let repository: AuthRepository;
  const mockLoginQuery = loginQuery as jest.MockedFunction<typeof loginQuery>;
  const mockCreateRefreshToken = createRefreshToken as jest.MockedFunction<
    typeof createRefreshToken
  >;
  const mockFindRefreshTokenByHash =
    findRefreshTokenByHash as jest.MockedFunction<
      typeof findRefreshTokenByHash
    >;
  const mockRevokeRefreshToken = revokeRefreshToken as jest.MockedFunction<
    typeof revokeRefreshToken
  >;
  const mockRevokeAllUserRefreshTokens =
    revokeAllUserRefreshTokens as jest.MockedFunction<
      typeof revokeAllUserRefreshTokens
    >;
  const mockHashToken = hashToken as jest.MockedFunction<typeof hashToken>;

  beforeEach(() => {
    repository = new AuthRepository();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call loginQuery with email and password', async () => {
      const mockResult = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'user',
          created_at: new Date(),
          updated_at: new Date(),
          instance_id: null,
          aud: null,
          encrypted_password: null,
          confirmation_token: null,
          confirmation_sent_at: null,
          recovery_token: null,
          recovery_sent_at: null,
          email_change_token_new: null,
          email_change: null,
          email_change_sent_at: null,
          last_sign_in_at: null,
          raw_app_meta_data: {},
          raw_user_meta_data: {},
          is_super_admin: false,
          phone: null,
          phone_confirmed_at: null,
          phone_change: null,
          phone_change_token: null,
          phone_change_sent_at: null,
          email_confirmed_at: null,
          invited_at: null,
          email_change_confirm_status: 0,
          banned_until: null,
          reauthentication_token: null,
          reauthentication_sent_at: null,
          is_sso_user: false,
          deleted_at: null,
          confirmed_at: null,
          email_change_token_current: null,
        },
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: null,
          bio: null,
          avatar_url: null,
          status: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockLoginQuery.mockResolvedValue(mockResult);

      const result = await repository.login('test@example.com', 'password123');

      expect(result).toEqual(mockResult);
      expect(mockLoginQuery).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
        revokedAt: null,
        replacedByToken: null,
        createdAt: new Date(),
        userAgent: null,
        ipAddress: null,
      };

      mockCreateRefreshToken.mockResolvedValue(mockToken);

      const result = await repository.createRefreshToken(
        'refresh-token',
        'user-id',
        new Date(),
        'user-agent',
        '127.0.0.1'
      );

      expect(result).toEqual(mockToken);
      expect(mockCreateRefreshToken).toHaveBeenCalledWith({
        token: 'refresh-token',
        userId: 'user-id',
        expiresAt: expect.any(Date) as Date,
        userAgent: 'user-agent',
        ipAddress: '127.0.0.1',
      });
    });
  });

  describe('findRefreshTokenByToken', () => {
    it('should find a refresh token by token', async () => {
      const mockToken = {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
        revokedAt: null,
        replacedByToken: null,
        createdAt: new Date(),
        userAgent: null,
        ipAddress: null,
      };

      mockHashToken.mockReturnValue('hashed-token');
      mockFindRefreshTokenByHash.mockResolvedValue(mockToken);

      const result = await repository.findRefreshTokenByToken('refresh-token');

      expect(result).toEqual(mockToken);
      expect(mockHashToken).toHaveBeenCalledWith('refresh-token');
      expect(mockFindRefreshTokenByHash).toHaveBeenCalledWith('hashed-token');
    });

    it('should return undefined when the token does not exist', async () => {
      mockHashToken.mockReturnValue('hashed-token');
      mockFindRefreshTokenByHash.mockResolvedValue(undefined);

      const result = await repository.findRefreshTokenByToken('invalid-token');

      expect(result).toBeUndefined();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      mockRevokeRefreshToken.mockResolvedValue(undefined);

      await repository.revokeRefreshToken('token-id');

      expect(mockRevokeRefreshToken).toHaveBeenCalledWith(
        'token-id',
        undefined
      );
    });

    it('should revoke a refresh token with replacedByTokenId', async () => {
      mockRevokeRefreshToken.mockResolvedValue(undefined);

      await repository.revokeRefreshToken('token-id', 'new-token-id');

      expect(mockRevokeRefreshToken).toHaveBeenCalledWith(
        'token-id',
        'new-token-id'
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens of a user', async () => {
      mockRevokeAllUserRefreshTokens.mockResolvedValue(undefined);

      await repository.revokeAllUserTokens('user-id');

      expect(mockRevokeAllUserRefreshTokens).toHaveBeenCalledWith('user-id');
    });
  });
});
