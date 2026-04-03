# Formulaire Audit IA

Application React + Supabase pour conduire un audit IA métier, collecter des réponses structurées, envoyer des invitations nominatives et suivre les soumissions dans un tableau de bord admin.

Le questionnaire actuellement codé est fortement contextualisé pour un cas d'usage Attijari West Africa / audit interne. Ce dépôt n'est donc pas un générateur de formulaires générique : il embarque déjà le wording métier, les sections du questionnaire et les exports attendus.

## Ce que fait l'application

- Guide un répondant à travers 9 sections métier plus un écran d'envoi.
- Sauvegarde les réponses dans le navigateur pendant la saisie.
- Enregistre les réponses dans Supabase.
- Permet l'envoi du formulaire complété par email avec pièce jointe CSV, PDF ou Word.
- Permet à un administrateur de consulter les réponses et d'exporter les données.
- Gère des invitations par lien unique via `?invite=...`.
- Peut recevoir des emails entrants via Resend et les transférer vers Gmail.

## Parcours couverts

### 1. Répondant standard

Le répondant ouvre l'application, remplit le questionnaire, enregistre ses réponses dans Supabase puis peut envoyer un export par email.

### 2. Répondant invité

Un administrateur crée une invitation dans l'interface "Envoyer invitations". L'application génère un jeton, l'enregistre dans `form_invitations`, puis appelle une Edge Function qui expédie l'email d'invitation. Quand le destinataire ouvre le lien, son nom et son email sont préremplis.

Une invitation peut aussi embarquer un brouillon déjà préparé dans le formulaire principal. Cela permet à une personne interne de renseigner un premier snapshot, puis d'envoyer au client un lien qu'il reprendra dans le navigateur.

### 3. Administrateur

Depuis l'écran principal, deux boutons flottants ouvrent :

- `Mode Admin` : visualisation des réponses, export CSV global, export JSON unitaire, suppression.
- `Envoyer invitations` : création d'invitations et déclenchement des emails d'invitation.

Important : ces vues ne sont pas protégées côté interface. La sécurité réelle dépend donc entièrement des politiques Supabase actuellement en place.

## Stack technique

- Frontend : Vite, React 18, TypeScript, Tailwind CSS, Lucide.
- Backend : Supabase Postgres + Row Level Security + Edge Functions Deno.
- Email sortant :
  - invitations : Resend via `send-invitation-email`, avec fallback EmailJS
  - exports du formulaire : Resend via `send-form-email`
  - notifications admin : Resend via `notify-admin`
- Email entrant : webhook Resend `receive-email` + transfert Gmail optionnel via `forward-to-gmail`

## Structure utile du dépôt

```text
src/
  components/           UI partagée
  context/              état global du formulaire, autosave, soumission
  pages/                dashboard admin, invitations, mode invitation
  sections/             sections 0 à 10 du questionnaire
  lib/                  client Supabase + types DB
supabase/
  migrations/           schéma SQL et politiques RLS
  functions/            Edge Functions email et webhooks
docs/
  ARCHITECTURE.md
  SETUP.md
  QUESTIONNAIRE.md
  EMAIL_WORKFLOWS.md
  SECURITY.md
```

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer le frontend

Créer un fichier `.env` ou `.env.local` à partir de `.env.example` :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Lancer le frontend

```bash
npm run dev
```

### 4. Vérifier le build

```bash
npm run typecheck
npm run build
```

## Secrets backend attendus

Les Edge Functions utilisent des secrets Supabase distincts des variables `VITE_*`. Le fichier [supabase/.env.example](supabase/.env.example) documente les valeurs attendues.

Les secrets principaux sont :

- `RESEND_API_KEY`
- `FROM_EMAIL`
- `ADMIN_EMAIL` (fallback si `admin_settings.admin_email` n'est pas défini)
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID` pour les invitations
- `EMAILJS_RETURN_TEMPLATE_ID` pour le retour formulaire
- `EMAILJS_PUBLIC_KEY`
- `GMAIL_FORWARD_ADDRESS` (optionnel)
- `SUPABASE_SERVICE_ROLE_KEY`

Le détail de chaque variable est décrit dans [docs/SETUP.md](docs/SETUP.md) et [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md).

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : architecture applicative, flux, tables Supabase et fonctions Edge.
- [docs/SETUP.md](docs/SETUP.md) : installation locale, variables d'environnement, déploiement Supabase.
- [docs/QUESTIONNAIRE.md](docs/QUESTIONNAIRE.md) : cartographie complète des sections et conventions de nommage des champs.
- [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md) : invitations, notifications, exports, réception d'emails.
- [docs/SECURITY.md](docs/SECURITY.md) : posture de sécurité actuelle et points à durcir avant exposition publique.

## Limitations importantes connues

- Il n'y a pas de vrai système d'authentification côté frontend. Le dashboard admin est piloté par l'UI et non par une session.
- Les politiques RLS actuelles autorisent des lectures bien plus larges qu'un usage production classique, notamment pour `form_responses` côté anonyme.
- La progression affichée dans la barre de navigation ne repose pas sur le même calcul que `completion_percentage` stocké en base.
- Le `responseId` n'est pas persisté localement : après un refresh du navigateur, une nouvelle soumission peut créer une nouvelle ligne Supabase au lieu de mettre à jour la précédente.
- `ADMIN_EMAIL` reste un fallback backend : pour éviter les surprises, il doit rester cohérent avec l'email configuré dans l'UI admin.

Ces écarts sont documentés plus précisément dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/EMAIL_WORKFLOWS.md](docs/EMAIL_WORKFLOWS.md) et [docs/SECURITY.md](docs/SECURITY.md).

## Scripts npm

- `npm run dev` : développement local Vite
- `npm run build` : build de production
- `npm run preview` : prévisualisation locale du build
- `npm run lint` : lint ESLint
- `npm run typecheck` : vérification TypeScript
