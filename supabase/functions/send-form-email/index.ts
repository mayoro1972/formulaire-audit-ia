import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "npm:docx@8";
import { jsPDF } from "npm:jspdf@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FormData {
  c_nom: string;
  c_email: string;
  c_poste: string;
  c_entite: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface RequestBody {
  formData: FormData;
  inviteToken?: string;
  email_msg?: string;
  format: 'pdf' | 'word' | 'csv';
  responseId?: string;
}

function getTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function generateCSV(formData: FormData): string {
  const rows: string[][] = [
    ['Section', 'Champ', 'Valeur'],
    ['Informations personnelles', 'Nom', formData.c_nom || ''],
    ['Informations personnelles', 'Email', formData.c_email || ''],
    ['Informations personnelles', 'Poste', formData.c_poste || ''],
    ['Informations personnelles', 'Entité', formData.c_entite || ''],
    ['', '', ''],
    ['Charge hebdomadaire', 'Emails/jour', formData.a_emails || ''],
    ['Charge hebdomadaire', 'Réunions/semaine', formData.a_reunions || ''],
    ['Charge hebdomadaire', 'Rapports/mois', formData.a_rapports || ''],
    ['Charge hebdomadaire', 'Sources réglementaires/sem', formData.a_sources || ''],
    ['Charge hebdomadaire', 'Heures perdues/sem', formData.a_perdues || ''],
    ['', '', ''],
    ['Priorités IA', 'Priorité 1', formData.c_prio1 || ''],
    ['Priorités IA', 'Priorité 2', formData.c_prio2 || ''],
    ['Priorités IA', 'Priorité 3', formData.c_prio3 || ''],
    ['Priorités IA', 'Attentes IA', formData.c_attentes || ''],
    ['Priorités IA', 'À exclure', formData.c_exclure || ''],
    ['Priorités IA', 'Inexactitudes', formData.c_inexact || ''],
    ['', '', ''],
    ['Profil Early Adopter', 'Score numérique', formData.sc1 || ''],
    ['Profil Early Adopter', 'Score BI/Excel', formData.sc2 || ''],
    ['Profil Early Adopter', 'Score IA actuelle', formData.sc3 || ''],
    ['Profil Early Adopter', 'Score adoption', formData.sc4 || ''],
    ['Profil Early Adopter', 'Score ouverture', formData.sc5 || ''],
    ['Profil Early Adopter', 'Outils IA utilisés', formData.d_outils || ''],
    ['Profil Early Adopter', 'Points positifs', formData.d_plus || ''],
    ['Profil Early Adopter', 'Points négatifs', formData.d_moins || ''],
    ['', '', ''],
    ['Journal de bord', 'Matin', formData.f_matin || ''],
    ['Journal de bord', 'Matinée', formData.f_matinee || ''],
    ['Journal de bord', 'Après-midi', formData.f_apm || ''],
    ['Journal de bord', 'Fin de journée', formData.f_soir || ''],
    ['Journal de bord', 'Lundi', formData.f_lundi || ''],
    ['Journal de bord', 'Vendredi', formData.f_vendredi || ''],
    ['Journal de bord', 'Mensuel', formData.f_mois || ''],
    ['Journal de bord', 'Trimestriel', formData.f_trim || ''],
    ['Journal de bord', 'Annuel', formData.f_annuel || ''],
    ['Journal de bord', 'Déplacements', formData.f_deplac || ''],
    ['', '', ''],
    ['Points de douleur', 'Doublons', formData.g_doublons || ''],
    ['Points de douleur', 'Hors heures', formData.g_nuit || ''],
  ];

  for (let i = 1; i <= 5; i++) {
    const desc = formData[`irr${i}_desc`];
    if (getTrimmedString(desc)) {
      rows.push(['Points de douleur', `Irritant ${i}`, getTrimmedString(desc)]);
      rows.push(['Points de douleur', `Temps ${i}`, formData[`irr${i}_t`] || '']);
      rows.push(['Points de douleur', `Solutions ${i}`, formData[`irr${i}_s`] || '']);
    }
  }

  rows.push(['', '', '']);
  rows.push(['Vision IA', 'Tâche prioritaire 6 mois', formData.h_une || '']);
  rows.push(['Vision IA', 'Pourquoi', formData.h_pourquoi || '']);
  rows.push(['Vision IA', 'Vision 18 mois', formData.h_vision || '']);
  rows.push(['Vision IA', 'Déléguées à l\'IA', formData.h_delegate || '']);
  rows.push(['Vision IA', 'Expertise humaine', formData.h_humain || '']);
  rows.push(['Vision IA', 'Déploiement AWA', formData.h_awa || '']);
  rows.push(['Vision IA', 'KPIs succès', formData.h_kpi || '']);
  rows.push(['', '', '']);
  rows.push(['Contraintes', 'Confidentialité', formData.i_conf || '']);
  rows.push(['Contraintes', 'Hébergement', formData.i_heberg || '']);
  rows.push(['Contraintes', 'Approbations', formData.i_appro || '']);
  rows.push(['Contraintes', 'Systèmes', formData.i_sys || '']);
  rows.push(['Contraintes', 'Calendaire', formData.i_cal || '']);
  rows.push(['Contraintes', 'Politique IA groupe', formData.i_pol || '']);
  rows.push(['Contraintes', 'Autres', formData.i_autres || '']);

  return rows.map(row =>
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function generatePlainText(formData: FormData): string {
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  let text = `=== AUDIT IA — FICHE PERSONNELLE ===\n`;
  text += `Répondant : ${formData.c_nom || '—'}\n`;
  text += `Email : ${formData.c_email || '—'}\n`;
  text += `Poste : ${formData.c_poste || '—'}\n`;
  text += `Entité : ${formData.c_entite || '—'}\n`;
  text += `Date : ${date}\n\n`;

  text += `── A. CHARGE HEBDOMADAIRE ──\n`;
  text += `Emails/jour : ${formData.a_emails || '—'}\n`;
  text += `Réunions/sem : ${formData.a_reunions || '—'}\n`;
  text += `Rapports/mois : ${formData.a_rapports || '—'}\n`;
  text += `Sources réglementaires/sem : ${formData.a_sources || '—'}\n`;
  text += `Heures perdues/sem : ${formData.a_perdues || '—'}\n\n`;

  text += `── C. PRIORITÉS IA ──\n`;
  text += `Priorité 1 : ${formData.c_prio1 || '—'}\n`;
  text += `Priorité 2 : ${formData.c_prio2 || '—'}\n`;
  text += `Priorité 3 : ${formData.c_prio3 || '—'}\n`;
  text += `Attentes IA : ${formData.c_attentes || '—'}\n`;
  text += `À exclure : ${formData.c_exclure || '—'}\n`;
  text += `Inexactitudes : ${formData.c_inexact || '—'}\n\n`;

  text += `── D. PROFIL EARLY ADOPTER ──\n`;
  text += `Score numérique : ${formData.sc1}/10\n`;
  text += `Score BI/Excel : ${formData.sc2}/10\n`;
  text += `Score IA actuelle : ${formData.sc3}/10\n`;
  text += `Score adoption : ${formData.sc4}/10\n`;
  text += `Score ouverture : ${formData.sc5}/10\n`;
  text += `Outils IA utilisés : ${formData.d_outils || '—'}\n`;
  text += `Points positifs : ${formData.d_plus || '—'}\n`;
  text += `Points négatifs : ${formData.d_moins || '—'}\n\n`;

  const libres = [];
  for (let i = 1; i <= (formData.libreRowCount || 0); i++) {
    const desc = formData[`lib_d${i}`];
    if (getTrimmedString(desc)) {
      libres.push(`  ${i}. ${getTrimmedString(desc)} [${formData[`lib_f${i}`] || '—'}] [${formData[`lib_t${i}`] || '—'}] → Automatisable: ${formData[`lib_a${i}`] || '—'}`);
    }
  }

  text += `── E. TÂCHES LIBRES (${libres.length} tâches) ──\n`;
  text += libres.length > 0 ? libres.join('\n') + '\n\n' : '  (aucune tâche libre ajoutée)\n\n';

  text += `── F. JOURNAL DE BORD ──\n`;
  text += `Matin : ${formData.f_matin || '—'}\n`;
  text += `Matinée : ${formData.f_matinee || '—'}\n`;
  text += `Après-midi : ${formData.f_apm || '—'}\n`;
  text += `Fin de journée : ${formData.f_soir || '—'}\n`;
  text += `Lundi : ${formData.f_lundi || '—'}\n`;
  text += `Vendredi : ${formData.f_vendredi || '—'}\n`;
  text += `Mensuel : ${formData.f_mois || '—'}\n`;
  text += `Trimestriel : ${formData.f_trim || '—'}\n`;
  text += `Annuel : ${formData.f_annuel || '—'}\n`;
  text += `Déplacements : ${formData.f_deplac || '—'}\n\n`;

  const irrs = [1, 2, 3, 4, 5]
    .map(i => formData[`irr${i}_desc`])
    .map(getTrimmedString)
    .filter(Boolean);

  text += `── G. POINTS DE DOULEUR ──\n`;
  text += irrs.length > 0 ? irrs.map((d, i) => `  ${i + 1}. ${d}`).join('\n') + '\n' : '  (non renseigné)\n';
  text += `Doublons : ${formData.g_doublons || '—'}\n`;
  text += `Hors heures : ${formData.g_nuit || '—'}\n\n`;

  text += `── H. VISION IA ──\n`;
  text += `Tâche prioritaire 6 mois : ${formData.h_une || '—'}\n`;
  text += `Pourquoi : ${formData.h_pourquoi || '—'}\n`;
  text += `Vision 18 mois : ${formData.h_vision || '—'}\n`;
  text += `Déléguées à l'IA : ${formData.h_delegate || '—'}\n`;
  text += `Expertise humaine : ${formData.h_humain || '—'}\n`;
  text += `Déploiement AWA : ${formData.h_awa || '—'}\n`;
  text += `KPIs succès : ${formData.h_kpi || '—'}\n\n`;

  text += `── I. CONTRAINTES ──\n`;
  text += `Confidentialité : ${formData.i_conf || '—'}\n`;
  text += `Hébergement : ${formData.i_heberg || '—'}\n`;
  text += `Approbations : ${formData.i_appro || '—'}\n`;
  text += `Systèmes : ${formData.i_sys || '—'}\n`;
  text += `Calendaire : ${formData.i_cal || '—'}\n`;
  text += `Politique IA groupe : ${formData.i_pol || '—'}\n`;
  text += `Autres : ${formData.i_autres || '—'}\n`;

  return text;
}

async function generatePDF(formData: FormData): Promise<Uint8Array> {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  let y = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;

  const addText = (text: string, size = 10, isBold = false) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, 15, y);
    y += lineHeight;
  };

  const addSection = (title: string) => {
    y += 3;
    addText(title, 12, true);
    y += 2;
  };

  addText('AUDIT IA — FICHE PERSONNELLE', 16, true);
  y += 5;
  addText(`Répondant : ${formData.c_nom || '—'}`, 10, true);
  addText(`Email : ${formData.c_email || '—'}`);
  addText(`Poste : ${formData.c_poste || '—'}`);
  addText(`Entité : ${formData.c_entite || '—'}`);
  addText(`Date de soumission : ${date} à ${time}`);

  addSection('A. CHARGE HEBDOMADAIRE');
  addText(`Emails/jour : ${formData.a_emails || '—'}`);
  addText(`Réunions/semaine : ${formData.a_reunions || '—'}`);
  addText(`Rapports/mois : ${formData.a_rapports || '—'}`);
  addText(`Sources réglementaires/sem : ${formData.a_sources || '—'}`);
  addText(`Heures perdues/sem : ${formData.a_perdues || '—'}`);

  addSection('C. PRIORITÉS IA');
  addText(`Priorité 1 : ${formData.c_prio1 || '—'}`);
  addText(`Priorité 2 : ${formData.c_prio2 || '—'}`);
  addText(`Priorité 3 : ${formData.c_prio3 || '—'}`);
  addText(`Attentes IA : ${formData.c_attentes || '—'}`);
  addText(`À exclure : ${formData.c_exclure || '—'}`);

  addSection('D. PROFIL EARLY ADOPTER');
  addText(`Score numérique : ${formData.sc1 || '—'}/10`);
  addText(`Score BI/Excel : ${formData.sc2 || '—'}/10`);
  addText(`Score IA actuelle : ${formData.sc3 || '—'}/10`);
  addText(`Outils IA utilisés : ${formData.d_outils || '—'}`);

  addSection('H. VISION IA');
  addText(`Tâche prioritaire 6 mois : ${formData.h_une || '—'}`);
  addText(`Vision 18 mois : ${formData.h_vision || '—'}`);

  addSection('I. CONTRAINTES');
  addText(`Confidentialité : ${formData.i_conf || '—'}`);
  addText(`Systèmes : ${formData.i_sys || '—'}`);

  return doc.output('arraybuffer') as Uint8Array;
}

