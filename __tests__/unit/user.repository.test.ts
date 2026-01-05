import { UserRepository } from '../../src/modules/user/user.repository';
import {
  getAllProfiles,
  getProfileById,
  getProfileByEmail,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileStats,
} from '../../src/db/queries/profile.queries';
import { createUser, updateUser } from '../../src/db/queries/user.queries';

jest.mock('../../src/db/queries/profile.queries');
jest.mock('../../src/db/queries/user.queries');

describe('UserRepository', () => {
  let repository: UserRepository;
  const mockGetAllProfiles = getAllProfiles as jest.MockedFunction<
    typeof getAllProfiles
  >;
  const mockGetProfileById = getProfileById as jest.MockedFunction<
    typeof getProfileById
  >;
  const mockGetProfileByEmail = getProfileByEmail as jest.MockedFunction<
    typeof getProfileByEmail
  >;
  const mockCreateProfile = createProfile as jest.MockedFunction<
    typeof createProfile
  >;
  const mockUpdateProfile = updateProfile as jest.MockedFunction<
    typeof updateProfile
  >;
  const mockDeleteProfile = deleteProfile as jest.MockedFunction<
    typeof deleteProfile
  >;
  const mockGetProfileStats = getProfileStats as jest.MockedFunction<
    typeof getProfileStats
  >;
  const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>;
  const mockUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;

  beforeEach(() => {
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all profiles', async () => {
      const mockProfiles = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];

      mockGetAllProfiles.mockResolvedValue(mockProfiles as never);

      const result = await repository.findAll();

      expect(result).toEqual(mockProfiles);
      expect(mockGetAllProfiles).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a profile by ID', async () => {
      const mockProfile = { id: '1', email: 'test@example.com' };

      mockGetProfileById.mockResolvedValue(mockProfile as never);

      const result = await repository.findById('1');

      expect(result).toEqual(mockProfile);
      expect(mockGetProfileById).toHaveBeenCalledWith('1');
    });

    it('should return null when the profile does not exist', async () => {
      mockGetProfileById.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a profile by email', async () => {
      const mockProfile = { id: '1', email: 'test@example.com' };

      mockGetProfileByEmail.mockResolvedValue(mockProfile as never);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockProfile);
      expect(mockGetProfileByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when the profile does not exist', async () => {
      mockGetProfileByEmail.mockResolvedValue(null);

      const result = await repository.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a profile', async () => {
      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCreateProfile.mockResolvedValue(mockProfile);

      const result = await repository.create({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
      });

      expect(result).toEqual(mockProfile);
      expect(mockCreateProfile).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
      });
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const mockProfile = {
        id: '1',
        email: 'updated@example.com',
        full_name: 'Updated User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUpdateProfile.mockResolvedValue(mockProfile);

      const result = await repository.update('1', {
        email: 'updated@example.com',
        full_name: 'Updated User',
      });

      expect(result).toEqual(mockProfile);
      expect(mockUpdateProfile).toHaveBeenCalledWith('1', {
        email: 'updated@example.com',
        full_name: 'Updated User',
      });
    });

    it('should return null when the profile does not exist', async () => {
      mockUpdateProfile.mockResolvedValue(null);

      const result = await repository.update('non-existent', {
        email: 'updated@example.com',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a profile', async () => {
      mockDeleteProfile.mockResolvedValue(true);

      const result = await repository.delete('1');

      expect(result).toBe(true);
      expect(mockDeleteProfile).toHaveBeenCalledWith('1');
    });

    it('should return false when the profile does not exist', async () => {
      mockDeleteProfile.mockResolvedValue(false);

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const mockStats = { total: 10, active: 8 };

      mockGetProfileStats.mockResolvedValue(mockStats);

      const result = await repository.getStats();

      expect(result).toEqual(mockStats);
      expect(mockGetProfileStats).toHaveBeenCalled();
    });
  });

  describe('createUserWithProfile', () => {
    it('should create a user with profile', async () => {
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

      mockCreateUser.mockResolvedValue(mockResult);

      const result = await repository.createUserWithProfile({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });

      expect(result).toEqual(mockResult);
      expect(mockCreateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });
    });
  });

  describe('updateUserWithProfile', () => {
    it('should update a user with profile', async () => {
      const mockResult = {
        user: {
          id: 'user-id',
          email: 'updated@example.com',
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
          email: 'updated@example.com',
          full_name: null,
          bio: null,
          avatar_url: null,
          status: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockUpdateUser.mockResolvedValue(mockResult);

      const result = await repository.updateUserWithProfile('user-id', {
        email: 'updated@example.com',
        full_name: 'Updated User',
      });

      expect(result).toEqual(mockResult);
      expect(mockUpdateUser).toHaveBeenCalledWith('user-id', {
        email: 'updated@example.com',
        full_name: 'Updated User',
      });
    });
  });
});
