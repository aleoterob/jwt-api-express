import { UserRepository } from './user.repository';
import { type Profile, type NewProfile } from '../../db/schema/public/profiles';
import { type User } from '../../db/schema/auth/users';

export class UserService {
  private repository: UserRepository;

  constructor(repository?: UserRepository) {
    this.repository = repository || new UserRepository();
  }

  async getAllUsers(): Promise<Profile[]> {
    return await this.repository.findAll();
  }

  async getUserById(id: string): Promise<Profile | null> {
    return await this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<Profile | null> {
    return await this.repository.findByEmail(email);
  }

  async createUser(profileData: NewProfile): Promise<Profile> {
    return await this.repository.create(profileData);
  }

  async updateUser(
    id: string,
    profileData: Partial<NewProfile>
  ): Promise<Profile | null> {
    return await this.repository.update(id, profileData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  async getStats() {
    return await this.repository.getStats();
  }

  async createUserWithProfile(userData: {
    email: string;
    password: string;
    full_name?: string;
    role?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    return await this.repository.createUserWithProfile(userData);
  }

  async updateUserWithProfile(
    id: string,
    userData: {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    }
  ): Promise<{ user: User; profile: Profile }> {
    return await this.repository.updateUserWithProfile(id, userData);
  }
}
