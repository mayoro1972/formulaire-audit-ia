import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormData } from '../types/form';
import { supabase } from '../lib/supabase';

const SAVE_KEY = 'audit_ia_gerard_v2';
const SESSION_KEY = 'audit_session_id';

const initialFormData: FormData = {
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
  email_dest: '', email_cc: '', email_msg: '',
};

interface FormContextType {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  saveStatus: string;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  saveAll: () => void;
  submitToSupabase: () => Promise<{ success: boolean; error?: string }>;
  responseId: string | null;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialFormData, ...parsed };
      }
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
    return initialFormData;
  });

  const [saveStatus, setSaveStatus] = useState('Non sauvegardé');
  const [currentSection, setCurrentSection] = useState(0);
  const [autoSaveTimer, setAutoSaveTimer] = useState<number | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [sessionId] = useState<string>(getOrCreateSessionId());

  const saveAll = () => {
    try {
      const dataToSave = { ...formData, ts: new Date().toISOString() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      const now = new Date();
      setSaveStatus(`Sauvegardé ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
    } catch (e) {
      setSaveStatus('Erreur de sauvegarde');
    }
  };

  const calculateCompletionPercentage = (data: FormData): number => {
    const totalFields = Object.keys(initialFormData).length;
    let filledFields = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'ts' || key === 'libreRowCount') return;
      if (typeof value === 'boolean' && value === true) filledFields++;
      else if (typeof value === 'string' && value.trim() !== '') filledFields++;
      else if (typeof value === 'number' && value > 0) filledFields++;
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  const submitToSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const completionPercentage = calculateCompletionPercentage(formData);

      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite') || '';

      const payload = {
        user_name: formData.c_nom || '',
        user_email: formData.c_email || '',
        user_position: formData.c_poste || '',
        user_entity: formData.c_entite || '',
        form_data: formData,
        is_completed: completionPercentage >= 80,
        completion_percentage: completionPercentage,
        session_id: sessionId,
        invitation_token: inviteToken,
      };

      if (responseId) {
        const { error } = await supabase
          .from('form_responses')
          .update(payload)
          .eq('id', responseId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('form_responses')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          setResponseId(data.id);

          if (inviteToken) {
            await supabase
              .from('form_invitations')
              .update({
                status: 'completed',
                response_id: data.id
              })
              .eq('invite_token', inviteToken);
          }
        }
      }

      setSaveStatus(`Envoyé à Supabase ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      return { success: true };
    } catch (error) {
      console.error('Error submitting to Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = window.setTimeout(() => {
      saveAll();
    }, 2000);
    setAutoSaveTimer(timer);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentSection(0);
    setResponseId(null);
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SESSION_KEY);
    setSaveStatus('Formulaire réinitialisé');
    window.location.href = window.location.origin;
  };

  useEffect(() => {
    const interval = setInterval(saveAll, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  useEffect(() => {
    if (formData.ts) {
      const savedDate = new Date(formData.ts);
      setSaveStatus(`Restauré ${savedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ${savedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
    }
  }, []);

  return (
    <FormContext.Provider value={{
      formData,
      updateField,
      saveStatus,
      currentSection,
      setCurrentSection,
      saveAll,
      submitToSupabase,
      responseId,
      resetForm
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}
