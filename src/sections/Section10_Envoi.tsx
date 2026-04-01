import { useState } from 'react';
import { useForm } from '../context/FormContext';
import SuccessModal from '../components/SuccessModal';
import { supabase } from '../lib/supabase';

export default function Section10_Envoi() {
  const { formData, updateField, setCurrentSection, saveAll, submitToSupabase, resetForm } = useForm();
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'word'>('csv');

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

  const buildEmailBody = () => {
    const nom = formData.c_nom || 'Utilisateur';
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    const libres = [];
    for (let i = 1; i <= formData.libreRowCount; i++) {
      const desc = formData[`lib_d${i}`];
      if (desc && String(desc).trim()) {
        libres.push(`  ${i}. ${desc} [${formData[`lib_f${i}`] || '—'}] [${formData[`lib_t${i}`] || '—'}] → Automatisable: ${formData[`lib_a${i}`] || '—'}`);
      }
    }

    const irrs = [1, 2, 3, 4, 5]
      .map(i => formData[`irr${i}_desc`])
      .filter(d => d && String(d).trim());

    return `
=== AUDIT IA — FICHE PERSONNELLE ===
Répondant : ${nom}
Entité : ${formData.c_entite}
Date : ${date}

── A. CHARGE HEBDOMADAIRE ──
Emails/jour : ${formData.a_emails || '—'}
Réunions/sem : ${formData.a_reunions || '—'}
Rapports/mois : ${formData.a_rapports || '—'}
Sources réglementaires/sem : ${formData.a_sources || '—'}
Heures "perdues"/sem : ${formData.a_perdues || '—'}

── C. PRIORITÉS IA ──
Priorité 1 : ${formData.c_prio1 || '—'}
Priorité 2 : ${formData.c_prio2 || '—'}
Priorité 3 : ${formData.c_prio3 || '—'}
Attentes IA : ${formData.c_attentes || '—'}
À exclure : ${formData.c_exclure || '—'}
Inexactitudes : ${formData.c_inexact || '—'}

── D. PROFIL EARLY ADOPTER ──
Score numérique : ${formData.sc1}/10
Score BI/Excel : ${formData.sc2}/10
Score IA actuelle : ${formData.sc3}/10
Score adoption : ${formData.sc4}/10
Score ouverture : ${formData.sc5}/10
Outils IA utilisés : ${formData.d_outils || '—'}
Points positifs : ${formData.d_plus || '—'}
Points négatifs : ${formData.d_moins || '—'}

── E. TÂCHES LIBRES (${libres.length} tâches ajoutées) ──
${libres.length > 0 ? libres.join('\n') : '  (aucune tâche libre ajoutée)'}

── F. JOURNAL DE BORD ──
Matin : ${formData.f_matin || '—'}
Matinée : ${formData.f_matinee || '—'}
Après-midi : ${formData.f_apm || '—'}
Fin de journée : ${formData.f_soir || '—'}
Lundi : ${formData.f_lundi || '—'}
Vendredi : ${formData.f_vendredi || '—'}
Mensuel : ${formData.f_mois || '—'}
Trimestriel : ${formData.f_trim || '—'}
Annuel : ${formData.f_annuel || '—'}
Déplacements : ${formData.f_deplac || '—'}

── G. POINTS DE DOULEUR ──
${irrs.length > 0 ? irrs.map((d, i) => `  ${i + 1}. ${d}`).join('\n') : '  (non renseigné)'}
Doublons : ${formData.g_doublons || '—'}
Hors heures : ${formData.g_nuit || '—'}

── H. VISION IA ──
Tâche prioritaire 6 mois : ${formData.h_une || '—'}
Pourquoi : ${formData.h_pourquoi || '—'}
Vision 18 mois : ${formData.h_vision || '—'}
Déléguées à l'IA : ${formData.h_delegate || '—'}
Expertise humaine : ${formData.h_humain || '—'}
Déploiement AWA : ${formData.h_awa || '—'}
KPIs succès : ${formData.h_kpi || '—'}

── I. CONTRAINTES ──
Confidentialité : ${formData.i_conf || '—'}
Hébergement : ${formData.i_heberg || '—'}
Approbations : ${formData.i_appro || '—'}
Systèmes : ${formData.i_sys || '—'}
Calendaire : ${formData.i_cal || '—'}
Politique IA groupe : ${formData.i_pol || '—'}
Autres : ${formData.i_autres || '—'}

── MESSAGE ──
${formData.email_msg || ''}
`;
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

        const notifyAdminUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`;

        const notifyHeaders = {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        };

        await fetch(notifyAdminUrl, {
          method: 'POST',
          headers: notifyHeaders,
          body: JSON.stringify({
            user_name: formData.c_nom,
            user_email: formData.c_email,
            user_position: formData.c_poste,
            completion_percentage: overall,
            response_id: 'pending',
          }),
        }).catch(err => console.log('Admin notification error:', err));
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

      const notifyAdminUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`;

      const notifyHeaders = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      await fetch(notifyAdminUrl, {
        method: 'POST',
        headers: notifyHeaders,
        body: JSON.stringify({
          user_name: formData.c_nom,
          user_email: formData.c_email,
          user_position: formData.c_poste,
          completion_percentage: overall,
          response_id: 'pending',
        }),
      }).catch(err => console.log('Admin notification error:', err));

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
      saveAll();
      setShowSuccessModal(true);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email. Les données ont été sauvegardées dans la base de données.");
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
    a.download = `audit_ia_gerard_${new Date().toISOString().slice(0, 10)}.json`;
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
          <div>Email de destination : <strong>{formData.email_dest || '(à renseigner)'}</strong></div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          Envoi par email
        </div>
        <div className="space-y-3">
          {hasInviteToken && (
            <div className="bg-[#E6F1FB] border border-[#185FA5] rounded-lg p-3 text-sm text-[#185FA5]">
              ✓ Votre réponse sera automatiquement envoyée à <strong>{formData.c_email}</strong> avec copie à l'administrateur.
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
              ✓ Email envoyé avec succès à <strong>{formData.email_dest}</strong> — vérifiez votre boîte de réception.
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
