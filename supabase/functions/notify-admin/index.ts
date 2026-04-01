import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  user_name: string;
  user_email: string;
  user_position: string;
  completion_percentage: number;
  response_id: string;
}

async function sendEmailWithResend(
  to: string,
  subject: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const emailPayload = {
    from: 'Audit IA <onboarding@resend.dev>',
    to: [to],
    subject: subject,
    text: content,
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Email sending failed' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { user_name, user_email, user_position, completion_percentage, response_id } = payload;

    const subject = `Nouveau formulaire reçu - ${user_name}`;

    const content = `Bonjour,

Un nouveau formulaire d'audit IA a été soumis :

Informations du répondant :
- Nom : ${user_name}
- Email : ${user_email}
- Poste : ${user_position}
- Complétion : ${completion_percentage}%

ID de réponse : ${response_id}

Vous pouvez consulter cette réponse dans le tableau de bord admin.

Cordialement,
Système d'audit IA`;

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || '';

    if (!adminEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Admin email not configured. Please set ADMIN_EMAIL environment variable.'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await sendEmailWithResend(adminEmail, subject, content);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin notification sent successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
