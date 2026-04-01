import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

interface AdminSettingsRow {
  admin_email: string;
  notification_enabled: boolean;
}

async function sendEmailWithResend(
  to: string,
  subject: string,
  content: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Audit IA <onboarding@resend.dev>';

  const emailPayload = {
    from: fromEmail,
    to: [to],
    reply_to: replyTo || undefined,
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let adminSettings: AdminSettingsRow | null = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('admin_settings')
        .select('admin_email, notification_enabled')
        .limit(1)
        .maybeSingle();

      adminSettings = (data as AdminSettingsRow | null) ?? null;
    }

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

    if (adminSettings && adminSettings.notification_enabled === false) {
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: 'Admin notifications are disabled in admin_settings',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const adminEmail = adminSettings?.admin_email || Deno.env.get('ADMIN_EMAIL') || '';

    if (!adminEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Admin email not configured. Set admin_settings.admin_email or ADMIN_EMAIL.'
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

    const result = await sendEmailWithResend(adminEmail, subject, content, user_email);

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
        message: 'Admin notification sent successfully',
        recipient: adminEmail,
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
