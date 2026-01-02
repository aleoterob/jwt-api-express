-- Script simple para crear la tabla profiles
-- Ejecutar en la base de datos aprender-auth

-- Asegurarse de estar en el schema public
SET search_path TO public;

-- Eliminar la tabla si existe (para recrearla limpia)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Crear la tabla profiles
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

-- Crear índice en email
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Verificar que se creó
SELECT 'Tabla profiles creada exitosamente!' AS mensaje;
SELECT COUNT(*) AS total_tablas FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

