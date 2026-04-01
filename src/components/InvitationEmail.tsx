export default function InvitationEmail() {
  const appUrl = window.location.href;

  const emailSubject = encodeURIComponent("Formulaire d'Audit IA - À compléter");
  const emailBody = encodeURIComponent(`Bonjour Gérard,

Veuillez compléter le formulaire d'audit IA en cliquant sur le lien ci-dessous :

${appUrl}

Le formulaire :
- Se sauvegarde automatiquement toutes les 30 secondes
- Peut être rempli en plusieurs fois (vous pouvez fermer et reprendre)
- Prend environ 30-45 minutes à compléter
- Comporte 9 sections principales + récapitulatif

Instructions :
1. Cliquez sur le lien ci-dessus
2. Remplissez les sections dans l'ordre ou selon vos préférences
3. Vos réponses sont automatiquement sauvegardées
4. Une fois terminé, allez à la section "Envoi & récapitulatif"
5. Cliquez sur "Envoyer" pour transmettre vos réponses

Si vous avez des questions, n'hésitez pas à me contacter.

Cordialement`);

  const mailtoLink = `mailto:g.yapi@attijariwafabank.com?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-[#185FA5] rounded-lg shadow-lg p-4 max-w-sm">
      <div className="text-sm font-semibold text-[#042C53] mb-2">Partager ce formulaire</div>
      <div className="text-xs text-[#888780] mb-3">
        Envoyez ce formulaire à Gérard pour qu'il puisse le remplir
      </div>
      <div className="space-y-2">
        <a
          href={mailtoLink}
          className="block w-full bg-[#185FA5] text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-[#042C53] transition-all"
        >
          Envoyer par email
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(appUrl);
            alert('Lien copié dans le presse-papiers !');
          }}
          className="block w-full bg-white text-[#185FA5] border border-[#185FA5] text-center py-2 rounded-lg text-sm font-medium hover:bg-[#E6F1FB] transition-all"
        >
          Copier le lien
        </button>
      </div>
    </div>
  );
}
