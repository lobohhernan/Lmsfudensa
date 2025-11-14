// Service for sending emails via Supabase Edge Function
export async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  htmlContent: string,
  fromEmail?: string,
  fromName?: string,
  replyTo?: string
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration not found");
  }

  const functionUrl = `${supabaseUrl}/functions/v1/send_contact_email`;

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      name: "", // Will be extracted from email context
      email: to,
      phone: "",
      subject: subject,
      message: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Email service error: ${response.status} - ${errorData}`);
  }

  return response;
}

