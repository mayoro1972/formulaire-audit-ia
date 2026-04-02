# Configuration du Template EmailJS pour les Invitations

## Problème identifié

Les emails d'invitation échouent car le template EmailJS n'est pas correctement configuré pour recevoir la variable `{{message}}`.

## Solution : Configurer le template EmailJS

### 1. Connexion à EmailJS

1. Connectez-vous sur [https://dashboard.emailjs.com](https://dashboard.emailjs.com)
2. Utilisez votre compte existant avec :
   - Service ID: `service_37pus9z`
   - Template ID: `template_sg8b9kc`
   - Public Key: `rTRq0yRaxs7pdgvsw`

### 2. Modifier le template

1. Allez dans **Email Templates**
2. Sélectionnez le template `template_sg8b9kc`
3. Modifiez le contenu pour inclure ces variables :

```
Bonjour {{to_name}},

Vous êtes invité à compléter le formulaire d'audit IA. Veuillez cliquer sur le lien ci-dessous pour commencer :

{{invite_link}}

{{message}}

Le formulaire :
- Se sauvegarde automatiquement toutes les 30 secondes
- Peut être rempli en plusieurs fois
- Prend environ 30-45 minutes à compléter
- Comporte 9 sections principales + récapitulatif

Instructions :
1. Cliquez sur le lien ci-dessus
2. Remplissez les sections dans l'ordre ou selon vos préférences
3. Vos réponses sont automatiquement sauvegardées
4. Une fois terminé, allez à la section "Envoi & récapitulatif"
5. Cliquez sur "Envoyer" pour transmettre vos réponses

Cordialement
```

### 3. Variables du template

Le template doit accepter ces variables (template params) :

- `{{to_name}}` - Nom du destinataire
- `{{to_email}}` - Email du destinataire (utilisé dans le champ "To")
- `{{invite_link}}` - Lien d'invitation unique
- `{{message}}` - Message personnalisé (peut être vide)

### 4. Configuration du destinataire

Dans les paramètres du template EmailJS :

- **To Email** : `{{to_email}}`
- **From Name** : `Audit IA` (ou votre nom préféré)
- **Subject** : `Formulaire d'Audit IA - À compléter`

### 5. Test du template

1. Dans EmailJS, cliquez sur **Test it**
2. Utilisez ces valeurs de test :
   ```json
   {
     "to_name": "Test User",
     "to_email": "votre-email@example.com",
     "invite_link": "https://example.com/invite/test123",
     "message": "Ceci est un message personnalisé de test."
   }
   ```
3. Vérifiez que l'email est bien reçu avec toutes les variables

## Alternative : Utiliser Resend (Recommandé)

Si vous continuez à avoir des problèmes avec EmailJS, configurez plutôt Resend qui est plus fiable :

### 1. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine (ou utilisez le domaine de test `onboarding@resend.dev`)

### 2. Obtenir la clé API

1. Dans le dashboard Resend, allez dans **API Keys**
2. Créez une nouvelle clé API
3. Copiez la clé (elle commence par `re_`)

### 3. Configurer les secrets Supabase

Les secrets suivants doivent être configurés dans votre projet Supabase :

```bash
RESEND_API_KEY=re_votre_cle_api
FROM_EMAIL=Audit IA <onboarding@resend.dev>
```

Note : Remplacez `onboarding@resend.dev` par votre propre domaine vérifié si vous en avez un.

## Vérification

Après avoir configuré soit EmailJS soit Resend :

1. Retournez sur la page "Envoyer des invitations"
2. Remplissez les emails pré-configurés :
   - Marc Odia (Marc.odia@cba-ca.com)
   - Samy Camara (Samy.Camara@cba-ca.com)
   - Vincent AGBADOU (Vincent.Agbadou@cba-ca.com)
3. Ajoutez un message personnalisé
4. Cliquez sur "Envoyer 3 invitation(s)"
5. Vérifiez que les emails sont bien envoyés

## Dépannage

### Erreur "Failed to send invitation email"

- Vérifiez que les secrets Supabase sont bien configurés
- Pour EmailJS : vérifiez que le template inclut bien `{{message}}`
- Pour Resend : vérifiez que votre clé API est valide et que le domaine est vérifié

### Emails envoyés mais non reçus

- Vérifiez les dossiers spam/courrier indésirable
- Pour EmailJS : vérifiez les quotas de votre compte (100 emails/mois en gratuit)
- Pour Resend : vérifiez les logs dans le dashboard Resend

### Typo dans les emails

Les emails pré-remplis ont été corrigés :
- ✅ Marc.odia@cba-ca.com (corrigé de Marc.odja)
- ✅ Samy Camara (double espace supprimé)
