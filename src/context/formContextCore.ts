import { createContext, useContext } from 'react';
import type { FormData, FormFieldValue } from '../types/form';

export interface LoadFormDataOptions {
  reset?: boolean;
  clearResponseId?: boolean;
  saveStatus?: string;
  section?: number;
}

export type SubmitResult =
  | { success: true; responseId: string }
  | { success: false; error?: string };

export interface FormContextType {
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

export const FormContext = createContext<FormContextType | undefined>(undefined);

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}
