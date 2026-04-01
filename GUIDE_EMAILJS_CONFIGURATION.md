# Note de migration documentaire

Le guide EmailJS détaillé a été absorbé dans la documentation canonique du projet :

- [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md)
- [docs/SETUP.md](docs/SETUP.md)

## Point important

Le code actuel n'utilise pas de variables frontend `VITE_EMAILJS_*` pour envoyer les invitations. Les valeurs suivantes doivent être configurées comme secrets Supabase uniquement si vous gardez le fallback EmailJS de l'Edge Function `send-invitation-email` :

- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_PUBLIC_KEY`
