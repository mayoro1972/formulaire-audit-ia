import { useState, useEffect } from 'react';
import { FormProvider, useForm } from '../context/FormContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { FormData } from '../types/form';
import App from '../App';

function InvitationFormContent() {
  const [token, setToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Database['public']['Tables']['form_invitations']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { loadFormData } = useForm();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');

    if (inviteToken) {
      setToken(inviteToken);
      loadInvitation(inviteToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadInvitation = async (inviteToken: string) => {
    try {
      const { data, error } = await supabase
        .from('form_invitations')
        .select('*')
        .eq('invite_token', inviteToken)
        .maybeSingle();

      if (error) throw error;
      const invitationData = data as Database['public']['Tables']['form_invitations']['Row'] | null;

      if (!invitationData) {
        setError('Invitation invalide ou expirée');
        setLoading(false);
        return;
      }

      if (invitationData.status === 'completed') {
        setError('Cette invitation a déjà été utilisée');
        setLoading(false);
        return;
      }

      if (new Date(invitationData.expires_at) < new Date()) {
        await supabase
          .from('form_invitations')
          .update({ status: 'expired' })
          .eq('id', invitationData.id);

        setError('Cette invitation a expiré');
        setLoading(false);
        return;
      }

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
      setError('Erreur lors du chargement de l\'invitation');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F1FB] to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#185FA5] mb-4"></div>
          <p className="text-[#888780]">Chargement de votre invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F1FB] to-white p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#712B13] mb-4">Invitation invalide</h1>
          <p className="text-[#888780] mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#185FA5] text-white rounded-lg hover:bg-[#042C53] transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (invitation) {
    return (
      <div>
        <div className="bg-[#E6F1FB] border-b-2 border-[#185FA5] p-4 text-center">
          <p className="text-sm text-[#185FA5]">
            Bonjour <strong>{invitation.invitee_name}</strong>, bienvenue dans votre formulaire d'audit IA
          </p>
        </div>
        <App invitationToken={token} />
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
