// Supabase Edge Function (Deno) - verify-certificate
// Esta función usa la SERVICE_ROLE_KEY para consultar sólo campos públicos
// y devolverlos al cliente. No expone claves en el frontend.

import { serve } from "https://deno.land/std@0.213.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL o SERVICE_ROLE_KEY no configurados en el entorno");
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const hash = (url.searchParams.get("hash") || "").trim();

    if (!hash) {
      return new Response(JSON.stringify({ error: "hash required" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    if (hash.length > 256) {
      return new Response(JSON.stringify({ error: "hash too long" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    // Construir consulta al endpoint REST de Supabase (PostgREST)
    // SELECT hash, student_name, course_title, issue_date, status, completion_date
    const restUrl = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/certificates?select=hash,student_name,course_title,issue_date,status,completion_date&hash=eq.${encodeURIComponent(hash)}&status=eq.active&limit=1`;

    const res = await fetch(restUrl, {
      headers: {
        // `apikey` es requerido para algunas configuraciones de Supabase REST
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      // Devolver 404 si no existe o 500 si hubo error en Supabase
      if (res.status === 404 || res.status === 204) {
        return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
      }
      const text = await res.text();
      console.error("Error from supabase REST:", res.status, text);
      return new Response(JSON.stringify({ error: "upstream_error" }), { status: 502, headers: { "content-type": "application/json" } });
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    const certificate = data[0];

    // Devolver sólo campos públicos
    return new Response(JSON.stringify({ certificate }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
