import { login as loginQuery } from '../../db/queries/auth.queries';
import { type User } from '../../db/schema/auth/users';
import { type Profile } from '../../db/schema/public/profiles';

export class AuthRepository {
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; profile: Profile }> {
    return await loginQuery(email, password);
  }
}
