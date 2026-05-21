import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DEFAULT_FORM_DESTINATION_EMAIL = "contact@transferai.ci";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ProspectStatus = 'new' | 'contact_scheduled' | 'audit_pending' | 'audit_sent' | 'closed';

interface ProspectRequestRow {
  id: string;
  prospect_code: string;
  full_name: string;
  profession: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  activity_sector: string;
  need_description: string;
  wants_expert_call: boolean;
  status: ProspectStatus;
  follow_up_due_at: string;
  audit_form_sent_at: string | null;
}

function generateInviteToken() {
  return `invite_${crypto.randomUUID().replace(/-/g, '')}`;
}

function buildInviteUrl(inviteToken: string) {
  const publicAuditAppUrl = Deno.env.get('PUBLIC_AUDIT_APP_URL');

  if (!publicAuditAppUrl) {
    throw new Error('PUBLIC_AUDIT_APP_URL is not configured');
  }

  const url = new URL(publicAuditAppUrl);
  url.searchParams.set('invite', inviteToken);
  return url.toString();
}

async function sendAuditInvitationEmail(prospect: ProspectRequestRow, inviteLink: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Audit IA <onboarding@resend.dev>';
  const subject = "Votre formulaire d'Audit IA est prêt";
  const text = `Bonjour ${prospect.full_name},

Nous accusons réception de votre demande d’audit IA.

Comme convenu, voici le lien pour remplir votre formulaire d’audit :
${inviteLink}

Avant de commencer, vous pourrez toujours échanger avec notre expert si vous souhaitez cadrer le besoin plus finement.

Le formulaire :
- se sauvegarde automatiquement
- peut être rempli en plusieurs fois
- prend environ 30 à 45 minutes

Si besoin, répondez simplement à ce message.

Cordialement,
Transfer AI`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [prospect.email],
      reply_to: DEFAULT_FORM_DESTINATION_EMAIL,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    return { success: false, error: result?.message || 'Unable to send audit invitation' };
  }

  return { success: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase service role is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const nowIso = new Date().toISOString();

    const { data: prospects, error } = await supabase
      .from('prospect_requests')
      .select('*')
      .in('status', ['new', 'contact_scheduled', 'audit_pending'])
      .eq('wants_expert_call', true)
      .is('audit_form_sent_at', null)
      .lte('follow_up_due_at', nowIso);

    if (error) {
      throw error;
    }

    const processed: Array<{ prospect_code: string; email: string; invite_link?: string; error?: string }> = [];

    for (const rawProspect of (prospects || []) as ProspectRequestRow[]) {
      try {
        const inviteToken = generateInviteToken();
        const inviteLink = buildInviteUrl(inviteToken);

        const { error: invitationError } = await supabase.from('form_invitations').insert({
          invitee_name: rawProspect.full_name,
          invitee_email: rawProspect.email,
          invite_token: inviteToken,
          created_by: 'prospect_followup',
          response_email: DEFAULT_FORM_DESTINATION_EMAIL,
          response_cc: '',
          draft_form_data: {},
        });

        if (invitationError) {
          throw invitationError;
        }

        const sendResult = await sendAuditInvitationEmail(rawProspect, inviteLink);
        if (!sendResult.success) {
          throw new Error(sendResult.error || 'Unable to send audit invitation');
        }

        await supabase
          .from('prospect_requests')
          .update({
            status: 'audit_sent',
            audit_form_sent_at: new Date().toISOString(),
            last_contacted_at: new Date().toISOString(),
          })
          .eq('id', rawProspect.id);

        processed.push({
          prospect_code: rawProspect.prospect_code,
          email: rawProspect.email,
          invite_link: inviteLink,
        });
      } catch (prospectError) {
        processed.push({
          prospect_code: rawProspect.prospect_code,
          email: rawProspect.email,
          error: prospectError instanceof Error ? prospectError.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount: processed.length,
        processed,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
