-- Script para cambiar el role default a 'user' y actualizar usuarios existentes
-- Ejecutar en la base de datos aprender-auth

-- ============================================
-- 1. ACTUALIZAR USUARIOS EXISTENTES
-- ============================================
-- Cambiar todos los usuarios con role 'authenticated' a 'user'
UPDATE auth.users
SET role = 'user'
WHERE role = 'authenticated';

-- Verificar cuántos usuarios se actualizaron
SELECT 
    'Usuarios actualizados:' AS mensaje,
    COUNT(*) AS total_actualizados
FROM auth.users
WHERE role = 'user';

-- ============================================
-- 2. CAMBIAR EL DEFAULT DEL CAMPO ROLE
-- ============================================
-- Primero eliminar el default actual (si existe)
ALTER TABLE auth.users 
ALTER COLUMN role DROP DEFAULT;

-- Establecer el nuevo default como 'user'
ALTER TABLE auth.users 
ALTER COLUMN role SET DEFAULT 'user';

-- ============================================
-- 3. VERIFICAR
-- ============================================
-- Ver el default actual del campo role
SELECT 
    column_name,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_schema = 'auth' 
  AND table_name = 'users' 
  AND column_name = 'role';

-- Mostrar distribución de roles
SELECT 
    role,
    COUNT(*) AS cantidad_usuarios
FROM auth.users
GROUP BY role
ORDER BY role;

-- Mostrar lista de usuarios con sus roles
SELECT 
    id,
    email,
    role,
    created_at
FROM auth.users
ORDER BY created_at;

