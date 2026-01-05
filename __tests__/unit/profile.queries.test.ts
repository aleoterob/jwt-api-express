import {
  getAllProfiles,
  getProfileById,
  getProfileByEmail,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileStats,
} from '../../src/db/queries/profile.queries';
import { db } from '../../src/db/index';

jest.mock('../../src/db/index');

describe('profile.queries', () => {
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProfiles', () => {
    it('should return all profiles ordered by creation date', async () => {
      const mockProfiles = [
        {
          id: '1',
          email: 'test1@example.com',
          created_at: new Date('2024-01-02'),
        },
        {
          id: '2',
          email: 'test2@example.com',
          created_at: new Date('2024-01-01'),
        },
      ];

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockProfiles),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getAllProfiles();

      expect(result).toEqual(mockProfiles);
    });
  });

  describe('getProfileById', () => {
    it('should return a profile when it exists', async () => {
      const mockProfile = {
        id: 'profile-id',
        email: 'test@example.com',
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockProfile]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getProfileById('profile-id');

      expect(result).toEqual(mockProfile);
    });

    it('should return null when the profile does not exist', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getProfileById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getProfileByEmail', () => {
    it('should return a profile when it exists', async () => {
      const mockProfile = {
        id: 'profile-id',
        email: 'test@example.com',
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockProfile]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getProfileByEmail('test@example.com');

      expect(result).toEqual(mockProfile);
    });

    it('should return null when the profile does not exist', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select = jest.fn().mockReturnValue(mockSelect);

      const result = await getProfileByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createProfile', () => {
    it('should create a profile successfully', async () => {
      const mockProfile = {
        id: 'profile-id',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockProfile]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      const result = await createProfile({
        id: 'profile-id',
        email: 'test@example.com',
        full_name: 'Test User',
      });

      expect(result).toEqual(mockProfile);
    });

    it('should throw error when creation fails', async () => {
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      await expect(
        createProfile({
          id: 'profile-id',
          email: 'test@example.com',
        })
      ).rejects.toThrow('Failed to create profile');
    });

    it('should throw specific error for foreign key violation', async () => {
      const mockError = new Error(
        'violates foreign key constraint profiles_id_fkey'
      );
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(mockError),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      await expect(
        createProfile({
          id: 'profile-id',
          email: 'test@example.com',
        })
      ).rejects.toThrow(
        'El usuario debe existir primero en auth.users antes de crear el perfil'
      );
    });

    it('should throw specific error for unique constraint', async () => {
      const mockError = new Error(
        'duplicate key value violates unique constraint'
      );
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(mockError),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      await expect(
        createProfile({
          id: 'profile-id',
          email: 'test@example.com',
        })
      ).rejects.toThrow('El perfil ya existe para este usuario');
    });

    it('should throw generic error for other errors', async () => {
      const mockError = new Error('Database connection error');
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(mockError),
      };

      mockDb.insert = jest.fn().mockReturnValue(mockInsert);

      await expect(
        createProfile({
          id: 'profile-id',
          email: 'test@example.com',
        })
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('updateProfile', () => {
    it('should update a profile successfully', async () => {
      const mockProfile = {
        id: 'profile-id',
        email: 'updated@example.com',
        full_name: 'Updated User',
        updated_at: new Date(),
      };

      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockProfile]),
      };

      mockDb.update = jest.fn().mockReturnValue(mockUpdate);

      const result = await updateProfile('profile-id', {
        email: 'updated@example.com',
        full_name: 'Updated User',
      });

      expect(result).toEqual(mockProfile);
    });

    it('should return null when the profile does not exist', async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.update = jest.fn().mockReturnValue(mockUpdate);

      const result = await updateProfile('non-existent', {
        email: 'updated@example.com',
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteProfile', () => {
    it('should delete a profile successfully', async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 'profile-id' }]),
      };

      mockDb.delete = jest.fn().mockReturnValue(mockDelete);

      const result = await deleteProfile('profile-id');

      expect(result).toBe(true);
    });

    it('should return false when the profile does not exist', async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.delete = jest.fn().mockReturnValue(mockDelete);

      const result = await deleteProfile('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getProfileStats', () => {
    it('should return profile statistics', async () => {
      const mockTotalCount = {
        from: jest.fn().mockResolvedValue([{ count: 10 }]),
      };

      const mockActiveCount = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count: 8 }]),
      };

      mockDb.select = jest
        .fn()
        .mockReturnValueOnce(mockTotalCount)
        .mockReturnValueOnce(mockActiveCount);

      const result = await getProfileStats();

      expect(result).toEqual({
        total: 10,
        active: 8,
      });
    });

    it('should return 0 when there are no profiles', async () => {
      const mockTotalCount = {
        from: jest.fn().mockResolvedValue([{ count: 0 }]),
      };

      const mockActiveCount = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count: 0 }]),
      };

      mockDb.select = jest
        .fn()
        .mockReturnValueOnce(mockTotalCount)
        .mockReturnValueOnce(mockActiveCount);

      const result = await getProfileStats();

      expect(result).toEqual({
        total: 0,
        active: 0,
      });
    });
  });
});
