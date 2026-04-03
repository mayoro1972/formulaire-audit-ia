import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "npm:docx@8";
import { jsPDF } from "npm:jspdf@2";
import JSZip from "npm:jszip@3.10.1";

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
  documentPassword?: string;
}

function getTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

interface EmailTemplateOptions {
  formData: FormData;
  date: string;
  time: string;
  formatLabel: string;
  attachmentFilename: string;
  emailMessage?: string;
  recipientEmail: string;
  ccEmail?: string;
  responseId?: string;
  attachmentIncluded: boolean;
  viaFallback?: boolean;
  protectionNotice?: string;
}

function buildReturnEmailTemplate(options: EmailTemplateOptions) {
  const {
    formData,
    date,
    time,
    formatLabel,
    attachmentFilename,
    emailMessage,
    recipientEmail,
    ccEmail,
    responseId,
    attachmentIncluded,
    viaFallback = false,
    protectionNotice,
  } = options;

  const respondentName = getTrimmedString(formData.c_nom) || 'Répondant non renseigné';
  const respondentEmail = getTrimmedString(formData.c_email) || '—';
  const respondentRole = getTrimmedString(formData.c_poste) || '—';
  const respondentEntity = getTrimmedString(formData.c_entite) || '—';
  const respondentDomain = getTrimmedString(formData.c_domaine) || 'Non renseigné';
  const customMessage = getTrimmedString(emailMessage);
  const statusLine = attachmentIncluded
    ? `Le formulaire complété est joint à ce message au format ${formatLabel}.`
    : `Le formulaire complété est repris dans le corps du message car la pièce jointe n'a pas pu être transmise dans le mode de secours.`;
  const fallbackLine = viaFallback
    ? `Mode d'envoi utilisé : EmailJS (secours après échec Resend).`
    : `Mode d'envoi utilisé : Resend.`;

  const subject = `[Audit IA] Formulaire complété - ${respondentName} - ${date}`;

  const textParts = [
    'Bonjour,',
    '',
    'Un formulaire d’audit IA complété vient d’être transmis.',
    '',
    statusLine,
    fallbackLine,
    '',
    'Résumé du répondant :',
    `- Nom : ${respondentName}`,
    `- Email : ${respondentEmail}`,
    `- Poste : ${respondentRole}`,
    `- Entité : ${respondentEntity}`,
    `- Domaine principal : ${respondentDomain}`,
    `- Date d'envoi : ${date} à ${time}`,
    `- Destinataire principal : ${recipientEmail}`,
    `- Copie : ${ccEmail || 'Aucune'}`,
    `- Référence de réponse : ${responseId || 'Non disponible'}`,
    `- Fichier attendu : ${attachmentFilename}`,
    '',
  ];

  if (protectionNotice) {
    textParts.push(`Protection du document : ${protectionNotice}`, '');
  }

  if (customMessage) {
    textParts.push('Message du répondant :', customMessage, '');
  }

  textParts.push(
    'Actions conseillées :',
    '- Ouvrir le message et vérifier la pièce jointe ou le contenu brut',
    '- Archiver le formulaire dans la boîte partagée / GED',
    '- Recontacter le répondant si un complément est nécessaire',
  );

  const text = textParts.join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.6; color:#1f2937; max-width:720px;">
      <div style="background:#042C53; color:#ffffff; padding:20px 24px; border-radius:12px 12px 0 0;">
        <div style="font-size:12px; opacity:0.8; margin-bottom:4px;">Audit IA · Réception de formulaire</div>
        <div style="font-size:24px; font-weight:700;">Formulaire complété reçu</div>
      </div>
      <div style="border:1px solid #d3d1c7; border-top:none; border-radius:0 0 12px 12px; padding:24px; background:#ffffff;">
        <p style="margin-top:0;">Bonjour,</p>
        <p>Un formulaire d’audit IA complété vient d’être transmis.</p>
        <div style="background:#E6F1FB; border:1px solid #185FA5; border-radius:10px; padding:16px; margin:16px 0;">
          <p style="margin:0 0 8px 0;"><strong>${escapeHtml(statusLine)}</strong></p>
          <p style="margin:0; color:#185FA5;">${escapeHtml(fallbackLine)}</p>
        </div>
        ${
          protectionNotice
            ? `<div style="background:#FAEEDA; border:1px solid #BA7517; border-radius:10px; padding:16px; margin:16px 0;">
                <p style="margin:0; color:#854F0B;"><strong>Protection du document :</strong> ${escapeHtml(protectionNotice)}</p>
              </div>`
            : ''
        }
        <h3 style="margin:24px 0 12px 0; color:#042C53;">Résumé du répondant</h3>
        <table style="border-collapse:collapse; width:100%; font-size:14px;">
          <tbody>
            <tr><td style="padding:6px 0; width:210px; color:#6b7280;">Nom</td><td style="padding:6px 0;"><strong>${escapeHtml(respondentName)}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Email</td><td style="padding:6px 0;">${escapeHtml(respondentEmail)}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Poste</td><td style="padding:6px 0;">${escapeHtml(respondentRole)}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Entité</td><td style="padding:6px 0;">${escapeHtml(respondentEntity)}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Domaine principal</td><td style="padding:6px 0;">${escapeHtml(respondentDomain)}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Date d'envoi</td><td style="padding:6px 0;">${escapeHtml(`${date} à ${time}`)}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Destinataire principal</td><td style="padding:6px 0;">${escapeHtml(recipientEmail)}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Copie</td><td style="padding:6px 0;">${escapeHtml(ccEmail || 'Aucune')}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Référence de réponse</td><td style="padding:6px 0;">${escapeHtml(responseId || 'Non disponible')}</td></tr>
            <tr><td style="padding:6px 0; color:#6b7280;">Fichier attendu</td><td style="padding:6px 0;">${escapeHtml(attachmentFilename)}</td></tr>
          </tbody>
        </table>
        ${
          customMessage
            ? `<div style="margin-top:20px; background:#FAEEDA; border:1px solid #BA7517; border-radius:10px; padding:16px;">
                <div style="font-weight:700; color:#854F0B; margin-bottom:8px;">Message du répondant</div>
                <div style="white-space:pre-line;">${escapeHtml(customMessage)}</div>
              </div>`
            : ''
        }
        <div style="margin-top:24px;">
          <div style="font-weight:700; color:#042C53; margin-bottom:8px;">Vérifications conseillées</div>
          <ul style="margin:0; padding-left:18px;">
            <li>Ouvrir le message et vérifier la pièce jointe ou le contenu brut</li>
            <li>Archiver le formulaire dans la boîte partagée ou la GED</li>
            <li>Recontacter le répondant si un complément est nécessaire</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

interface ExportRow {
  section: string;
  field: string;
  value: string;
}

function formatBoolean(value: unknown): string {
  return value ? 'Oui' : 'Non';
}

function normalizeValue(value: unknown): string {
  if (typeof value === 'boolean') return formatBoolean(value);
  if (typeof value === 'number') return String(value);
  return getTrimmedString(value);
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(Array.from(bytes).map((byte) => String.fromCharCode(byte)).join(''));
}

function slugifyFilenamePart(value: string | undefined): string {
  return (value || 'reponse')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'reponse';
}

function utf16leEncode(value: string): Uint8Array {
  const buffer = new Uint8Array(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    buffer[index * 2] = codeUnit & 0xff;
    buffer[index * 2 + 1] = codeUnit >> 8;
  }
  return buffer;
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  arrays.forEach((array) => {
    result.set(array, offset);
    offset += array.length;
  });

  return result;
}

async function sha512(input: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-512', input));
}

async function applyWordProtection(docxContent: Uint8Array, password: string): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(docxContent);
  const settingsPath = 'word/settings.xml';
  const existingSettings = zip.file(settingsPath)
    ? await zip.file(settingsPath)!.async('string')
    : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:settings>';

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const spinCount = 5000;
  let hash = await sha512(concatUint8Arrays(salt, utf16leEncode(password)));

  for (let index = 0; index < spinCount; index += 1) {
    const iterator = new Uint8Array(4);
    new DataView(iterator.buffer).setUint32(0, index, true);
    hash = await sha512(concatUint8Arrays(iterator, hash));
  }

  const protectionTag =
    `<w:documentProtection w:edit="readOnly" w:enforcement="1" w:formatting="0" ` +
    `w:algorithmName="SHA-512" w:cryptProviderType="rsaAES" w:cryptAlgorithmClass="hash" ` +
    `w:cryptAlgorithmType="typeAny" w:cryptAlgorithmSid="14" w:spinCount="${spinCount}" ` +
    `w:hashValue="${bytesToBase64(hash)}" w:saltValue="${bytesToBase64(salt)}"/>`;

  const sanitizedSettings = existingSettings
    .replace(/<w:documentProtection\b[^>]*\/>/g, '')
    .replace(/<w:documentProtection\b[\s\S]*?<\/w:documentProtection>/g, '');

  const patchedSettings = sanitizedSettings.includes('</w:settings>')
    ? sanitizedSettings.replace('</w:settings>', `  ${protectionTag}\n</w:settings>`)
    : `${sanitizedSettings}${protectionTag}`;

  zip.file(settingsPath, patchedSettings);
  return await zip.generateAsync({ type: 'uint8array' });
}

