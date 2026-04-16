import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, cache-control, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Supabase Admin API credentials from environment
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

// Frontend URL for redirect
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://fudensa.pages.dev";

interface ResetEmailRequest {
  email: string;
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  htmlContent: string
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "FUDENSA Seguridad <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY no configurada");
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
    }

    const { email }: ResetEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email requerido" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Supabase Admin client
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate recovery link using Supabase Admin API
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${FRONTEND_URL}/#/reset-password`,
      },
    });

    if (error || !data) {
      console.error("Supabase admin error:", error);
      // Don't reveal if user exists or not (security)
      return new Response(
        JSON.stringify({
          success: true,
          message: "Si el email existe, recibirás un link de recuperación",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const resetLink = data.properties?.action_link;

    if (!resetLink) {
      throw new Error("No reset link generated");
    }

    // Prepare email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #1e467c 0%, #2c5a9e 100%); padding: 24px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🔐 Recupera tu Contraseña</h1>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Recibimos una solicitud para cambiar la contraseña de tu cuenta FUDENSA.
          </p>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Haz clic en el botón a continuación para establecer una nueva contraseña:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Cambiar Contraseña
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
            O copia y pega este link en tu navegador:<br>
            <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; word-break: break-all;">${resetLink}</code>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 10px 0;">
            ⏰ Este link expirará en 1 hora.<br>
            Si no solicitaste este cambio, puedes ignorar este email.
          </p>
        </div>

        <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© FUDENSA - Plataforma de Educación en Línea</p>
          <p style="margin: 0;">
            <a href="https://fudensa.pages.dev" style="color: #1e467c; text-decoration: none;">fudensa.pages.dev</a>
          </p>
        </div>
      </div>
    `;

    // Send email
    await sendEmailViaResend(
      email,
      "Recupera tu contraseña - FUDENSA",
      emailHtml
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Si el email existe en nuestra base de datos, recibirás un link de recuperación",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-reset-email:", errorMessage);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Si el email existe, recibirás un link de recuperación",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
