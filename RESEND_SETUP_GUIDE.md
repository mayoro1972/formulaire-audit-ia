# Note de migration documentaire

La configuration Resend est désormais documentée de manière centralisée dans :

- [docs/SETUP.md](docs/SETUP.md)
- [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md)
- [docs/SECURITY.md](docs/SECURITY.md)

## Secrets Resend réellement utilisés dans le code

- `RESEND_API_KEY`
- `FROM_EMAIL`
- `ADMIN_EMAIL` en fallback backend
- `GMAIL_FORWARD_ADDRESS` (optionnel)

## Fonctions concernées

- `notify-admin`
- `send-form-email`
- `forward-to-gmail`
- `receive-email` (pour le webhook et le stockage)
- `send-invitation-email` pour les invitations
