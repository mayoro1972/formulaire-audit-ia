# Solution pour envoyer des emails à n'importe qui

## Problème actuel
Resend en mode gratuit/test limite l'envoi d'emails à votre propre adresse email : `marius.ayoro70@gmail.com`

Pour envoyer à n'importe qui, vous avez 3 options :

---

## Option 1 : Vérifier un domaine avec Resend (RECOMMANDÉ - Professionnel)

### Avantages
- Solution professionnelle et fiable
- Emails arrivent dans la boîte de réception (pas les spams)
- Pas de limite d'envoi
- Gratuit jusqu'à 3000 emails/mois

### Étapes
1. **Aller sur Resend** : https://resend.com/domains
2. **Ajouter votre domaine** (ex: `votreentreprise.com`)
3. **Copier les enregistrements DNS** fournis par Resend
4. **Les donner à votre équipe IT** pour qu'ils les ajoutent à votre DNS
5. **Attendre 24-48h** pour la propagation DNS
6. **Vérifier le domaine** dans Resend
7. **Mettre à jour le code** pour utiliser `noreply@votredomaine.com`

📖 **Guide complet déjà disponible** : Voir le fichier `RESEND_SETUP_GUIDE.md` dans votre projet

---

## Option 2 : Utiliser EmailJS (SOLUTION RAPIDE - 5 minutes)

### Avantages
- Configuration en 5 minutes
- Gratuit jusqu'à 200 emails/mois
- Pas besoin de domaine
- Fonctionne immédiatement

### Étapes

#### A. Configuration EmailJS

1. **Créer un compte** : https://emailjs.com/
2. **Ajouter un service email** :
   - Allez dans "Email Services"
   - Cliquez "Add New Service"
   - Choisissez "Gmail" (ou votre fournisseur)
   - Connectez votre compte Gmail
   - Notez le **Service ID** (ex: `service_abc123`)

3. **Créer un template** :
   - Allez dans "Email Templates"
   - Cliquez "Create New Template"
   - Utilisez ce template :

```
Sujet : Formulaire d'Audit IA - À compléter

Bonjour {{invitee_name}},

Vous êtes invité à compléter le formulaire d'audit IA.

Cliquez sur ce lien pour commencer : {{invite_link}}

Le formulaire :
- Se sauvegarde automatiquement
- Peut être rempli en plusieurs fois
- Prend environ 30-45 minutes

Cordialement
```

   - Notez le **Template ID** (ex: `template_xyz789`)

4. **Obtenir votre clé publique** :
   - Allez dans "Account" → "General"
   - Copiez votre **Public Key** (ex: `user_abc123def456`)

#### B. Mettre à jour le code

Le package `@emailjs/browser` est déjà installé dans votre projet.

Modifiez `/src/pages/SendInvitations.tsx` pour utiliser EmailJS au lieu de la fonction Edge :

```typescript
import emailjs from '@emailjs/browser';

// Dans la fonction sendInvitations, remplacez la partie d'envoi par :

const EMAILJS_SERVICE_ID = 'service_abc123'; // Votre Service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789'; // Votre Template ID
const EMAILJS_PUBLIC_KEY = 'user_abc123def456'; // Votre Public Key

for (const invitation of data) {
  const inviteLink = `${baseUrl}/?invite=${invitation.invite_token}`;

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        invitee_name: invitation.invitee_name,
        invitee_email: invitation.invitee_email,
        invite_link: inviteLink,
      },
      EMAILJS_PUBLIC_KEY
    );

    successCount++;
  } catch (emailError) {
    console.error('Error sending email:', emailError);
    failureCount++;
  }
}
```

---

## Option 3 : Continuer avec Resend mais seulement pour votre email

### Utilisez cette option si :
- Vous voulez tester rapidement
- Vous êtes la seule personne qui recevra les invitations pour le moment

### Modification
Changez l'email de destination dans le code pour qu'il envoie toujours à `marius.ayoro70@gmail.com`, puis transmettez manuellement les liens aux destinataires.

---

## Comparaison rapide

| Solution | Temps setup | Limite gratuite | Pour production |
|----------|-------------|-----------------|-----------------|
| Resend + Domaine | 24-48h | 3000/mois | ✅ OUI |
| EmailJS | 5 min | 200/mois | ⚠️ OK pour petit usage |
| Resend sans domaine | 0 min | 1 email (le vôtre) | ❌ NON |

---

## Ma recommandation

**Pour tester maintenant** : Utilisez Option 2 (EmailJS)
**Pour la production** : Utilisez Option 1 (Resend + domaine vérifié)

---

Quelle option voulez-vous que j'implémente ?
