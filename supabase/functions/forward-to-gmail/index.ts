import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ForwardEmailRequest {
  emailId: string;
  to: string;
  from: string;
  subject: string;
  originalTo: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Audit IA <onboarding@resend.dev>";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const request: ForwardEmailRequest = await req.json();
    const { to, from, subject, originalTo } = request;

    const emailBody = `
Vous avez reçu un nouveau message :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

De: ${from}
À: ${originalTo.join(", ")}
Sujet: ${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ce message a été transféré automatiquement depuis votre système de réception d'emails Audit IA.

Pour répondre, veuillez utiliser l'adresse email d'origine : ${from}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Audit IA - Attijari Wafa Bank
Système de gestion automatisé
    `.trim();

    const emailPayload = {
      from: fromEmail,
      to: [to],
      subject: `[Transféré] ${subject}`,
      text: emailBody,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email forwarded successfully",
        resend_id: result.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error forwarding email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
