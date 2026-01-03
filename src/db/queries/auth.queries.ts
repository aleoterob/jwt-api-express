import { type User } from '../schema/auth/users';
import { type Profile } from '../schema/public/profiles';
import { getProfileById } from './profile.queries';
import { getUserByEmail } from './user.queries';
import bcrypt from 'bcrypt';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, ERROR_CODES } from '../../config/errors';

export async function login(
  email: string,
  password: string
): Promise<{ user: User; profile: Profile }> {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );
  }

  if (!user.encrypted_password) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.encrypted_password
  );

  if (!isPasswordValid) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      401,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );
  }

  const profile = await getProfileById(user.id);

  if (!profile) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.PROFILE_NOT_FOUND,
      404,
      ERROR_CODES.AUTH_INVALID_CREDENTIALS
    );
  }

  return {
    user,
    profile,
  };
}
