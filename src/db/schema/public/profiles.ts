import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

// Tabla de perfiles de usuarios (sincronizada con auth.users de Supabase)
// profiles.id tiene foreign key hacia auth.users.id (ON DELETE CASCADE)
// Un trigger automático crea un perfil cuando se crea un usuario en auth.users
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    full_name: text('full_name'),
    email: text('email'),
    bio: text('bio'),
    avatar_url: text('avatar_url'),
    status: text('status').default('active'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('idx_profiles_email').on(table.email),
  })
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
