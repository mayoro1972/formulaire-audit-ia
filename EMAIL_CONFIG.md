# Note de migration documentaire

Cette page n'est plus la source de vérité principale.

La documentation email a été consolidée dans :

- [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md)
- [docs/SETUP.md](docs/SETUP.md)

## À retenir

- les invitations utilisent `send-invitation-email`
- Resend est utilisé en priorité, avec fallback EmailJS si vous gardez cette configuration
- les exports du formulaire et les notifications admin passent par Resend

Pour toute nouvelle configuration, partez des documents ci-dessus et non des anciennes instructions dispersées.
