# Note de migration documentaire

Ce fichier est conservé pour compatibilité, mais la documentation à jour se trouve dans :

- [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md)
- [docs/SETUP.md](docs/SETUP.md)

## Flux actif

Le frontend appelle aujourd'hui `send-invitation-email`, qui :

- utilise Resend en priorité
- peut retomber sur EmailJS si les secrets fallback sont présents
- reçoit aussi un indicateur permettant d'annoncer un brouillon prérempli dans le mail

La fonction `send-emailjs-invitation` est toujours présente dans le dépôt comme ancienne implémentation, mais elle n'est plus branchée sur le frontend.
