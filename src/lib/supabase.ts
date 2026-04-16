import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const fallbackSupabaseUrl = 'https://placeholder.supabase.co';
const fallbackSupabaseAnonKey = 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigMessage =
  "Les variables d'environnement Supabase ne sont pas configurées. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour activer la persistance, les invitations et les emails.";

// Keep the app renderable in local/demo mode even when Supabase is not configured.
export const supabase = createClient<Database>(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseAnonKey
);

export function getSupabaseFunctionUrl(functionName: string) {
  if (!supabaseUrl) {
    throw new Error(supabaseConfigMessage);
  }

  return `${supabaseUrl}/functions/v1/${functionName}`;
}

export async function getSupabaseFunctionHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const bearerToken = session?.access_token || supabaseAnonKey || fallbackSupabaseAnonKey;

  return {
    Authorization: `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  };
}
