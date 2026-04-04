import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';

export default function Section8_Vision() {
  const { formData, updateField, setCurrentSection } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section H</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Vision IA pour le metier
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Cette section transforme les irritants en ambition cible, pour prioriser une feuille de route.
        </p>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">H.1 - Ideal a 6 mois</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Si une seule tache pouvait etre automatisee dans 6 mois, laquelle ?</label>
            <textarea
              value={formData.h_une}
              onChange={(event) => updateField('h_une', event.target.value)}
              placeholder="Soyez tres precis sur la tache ou le flux vise."
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Pourquoi cette priorite ?</label>
            <textarea
              value={formData.h_pourquoi}
              onChange={(event) => updateField('h_pourquoi', event.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">H.2 - Vision a 18 mois</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">A quoi ressemble votre journee type avec l IA ?</label>
            <textarea
              value={formData.h_vision}
              onChange={(event) => updateField('h_vision', event.target.value)}
              rows={4}
            />
          </div>
          <div>
            <label className="mb-2 block">Taches totalement deleguees a l IA</label>
            <textarea
              value={formData.h_delegate}
              onChange={(event) => updateField('h_delegate', event.target.value)}
              placeholder={profile.vision.delegate}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Expertise humaine a conserver</label>
            <textarea
              value={formData.h_humain}
              onChange={(event) => updateField('h_humain', event.target.value)}
              placeholder={profile.vision.human}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card">
        <div className="mb-4 text-sm font-semibold text-slate-900">H.3 - Deploiement metier et KPI</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Comment deployer ces usages dans l equipe ou le reseau ?</label>
            <textarea
              value={formData.h_awa}
              onChange={(event) => updateField('h_awa', event.target.value)}
              placeholder={profile.vision.deployment}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Quels indicateurs prouveront le succes ?</label>
            <textarea
              value={formData.h_kpi}
              onChange={(event) => updateField('h_kpi', event.target.value)}
              placeholder={profile.vision.kpis}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(7)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(9)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
