import { useForm } from '../context/formContextCore';
import { Link2 } from 'lucide-react';
import {
  buildDomainAutomationBlueprint,
  competencyDomains,
  getCompetencyDomainProfile,
} from '../lib/competencyDomains';

export default function Section0_Accueil() {
  const { formData, updateField, setCurrentSection } = useForm();
  const domainProfile = getCompetencyDomainProfile(formData.c_domaine);
  const automationBlueprint = buildDomainAutomationBlueprint(formData);

  const calculateProgress = () => {
    const sections = [
      { ids: ['c_nom', 'c_email', 'c_domaine'], weight: 10 },
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

    let done = 0;
    sections.forEach((sec) => {
      let pct = 0;
      if (sec.libre) {
        pct = formData.libreRowCount > 0 ? Math.min(100, formData.libreRowCount * 20) : 0;
      } else if (sec.ids.length > 0) {
        const filled = sec.ids.filter(id => formData[id] && String(formData[id]).trim().length > 0).length;
        pct = Math.round(filled / sec.ids.length * 100);
      }
      if (pct >= 60) done++;
    });

    return { done, total: 9 };
  };

  const { done, total } = calculateProgress();

  const handleCopyLink = () => {
    const appUrl = window.location.href;
    navigator.clipboard.writeText(appUrl).then(() => {
      alert('Lien copié dans le presse-papiers !');
    });
  };

  return (
    <div>
      <div className="bg-[#042C53] text-white rounded-xl p-10 mb-6">
        <div className="text-sm opacity-75 mb-1">Audit IA · Trame adaptative par métier</div>
        <h1 className="text-3xl font-bold mb-6">Formulaire d&apos;Audit IA</h1>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/10 rounded-lg p-3">
            <label className="text-xs opacity-60 uppercase tracking-wide block mb-1">Nom complet</label>
            <input
              type="text"
              value={formData.c_nom}
              onChange={(e) => updateField('c_nom', e.target.value)}
              placeholder="ex: Jean Dupont"
              className="bg-transparent border-none text-white text-sm font-medium w-full outline-none placeholder:opacity-40"
            />
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <label className="text-xs opacity-60 uppercase tracking-wide block mb-1">Email du répondant</label>
            <input
              type="email"
              value={formData.c_email}
              onChange={(e) => updateField('c_email', e.target.value)}
              placeholder="ex: nom@entreprise.com"
              className="bg-transparent border-none text-white text-sm font-medium w-full outline-none placeholder:opacity-40"
            />
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <label className="text-xs opacity-60 uppercase tracking-wide block mb-1">Fonction</label>
            <input
              type="text"
              value={formData.c_poste}
              onChange={(e) => updateField('c_poste', e.target.value)}
              placeholder="ex: Directeur des Opérations"
              className="bg-transparent border-none text-white text-sm font-medium w-full outline-none placeholder:opacity-40"
            />
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <label className="text-xs opacity-60 uppercase tracking-wide block mb-1">Entité</label>
            <input
              type="text"
              value={formData.c_entite}
              onChange={(e) => updateField('c_entite', e.target.value)}
              placeholder="ex: Nom de votre entreprise"
              className="bg-transparent border-none text-white text-sm font-medium w-full outline-none placeholder:opacity-40"
            />
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <label className="text-xs opacity-60 uppercase tracking-wide block mb-1">Domaine principal</label>
            <select
              value={formData.c_domaine}
              onChange={(e) => updateField('c_domaine', e.target.value)}
              className="bg-transparent border-none text-white text-sm font-medium w-full outline-none"
            >
              <option value="" className="text-[#042C53]">Sélectionner un domaine</option>
              {competencyDomains.map((domain) => (
                <option key={domain.key} value={domain.key} className="text-[#042C53]">
                  {domain.label}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <label className="text-xs opacity-60 uppercase tracking-wide block mb-1">
              Domaines associés / contexte
            </label>
            <input
              type="text"
              value={formData.c_domaines_associes}
              onChange={(e) => updateField('c_domaines_associes', e.target.value)}
              placeholder="ex: conformité, reporting, coordination siège"
              className="bg-transparent border-none text-white text-sm font-medium w-full outline-none placeholder:opacity-40"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-[#9FE1CB]">9</div>
            <div className="text-xs opacity-60 mt-1">Sections à remplir</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-[#9FE1CB]">{done}</div>
            <div className="text-xs opacity-60 mt-1">Sections complètes</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-[#9FE1CB]">{Math.round((done / total) * 100)}%</div>
            <div className="text-xs opacity-60 mt-1">Progression globale</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="text-sm font-semibold text-[#042C53]">Trame IA générée pour le domaine</div>
            <div className="text-xs text-[#888780] mt-1">
              {domainProfile.label} · {domainProfile.summary}
            </div>
          </div>
          <div className="px-3 py-1 bg-[#E6F1FB] text-[#185FA5] rounded-full text-xs font-semibold">
            Adaptation métier active
          </div>
        </div>
        <p className="text-sm text-[#2C2C2A] mb-4">{automationBlueprint.recommendation}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#888780] mb-2">
              Axes d&apos;audit à cadrer
            </div>
            <div className="flex flex-wrap gap-2">
              {automationBlueprint.priorityAreas.map((area) => (
                <span key={area} className="px-2.5 py-1 bg-[#F1EFE8] text-[#2C2C2A] rounded-full text-xs">
                  {area}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#888780] mb-2">
              Automatisations IA suggérées
            </div>
            <ul className="space-y-1 text-sm text-[#2C2C2A]">
              {automationBlueprint.automationIdeas.map((idea) => (
                <li key={idea}>• {idea}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-[#0F6E56] bg-[#E1F5EE] rounded-r-lg p-4 mb-5 text-sm text-[#2C2C2A]">
        <strong className="text-[#0F6E56]">Comment utiliser ce formulaire :</strong> Remplissez les sections dans l'ordre ou dans l'ordre que vous préférez.
        Votre progression est <strong>sauvegardée automatiquement</strong> dans votre navigateur toutes les 30 secondes.
        Vous pouvez fermer et reprendre à tout moment. Quand vous avez terminé, cliquez sur <strong>"Envoi &amp; récapitulatif"</strong>
        pour envoyer votre réponse par email.
      </div>

      <div className="bg-[#FAEEDA] border-l-4 border-[#BA7517] rounded-r-lg p-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <strong className="text-[#854F0B] text-sm">Partager ce formulaire :</strong>
            <p className="text-xs text-[#2C2C2A] mt-1">
              Copiez le lien pour le partager avec d'autres personnes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#185FA5] text-white rounded-lg text-xs font-medium hover:bg-[#042C53] transition-all"
              title="Copier le lien"
            >
              <Link2 className="w-4 h-4" />
              Copier le lien
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          Engagement
        </div>
        <div className="flex flex-col gap-2">
          {[
            { id: 'eng1', text: "Je m'engage à tester les premiers modules IA dès leur disponibilité" },
            { id: 'eng2', text: "Je m'engage à donner un feedback régulier pour améliorer les outils" },
            { id: 'eng3', text: "Je m'engage à partager mes apprentissages avec mon équipe" },
            { id: 'eng4', text: 'Je valide les informations fournies comme reflet de ma réalité quotidienne' },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-2.5 p-3 border border-[#D3D1C7] rounded-lg cursor-pointer transition-all hover:border-[#B5D4F4] hover:bg-[#E6F1FB]"
            >
              <input
                type="checkbox"
                checked={formData[item.id] as boolean}
                onChange={(e) => updateField(item.id, e.target.checked)}
                className="w-4 h-4 flex-shrink-0 mt-0.5 cursor-pointer accent-[#185FA5]"
              />
              <span className="text-sm text-[#2C2C2A]">{item.text}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(1)}
          className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]"
        >
          Commencer →
        </button>
      </div>
    </div>
  );
}
