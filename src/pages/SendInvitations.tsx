import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Plus, Trash2, Send, ArrowLeft } from 'lucide-react';
import { useForm } from '../context/FormContext';
import { createInvitationDraft, hasDraftContent } from '../lib/formDefaults';
import type { Database } from '../lib/database.types';

interface Invitee {
  name: string;
  email: string;
}

interface SendInvitationsProps {
  onBack?: () => void;
}

export default function SendInvitations({ onBack }: SendInvitationsProps) {
  const { formData, saveAll } = useForm();
  const [invitees, setInvitees] = useState<Invitee[]>([
    { name: 'Marc Odia', email: 'Marc.odja@cba-ca.com' },
    { name: 'Samy  Camara', email: 'Samy.Camara@cba-ca.com' },
    { name: 'Vincent AGBADOU', email: 'Vincent.Agbadou@cba-ca.com' }
  ]);
  const [responseEmail, setResponseEmail] = useState('');
  const [responseCc, setResponseCc] = useState('');
  const [includeCurrentDraft, setIncludeCurrentDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const hasCurrentDraft = hasDraftContent(formData);

  useEffect(() => {
    let isMounted = true;

    const loadDefaults = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('admin_email')
          .limit(1)
          .maybeSingle();

        const adminSettings = data as Pick<Database['public']['Tables']['admin_settings']['Row'], 'admin_email'> | null;

        if (!isMounted) return;

        setResponseEmail(formData.email_dest || adminSettings?.admin_email || '');
        setResponseCc(formData.email_cc || '');
        setIncludeCurrentDraft(hasCurrentDraft);
      } catch (loadError) {
        if (!isMounted) return;
        setResponseEmail(formData.email_dest || '');
        setResponseCc(formData.email_cc || '');
        setIncludeCurrentDraft(hasCurrentDraft);
      }
    };

    loadDefaults();

    return () => {
      isMounted = false;
    };
  }, []);

  const addInvitee = () => {
    setInvitees([...invitees, { name: '', email: '' }]);
  };

  const removeInvitee = (index: number) => {
    setInvitees(invitees.filter((_, i) => i !== index));
  };

  const updateInvitee = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...invitees];
    updated[index][field] = value;
    setInvitees(updated);
  };

  const generateToken = () => {
    return `invite_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const sendInvitations = async () => {
    const validInvitees = invitees.filter(inv => inv.name.trim() && inv.email.trim());

    if (validInvitees.length === 0) {
      setError('Veuillez ajouter au moins un destinataire avec nom et email');
      return;
    }

    if (!responseEmail.trim()) {
      setError("Veuillez renseigner l'email qui recevra les formulaires complétés.");
      return;
    }

    setSending(true);
    setError('');
    setSuccess(false);

    try {
      saveAll();

      const invitationDraft = includeCurrentDraft ? createInvitationDraft(formData) : {};
      const invitationsToCreate = validInvitees.map(inv => ({
        invitee_name: inv.name,
        invitee_email: inv.email,
        invite_token: generateToken(),
        created_by: formData.c_nom || 'admin',
        response_email: responseEmail.trim(),
        response_cc: responseCc.trim(),
        draft_form_data: invitationDraft,
      }));

      const { data, error: insertError } = await supabase
        .from('form_invitations')
        .insert(invitationsToCreate)
        .select();

      if (insertError) {
        console.error('Insert error details:', insertError);

        if (insertError.code === '23505') {
          setError('Un ou plusieurs emails existent déjà dans les invitations. Veuillez vérifier.');
        } else {
          setError(`Erreur lors de la création: ${insertError.message || 'Erreur inconnue'}`);
        }
        setSending(false);
        return;
      }

      if (!data || data.length === 0) {
        setError('Aucune invitation n\'a été créée');
        setSending(false);
        return;
      }

      const createdInvitations = data as Database['public']['Tables']['form_invitations']['Row'][];

      const baseUrl = window.location.origin;
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation-email`;

      let successCount = 0;
      let failureCount = 0;
      const errorMessages: string[] = [];

      for (const invitation of createdInvitations) {
        const inviteLink = `${baseUrl}/?invite=${invitation.invite_token}`;

        try {
          const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              invitee_name: invitation.invitee_name,
              invitee_email: invitation.invitee_email,
              invite_link: inviteLink,
              has_prefilled_draft: includeCurrentDraft,
              custom_message: customMessage.trim(),
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to send email');
          }

          console.log('Email sent successfully to:', invitation.invitee_email);
          successCount++;

          await supabase
            .from('form_invitations')
            .update({ email_sent_at: new Date().toISOString() })
            .eq('id', invitation.id);

        } catch (emailError: any) {
          console.error('Error sending email to', invitation.invitee_email, emailError);
          errorMessages.push(`${invitation.invitee_email}: ${emailError.message || 'Erreur d\'envoi'}`);
          failureCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (successCount > 0) {
        setSuccess(true);
        setInvitees([{ name: '', email: '' }]);
      }

      if (failureCount > 0) {
        const errorDetail = errorMessages.length > 0 ? `\n\nDétails: ${errorMessages.join('; ')}` : '';
        setError(`${successCount} email(s) envoyé(s) avec succès, ${failureCount} échec(s)${errorDetail}`);
      }
    } catch (err) {
      console.error('Error sending invitations:', err);
      setError('Erreur lors de la création des invitations');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1FB] to-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#042C53]">Envoyer des invitations</h1>
              <p className="text-[#888780] mt-2">Invitez des utilisateurs à remplir le formulaire d'audit IA</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {invitees.map((invitee, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={invitee.name}
                      onChange={(e) => updateInvitee(index, 'name', e.target.value)}
                      placeholder="ex: Jean Dupont"
                      className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={invitee.email}
                      onChange={(e) => updateInvitee(index, 'email', e.target.value)}
                      placeholder="ex: nom@entreprise.com"
                      className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
                    />
                  </div>
                </div>
                {invitees.length > 1 && (
                  <button
                    onClick={() => removeInvitee(index)}
                    className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
                Email qui recevra le formulaire complété <span className="text-[#712B13]">*</span>
              </label>
              <input
                type="email"
                value={responseEmail}
                onChange={(e) => setResponseEmail(e.target.value)}
                placeholder="ex: equipe.audit@entreprise.com"
                className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              />
              <p className="text-xs text-[#888780] mt-1">
                C'est cette adresse qui recevra le formulaire complété par le client.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
                Email de copie (optionnel)
              </label>
              <input
                type="email"
                value={responseCc}
                onChange={(e) => setResponseCc(e.target.value)}
                placeholder="ex: supervision@entreprise.com"
                className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              />
              <p className="text-xs text-[#888780] mt-1">
                Une copie du formulaire complété peut aussi être envoyée ici.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
              Message personnalisé (optionnel)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ajoutez un message personnel qui sera inclus dans l'email d'invitation..."
              rows={4}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5] resize-none"
            />
            <p className="text-xs text-[#888780] mt-1">
              Ce message sera affiché dans l'email d'invitation après le lien.
            </p>
          </div>

          <div className="bg-[#FAEEDA] border border-[#BA7517] rounded-lg p-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCurrentDraft}
                onChange={(e) => setIncludeCurrentDraft(e.target.checked)}
                disabled={!hasCurrentDraft}
                className="w-4 h-4 mt-1 accent-[#185FA5]"
              />
              <div>
                <div className="text-sm font-semibold text-[#854F0B]">
                  Inclure le brouillon actuel comme premier snapshot
                </div>
                <p className="text-xs text-[#2C2C2A] mt-1">
                  {hasCurrentDraft
                    ? "Le client ouvrira le lien avec le brouillon actuel déjà prérempli et pourra le compléter."
                    : "Aucun brouillon significatif n'a encore été saisi dans le formulaire principal."}
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={addInvitee}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#185FA5] border border-[#185FA5] rounded-lg hover:bg-[#E6F1FB] transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter un destinataire
            </button>
            <button
              onClick={sendInvitations}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2 bg-[#185FA5] text-white rounded-lg hover:bg-[#042C53] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Envoi en cours...' : `Envoyer ${invitees.filter(inv => inv.name && inv.email).length} invitation(s)`}
            </button>
          </div>

          {success && (
            <div className="bg-[#EAF3DE] border border-[#3B6D11] rounded-lg p-4 mb-4">
              <p className="text-[#3B6D11] font-medium">
                ✓ Invitations envoyées avec succès ! Les destinataires vont recevoir leurs emails d'invitation.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-[#FAECE7] border border-[#712B13] rounded-lg p-4 mb-4">
              <p className="text-[#712B13] whitespace-pre-line">{error}</p>
            </div>
          )}

          <div className="bg-[#E6F1FB] rounded-lg p-6 border border-[#185FA5]">
            <div className="flex gap-3 mb-3">
              <Mail className="w-5 h-5 text-[#185FA5] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#042C53] mb-2">Comment fonctionne le système d'invitations ?</h3>
                <ul className="text-sm text-[#185FA5] space-y-2">
                  <li>• Chaque invitation génère un lien unique valide 30 jours</li>
                  <li>• L'utilisateur reçoit un email avec le lien personnalisé</li>
                  <li>• Le formulaire pré-remplit son nom, son email et peut reprendre un brouillon déjà préparé</li>
                  <li>• Quand il soumet le formulaire, il est envoyé à l'email de retour défini ci-dessus</li>
                  <li>• Toutes les soumissions sont visibles dans le dashboard admin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