function buildExportRows(formData: FormData): ExportRow[] {
  const rows: ExportRow[] = [];
  const push = (section: string, field: string, value: unknown) => {
    rows.push({ section, field, value: normalizeValue(value) || '—' });
  };

  push('Informations personnelles', 'Nom', formData.c_nom);
  push('Informations personnelles', 'Email', formData.c_email);
  push('Informations personnelles', 'Poste', formData.c_poste);
  push('Informations personnelles', 'Entité', formData.c_entite);
  push('Informations personnelles', 'Domaine principal', formData.c_domaine);
  push('Informations personnelles', 'Domaines associés', formData.c_domaines_associes);
  push('Engagements', 'Validation des informations', formData.eng1);
  push('Engagements', 'Droit d’usage des informations', formData.eng2);
  push('Engagements', 'Autorisation de recontact', formData.eng3);
  push('Engagements', 'Confirmation de sincérité', formData.eng4);

  for (let index = 1; index <= 8; index += 1) {
    push('Charge détaillée', `Bloc ${index} — Heures`, formData[`ch${index}_h`]);
    push('Charge détaillée', `Bloc ${index} — Répétitivité`, formData[`ch${index}_r`]);
  }

  push('Charge hebdomadaire', 'Emails / jour', formData.a_emails);
  push('Charge hebdomadaire', 'Réunions / semaine', formData.a_reunions);
  push('Charge hebdomadaire', 'Rapports / mois', formData.a_rapports);
  push('Charge hebdomadaire', 'Sources / semaine', formData.a_sources);
  push('Charge hebdomadaire', 'Dossiers / semaine', formData.a_dossiers);
  push('Charge hebdomadaire', 'Missions / mois', formData.a_missions);
  push('Charge hebdomadaire', 'Heures perdues / semaine', formData.a_perdues);

  push('Priorités IA', 'Inexactitudes à éviter', formData.c_inexact);
  push('Priorités IA', 'Périmètre à exclure', formData.c_exclure);
  push('Priorités IA', 'Priorité 1', formData.c_prio1);
  push('Priorités IA', 'Priorité 2', formData.c_prio2);
  push('Priorités IA', 'Priorité 3', formData.c_prio3);
  push('Priorités IA', 'Attentes', formData.c_attentes);

  push('Profil numérique', 'Score numérique', formData.sc1);
  push('Profil numérique', 'Score BI / Excel', formData.sc2);
  push('Profil numérique', 'Score IA actuelle', formData.sc3);
  push('Profil numérique', 'Score adoption', formData.sc4);
  push('Profil numérique', 'Score ouverture', formData.sc5);
  push('Profil numérique', 'Outils IA utilisés', formData.d_outils);
  push('Profil numérique', 'Usage actuel', formData.d_usage);
  push('Profil numérique', 'Points positifs', formData.d_plus);
  push('Profil numérique', 'Points négatifs', formData.d_moins);
  push('Profil numérique', 'Préférence format 1', formData.fmt1);
  push('Profil numérique', 'Préférence format 2', formData.fmt2);
  push('Profil numérique', 'Préférence format 3', formData.fmt3);
  push('Profil numérique', 'Préférence format 4', formData.fmt4);
  push('Profil numérique', 'Préférence format 5', formData.fmt5);
  push('Profil numérique', 'Autre format préféré', formData.d_format_autre);

  for (let index = 1; index <= Number(formData.libreRowCount || 0); index += 1) {
    push('Tâches libres', `Tâche ${index} — Description`, formData[`lib_d${index}`]);
    push('Tâches libres', `Tâche ${index} — Fréquence`, formData[`lib_f${index}`]);
    push('Tâches libres', `Tâche ${index} — Durée`, formData[`lib_t${index}`]);
    push('Tâches libres', `Tâche ${index} — Automatisable`, formData[`lib_a${index}`]);
  }

  push('Journal de bord', 'Matin', formData.f_matin);
  push('Journal de bord', 'Matinée', formData.f_matinee);
  push('Journal de bord', 'Après-midi', formData.f_apm);
  push('Journal de bord', 'Fin de journée', formData.f_soir);
  push('Journal de bord', 'Lundi', formData.f_lundi);
  push('Journal de bord', 'Vendredi', formData.f_vendredi);
  push('Journal de bord', 'Mensuel', formData.f_mois);
  push('Journal de bord', 'Trimestriel', formData.f_trim);
  push('Journal de bord', 'Annuel', formData.f_annuel);
  push('Journal de bord', 'Déplacements', formData.f_deplac);

  for (let index = 1; index <= 5; index += 1) {
    push('Points de douleur', `Irritant ${index} — Description`, formData[`irr${index}_desc`]);
    push('Points de douleur', `Irritant ${index} — Temps perdu`, formData[`irr${index}_t`]);
    push('Points de douleur', `Irritant ${index} — Solution actuelle`, formData[`irr${index}_s`]);
  }
  push('Points de douleur', 'Doublons / ressaisies', formData.g_doublons);
  push('Points de douleur', 'Travail hors heures', formData.g_nuit);

  push('Vision IA', 'Tâche prioritaire à automatiser', formData.h_une);
  push('Vision IA', 'Pourquoi cette priorité', formData.h_pourquoi);
  push('Vision IA', 'Vision à 18 mois', formData.h_vision);
  push('Vision IA', 'Tâches déléguées à l’IA', formData.h_delegate);
  push('Vision IA', 'Expertise à conserver côté humain', formData.h_humain);
  push('Vision IA', 'Déploiement AWA', formData.h_awa);
  push('Vision IA', 'KPIs de succès', formData.h_kpi);

  push('Contraintes', 'Confidentialité', formData.i_conf);
  push('Contraintes', 'RGPD / données personnelles', formData.i_rgpd);
  push('Contraintes', 'Hébergement', formData.i_heberg);
  push('Contraintes', 'Approbations', formData.i_appro);
  push('Contraintes', 'Systèmes', formData.i_sys);
  push('Contraintes', 'Calendaire', formData.i_cal);
  push('Contraintes', 'Politique IA groupe', formData.i_pol);
  push('Contraintes', 'Autres contraintes', formData.i_autres);

  push('Email de retour', 'Destinataire principal', formData.email_dest);
  push('Email de retour', 'Destinataire copie', formData.email_cc);
  push('Email de retour', 'Message d’accompagnement', formData.email_msg);

  return rows;
}

