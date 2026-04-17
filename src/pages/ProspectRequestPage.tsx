import { ArrowRight, Briefcase, ChevronDown, Clock3, MailCheck, MapPin, PhoneCall, Sparkles, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { getSupabaseFunctionHeaders, getSupabaseFunctionUrl, isSupabaseConfigured } from '../lib/supabase';
import { saveProspectLocally } from '../lib/prospectStorage';
import type { ProspectFormValues, ProspectSubmissionResult } from '../types/prospect';

const initialFormValues: ProspectFormValues = {
  fullName: '',
  profession: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  activitySector: '',
  needDescription: '',
};

function isPreviewFriendlyError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('404') ||
    message.includes('failed to fetch') ||
    message.includes('function') ||
    message.includes('prospect_requests') ||
    message.includes('supabase')
  );
}

export default function ProspectRequestPage() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ProspectSubmissionResult | null>(null);

  const updateField = (field: keyof ProspectFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const saveInLocalPreview = () => {
    const prospect = saveProspectLocally(formValues);
    setResult({
      prospect,
      storageMode: 'local',
    });
    setFormValues(initialFormValues);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!isSupabaseConfigured) {
        saveInLocalPreview();
        return;
      }

      const response = await fetch(getSupabaseFunctionUrl('save-prospect-request'), {
        method: 'POST',
        headers: await getSupabaseFunctionHeaders(),
        body: JSON.stringify(formValues),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 404) {
          saveInLocalPreview();
          return;
        }

        throw new Error(data?.error || 'Impossible de soumettre la demande pour le moment.');
      }

      setResult({
        prospect: data.prospect,
        storageMode: 'supabase',
        notificationError: data.notification?.success === false ? data.notification?.error : undefined,
      });
      setFormValues(initialFormValues);
    } catch (submissionError) {
      if (isPreviewFriendlyError(submissionError)) {
        saveInLocalPreview();
        return;
      }

      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Une erreur est survenue pendant la création de la demande.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[980px] px-3 pb-24 pt-4 md:px-5 md:pt-6">
      <div className="audit-card audit-form">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="audit-pill bg-blue-100 text-blue-800">Formulaire de demande d'Audit IA</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">Formulaire de demande d'Audit IA</div>
              <p className="mt-1 text-sm text-slate-500">
                Renseignez les informations essentielles pour que nous puissions vous recontacter,
                créer votre fiche prospect et préparer l’envoi du formulaire d’audit.
              </p>
            </div>
            <span className="audit-pill bg-blue-100 text-blue-800">Réponse sous 48 h</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block">Nom complet</label>
                <input
                  type="text"
                  value={formValues.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder="ex. : Aminata Koné"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block">Profession</label>
                <input
                  type="text"
                  value={formValues.profession}
                  onChange={(event) => updateField('profession', event.target.value)}
                  placeholder="ex. : Directrice des opérations"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block">Email</label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="ex. : nom@entreprise.com"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block">Téléphone</label>
                <input
                  type="text"
                  value={formValues.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="ex. : +225 07 00 00 00 00"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block">Ville</label>
                <input
                  type="text"
                  value={formValues.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="ex. : Abidjan"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block">Pays</label>
                <input
                  type="text"
                  value={formValues.country}
                  onChange={(event) => updateField('country', event.target.value)}
                  placeholder="ex. : Côte d’Ivoire"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block">Secteur d’activité</label>
                <input
                  type="text"
                  value={formValues.activitySector}
                  onChange={(event) => updateField('activitySector', event.target.value)}
                  placeholder="ex. : banque, assurance, santé, industrie, logistique"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block">Décrivez votre besoin</label>
              <textarea
                value={formValues.needDescription}
                onChange={(event) => updateField('needDescription', event.target.value)}
                rows={5}
                placeholder="Expliquez le contexte, les équipes concernées, les irritants métier et le résultat attendu."
                required
              />
            </div>

            {error && (
              <div className="audit-note audit-note-danger">
                <div className="font-medium text-red-900">{error}</div>
              </div>
            )}

            {result && (
              <div className="audit-note audit-note-success">
                <div className="font-semibold text-emerald-900">
                  Votre compte prospect {result.prospect.prospect_code} a bien été créé.
                </div>
                <p className="mt-2 text-emerald-950/85">
                  Nous reviendrons vers vous avant le{' '}
                  <strong>{new Date(result.prospect.follow_up_due_at).toLocaleString('fr-FR')}</strong>{' '}
                  pour qualifier votre besoin et vous adresser le formulaire d’audit.
                </p>
                <p className="mt-2 text-sm text-emerald-950/80">
                  Mode actuel : {result.storageMode === 'supabase' ? 'sauvegarde Supabase' : 'aperçu local simulé'}.
                </p>
                {result.notificationError && (
                  <p className="mt-2 text-sm text-amber-900">
                    La fiche a été créée, mais la notification admin doit encore être finalisée : {result.notificationError}
                  </p>
                )}
              </div>
            )}

            <div className="section-actions">
              <div className="audit-note audit-note-info flex-1">
                En validant, vous créez une fiche prospect de suivi et autorisez notre équipe à vous
                recontacter pour organiser l’audit.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="audit-button audit-button-primary border-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Création en cours...' : 'Envoyer ma demande'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
      </div>

      <div className="mt-5 space-y-4">
        <details className="audit-card group !p-0 overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 md:px-6">
            <div>
              <div className="text-sm font-semibold text-slate-900">Ce qui se passe après votre demande</div>
              <div className="mt-1 text-xs text-slate-500">
                Version compacte des étapes, laissée en bas pour ne pas alourdir l’entrée du formulaire.
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" />
          </summary>

          <div className="border-t border-slate-900/8 bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 px-5 py-5 text-white md:px-6">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: UserRound,
                  title: 'Compte prospect créé',
                  description: 'Vos coordonnées et votre besoin sont enregistrés pour le suivi.',
                },
                {
                  icon: PhoneCall,
                  title: 'Retour d’un expert',
                  description: 'Nous qualifions votre besoin et confirmons le bon cadrage métier.',
                },
                {
                  icon: MailCheck,
                  title: 'Audit sous 48 h',
                  description: 'Le formulaire d’audit vous est envoyé après qualification.',
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-[20px] border border-white/12 bg-white/8 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white/10 p-3 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{step.title}</div>
                        <p className="mt-2 text-sm leading-6 text-white/72">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        <div className="audit-card">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Repères utiles</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Clock3, title: 'Délai de retour', value: 'Sous 48 heures ouvrées' },
              { icon: Briefcase, title: 'Cadrage', value: 'Audit adapté à votre secteur' },
              { icon: MapPin, title: 'Zone couverte', value: 'Afrique de l’Ouest et remote' },
              { icon: Sparkles, title: 'Livrable', value: 'Formulaire d’audit + cadrage' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[20px] border border-slate-900/8 bg-white/70 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.value}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
