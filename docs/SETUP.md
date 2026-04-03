# Installation et déploiement

## Prérequis

- Node.js 18 ou plus
- npm
- un projet Supabase
- Supabase CLI recommandé pour appliquer les migrations et déployer les Edge Functions
- un compte Resend pour les exports et notifications
- un compte EmailJS pour l'envoi des invitations si vous gardez le flux actuel

## 1. Installer le frontend

```bash
npm install
```

## 2. Configurer les variables frontend

Créer `.env` ou `.env.local` à partir de `.env.example` :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Ces deux variables sont obligatoires. Sans elles, `src/lib/supabase.ts` lève immédiatement une erreur.

## 3. Préparer Supabase

### Migrations

Le dépôt contient déjà les migrations SQL dans `supabase/migrations/`.

Exemple de workflow :

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Les migrations créent notamment :

- `form_responses`
- `form_invitations`
- `admin_settings`
- `received_emails`

### Edge Functions à déployer

Fonctions actuellement utiles :

- `notify-admin`
- `send-form-email`
- `send-invitation-email`

Fonctions optionnelles selon votre configuration :

- `receive-email`
- `forward-to-gmail`
- `send-emailjs-invitation`

Exemple :

```bash
supabase functions deploy notify-admin
supabase functions deploy send-form-email
supabase functions deploy send-invitation-email
```

## 4. Secrets Supabase à configurer

Le fichier `supabase/.env.example` sert de modèle. Les secrets attendus sont les suivants.

| Secret | Utilisé par | Obligatoire | Rôle |
| --- | --- | --- | --- |
| `SUPABASE_URL` | `receive-email`, `send-form-email` | Oui | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `receive-email`, `send-form-email`, `notify-admin` | Oui | accès service pour lectures/écritures backend |
| `RESEND_API_KEY` | `notify-admin`, `send-form-email`, `forward-to-gmail`, `send-invitation-email` | Oui pour Resend | envoi d'emails via Resend |
| `FROM_EMAIL` | fonctions Resend | Recommandé | expéditeur affiché |
| `ADMIN_EMAIL` | `notify-admin` | Optionnel | fallback si `admin_settings.admin_email` est vide |
| `EMAILJS_SERVICE_ID` | `send-invitation-email` fallback | Optionnel | service EmailJS |
| `EMAILJS_TEMPLATE_ID` | `send-invitation-email` fallback | Optionnel | template EmailJS invitation |
| `EMAILJS_RETURN_TEMPLATE_ID` | `send-form-email` fallback | Recommande | template EmailJS retour formulaire |
| `EMAILJS_RETURN_SERVICE_ID` | `send-form-email` fallback | Optionnel | service EmailJS dedie au retour formulaire |
| `EMAILJS_PUBLIC_KEY` | `send-invitation-email` fallback | Optionnel | clé publique EmailJS |
| `GMAIL_FORWARD_ADDRESS` | `receive-email` | Optionnel | adresse Gmail de relais |

## 5. Configuration email

### Flux actif pour les invitations

Le frontend appelle `send-invitation-email`, donc il faut aujourd'hui :

- idéalement Resend (`RESEND_API_KEY`, `FROM_EMAIL`)
- éventuellement EmailJS en fallback si vous souhaitez conserver cette solution

Important : les anciennes docs du repo évoquaient des variables `VITE_EMAILJS_*` côté frontend. Ce n'est plus le flux actif. Les secrets sont lus côté Edge Function.

### Email administrateur

L'interface admin écrit l'adresse de notification dans la table `admin_settings`.

`notify-admin` lit maintenant cette valeur en priorité. `ADMIN_EMAIL` ne sert plus que de secours backend si la table n'est pas renseignée.

### Flux actif pour les formulaires envoyés

`send-form-email` utilise Resend et génère une pièce jointe :

- `csv`
- `pdf`
- `word`

Il faut donc :

- un domaine ou une adresse autorisée dans Resend
- `RESEND_API_KEY`
- `FROM_EMAIL`

Le détail des flux est documenté dans [EMAIL_WORKFLOWS.md](EMAIL_WORKFLOWS.md).

## 6. Lancer l'application

```bash
npm run dev
```

## 7. Vérifier le projet

```bash
npm run typecheck
npm run build
```

## Développement local des Edge Functions

Si vous souhaitez tester localement les Edge Functions, préparez un fichier de secrets local à partir de `supabase/.env.example`, puis servez les fonctions avec la Supabase CLI.

Exemple :

```bash
supabase functions serve --env-file supabase/.env.local
```

## Checklist de mise en service

- frontend configuré avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- migrations appliquées
- Edge Functions déployées
- secrets Resend ajoutés
- secrets EmailJS ajoutés si vous gardez le flux d'invitation actuel
- expéditeur `FROM_EMAIL` valide
- webhook Resend configuré si vous utilisez la réception d'emails
- lecture de [SECURITY.md](SECURITY.md) avant toute exposition publique

## Recommandation avant production

Avant d'exposer l'application sur Internet, il faut au minimum :

- ajouter une authentification réelle pour le mode admin
- revoir les politiques RLS
- corriger la persistance du `responseId`

Ces points sont détaillés dans [SECURITY.md](SECURITY.md) et [ARCHITECTURE.md](ARCHITECTURE.md).
