import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { debug, error as logError } from '../lib/logger'

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

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setCertificates(data || []);
    } catch (err: any) {
      logError("Error fetching certificates:", err);
      setError(err.message || "Error al cargar certificados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();

    // Suscripción realtime
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
          debug("Certificates realtime event:", payload);
          fetchCertificates(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { certificates, loading, error, refetch: fetchCertificates };
}

export function useCertificatesRealtime() {
  return useCertificates();
}
