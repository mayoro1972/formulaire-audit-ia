import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormData, FormFieldValue } from '../types/form';
import { supabase } from '../lib/supabase';
import { createInitialFormData, mergeWithInitialFormData } from '../lib/formDefaults';

const SAVE_KEY = 'audit_ia_gerard_v2';
const SESSION_KEY = 'audit_session_id';

interface LoadFormDataOptions {
  reset?: boolean;
  clearResponseId?: boolean;
  saveStatus?: string;
  section?: number;
}

type SubmitResult =
  | { success: true; responseId: string }
  | { success: false; error?: string };

interface FormContextType {
  formData: FormData;
  updateField: (field: string, value: FormFieldValue) => void;
  loadFormData: (data: Partial<FormData>, options?: LoadFormDataOptions) => void;
  saveStatus: string;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  saveAll: () => void;
  submitToSupabase: () => Promise<SubmitResult>;
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
        return mergeWithInitialFormData(parsed);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return createInitialFormData();
  });

  const [saveStatus, setSaveStatus] = useState('Non sauvegardé');
  const [currentSection, setCurrentSection] = useState(0);
  const [autoSaveTimer, setAutoSaveTimer] = useState<number | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [sessionId] = useState<string>(getOrCreateSessionId());

  const persistFormData = (data: FormData, statusOverride?: string) => {
    try {
      const dataToSave = { ...data, ts: new Date().toISOString() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      const now = new Date();
      setSaveStatus(
        statusOverride ||
          `Sauvegardé ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (error) {
      setSaveStatus('Erreur de sauvegarde');
    }
  };

  const saveAll = () => {
    persistFormData(formData);
  };

  const calculateCompletionPercentage = (data: FormData): number => {
    const totalFields = Object.keys(createInitialFormData()).length;
    let filledFields = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'ts' || key === 'libreRowCount') return;
      if (typeof value === 'boolean' && value === true) filledFields++;
      else if (typeof value === 'string' && value.trim() !== '') filledFields++;
      else if (typeof value === 'number' && value > 0) filledFields++;
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  const loadFormData = (data: Partial<FormData>, options: LoadFormDataOptions = {}) => {
    const nextData = options.reset
      ? mergeWithInitialFormData(data)
      : mergeWithInitialFormData({ ...formData, ...data });

    setFormData(nextData);

    if (options.clearResponseId ?? options.reset) {
      setResponseId(null);
    }

    if (typeof options.section === 'number') {
      setCurrentSection(options.section);
    }

    persistFormData(
      nextData,
      options.saveStatus || (options.reset ? 'Formulaire prérempli' : undefined)
    );
  };

  const submitToSupabase = async (): Promise<SubmitResult> => {
    try {
      const completionPercentage = calculateCompletionPercentage(formData);
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite') || '';
      let targetResponseId = responseId;

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

      if (!targetResponseId) {
        const existingResponseQuery = supabase
          .from('form_responses')
          .select('id')
          .order('submitted_at', { ascending: false })
          .limit(1);

        const { data: existingResponse, error: existingError } = inviteToken
          ? await existingResponseQuery.eq('invitation_token', inviteToken).maybeSingle()
          : await existingResponseQuery.eq('session_id', sessionId).maybeSingle();

        if (existingError) throw existingError;
        if (existingResponse?.id) {
          targetResponseId = existingResponse.id;
          setResponseId(existingResponse.id);
        }
      }

      if (targetResponseId) {
        const { error } = await supabase
          .from('form_responses')
          .update(payload)
          .eq('id', targetResponseId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('form_responses')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          targetResponseId = data.id;
          setResponseId(data.id);
        }
      }

      if (inviteToken && targetResponseId) {
        await supabase
          .from('form_invitations')
          .update({
            status: 'completed',
            response_id: targetResponseId,
          })
          .eq('invite_token', inviteToken);
      }

      setSaveStatus(`Envoyé à Supabase ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      return { success: true, responseId: targetResponseId || '' };
    } catch (error) {
      console.error('Error submitting to Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const updateField = (field: string, value: FormFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = window.setTimeout(() => {
      saveAll();
    }, 2000);
    setAutoSaveTimer(timer);
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
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
      loadFormData,
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
