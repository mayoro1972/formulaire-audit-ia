import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getAppBaseUrl } from '../lib/appUrl';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AdminAuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isCheckingAdmin: boolean;
  isAdmin: boolean;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

function normalizeEmail(value: string | null | undefined) {
  return (value || '').trim().toLowerCase();
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAdminStatus = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    const currentUser = session?.user;
    if (!currentUser) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    setIsCheckingAdmin(true);

    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('admin_email')
        .limit(1)
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        return;
      }

      const adminEmail = normalizeEmail(data?.admin_email);
      const userEmail = normalizeEmail(currentUser.email);
      setIsAdmin(Boolean(adminEmail) && adminEmail === userEmail);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsCheckingAdmin(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void refreshAdminStatus();
  }, [refreshAdminStatus]);

  const sendMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: getAppBaseUrl(),
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Impossible d’envoyer le lien de connexion.',
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsAdmin(false);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      user: session?.user || null,
      isLoading,
      isCheckingAdmin,
      isAdmin,
      sendMagicLink,
      signOut,
      refreshAdminStatus,
    }),
    [isAdmin, isCheckingAdmin, isLoading, refreshAdminStatus, sendMagicLink, session, signOut]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
