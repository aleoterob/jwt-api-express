-- Script completo para configurar la base de datos aprender-auth
-- Ejecutar TODO este script en pgAdmin o DBeaver conectado a la base de datos aprender-auth

-- ============================================
-- 1. CREAR SCHEMA AUTH
-- ============================================
CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================
-- 2. CREAR TABLA AUTH.USERS
-- ============================================
DROP TABLE IF EXISTS auth.users CASCADE;

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

-- ============================================
-- 3. CREAR TABLA PUBLIC.PROFILES
-- ============================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY NOT NULL,
    full_name text,
    email text,
    bio text,
    avatar_url text,
    status text DEFAULT 'active',
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================
-- 4. AGREGAR FOREIGN KEY
-- ============================================
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 5. CREAR FUNCIÓN PARA TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- 6. CREAR TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. VERIFICAR
-- ============================================
SELECT 'Base de datos configurada exitosamente!' AS mensaje;

SELECT 
    'auth.users' AS tabla,
    COUNT(*) AS columnas
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'

UNION ALL

SELECT 
    'public.profiles' AS tabla,
    COUNT(*) AS columnas
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';

