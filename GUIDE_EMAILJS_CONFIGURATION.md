# 📧 Guide de Configuration EmailJS - Étape par Étape

## 🎯 Objectif
Configurer EmailJS pour envoyer des invitations au formulaire d'audit IA.

---

## ✅ Étape 1 : Connexion à EmailJS

1. Allez sur **https://dashboard.emailjs.com/sign-in**
2. Connectez-vous avec votre compte

---

## ✅ Étape 2 : Configurer le Service Email

### 2.1 Aller aux services
- Dans le menu de gauche, cliquez sur **"Email Services"**

### 2.2 Ajouter un service Gmail
- Cliquez sur le bouton **"Add New Service"**
- Sélectionnez **"Gmail"**
- Cliquez sur **"Connect Account"**
- Autorisez EmailJS à accéder à votre compte Gmail
- Cliquez sur **"Create Service"**

### 2.3 Copier le Service ID
- ✅ Vous verrez un **Service ID** (exemple: `service_abc1234`)
- **COPIEZ ce Service ID** - vous en aurez besoin plus tard

---

## ✅ Étape 3 : Créer le Template Email

### 3.1 Aller aux templates
- Dans le menu de gauche, cliquez sur **"Email Templates"**
- Cliquez sur **"Create New Template"**

### 3.2 Configurer les paramètres du template

#### Settings (Paramètres)
- **Template Name** : `invitation_audit_ia`

#### To/From Section
Remplissez les champs suivants :

| Champ | Valeur à entrer |
|-------|----------------|
| **To Email** | `{{to_email}}` |
| **To Name** | `{{to_name}}` |
| **From Name** | Votre nom ou "Audit IA" |
| **Subject** | `Formulaire d'Audit IA - À compléter` |
| **Reply To** | Votre email professionnel |

⚠️ **IMPORTANT** : Les doubles accolades `{{to_email}}` et `{{to_name}}` sont des variables, copiez-les exactement comme ça !

#### Message Content
Copiez-collez ce contenu dans le champ **"Content"** :

```
Bonjour {{to_name}},

Vous êtes invité(e) à compléter le formulaire d'audit IA.

🔗 Cliquez sur ce lien pour commencer :
{{invite_link}}

📋 À propos du formulaire :
- Durée estimée : 30-45 minutes
- Sauvegarde automatique toutes les 30 secondes
- Peut être rempli en plusieurs fois
- Comporte 9 sections + récapitulatif

📝 Instructions :
1. Cliquez sur le lien ci-dessus
2. Remplissez les sections dans l'ordre ou selon vos préférences
3. Vos réponses sont automatiquement sauvegardées
4. Une fois terminé, allez à la section "Envoi & récapitulatif"
5. Cliquez sur "Envoyer le formulaire" pour transmettre vos réponses

Si vous avez des questions, n'hésitez pas à répondre à cet email.

Cordialement
```

### 3.3 Sauvegarder le template
- Cliquez sur **"Save"** en haut à droite
- ✅ Vous verrez un **Template ID** (exemple: `template_xyz7890`)
- **COPIEZ ce Template ID** - vous en aurez besoin

---

## ✅ Étape 4 : Récupérer votre Public Key

### 4.1 Aller aux paramètres du compte
- Cliquez sur votre **nom/email en haut à droite**
- Cliquez sur **"Account"**
- Allez à l'onglet **"General"**

### 4.2 Copier la Public Key
- Vous verrez **"Public Key"**
- ✅ **COPIEZ cette clé** (exemple: `user_abcDEF123xyz`)

---

## ✅ Étape 5 : Configurer l'Application

### 5.1 Ouvrir le fichier .env
Dans votre projet, ouvrez le fichier `.env`

### 5.2 Ajouter les 3 variables
Ajoutez ces 3 lignes (remplacez par VOS valeurs copiées) :

```env
VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz7890
VITE_EMAILJS_PUBLIC_KEY=user_abcDEF123xyz
```

⚠️ **Remplacez** `service_abc1234`, `template_xyz7890`, et `user_abcDEF123xyz` par vos vraies valeurs !

### 5.3 Redémarrer l'application
Si l'application tourne, redémarrez-la pour charger les nouvelles variables.

---

## ✅ Étape 6 : Tester

1. Allez sur la page "Envoi d'invitations" de votre application
2. Ajoutez un email de test (le vôtre)
3. Cliquez sur "Envoyer les invitations"
4. Vérifiez votre boîte mail 📬

---

## 🆘 En cas de problème

### Erreur "Service ID not found"
- Vérifiez que le Service ID est correct dans le `.env`
- Assurez-vous d'avoir bien activé le service Gmail dans EmailJS

### Erreur "Template not found"
- Vérifiez que le Template ID est correct dans le `.env`
- Assurez-vous d'avoir sauvegardé le template dans EmailJS

### Email non reçu
- Vérifiez vos spams
- Vérifiez que l'email Gmail autorisé dans EmailJS est actif
- Consultez l'onglet "Logs" dans EmailJS Dashboard pour voir les erreurs

### Variables non remplacées dans l'email
- Vérifiez que vous avez bien utilisé les doubles accolades : `{{to_name}}`, `{{to_email}}`, `{{invite_link}}`
- Les variables sont sensibles à la casse (majuscules/minuscules)

---

## 📝 Récapitulatif des 3 valeurs à copier

| Valeur | Où la trouver | Variable .env |
|--------|---------------|---------------|
| **Service ID** | Email Services → Votre service Gmail | `VITE_EMAILJS_SERVICE_ID` |
| **Template ID** | Email Templates → Votre template créé | `VITE_EMAILJS_TEMPLATE_ID` |
| **Public Key** | Account → General → Public Key | `VITE_EMAILJS_PUBLIC_KEY` |

---

## 🎉 C'est terminé !

Une fois configuré, vous pourrez :
- ✅ Envoyer des invitations depuis l'interface admin
- ✅ Suivre l'état des invitations (envoyé/répondu)
- ✅ Renvoyer des invitations si nécessaire
- ✅ Les destinataires recevront un lien unique pour remplir leur formulaire
