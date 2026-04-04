import { useState } from 'react';
import SuccessModal from '../components/SuccessModal';
import { useForm } from '../context/formContextCore';
import { calculateOverallProgress } from '../lib/formProgress';
import { isSupabaseConfigured, supabaseConfigMessage } from '../lib/supabase';

export default function Section10_Envoi() {
  const { formData, updateField, setCurrentSection, saveAll, submitToSupabase, resetForm } = useForm();
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'word'>('csv');
  const [sentRecipient, setSentRecipient] = useState('');
  const [protectWord, setProtectWord] = useState(true);
  const [documentPassword, setDocumentPassword] = useState('');

  const progress = calculateOverallProgress(formData);
  const urlParams = new URLSearchParams(window.location.search);
  const hasInviteToken = urlParams.get('invite') !== null;

  const notifyAdmin = async (responseId: string) => {
    if (!isSupabaseConfigured) {
      return;
    }

    const notifyAdminUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`;
    const notifyHeaders = {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(notifyAdminUrl, {
      method: 'POST',
      headers: notifyHeaders,
      body: JSON.stringify({
        user_name: formData.c_nom,
        user_email: formData.c_email,
        user_position: formData.c_poste,
        completion_percentage: progress.overall,
        response_id: responseId,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json().catch(() => null);
      throw new Error(responseData?.error || "La notification admin n'a pas pu etre envoyee.");
    }
  };

  const handleSubmitToDatabase = async () => {
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }

    setSending(true);
    setError('');
    setSavedToDatabase(false);

    try {
      const result = await submitToSupabase();

      if (result.success) {
        setSavedToDatabase(true);
        saveAll();
        setShowSuccessModal(true);
        await notifyAdmin(result.responseId).catch((err) => console.log('Admin notification error:', err));
      } else {
        setError(`Erreur lors de l enregistrement: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError("Erreur lors de l enregistrement dans la base de donnees.");
      console.error('Database error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async () => {
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }

    const inviteToken = new URLSearchParams(window.location.search).get('invite');

    if (!inviteToken && !formData.email_dest) {
      alert("Veuillez renseigner l email de destination.");
      return;
    }

    if (selectedFormat === 'word' && protectWord && !documentPassword.trim()) {
      alert('Veuillez renseigner un mot de passe pour proteger le document Word.');
      return;
    }

    setSending(true);
    setError('');

    try {
      const result = await submitToSupabase();

      if (!result.success) {
        setError(`Erreur lors de l enregistrement: ${result.error || 'Erreur inconnue'}`);
        setSending(false);
        return;
      }

      await notifyAdmin(result.responseId).catch((err) => console.log('Admin notification error:', err));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-form-email`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          inviteToken: inviteToken || undefined,
          email_msg: formData.email_msg,
          format: selectedFormat,
          responseId: result.responseId,
          documentPassword: selectedFormat === 'word' && protectWord ? documentPassword.trim() : undefined,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Email sending failed');
      }

      setEmailSent(true);
      setSavedToDatabase(true);
      setSentRecipient(responseData.sent_to || '');
      saveAll();
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l envoi de l email.");
      console.error('Email error:', err);
    } finally {
      setSending(false);
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `audit_ia_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        formData={formData}
        completionPercentage={progress.overall}
        emailSent={emailSent}
        sentRecipient={sentRecipient}
        onResetForm={resetForm}
      />

      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section 10</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Recapitulatif, sauvegarde et envoi
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Derniere etape du parcours README : sauvegarder en base, notifier l admin,
          exporter et transmettre le dossier dans le format attendu.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="audit-note audit-note-warn mb-6">
          <div className="font-semibold text-amber-900">Backend non configure</div>
          <p className="mt-1 text-amber-950/80">{supabaseConfigMessage}</p>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="audit-card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Etat du dossier</div>
              <p className="mt-1 text-sm text-slate-500">
                Synthese de completion avant sauvegarde ou envoi.
              </p>
            </div>
            <span className="audit-pill bg-emerald-100 text-emerald-800">{progress.overall}% renseigne</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-900/8 bg-slate-950 p-5 text-white">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Progression</div>
              <div className="display-font mt-2 text-5xl font-semibold">{progress.overall}%</div>
              <div className="mt-2 text-sm text-white/70">
                {progress.done} sections confirmees sur {progress.total}
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-[20px] border border-slate-900/8 bg-white/70 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Taches libres</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">{formData.libreRowCount}</div>
              </div>
              <div className="rounded-[20px] border border-slate-900/8 bg-white/70 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Destinataire</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {hasInviteToken
                    ? sentRecipient || 'Equipe invitante'
                    : formData.email_dest || 'A renseigner'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[20px] border border-slate-900/8 bg-white/70 px-4 py-4">
              <div className="text-sm font-semibold text-slate-900">Ce que cette etape permet</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Enregistrement des reponses dans Supabase.</li>
                <li>Notification admin cote backend si le projet est configure.</li>
                <li>Envoi de l export au format CSV, PDF ou Word.</li>
                <li>Disponibilite du dossier dans le dashboard admin.</li>
              </ul>
            </div>

            {(savedToDatabase || emailSent || error) && (
              <div
                className={`audit-note ${
                  error ? 'audit-note-danger' : emailSent ? 'audit-note-success' : 'audit-note-info'
                }`}
              >
                {error && <div className="font-medium text-red-900">{error}</div>}
                {!error && savedToDatabase && !emailSent && (
                  <div className="font-medium text-blue-900">
                    Les reponses ont ete enregistrees et sont accessibles depuis le tableau de bord admin.
                  </div>
                )}
                {!error && emailSent && (
                <div className="font-medium text-emerald-900">
                    L export a bien ete envoye a {sentRecipient || formData.email_dest || formData.c_email}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="audit-card">
          <div className="mb-5 border-b border-slate-900/8 pb-4">
              <div className="text-sm font-semibold text-slate-900">Parametres de restitution</div>
              <p className="mt-1 text-sm text-slate-500">
              Choisissez le destinataire, le message d accompagnement et le format du livrable.
              </p>
            </div>

          <div className="space-y-4">
            {hasInviteToken ? (
              <div className="audit-note audit-note-info">
                Votre reponse partira vers la personne ou l equipe qui vous a invite.
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-2 block">Email de destination</label>
                  <input
                    type="email"
                    value={formData.email_dest}
                    onChange={(event) => updateField('email_dest', event.target.value)}
                    placeholder="ex: destinataire@entreprise.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block">Email en copie</label>
                  <input
                    type="email"
                    value={formData.email_cc}
                    onChange={(event) => updateField('email_cc', event.target.value)}
                    placeholder="ex: collegue@entreprise.com"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block">Message d accompagnement</label>
              <textarea
                value={formData.email_msg}
                onChange={(event) => updateField('email_msg', event.target.value)}
                rows={3}
                placeholder="ex: Ci-joint mon audit IA complete. Je reste disponible pour en discuter."
              />
            </div>

            <div>
              <label className="mb-2 block">Format du document</label>
              <select
                value={selectedFormat}
                onChange={(event) => setSelectedFormat(event.target.value as 'csv' | 'pdf' | 'word')}
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="word">Word (.docx)</option>
              </select>
            </div>

            {selectedFormat === 'word' && (
              <div className="rounded-[20px] border border-slate-900/8 bg-slate-50/85 p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={protectWord}
                    onChange={(event) => setProtectWord(event.target.checked)}
                  />
                    <span>Proteger le document Word par mot de passe</span>
                  </label>

                {protectWord && (
                  <div className="mt-4">
                    <label className="mb-2 block">Mot de passe du document</label>
                    <input
                      type="text"
                      value={documentPassword}
                      onChange={(event) => setDocumentPassword(event.target.value)}
                      placeholder="ex: TransferAI-2026"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Ce mot de passe n est pas stocke en base et doit etre communique separement.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={handleSubmitToDatabase}
                disabled={sending || savedToDatabase}
                className="audit-button audit-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Enregistrement...' : savedToDatabase ? 'Donnees enregistrees' : 'Sauvegarder en base'}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending || emailSent}
                className="audit-button audit-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Envoi en cours...' : emailSent ? 'Export envoye' : 'Sauvegarder et envoyer'}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button onClick={exportJSON} className="audit-button audit-button-secondary">
                Exporter en JSON
              </button>
              <button onClick={handlePrint} className="audit-button audit-button-secondary">
                Imprimer ou sauvegarder en PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(9)} className="audit-button audit-button-secondary">
          Retour
        </button>
      </div>
    </div>
  );
}
