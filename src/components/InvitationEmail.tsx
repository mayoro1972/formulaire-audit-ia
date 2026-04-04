import { Copy, Mail, Sparkles } from 'lucide-react';

export default function InvitationEmail() {
  const appUrl = window.location.href;

  const emailSubject = encodeURIComponent("Formulaire d'Audit IA - A completer");
  const emailBody = encodeURIComponent(`Bonjour,

Veuillez completer le formulaire d'audit IA via le lien ci-dessous :

${appUrl}

Le formulaire :
- se sauvegarde automatiquement
- peut etre rempli en plusieurs fois
- prend environ 30 a 45 minutes
- couvre 9 sections metier plus un recapitulatif

Instructions :
1. Ouvrez le lien
2. Renseignez les sections dans l'ordre souhaite
3. Sauvegardez ou reprenez si besoin
4. Terminez par l'etape d'envoi et recapitulatif

Cordialement`);

  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="panel-glass fixed bottom-4 right-4 z-40 max-w-sm rounded-[26px] border border-white/70 p-4 shadow-[0_24px_44px_rgba(11,31,56,0.14)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-blue-100 p-3 text-blue-800">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Partager ce formulaire</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">
            Envoyez un lien propre et contextualise a votre contact.
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-[18px] border border-slate-900/8 bg-white/70 px-4 py-3 text-xs leading-5 text-slate-600 break-all">
        {appUrl}
      </div>

      <div className="grid gap-2">
        <a href={mailtoLink} className="audit-button audit-button-primary w-full border-0">
          <Mail className="h-4 w-4" />
          Envoyer par email
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(appUrl);
            alert('Lien copie dans le presse-papiers.');
          }}
          className="audit-button audit-button-secondary w-full"
        >
          <Copy className="h-4 w-4" />
          Copier le lien
        </button>
      </div>
    </div>
  );
}
