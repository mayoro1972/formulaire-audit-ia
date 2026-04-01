# Architecture

## Vue d'ensemble

Le dépôt implémente une application monopage React sans routeur. Le point d'entrée `src/main.tsx` choisit simplement entre :

- `App` si aucun paramètre `invite` n'est présent
- `InvitationForm` si l'URL contient `?invite=<token>`

L'ensemble de la saisie repose sur `FormContext`, qui centralise :

- l'état complet du questionnaire
- la sauvegarde locale dans `localStorage`
- la section active de navigation
- l'enregistrement dans Supabase

## Couches principales

### Frontend

- `src/main.tsx` : choisit le mode standard ou le mode invitation.
- `src/App.tsx` : assemble la navbar, la sidebar, les sections du questionnaire et les pages admin/invitations.
- `src/context/FormContext.tsx` : source de vérité du formulaire.
- `src/sections/*.tsx` : sections métier A à I plus écran d'envoi.
- `src/pages/AdminDashboard.tsx` : liste, filtre et exporte les réponses.
- `src/pages/SendInvitations.tsx` : crée les invitations et déclenche les emails.
- `src/pages/InvitationForm.tsx` : valide le jeton, préremplit l'identité et verrouille l'accès aux boutons admin.

### Backend Supabase

- `supabase/migrations/*.sql` : tables, indexes, politiques RLS.
- `supabase/functions/send-invitation-email` : envoi d'invitations via Resend avec fallback EmailJS.
- `supabase/functions/send-emailjs-invitation` : ancienne fonction dédiée EmailJS, encore présente dans le dépôt.
- `supabase/functions/send-form-email` : envoi d'un export du formulaire via Resend.
- `supabase/functions/notify-admin` : notification simple à l'administrateur via Resend.
- `supabase/functions/receive-email` : webhook Resend de réception d'emails.
- `supabase/functions/forward-to-gmail` : transfert de l'email reçu vers Gmail.

## Flux applicatifs

### 1. Saisie standard

1. L'utilisateur ouvre l'application.
2. `FormProvider` charge éventuellement un brouillon depuis `localStorage`.
3. Chaque modification appelle `updateField`.
4. Un autosave local est déclenché 2 secondes après la dernière modification.
5. Un autosave de sécurité supplémentaire tourne toutes les 30 secondes.
6. À la soumission, `submitToSupabase()` insère ou met à jour `form_responses`.

### 2. Saisie via invitation

1. `InvitationForm` lit `?invite=...`.
2. Le jeton est recherché dans `form_invitations`.
3. Le code vérifie :
   - existence du jeton
   - statut non `completed`
   - date d'expiration non dépassée
4. Si l'invitation contient `draft_form_data`, ce brouillon est injecté dans le formulaire.
5. Le nom et l'email du destinataire alimentent `c_nom` et `c_email`.
6. Lors de la première soumission, `form_responses.invitation_token` est renseigné et l'invitation passe à `completed`.

### 3. Envoi d'une invitation

1. `SendInvitations.tsx` construit une liste d'invitations avec jeton unique.
2. Chaque invitation embarque un `response_email` de retour, un `response_cc` optionnel et peut embarquer `draft_form_data`.
3. Les lignes sont insérées dans `form_invitations`.
4. Pour chaque ligne créée, le frontend appelle l'Edge Function `send-invitation-email`.
5. Le frontend trace ensuite l'envoi sur l'invitation.

### 4. Envoi du formulaire par email

1. `Section10_Envoi.tsx` appelle d'abord `submitToSupabase()`.
2. Le frontend appelle ensuite `notify-admin`.
3. Si l'utilisateur clique sur "Enregistrer + Envoyer par email", le frontend appelle aussi `send-form-email`.
4. `send-form-email` génère une pièce jointe CSV, PDF ou Word puis envoie l'email via Resend.

## Persistance locale

Deux clés `localStorage` sont utilisées :

