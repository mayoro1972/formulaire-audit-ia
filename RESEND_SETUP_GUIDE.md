# Guide de Configuration Resend pour l'Application Audit IA

## Vue d'ensemble
Ce document explique comment configurer Resend pour permettre l'envoi d'emails depuis l'application Audit IA d'Attijari Wafa Bank.

---

## PARTIE 1: Configuration Resend (À faire par le chef de projet)

### Étape 1: Créer un compte Resend

1. Allez sur https://resend.com/signup
2. Inscrivez-vous avec votre email professionnel
3. Vérifiez votre email en cliquant sur le lien reçu

### Étape 2: Ajouter votre domaine

1. Connectez-vous à https://resend.com/login
2. Dans le menu de gauche, cliquez sur **Domains**
3. Cliquez sur **Add Domain**
4. Entrez votre domaine (exemple: `attijariwafabank.com` ou un sous-domaine comme `audit.attijariwafabank.com`)
5. Cliquez sur **Add Domain**

### Étape 3: Récupérer les enregistrements DNS

Une fois le domaine ajouté, Resend affichera les enregistrements DNS à configurer. Vous verrez quelque chose comme:

**Enregistrement de vérification (TXT):**
```
Type: TXT
Name: @ (ou votre domaine)
Value: resend-verify=xxxxxxxxxxxxxxxxxxxxx
```

**Enregistrements DKIM (CNAME):**
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.xxxxxx.resend.com
```

**Enregistrements SPF/DMARC (optionnels mais recommandés):**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

### Étape 4: Transmettre les informations à l'équipe IT

Copiez tous ces enregistrements DNS et envoyez-les à votre équipe IT/Infrastructure en utilisant le **DOCUMENT POUR L'ÉQUIPE IT** ci-dessous.

---

## PARTIE 2: Document pour l'équipe IT

**OBJET: Demande d'ajout d'enregistrements DNS pour le système d'envoi d'emails Audit IA**

Bonjour,

Dans le cadre du projet Audit IA, nous avons besoin de configurer l'envoi d'emails transactionnels via le service Resend.

### Domaine concerné
`[VOTRE_DOMAINE]` (par exemple: attijariwafabank.com ou audit.attijariwafabank.com)

### Enregistrements DNS à ajouter

Veuillez ajouter les enregistrements DNS suivants à notre zone DNS:

#### 1. Enregistrement de vérification du domaine
```
Type: TXT
Nom: @ (ou racine du domaine)
Valeur: [COPIER LA VALEUR DEPUIS RESEND]
TTL: 3600
```

#### 2. Enregistrement DKIM pour la signature des emails
```
Type: CNAME
Nom: resend._domainkey
Valeur: [COPIER LA VALEUR DEPUIS RESEND]
TTL: 3600
```

#### 3. Enregistrement SPF (recommandé)
Si un enregistrement SPF existe déjà, ajoutez `include:_spf.resend.com` avant le mécanisme final.
Si aucun enregistrement SPF n'existe:
```
Type: TXT
Nom: @
Valeur: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### 4. Enregistrement DMARC (recommandé)
```
Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:dmarc-reports@[VOTRE_DOMAINE]
TTL: 3600
```

### Délai de propagation
Une fois les enregistrements ajoutés, merci de me confirmer. La propagation DNS peut prendre de 15 minutes à 48 heures.

### Contact
Pour toute question, vous pouvez me contacter à: [VOTRE_EMAIL]

Cordialement,
[VOTRE_NOM]

---

## PARTIE 3: Vérification et finalisation (Chef de projet)

### Étape 5: Vérifier le domaine

1. Une fois que l'équipe IT confirme l'ajout des enregistrements DNS (attendez 24-48h)
2. Retournez dans Resend > **Domains**
3. Cliquez sur votre domaine
4. Cliquez sur **Verify Domain**
5. Si tout est correct, le statut passera à **Verified** ✓

### Étape 6: Créer une clé API

