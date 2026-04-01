# Note de migration documentaire

La stratégie email actuelle du projet est la suivante :

- invitations : Resend avec fallback EmailJS
- exports de formulaires : Resend
- notifications admin : Resend
- réception et transfert entrants : Resend

Le détail, les limites et les options de rationalisation sont documentés ici :

- [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Si l'objectif est d'unifier tous les envois sur un seul fournisseur, commencez par [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md), qui liste précisément les flux actifs et les incohérences actuelles.
