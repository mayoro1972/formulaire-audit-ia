import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { FormData, FormFieldValue } from '../types/form';
import { createInitialFormData, mergeWithInitialFormData } from '../lib/formDefaults';
import { getAppBaseUrl } from '../lib/appUrl';
import {
  getSupabaseFunctionHeaders,
  getSupabaseFunctionUrl,
  isSupabaseConfigured,
  supabaseConfigMessage,
} from '../lib/supabase';
import { FormContext, LoadFormDataOptions, SubmitResult } from './formContextCore';

const SAVE_KEY = 'audit_ia_gerard_v2';
const SESSION_KEY = 'audit_session_id';
const RESPONSE_ID_KEY = 'audit_response_id';

function createStableRandomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  const randomPart = Math.random().toString(36).slice(2, 11);
  return `${prefix}_${Date.now()}_${randomPart}`;
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = createStableRandomId('session');
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
  const [responseId, setResponseId] = useState<string | null>(() => localStorage.getItem(RESPONSE_ID_KEY));
  const [sessionId] = useState<string>(getOrCreateSessionId());
  const autoSaveTimerRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);

  const persistFormData = useCallback((data: FormData, statusOverride?: string) => {
    try {
      const dataToSave = { ...data, ts: new Date().toISOString() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      const now = new Date();
      setSaveStatus(
        statusOverride ||
          `Sauvegardé ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch {
      setSaveStatus('Erreur de sauvegarde');
    }
  }, []);

  const saveAll = useCallback(() => {
    persistFormData(formData);
  }, [formData, persistFormData]);

  const calculateCompletionPercentage = useCallback((data: FormData): number => {
    const totalFields = Object.keys(createInitialFormData()).length;
    let filledFields = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'ts' || key === 'libreRowCount') return;
      if (typeof value === 'boolean' && value === true) filledFields++;
      else if (typeof value === 'string' && value.trim() !== '') filledFields++;
      else if (typeof value === 'number' && value > 0) filledFields++;
    });

    return Math.round((filledFields / totalFields) * 100);
  }, []);

  const loadFormData = useCallback((data: Partial<FormData>, options: LoadFormDataOptions = {}) => {
    setFormData((previousFormData) => {
      const nextData = options.reset
        ? mergeWithInitialFormData(data)
        : mergeWithInitialFormData({ ...previousFormData, ...data });

      persistFormData(
        nextData,
        options.saveStatus || (options.reset ? 'Formulaire prérempli' : undefined)
      );

      return nextData;
    });

    if (options.clearResponseId ?? options.reset) {
      setResponseId(null);
      localStorage.removeItem(RESPONSE_ID_KEY);
    }

    if (typeof options.section === 'number') {
      setCurrentSection(options.section);
    }
  }, [persistFormData]);

  const submitToSupabase = useCallback(async (): Promise<SubmitResult> => {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: supabaseConfigMessage };
      }

      const completionPercentage = calculateCompletionPercentage(formData);
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite') || '';
      const response = await fetch(getSupabaseFunctionUrl('save-form-response'), {
        method: 'POST',
        headers: await getSupabaseFunctionHeaders(),
        body: JSON.stringify({
          formData,
          completionPercentage,
          sessionId,
          inviteToken: inviteToken || undefined,
          responseId: responseId || undefined,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.responseId) {
        throw new Error(result?.error || 'Impossible d’enregistrer la réponse.');
      }

      const targetResponseId = String(result.responseId);
      setResponseId(targetResponseId);
      localStorage.setItem(RESPONSE_ID_KEY, targetResponseId);
      setSaveStatus(`Envoyé à Supabase ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      return { success: true, responseId: targetResponseId };
    } catch (error) {
      console.error('Error submitting to Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [calculateCompletionPercentage, formData, responseId, sessionId]);

  useEffect(() => {
    if (responseId) {
      localStorage.setItem(RESPONSE_ID_KEY, responseId);
    }
  }, [responseId]);

  const updateField = useCallback((field: string, value: FormFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(createInitialFormData());
    setCurrentSection(0);
    setResponseId(null);
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(RESPONSE_ID_KEY);
    setSaveStatus('Formulaire réinitialisé');
    window.location.href = getAppBaseUrl();
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      persistFormData(formData);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, persistFormData]);

  useEffect(() => {
    if (formData.ts) {
      const savedDate = new Date(formData.ts);
      setSaveStatus(`Restauré ${savedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ${savedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
    }
  }, [formData.ts]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      persistFormData(formData);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, persistFormData]);

  useEffect(() => () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
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
