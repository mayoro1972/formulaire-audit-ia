import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  invitee_name: string;
  invitee_email: string;
  invite_link: string;
  has_prefilled_draft?: boolean;
  custom_message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { invitee_name, invitee_email, invite_link, has_prefilled_draft, custom_message } = body;

    if (!invitee_name || !invitee_email || !invite_link) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Audit IA <onboarding@resend.dev>';
    const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID');
    const EMAILJS_TEMPLATE_ID = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY');

    const customMessageBlock = custom_message ? `${custom_message}\n\n` : '';
    const prefilledDraftNotice = has_prefilled_draft
      ? "Un premier brouillon a déjà été préparé pour vous. Vous pourrez l'ouvrir, le compléter et le corriger si nécessaire.\n\n"
      : '';

    const emailBody = `Bonjour ${invitee_name},

Vous êtes invité à compléter le formulaire d'audit IA. Veuillez cliquer sur le lien ci-dessous pour commencer :

${invite_link}

${customMessageBlock}${prefilledDraftNotice}Le formulaire :
- Se sauvegarde automatiquement toutes les 30 secondes
- Peut être rempli en plusieurs fois
- Prend environ 30-45 minutes à compléter
- Comporte 9 sections principales + récapitulatif

Instructions :
1. Cliquez sur le lien ci-dessus
2. Remplissez les sections dans l'ordre ou selon vos préférences
3. Vos réponses sont automatiquement sauvegardées
4. Une fois terminé, allez à la section "Envoi & récapitulatif"
5. Cliquez sur "Envoyer" pour transmettre vos réponses

Cordialement`;
    let resendError: string | null = null;

    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [invitee_email],
          subject: "Formulaire d'Audit IA - À compléter",
          text: emailBody,
        }),
      });

      const resendData = await resendResponse.json();

      if (resendResponse.ok) {
        return new Response(
          JSON.stringify({
            success: true,
            message: `Email sent to ${invitee_email}`,
            provider: 'resend',
            resend_id: resendData.id
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      resendError = resendData?.message || JSON.stringify(resendData);
      console.error('Resend API error:', resendData);
    }

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: invitee_email,
            to_name: invitee_name,
            invite_link,
            message: emailBody,
            custom_message: custom_message || '',
            prefilled_draft_notice: prefilledDraftNotice.trim(),
            has_prefilled_draft: has_prefilled_draft ? 'true' : 'false',
          },
        }),
      });

      if (emailjsResponse.ok) {
        return new Response(
          JSON.stringify({
            success: true,
            message: `Email sent to ${invitee_email}`,
            provider: 'emailjs',
            fallback_from: resendError ? 'resend' : null,
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const emailJsError = await emailjsResponse.text();
      return new Response(
        JSON.stringify({
          error: 'Failed to send invitation email',
          details: {
            resend: resendError,
            emailjs: emailJsError,
          }
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

    return new Response(
      JSON.stringify({
        error: 'No email provider is configured for invitations',
        details: {
          resend: resendError,
          emailjs: 'EMAILJS credentials not configured',
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-invitation-email:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
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
