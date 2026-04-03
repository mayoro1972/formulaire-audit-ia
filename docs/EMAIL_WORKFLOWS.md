# Emails, invitations et flux sortants

## Vue d'ensemble

Le dépôt utilise aujourd'hui deux fournisseurs email distincts :

- **Resend** pour les invitations, les exports du formulaire, les notifications admin et la réception d'emails
- **EmailJS** comme solution de fallback possible pour les invitations

Cette séparation existe dans le code actuel ; elle n'est pas seulement documentaire.

## Flux actifs

### 1. Invitations

Point d'entrée frontend : `src/pages/SendInvitations.tsx`

Flux :

1. insertion des invitations dans `form_invitations`
2. stockage d'un `response_email` de retour, d'un `response_cc` optionnel et éventuellement d'un `draft_form_data`
3. appel de l'Edge Function `send-invitation-email`
4. envoi via Resend si disponible, sinon fallback EmailJS
5. traçage de l'envoi sur la ligne d'invitation

Secrets requis :

- `RESEND_API_KEY` recommandé
- `FROM_EMAIL` recommandé
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` optionnels pour les invitations
- `EMAILJS_RETURN_TEMPLATE_ID` recommande pour le retour formulaire
- `EMAILJS_RETURN_SERVICE_ID` optionnel si vous voulez isoler le service de retour

### 2. Notification admin

Point d'entrée frontend : `src/sections/Section10_Envoi.tsx`

Flux :

1. l'utilisateur enregistre ou envoie son formulaire
2. le frontend appelle `notify-admin`
3. `notify-admin` lit `admin_settings.admin_email` si disponible
4. fallback éventuel sur `ADMIN_EMAIL`
5. respect de `notification_enabled` si la ligne `admin_settings` existe

Secrets requis :

- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` recommandé pour lire `admin_settings`
- `ADMIN_EMAIL` en fallback
- `FROM_EMAIL` recommandé

### 3. Envoi du formulaire complété

Point d'entrée frontend : `src/sections/Section10_Envoi.tsx`

Flux :

1. `submitToSupabase()` enregistre les réponses
2. le frontend appelle `send-form-email`
3. `send-form-email` génère une pièce jointe
4. l'email est envoyé via Resend

Formats générés :

- CSV
- PDF
- Word

### 4. Réception d'emails entrants

Point d'entrée : webhook externe Resend vers `receive-email`

Flux :

1. Resend envoie un événement `email.received`
2. `receive-email` enregistre l'événement dans `received_emails`
3. si `GMAIL_FORWARD_ADDRESS` est renseigné, la fonction appelle `forward-to-gmail`
4. `forward-to-gmail` réexpédie un résumé de l'email vers Gmail via Resend

## Fonctions et statut

| Fonction | Fournisseur | Statut |
| --- | --- | --- |
| `send-invitation-email` | Resend + fallback EmailJS | flux actif |
| `send-form-email` | Resend | flux actif |
| `notify-admin` | Resend | flux actif |
| `receive-email` | Resend | flux webhook actif si configuré |
| `forward-to-gmail` | Resend | sous-flux optionnel |
| `send-emailjs-invitation` | EmailJS | ancienne implémentation non branchée |

## Qui reçoit quoi

### Invitations

Le destinataire est toujours `invitee_email` provenant de `form_invitations`.

Le formulaire complété, lui, est renvoyé vers `response_email` et éventuellement `response_cc`.

### Export du formulaire

Le destinataire est déterminé comme suit :

- mode invitation : email récupéré depuis `form_invitations.response_email`
- mode standard : `formData.email_dest`, avec fallback `formData.c_email`

### Copie email

Le comportement actuel est le suivant :

- mode standard : `formData.email_cc` est utilisé
- mode invitation : `response_cc` est utilisé en priorité, puis `admin_settings.admin_email` peut servir de secours

## Génération des pièces jointes

`send-form-email` génère trois formats :

### CSV

- restitution tabulaire des principales sections
- format le plus complet côté export structuré

### PDF

- synthèse courte des sections majeures
- pas une reprise exhaustive de tous les champs

### Word

- synthèse structurée via `docx`
- plus courte que le JSON stocké en base

Le JSON complet n'est pas envoyé par email. Il est exportable depuis le navigateur via le bouton "Exporter en JSON".

## Configuration EmailJS

Le flux actif d'invitation ne lit pas de variables frontend `VITE_EMAILJS_*`.

Le code réel utilise :

- `RESEND_API_KEY` et `FROM_EMAIL` en priorité
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` en fallback invitation
- `EMAILJS_RETURN_TEMPLATE_ID` pour le template `Audit Return Email`

Ces valeurs doivent être configurées comme secrets Supabase pour l'Edge Function `send-invitation-email`.

## Configuration Resend

Secrets minimum :

- `RESEND_API_KEY`
- `FROM_EMAIL`

Selon les flux activés :

- `ADMIN_EMAIL` en fallback pour `notify-admin`
- `GMAIL_FORWARD_ADDRESS` pour le transfert Gmail

## Écarts et incohérences à connaître

### Deux implémentations d'invitation coexistent

Le repo contient :

- `send-invitation-email` : utilisée
- `send-emailjs-invitation` : ancienne implémentation non branchée sur le frontend

La doc doit donc toujours préciser quel flux est réellement actif.

### Source d'email admin non unifiée

- `notify-admin` lit `admin_settings.admin_email` puis retombe sur `ADMIN_EMAIL`
- `send-form-email` lit `admin_settings.admin_email` en secours de routage sur invitation

La source primaire est maintenant l'écran de réglage admin, avec secret backend en filet de sécurité.

### `response_id` de notification

Le frontend envoie désormais le `response_id` réel à `notify-admin`.

### Horodatage `email_sent_at`

Après envoi du formulaire, `send-form-email` marque `email_sent_at` sur le `responseId` explicite quand il est fourni. Le fallback par email n'est utilisé qu'en dernier recours.

## Recommandation de rationalisation

Si vous souhaitez simplifier l'exploitation, le meilleur chantier documentaire et technique est :

1. choisir un seul fournisseur pour tous les emails sortants
2. réduire à terme le fallback `ADMIN_EMAIL` si vous voulez une seule source de vérité
3. garder la logique `response_email` comme point d'entrée unique du retour de formulaire

## Références

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SETUP.md](SETUP.md)
- [SECURITY.md](SECURITY.md)
