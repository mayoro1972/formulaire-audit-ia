import { useForm } from '../context/formContextCore';
import { getInputValue } from '../lib/formValue';

export default function Section5_TachesLibres() {
  const { formData, updateField, setCurrentSection } = useForm();

  const addLibreRow = () => {
    const count = formData.libreRowCount + 1;
    updateField('libreRowCount', count);
    updateField('lib_rowcount', count.toString());
  };

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section E</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Taches non encore mentionnees
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          C est ici que l audit capture les angles morts du metier : routines discretes, validations
          manuelles, relectures, deplacements, rattrapages et taches atypiques.
        </p>
      </div>

      <div className="audit-note audit-note-danger mb-5">
        <strong className="text-red-900">Instruction :</strong> ne filtrez pas. Une tache banale ou
        ponctuelle peut reveler une opportunite IA importante.
      </div>

      <div className="audit-card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">E.1 - Inventaire libre</div>
            <p className="mt-1 text-sm text-slate-500">
              Ajoutez autant de lignes que necessaire pour decrire la realite terrain.
            </p>
          </div>
          <span className="audit-pill bg-emerald-100 text-emerald-800">{formData.libreRowCount} lignes</span>
        </div>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-semibold">#</th>
                <th className="p-3 text-left text-xs font-semibold">Description</th>
                <th className="p-3 text-left text-xs font-semibold">Frequence</th>
                <th className="p-3 text-left text-xs font-semibold">Duree</th>
                <th className="p-3 text-left text-xs font-semibold">Automatisable ?</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: formData.libreRowCount }, (_, offset) => {
                const index = offset + 1;
                return (
                  <tr key={index}>
                    <td className="p-3 text-center font-semibold text-amber-700">{index}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={getInputValue(formData[`lib_d${index}`])}
                        onChange={(event) => updateField(`lib_d${index}`, event.target.value)}
                        placeholder="Decrivez la tache en detail"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={getInputValue(formData[`lib_f${index}`])}
                        onChange={(event) => updateField(`lib_f${index}`, event.target.value)}
                      >
                        <option value="">Choisir</option>
                        <option>Quotidienne</option>
                        <option>Hebdomadaire</option>
                        <option>Mensuelle</option>
                        <option>Trimestrielle</option>
                        <option>Annuelle</option>
                        <option>Ponctuelle</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={getInputValue(formData[`lib_t${index}`])}
                        onChange={(event) => updateField(`lib_t${index}`, event.target.value)}
                        placeholder="ex: 2h"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={getInputValue(formData[`lib_a${index}`])}
                        onChange={(event) => updateField(`lib_a${index}`, event.target.value)}
                      >
                        <option value="">Choisir</option>
                        <option value="oui">Oui</option>
                        <option value="non">Non</option>
                        <option value="?">Incertain</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button onClick={addLibreRow} className="audit-button audit-button-ghost mt-5">
          Ajouter une tache
        </button>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(4)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(6)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