1. Dans Resend, allez dans **API Keys** (menu de gauche)
2. Cliquez sur **Create API Key**
3. Nom: `Audit IA Production`
4. Permission: **Sending access**
5. Cliquez sur **Add**
6. **IMPORTANT**: Copiez la clé qui commence par `re_...` (elle ne sera affichée qu'une fois)

### Étape 7: Configurer la clé API dans Supabase

1. Ouvrez votre dashboard Supabase
2. Allez dans **Project Settings** > **Edge Functions**
3. Cliquez sur **Manage secrets**
4. Ajoutez un nouveau secret:
   - Nom: `RESEND_API_KEY`
   - Valeur: [COLLER LA CLÉ API COPIÉE]
5. Cliquez sur **Save**

### Étape 8: Mettre à jour l'adresse d'expédition

Une fois votre domaine vérifié, informez le développeur du domaine vérifié pour qu'il puisse mettre à jour l'adresse d'expédition dans le code.

Par exemple, si votre domaine vérifié est `attijariwafabank.com`, l'adresse sera:
`Audit IA <noreply@attijariwafabank.com>`

---

## PARTIE 4: Test

### Étape 9: Tester l'envoi d'email

1. Allez sur votre application Audit IA
2. Remplissez le formulaire
3. Dans la section "Envoi", choisissez le format (PDF, Word, ou CSV)
4. Cliquez sur **Envoyer par email**
5. Vérifiez votre boîte email

**Note**: Le premier email peut prendre quelques minutes. Les suivants seront instantanés.

### En cas de problème

Si l'email n'arrive pas:
1. Vérifiez vos **spams/courrier indésirable**
2. Vérifiez que le domaine est bien **Verified** dans Resend
3. Vérifiez les logs dans Resend > **Logs** pour voir les détails de l'envoi
4. Contactez le support Resend si nécessaire: support@resend.com

---

---

## PARTIE 5: Configuration de la réception d'emails (Option B - Transfert Gmail)

### Vue d'ensemble
Cette section explique comment configurer la réception d'emails pour que tous les emails envoyés à votre domaine Resend soient automatiquement transférés vers votre adresse Gmail.

### Étape 10: Configurer votre adresse Gmail de transfert

1. Ouvrez votre dashboard Supabase
2. Allez dans **Project Settings** > **Edge Functions**
3. Cliquez sur **Manage secrets**
4. Ajoutez un nouveau secret:
   - Nom: `GMAIL_FORWARD_ADDRESS`
   - Valeur: `votre-email@gmail.com` (remplacez par votre adresse Gmail réelle)
5. Cliquez sur **Save**

### Étape 11: Configurer le webhook Resend

1. Connectez-vous à https://resend.com/login
2. Dans le menu de gauche, cliquez sur **Webhooks**
3. Cliquez sur **Add Webhook**
4. Configurez le webhook:
   - **URL**: `https://[VOTRE-PROJECT-ID].supabase.co/functions/v1/receive-email`
     - Remplacez `[VOTRE-PROJECT-ID]` par l'ID de votre projet Supabase
     - Vous pouvez trouver cette URL dans Supabase > **Project Settings** > **API**
   - **Events**: Cochez uniquement `email.received`
   - **Description**: `Forward emails to Gmail`
5. Cliquez sur **Add Webhook**

### Étape 12: Obtenir votre adresse de réception Resend

Vous avez deux options pour recevoir des emails:

#### Option A: Utiliser le domaine Resend gratuit (recommandé pour tester)

1. Dans Resend, allez sur **Emails**
2. Cliquez sur l'onglet **Receiving**
3. Cliquez sur les trois points et sélectionnez **Receiving address**
4. Vous verrez votre domaine: `anything@[votre-id].resend.app`
5. Tous les emails envoyés à `n'importe-quoi@[votre-id].resend.app` seront transférés à votre Gmail

#### Option B: Utiliser votre domaine personnalisé (après vérification DNS)

Si vous avez vérifié votre propre domaine (ex: `audit.attijariwafabank.com`):
- Tous les emails envoyés à `n'importe-quoi@audit.attijariwafabank.com` seront transférés à votre Gmail
- **IMPORTANT**: Cela signifie que TOUS les emails vers ce domaine seront interceptés par Resend

### Étape 13: Tester la réception d'emails

1. Envoyez un email de test depuis votre email personnel vers:
   - `test@[votre-id].resend.app` (si vous utilisez le domaine Resend)
   - `test@audit.attijariwafabank.com` (si vous utilisez votre domaine)

2. Vérifiez votre Gmail sous quelques secondes

3. Vous devriez recevoir un email avec:
   - Sujet: `[Transféré] [sujet original]`
   - Contenu: Détails de l'email reçu avec l'adresse de l'expéditeur

### Comment ça marche

Voici le flux automatique:

1. Un utilisateur envoie un email à `contact@[votre-domaine]`
2. Resend reçoit l'email et déclenche le webhook
3. Le webhook sauvegarde l'email dans votre base de données Supabase
4. Le webhook transfère automatiquement l'email vers votre Gmail
5. Vous recevez une notification dans votre Gmail avec tous les détails

### Voir les emails reçus dans la base de données

Tous les emails reçus sont sauvegardés dans la table `received_emails` avec:
- Adresse de l'expéditeur
- Sujet
- Date de réception
- Confirmation de transfert vers Gmail
- Données complètes du webhook

### En cas de problème

Si vous ne recevez pas les emails transférés:

1. Vérifiez vos **spams** dans Gmail
2. Vérifiez que le webhook est actif dans Resend > **Webhooks**
3. Vérifiez que `GMAIL_FORWARD_ADDRESS` est correctement configuré dans Supabase
4. Consultez les logs dans Supabase > **Edge Functions** > **receive-email** pour voir les erreurs

---

## Résumé des étapes

### Configuration de base (envoi)
- [ ] Créer un compte Resend
- [ ] Ajouter le domaine dans Resend
- [ ] Récupérer les enregistrements DNS
- [ ] Envoyer la demande à l'équipe IT
- [ ] Attendre la confirmation de l'équipe IT (24-48h)
- [ ] Vérifier le domaine dans Resend
- [ ] Créer la clé API
- [ ] Configurer la clé API dans Supabase
- [ ] Informer le développeur du domaine vérifié
- [ ] Tester l'envoi d'email

### Configuration de la réception (transfert Gmail)
- [ ] Configurer l'adresse Gmail dans Supabase (`GMAIL_FORWARD_ADDRESS`)
- [ ] Créer le webhook dans Resend
- [ ] Noter votre adresse de réception Resend
- [ ] Tester la réception et le transfert
- [ ] Communiquer l'adresse de réception aux utilisateurs

---

## Support

**Documentation Resend**: https://resend.com/docs
**Support Resend**: support@resend.com
**Status Resend**: https://status.resend.com

---

*Document créé le 30 mars 2026 pour le projet Audit IA - Attijari Wafa Bank*
