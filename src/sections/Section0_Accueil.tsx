import { ArrowRight, ClipboardCheck, Link2, Mail, Shield, Sparkles } from 'lucide-react';
import { useForm } from '../context/formContextCore';
import {
  buildDomainAutomationBlueprint,
  competencyDomains,
  getCompetencyDomainProfile,
} from '../lib/competencyDomains';
import { calculateOverallProgress } from '../lib/formProgress';

const coveredJourneys = [
  {
    title: 'Repondant standard',
    description: 'Remplit le questionnaire, enregistre la reponse et peut envoyer un export par email.',
  },
  {
    title: 'Repondant invite',
    description: 'Recupere un lien unique avec identite pre-remplie pour reprendre ou completer un brouillon.',
  },
  {
    title: 'Administrateur',
    description: 'Consulte les soumissions, exporte les reponses et envoie des invitations nominatives.',
  },
];

const platformFeatures = [
  { icon: ClipboardCheck, label: '9 sections metier + envoi' },
  { icon: Shield, label: 'Sauvegarde locale + persistence Supabase' },
  { icon: Mail, label: 'Exports email CSV, PDF ou Word' },
  { icon: Sparkles, label: 'Adaptation dynamique selon le domaine' },
];

export default function Section0_Accueil() {
  const { formData, updateField, setCurrentSection } = useForm();
  const domainProfile = getCompetencyDomainProfile(formData.c_domaine);
  const automationBlueprint = buildDomainAutomationBlueprint(formData);
  const progress = calculateOverallProgress(formData);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert('Lien copie dans le presse-papiers.');
  };

  return (
    <div>
      <div className="audit-section-header mb-6 overflow-hidden">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="audit-pill bg-blue-100 text-blue-800">README transforme en parcours</span>
              <span className="audit-pill bg-emerald-100 text-emerald-800">Audit IA metier</span>
            </div>
            <h1 className="display-font mt-5 text-3xl font-semibold text-slate-950 md:text-5xl">
              Formulaire d audit IA pour cartographier, prioriser et transmettre les usages.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
              Cette experience reprend le scope du README dans un parcours simple a renseigner :
              collecte structuree, sauvegarde automatique, enregistrement Supabase,
              invitations nominatives, dashboard admin et restitution par email.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {platformFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.label} className="rounded-[20px] border border-slate-900/8 bg-white/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-medium text-slate-800">{feature.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-900/8 bg-slate-950 p-5 text-white shadow-[0_24px_50px_rgba(15,37,66,0.18)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">Etat du dossier</div>
            <div className="display-font mt-3 text-5xl font-semibold">{progress.overall}%</div>
            <div className="mt-2 text-sm text-white/70">
              {progress.done} sections confirmees sur {progress.total}
            </div>
            <div className="mt-5 h-2.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-teal-300 to-cyan-200"
                style={{ width: `${progress.overall}%` }}
              />
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">Domaine actif</div>
                <div className="mt-1 font-semibold">{domainProfile.label}</div>
                <div className="mt-1 text-xs text-white/60">{domainProfile.summary}</div>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">Parcours couverts</div>
                <div className="mt-1 font-semibold">Standard, invite et admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Identite du repondant</div>
            <p className="mt-1 text-sm text-slate-500">
              Ces informations servent de fil rouge pour la personnalisation du questionnaire et des exports.
            </p>
          </div>
          <button onClick={handleCopyLink} className="audit-button audit-button-secondary">
            <Link2 className="h-4 w-4" />
            Copier le lien
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-2 block">Nom complet</label>
            <input
              type="text"
              value={formData.c_nom}
              onChange={(event) => updateField('c_nom', event.target.value)}
              placeholder="ex: Jean Dupont"
            />
          </div>
          <div>
            <label className="mb-2 block">Email du repondant</label>
            <input
              type="email"
              value={formData.c_email}
              onChange={(event) => updateField('c_email', event.target.value)}
              placeholder="ex: nom@entreprise.com"
            />
          </div>
          <div>
            <label className="mb-2 block">Fonction</label>
            <input
              type="text"
              value={formData.c_poste}
              onChange={(event) => updateField('c_poste', event.target.value)}
              placeholder="ex: Directeur des Operations"
            />
          </div>
          <div>
            <label className="mb-2 block">Entite</label>
            <input
              type="text"
              value={formData.c_entite}
              onChange={(event) => updateField('c_entite', event.target.value)}
              placeholder="ex: Nom de votre entreprise"
            />
          </div>
          <div>
            <label className="mb-2 block">Domaine principal</label>
            <select value={formData.c_domaine} onChange={(event) => updateField('c_domaine', event.target.value)}>
              <option value="">Selectionner un domaine</option>
              {competencyDomains.map((domain) => (
                <option key={domain.key} value={domain.key}>
                  {domain.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block">Domaines associes ou contexte</label>
            <input
              type="text"
              value={formData.c_domaines_associes}
              onChange={(event) => updateField('c_domaines_associes', event.target.value)}
              placeholder="ex: conformite, reporting, coordination siege"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="audit-card">
          <div className="mb-4 text-sm font-semibold text-slate-900">Trame IA proposee pour ce domaine</div>
          <p className="text-sm leading-7 text-slate-600">{automationBlueprint.recommendation}</p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Axes d audit a cadrer
              </div>
              <div className="flex flex-wrap gap-2">
                {automationBlueprint.priorityAreas.map((area) => (
                  <span key={area} className="rounded-full bg-blue-100 px-3 py-2 text-xs font-medium text-blue-800">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Automatisations suggerees
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {automationBlueprint.automationIdeas.map((idea) => (
                  <li key={idea} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="audit-card">
          <div className="mb-4 text-sm font-semibold text-slate-900">Parcours couverts par l application</div>
          <div className="space-y-3">
            {coveredJourneys.map((journey) => (
              <div key={journey.title} className="rounded-[20px] border border-slate-900/8 bg-white/70 p-4">
                <div className="font-semibold text-slate-900">{journey.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{journey.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="audit-card mt-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">Engagement du repondant</div>
        <div className="grid gap-3">
          {[
            { id: 'eng1', text: "Je m engage a tester les premiers modules IA des qu ils seront disponibles." },
            { id: 'eng2', text: 'Je m engage a donner un feedback regulier pour ameliorer les outils.' },
            { id: 'eng3', text: 'Je m engage a partager les apprentissages utiles avec mon equipe.' },
            { id: 'eng4', text: 'Je confirme que les informations fournies refletent ma realite de travail.' },
          ].map((item) => (
            <label key={item.id} className="flex items-start gap-3 rounded-[20px] border border-slate-900/8 bg-white/80 p-4">
              <input
                type="checkbox"
                checked={formData[item.id] as boolean}
                onChange={(event) => updateField(item.id, event.target.checked)}
                className="mt-1"
              />
              <span className="text-sm leading-6 text-slate-700">{item.text}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section-actions">
        <div className="audit-note audit-note-info flex-1">
          Vous pouvez avancer dans l ordre ou naviguer librement. Vos reponses sont sauvegardees
          localement, puis pourront etre enregistrees ou envoyees au format CSV, PDF ou Word.
        </div>
        <button onClick={() => setCurrentSection(1)} className="audit-button audit-button-primary sm:self-end">
          Commencer le questionnaire
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
