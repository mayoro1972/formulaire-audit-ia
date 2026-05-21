import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FormProvider } from '../context/FormContext';
import { useForm } from '../context/formContextCore';
import { getCompetencyDomainProfile } from '../lib/competencyDomains';
import { calculateOverallProgress, getCurrentSectionMeta } from '../lib/formProgress';
import Section0_Accueil from '../sections/Section0_Accueil';
import Section10_Envoi from '../sections/Section10_Envoi';
import Section1_Charge from '../sections/Section1_Charge';
import Section2_Taches from '../sections/Section2_Taches';
import Section3_Ajustements from '../sections/Section3_Ajustements';
import Section4_Profil from '../sections/Section4_Profil';
import Section5_TachesLibres from '../sections/Section5_TachesLibres';
import Section6_Journal from '../sections/Section6_Journal';
import Section7_Douleurs from '../sections/Section7_Douleurs';
import Section8_Vision from '../sections/Section8_Vision';
import Section9_Contraintes from '../sections/Section9_Contraintes';

interface AuditFormShellProps {
  previewMode?: boolean;
}

export function AuditFormShell({ previewMode = false }: AuditFormShellProps) {
  const { currentSection, formData } = useForm();
  const profile = getCompetencyDomainProfile(formData.c_domaine);
  const currentMeta = getCurrentSectionMeta(currentSection);
  const progress = calculateOverallProgress(formData);

  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[10rem] h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-[12rem] h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-[18%] h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <Navbar />

      <div className="relative mx-auto mt-5 max-w-[1560px] px-3 md:px-5">
        {previewMode && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="audit-pill bg-amber-100 text-amber-900">Aperçu du formulaire d’audit historique</div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
          <Sidebar />

          <main className="audit-form min-w-0 pb-28 sm:pb-8">
            <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="audit-section-header">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="audit-pill bg-blue-100 text-blue-800">Étape {currentMeta.code}</span>
                  <span className="audit-pill bg-amber-100 text-amber-800">{profile.label}</span>
                </div>
                <div className="display-font text-3xl font-semibold text-slate-950 md:text-4xl">
                  {currentMeta.label}
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
                  {currentMeta.description}
                  {previewMode
                    ? " Cette vue présente le parcours historique complet du formulaire d’audit pour relecture et ajustement."
                    : " Complétez les informations utiles pour permettre à l’équipe TransferAI Africa d’analyser votre contexte et de préparer la suite de l’audit."}
                </p>
              </section>

              <aside className="audit-soft-card">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Synthèse de session
                </div>
                <div className="mt-3 display-font text-4xl font-semibold text-slate-950">
                  {progress.overall}%
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {progress.done} étapes bien renseignées sur {progress.total}
                </div>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-slate-900/8 bg-white/70 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Répondant</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {formData.c_nom?.trim() || 'À compléter'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formData.c_email?.trim() || 'Aucun email'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-900/8 bg-white/70 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Périmètre</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {formData.c_entite?.trim() || 'Entité non renseignée'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formData.c_poste?.trim() || profile.summary}</div>
                  </div>
                </div>
              </aside>
            </div>

            {currentSection === 0 && <Section0_Accueil />}
            {currentSection === 1 && <Section1_Charge />}
            {currentSection === 2 && <Section2_Taches />}
            {currentSection === 3 && <Section3_Ajustements />}
            {currentSection === 4 && <Section4_Profil />}
            {currentSection === 5 && <Section5_TachesLibres />}
            {currentSection === 6 && <Section6_Journal />}
            {currentSection === 7 && <Section7_Douleurs />}
            {currentSection === 8 && <Section8_Vision />}
            {currentSection === 9 && <Section9_Contraintes />}
            {currentSection === 10 && <Section10_Envoi />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AuditFormPreviewPage() {
  return (
    <FormProvider>
      <AuditFormShell previewMode />
    </FormProvider>
  );
}