function generateCSV(formData: FormData): string {
  const rows = [['Section', 'Champ', 'Valeur'], ...buildExportRows(formData).map((row) => [row.section, row.field, row.value])];
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function generatePlainText(formData: FormData): string {
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = buildExportRows(formData);
  let currentSection = '';
  let text = `=== AUDIT IA — FICHE COMPLETE ===\n`;
  text += `Répondant : ${formData.c_nom || '—'}\n`;
  text += `Email : ${formData.c_email || '—'}\n`;
  text += `Date : ${date}\n\n`;

  rows.forEach((row) => {
    if (row.section !== currentSection) {
      currentSection = row.section;
      text += `── ${currentSection.toUpperCase()} ──\n`;
    }
    text += `${row.field} : ${row.value}\n`;
  });

  return text;
}

async function generatePDF(formData: FormData): Promise<Uint8Array> {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const rows = buildExportRows(formData);

  let y = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  const addText = (text: string, size = 10, isBold = false) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 30);
    doc.text(lines, 15, y);
    y += Math.max(lineHeight, lines.length * (lineHeight - 1));
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

  let currentSection = '';
  rows.forEach((row) => {
    if (row.section !== currentSection) {
      currentSection = row.section;
      addSection(currentSection);
    }
    addText(`${row.field} : ${row.value}`);
  });

  return doc.output('arraybuffer') as Uint8Array;
}

