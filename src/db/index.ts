import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as profilesSchema from './schema/public/profiles';
import * as authUsersSchema from './schema/auth/users';
import * as relations from './relations';

const schema = {
  ...profilesSchema,
  ...authUsersSchema,
};

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
  ssl: false,
});

export const db = drizzle(client, {
  schema: {
    ...schema,
    ...relations,
  },
});

export * from './schema/public/profiles';
