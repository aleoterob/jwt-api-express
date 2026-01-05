import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
} from '../../src/db/queries/user.queries';
import { db } from '../../src/db/index';
import {
  getProfileById,
  createProfile,
  updateProfile,
} from '../../src/db/queries/profile.queries';
import bcrypt from 'bcrypt';

jest.mock('../../src/db/index');
jest.mock('../../src/db/queries/profile.queries');
jest.mock('bcrypt');

describe('user.queries', () => {
  const mockDb = db as jest.Mocked<typeof db>;
  const mockGetProfileById = getProfileById as jest.MockedFunction<
    typeof getProfileById
  >;
  const mockCreateProfile = createProfile as jest.MockedFunction<
    typeof createProfile
  >;
  const mockUpdateProfile = updateProfile as jest.MockedFunction<
    typeof updateProfile
  >;
  const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return a user when it exists', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getUserById('user-id');

      expect(result).toEqual(mockUser);
    });

    it('should return null when the user does not exist', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when it exists', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null when the user does not exist', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getUserByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a user and profile successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      jest.useFakeTimers();
      const resultPromise = createUser({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });

      mockGetProfileById.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockProfile);
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      jest.useRealTimers();

      expect(result.user).toEqual(mockUser);
      expect(result.profile).toEqual(mockProfile);
      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create a profile if it does not exist after creating the user', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      jest.useFakeTimers();
      const resultPromise = createUser({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });

      mockGetProfileById.mockResolvedValueOnce(null);
      mockCreateProfile.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockProfile);

      await jest.runAllTimersAsync();
      const result = await resultPromise;
      jest.useRealTimers();

      expect(result.user).toEqual(mockUser);
      expect(result.profile).toEqual(mockProfile);
      expect(mockCreateProfile).toHaveBeenCalled();
    });

    it('should update the profile when only bio is provided', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: null,
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        bio: 'Test bio',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      jest.useFakeTimers();
      const resultPromise = createUser({
        email: 'test@example.com',
        password: 'password123',
        bio: 'Test bio',
      });

      mockGetProfileById.mockResolvedValueOnce(null);
      mockCreateProfile.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockUpdatedProfile);

      await jest.runAllTimersAsync();
      const result = await resultPromise;
      jest.useRealTimers();

      expect(result.profile).toEqual(mockUpdatedProfile);
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it('should update the profile when only avatar_url is provided', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: null,
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      jest.useFakeTimers();
      const resultPromise = createUser({
        email: 'test@example.com',
        password: 'password123',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      mockGetProfileById.mockResolvedValueOnce(null);
      mockCreateProfile.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockUpdatedProfile);

      await jest.runAllTimersAsync();
      const result = await resultPromise;
      jest.useRealTimers();

      expect(result.profile).toEqual(mockUpdatedProfile);
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it('should update the profile if additional data is provided', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: 'Test bio',
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      jest.useFakeTimers();
      const resultPromise = createUser({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      mockGetProfileById
        .mockResolvedValueOnce(mockProfile)
        .mockResolvedValueOnce(mockUpdatedProfile);
      mockUpdateProfile.mockResolvedValue(mockUpdatedProfile);

      await jest.runAllTimersAsync();
      const result = await resultPromise;
      jest.useRealTimers();

      expect(result.profile).toEqual(mockUpdatedProfile);
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it('should throw error when user creation fails', async () => {
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      await expect(
        createUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Failed to create user');
    });

    it('should throw error when the profile cannot be retrieved', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hashed-password',
        role: 'user',
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);
      mockBcryptHash.mockResolvedValue('hashed-password' as never);

      mockGetProfileById.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(null);

      await expect(
        createUser({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          bio: 'Test bio',
          avatar_url: 'https://example.com/avatar.jpg',
        })
      ).rejects.toThrow('Failed to retrieve profile');
    });
  });

  describe('updateUser', () => {
    it('should update a user with existing raw_user_meta_data', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: { other_field: 'value' },
      };

      const updatedUser = {
        ...existingUser,
        raw_user_meta_data: { other_field: 'value', full_name: 'Updated User' },
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Updated User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockProfile);

      const result = await updateUser('user-id', {
        full_name: 'Updated User',
      });

      expect(result.profile).toEqual(mockProfile);
    });

    it('should update a user and profile successfully', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'old-hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        email: 'updated@example.com',
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'updated@example.com',
        full_name: 'Updated User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        bio: 'Updated bio',
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await updateUser('user-id', {
        email: 'updated@example.com',
        full_name: 'Updated User',
        bio: 'Updated bio',
      });

      expect(result.user).toEqual(updatedUser);
      expect(result.profile).toEqual(mockUpdatedProfile);
    });

    it('should update the password when provided', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'old-hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        encrypted_password: 'new-hash',
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: null,
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(mockProfile);
      mockBcryptHash.mockResolvedValue('new-hash' as never);

      await updateUser('user-id', {
        password: 'newpassword123',
      });

      expect(mockBcryptHash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('should create a profile if it does not exist when updating', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'New User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(null);
      mockCreateProfile.mockResolvedValue(mockProfile);

      const result = await updateUser('user-id', {
        full_name: 'New User',
      });

      expect(result.profile).toEqual(mockProfile);
      expect(mockCreateProfile).toHaveBeenCalled();
    });

    it('should create a profile with null email when updatedUser.email is null', async () => {
      const existingUser = {
        id: 'user-id',
        email: null,
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: null,
        full_name: null,
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(null);
      mockCreateProfile.mockResolvedValue(mockProfile);

      const result = await updateUser('user-id', {});

      expect(result.profile).toEqual(mockProfile);
      expect(mockCreateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: undefined,
        })
      );
    });

    it('should throw error when the user does not exist', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      await expect(
        updateUser('non-existent', { email: 'test@example.com' })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error when update fails', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);

      await expect(
        updateUser('user-id', { email: 'updated@example.com' })
      ).rejects.toThrow('Failed to update user');
    });

    it('should update the user role', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        role: 'admin',
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: null,
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(mockProfile);

      const result = await updateUser('user-id', {
        role: 'admin',
      });

      expect(result.user.role).toBe('admin');
      expect(mockUpdate.set).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'admin',
        })
      );
    });

    it('should update profile avatar_url when the profile exists', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(mockProfile);
      mockUpdateProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await updateUser('user-id', {
        avatar_url: 'https://example.com/avatar.jpg',
      });

      expect(result.profile.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(mockUpdateProfile).toHaveBeenCalledWith('user-id', {
        avatar_url: 'https://example.com/avatar.jpg',
      });
    });

    it('should throw error when createProfile fails to create profile', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(null);
      mockCreateProfile.mockRejectedValue(
        new Error('Failed to create profile')
      );

      await expect(
        updateUser('user-id', { email: 'updated@example.com' })
      ).rejects.toThrow();
    });

    it('should update the profile when updateProfile returns null but profileUpdateData is empty', async () => {
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        encrypted_password: 'hash',
        role: 'user',
        raw_user_meta_data: {},
      };

      const updatedUser = {
        ...existingUser,
        updated_at: new Date(),
      };

      const mockProfile = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        bio: null,
        avatar_url: null,
        status: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);
      mockDb.update = jest.fn().mockReturnValue(mockUpdate);
      mockGetProfileById.mockResolvedValue(mockProfile);

      const result = await updateUser('user-id', {});

      expect(result.profile).toEqual(mockProfile);
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });
});
