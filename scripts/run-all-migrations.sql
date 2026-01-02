-- Script completo para ejecutar todas las migraciones en orden
-- Ejecutar en la base de datos aprender-auth

-- 1. Crear schema auth
CREATE SCHEMA IF NOT EXISTS auth;

-- 2. Crear tabla auth.users
\i create-auth-users-table.sql

-- 3. Crear tabla profiles
\i create-profiles-table.sql

-- 4. Agregar foreign key y trigger
\i add-foreign-key-and-trigger.sql

-- Verificar todo
SELECT 'Todas las migraciones ejecutadas!' AS mensaje;

