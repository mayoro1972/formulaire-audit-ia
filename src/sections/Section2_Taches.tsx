import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { getInputValue } from '../lib/formValue';

export default function Section2_Taches() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  const renderTable = (title: string, tasks: string[][], prefix: string) => (
    <div key={prefix} className="audit-card mb-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
          <p className="mt-1 text-sm text-slate-500">
            Confirmez la fréquence, le temps réel et le niveau de fiabilité de cette trame.
          </p>
        </div>
        <span className="audit-pill bg-blue-100 text-blue-800">{tasks.length} tâches</span>
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="p-3 text-left text-xs font-semibold">Tâche</th>
              <th className="p-3 text-left text-xs font-semibold">Fréquence réelle</th>
              <th className="p-3 text-left text-xs font-semibold">Temps réel / sem.</th>
              <th className="p-3 text-left text-xs font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={`${prefix}-${index}`}>
                <td className="p-3 text-sm text-slate-800">{task[0]}</td>
                <td className="p-3">
                  <input
                    type="text"
                    value={getInputValue(formData[`${prefix}_f${index}`], task[1])}
                    onChange={(event) => updateField(`${prefix}_f${index}`, event.target.value)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={getInputValue(formData[`${prefix}_t${index}`], task[2])}
                    onChange={(event) => updateField(`${prefix}_t${index}`, event.target.value)}
                  />
                </td>
                <td className="p-3">
                  <select
                    value={getInputValue(formData[`${prefix}_c${index}`])}
                    onChange={(event) => updateField(`${prefix}_c${index}`, event.target.value)}
                  >
                    <option value="">À qualifier</option>
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
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section B</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Tâches déjà identifiées
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Cette partie propose une trame métier préremplie. Les groupes de tâches
          sont adaptés au domaine choisi et peuvent être corrigés librement.
        </p>
      </div>

      <div className="audit-note audit-note-warn mb-5">
        <strong className="text-amber-900">Adaptation active :</strong> la trame ci-dessous est
        générée à partir du domaine <strong>{profile.label}</strong>. Corrigez sans hésiter les
        temps, fréquences ou formulations pour coller à votre réalité.
      </div>

      {profile.taskGroups.map((group, index) => renderTable(group.title, group.tasks, `tb-${profile.key}-${index}`))}

      <div className="section-actions">
        <button onClick={() => setCurrentSection(1)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(3)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
