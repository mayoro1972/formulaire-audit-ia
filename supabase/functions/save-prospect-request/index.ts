import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ProspectStatus = 'new' | 'contact_scheduled' | 'audit_pending' | 'audit_sent' | 'closed';

interface ProspectRequestPayload {
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  activitySector: string;
  needDescription: string;
}

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
  status: ProspectStatus;
  source: string;
  created_at: string;
  updated_at: string;
  follow_up_due_at: string;
  audit_form_sent_at: string | null;
  last_contacted_at: string | null;
  notes: string;
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function buildProspectCode() {
  const now = new Date();
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `PROS-${datePart}-${randomPart}`;
}

async function sendAdminNotification(
  supabase: ReturnType<typeof createClient>,
  row: ProspectRequestRow,
) {
  const adminEmail = (await supabase
    .from('admin_settings')
    .select('admin_email, notification_enabled')
    .limit(1)
    .maybeSingle()).data;

  if (!adminEmail?.notification_enabled || !adminEmail?.admin_email) {
    return { success: false, error: 'Admin email not configured or notifications disabled' };
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Audit IA <onboarding@resend.dev>';
  const subject = `Nouveau prospect audit IA - ${row.full_name}`;
  const text = `Bonjour,

Une nouvelle demande d’échange expert a été reçue sur le site.

- Code prospect : ${row.prospect_code}
- Nom complet : ${row.full_name}
- Profession : ${row.profession}
- Email : ${row.email}
- Téléphone : ${row.phone}
- Ville : ${row.city}
- Pays : ${row.country}
- Secteur : ${row.activity_sector}
- Suivi avant : ${new Date(row.follow_up_due_at).toLocaleString('fr-FR')}

Besoin exprimé :
${row.need_description}

Le prospect est maintenant visible dans le dashboard admin.
`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [adminEmail.admin_email],
      reply_to: row.email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    return { success: false, error: result?.message || 'Unable to send admin notification' };
  }

  return { success: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json() as ProspectRequestPayload;
    const fullName = normalizeText(payload.fullName);
    const profession = normalizeText(payload.profession);
    const email = normalizeEmail(payload.email);
    const phone = normalizeText(payload.phone);
    const city = normalizeText(payload.city);
    const country = normalizeText(payload.country);
    const activitySector = normalizeText(payload.activitySector);
    const needDescription = normalizeText(payload.needDescription);

    if (!fullName || !profession || !email || !phone || !city || !country || !activitySector || !needDescription) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs obligatoires doivent être renseignés.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase service role is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: existing } = await supabase
      .from('prospect_requests')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    const now = new Date();
    const followUpDueAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

    const payloadToStore = {
      prospect_code: existing?.prospect_code || buildProspectCode(),
      full_name: fullName,
      profession,
      email,
      phone,
      city,
      country,
      activity_sector: activitySector,
      need_description: needDescription,
      status: existing?.status === 'audit_sent' ? 'audit_sent' : 'new',
      source: 'site_public',
      follow_up_due_at: followUpDueAt,
      last_contacted_at: existing?.last_contacted_at || null,
      audit_form_sent_at: existing?.audit_form_sent_at || null,
      notes: existing?.notes || '',
    };

    const query = existing
      ? supabase.from('prospect_requests').update(payloadToStore).eq('id', existing.id).select().single()
      : supabase.from('prospect_requests').insert(payloadToStore).select().single();

    const { data, error } = await query;

    if (error || !data) {
      throw error || new Error('Unable to save prospect request');
    }

    const notificationResult = await sendAdminNotification(supabase, data as ProspectRequestRow);

    return new Response(
      JSON.stringify({
        success: true,
        prospect: data,
        notification: notificationResult,
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
