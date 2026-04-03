import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";
import { corsHeaders } from "./cors.ts";

interface ToggleActiveRequest {
  action: "toggle_active";
  data: {
    type: "course" | "user" | "teacher";
    id: string;
    is_active: boolean;
  };
}

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isToggleRequest(body: unknown): body is ToggleActiveRequest {
  if (!body || typeof body !== "object") return false;

  const candidate = body as Record<string, unknown>;
  if (candidate.action !== "toggle_active") return false;

  const data = candidate.data as Record<string, unknown> | undefined;
  if (!data) return false;

  const validType = data.type === "course" || data.type === "user" || data.type === "teacher";
  return validType && typeof data.id === "string" && typeof data.is_active === "boolean";
}

export async function handleAdminToggleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: "Missing Supabase environment variables" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return jsonResponse({ error: "Admin access required" }, 403);
    }

    const body = await req.json();
    if (!isToggleRequest(body)) {
      return jsonResponse({ error: "Unsupported action. Only toggle_active is enabled in this function." }, 400);
    }

    const { type, id, is_active } = body.data;
    const updated_at = new Date().toISOString();

    if (type === "course") {
      const { error } = await supabaseAdmin
        .from("courses")
        .update({ is_active, updated_at })
        .eq("id", id);
      if (error) throw error;
    }

    if (type === "teacher") {
      const { error } = await supabaseAdmin
        .from("teachers")
        .update({ is_active, updated_at })
        .eq("id", id);
      if (error) throw error;
    }

    if (type === "user") {
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_active, updated_at })
        .eq("id", id);

      if (profileUpdateError) throw profileUpdateError;

      const { error: teacherUpdateError } = await supabaseAdmin
        .from("teachers")
        .update({ is_active, updated_at })
        .eq("user_id", id);

      if (teacherUpdateError) throw teacherUpdateError;
    }

    return jsonResponse({
      success: true,
      action: "toggle_active",
      type,
      id,
      is_active,
      updated_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ [Admin Toggle] Error:", message);
    return jsonResponse({ error: message || "Internal server error" }, 500);
  }
}