async function generateWord(formData: FormData): Promise<Uint8Array> {
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const rows = buildExportRows(formData);

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
  );

  let currentSection = '';
  rows.forEach((row) => {
    if (row.section !== currentSection) {
      currentSection = row.section;
      sections.push(
        new Paragraph({
          text: currentSection,
          heading: HeadingLevel.HEADING_2,
        }),
      );
    }

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${row.field} : `, bold: true }),
          new TextRun(row.value),
        ],
      }),
    );
  });

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
  textContent: string,
  htmlContent: string,
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
    base64Content = bytesToBase64(new TextEncoder().encode(attachmentContent));
  } else {
    base64Content = bytesToBase64(attachmentContent);
  }

  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Audit IA <onboarding@resend.dev>';

  const emailPayload = {
    from: FROM_EMAIL,
    to: [to],
    cc: cc ? [cc] : undefined,
    reply_to: replyTo || undefined,
    subject: subject,
    text: textContent,
    html: htmlContent,
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
  templateParams?: Record<string, string>,
  attachmentDataUrl?: string,
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
      attachment_file: attachmentDataUrl || '',
      ...templateParams,
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
    const { formData, inviteToken, email_msg, format, responseId, documentPassword } = body;

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
    const trimmedPassword = getTrimmedString(documentPassword);
    const isProtectedWord = format === 'word' && trimmedPassword.length > 0;
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const baseFilename = `audit_ia_${slugifyFilenamePart(formData.c_nom)}_${slugifyFilenamePart(date)}`;
    const formatLabel = format === 'csv'
      ? 'CSV'
      : format === 'pdf'
        ? 'PDF'
        : isProtectedWord
          ? 'Word protégé'
          : format === 'word'
            ? 'Word'
            : 'texte';
    const protectionNotice = isProtectedWord
      ? 'Le document Word est protégé par mot de passe. Communiquez ce mot de passe séparément au destinataire.'
      : undefined;
    const attachmentMimeType = format === 'csv'
      ? 'text/csv'
      : format === 'pdf'
        ? 'application/pdf'
        : format === 'word'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'text/plain';

    if (format === 'csv') {
      attachmentContent = generateCSV(formData);
      attachmentFilename = `${baseFilename}.csv`;
    } else if (format === 'pdf') {
      attachmentContent = await generatePDF(formData);
      attachmentFilename = `${baseFilename}.pdf`;
    } else if (format === 'word') {
      attachmentContent = await generateWord(formData);
      if (isProtectedWord) {
        attachmentContent = await applyWordProtection(attachmentContent, trimmedPassword);
      }
      attachmentFilename = `${baseFilename}${isProtectedWord ? '_protege' : ''}.docx`;
    } else {
      attachmentContent = generatePlainText(formData);
      attachmentFilename = `${baseFilename}.txt`;
    }

    const primaryEmail = buildReturnEmailTemplate({
      formData,
      date,
      time,
      formatLabel,
      attachmentFilename,
      emailMessage: email_msg,
      recipientEmail: email_dest,
      ccEmail: email_cc,
      responseId,
      attachmentIncluded: true,
      protectionNotice,
    });

    const resendResult = await sendEmailWithResend(
      email_dest,
      primaryEmail.subject,
      primaryEmail.text,
      primaryEmail.html,
      attachmentContent,
      attachmentFilename,
      email_cc,
      replyTo
    );

    let provider: 'resend' | 'emailjs' = 'resend';
    let fallbackFrom: 'resend' | null = null;
    let attachmentIncluded = true;

    if (!resendResult.success) {
      let fallbackFormatLabel = formatLabel;
      let fallbackAttachmentFilename = attachmentFilename;
      let fallbackAttachmentContent = attachmentContent;
      let fallbackProtectionNotice = protectionNotice;
      let fallbackAttachmentMimeType = attachmentMimeType;

      let fallbackEmail = buildReturnEmailTemplate({
        formData,
        date,
        time,
        formatLabel: fallbackFormatLabel,
        attachmentFilename: fallbackAttachmentFilename,
        emailMessage: email_msg,
        recipientEmail: email_dest,
        ccEmail: email_cc,
        responseId,
        attachmentIncluded: true,
        viaFallback: true,
        protectionNotice: fallbackProtectionNotice,
      });
      const fallbackContent = fallbackEmail.text;

      const buildAttachmentDataUrl = (content: string | Uint8Array, mimeType: string) => {
        const base64 = typeof content === 'string'
          ? bytesToBase64(new TextEncoder().encode(content))
          : bytesToBase64(content);
        return `data:${mimeType};base64,${base64}`;
      };

      const buildFallbackTemplateParams = () => ({
        preheader: `Formulaire complété reçu de ${getTrimmedString(formData.c_nom) || 'un répondant'}`,
        intro_title: 'Formulaire complété reçu',
        status_line: 'Envoi via EmailJS (mode secours)',
        format_label: fallbackFormatLabel,
        attachment_filename: fallbackAttachmentFilename,
        attachment_included: 'true',
        response_reference: getTrimmedString(responseId) || 'non-disponible',
        respondent_name: getTrimmedString(formData.c_nom) || 'Non renseigné',
        respondent_email: getTrimmedString(formData.c_email) || '—',
        respondent_role: getTrimmedString(formData.c_poste) || '—',
        respondent_entity: getTrimmedString(formData.c_entite) || '—',
        respondent_domain: getTrimmedString(formData.c_domaine) || 'Non renseigné',
        sent_datetime: `${date} à ${time}`,
        recipient_email: email_dest,
        cc_email: email_cc || 'Aucune',
        custom_message: getTrimmedString(email_msg) || 'Aucun message complémentaire',
        verification_steps:
          '1. Ouvrir la pièce jointe envoyée; 2. Vérifier le résumé du répondant; 3. Archiver le message dans la boîte partagée.',
        message_text: fallbackEmail.text,
        attachment_content_type: fallbackAttachmentMimeType,
      });

      let emailJsResult = await sendEmailWithEmailJS(
        email_dest,
        fallbackEmail.subject,
        fallbackContent,
        formData.c_nom || email_dest,
        buildFallbackTemplateParams(),
        buildAttachmentDataUrl(fallbackAttachmentContent, fallbackAttachmentMimeType),
      );

      const canDowngradeToCsv =
        format === 'word' &&
        emailJsResult.error?.includes('Variables size limit');

      if (canDowngradeToCsv) {
        fallbackAttachmentContent = generateCSV(formData);
        fallbackAttachmentFilename = `${baseFilename}_secours.csv`;
        fallbackAttachmentMimeType = 'text/csv';
        fallbackFormatLabel = 'CSV de secours';
        fallbackProtectionNotice = 'Le document Word protégé dépassait la limite du mode secours. Un CSV complet a été joint à la place.';
        fallbackEmail = buildReturnEmailTemplate({
          formData,
          date,
          time,
          formatLabel: fallbackFormatLabel,
          attachmentFilename: fallbackAttachmentFilename,
          emailMessage: email_msg,
          recipientEmail: email_dest,
          ccEmail: email_cc,
          responseId,
          attachmentIncluded: true,
          viaFallback: true,
          protectionNotice: fallbackProtectionNotice,
        });

        emailJsResult = await sendEmailWithEmailJS(
          email_dest,
          fallbackEmail.subject,
          fallbackEmail.text,
          formData.c_nom || email_dest,
          buildFallbackTemplateParams(),
          buildAttachmentDataUrl(fallbackAttachmentContent, fallbackAttachmentMimeType),
        );
      }

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
      attachmentIncluded = true;
      attachmentFilename = fallbackAttachmentFilename;
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
