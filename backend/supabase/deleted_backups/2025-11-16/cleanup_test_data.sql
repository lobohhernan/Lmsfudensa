-- BACKUP of original file: cleanup_test_data.sql
-- Backed up on 2025-11-16 before deletion

-- SQL para limpiar datos de prueba (Juan Pérez)
-- Ejecutar esto en Supabase SQL Editor

-- Eliminar perfil de Juan Pérez de la tabla profiles
DELETE FROM public.profiles 
WHERE email = 'juan.perez@email.com' 
   OR full_name = 'Juan Pérez';

-- Verificar que se eliminó
SELECT * FROM public.profiles;
