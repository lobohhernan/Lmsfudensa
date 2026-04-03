import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, cache-control, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Destinatario fijo para los mensajes de contacto
const CONTACT_RECIPIENT = "masseymaxi25@gmail.com";

// API Key de Resend - se carga desde Supabase Secrets (nunca hardcodear)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const SUBJECT_LABELS: Record<string, string> = {
  general: "Consulta General",
  cursos: "Información sobre Cursos",
  certificacion: "Certificaciones",
  pagos: "Pagos y Facturación",
  tecnico: "Soporte Técnico",
  corporativo: "Planes Corporativos",
};

interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  htmlContent: string,
  replyTo?: string
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "FUDENSA Contacto <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
      reply_to: replyTo,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;

  return responseData;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY no configurada en Supabase Secrets");
    }

    const contactMessage: ContactMessage = await req.json();
    const subjectLabel = SUBJECT_LABELS[contactMessage.subject] || contactMessage.subject;

    // Prepare email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e467c; margin-bottom: 20px;">📬 Nuevo Mensaje de Contacto - FUDENSA</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Nombre:</td><td style="padding: 8px 0; color: #4b5563;">${contactMessage.name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0; color: #4b5563;"><a href="mailto:${contactMessage.email}" style="color: #1e467c;">${contactMessage.email}</a></td></tr>
          ${contactMessage.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Teléfono:</td><td style="padding: 8px 0; color: #4b5563;">${contactMessage.phone}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Asunto:</td><td style="padding: 8px 0; color: #4b5563;">${subjectLabel}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3 style="color: #374151; margin-bottom: 10px;">Mensaje:</h3>
        <p style="color: #4b5563; line-height: 1.7; white-space: pre-wrap;">${contactMessage.message}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Recibido: ${new Date().toLocaleString("es-AR")} • <a href="https://fudensa.pages.dev" style="color: #1e467c;">fudensa.pages.dev</a></p>
      </div>
    `;

    await sendEmailViaResend(
      CONTACT_RECIPIENT,
      `[FUDENSA Contacto] ${subjectLabel} - ${contactMessage.name}`,
      emailHtml,
      contactMessage.email
    );

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado correctamente" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error sending email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

