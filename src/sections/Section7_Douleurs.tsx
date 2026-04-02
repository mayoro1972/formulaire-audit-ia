import { useForm } from '../context/formContextCore';
import { getInputValue } from '../lib/formValue';

export default function Section7_Douleurs() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">G — Points de douleur et irritants</h2>
        <p className="text-sm text-[#185FA5] mt-1">Ce qui vous fait perdre du temps ou de l'énergie au quotidien</p>
      </div>

      <div className="border-l-4 border-[#712B13] bg-[#FAECE7] rounded-r-lg p-4 mb-5 text-sm text-[#2C2C2A]">
        Les <strong className="text-[#712B13]">irritants</strong> sont souvent les meilleures opportunités d'automatisation IA — leur résolution a un impact fort sur la satisfaction au travail.
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">G.1 — Vos 5 plus grands irritants actuels</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#042C53] text-white">
                <th className="text-left p-3 font-medium text-xs w-12">Rg</th>
                <th className="text-left p-3 font-medium text-xs">Décrivez l'irritant / point de douleur</th>
                <th className="text-left p-3 font-medium text-xs w-32">Temps perdu/sem.</th>
                <th className="text-left p-3 font-medium text-xs w-40">Solution IA possible ?</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-[#FAFAF8]' : ''}>
                  <td className="p-2 font-semibold text-[#712B13] border-b border-[#F1EFE8] text-center">{i}</td>
                  <td className="p-2 border-b border-[#F1EFE8]">
                    <input
                      type="text"
                      value={getInputValue(formData[`irr${i}_desc`])}
                      onChange={(e) => updateField(`irr${i}_desc`, e.target.value)}
                      placeholder="Décrivez..."
                      className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2 border-b border-[#F1EFE8]">
                    <input
                      type="text"
                      value={getInputValue(formData[`irr${i}_t`])}
                      onChange={(e) => updateField(`irr${i}_t`, e.target.value)}
                      placeholder="ex: 3h"
                      className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2 border-b border-[#F1EFE8]">
                    <select
                      value={getInputValue(formData[`irr${i}_s`])}
                      onChange={(e) => updateField(`irr${i}_s`, e.target.value)}
                      className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
                    >
                      <option value="">—</option>
                      <option>Oui, clairement</option>
                      <option>Peut-être</option>
                      <option>Je ne sais pas</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">G.2 — Doublons et redondances</div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Tâches que vous faites deux fois ou plus (ressaisies, reformatages, re-vérifications) :</label>
          <textarea
            value={formData.g_doublons}
            onChange={(e) => updateField('g_doublons', e.target.value)}
            placeholder="ex: Je saisis les données dans Excel, puis je les recopie dans le rapport Word, puis dans le tableau de bord PowerPoint..."
            rows={4}
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">G.3 — Travail hors heures de bureau</div>
        <div>
          <label className="block text-sm font-medium text-[#2C2C2A] mb-1.5">Tâches effectuées le soir, la nuit ou le week-end :</label>
          <textarea
            value={formData.g_nuit}
            onChange={(e) => updateField('g_nuit', e.target.value)}
            placeholder="ex: Je lis les alertes réglementaires le dimanche soir pour être prêt le lundi matin..."
            rows={4}
            className="w-full border border-[#D3D1C7] rounded-lg px-3 py-2 text-sm resize-y"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button onClick={() => setCurrentSection(6)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]">← Retour</button>
        <button onClick={() => setCurrentSection(8)} className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]">Section suivante →</button>
      </div>
    </div>
  );
}
