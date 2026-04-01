import { useForm } from '../context/FormContext';

export default function Section5_TachesLibres() {
  const { formData, updateField, setCurrentSection } = useForm();

  const addLibreRow = () => {
    const count = formData.libreRowCount + 1;
    updateField('libreRowCount', count.toString());
    updateField(`lib_rowcount`, count.toString());
  };

  const renderLibreRows = () => {
    const rows = [];
    for (let i = 1; i <= formData.libreRowCount; i++) {
      rows.push(
        <tr key={i} className={i % 2 === 1 ? 'bg-[#FAFAF8]' : ''}>
          <td className="p-2 text-center text-[#BA7517] font-semibold border-b border-[#F1EFE8]">{i}</td>
          <td className="p-2 border-b border-[#F1EFE8]">
            <input
              type="text"
              value={formData[`lib_d${i}`] || ''}
              onChange={(e) => updateField(`lib_d${i}`, e.target.value)}
              placeholder="Décrivez la tâche en détail..."
              className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-sm"
            />
          </td>
          <td className="p-2 border-b border-[#F1EFE8]">
            <select
              value={formData[`lib_f${i}`] || ''}
              onChange={(e) => updateField(`lib_f${i}`, e.target.value)}
              className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
            >
              <option value="">—</option>
              <option>Quotidienne</option>
              <option>Hebdomadaire</option>
              <option>Mensuelle</option>
              <option>Trimestrielle</option>
              <option>Annuelle</option>
              <option>Ponctuelle</option>
            </select>
          </td>
          <td className="p-2 border-b border-[#F1EFE8]">
            <input
              type="text"
              value={formData[`lib_t${i}`] || ''}
              onChange={(e) => updateField(`lib_t${i}`, e.target.value)}
              placeholder="ex: 2h"
              className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-sm"
            />
          </td>
          <td className="p-2 text-center border-b border-[#F1EFE8]">
            <select
              value={formData[`lib_a${i}`] || ''}
              onChange={(e) => updateField(`lib_a${i}`, e.target.value)}
              className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
            >
              <option value="">—</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
              <option value="?">Incertain</option>
            </select>
          </td>
        </tr>
      );
    }
    return rows;
  };

  return (
    <div>
      <div className="border-l-4 border-[#185FA5] bg-[#E6F1FB] rounded-r-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#042C53]">E — Vos tâches non encore mentionnées</h2>
        <p className="text-sm text-[#185FA5] mt-1">La section la plus importante — aucune limite, aucun filtre</p>
      </div>

      <div className="border-l-4 border-[#712B13] bg-[#FAECE7] rounded-r-lg p-4 mb-5 text-sm text-[#2C2C2A]">
        <strong className="text-[#712B13]">Instruction :</strong> Listez ICI toutes les tâches que vous effectuez et qui n'ont pas été mentionnées dans les sections précédentes.
        Ne filtrez pas — même une tâche qui semble banale peut révéler une opportunité IA inattendue.
        Pensez à vos matins, fins de semaine, fins de mois, déplacements, validations de documents, lectures, communications...
      </div>

      <div className="bg-white border border-[#D3D1C7] rounded-xl p-5 mb-4">
        <div className="text-sm font-semibold text-[#042C53] mb-3 pb-2 border-b border-[#F1EFE8]">
          E.1 — Ajoutez toutes vos tâches non mentionnées
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#042C53] text-white">
                <th className="text-left p-3 font-medium text-xs">#</th>
                <th className="text-left p-3 font-medium text-xs">Description détaillée de la tâche</th>
                <th className="text-left p-3 font-medium text-xs">Fréquence</th>
                <th className="text-left p-3 font-medium text-xs">Durée</th>
                <th className="text-left p-3 font-medium text-xs">Automatisable ?</th>
              </tr>
            </thead>
            <tbody>{renderLibreRows()}</tbody>
          </table>
        </div>
        <button
          onClick={addLibreRow}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#B5D4F4] rounded-lg text-[#185FA5] text-sm mt-3 transition-all hover:bg-[#E6F1FB] hover:border-solid"
        >
          + Ajouter une tâche
        </button>
      </div>

      <div className="flex gap-3 mt-7 pt-5 border-t border-[#D3D1C7]">
        <button
          onClick={() => setCurrentSection(4)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-[#2C2C2A] border border-[#D3D1C7] transition-all hover:bg-[#F1EFE8]"
        >
          ← Retour
        </button>
        <button
          onClick={() => setCurrentSection(6)}
          className="ml-auto px-6 py-2.5 rounded-lg text-sm font-medium bg-[#185FA5] text-white transition-all hover:bg-[#042C53]"
        >
          Section suivante →
        </button>
      </div>
    </div>
  );
}
