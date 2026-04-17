import type { ProspectFormValues, ProspectRecord, ProspectStatus } from '../types/prospect';

const LOCAL_PROSPECTS_KEY = 'transferai.prospectRequests';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeText(value: string) {
  return value.trim();
}

function buildProspectCode(date: Date) {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');

  return `PROS-${datePart}-${randomPart}`;
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `prospect_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getProspectStatusLabel(status: ProspectStatus) {
  switch (status) {
    case 'new':
      return 'Nouveau';
    case 'contact_scheduled':
      return 'Contact planifié';
    case 'audit_pending':
      return 'Audit à envoyer';
    case 'audit_sent':
      return 'Audit envoyé';
    case 'closed':
      return 'Clôturé';
    default:
      return status;
  }
}

export function createProspectRecord(values: ProspectFormValues, existing?: ProspectRecord): ProspectRecord {
  const now = new Date();
  const followUpDue = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

  return {
    id: existing?.id || generateId(),
    prospect_code: existing?.prospect_code || buildProspectCode(now),
    full_name: normalizeText(values.fullName),
    profession: normalizeText(values.profession),
    email: normalizeEmail(values.email),
    phone: normalizeText(values.phone),
    city: normalizeText(values.city),
    country: normalizeText(values.country),
    activity_sector: normalizeText(values.activitySector),
    need_description: normalizeText(values.needDescription),
    status: existing?.status && existing.status !== 'closed' ? existing.status : 'new',
    source: existing?.source || 'site_public',
    created_at: existing?.created_at || now.toISOString(),
    updated_at: now.toISOString(),
    follow_up_due_at: followUpDue,
    audit_form_sent_at: existing?.audit_form_sent_at || null,
    last_contacted_at: existing?.last_contacted_at || null,
    notes: existing?.notes || '',
  };
}

export function listLocalProspects() {
  if (typeof window === 'undefined') {
    return [] as ProspectRecord[];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_PROSPECTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as ProspectRecord[];
    return parsed.sort((left, right) => right.created_at.localeCompare(left.created_at));
  } catch {
    return [];
  }
}

function persistLocalProspects(prospects: ProspectRecord[]) {
  window.localStorage.setItem(LOCAL_PROSPECTS_KEY, JSON.stringify(prospects));
}

export function saveProspectLocally(values: ProspectFormValues) {
  const prospects = listLocalProspects();
  const email = normalizeEmail(values.email);
  const existing = prospects.find((prospect) => normalizeEmail(prospect.email) === email);
  const record = createProspectRecord(values, existing);
  const nextProspects = existing
    ? prospects.map((prospect) => (prospect.id === existing.id ? record : prospect))
    : [record, ...prospects];

  persistLocalProspects(nextProspects);

  return record;
}

export function updateLocalProspect(id: string, patch: Partial<ProspectRecord>) {
  const prospects = listLocalProspects();
  let updatedRecord: ProspectRecord | null = null;

  const nextProspects = prospects.map((prospect) => {
    if (prospect.id !== id) return prospect;

    updatedRecord = {
      ...prospect,
      ...patch,
      updated_at: new Date().toISOString(),
    };

    return updatedRecord;
  });

  persistLocalProspects(nextProspects);

  return updatedRecord;
}

export function deleteLocalProspect(id: string) {
  const prospects = listLocalProspects().filter((prospect) => prospect.id !== id);
  persistLocalProspects(prospects);
}

export function formatProspectsCsv(prospects: ProspectRecord[]) {
  const headers = [
    'Code prospect',
    'Date creation',
    'Nom complet',
    'Profession',
    'Email',
    'Telephone',
    'Ville',
    'Pays',
    'Secteur d activite',
    'Besoin',
    'Statut',
    'Suivi avant',
    'Audit envoye le',
    'Dernier contact',
  ];

  const escapeCell = (value: string | null) => `"${(value || '').replace(/"/g, '""')}"`;

  const rows = prospects.map((prospect) => [
    prospect.prospect_code,
    new Date(prospect.created_at).toLocaleString('fr-FR'),
    prospect.full_name,
    prospect.profession,
    prospect.email,
    prospect.phone,
    prospect.city,
    prospect.country,
    prospect.activity_sector,
    prospect.need_description,
    getProspectStatusLabel(prospect.status),
    new Date(prospect.follow_up_due_at).toLocaleString('fr-FR'),
    prospect.audit_form_sent_at ? new Date(prospect.audit_form_sent_at).toLocaleString('fr-FR') : '',
    prospect.last_contacted_at ? new Date(prospect.last_contacted_at).toLocaleString('fr-FR') : '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.map((cell) => escapeCell(cell)).join(','))].join('\n');
}
