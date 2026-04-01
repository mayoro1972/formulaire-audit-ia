import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Plus, Trash2, Send, ArrowLeft } from 'lucide-react';

interface Invitee {
  name: string;
  email: string;
}

interface SendInvitationsProps {
  onBack?: () => void;
}

export default function SendInvitations({ onBack }: SendInvitationsProps) {
  const [invitees, setInvitees] = useState<Invitee[]>([{ name: '', email: '' }]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

    setSending(true);
    setError('');
    setSuccess(false);

    try {
      const invitationsToCreate = validInvitees.map(inv => ({
        invitee_name: inv.name,
        invitee_email: inv.email,
        invite_token: generateToken(),
        created_by: 'admin',
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

      const baseUrl = window.location.origin;
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-emailjs-invitation`;

      let successCount = 0;
      let failureCount = 0;
      let errorMessages: string[] = [];

      for (const invitation of data) {
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
                  <li>• Le formulaire pré-remplit son nom et email automatiquement</li>
                  <li>• Quand il soumet le formulaire, vous recevez ses réponses</li>
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
