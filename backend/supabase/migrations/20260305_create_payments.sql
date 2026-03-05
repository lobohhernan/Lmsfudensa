-- ============================================================
-- TABLA: payments
-- Registra cada transacción de MercadoPago con todos sus datos.
-- Los enrollments históricos sin payment_id son pagos "legacy".
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id          UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  mp_payment_id      TEXT UNIQUE,                    -- ID de pago en MercadoPago (null en legacy)
  mp_preference_id   TEXT,                           -- ID de preferencia MP
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved','pending','rejected','cancelled','legacy')),
  amount             DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'ARS',
  payer_email        TEXT,
  payer_name         TEXT,
  payment_method     TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes del admin panel
CREATE INDEX IF NOT EXISTS idx_payments_user_id    ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id  ON public.payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_payments_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins: acceso total
CREATE POLICY "Admin full access payments"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Usuarios: solo pueden ver sus propios pagos
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
