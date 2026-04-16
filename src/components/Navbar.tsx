import { Database, Save, ShieldCheck } from 'lucide-react';
import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { calculateOverallProgress } from '../lib/formProgress';

export default function Navbar() {
  const { saveStatus, saveAll, formData } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);
  const progress = calculateOverallProgress(formData);
  const activeLabel = formData.c_poste?.trim() || profile.label || 'Audit métier';
  const activeEntity = formData.c_entite?.trim() || 'Session en préparation';

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <div className="panel-dark rounded-[28px] border border-white/10 text-white">
        <div className="flex flex-col gap-5 px-4 py-4 md:px-7 md:py-5 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">
              <span className="audit-pill bg-white/10 text-white/80">Banking AI Audit</span>
              <span className="audit-pill bg-emerald-400/12 text-emerald-100">{activeEntity}</span>
            </div>
            <div className="display-font text-xl font-semibold md:text-[1.7rem]">{activeLabel}</div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/72">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Questionnaire adapté au domaine choisi
              </span>
              <span className="inline-flex items-center gap-2">
                <Database className="h-4 w-4" />
                {progress.done}/{progress.total} étapes bien renseignées
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[310px]">
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/58">
                <span>Progression</span>
                <span>{progress.overall}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-teal-300 to-cyan-200 transition-all duration-500"
                  style={{ width: `${progress.overall}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-white/72">{saveStatus}</div>
            </div>

            <button onClick={saveAll} className="audit-button audit-button-primary w-full border-0">
              <Save className="h-4 w-4" />
              Sauvegarder mes réponses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
