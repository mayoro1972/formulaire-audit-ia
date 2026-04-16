# Audit Prospect - Formulaire Audit IA

## 1. Résumé exécutif

`Formulaire Audit IA` est une application React + Supabase conçue pour cadrer un audit métier orienté IA, collecter les réponses d'un prospect ou d'un collaborateur, puis restituer ces réponses via dashboard, export et email.

En l'état, le produit présente une bonne base pour :

- un `POC` encadré,
- une `mission d'audit` menée avec accompagnement,
- un `envoi d'invitations nominatives` avec suivi,
- une `collecte structurée` plus professionnelle qu'un formulaire générique.

En revanche, la version actuelle ne doit pas être présentée comme une plateforme SaaS prête pour un déploiement public large sans travaux complémentaires. Le principal frein n'est pas l'expérience utilisateur, mais la `sécurisation` et la `gouvernance des accès`.

Verdict synthétique :

- `Très adapté` pour un audit assisté ou un pilote client contrôlé.
- `Adapté sous conditions` pour des prospects sélectionnés, avec cadrage clair.
- `Non prêt` pour une mise à disposition publique large ou multi-clients sans durcissement.

## 2. Ce que le produit fait bien

### Valeur métier

- Questionnaire structuré en 11 étapes couvrant charge, tâches, irritants, vision cible, contraintes et restitution.
- Parcours cohérent pour faire émerger des cas d'usage IA concrets, pas seulement des opinions générales.
- Modèle bien adapté à une démarche de diagnostic ou de pré-cadrage avant mission.

### Expérience utilisateur

- Sauvegarde locale automatique pendant la saisie.
- Possibilité de reprendre un formulaire en plusieurs fois.
- Invitation nominative par lien unique.
- Préremplissage possible d'un brouillon avant envoi au prospect.
- Export final au format `CSV`, `PDF` ou `Word`.

### Exploitation côté cabinet / équipe commerciale

- Tableau de bord admin pour consulter les réponses.
- Routage email configurable pour recevoir les formulaires complétés.
- Notification admin après soumission.
- Archivage centralisé des réponses dans Supabase.

### Architecture technique

- Stack légère et rapide à faire évoluer : `Vite`, `React`, `TypeScript`, `Supabase`.
- Séparation claire entre frontend, migrations SQL et fonctions backend email.
- Logique d'invitation et de restitution déjà intégrée.

## 3. Risques majeurs observés

### 3.1 Accès admin non sécurisé

Le mode admin est ouvert par simple état d'interface dans [src/App.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/App.tsx:28) et le bouton reste visible à toute personne hors parcours d'invitation dans [src/App.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/App.tsx:126).

Impact :

- toute personne qui accède à l'application standard peut tenter d'ouvrir le dashboard,
- la séparation entre répondant et administrateur n'est pas réellement garantie côté produit.

### 3.2 Politiques Supabase trop permissives

La migration [20260330180755_fix_anon_select_policy.sql](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/migrations/20260330180755_fix_anon_select_policy.sql:20) autorise la lecture anonyme de toutes les réponses.  
La migration [20260330150158_add_invitations_and_admin_email.sql](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/migrations/20260330150158_add_invitations_and_admin_email.sql:42) autorise aussi des lectures et mises à jour très ouvertes sur `form_invitations` et `admin_settings`.

Impact :

- confidentialité insuffisante pour un usage prospect à échelle,
- gouvernance des données trop faible pour une offre "prête production",
- difficulté à rassurer un client exigeant sur sécurité, conformité et contrôle d'accès.

### 3.3 Fonctions sensibles appelées avec clé anonyme

Le frontend appelle les fonctions d'envoi d'emails avec la clé `anon`, notamment depuis [src/pages/SendInvitations.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/pages/SendInvitations.tsx:181) et [src/sections/Section10_Envoi.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section10_Envoi.tsx:113).

Impact :

- le backend doit porter l'essentiel de la confiance,
- le risque d'abus ou de détournement est plus élevé,
- il manque aujourd'hui une vraie logique d'autorisation forte pour les actions critiques.

### 3.4 Continuité de session imparfaite