async function generateWord(formData: FormData): Promise<Uint8Array> {
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const sections = [];

  sections.push(
    new Paragraph({
      text: 'AUDIT IA — FICHE PERSONNELLE',
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Répondant : ', bold: true }),
        new TextRun(formData.c_nom || '—'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Email : ', bold: true }),
        new TextRun(formData.c_email || '—'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Poste : ', bold: true }),
        new TextRun(formData.c_poste || '—'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Entité : ', bold: true }),
        new TextRun(formData.c_entite || '—'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date de soumission : ', bold: true }),
        new TextRun(`${date} à ${time}`),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'A. CHARGE HEBDOMADAIRE',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph(`Emails/jour : ${formData.a_emails || '—'}`),
    new Paragraph(`Réunions/semaine : ${formData.a_reunions || '—'}`),
    new Paragraph(`Rapports/mois : ${formData.a_rapports || '—'}`),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'C. PRIORITÉS IA',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph(`Priorité 1 : ${formData.c_prio1 || '—'}`),
    new Paragraph(`Priorité 2 : ${formData.c_prio2 || '—'}`),
    new Paragraph(`Priorité 3 : ${formData.c_prio3 || '—'}`),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'D. PROFIL EARLY ADOPTER',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph(`Score numérique : ${formData.sc1 || '—'}/10`),
    new Paragraph(`Score BI/Excel : ${formData.sc2 || '—'}/10`),
    new Paragraph(`Outils IA utilisés : ${formData.d_outils || '—'}`),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'H. VISION IA',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph(`Tâche prioritaire 6 mois : ${formData.h_une || '—'}`),
    new Paragraph(`Vision 18 mois : ${formData.h_vision || '—'}`),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'I. CONTRAINTES',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph(`Confidentialité : ${formData.i_conf || '—'}`),
    new Paragraph(`Systèmes : ${formData.i_sys || '—'}`)
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections,
    }],
  });

  return await Packer.toBuffer(doc);
}

async function sendEmailWithResend(
  to: string,
  subject: string,
  content: string,
  attachmentContent: string | Uint8Array,
  attachmentFilename: string,
  cc?: string,
  replyTo?: string
): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  let base64Content: string;
  if (typeof attachmentContent === 'string') {
    base64Content = btoa(attachmentContent);
  } else {
    const binaryString = Array.from(attachmentContent)
      .map(byte => String.fromCharCode(byte))
      .join('');
    base64Content = btoa(binaryString);
  }

  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Audit IA <onboarding@resend.dev>';

  const emailPayload = {
    from: FROM_EMAIL,
    to: [to],
    cc: cc ? [cc] : undefined,
    reply_to: replyTo || undefined,
    subject: subject,
    text: content,
    attachments: [
      {
        filename: attachmentFilename,
        content: base64Content,
      }
    ]
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
      console.error('Resend API error:', result);
      return {
        success: false,
        error: `Resend error: ${result.message || JSON.stringify(result)}`
      };
    }

    console.log('Email sent successfully via Resend:', result);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendEmailWithEmailJS(
  to: string,
  subject: string,
  content: string,
  recipientName?: string,
): Promise<{ success: boolean; error?: string }> {
  const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID');
  const EMAILJS_TEMPLATE_ID = Deno.env.get('EMAILJS_TEMPLATE_ID');
  const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY');
  const EMAILJS_PRIVATE_KEY = Deno.env.get('EMAILJS_PRIVATE_KEY');

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return { success: false, error: 'EmailJS credentials not configured' };
  }

  const emailjsPayload: Record<string, unknown> = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email: to,
      to_name: recipientName || to,
      subject,
      invite_link: '',
      message: content,
    },
  };

  if (EMAILJS_PRIVATE_KEY) {
    emailjsPayload.accessToken = EMAILJS_PRIVATE_KEY;
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailjsPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `EmailJS error: ${errorText}` };
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
    const body: RequestBody = await req.json();
    const { formData, inviteToken, email_msg, format, responseId } = body;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine recipient email
    let email_dest = getTrimmedString(formData.email_dest) || getTrimmedString(formData.c_email);
    let email_cc = getTrimmedString(formData.email_cc) || undefined;
    let replyTo = getTrimmedString(formData.c_email) || undefined;

    if (inviteToken) {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('form_invitations')
        .select('invitee_email, response_email, response_cc')
        .eq('invite_token', inviteToken)
        .maybeSingle();

      if (!inviteError && invitation) {
        email_dest = getTrimmedString(invitation.response_email) || email_dest;
        email_cc = getTrimmedString(invitation.response_cc) || email_cc;
        replyTo = getTrimmedString(invitation.invitee_email) || replyTo;
      }

      // Get admin email as fallback routing
      const { data: adminSettings, error: adminError } = await supabase
        .from('admin_settings')
        .select('admin_email')
        .limit(1)
        .maybeSingle();

      if (!adminError && adminSettings?.admin_email) {
        if (!email_dest) {
          email_dest = adminSettings.admin_email;
        } else if (!email_cc && adminSettings.admin_email !== email_dest) {
          email_cc = adminSettings.admin_email;
        }
      }
    }

    if (!email_dest) {
      email_dest = getTrimmedString(Deno.env.get('ADMIN_EMAIL'));
    }

    if (!email_dest) {
      return new Response(
        JSON.stringify({ error: 'Unable to determine recipient email' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let attachmentContent: string | Uint8Array;
    let attachmentFilename: string;
    let emailContent: string;

    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const subject = `Audit IA - ${formData.c_nom || 'Formulaire'} - ${date}`;

    if (format === 'csv') {
      attachmentContent = generateCSV(formData);
      attachmentFilename = `audit_ia_${formData.c_nom?.replace(/\s+/g, '_')}_${date.replace(/\s+/g, '_')}.csv`;
      emailContent = `Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'audit IA complété en format CSV.\n\nDate d'envoi : ${date} à ${time}\n\n${email_msg || ''}\n\nCordialement,\n${formData.c_nom}`;
    } else if (format === 'pdf') {
      attachmentContent = await generatePDF(formData);
      attachmentFilename = `audit_ia_${formData.c_nom?.replace(/\s+/g, '_')}_${date.replace(/\s+/g, '_')}.pdf`;
      emailContent = `Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'audit IA complété en format PDF.\n\nDate d'envoi : ${date} à ${time}\n\n${email_msg || ''}\n\nCordialement,\n${formData.c_nom}`;
    } else if (format === 'word') {
      attachmentContent = await generateWord(formData);
      attachmentFilename = `audit_ia_${formData.c_nom?.replace(/\s+/g, '_')}_${date.replace(/\s+/g, '_')}.docx`;
      emailContent = `Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'audit IA complété en format Word.\n\nDate d'envoi : ${date} à ${time}\n\n${email_msg || ''}\n\nCordialement,\n${formData.c_nom}`;
    } else {
      attachmentContent = generatePlainText(formData);
      attachmentFilename = `audit_ia_${formData.c_nom?.replace(/\s+/g, '_')}_${date.replace(/\s+/g, '_')}.txt`;
      emailContent = `Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'audit IA complété.\n\nDate d'envoi : ${date} à ${time}\n\n${email_msg || ''}\n\nCordialement,\n${formData.c_nom}`;
    }

    const resendResult = await sendEmailWithResend(
      email_dest,
      subject,
      emailContent,
      attachmentContent,
      attachmentFilename,
      email_cc,
      replyTo
    );

    let provider: 'resend' | 'emailjs' = 'resend';
    let fallbackFrom: 'resend' | null = null;
    let attachmentIncluded = true;

    if (!resendResult.success) {
      const fallbackContent = `${emailContent}

---
Note technique :
La livraison via Resend a échoué. Ce message est envoyé via EmailJS en mode secours.
Le contenu complet du formulaire est repris ci-dessous en texte brut.

${generatePlainText(formData)}`;

      const emailJsResult = await sendEmailWithEmailJS(
        email_dest,
        subject,
        fallbackContent,
        formData.c_nom || email_dest,
      );

      if (!emailJsResult.success) {
        return new Response(
          JSON.stringify({
            error: 'Failed to send form email',
            details: {
              resend: resendResult.error,
              emailjs: emailJsResult.error,
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

      provider = 'emailjs';
      fallbackFrom = 'resend';
      attachmentIncluded = false;
    }

    let targetResponseId = getTrimmedString(responseId);

    if (!targetResponseId && inviteToken) {
      const { data: invitationResponse } = await supabase
        .from('form_responses')
        .select('id')
        .eq('invitation_token', inviteToken)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      targetResponseId = invitationResponse?.id || '';
    }

    if (!targetResponseId) {
      const { data: latestResponse } = await supabase
        .from('form_responses')
        .select('id')
        .eq('user_email', formData.c_email)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      targetResponseId = latestResponse?.id || '';
    }

    if (targetResponseId) {
      await supabase
        .from('form_responses')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', targetResponseId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: attachmentIncluded
          ? 'Email sent successfully with attachment'
          : 'Email sent successfully without attachment via fallback',
        filename: attachmentFilename,
        sent_at: new Date().toISOString(),
        sent_to: email_dest,
        sent_cc: email_cc || null,
        provider,
        fallback_from: fallbackFrom,
        attachment_included: attachmentIncluded,
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
