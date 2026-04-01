import { useForm } from '../context/FormContext';

const tachesVeille = [
  ['Scraping sites BCEAO, COBAC, FATF, GIABA', 'Quotidienne', '5–8h/sem'],
  ['Lecture et tri des nouvelles circulaires', 'Quotidienne', '3–4h/sem'],
  ['Synthèse et résumé des textes réglementaires', 'Hebdomadaire', '3–5h/sem'],
  ['Diffusion alertes réglementaires aux filiales AWA', 'Hebdomadaire', '1–2h/sem'],
];

export default function Section2_Taches() {
  const { formData, updateField, setCurrentSection } = useForm();

  const renderTable = (title: string, tasks: string[][], prefix: string) => (
    <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
      <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#042C53] text-white">
              <th className="text-left p-3 font-medium text-xs">Tâche</th>
              <th className="text-left p-3 font-medium text-xs">Fréquence réelle</th>
              <th className="text-left p-3 font-medium text-xs">Temps réel/sem.</th>
              <th className="text-left p-3 font-medium text-xs">Confirmer ?</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAFAF8]' : ''}>
                <td className="p-2 text-xs text-[#2C2C2A] border-b border-[#F1EFE8]">{task[0]}</td>
                <td className="p-2 border-b border-[#F1EFE8]">
                  <input
                    type="text"
                    value={formData[`${prefix}_f${idx}`] || task[1]}
                    onChange={(e) => updateField(`${prefix}_f${idx}`, e.target.value)}
                    className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
                  />
                </td>
                <td className="p-2 border-b border-[#F1EFE8]">
                  <input
                    type="text"
                    value={formData[`${prefix}_t${idx}`] || task[2]}
                    onChange={(e) => updateField(`${prefix}_t${idx}`, e.target.value)}
                    className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
                  />
                </td>
                <td className="p-2 text-center border-b border-[#F1EFE8]">
                  <select
                    value={formData[`${prefix}_c${idx}`] || ''}
                    onChange={(e) => updateField(`${prefix}_c${idx}`, e.target.value)}
                    className="border border-[#D3D1C7] rounded px-2 py-1 text-xs"
                  >
                    <option value="">—</option>
                    <option value="oui">Confirmé</option>
                    <option value="corr">Corrigé</option>
                    <option value="non">À revoir</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">B — Tâches déjà identifiées</h2>
        <p className="text-sm text-[#185FA5] mt-1">Validez, corrigez et complétez les estimations de temps pour chaque tâche</p>
      </div>

      <div className="border-l-4 border-[#BA7517] bg-[#FAEEDA] rounded-r-lg p-4 mb-5 text-sm text-[#2C2C2A]">
        Ces tâches ont été identifiées lors de nos échanges. <strong className="text-[#854F0B]">Corrigez les temps et fréquences</strong> si les estimations ne correspondent pas à votre réalité.
      </div>

      {renderTable('B.1 — Veille réglementaire', tachesVeille, 'tb-veille')}
      {renderTable('B.2 — LCB-FT & KYC', [
        ['Mise à jour listes OFAC / ONU / UE', 'Hebdomadaire', '2–3h/sem'],
        ['Vérification alertes transactions suspectes', 'Quotidienne', '2–4h/sem'],
      ], 'tb-lcb')}
      {renderTable('B.3 — Missions d\'audit', [
        ['Élaboration programme annuel d\'audit AWA', 'Annuelle', '3–5j/an'],
        ['Rédaction lettres de mission', 'À chaque mission', '2–4h/miss.'],
      ], 'tb-audit')}
      {renderTable('B.4 — Pilotage régional AWA', [
        ['Consolidation rapports filiales (CI, CMR, SN...)', 'Mensuelle', '4–6h/mois'],
        ['Tableau de bord risques par filiale', 'Mensuelle', '3–4h/mois'],
      ], 'tb-awa')}

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(1)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentSection(3)}
          className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]"
        >
          Section suivante →
        </button>
      </div>
    </div>
  );
}
