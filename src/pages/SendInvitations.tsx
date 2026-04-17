import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, Plus, Send, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import {
  getSupabaseFunctionHeaders,
  getSupabaseFunctionUrl,
  isSupabaseConfigured,
  supabase,
  supabaseConfigMessage,
} from '../lib/supabase';
import { useForm } from '../context/formContextCore';
import { DEFAULT_FORM_DESTINATION_EMAIL } from '../lib/emailRouting';
import { createInvitationDraft, hasDraftContent } from '../lib/formDefaults';
import type { Database } from '../lib/database.types';
import { buildInviteUrl } from '../lib/appUrl';

interface Invitee {
  name: string;
  email: string;
}

interface SendInvitationsProps {
  onBack?: () => void;
  prefillInvitee?: Invitee | null;
}

function generateSecureInviteToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `invite_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  const randomPart = Math.random().toString(36).slice(2, 15);
  return `invite_${Date.now()}_${randomPart}`;
}

export default function SendInvitations({ onBack, prefillInvitee = null }: SendInvitationsProps) {
  const { formData, saveAll } = useForm();
  const initialRoutingRef = useRef({
    responseEmail: DEFAULT_FORM_DESTINATION_EMAIL,
    responseCc: formData.email_cc,
    includeDraft: hasDraftContent(formData),
  });
  const responseCcEditedRef = useRef(false);
  const includeDraftEditedRef = useRef(false);

  const [invitees, setInvitees] = useState<Invitee[]>(
    prefillInvitee ? [{ name: prefillInvitee.name, email: prefillInvitee.email }] : [{ name: '', email: '' }]
  );
  const [responseEmail, setResponseEmail] = useState(DEFAULT_FORM_DESTINATION_EMAIL);
  const [responseCc, setResponseCc] = useState('');
  const [includeCurrentDraft, setIncludeCurrentDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const hasCurrentDraft = hasDraftContent(formData);
  const validInvitees = invitees.filter((invitee) => invitee.name.trim() && invitee.email.trim());

  useEffect(() => {
    if (prefillInvitee?.email || prefillInvitee?.name) {
      setInvitees([{ name: prefillInvitee.name, email: prefillInvitee.email }]);
    }
  }, [prefillInvitee]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setResponseEmail(DEFAULT_FORM_DESTINATION_EMAIL);
      setResponseCc((currentValue) =>
        responseCcEditedRef.current ? currentValue : initialRoutingRef.current.responseCc || ''
      );
      setIncludeCurrentDraft((currentValue) =>
        includeDraftEditedRef.current ? currentValue : initialRoutingRef.current.includeDraft
      );
      return;
    }

    let isMounted = true;

    const loadDefaults = async () => {
      try {
        const { data } = await supabase.from('admin_settings').select('admin_email').limit(1).maybeSingle();
        const adminSettings = data as Pick<Database['public']['Tables']['admin_settings']['Row'], 'admin_email'> | null;

        if (!isMounted) return;

        setResponseEmail(initialRoutingRef.current.responseEmail || adminSettings?.admin_email || DEFAULT_FORM_DESTINATION_EMAIL);
        setResponseCc((currentValue) =>
          responseCcEditedRef.current ? currentValue : initialRoutingRef.current.responseCc || ''
        );
        setIncludeCurrentDraft((currentValue) =>
          includeDraftEditedRef.current ? currentValue : initialRoutingRef.current.includeDraft
        );
      } catch {
        if (!isMounted) return;
        setResponseEmail(DEFAULT_FORM_DESTINATION_EMAIL);
        setResponseCc((currentValue) =>
          responseCcEditedRef.current ? currentValue : initialRoutingRef.current.responseCc || ''
        );
        setIncludeCurrentDraft((currentValue) =>
          includeDraftEditedRef.current ? currentValue : initialRoutingRef.current.includeDraft
        );
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
    setInvitees(invitees.filter((_, inviteeIndex) => inviteeIndex !== index));
  };

  const updateInvitee = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...invitees];
    updated[index][field] = value;
    setInvitees(updated);
  };

  const sendInvitations = async () => {
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }

    if (validInvitees.length === 0) {
      setError('Veuillez ajouter au moins un destinataire avec nom et email.');
      return;
    }

    if (!responseEmail.trim()) {
      setError("Veuillez renseigner l’email qui recevra les formulaires complétés.");
      return;
    }

    setSending(true);
    setError('');
    setSuccess(false);

    try {
      saveAll();

      const invitationDraft = includeCurrentDraft ? createInvitationDraft(formData) : {};
      const invitationsToCreate = validInvitees.map((invitee) => ({
        invitee_name: invitee.name,
        invitee_email: invitee.email,
        invite_token: generateSecureInviteToken(),
        created_by: formData.c_nom || 'admin',
        response_email: responseEmail.trim(),
        response_cc: responseCc.trim(),
        draft_form_data: invitationDraft,
      }));

      const { data, error: insertError } = await supabase.from('form_invitations').insert(invitationsToCreate).select();

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Un ou plusieurs emails existent déjà dans les invitations.');
        } else {
          setError(`Erreur lors de la création : ${insertError.message || 'Erreur inconnue'}`);
        }
        setSending(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Aucune invitation n'a été créée.");
        setSending(false);
        return;
      }

      const createdInvitations = data as Database['public']['Tables']['form_invitations']['Row'][];
      const edgeFunctionUrl = getSupabaseFunctionUrl('send-invitation-email');
      const functionHeaders = await getSupabaseFunctionHeaders();

      let successCount = 0;
      let failureCount = 0;
      const errorMessages: string[] = [];

      for (const invitation of createdInvitations) {
        const inviteLink = buildInviteUrl(invitation.invite_token);

        try {
          const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: functionHeaders,
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

          successCount++;
          await supabase
            .from('form_invitations')
            .update({ email_sent_at: new Date().toISOString() })
            .eq('id', invitation.id);
        } catch (emailError: unknown) {
          const emailMessage = emailError instanceof Error ? emailError.message : "Erreur d'envoi";
          errorMessages.push(`${invitation.invitee_email}: ${emailMessage}`);
          failureCount++;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (successCount > 0) {
        setSuccess(true);
        setInvitees([{ name: '', email: '' }]);
      }

      if (failureCount > 0) {
        const errorDetail = errorMessages.length > 0 ? `\n\nDétails : ${errorMessages.join('; ')}` : '';
        setError(`${successCount} email(s) envoyé(s), ${failureCount} échec(s).${errorDetail}`);
      }
    } catch (err) {
      console.error('Error sending invitations:', err);
      setError('Erreur lors de la création des invitations.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
        <div className="audit-section-header mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="audit-pill bg-blue-100 text-blue-800">Invitations</span>
            <span className="audit-pill bg-emerald-100 text-emerald-800">Lien unique + brouillon</span>
          </div>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="display-font text-3xl font-semibold text-slate-950 md:text-4xl">
                Préparer l’envoi du formulaire d’audit
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Créez un lien nominatif, choisissez l’email de retour et décidez si le prospect doit
                recevoir un brouillon déjà prérempli avant l’audit.
              </p>
            </div>

            {onBack && (
              <button onClick={onBack} className="audit-button audit-button-secondary">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            )}
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="audit-note audit-note-warn mb-6">
            <div className="font-semibold text-amber-900">Backend non configuré</div>
            <p className="mt-1 text-amber-950/80">{supabaseConfigMessage}</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="space-y-6">
            <div className="audit-card">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Destinataires</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Saisissez les prospects à inviter dans le parcours d’audit.
                  </p>
                </div>
                <span className="audit-pill bg-blue-100 text-blue-800">{validInvitees.length} prêt(s) à envoyer</span>
              </div>

              {prefillInvitee && (
                <div className="audit-note audit-note-info mb-4">
                  Le prospect sélectionné depuis le dashboard a été prérempli. Vous pouvez compléter
                  ou modifier les informations avant l’envoi.
                </div>
              )}

              <div className="space-y-4">
                {invitees.map((invitee, index) => (
                  <div key={index} className="rounded-[22px] border border-slate-900/8 bg-white/75 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Destinataire {index + 1}</div>
                          <div className="text-xs text-slate-500">Lien d’invitation unique</div>
                        </div>
                      </div>

                      {invitees.length > 1 && (
                        <button
                          onClick={() => removeInvitee(index)}
                          className="audit-button !rounded-2xl !border !border-red-200 !bg-red-50 !px-3 !py-2 !text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block">Nom complet</label>
                        <input
                          type="text"
                          value={invitee.name}
                          onChange={(event) => updateInvitee(index, 'name', event.target.value)}
                          placeholder="ex: Jean Dupont"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block">Email</label>
                        <input
                          type="email"
                          value={invitee.email}
                          onChange={(event) => updateInvitee(index, 'email', event.target.value)}
                          placeholder="ex: nom@entreprise.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addInvitee} className="audit-button audit-button-ghost mt-5">
                <Plus className="h-4 w-4" />
                Ajouter un destinataire
              </button>
            </div>

            <div className="audit-card">
              <div className="mb-5 border-b border-slate-900/8 pb-4">
                  <div className="text-sm font-semibold text-slate-900">Routage des réponses</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Choisissez où le formulaire complété sera retourné.
                  </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block">Email recevant le formulaire complété</label>
                  <input
                    type="email"
                    value={responseEmail}
                    readOnly
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Les formulaires complétés sont routés automatiquement vers {DEFAULT_FORM_DESTINATION_EMAIL}.
                  </p>
                </div>
                <div>
                  <label className="mb-2 block">Email en copie (optionnel)</label>
                  <input
                    type="email"
                    value={responseCc}
                    onChange={(event) => {
                      responseCcEditedRef.current = true;
                      setResponseCc(event.target.value);
                    }}
                    placeholder="ex: supervision@entreprise.com"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Copie informative du formulaire complété.
                  </p>
                </div>
              </div>
            </div>

            <div className="audit-card">
              <div className="mb-5 border-b border-slate-900/8 pb-4">
                <div className="text-sm font-semibold text-slate-900">Message personnalisé</div>
                <p className="mt-1 text-sm text-slate-500">
                  Ce texte sera ajouté dans l’email d’invitation après le lien.
                </p>
              </div>

              <textarea
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                placeholder="Ajoutez un message personnel qui contextualise la demande."
                rows={4}
              />
            </div>

            <div className="audit-card">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={includeCurrentDraft}
                  onChange={(event) => {
                    includeDraftEditedRef.current = true;
                    setIncludeCurrentDraft(event.target.checked);
                  }}
                  disabled={!hasCurrentDraft}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Inclure le brouillon actuel comme premier snapshot
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {hasCurrentDraft
                      ? 'Le client ouvrira le lien avec le brouillon actuel déjà prérempli et pourra le compléter.'
                      : "Aucun brouillon significatif n'a encore été saisi dans le formulaire principal."}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="audit-card">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Synthèse envoi</div>
              <div className="display-font mt-2 text-4xl font-semibold text-slate-950">{validInvitees.length}</div>
              <div className="mt-2 text-sm text-slate-500">invitation(s) prête(s).</div>

              <div className="mt-5 space-y-3">
                <div className="rounded-[20px] border border-slate-900/8 bg-white/75 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Email de retour</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{responseEmail || 'A renseigner'}</div>
                </div>
                <div className="rounded-[20px] border border-slate-900/8 bg-white/75 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Brouillon inclus</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{includeCurrentDraft ? 'Oui' : 'Non'}</div>
                </div>
              </div>

              <button
                onClick={sendInvitations}
                disabled={sending}
                className="audit-button audit-button-primary mt-5 w-full border-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Envoi en cours...' : `Envoyer ${validInvitees.length} invitation(s)`}
              </button>
            </div>

            {success && (
              <div className="audit-note audit-note-success">
                <div className="font-semibold text-emerald-900">Invitations envoyées</div>
                <p className="mt-1 text-emerald-950/80">
                  Les destinataires vont recevoir leurs emails d’invitation.
                </p>
              </div>
            )}

            {error && (
              <div className="audit-note audit-note-danger">
                <div className="whitespace-pre-line text-red-950/90">{error}</div>
              </div>
            )}

            <div className="audit-card">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Comment le flux fonctionne</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Les invitations sont stockées en base puis expédiées via l’Edge Function.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm leading-6 text-slate-600">
                <li>Chaque invitation génère un lien unique.</li>
                <li>Le formulaire préremplit le nom, l’email et l’éventuel brouillon.</li>
                <li>Quand le client soumet, le dossier repart vers l’email de retour configuré.</li>
                <li>Toutes les soumissions restent visibles dans le dashboard admin.</li>
              </ul>
            </div>

            <div className="audit-card">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Lien généré</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Exemple de structure pour vérifier le parcours.
                  </p>
                </div>
              </div>
              <div className="rounded-[18px] border border-slate-900/8 bg-slate-50/85 px-4 py-3 text-xs text-slate-600 break-all">
                {buildInviteUrl('invite_demo_token')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
