import {
  getAllProfiles,
  getProfileById,
  getProfileByEmail,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileStats,
} from '../../db/queries/profile.queries';
import { createUser, updateUser } from '../../db/queries/user.queries';
import { type Profile, type NewProfile } from '../../db/schema/public/profiles';
import { type User } from '../../db/schema/auth/users';

export class UserRepository {
  async findAll(): Promise<Profile[]> {
    return await getAllProfiles();
  }

  async findById(id: string): Promise<Profile | null> {
    return await getProfileById(id);
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return await getProfileByEmail(email);
  }

  async create(profileData: NewProfile): Promise<Profile> {
    return await createProfile(profileData);
  }

  async update(
    id: string,
    profileData: Partial<NewProfile>
  ): Promise<Profile | null> {
    return await updateProfile(id, profileData);
  }

  async delete(id: string): Promise<boolean> {
    return await deleteProfile(id);
  }

  async getStats() {
    return await getProfileStats();
  }

  async createUserWithProfile(userData: {
    email: string;
    password: string;
    full_name?: string;
    role?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    return await createUser(userData);
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
    return await updateUser(id, userData);
  }
}