Le formulaire sauvegarde bien le brouillon localement, mais `responseId` n'est pas persisté dans [src/context/FormContext.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/context/FormContext.tsx:45) et la logique de reprise repose sur une recherche indirecte dans [src/context/FormContext.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/context/FormContext.tsx:124).

Impact :

- un rechargement navigateur peut créer ou rattacher une mauvaise ligne de réponse,
- la traçabilité de certaines sessions reste fragile.

### 3.5 Produit encore trop contextualisé pour un usage multi-prospects

Le README et la cartographie du questionnaire indiquent clairement que le wording actuel est très orienté audit interne / Attijari / conformité métier. Cela donne une forte valeur dans un contexte précis, mais limite la réutilisation immédiate pour des prospects variés.

Impact :

- le produit est fort comme outil de mission ciblée,
- il est encore trop spécifique pour être vendu comme formulaire universel sans adaptation.

## 4. Vérification technique effectuée

Contrôles réalisés sur le dépôt le `14 avril 2026` :

- lecture de la documentation fonctionnelle et d'architecture,
- revue des flux `formulaire`, `invitation`, `dashboard`, `email`,
- revue des migrations Supabase et des politiques RLS,
- exécution de `npm run lint`,
- exécution de `npm run typecheck`,
- exécution de `npm run build`.

Résultat :

- `lint` passait déjà,
- `typecheck` et `build` échouaient à cause d'un module Supabase incomplet,
- ce point a été corrigé en restaurant les exports de configuration dans [src/lib/supabase.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/supabase.ts:1).

## 5. Niveau de maturité recommandé

### Positionnement que vous pouvez assumer dès maintenant

Vous pouvez présenter ce produit comme :

- un `outil d'audit IA structuré`,
- un `accélérateur de diagnostic client`,
- une `base de collecte premium` pour missions de conseil,
- une `solution de pilotage de campagne d'audit` en environnement contrôlé.

### Positionnement à éviter pour l'instant

Évitez de le vendre aujourd'hui comme :

- une plateforme SaaS publique prête à l'emploi,
- une solution multi-tenant durcie,
- un produit conforme entreprise sans travaux complémentaires de sécurité.

## 6. Recommandations avant envoi large à des prospects

### Priorité immédiate

- Ajouter une authentification réelle pour les écrans admin.
- Restreindre drastiquement les politiques RLS sur `form_responses`, `form_invitations` et `admin_settings`.
- Encadrer les Edge Functions critiques avec une logique d'autorisation explicite.

### Priorité court terme

- Persister un identifiant de réponse stable côté navigateur.
- Unifier le calcul de progression entre UI et base.
- Ajouter une journalisation claire des invitations, envois et erreurs.

### Priorité commerciale / produit

- Déspécialiser les libellés métier les plus contextuels.
- Préparer 2 à 3 variantes de questionnaire par secteur ou usage.
- Créer un livrable de synthèse plus "cabinet" qu'"interne projet".

## 7. Message prospect recommandé

Vous pouvez reprendre ce texte tel quel en l'ajustant légèrement :

> Nous utilisons un formulaire d'audit IA structuré qui permet de collecter de manière homogène les informations métier, les tâches à faible valeur, les irritants opérationnels, les contraintes de conformité et la vision cible. L'outil permet un remplissage progressif, un préremplissage par invitation nominative et une restitution exploitable par nos équipes pour formuler des recommandations concrètes.  
> Dans son format actuel, la solution est particulièrement adaptée aux diagnostics encadrés, aux missions d'audit et aux pilotes clients. Elle constitue une base robuste de collecte et de qualification, avec une feuille de route claire pour un durcissement production plus large.

## 8. Conclusion

Le produit est `crédible`, `utile` et `différenciant` pour démarrer ou industrialiser une offre d'audit IA accompagnée. Sa vraie force est la structuration métier du diagnostic et le parcours d'invitation/réponse déjà intégré.

Le point bloquant n'est pas la valeur fonctionnelle, mais la `sécurité d'exploitation`. Si votre objectif immédiat est de l'envoyer à des prospects dans un cadre piloté ou accompagné, c'est tout à fait défendable. Si votre objectif est d'en faire une plateforme ouverte et industrialisée, il faut d'abord investir dans le durcissement des accès et des politiques de données.
