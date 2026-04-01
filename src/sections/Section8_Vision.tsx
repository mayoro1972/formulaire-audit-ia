import { useForm } from '../context/FormContext';

export default function Section8_Vision() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">H — Votre vision de l'IA pour votre métier</h2>
        <p className="text-sm text-[#185FA5] mt-1">Ce que vous rêvez d'automatiser et votre ambition à 18 mois</p>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">H.1 — Idéal à 6 mois</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
              Si vous ne pouviez automatiser qu'UNE seule tâche dans 6 mois, laquelle serait-ce ? <span className="text-[#712B13]">*</span>
            </label>
            <textarea
              value={formData.h_une}
              onChange={(e) => updateField('h_une', e.target.value)}
              placeholder="Soyez précis..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Pourquoi cette tâche en priorité ?</label>
            <textarea
              value={formData.h_pourquoi}
              onChange={(e) => updateField('h_pourquoi', e.target.value)}
              placeholder="Impact sur votre temps, votre stress, votre efficacité..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">H.2 — Vision à 18 mois</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Comment imaginez-vous votre journée type avec l'IA dans 18 mois ?</label>
            <textarea
              value={formData.h_vision}
              onChange={(e) => updateField('h_vision', e.target.value)}
              placeholder="Décrivez votre journée idéale..."
              rows={4}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Quelles tâches aurez-vous entièrement déléguées à l'IA ?</label>
            <textarea
              value={formData.h_delegate}
              onChange={(e) => updateField('h_delegate', e.target.value)}
              placeholder="ex: La veille réglementaire complète, les premières passes des rapports d'audit..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Sur quoi concentrerez-vous votre expertise humaine irremplaçable ?</label>
            <textarea
              value={formData.h_humain}
              onChange={(e) => updateField('h_humain', e.target.value)}
              placeholder="ex: Les décisions stratégiques, le management, les arbitrages complexes..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">H.3 — Ambition pour l'équipe AWA</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Comment voyez-vous le déploiement IA sur les filiales AWA ?</label>
            <textarea
              value={formData.h_awa}
              onChange={(e) => updateField('h_awa', e.target.value)}
              placeholder="ex: Commencer par la SIB CI puis étendre progressivement au Cameroun, Sénégal..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Indicateurs de succès — comment mesurez-vous l'impact de l'IA ?</label>
            <textarea
              value={formData.h_kpi}
              onChange={(e) => updateField('h_kpi', e.target.value)}
              placeholder="ex: Réduction de 40% du temps de veille, 0 réglementation manquée..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button onClick={() => setCurrentSection(7)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]">← Retour</button>
        <button onClick={() => setCurrentSection(9)} className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]">Section suivante →</button>
      </div>
    </div>
  );
}
