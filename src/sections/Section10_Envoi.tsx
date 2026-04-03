import { useState } from 'react';
import { useForm } from '../context/formContextCore';
import SuccessModal from '../components/SuccessModal';

export default function Section10_Envoi() {
  const { formData, updateField, setCurrentSection, saveAll, submitToSupabase, resetForm } = useForm();
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'word'>('csv');
  const [sentRecipient, setSentRecipient] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const hasInviteToken = urlParams.get('invite') !== null;

  const calculateProgress = () => {
    const sections = [
      { ids: ['c_nom', 'c_email'], weight: 10 },
      { ids: ['ch1_h', 'ch2_h', 'a_emails'], weight: 10 },
      { ids: [], weight: 10 },
      { ids: ['c_prio1', 'c_attentes'], weight: 10 },
      { ids: ['sc1', 'sc2', 'd_outils'], weight: 10 },
      { ids: [], libre: true, weight: 15 },
      { ids: ['f_matin', 'f_matinee', 'f_mois'], weight: 10 },
      { ids: ['irr1_desc'], weight: 10 },
      { ids: ['h_une', 'h_vision'], weight: 10 },
      { ids: ['i_conf', 'i_sys'], weight: 5 },
    ];

    let totalPct = 0;
    let done = 0;

    sections.forEach((sec) => {
      let pct = 0;
      if (sec.libre) {
        pct = formData.libreRowCount > 0 ? Math.min(100, formData.libreRowCount * 20) : 0;
      } else if (sec.ids.length > 0) {
        const filled = sec.ids.filter(id => formData[id] && String(formData[id]).trim().length > 0).length;
        pct = Math.round(filled / sec.ids.length * 100);
      }
      totalPct += pct * sec.weight / 100;
      if (pct >= 60) done++;
    });

    return { overall: Math.round(totalPct), done };
  };

  const { overall, done } = calculateProgress();

  const notifyAdmin = async (responseId: string) => {
    const notifyAdminUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`;
    const notifyHeaders = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(notifyAdminUrl, {
      method: 'POST',
      headers: notifyHeaders,
      body: JSON.stringify({
        user_name: formData.c_nom,
        user_email: formData.c_email,
        user_position: formData.c_poste,
        completion_percentage: overall,
        response_id: responseId,
      }),
    });

    if (!response.ok) {
      const responseData = await response.json().catch(() => null);
      throw new Error(responseData?.error || "La notification admin n'a pas pu être envoyée.");
    }
  };

  const handleSubmitToDatabase = async () => {
    setSending(true);
    setError('');
    setSavedToDatabase(false);

    try {
      const result = await submitToSupabase();

      if (result.success) {
        setSavedToDatabase(true);
        saveAll();
        setShowSuccessModal(true);
        await notifyAdmin(result.responseId).catch(err => console.log('Admin notification error:', err));
      } else {
        setError(`Erreur lors de l'enregistrement: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError("Erreur lors de l'enregistrement dans la base de données.");
      console.error('Database error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');

    if (!inviteToken && !formData.email_dest) {
      alert("Veuillez renseigner l'email de destination.");
      return;
    }

    setSending(true);
    setError('');

    try {
      const result = await submitToSupabase();

      if (!result.success) {
        setError(`Erreur lors de l'enregistrement: ${result.error || 'Erreur inconnue'}`);
        setSending(false);
        return;
      }

      await notifyAdmin(result.responseId).catch(err => console.log('Admin notification error:', err));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-form-email`;

      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        formData: formData,
        inviteToken: inviteToken || undefined,
        email_msg: formData.email_msg,
        format: selectedFormat,
        responseId: result.responseId,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
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
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi de l'email.");
      console.error('Email error:', err);
    } finally {
      setSending(false);
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_ia_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
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
        completionPercentage={overall}
        emailSent={emailSent}
        sentRecipient={sentRecipient}
        onResetForm={resetForm}
      />

      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">Récapitulatif &amp; envoi</h2>
        <p className="text-sm text-[#185FA5] mt-1">Vérifiez votre progression et envoyez votre formulaire complété</p>
      </div>

      <div className="flex items-center gap-5 p-6 bg-[#E6F1FB] rounded-xl mb-5">
        <div>
          <div className="text-5xl font-bold text-[#185FA5]">{overall}%</div>
          <div className="text-xs text-[#185FA5] mt-1">formulaire complété</div>
        </div>
        <div className="flex-1 text-sm text-[#185FA5] leading-8">
          <div>Tâches libres ajoutées : <strong>{formData.libreRowCount}</strong></div>
          <div>Sections remplies : <strong>{done} / 9</strong></div>
          <div>
            Email de destination : <strong>{hasInviteToken ? (sentRecipient || "personne qui vous a invité(e)") : (formData.email_dest || '(à renseigner)')}</strong>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          Envoi par email
        </div>
        <div className="space-y-3">
          {hasInviteToken && (
            <div className="bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-3 text-sm text-[#185FA5]">
              ✓ Votre réponse sera envoyée à la personne ou à l'équipe qui vous a invité(e). Votre email de réponse restera celui du répondant.
            </div>
          )}
          {!hasInviteToken && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
                  Email de destination <span className="text-[#712B13]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email_dest}
                  onChange={(e) => updateField('email_dest', e.target.value)}
                  placeholder="ex: destinataire@entreprise.com"
                  className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Email de copie (CC — optionnel)</label>
                <input
                  type="email"
                  value={formData.email_cc}
                  onChange={(e) => updateField('email_cc', e.target.value)}
                  placeholder="ex: collaborateur@entreprise.com"
                  className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Message d'accompagnement (optionnel)</label>
            <textarea
              value={formData.email_msg}
              onChange={(e) => updateField('email_msg', e.target.value)}
              placeholder="ex: Ci-joint mon audit IA complété. Je reste disponible pour en discuter..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Format de fichier à envoyer</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'pdf' | 'word')}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            >
              <option value="csv">CSV (Excel compatible)</option>
              <option value="pdf">PDF</option>
              <option value="word">Word (.docx)</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmitToDatabase}
              disabled={sending || savedToDatabase}
              className="flex-1 bg-[#185FA5] text-white py-3 rounded-lg text-sm font-semibold transition-all hover:bg-[#042C53] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Enregistrement...' : savedToDatabase ? 'Données enregistrées !' : 'Enregistrer dans la base de données'}
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending || emailSent}
              className="flex-1 bg-[#0F6E56] text-white py-3 rounded-lg text-sm font-semibold transition-all hover:bg-[#3B6D11] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Envoi en cours...' : emailSent ? 'Email envoyé !' : 'Enregistrer + Envoyer par email'}
            </button>
          </div>
          {savedToDatabase && (
            <div className="bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-4 text-center text-[#185FA5] font-medium">
              ✓ Vos réponses ont été enregistrées dans la base de données et sont accessibles depuis le tableau de bord admin.
            </div>
          )}
          {emailSent && (
            <div className="bg-[#EAF3DE] border border-[#3B6D11] rounded-lg p-4 text-center text-[#3B6D11] font-medium">
              ✓ Email envoyé avec succès à <strong>{sentRecipient || formData.email_dest || formData.c_email}</strong> — vérifiez la boîte de réception correspondante.
            </div>
          )}
          {error && (
            <div className="bg-[#FAECE7] border border-[#712B13] rounded-lg p-4 text-center text-[#712B13] text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={exportJSON}
            className="flex-1 px-4 py-2 bg-white text-[#2C2C2A] border border-[#D3D1C7] rounded-lg text-sm font-medium transition-all hover:bg-[#F1EFE8]"
          >
            Exporter en JSON (sauvegarde)
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-white text-[#2C2C2A] border border-[#D3D1C7] rounded-lg text-sm font-medium transition-all hover:bg-[#F1EFE8]"
          >
            Imprimer / Sauvegarder en PDF
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(9)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
