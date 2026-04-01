import { useForm } from '../context/FormContext';

export default function Section4_Profil() {
  const { formData, updateField, setCurrentSection } = useForm();

  const scores = [
    { id: 'sc1', label: 'Aisance générale avec les outils numériques' },
    { id: 'sc2', label: 'Excel avancé / Power BI / outils d\'analyse' },
    { id: 'sc3', label: 'Utilisation actuelle d\'outils IA (ChatGPT, Copilot...)' },
    { id: 'sc4', label: 'Capacité à adopter de nouveaux outils rapidement' },
    { id: 'sc5', label: 'Ouverture à modifier vos habitudes grâce à l\'IA' },
  ];

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">D — Votre profil early adopter</h2>
        <p className="text-sm text-[#185FA5] mt-1">Évaluation de votre maturité IA et de vos préférences d'usage</p>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          D.1 — Auto-évaluation digitale (1 = débutant · 10 = expert)
        </div>
        <div className="space-y-3">
          {scores.map((score) => (
            <div key={score.id} className="flex items-center gap-3 p-3 bg-[#F1EFE8] rounded-lg">
              <span className="flex-1 text-sm text-[#2C2C2A]">{score.label}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={formData[score.id]}
                onChange={(e) => updateField(score.id, e.target.value)}
                className="w-40 flex-shrink-0"
              />
              <span className="text-lg font-semibold text-[#185FA5] min-w-[28px] text-center">{formData[score.id]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          D.2 — Expériences IA existantes
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Outils IA déjà utilisés dans votre travail :</label>
            <input
              type="text"
              value={formData.d_outils}
              onChange={(e) => updateField('d_outils', e.target.value)}
              placeholder="ex: ChatGPT, Copilot Microsoft, Gemini..."
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Pour quelles tâches les utilisez-vous ?</label>
            <textarea
              value={formData.d_usage}
              onChange={(e) => updateField('d_usage', e.target.value)}
              placeholder="ex: Rédaction de synthèses, reformulation de textes réglementaires..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Ce qui vous a plu dans ces outils :</label>
            <textarea
              value={formData.d_plus}
              onChange={(e) => updateField('d_plus', e.target.value)}
              placeholder="ex: Gain de temps considérable sur la rédaction..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Ce qui vous a déplu ou limité :</label>
            <textarea
              value={formData.d_moins}
              onChange={(e) => updateField('d_moins', e.target.value)}
              placeholder="ex: Les réponses pas toujours précises sur des sujets réglementaires spécifiques..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          D.3 — Format préféré pour recevoir vos synthèses IA
        </div>
        <div className="flex flex-col gap-2 mb-3">
          {[
            { id: 'fmt1', text: 'Email HTML quotidien avec résumé et liens directs (digest matinal 7h00)' },
            { id: 'fmt2', text: 'Dashboard web interactif consultable à la demande' },
            { id: 'fmt3', text: 'Document Word / PDF généré automatiquement' },
            { id: 'fmt4', text: 'Notification mobile pour les alertes critiques uniquement' },
            { id: 'fmt5', text: 'Intégration dans Outlook / Teams / outils existants' },
          ].map((item) => (
            <label key={item.id} className="flex items-start gap-2.5 p-3 border border-[#D3D1C7] rounded-lg cursor-pointer transition-all hover:border-[#B5D4F4] hover:bg-[#E6F1FB]">
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
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Précisions sur le format ou autre préférence :</label>
          <textarea
            value={formData.d_format_autre}
            onChange={(e) => updateField('d_format_autre', e.target.value)}
            placeholder="ex: Je préfère recevoir les alertes critiques immédiatement et les synthèses en début de semaine..."
            rows={3}
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(3)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentSection(5)}
          className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]"
        >
          Section suivante →
        </button>
      </div>
    </div>
  );
}
