# Sécurité et posture actuelle

## Résumé

Le dépôt fonctionne pour une démonstration ou un usage contrôlé, mais il n'est pas durci pour une exposition publique telle quelle.

Les points les plus importants sont :

- pas d'authentification réelle pour le mode admin
- politiques RLS très permissives
- logique admin pilotée côté client
- fallback backend encore présent pour l'email administrateur

## Points de risque observés

### 1. Dashboard admin non protégé

`src/App.tsx` ouvre `AdminDashboard` sur simple clic d'un bouton flottant. Il n'y a pas de login, pas de contrôle d'accès frontend, pas de séparation de routes.

Conséquence :

- toute personne qui a accès à l'application standard peut tenter d'ouvrir les écrans admin

### 2. Lecture anonyme de `form_responses`

La migration `20260330180755_fix_anon_select_policy.sql` crée la politique :

- `Anonymous users can view form responses`

Conséquence :

- avec la clé `anon`, les réponses peuvent être lues côté client tant qu'aucune autre contrainte n'est ajoutée

### 3. Lecture et modification très ouvertes d'autres tables

Les politiques actuelles autorisent largement :

- lecture de `form_invitations`
- mise à jour de `form_invitations`
- lecture, insertion et mise à jour de `admin_settings`

Conséquence :

- la séparation entre usage répondant et usage administrateur n'est pas réellement garantie par la base

### 4. Invocation d'Edge Functions sensibles avec la clé anonyme

Le frontend appelle :

- `notify-admin`
- `send-form-email`
- `send-invitation-email`

avec `VITE_SUPABASE_ANON_KEY`.

Cela n'est pas forcément interdit en soi, mais cela suppose :

- des validations backend strictes
- des garde-fous contre les abus
- une politique claire de limitation et d'authentification

Or le projet ne met pas encore en place ces protections de manière robuste.

### 5. Configuration admin à surveiller

La source primaire est désormais `admin_settings.admin_email`, mais un fallback secret existe encore :

- table `admin_settings.admin_email`
- secret `ADMIN_EMAIL`

Conséquence :

- il faut garder les valeurs cohérentes si vous utilisez encore le fallback backend

### 6. Edge Functions toujours invoquées sans authentification forte

Le `response_id` réel est bien transmis et `send-form-email` met à jour `email_sent_at` de façon plus fiable. Le risque principal restant est donc l'absence de garde-fou d'accès, pas la traçabilité.

## Ce que je recommande avant production

### Priorité 1

- ajouter une authentification réelle pour les écrans admin
- réserver les lectures admin aux utilisateurs authentifiés
- supprimer les politiques RLS anonymes trop larges

### Priorité 2

- protéger les Edge Functions sensibles par une logique d'authentification explicite
- journaliser les appels critiques
- ajouter du rate limiting côté passerelle ou backend

### Priorité 3

- unifier la configuration de l'email administrateur
- persister `responseId` côté client ou revoir la stratégie d'upsert
- passer un `response_id` réel à `notify-admin`

## Check-list minimale

- `form_responses`: plus de lecture anonyme globale
- `form_invitations`: lecture limitée au jeton concerné ou au service backend
- `admin_settings`: accès réservé à un rôle admin authentifié
- `AdminDashboard`: derrière authentification
- `SendInvitations`: derrière authentification
- Edge Functions: validation du contexte d'appel

## Ce qui est déjà bien

- les secrets de fournisseurs email restent côté Edge Functions
- les exports email sont générés côté backend
- les invitations ont un jeton unique et une date d'expiration

## Références

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SETUP.md](SETUP.md)
- [EMAIL_WORKFLOWS.md](EMAIL_WORKFLOWS.md)
