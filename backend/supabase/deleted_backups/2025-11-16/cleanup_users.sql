-- BACKUP of original file: cleanup_users.sql
-- Backed up on 2025-11-16 before deletion

-- ============================================
-- Script para eliminar usuarios de prueba
-- Mantiene solo: instructor@test.com y thesantiblocks@gmail.com
-- ============================================

-- PASO 1: Eliminar PRIMERO los perfiles (para evitar violación de foreign key)
DELETE FROM public.profiles
WHERE email IN (
  'lapulga7@gmail.com',
  'lapulga@gmail.com',
  'wolfgang@gmail.com',
  'prueba2024@gmail.com',
  'testing1@gmail.com',
  'testing2@gmail.com'
);

-- PASO 2: Eliminar los usuarios de autenticación
DELETE FROM auth.users
WHERE email IN (
  'lapulga7@gmail.com',
  'lapulga@gmail.com',
  'wolfgang@gmail.com',
  'prueba2024@gmail.com',
  'testing1@gmail.com',
  'testing2@gmail.com'
);

-- PASO 3: Verificar los usuarios que quedan (deberían ser solo 2)
SELECT 
  u.id, 
  u.email, 
  u.raw_user_meta_data->>'full_name' as full_name,
  p.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- RESULTADO ESPERADO:
-- Solo deben aparecer:
-- 1. instructor@test.com (role: instructor)
-- 2. thesantiblocks@gmail.com (role: student)
