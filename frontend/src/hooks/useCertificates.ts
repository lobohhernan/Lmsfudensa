import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { debug, error as logError, getErrorMessage } from '../lib/logger'
import { supabaseAdmin, isAdminClientConfigured } from "../lib/supabaseAdmin";

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  hash: string;
  issue_date: string;
  status: "active" | "voided" | "expired";
  pdf_url: string | null;
  pdf_generated: boolean;
  student_name: string;
  course_title: string;
  completion_date: string | null;
  grade: number | null;
  created_at: string;
  updated_at: string;
}

export function useCertificates(isAdmin: boolean = false) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCertificates([]);
        setLoading(false);
        return;
      }
      
      // Si es admin y el cliente admin está configurado, saltamos RLS y traemos todos
      let query;
      if (isAdmin && isAdminClientConfigured()) {
        query = supabaseAdmin
          .from("certificates")
          .select("*")
          .order("created_at", { ascending: false });
      } else {
        // Filtrar SOLO certificados del usuario actual
        query = supabase
          .from("certificates")
          .select("*")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setCertificates(data || []);
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      logError("Error fetching certificates:", message);
      setError(message || "Error al cargar certificados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let userId: string | null = null;

    const initializeAndSubscribe = async () => {
      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;

      if (!userId) return;

      // Fetch inicial
      await fetchCertificates();

      // Suscripción realtime — updates quirúrgicos sin refetch completo
      const channel = supabase
        .channel("certificates-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "certificates",
          },
          (payload) => {
            debug("Certificates realtime event:", payload.eventType);

            // Si no es admin, solo procesar si es del usuario actual
            const certificate = payload.new as Certificate | undefined;
            if (!isAdmin && certificate && certificate.student_id !== userId) {
              return; // Ignorar certificados de otros usuarios
            }

            if (payload.eventType === "INSERT") {
              setCertificates((prev) => [payload.new as Certificate, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new as Certificate;
              setCertificates((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              );
            } else if (payload.eventType === "DELETE") {
              const deleted = payload.old as Certificate;
              setCertificates((prev) => prev.filter((c) => c.id !== deleted.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    initializeAndSubscribe();
  }, []);

  return { certificates, loading, error, refetch: fetchCertificates };
}

export function useCertificatesRealtime() {
  return useCertificates(true);
}
