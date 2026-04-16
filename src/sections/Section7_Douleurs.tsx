import { useForm } from '../context/formContextCore';
import { getInputValue } from '../lib/formValue';

export default function Section7_Douleurs() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section G</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Points de douleur et irritants
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Les irritants les plus répétitifs sont souvent les meilleurs candidats à un pilote IA.
        </p>
      </div>

      <div className="audit-note audit-note-danger mb-5">
        Décrivez ici ce qui use du temps, de l’énergie ou de la concentration, même si cela semble
        aujourd’hui normal dans le poste.
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">G.1 - Top 5 des irritants</div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-semibold">Rang</th>
                <th className="p-3 text-left text-xs font-semibold">Irritant</th>
                <th className="p-3 text-left text-xs font-semibold">Temps perdu / semaine</th>
                <th className="p-3 text-left text-xs font-semibold">Solution IA possible ?</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((index) => (
                <tr key={index}>
                  <td className="p-3 text-center font-semibold text-amber-700">{index}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={getInputValue(formData[`irr${index}_desc`])}
                      onChange={(event) => updateField(`irr${index}_desc`, event.target.value)}
                      placeholder="Décrivez l’irritant"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={getInputValue(formData[`irr${index}_t`])}
                      onChange={(event) => updateField(`irr${index}_t`, event.target.value)}
                      placeholder="ex: 3h"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={getInputValue(formData[`irr${index}_s`])}
                      onChange={(event) => updateField(`irr${index}_s`, event.target.value)}
                    >
                      <option value="">À estimer</option>
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

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">G.2 - Doublons et redondances</div>
        <label className="mb-2 block">Quelles tâches sont faites deux fois ou plus ?</label>
        <textarea
          value={formData.g_doublons}
          onChange={(event) => updateField('g_doublons', event.target.value)}
          rows={4}
        />
      </div>

      <div className="audit-card">
        <div className="mb-4 text-sm font-semibold text-slate-900">G.3 - Travail hors horaires</div>
        <label className="mb-2 block">Quelles tâches se déplacent le soir, la nuit ou le week-end ?</label>
        <textarea
          value={formData.g_nuit}
          onChange={(event) => updateField('g_nuit', event.target.value)}
          rows={4}
        />
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(6)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(8)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
