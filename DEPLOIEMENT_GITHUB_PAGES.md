# Guide de déploiement GitHub Pages

## Ce que le dépôt fournit maintenant

- `vite.config.ts` utilise `/formulaire-audit-ia/` en build GitHub Pages et `/` en local
- `public/.nojekyll` empêche le traitement Jekyll par GitHub Pages
- `.env.local.example` sert de modèle local pour le frontend
- `.github/workflows/deploy-pages.yml` build et déploie automatiquement le site sur GitHub Pages

## 1. Configuration locale

Copiez le modèle puis remplacez les placeholders par vos vraies valeurs Supabase :

```bash
cp .env.local.example .env.local
```

Contenu attendu :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Important :

- utilisez la clé publique `anon`, jamais la `service_role`
- `.env.local` ne doit pas être versionné
- le frontend plante au démarrage sans ces deux variables

Pour lancer l'application en local :

```bash
npm install
npm run dev
```

## 2. Configuration GitHub Pages automatique

Le workflow `deploy-pages.yml` est déclenché :

- à chaque push sur `main`
- manuellement via `workflow_dispatch`

### Secrets GitHub à créer

Dans GitHub : `Settings > Secrets and variables > Actions > New repository secret`

Ajoutez :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Ces deux variables seront injectées au moment du build GitHub Actions.

### Configuration Pages

Dans GitHub : `Settings > Pages`

- Source : `GitHub Actions`

Ensuite, poussez votre code sur `main` :

```bash
git add .
git commit -m "Add local env template and GitHub Pages workflow"
git push origin main
```

Le workflow build automatiquement le site puis le publie sur GitHub Pages.

## 3. URL attendue

Après déploiement, le site sera disponible ici :

```text
https://mayoro1972.github.io/formulaire-audit-ia/
```

## 4. Variables frontend réellement nécessaires

Le frontend a besoin de :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Les anciennes variables frontend `VITE_EMAILJS_*` ne sont plus requises pour le flux actif d'invitation.

## 5. Secrets à ne jamais exposer côté GitHub Pages

Ne mettez jamais dans un fichier frontend ou dans des variables `VITE_*` :

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`

Ces secrets backend doivent rester uniquement dans Supabase pour les Edge Functions.

## 6. Problèmes courants

### Le site affiche une page blanche

- vérifiez que les secrets GitHub `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` existent
- vérifiez l'onglet `Actions` pour voir si le build a échoué
- vérifiez la console du navigateur pour confirmer l'absence d'erreurs de chargement

### L'application marche en local mais pas sur GitHub Pages

- confirmez que `Settings > Pages > Source` est bien sur `GitHub Actions`
- vérifiez que le push a bien déclenché le workflow `Deploy GitHub Pages`
- confirmez que les secrets GitHub ont été saisis sans espace ni guillemets

### Les appels Supabase échouent

- vérifiez l'URL du projet Supabase
- vérifiez que la clé `anon` correspond bien au même projet
- vérifiez les politiques CORS et RLS côté Supabase
