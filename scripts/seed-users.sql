-- Script para crear 10 usuarios de prueba
-- Ejecutar en la base de datos aprender-auth
-- Requiere la extensión pgcrypto para encriptar contraseñas

-- Habilitar extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insertar usuarios en auth.users (el trigger creará automáticamente los perfiles)
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES
-- Usuario 1
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'juan.perez@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Juan Pérez"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 2
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'maria.garcia@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"María García"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 3
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'carlos.rodriguez@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Carlos Rodríguez"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 4
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'ana.martinez@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Martínez"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 5
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'luis.fernandez@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Luis Fernández"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 6
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'sofia.lopez@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sofía López"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 7
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'diego.gonzalez@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Diego González"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 8
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'laura.torres@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Laura Torres"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 9
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'pablo.morales@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Pablo Morales"}'::jsonb,
    NOW(),
    NOW()
),
-- Usuario 10
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'user',
    'user',
    'valentina.ruiz@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Valentina Ruiz"}'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Actualizar los perfiles creados automáticamente por el trigger con datos adicionales
UPDATE public.profiles p
SET 
    bio = CASE p.email
        WHEN 'juan.perez@example.com' THEN 'Desarrollador Full Stack con 5 años de experiencia en React y Node.js'
        WHEN 'maria.garcia@example.com' THEN 'Diseñadora UX/UI apasionada por crear experiencias increíbles'
        WHEN 'carlos.rodriguez@example.com' THEN 'DevOps Engineer especializado en cloud infrastructure y CI/CD'
        WHEN 'ana.martinez@example.com' THEN 'Product Manager con experiencia en startups tecnológicas'
        WHEN 'luis.fernandez@example.com' THEN 'Data Scientist enfocado en machine learning y análisis predictivo'
        WHEN 'sofia.lopez@example.com' THEN 'Frontend Developer experta en React, Vue y TypeScript'
        WHEN 'diego.gonzalez@example.com' THEN 'Backend Developer especializado en microservicios y APIs REST'
        WHEN 'laura.torres@example.com' THEN 'QA Engineer con experiencia en testing automatizado'
        WHEN 'pablo.morales@example.com' THEN 'Mobile Developer iOS y Android con Flutter y React Native'
        WHEN 'valentina.ruiz@example.com' THEN 'Cloud Architect especializada en AWS y arquitecturas serverless'
    END,
    avatar_url = CASE p.email
        WHEN 'juan.perez@example.com' THEN 'https://i.pravatar.cc/150?img=1'
        WHEN 'maria.garcia@example.com' THEN 'https://i.pravatar.cc/150?img=2'
        WHEN 'carlos.rodriguez@example.com' THEN 'https://i.pravatar.cc/150?img=3'
        WHEN 'ana.martinez@example.com' THEN 'https://i.pravatar.cc/150?img=4'
        WHEN 'luis.fernandez@example.com' THEN 'https://i.pravatar.cc/150?img=5'
        WHEN 'sofia.lopez@example.com' THEN 'https://i.pravatar.cc/150?img=6'
        WHEN 'diego.gonzalez@example.com' THEN 'https://i.pravatar.cc/150?img=7'
        WHEN 'laura.torres@example.com' THEN 'https://i.pravatar.cc/150?img=8'
        WHEN 'pablo.morales@example.com' THEN 'https://i.pravatar.cc/150?img=9'
        WHEN 'valentina.ruiz@example.com' THEN 'https://i.pravatar.cc/150?img=10'
    END,
    updated_at = NOW()
WHERE p.email IN (
    'juan.perez@example.com',
    'maria.garcia@example.com',
    'carlos.rodriguez@example.com',
    'ana.martinez@example.com',
    'luis.fernandez@example.com',
    'sofia.lopez@example.com',
    'diego.gonzalez@example.com',
    'laura.torres@example.com',
    'pablo.morales@example.com',
    'valentina.ruiz@example.com'
);

-- Verificar usuarios creados
SELECT 
    'Usuarios creados:' AS mensaje,
    COUNT(*) AS total_usuarios
FROM auth.users
WHERE email LIKE '%@example.com';

-- Verificar perfiles creados
SELECT 
    'Perfiles creados:' AS mensaje,
    COUNT(*) AS total_perfiles
FROM public.profiles
WHERE email LIKE '%@example.com';

-- Mostrar lista de usuarios creados
SELECT 
    u.id,
    u.email,
    p.full_name,
    p.bio,
    p.status,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@example.com'
ORDER BY u.created_at;

