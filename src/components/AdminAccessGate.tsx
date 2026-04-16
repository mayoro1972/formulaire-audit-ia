import { FormEvent, ReactNode, useState } from 'react';
import { ArrowLeft, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/useAdminAuth';
import { isSupabaseConfigured, supabaseConfigMessage } from '../lib/supabase';

interface AdminAccessGateProps {
  title: string;
  description: string;
  onBack?: () => void;
  children: ReactNode;
}

export default function AdminAccessGate({
  title,
  description,
  onBack,
  children,
}: AdminAccessGateProps) {
  const { session, user, isLoading, isCheckingAdmin, isAdmin, sendMagicLink, signOut } = useAdminAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [sendingLink, setSendingLink] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingLink(true);
    setFeedback('');
    setError('');

    const result = await sendMagicLink(email);

    if (result.success) {
      setFeedback(
        'Lien de connexion envoyé. Ouvrez votre email admin puis revenez ici après validation.'
      );
    } else {
      setError(result.error || 'Impossible d’envoyer le lien de connexion.');
    }

    setSendingLink(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6">
          <div className="audit-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-800">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Accès admin indisponible</div>
                <div className="text-sm text-slate-500">{title}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{supabaseConfigMessage}</p>
            {onBack && (
              <button onClick={onBack} className="audit-button audit-button-secondary mt-5">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6">
          <div className="audit-card text-center">
            <div className="mx-auto inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
            <h1 className="display-font mt-5 text-3xl font-semibold text-slate-950">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Vérification de la session admin en cours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6">
          <div className="audit-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                <div className="text-sm text-slate-500">{description}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block">Email administrateur</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@entreprise.com"
                  required
                />
              </div>

              <div className="audit-note audit-note-info">
                Un lien de connexion sécurisé sera envoyé par email. L’accès reste réservé au compte
                configuré comme administrateur dans Supabase.
              </div>

              {feedback && (
                <div className="audit-note audit-note-success">
                  <div className="font-medium text-emerald-900">{feedback}</div>
                </div>
              )}

              {error && (
                <div className="audit-note audit-note-danger">
                  <div className="font-medium text-red-900">{error}</div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={sendingLink || !email.trim()}
                  className="audit-button audit-button-primary border-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingLink ? 'Envoi...' : 'Recevoir un lien de connexion'}
                </button>
                {onBack && (
                  <button type="button" onClick={onBack} className="audit-button audit-button-secondary">
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pb-12">
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6">
          <div className="audit-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Compte non autorisé</div>
                <div className="text-sm text-slate-500">{user?.email || 'Utilisateur connecté'}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Cette session est bien connectée, mais elle ne correspond pas au compte admin autorisé
              pour cet espace.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => void signOut()} className="audit-button audit-button-primary border-0">
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
              {onBack && (
                <button onClick={onBack} className="audit-button audit-button-secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-6">
        <div className="audit-note audit-note-info flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold text-blue-900">Session admin active</div>
            <div className="text-sm text-blue-950/80">{user?.email}</div>
          </div>
          <button onClick={() => void signOut()} className="audit-button audit-button-secondary">
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
