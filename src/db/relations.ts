/**
 * Definición de relaciones Drizzle ORM
 * Estas relaciones permiten hacer queries con joins tipados
 *
 * NOTA: La relación con auth.users existe a nivel de base de datos (foreign key)
 * pero no se puede expresar en Drizzle relations porque auth.users está en otro schema.
 * La foreign key: profiles.id -> auth.users.id (ON DELETE CASCADE)
 * El trigger automático crea un perfil cuando se crea un usuario en auth.users
 */

import { relations } from 'drizzle-orm';
import { profiles } from './schema/public/profiles';

/**
 * PROFILES RELATIONS
 * Un perfil está relacionado con auth.users a través de foreign key (profiles.id = auth.users.id)
 * Esta relación no se puede expresar en Drizzle porque auth.users está en otro schema,
 * pero existe a nivel de base de datos con ON DELETE CASCADE
 */
export const profilesRelations = relations(profiles, () => ({}));
