import { CheckCircle, RotateCcw, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    c_nom?: string;
    c_email?: string;
    c_poste?: string;
    c_entite?: string;
    email_dest?: string;
    libreRowCount?: number;
  };
  completionPercentage: number;
  emailSent: boolean;
  sentRecipient?: string;
  onResetForm?: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  formData,
  completionPercentage,
  emailSent,
  sentRecipient,
  onResetForm,
}: SuccessModalProps) {
  if (!isOpen) return null;

  const handleStartNewForm = () => {
    if (onResetForm) {
      onResetForm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="panel-glass w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/70">
        <div className="panel-dark flex items-center justify-between px-6 py-5 text-white md:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-400/12 p-3 text-emerald-100">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="display-font text-2xl font-semibold">Formulaire soumis avec succes</h2>
              <p className="mt-1 text-sm text-white/70">Le dossier est enregistre et pret a etre exploite.</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-2xl p-2 text-white transition-colors hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6 md:p-8">
          <div className="audit-note audit-note-success">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-emerald-900">Soumission enregistree</div>
                <p className="mt-1 text-sm text-emerald-950/80">
                  Taux de completion : <strong>{completionPercentage}%</strong>
                </p>
              </div>
              {emailSent && (
                <div className="rounded-[18px] border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  Email envoye a <strong>{sentRecipient || formData.email_dest || formData.c_email || 'la destination configuree'}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="audit-card !p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Repondant</div>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Nom</div>
                  <div className="mt-1 font-semibold text-slate-900">{formData.c_nom || '-'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Email</div>
                  <div className="mt-1 font-semibold text-slate-900">{formData.c_email || '-'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Poste</div>
                  <div className="mt-1 font-semibold text-slate-900">{formData.c_poste || '-'}</div>
                </div>
              </div>
            </div>

            <div className="audit-card !p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Perimetre</div>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Entite</div>
                  <div className="mt-1 font-semibold text-slate-900">{formData.c_entite || '-'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Taches libres</div>
                  <div className="mt-1 font-semibold text-slate-900">{formData.libreRowCount || 0} taches</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Destinataire</div>
                  <div className="mt-1 font-semibold text-slate-900">{formData.email_dest || formData.c_email || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="audit-card !p-5">
            <div className="text-sm font-semibold text-slate-900">Que se passe-t-il maintenant ?</div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <li>Les donnees sont sauvegardees dans la base si le backend est configure.</li>
              <li>Le dossier devient consultable depuis le tableau de bord admin.</li>
              {emailSent && <li>Un email recapitulatif a ete envoye a l adresse configuree.</li>}
              <li>Vous pouvez encore modifier la reponse et soumettre a nouveau si necessaire.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onClose} className="audit-button audit-button-secondary flex-1">
              Fermer
            </button>
            <button onClick={handleStartNewForm} className="audit-button audit-button-primary flex-1 border-0">
              <RotateCcw className="h-4 w-4" />
              Nouveau formulaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
