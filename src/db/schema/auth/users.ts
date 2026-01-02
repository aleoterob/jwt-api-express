import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
  smallint,
} from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  instance_id: uuid('instance_id'),
  aud: varchar('aud', { length: 255 }),
  role: varchar('role', { length: 255 }).default('user'),
  email: varchar('email', { length: 255 }),
  encrypted_password: varchar('encrypted_password', { length: 255 }),
  email_confirmed_at: timestamp('email_confirmed_at', { withTimezone: true }),
  invited_at: timestamp('invited_at', { withTimezone: true }),
  confirmation_token: varchar('confirmation_token', { length: 255 }),
  confirmation_sent_at: timestamp('confirmation_sent_at', {
    withTimezone: true,
  }),
  recovery_token: varchar('recovery_token', { length: 255 }),
  recovery_sent_at: timestamp('recovery_sent_at', { withTimezone: true }),
  email_change_token_new: varchar('email_change_token_new', { length: 255 }),
  email_change: varchar('email_change', { length: 255 }),
  email_change_sent_at: timestamp('email_change_sent_at', {
    withTimezone: true,
  }),
  last_sign_in_at: timestamp('last_sign_in_at', { withTimezone: true }),
  raw_app_meta_data: jsonb('raw_app_meta_data'),
  raw_user_meta_data: jsonb('raw_user_meta_data'),
  is_super_admin: boolean('is_super_admin'),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  phone: varchar('phone', { length: 15 }),
  phone_confirmed_at: timestamp('phone_confirmed_at', { withTimezone: true }),
  phone_change: varchar('phone_change', { length: 15 }),
  phone_change_token: varchar('phone_change_token', { length: 255 }),
  phone_change_sent_at: timestamp('phone_change_sent_at', {
    withTimezone: true,
  }),
  confirmed_at: timestamp('confirmed_at', { withTimezone: true }),
  email_change_token_current: varchar('email_change_token_current', {
    length: 255,
  }),
  email_change_confirm_status: smallint('email_change_confirm_status'),
  banned_until: timestamp('banned_until', { withTimezone: true }),
  reauthentication_token: varchar('reauthentication_token', { length: 255 }),
  reauthentication_sent_at: timestamp('reauthentication_sent_at', {
    withTimezone: true,
  }),
  is_sso_user: boolean('is_sso_user').default(false),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
