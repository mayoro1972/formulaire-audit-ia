import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { getInputValue } from '../lib/formValue';

export default function Section1_Charge() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  const hours = Array.from({ length: 8 }, (_, index) => {
    const rawValue = formData[`ch${index + 1}_h`];
    return parseFloat(String(rawValue ?? '0')) || 0;
  });
  const total = hours.reduce((sum, value) => sum + value, 0);

  const activities = profile.workloadCategories.map((label, index) => ({
    label,
    hId: `ch${index + 1}_h`,
    rId: `ch${index + 1}_r`,
  }));

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section A</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Votre charge de travail actuelle
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          On quantifie ici la répartition du temps, la part répétitive et les volumes
          hebdomadaires qui serviront de base à l’audit IA pour {profile.label.toLowerCase()}.
        </p>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">A.1 - Répartition hebdomadaire</div>
            <p className="mt-1 text-sm text-slate-500">
              Renseignez les heures réellement consommées chaque semaine.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-950 px-4 py-3 text-white">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Temps total</div>
            <div className="display-font mt-1 text-2xl font-semibold">{Math.round(total * 10) / 10} h</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-semibold">Domaine d’activité</th>
                <th className="p-3 text-left text-xs font-semibold">Heures / semaine</th>
                <th className="p-3 text-left text-xs font-semibold">% du temps</th>
                <th className="p-3 text-left text-xs font-semibold">Part répétitive</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => {
                const value = hours[index];
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                return (
                  <tr key={activity.hId}>
                    <td className="p-3 text-sm text-slate-800">{activity.label}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={getInputValue(formData[activity.hId])}
                        onChange={(event) => updateField(activity.hId, event.target.value)}
                        placeholder="ex: 8"
                      />
                    </td>
                    <td className="p-3 text-sm font-semibold text-blue-700">
                      {percentage > 0 ? `${percentage}%` : '-'}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={getInputValue(formData[activity.rId])}
                        onChange={(event) => updateField(activity.rId, event.target.value)}
                        placeholder="ex: 70"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="audit-card">
        <div className="mb-5 border-b border-slate-900/8 pb-4">
          <div className="text-sm font-semibold text-slate-900">A.2 - Chiffres clés de la semaine type</div>
          <p className="mt-1 text-sm text-slate-500">
            Ces indicateurs servent à estimer l’intensité du poste et les poches d’automatisation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block">{profile.metricLabels.emails}</label>
            <input
              type="number"
              value={formData.a_emails}
              onChange={(event) => updateField('a_emails', event.target.value)}
              placeholder="ex: 40"
            />
          </div>
          <div>
            <label className="mb-2 block">{profile.metricLabels.meetings}</label>
            <input
              type="number"
              value={formData.a_reunions}
              onChange={(event) => updateField('a_reunions', event.target.value)}
              placeholder="ex: 10"
            />
          </div>
          <div>
            <label className="mb-2 block">{profile.metricLabels.reports}</label>
            <input
              type="number"
              value={formData.a_rapports}
              onChange={(event) => updateField('a_rapports', event.target.value)}
              placeholder="ex: 8"
            />
          </div>
          <div>
            <label className="mb-2 block">{profile.metricLabels.sources}</label>
            <input
              type="number"
              value={formData.a_sources}
              onChange={(event) => updateField('a_sources', event.target.value)}
              placeholder="ex: 6"
            />
          </div>
          <div>
            <label className="mb-2 block">{profile.metricLabels.dossiers}</label>
            <input
              type="number"
              value={formData.a_dossiers}
              onChange={(event) => updateField('a_dossiers', event.target.value)}
              placeholder="ex: 15"
            />
          </div>
          <div>
            <label className="mb-2 block">{profile.metricLabels.missions}</label>
            <input
              type="number"
              value={formData.a_missions}
              onChange={(event) => updateField('a_missions', event.target.value)}
              placeholder="ex: 3"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block">{profile.metricLabels.lowValueHours}</label>
          <input
            type="number"
            value={formData.a_perdues}
            onChange={(event) => updateField('a_perdues', event.target.value)}
            placeholder="ex: 6"
          />
          <p className="mt-2 text-xs text-slate-500">
            Tâches manuelles, ressaisies, reformatages, attentes ou relances sans valeur directe.
          </p>
        </div>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(0)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(2)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
