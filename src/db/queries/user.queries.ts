import { eq } from 'drizzle-orm';
import { db } from '../index';
import { users, type User, type NewUser } from '../schema/auth/users';
import {
  getProfileById,
  updateProfile,
  createProfile,
} from './profile.queries';
import { type Profile } from '../schema/public/profiles';
import bcrypt from 'bcrypt';

export async function createUser(userData: {
  email: string;
  password: string;
  full_name?: string;
  role?: string;
  bio?: string;
  avatar_url?: string;
}): Promise<{ user: User; profile: Profile }> {
  const encryptedPassword = await bcrypt.hash(userData.password, 10);

  const newUser: NewUser = {
    email: userData.email,
    encrypted_password: encryptedPassword,
    role: userData.role || 'user',
    aud: 'authenticated',
    instance_id:
      '00000000-0000-0000-0000-000000000000' as `${string}-${string}-${string}-${string}-${string}`,
    raw_app_meta_data: {
      provider: 'email',
      providers: ['email'],
    },
    raw_user_meta_data: userData.full_name
      ? { full_name: userData.full_name }
      : {},
    email_confirmed_at: new Date(),
  };

  const insertedUsers = await db.insert(users).values(newUser).returning();

  const createdUser = insertedUsers[0];

  if (!createdUser) {
    throw new Error('Failed to create user');
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  let profile = await getProfileById(createdUser.id);

  if (!profile) {
    throw new Error('Profile was not created by trigger');
  }

  if (userData.full_name || userData.bio || userData.avatar_url) {
    profile = await updateProfile(createdUser.id, {
      full_name: userData.full_name || profile.full_name || undefined,
      bio: userData.bio || profile.bio || undefined,
      avatar_url: userData.avatar_url || profile.avatar_url || undefined,
    });
  }

  if (!profile) {
    throw new Error('Failed to retrieve profile');
  }

  return {
    user: createdUser,
    profile,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] || null;
}

export async function updateUser(
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
  const existingUser = await getUserById(id);

  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  const userUpdateData: Partial<NewUser> = {
    updated_at: new Date(),
  };

  if (userData.email !== undefined) {
    userUpdateData.email = userData.email;
  }

  if (userData.password !== undefined) {
    userUpdateData.encrypted_password = await bcrypt.hash(
      userData.password,
      10
    );
  }

  if (userData.role !== undefined) {
    userUpdateData.role = userData.role;
  }

  if (userData.full_name !== undefined) {
    userUpdateData.raw_user_meta_data = {
      ...((existingUser.raw_user_meta_data as object) || {}),
      full_name: userData.full_name,
    };
  }

  const updatedUsers = await db
    .update(users)
    .set(userUpdateData)
    .where(eq(users.id, id))
    .returning();

  const updatedUser = updatedUsers[0];

  if (!updatedUser) {
    throw new Error('Failed to update user');
  }

  let profile = await getProfileById(id);

  if (!profile) {
    const newProfileData = {
      id,
      email: updatedUser.email || undefined,
      full_name:
        userData.full_name ||
        (updatedUser.raw_user_meta_data as { full_name?: string })?.full_name ||
        undefined,
    };
    profile = await createProfile(newProfileData);
  } else {
    const profileUpdateData: {
      email?: string;
      full_name?: string;
      bio?: string;
      avatar_url?: string;
    } = {};

    if (userData.email !== undefined) {
      profileUpdateData.email = userData.email;
    }

    if (userData.full_name !== undefined) {
      profileUpdateData.full_name = userData.full_name;
    }

    if (userData.bio !== undefined) {
      profileUpdateData.bio = userData.bio;
    }

    if (userData.avatar_url !== undefined) {
      profileUpdateData.avatar_url = userData.avatar_url;
    }

    if (Object.keys(profileUpdateData).length > 0) {
      const updatedProfile = await updateProfile(id, profileUpdateData);
      if (updatedProfile) {
        profile = updatedProfile;
      }
    }
  }

  if (!profile) {
    throw new Error('Failed to retrieve or create profile');
  }

  return {
    user: updatedUser,
    profile,
  };
}
