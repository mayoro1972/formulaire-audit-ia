import type { FormData } from '../types/form';

export function createInitialFormData(): FormData {
  return {
    libreRowCount: 0,
    c_nom: '',
    c_email: '',
    c_poste: '',
    c_entite: '',
    eng1: false,
    eng2: false,
    eng3: false,
    eng4: false,
    ch1_h: '', ch1_r: '', ch2_h: '', ch2_r: '', ch3_h: '', ch3_r: '',
    ch4_h: '', ch4_r: '', ch5_h: '', ch5_r: '', ch6_h: '', ch6_r: '',
    ch7_h: '', ch7_r: '', ch8_h: '', ch8_r: '',
    a_emails: '', a_reunions: '', a_rapports: '', a_sources: '', a_dossiers: '',
    a_missions: '', a_perdues: '',
    c_inexact: '', c_exclure: '', c_prio1: '', c_prio2: '', c_prio3: '', c_attentes: '',
    sc1: '5', sc2: '5', sc3: '5', sc4: '5', sc5: '5',
    d_outils: '', d_usage: '', d_plus: '', d_moins: '',
    fmt1: false, fmt2: false, fmt3: false, fmt4: false, fmt5: false,
    d_format_autre: '',
    f_matin: '', f_matinee: '', f_apm: '', f_soir: '', f_lundi: '', f_vendredi: '',
    f_mois: '', f_trim: '', f_annuel: '', f_deplac: '',
    irr1_desc: '', irr1_t: '', irr1_s: '', irr2_desc: '', irr2_t: '', irr2_s: '',
    irr3_desc: '', irr3_t: '', irr3_s: '', irr4_desc: '', irr4_t: '', irr4_s: '',
    irr5_desc: '', irr5_t: '', irr5_s: '',
    g_doublons: '', g_nuit: '',
    h_une: '', h_pourquoi: '', h_vision: '', h_delegate: '', h_humain: '',
    h_awa: '', h_kpi: '',
    i_conf: '', i_rgpd: '', i_heberg: '', i_appro: '', i_sys: '', i_cal: '',
    i_pol: '', i_autres: '',
    email_dest: 'contact@transferai.ci', email_cc: '', email_msg: '',
  };
}

export function mergeWithInitialFormData(data?: Partial<FormData> | null): FormData {
  return {
    ...createInitialFormData(),
    ...(data ?? {}),
  };
}

export function createInvitationDraft(formData: FormData): FormData {
  const draft = mergeWithInitialFormData(formData);
  draft.ts = undefined;
  draft.email_dest = '';
  draft.email_cc = '';
  draft.email_msg = '';
  return draft;
}

export function hasDraftContent(formData: FormData): boolean {
  return Object.entries(formData).some(([key, value]) => {
    if (key === 'ts' || key === 'email_dest' || key === 'email_cc' || key === 'email_msg') {
      return false;
    }

    if (key === 'libreRowCount') {
      return typeof value === 'number' ? value > 0 : Number(value || 0) > 0;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return value.trim() !== '';
    }

    if (typeof value === 'number') {
      return value > 0;
    }

    return false;
  });
}
