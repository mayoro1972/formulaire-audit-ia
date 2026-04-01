export type FormFieldValue = string | boolean | number | undefined;

export interface FormData {
  ts?: string;
  libreRowCount: number;

  c_nom: string;
  c_email: string;
  c_poste: string;
  c_entite: string;

  eng1: boolean;
  eng2: boolean;
  eng3: boolean;
  eng4: boolean;

  ch1_h: string;
  ch1_r: string;
  ch2_h: string;
  ch2_r: string;
  ch3_h: string;
  ch3_r: string;
  ch4_h: string;
  ch4_r: string;
  ch5_h: string;
  ch5_r: string;
  ch6_h: string;
  ch6_r: string;
  ch7_h: string;
  ch7_r: string;
  ch8_h: string;
  ch8_r: string;

  a_emails: string;
  a_reunions: string;
  a_rapports: string;
  a_sources: string;
  a_dossiers: string;
  a_missions: string;
  a_perdues: string;

  c_inexact: string;
  c_exclure: string;
  c_prio1: string;
  c_prio2: string;
  c_prio3: string;
  c_attentes: string;

  sc1: string;
  sc2: string;
  sc3: string;
  sc4: string;
  sc5: string;

  d_outils: string;
  d_usage: string;
  d_plus: string;
  d_moins: string;
  fmt1: boolean;
  fmt2: boolean;
  fmt3: boolean;
  fmt4: boolean;
  fmt5: boolean;
  d_format_autre: string;

  f_matin: string;
  f_matinee: string;
  f_apm: string;
  f_soir: string;
  f_lundi: string;
  f_vendredi: string;
  f_mois: string;
  f_trim: string;
  f_annuel: string;
  f_deplac: string;

  irr1_desc: string;
  irr1_t: string;
  irr1_s: string;
  irr2_desc: string;
  irr2_t: string;
  irr2_s: string;
  irr3_desc: string;
  irr3_t: string;
  irr3_s: string;
  irr4_desc: string;
  irr4_t: string;
  irr4_s: string;
  irr5_desc: string;
  irr5_t: string;
  irr5_s: string;

  g_doublons: string;
  g_nuit: string;

  h_une: string;
  h_pourquoi: string;
  h_vision: string;
  h_delegate: string;
  h_humain: string;
  h_awa: string;
  h_kpi: string;

  i_conf: string;
  i_rgpd: string;
  i_heberg: string;
  i_appro: string;
  i_sys: string;
  i_cal: string;
  i_pol: string;
  i_autres: string;

  email_dest: string;
  email_cc: string;
  email_msg: string;

  [key: string]: FormFieldValue;
}

export interface LibreTask {
  description: string;
  frequence: string;
  duree: string;
  automatisable: string;
}
