import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { getInputValue } from '../lib/formValue';

export default function Section6_Journal() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  const routineFields = [
    { id: 'f_matin', label: 'En arrivant le matin', placeholder: profile.routinePrompts.morning },
    { id: 'f_matinee', label: 'Pendant la matinee', placeholder: profile.routinePrompts.midday },
    { id: 'f_apm', label: 'Apres-midi', placeholder: profile.routinePrompts.afternoon },
    { id: 'f_soir', label: 'En fin de journee', placeholder: profile.routinePrompts.endOfDay },
  ];

  const cycleFields = [
    { id: 'f_mois', label: 'Debut ou fin de mois', placeholder: profile.routinePrompts.month },
    { id: 'f_trim', label: 'Taches trimestrielles', placeholder: profile.routinePrompts.quarter },
    { id: 'f_annuel', label: 'Taches annuelles', placeholder: profile.routinePrompts.year },
    { id: 'f_deplac', label: 'Deplacements ou coordination multisites', placeholder: profile.routinePrompts.travel },
  ];

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section F</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Journal de bord par rythme
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Cette approche fait remonter les taches devenues invisibles parce qu elles sont integrees a la routine.
        </p>
      </div>

      <div className="audit-note audit-note-success mb-5">
        Pensez en sequences reelles : demarrage de journee, debut de semaine, cloture mensuelle,
        missions, deplacements, arbitrages de fin de journee.
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">F.1 - Routine quotidienne</div>
        <div className="grid gap-4">
          {routineFields.map((field) => (
            <div key={field.id}>
              <label className="mb-2 block">{field.label}</label>
              <textarea
                value={getInputValue(formData[field.id])}
                onChange={(event) => updateField(field.id, event.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">F.2 - Routine hebdomadaire</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block">Debut de semaine</label>
            <textarea
              value={formData.f_lundi}
              onChange={(event) => updateField('f_lundi', event.target.value)}
              placeholder={profile.routinePrompts.monday}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Fin de semaine</label>
            <textarea
              value={formData.f_vendredi}
              onChange={(event) => updateField('f_vendredi', event.target.value)}
              placeholder={profile.routinePrompts.friday}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card">
        <div className="mb-4 text-sm font-semibold text-slate-900">F.3 - Cycles mensuels et periodiques</div>
        <div className="grid gap-4">
          {cycleFields.map((field) => (
            <div key={field.id}>
              <label className="mb-2 block">{field.label}</label>
              <textarea
                value={getInputValue(formData[field.id])}
                onChange={(event) => updateField(field.id, event.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(5)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(7)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
