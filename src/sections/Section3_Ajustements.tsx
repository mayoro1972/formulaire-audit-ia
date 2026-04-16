import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';

export default function Section3_Ajustements() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section C</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Ajustements et corrections
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Cette partie permet de corriger la vision initiale et de faire émerger les priorités
          personnelles du répondant.
        </p>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">C.1 - Estimations inexactes</div>
        <label className="mb-2 block">Quelles estimations doivent être corrigées ?</label>
        <textarea
          value={formData.c_inexact}
          onChange={(event) => updateField('c_inexact', event.target.value)}
          placeholder={profile.inaccuracyExample}
          rows={4}
        />
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">C.2 - Tâches à garder manuelles</div>
        <label className="mb-2 block">Quelles activités ne doivent pas être automatisées, et pourquoi ?</label>
        <textarea
          value={formData.c_exclure}
          onChange={(event) => updateField('c_exclure', event.target.value)}
          placeholder={profile.exclusionExample}
          rows={4}
        />
      </div>

      <div className="audit-card">
        <div className="mb-4 text-sm font-semibold text-slate-900">C.3 - Priorités IA personnelles</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Priorité 1 - gain maximum immédiat</label>
            <textarea
              value={formData.c_prio1}
              onChange={(event) => updateField('c_prio1', event.target.value)}
              placeholder="Décrivez le module ou le cas d’usage qui aurait le plus d’impact tout de suite."
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Priorité 2</label>
            <textarea
              value={formData.c_prio2}
              onChange={(event) => updateField('c_prio2', event.target.value)}
              placeholder="Deuxième priorité."
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Priorité 3</label>
            <textarea
              value={formData.c_prio3}
              onChange={(event) => updateField('c_prio3', event.target.value)}
              placeholder="Troisième priorité."
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Ce que vous attendez concrètement de l’IA</label>
            <textarea
              value={formData.c_attentes}
              onChange={(event) => updateField('c_attentes', event.target.value)}
              placeholder={profile.expectationsExample}
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(2)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(4)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
