# Configuration EmailJS - Guide Rapide

## Étape 1 : Créer un compte EmailJS (2 minutes)

1. Allez sur https://emailjs.com/
2. Cliquez sur "Sign Up" (ou "Get Started")
3. Créez un compte gratuit (200 emails/mois inclus)

## Étape 2 : Configurer un service email (2 minutes)

1. Une fois connecté, cliquez sur **"Email Services"** dans le menu
2. Cliquez sur **"Add New Service"**
3. Choisissez **"Gmail"** (ou votre fournisseur email préféré)
4. Cliquez sur **"Connect Account"** et autorisez l'accès
5. **Copiez le Service ID** affiché (exemple: `service_abc123`)

## Étape 3 : Créer un template email (3 minutes)

1. Cliquez sur **"Email Templates"** dans le menu
2. Cliquez sur **"Create New Template"**
3. Configurez le template comme suit :

### Champs du template :

**Template Name:** `invitation_audit_ia`

**Subject:**
```
Formulaire d'Audit IA - À compléter
```

**Content (corps de l'email):**
```
Bonjour {{to_name}},

Vous êtes invité à compléter le formulaire d'audit IA.

Cliquez sur ce lien pour commencer :
{{invite_link}}

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

**From Name:** Votre nom ou celui de votre entreprise

**From Email:** Votre email (celui connecté au service)

**Reply To:** Votre email

4. Cliquez sur **"Save"**
5. **Copiez le Template ID** affiché (exemple: `template_xyz789`)

## Étape 4 : Obtenir votre clé publique (1 minute)

1. Cliquez sur votre nom en haut à droite
2. Allez dans **"Account"**
3. Dans l'onglet **"General"**
4. **Copiez votre Public Key** (exemple: `user_abc123def456`)

## Étape 5 : Configurer votre projet (1 minute)

1. Ouvrez le fichier `.env` à la racine de votre projet
2. Ajoutez ces 3 lignes avec VOS valeurs :

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abc123def456
```

3. Remplacez les valeurs par celles que vous avez copiées aux étapes précédentes

## Étape 6 : Tester (1 minute)

1. Redémarrez votre serveur de développement (arrêtez et relancez `npm run dev`)
2. Allez dans "Envoyer des invitations"
3. Ajoutez un nom et un email
4. Cliquez sur "Envoyer"
5. Vérifiez que l'email arrive dans la boîte de réception

## Résumé des variables à copier

Vous devez copier 3 valeurs dans EmailJS et les mettre dans votre `.env` :

| Variable | Où la trouver | Exemple |
|----------|---------------|---------|
| `VITE_EMAILJS_SERVICE_ID` | Email Services → Votre service | `service_abc123` |
| `VITE_EMAILJS_TEMPLATE_ID` | Email Templates → Votre template | `template_xyz789` |
| `VITE_EMAILJS_PUBLIC_KEY` | Account → General → Public Key | `user_abc123def456` |

## Vérification rapide

Votre fichier `.env` devrait ressembler à ceci :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abc123def456
```

## Dépannage

### L'email n'arrive pas

1. Vérifiez les valeurs dans `.env`
2. Vérifiez que vous avez redémarré le serveur après avoir modifié `.env`
3. Vérifiez la console du navigateur pour les erreurs
4. Vérifiez les spams/courrier indésirable
5. Dans EmailJS, vérifiez l'onglet "Auto Reply" pour voir si l'email a été envoyé

### Erreur "Public Key"

Assurez-vous que votre Public Key commence bien par quelque chose comme `user_` ou est une longue chaîne alphanumérique.

### Limite atteinte

Le plan gratuit EmailJS limite à 200 emails/mois. Si vous dépassez cette limite, vous devrez upgrader ou utiliser Resend avec un domaine vérifié.

## Prochaines étapes

Une fois EmailJS configuré et testé, pour une solution production plus professionnelle, consultez `RESEND_SETUP_GUIDE.md` pour configurer l'envoi d'emails avec votre propre domaine.
