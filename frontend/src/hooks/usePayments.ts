import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Payment, PaymentStatus } from "@/lib/types";

export interface PaymentRow extends Payment {
  /** Nombre visible del usuario (de profiles join o payer_name) */
  displayName: string;
  /** Email visible (de profiles join o payer_email) */
  displayEmail: string;
  /** Título del curso */
  courseTitle: string;
}

interface UsePaymentsReturn {
  payments: PaymentRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePayments(): UsePaymentsReturn {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Pagos reales de la tabla payments ──────────────────────────────
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          profiles:user_id ( full_name, email ),
          courses:course_id ( title, price )
        `)
        .order("created_at", { ascending: false });

      if (paymentsError) {
        // La tabla puede no existir todavía si la migración no se ha aplicado
        if (paymentsError.code === "42P01") {
          console.warn("⚠️ [usePayments] Tabla payments aún no existe. Mostrando solo enrollments legacy.");
        } else {
          throw paymentsError;
        }
      }

      const realPayments: PaymentRow[] = (paymentsData || []).map((p: any) => ({
        ...p,
        amount: Number(p.amount) || 0,
        courses: p.courses ?? null,
        profiles: p.profiles ?? null,
        displayName:
          p.profiles?.full_name || p.payer_name || "Sin nombre",
        displayEmail:
          p.profiles?.email || p.payer_email || "—",
        courseTitle: p.courses?.title || "Curso desconocido",
      }));

      // IDs de user+course que ya tienen un registro en payments
      const coveredSet = new Set(
        realPayments.map((p) => `${p.user_id}::${p.course_id}`)
      );

      // ── 2. Enrollments legacy (sin fila en payments) ──────────────────────
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          user_id,
          course_id,
          enrolled_at,
          profiles:user_id ( full_name, email ),
          courses:course_id ( title, price )
        `)
        .order("enrolled_at", { ascending: false });

      if (enrollmentsError) {
        console.warn("⚠️ [usePayments] Error cargando enrollments:", enrollmentsError.message);
      }

      const legacyPayments: PaymentRow[] = (enrollmentsData || [])
        .filter((e: any) => !coveredSet.has(`${e.user_id}::${e.course_id}`))
        .map((e: any) => ({
          id: `legacy-${e.id}`,
          user_id: e.user_id,
          course_id: e.course_id,
          mp_payment_id: null,
          mp_preference_id: null,
          status: "legacy" as PaymentStatus,
          amount: Number(e.courses?.price) || 0,
          currency: "ARS",
          payer_email: e.profiles?.email || null,
          payer_name: e.profiles?.full_name || null,
          payment_method: null,
          created_at: e.enrolled_at,
          updated_at: e.enrolled_at,
          profiles: e.profiles ?? null,
          courses: e.courses ?? null,
          displayName: e.profiles?.full_name || "Sin nombre",
          displayEmail: e.profiles?.email || "—",
          courseTitle: e.courses?.title || "Curso desconocido",
        }));

      // ── 3. Unificar y ordenar por fecha descendente ───────────────────────
      const all = [...realPayments, ...legacyPayments].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPayments(all);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ [usePayments]", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refetch: fetchPayments };
}
