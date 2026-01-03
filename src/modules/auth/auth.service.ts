import { AuthRepository } from './auth.repository';
import { generateToken } from '../../utils/jwt';
import { type User } from '../../db/schema/auth/users';
import { type Profile } from '../../db/schema/public/profiles';

export class AuthService {
  private repository: AuthRepository;

  constructor(repository?: AuthRepository) {
    this.repository = repository || new AuthRepository();
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    user: User;
    profile: Profile;
    access_token: string;
  }> {
    const { user, profile } = await this.repository.login(email, password);

    const access_token = generateToken({
      sub: user.id,
      role: user.role || 'user',
    });

    return {
      user,
      profile,
      access_token,
    };
  }
}
