import { useForm } from '../context/FormContext';

export default function Section3_Ajustements() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">C — Ajustements et corrections</h2>
        <p className="text-sm text-[#185FA5] mt-1">Corrigez ce qui ne correspond pas à votre réalité</p>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          C.1 — Ce qui est inexact dans les estimations
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
            Quelles estimations sont inexactes ? Précisez la valeur réelle :
          </label>
          <textarea
            value={formData.c_inexact}
            onChange={(e) => updateField('c_inexact', e.target.value)}
            placeholder="Ex: La veille réglementaire prend en réalité 10h/semaine et non 5h..."
            rows={4}
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          C.2 — Tâches à exclure de l'automatisation
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
            Tâches que vous souhaitez garder manuelles (et pourquoi) :
          </label>
          <textarea
            value={formData.c_exclure}
            onChange={(e) => updateField('c_exclure', e.target.value)}
            placeholder="Ex: Les décisions finales sur les dossiers suspects — elles requièrent mon jugement professionnel..."
            rows={4}
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          C.3 — Vos 3 priorités IA personnelles
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
              Module IA numéro 1 — Gain maximum immédiat <span className="text-[#712B13]">*</span>
            </label>
            <textarea
              value={formData.c_prio1}
              onChange={(e) => updateField('c_prio1', e.target.value)}
              placeholder="Décrivez le module IA qui vous ferait gagner le plus de temps immédiatement..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Module IA numéro 2</label>
            <textarea
              value={formData.c_prio2}
              onChange={(e) => updateField('c_prio2', e.target.value)}
              placeholder="Deuxième priorité..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Module IA numéro 3</label>
            <textarea
              value={formData.c_prio3}
              onChange={(e) => updateField('c_prio3', e.target.value)}
              placeholder="Troisième priorité..."
              rows={3}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">
              Ce que vous attendez concrètement de l'IA dans votre travail :
            </label>
            <textarea
              value={formData.c_attentes}
              onChange={(e) => updateField('c_attentes', e.target.value)}
              placeholder="Ex: Recevoir chaque matin un résumé des nouveaux textes réglementaires sans avoir à aller chercher l'information moi-même..."
              rows={4}
              className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(2)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentSection(4)}
          className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]"
        >
          Section suivante →
        </button>
      </div>
    </div>
  );
}
