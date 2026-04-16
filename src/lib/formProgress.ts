import type { FormData } from '../types/form';

export interface AuditSectionMeta {
  id: number;
  code: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const auditSections: AuditSectionMeta[] = [
  {
    id: 0,
    code: '00',
    label: 'Accueil',
    shortLabel: 'Accueil',
    description: 'Cadrage du répondant, du rôle et du périmètre de l’audit.',
  },
  {
    id: 1,
    code: 'A',
    label: 'Charge de travail',
    shortLabel: 'Charge',
    description: 'Mesure du volume, des rythmes et des activités récurrentes.',
  },
  {
    id: 2,
    code: 'B',
    label: 'Tâches identifiées',
    shortLabel: 'Tâches',
    description: 'Validation des tâches déjà observées et estimation des efforts.',
  },
  {
    id: 3,
    code: 'C',
    label: 'Ajustements',
    shortLabel: 'Ajustements',
    description: 'Corrections, exclusions et priorités IA du répondant.',
  },
  {
    id: 4,
    code: 'D',
    label: 'Profil early adopter',
    shortLabel: 'Profil',
    description: 'Maturité digitale, usages IA et préférences de restitution.',
  },
  {
    id: 5,
    code: 'E',
    label: 'Tâches libres',
    shortLabel: 'Libre',
    description: 'Inventaire ouvert des tâches non encore cartographiées.',
  },
  {
    id: 6,
    code: 'F',
    label: 'Journal de bord',
    shortLabel: 'Journal',
    description: 'Exploration des routines quotidiennes, hebdomadaires et mensuelles.',
  },
  {
    id: 7,
    code: 'G',
    label: 'Points de douleur',
    shortLabel: 'Douleurs',
    description: 'Identification des irritants, doublons et tâches hors horaires.',
  },
  {
    id: 8,
    code: 'H',
    label: 'Vision IA',
    shortLabel: 'Vision',
    description: 'Projection à 6 et 18 mois sur les gains et la cible métier.',
  },
  {
    id: 9,
    code: 'I',
    label: 'Contraintes',
    shortLabel: 'Contraintes',
    description: 'Contraintes de confidentialité, techniques et calendaires.',
  },
  {
    id: 10,
    code: '10',
    label: 'Envoi et récapitulatif',
    shortLabel: 'Envoi',
    description: 'Sauvegarde, export et transmission du dossier d’audit.',
  },
];

const trackedSections = [
  { ids: ['c_nom', 'c_email', 'c_domaine'], weight: 10 },
  { ids: ['ch1_h', 'ch2_h', 'a_emails'], weight: 10 },
  { ids: [], weight: 10 },
  { ids: ['c_prio1', 'c_attentes'], weight: 10 },
  { ids: ['sc1', 'sc2', 'd_outils'], weight: 10 },
  { ids: [], libre: true, weight: 15 },
  { ids: ['f_matin', 'f_matinee', 'f_mois'], weight: 10 },
  { ids: ['irr1_desc'], weight: 10 },
  { ids: ['h_une', 'h_vision'], weight: 10 },
  { ids: ['i_conf', 'i_sys'], weight: 5 },
];

const sectionFields: Record<number, { ids: string[]; libre?: boolean }> = {
  0: { ids: ['c_nom', 'c_email', 'c_domaine'] },
  1: { ids: ['ch1_h', 'ch2_h', 'a_emails'] },
  2: { ids: [] },
  3: { ids: ['c_prio1', 'c_attentes'] },
  4: { ids: ['sc1', 'sc2', 'd_outils'] },
  5: { ids: [], libre: true },
  6: { ids: ['f_matin', 'f_matinee', 'f_mois'] },
  7: { ids: ['irr1_desc'] },
  8: { ids: ['h_une', 'h_vision'] },
  9: { ids: ['i_conf', 'i_sys'] },
};

export function calculateSectionProgress(formData: FormData, sectionId: number) {
  const section = sectionFields[sectionId];
  if (!section) return 0;

  if (section.libre) {
    return formData.libreRowCount > 0 ? Math.min(100, formData.libreRowCount * 20) : 0;
  }

  if (section.ids.length === 0) {
    return 0;
  }

  const filled = section.ids.filter((id) => {
    const value = formData[id];
    return value && String(value).trim().length > 0;
  }).length;

  return Math.round((filled / section.ids.length) * 100);
}

export function calculateOverallProgress(formData: FormData) {
  let totalPct = 0;
  let done = 0;

  trackedSections.forEach((section) => {
    let pct = 0;

    if (section.libre) {
      pct = formData.libreRowCount > 0 ? Math.min(100, formData.libreRowCount * 20) : 0;
    } else if (section.ids.length > 0) {
      const filled = section.ids.filter((id) => {
        const value = formData[id];
        return value && String(value).trim().length > 0;
      }).length;
      pct = Math.round((filled / section.ids.length) * 100);
    }

    totalPct += (pct * section.weight) / 100;
    if (pct >= 60) {
      done += 1;
    }
  });

  return {
    overall: Math.round(totalPct),
    done,
    total: trackedSections.length,
  };
}

export function getCurrentSectionMeta(sectionId: number) {
  return auditSections.find((section) => section.id === sectionId) ?? auditSections[0];
}
