-- ============================================================
-- MIGRACIÓN: Agregar campos de pago a tabla enrollments
-- ============================================================
-- Problema: El webhook intenta insertar user_email, payment_id y status
-- pero estos campos no existen en la tabla enrollments
-- Solución: Agregar estos campos

-- 1. Agregar columnas faltantes (si no existen)
ALTER TABLE IF EXISTS public.enrollments
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. Crear índice para payment_id (para búsquedas por pago)
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_id ON public.enrollments(payment_id);

-- 3. Crear índice para user_email (para búsquedas por email)
CREATE INDEX IF NOT EXISTS idx_enrollments_user_email ON public.enrollments(user_email);

-- ============================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================
COMMENT ON COLUMN public.enrollments.user_email IS 'Email del usuario que realizó el pago (usado cuando user_id es null)';
COMMENT ON COLUMN public.enrollments.payment_id IS 'ID del pago en Mercado Pago para rastrear transacciones';
COMMENT ON COLUMN public.enrollments.status IS 'Estado de la inscripción: active, completed, cancelled, etc.';
