import { useForm } from '../context/formContextCore';
import { getInputValue } from '../lib/formValue';

const scores = [
  { id: 'sc1', label: 'Aisance générale avec les outils numériques' },
  { id: 'sc2', label: 'Excel avancé, BI ou outils d’analyse' },
  { id: 'sc3', label: 'Usage actuel d’outils IA génératifs' },
  { id: 'sc4', label: 'Capacité à adopter vite un nouvel outil' },
  { id: 'sc5', label: 'Ouverture à changer les habitudes de travail' },
];

export default function Section4_Profil() {
  const { formData, updateField, setCurrentSection } = useForm();

  return (
    <div>
      <div className="audit-section-header mb-6">
        <span className="audit-pill bg-blue-100 text-blue-800">Section D</span>
        <h2 className="display-font mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Profil early adopter
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          On évalue ici la maturité digitale, les usages IA existants et les formats de restitution préférés.
        </p>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">D.1 - Auto-évaluation digitale</div>
        <div className="space-y-3">
          {scores.map((score) => (
            <div key={score.id} className="rounded-[20px] border border-slate-900/8 bg-slate-50/80 p-4">
              <div className="mb-3 text-sm text-slate-800">{score.label}</div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={getInputValue(formData[score.id], 5)}
                  onChange={(event) => updateField(score.id, event.target.value)}
                  className="flex-1"
                />
                <div className="display-font min-w-[52px] rounded-full bg-slate-950 px-3 py-2 text-center text-lg font-semibold text-white">
                  {getInputValue(formData[score.id], 5)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="audit-card mb-5">
        <div className="mb-4 text-sm font-semibold text-slate-900">D.2 - Expériences IA existantes</div>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">Outils déjà utilisés</label>
            <input
              type="text"
              value={formData.d_outils}
              onChange={(event) => updateField('d_outils', event.target.value)}
              placeholder="ex: ChatGPT, Copilot Microsoft, Gemini"
            />
          </div>
          <div>
            <label className="mb-2 block">Pour quelles tâches ?</label>
            <textarea
              value={formData.d_usage}
              onChange={(event) => updateField('d_usage', event.target.value)}
              placeholder="ex. : synthèses, reformulation, recherche, brouillons"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Ce qui vous a plu</label>
            <textarea
              value={formData.d_plus}
              onChange={(event) => updateField('d_plus', event.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block">Ce qui vous a limité</label>
            <textarea
              value={formData.d_moins}
              onChange={(event) => updateField('d_moins', event.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="audit-card">
        <div className="mb-4 text-sm font-semibold text-slate-900">D.3 - Formats de restitution préférés</div>
        <div className="grid gap-3">
          {[
            { id: 'fmt1', text: 'Email HTML quotidien avec résumé et liens directs' },
            { id: 'fmt2', text: 'Dashboard web interactif à consulter à la demande' },
            { id: 'fmt3', text: 'Document Word ou PDF généré automatiquement' },
            { id: 'fmt4', text: 'Notification mobile pour les alertes critiques' },
            { id: 'fmt5', text: 'Intégration Outlook, Teams ou outils existants' },
          ].map((item) => (
            <label key={item.id} className="flex items-start gap-3 rounded-[20px] border border-slate-900/8 bg-white/80 p-4">
              <input
                type="checkbox"
                checked={formData[item.id] as boolean}
                onChange={(event) => updateField(item.id, event.target.checked)}
                className="mt-1"
              />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-2 block">Précisions ou autre préférence</label>
          <textarea
            value={formData.d_format_autre}
            onChange={(event) => updateField('d_format_autre', event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="section-actions">
        <button onClick={() => setCurrentSection(3)} className="audit-button audit-button-secondary">
          Retour
        </button>
        <button onClick={() => setCurrentSection(5)} className="audit-button audit-button-primary sm:ml-auto">
          Section suivante
        </button>
      </div>
    </div>
  );
}
