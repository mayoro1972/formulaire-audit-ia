import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseConfigMessage = isSupabaseConfigured
  ? ''
  : 'Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ne sont pas configurées. L\'application fonctionne en mode local sans backend.';

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient<Database>>);
