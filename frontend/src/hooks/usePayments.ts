import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabaseAdmin";
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

    // Usar admin client para bypassear RLS y ver todos los pagos/enrollments
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    try {
      // ── Helper: obtener perfiles por IDs ──────────────────────────────────
      const fetchProfilesMap = async (userIds: string[]) => {
        const unique = [...new Set(userIds.filter(Boolean))];
        if (unique.length === 0) return new Map<string, { full_name: string | null; email: string | null }>();
        const { data } = await client
          .from("profiles")
          .select("id, full_name, email")
          .in("id", unique);
        const map = new Map<string, { full_name: string | null; email: string | null }>();
        (data || []).forEach((p: any) => map.set(p.id, { full_name: p.full_name, email: p.email }));
        return map;
      };

      // ── Helper: obtener cursos por IDs ────────────────────────────────────
      const fetchCoursesMap = async (courseIds: string[]) => {
        const unique = [...new Set(courseIds.filter(Boolean))];
        if (unique.length === 0) return new Map<string, { title: string; price: number | null }>();
        const { data } = await client
          .from("courses")
          .select("id, title, price")
          .in("id", unique);
        const map = new Map<string, { title: string; price: number | null }>();
        (data || []).forEach((c: any) => map.set(c.id, { title: c.title, price: c.price }));
        return map;
      };

      // ── 1. Pagos reales de la tabla payments (sin joins embebidos) ────────
      let paymentsData: any[] = [];
      const { data: rawPayments, error: paymentsError } = await client
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) {
        console.warn("⚠️ [usePayments] Error tabla payments:", paymentsError.message || paymentsError.code);
      } else {
        paymentsData = rawPayments || [];
      }

      // ── 2. Enrollments (sin joins embebidos) ──────────────────────────────
      let enrollmentsData: any[] = [];
      const { data: rawEnrollments, error: enrollmentsError } = await client
        .from("enrollments")
        .select("id, user_id, course_id, enrolled_at")
        .order("enrolled_at", { ascending: false });

      if (enrollmentsError) {
        console.warn("⚠️ [usePayments] Error tabla enrollments:", enrollmentsError.message || enrollmentsError.code);
      } else {
        enrollmentsData = rawEnrollments || [];
      }

      // ── 3. Traer perfiles y cursos referenciados en una sola consulta cada uno
      const allUserIds = [
        ...paymentsData.map((p: any) => p.user_id),
        ...enrollmentsData.map((e: any) => e.user_id),
      ];
      const allCourseIds = [
        ...paymentsData.map((p: any) => p.course_id),
        ...enrollmentsData.map((e: any) => e.course_id),
      ];

      const [profilesMap, coursesMap] = await Promise.all([
        fetchProfilesMap(allUserIds),
        fetchCoursesMap(allCourseIds),
      ]);

      // ── 4. Mapear payments reales ─────────────────────────────────────────
      const realPayments: PaymentRow[] = paymentsData.map((p: any) => {
        const profile = profilesMap.get(p.user_id);
        const course = coursesMap.get(p.course_id);
        return {
          ...p,
          amount: Number(p.amount) || 0,
          courses: course ? { title: course.title, price: course.price } : null,
          profiles: profile ?? null,
          displayName: profile?.full_name || p.payer_name || "Sin nombre",
          displayEmail: profile?.email || p.payer_email || "—",
          courseTitle: course?.title || "Curso desconocido",
        };
      });

      // IDs de user+course que ya tienen un registro en payments
      const coveredSet = new Set(
        realPayments.map((p) => `${p.user_id}::${p.course_id}`)
      );

      // ── 5. Mapear enrollments legacy (los que no tienen fila en payments) ─
      const legacyPayments: PaymentRow[] = enrollmentsData
        .filter((e: any) => !coveredSet.has(`${e.user_id}::${e.course_id}`))
        .map((e: any) => {
          const profile = profilesMap.get(e.user_id);
          const course = coursesMap.get(e.course_id);
          return {
            id: `legacy-${e.id}`,
            user_id: e.user_id,
            course_id: e.course_id,
            mp_payment_id: null,
            mp_preference_id: null,
            status: "legacy" as PaymentStatus,
            amount: Number(course?.price) || 0,
            currency: "ARS",
            payer_email: profile?.email || null,
            payer_name: profile?.full_name || null,
            payment_method: null,
            created_at: e.enrolled_at,
            updated_at: e.enrolled_at,
            profiles: profile ?? null,
            courses: course ? { title: course.title, price: course.price } : null,
            displayName: profile?.full_name || "Sin nombre",
            displayEmail: profile?.email || "—",
            courseTitle: course?.title || "Curso desconocido",
          };
        });

      // ── 3. Unificar y ordenar por fecha descendente ───────────────────────
      const all = [...realPayments, ...legacyPayments].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPayments(all);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : (err as any)?.message || JSON.stringify(err);
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