- `audit_ia_gerard_v2` : snapshot complet du formulaire
- `audit_session_id` : identifiant de session généré côté navigateur

Important :

- le brouillon du formulaire est persisté
- l'identifiant `responseId` Supabase, lui, ne l'est pas

Conséquence : après rechargement du navigateur, une nouvelle soumission peut créer une nouvelle ligne `form_responses` au lieu de reprendre la précédente, même si le même brouillon est restauré.

## Modèle de données

### `form_responses`

Table principale de stockage des réponses.

Colonnes notables :

- `user_name`, `user_email`, `user_position`, `user_entity`
- `form_data` en JSONB avec l'intégralité du questionnaire
- `is_completed`
- `completion_percentage`
- `session_id`
- `invitation_token`
- `email_sent_at`

### `form_invitations`

Stocke les invitations nominatives.

Colonnes notables :

- `invitee_name`, `invitee_email`
- `invite_token`
- `sent_at`
- `expires_at`
- `status` (`pending`, `completed`, `expired`)
- `response_id`
- `response_email`, `response_cc`
- `draft_form_data`
- `email_sent_at`

### `admin_settings`

Stocke un email administrateur et un flag d'activation. L'interface admin lit et met à jour cette table.

### `received_emails`

Archive les événements `email.received` de Resend et l'état de leur transfert éventuel vers Gmail.

## Calculs de progression

Il existe deux logiques distinctes dans le code :

### Progression UI

Utilisée par la navbar, la page d'accueil et la section d'envoi.

- Basée sur quelques champs sentinelles par section
- Pondérée par section
- Approche orientée UX

### `completion_percentage` en base

Calculée dans `submitToSupabase()`.

- Basée sur presque tous les champs de `initialFormData`
- Ignore seulement `ts` et `libreRowCount`
- Marque `is_completed` à `true` à partir de 80 %

Ces deux pourcentages peuvent diverger. Le dashboard admin s'appuie sur la valeur stockée en base, pas sur la barre affichée à l'utilisateur.

## Fonctions Edge et usage réel

| Fonction | Rôle | Appelée par le frontend actuel |
| --- | --- | --- |
| `send-invitation-email` | Envoi des invitations via Resend avec fallback EmailJS | Oui |
| `send-emailjs-invitation` | Ancienne implémentation EmailJS | Non |
| `send-form-email` | Envoi de l'export du formulaire via Resend | Oui |
| `notify-admin` | Notification simple à l'administrateur | Oui |
| `receive-email` | Réception des emails entrants Resend | Non, webhook externe |
| `forward-to-gmail` | Relais des emails reçus vers Gmail | Non, appelée par `receive-email` |

## Points d'attention de conception

### Admin côté client

Le passage en mode admin se fait par simple état React (`showAdmin`). Il n'existe pas de route protégée ni d'authentification frontend associée.

### Double source d'email admin

La source primaire est désormais `admin_settings.admin_email`, avec un fallback secret :

- `admin_settings.admin_email` en base, utilisé par l'UI, `notify-admin` et `send-form-email`
- `ADMIN_EMAIL` dans les secrets Supabase, utilisé comme filet de sécurité

Le réglage saisi dans l'interface pilote donc désormais le flux principal, mais le fallback doit rester cohérent si vous l'utilisez encore.

### Historisation `email_sent_at`

`send-form-email` privilégie désormais le `response_id` reçu du frontend, puis retombe sur une recherche par `invitation_token` ou `user_email` si nécessaire.

### Notification admin incomplète

Le payload envoyé à `notify-admin` contient désormais le `response_id` réellement créé ou mis à jour.

## Lecture recommandée

- [SETUP.md](SETUP.md)
- [QUESTIONNAIRE.md](QUESTIONNAIRE.md)
- [EMAIL_WORKFLOWS.md](EMAIL_WORKFLOWS.md)
- [SECURITY.md](SECURITY.md)
