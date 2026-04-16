import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useForm } from '../context/formContextCore';
import { auditSections, calculateOverallProgress, calculateSectionProgress } from '../lib/formProgress';

export default function Sidebar() {
  const { currentSection, setCurrentSection, formData } = useForm();
  const progress = calculateOverallProgress(formData);

  return (
    <aside className="panel-glass rounded-[28px] border border-white/70 p-3 lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)] lg:overflow-hidden">
      <div className="mb-4 rounded-[22px] border border-slate-900/8 bg-slate-950 px-4 py-4 text-white">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Parcours</div>
        <div className="display-font mt-2 text-xl font-semibold">{progress.overall}% complété</div>
        <div className="mt-2 text-sm text-white/72">
          {progress.done} étapes bien renseignées sur {progress.total} suivies.
        </div>
      </div>

      <div className="audit-mobile-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-y-auto lg:pb-0">
        {auditSections.map((section) => {
          const sectionProgress = section.id <= 9 ? calculateSectionProgress(formData, section.id) : progress.overall;
          const isActive = currentSection === section.id;
          const isDone = section.id <= 9 ? sectionProgress >= 60 : progress.overall >= 70;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setCurrentSection(section.id);
                window.scrollTo(0, 0);
              }}
              className={`group min-w-[220px] snap-start rounded-[22px] border p-4 text-left transition-all duration-200 lg:block lg:w-full ${
                isActive
                  ? 'border-blue-300 bg-blue-50/90 shadow-[0_14px_30px_rgba(20,71,166,0.12)]'
                  : 'border-slate-900/8 bg-white/68 hover:border-slate-900/14 hover:bg-white'
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Étape {section.code}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{section.label}</div>
                </div>
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ArrowRight className={`h-4 w-4 text-slate-400 transition-transform ${isActive ? 'translate-x-0.5 text-blue-700' : 'group-hover:translate-x-0.5'}`} />
                )}
              </div>

              <p className="text-xs leading-5 text-slate-600">{section.description}</p>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDone ? 'bg-emerald-500' : isActive ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(sectionProgress, section.id === 0 ? 8 : 0)}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {section.id <= 9 ? `${sectionProgress}%` : `${progress.overall}%`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
