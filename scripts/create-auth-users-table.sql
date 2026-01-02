-- Script para crear la tabla auth.users
-- Ejecutar en la base de datos aprender-auth

-- Crear schema auth si no existe
CREATE SCHEMA IF NOT EXISTS auth;

-- Eliminar la tabla si existe (para recrearla limpia)
DROP TABLE IF EXISTS auth.users CASCADE;

-- Crear la tabla auth.users
CREATE TABLE auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id uuid,
    aud varchar(255),
    role varchar(255),
    email varchar(255),
    encrypted_password varchar(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token varchar(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token varchar(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new varchar(255),
    email_change varchar(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone varchar(15),
    phone_confirmed_at timestamp with time zone,
    phone_change varchar(15),
    phone_change_token varchar(255),
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    email_change_token_current varchar(255),
    email_change_confirm_status smallint,
    banned_until timestamp with time zone,
    reauthentication_token varchar(255),
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false,
    deleted_at timestamp with time zone
);

-- Verificar que se creó
SELECT 'Tabla auth.users creada exitosamente!' AS mensaje;

