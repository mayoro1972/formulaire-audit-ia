# Guide de déploiement GitHub Pages

## Configuration effectuée

### 1. Configuration Vite
Le fichier `vite.config.ts` contient maintenant :
```typescript
base: '/formulaire-audit-ia/'
```
Cette configuration est essentielle pour que tous les chemins (CSS, JS, images) fonctionnent correctement sur GitHub Pages.

### 2. Fichier .nojekyll
Un fichier `.nojekyll` a été ajouté dans le dossier `public/` pour éviter que GitHub Pages traite le site avec Jekyll.

### 3. Build du projet
Le projet a été compilé avec succès. Les fichiers générés dans `dist/` utilisent les bons chemins :
- `/formulaire-audit-ia/assets/index-[hash].js`
- `/formulaire-audit-ia/assets/index-[hash].css`

## Déploiement sur GitHub Pages

### Étapes à suivre :

1. **Pousser le code sur GitHub**
   ```bash
   git add .
   git commit -m "Fix GitHub Pages configuration"
   git push origin main
   ```

2. **Build le projet localement**
   ```bash
   npm run build
   ```

3. **Déployer le dossier dist/**

   Option A - Utiliser gh-pages (recommandé) :
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

   Option B - Manuellement :
   - Copier tout le contenu du dossier `dist/`
   - Créer une nouvelle branche `gh-pages`
   - Coller le contenu à la racine de cette branche
   - Push la branche `gh-pages`

4. **Configurer GitHub Pages**
   - Aller sur GitHub → Settings → Pages
   - Source : Deploy from a branch
   - Branch : `gh-pages` / `root`
   - Save

## Vérification

Après le déploiement, visitez :
```
https://mayoro1972.github.io/formulaire-audit-ia/
```

Le formulaire devrait se charger correctement avec :
- Tous les styles CSS appliqués
- Toutes les fonctionnalités JavaScript actives
- La connexion Supabase fonctionnelle
- Les invitations par email opérationnelles

## Problèmes courants

### Le site affiche une page blanche
- Vérifier que `base: '/formulaire-audit-ia/'` est bien dans vite.config.ts
- Vérifier que le build a été effectué après la modification
- Vérifier dans la console du navigateur s'il y a des erreurs 404

### Les styles ne s'appliquent pas
- Vérifier les chemins dans `dist/index.html`
- Ils doivent commencer par `/formulaire-audit-ia/assets/`

### Erreurs de connexion Supabase
- Les variables d'environnement ne sont pas disponibles côté client sur GitHub Pages
- Vérifier que les clés sont bien dans le code compilé (dist/)
- Vérifier la configuration CORS de Supabase

## Variables d'environnement

Les variables suivantes sont nécessaires et doivent être présentes au moment du build :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

Elles sont incluses dans le build final car Vite les intègre lors de la compilation.
