import { UserService } from '../../src/modules/user/user.service';
import { UserRepository } from '../../src/modules/user/user.repository';

jest.mock('../../src/modules/user/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
      createUserWithProfile: jest.fn(),
      updateUserWithProfile: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    userService = new UserService(mockRepository);
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockUsers as never);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      mockRepository.findById.mockResolvedValue(mockUser as never);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if the user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById('non-existent');

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      mockRepository.findByEmail.mockResolvedValue(mockUser as never);

      const result = await userService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockProfileData = {
        id: '1',
        email: 'test@example.com',
      };

      const mockCreatedUser = {
        id: '1',
        email: 'test@example.com',
      };

      mockRepository.create.mockResolvedValue(mockCreatedUser as never);

      const result = await userService.createUser(mockProfileData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(mockProfileData);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const mockUpdateData = {
        email: 'updated@example.com',
      };

      const mockUpdatedUser = {
        id: '1',
        email: 'updated@example.com',
      };

      mockRepository.update.mockResolvedValue(mockUpdatedUser as never);

      const result = await userService.updateUser('1', mockUpdateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith('1', mockUpdateData);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser('1');

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should return false if the user does not exist', async () => {
      mockRepository.delete.mockResolvedValue(false);

      const result = await userService.deleteUser('non-existent');

      expect(result).toBe(false);
      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const mockStats = {
        total: 10,
      };

      mockRepository.getStats.mockResolvedValue(mockStats as never);

      const result = await userService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockRepository.getStats).toHaveBeenCalled();
    });
  });
});
