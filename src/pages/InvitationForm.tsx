import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, MailCheck, ShieldAlert } from 'lucide-react';
import { FormProvider } from '../context/FormContext';
import { useForm } from '../context/formContextCore';
import {
  getSupabaseFunctionHeaders,
  getSupabaseFunctionUrl,
  isSupabaseConfigured,
  supabaseConfigMessage,
} from '../lib/supabase';
import type { FormData } from '../types/form';
import { getAppBaseUrl } from '../lib/appUrl';
import App from '../App';

interface InvitationPayload {
  invitee_name: string;
  invitee_email: string;
  expires_at: string;
  draft_form_data: Partial<FormData>;
}

function InvitationFormContent() {
  const [token, setToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { loadFormData } = useForm();

  const loadInvitation = useCallback(
    async (inviteToken: string) => {
      if (!isSupabaseConfigured) {
        setError(supabaseConfigMessage);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getSupabaseFunctionUrl('resolve-invitation'), {
          method: 'POST',
          headers: await getSupabaseFunctionHeaders(),
          body: JSON.stringify({ inviteToken }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.invitation) {
          setError(payload?.error || 'Invitation invalide ou expirée');
          setLoading(false);
          return;
        }

        const invitationData = payload.invitation as InvitationPayload;
        setInvitation(invitationData);
        const draftFormData =
          invitationData.draft_form_data &&
          typeof invitationData.draft_form_data === 'object' &&
          !Array.isArray(invitationData.draft_form_data)
            ? (invitationData.draft_form_data as Partial<FormData>)
            : {};

        loadFormData(
          {
            ...draftFormData,
            c_nom: invitationData.invitee_name,
            c_email: invitationData.invitee_email,
            email_dest: '',
            email_cc: '',
            email_msg: '',
          },
          {
            reset: true,
            clearResponseId: true,
            saveStatus: 'Formulaire prérempli depuis une invitation',
            section: 0,
          }
        );

        setLoading(false);
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError("Erreur lors du chargement de l'invitation");
        setLoading(false);
      }
    },
    [loadFormData]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');

    if (inviteToken) {
      setToken(inviteToken);
      loadInvitation(inviteToken);
    } else {
      setLoading(false);
    }
  }, [loadInvitation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="audit-card max-w-lg text-center">
          <div className="mx-auto inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
          <h1 className="display-font mt-5 text-3xl font-semibold text-slate-950">Chargement de votre invitation</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Nous vérifions le lien, chargeons le brouillon éventuel puis préparons votre session.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="audit-card max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="display-font mt-5 text-3xl font-semibold text-slate-950">Invitation indisponible</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{error}</p>
          <button
            onClick={() => {
              window.location.href = getAppBaseUrl();
            }}
            className="audit-button audit-button-primary mt-6 border-0"
          >
            Revenir à l’accueil
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (invitation) {
    return (
      <div>
        <div className="mx-auto max-w-[1560px] px-3 pt-4 md:px-5">
          <div className="panel-dark rounded-[28px] border border-white/10 px-5 py-5 text-white md:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="audit-pill bg-white/10 text-white/80">Invitation nominative</div>
                <h1 className="display-font mt-4 text-2xl font-semibold md:text-3xl">
                  Bonjour {invitation.invitee_name}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-white/72">
                  Votre lien est valide et votre formulaire a été prérempli avec les informations connues.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-400/12 p-3 text-emerald-100">
                    <MailCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Invitation active</div>
                    <div className="text-xs text-white/60">{invitation.invitee_email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <App invitationToken={token} withProvider={false} />
      </div>
    );
  }

  return <App />;
}

export default function InvitationForm() {
  return (
    <FormProvider>
      <InvitationFormContent />
    </FormProvider>
  );
}
