import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { getInputValue } from '../lib/formValue';

export default function Section2_Taches() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

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
                    value={getInputValue(formData[`${prefix}_f${idx}`], task[1])}
                    onChange={(e) => updateField(`${prefix}_f${idx}`, e.target.value)}
                    className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
                  />
                </td>
                <td className="p-2 border-b border-[#F1EFE8]">
                  <input
                    type="text"
                    value={getInputValue(formData[`${prefix}_t${idx}`], task[2])}
                    onChange={(e) => updateField(`${prefix}_t${idx}`, e.target.value)}
                    className="w-full border border-[#D3D1C7] rounded px-2 py-1 text-xs"
                  />
                </td>
                <td className="p-2 text-center border-b border-[#F1EFE8]">
                  <select
                    value={getInputValue(formData[`${prefix}_c${idx}`])}
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
        Cette trame est générée à partir du domaine <strong className="text-[#854F0B]">{profile.label}</strong>. Corrigez les temps, fréquences et intitulés si les estimations ne correspondent pas à votre réalité.
      </div>

      {profile.taskGroups.map((group, index) => renderTable(group.title, group.tasks, `tb-${profile.key}-${index}`))}

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
