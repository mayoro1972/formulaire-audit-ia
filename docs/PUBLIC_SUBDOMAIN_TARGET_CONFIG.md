# Configuration cible - Sous-domaine public séparé pour le formulaire

Objectif :
- publier le formulaire prospect simple sur une URL publique autonome,
- ne pas rediriger vers `www.transferai.ci`,
- garder un parcours dédié pour les prospects,
- conserver Supabase et les Edge Functions existantes.

## 1. Recommandation cible

Je recommande de publier l'application sur un sous-domaine dédié :

- `https://audit.transferai.ci/`

Pourquoi ce choix :
- le sous-domaine reste cohérent avec la marque TransferAI
- il est distinct du site principal
- il peut héberger ensuite d'autres formulaires ou parcours d'audit
- il évite de dépendre d'un chemin technique du site vitrine

## 2. Architecture recommandée

### Frontend

Projet séparé pour ce dépôt :
- hébergement recommandé : `Cloudflare Pages`
- build output : `dist`
- build command : `npm run build`

### Backend

Le formulaire continue d'utiliser le backend déjà en place :
- `Supabase`
- `save-form-response`
- `send-form-email`
- destination email : `contact@transferai.ci`

### Domaine

DNS recommandé :
- type `CNAME`
- nom `audit`
- cible : sous-domaine fourni par l'hébergeur frontend

Exemple si Cloudflare Pages est utilisé :
- projet Pages : `transferai-audit-form`
- URL technique initiale : `https://transferai-audit-form.pages.dev`
- domaine custom relié ensuite : `https://audit.transferai.ci`

## 3. Configuration frontend cible

### Variables d'environnement

Variables minimales :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_BASE_PATH=/
VITE_PUBLIC_PROSPECT_FORM_URL=https://audit.transferai.ci/
```

Rôle des variables :
- `VITE_SUPABASE_URL` : URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY` : clé publique frontend
- `VITE_APP_BASE_PATH=/` : indispensable pour un déploiement sur sous-domaine racine
- `VITE_PUBLIC_PROSPECT_FORM_URL` : URL publique à injecter dans les lettres et supports

## 4. Ajustement déjà préparé dans le repo

Le dépôt supporte maintenant deux modes de publication :

1. `GitHub Pages`
   - base build : `/formulaire-audit-ia/`

2. `Sous-domaine séparé`
   - base build : `/`
   - pilotée par `VITE_APP_BASE_PATH=/`

Fichiers concernés :
- [vite.config.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/vite.config.ts)
- [src/lib/appUrl.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/appUrl.ts)
- [.env.local.example](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/.env.local.example)

## 5. Lien public à utiliser dans la lettre

Lien recommandé pour la `General Executive Letter` :

- `https://audit.transferai.ci/`

Ce lien ouvre directement le formulaire public séparé, sans passer par `www.transferai.ci`.

## 6. Configuration Cloudflare Pages recommandée

### Création du projet

Créer un projet Pages relié au dépôt `formulaire-audit-ia`.

Réglages conseillés :
- framework preset : `Vite`
- build command : `npm run build`
- build output directory : `dist`
- root directory : `/`

### Variables à définir dans Cloudflare Pages

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_BASE_PATH=/`
- `VITE_PUBLIC_PROSPECT_FORM_URL=https://audit.transferai.ci/`

### Domaine personnalisé

Ajouter ensuite le custom domain :
- `audit.transferai.ci`

## 7. Tests à faire après publication

1. ouvrir `https://audit.transferai.ci/`
2. verifier l'affichage du formulaire
3. tester le switch `FR / EN / ES`
4. remplir un formulaire de test
5. verifier le message de succes
6. verifier l'apparition de l'identifiant de suivi
7. verifier que la reponse est bien transmise à `contact@transferai.ci`

## 8. Texte de référence pour les équipes

Positionnement interne :
- `www.transferai.ci` reste le site vitrine principal
- `audit.transferai.ci` devient le point d'entrée public dédié aux formulaires d'audit et de préparation

Positionnement prospect :
- un lien direct, propre et distinct
- un parcours simple à ouvrir plus tard
- pas de confusion avec les autres pages du site

## 9. Décision recommandée

Si vous voulez un lien public séparé immédiatement crédible, la meilleure cible est :

- `https://audit.transferai.ci/`

Cela donne :
- une URL claire
- une séparation nette du site principal
- une base propre pour la `General Executive Letter`
- une trajectoire d'industrialisation plus professionnelle
