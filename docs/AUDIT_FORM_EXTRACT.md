# Extraction du formulaire d’audit IA

Ce document extrait la structure du **formulaire d’audit IA historique** encore présent dans le code, même s’il n’est plus affiché publiquement sur la landing.

Répertoire du projet :
- `/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia`

Fichiers principaux du formulaire :
- [src/sections/Section0_Accueil.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section0_Accueil.tsx)
- [src/sections/Section1_Charge.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section1_Charge.tsx)
- [src/sections/Section2_Taches.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section2_Taches.tsx)
- [src/sections/Section3_Ajustements.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section3_Ajustements.tsx)
- [src/sections/Section4_Profil.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section4_Profil.tsx)
- [src/sections/Section5_TachesLibres.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section5_TachesLibres.tsx)
- [src/sections/Section6_Journal.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section6_Journal.tsx)
- [src/sections/Section7_Douleurs.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section7_Douleurs.tsx)
- [src/sections/Section8_Vision.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section8_Vision.tsx)
- [src/sections/Section9_Contraintes.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section9_Contraintes.tsx)
- [src/sections/Section10_Envoi.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section10_Envoi.tsx)

Structure de navigation :
- [src/lib/formProgress.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/formProgress.ts)

Modèle de données :
- [src/types/form.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/types/form.ts)
- [src/lib/formDefaults.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/formDefaults.ts)

## Vue d’ensemble

Le formulaire comporte **10 étapes** :

1. `00` Accueil
2. `A` Charge de travail
3. `B` Tâches identifiées
4. `C` Ajustements
5. `D` Profil early adopter
6. `E` Tâches libres
7. `F` Journal de bord
8. `G` Points de douleur
9. `H` Vision IA
10. `I` Contraintes
11. `10` Envoi et récapitulatif

Les libellés et descriptions de navigation sont définis dans [src/lib/formProgress.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/formProgress.ts).

## Section 00 — Accueil

Objectif :
- cadrer l’identité du répondant
- identifier le domaine métier
- capter les engagements de base

Champs clés :
- `Nom complet`
- `Email du répondant`
- `Fonction`
- `Entité`
- `Domaine principal`
- `Domaines associés ou contexte`

Engagements :
- tester les premiers modules IA
- donner un feedback régulier
- partager les apprentissages avec l’équipe
- confirmer que les informations reflètent la réalité de travail

## Section A — Charge de travail

Objectif :
- mesurer le volume de travail récurrent
- quantifier les rythmes hebdomadaires

Sous-parties :
- `A.1 - Répartition hebdomadaire`
- `A.2 - Chiffres clés de la semaine type`

Champs principaux :
- heures / charge par grands blocs hebdomadaires
- volume d’emails
- volume de réunions
- volume de rapports
- nombre de sources
- nombre de dossiers
- nombre de missions
- heures perdues sur des tâches à faible valeur

Remarque :
- plusieurs libellés changent selon le domaine métier sélectionné

## Section B — Tâches identifiées

Objectif :
- précharger une trame métier
- faire confirmer, corriger ou invalider les tâches déjà connues

Particularité :
- cette section est **dynamique**
- les groupes de tâches proviennent du profil métier dans `competencyDomains`

Par tâche, on demande :
- `Fréquence réelle`
- `Temps réel / sem.`
- `Statut`

Valeurs de statut :
- `À qualifier`
- `Confirmé`
- `Corrigé`
- `À revoir`

## Section C — Ajustements

Objectif :
- corriger les hypothèses du système
- définir les exclusions
- faire ressortir les priorités IA

Sous-parties :
- `C.1 - Estimations inexactes`
- `C.2 - Tâches à garder manuelles`
- `C.3 - Priorités IA personnelles`

Champs clés :
- estimations à corriger
- activités à ne pas automatiser
- priorité 1
- priorité 2
- priorité 3
- attentes concrètes vis-à-vis de l’IA

## Section D — Profil early adopter

Objectif :
- mesurer la maturité numérique et l’appétence IA
- recenser les essais déjà réalisés
- comprendre les formats de restitution attendus

Sous-parties :
- `D.1 - Auto-évaluation digitale`
- `D.2 - Expériences IA existantes`
- `D.3 - Formats de restitution préférés`

Champs clés :
- scores `sc1` à `sc5`
- outils déjà utilisés
- usages déjà testés
- ce qui a plu
- ce qui a limité
- préférences de formats
- autre préférence

## Section E — Tâches libres

Objectif :
- capter les tâches non prévues par la trame
- ouvrir un inventaire libre

Sous-partie :
- `E.1 - Inventaire libre`

Par ligne :
- description
- fréquence
- durée
- automatisable ?

Valeurs :
- fréquence : quotidienne, hebdomadaire, mensuelle, trimestrielle, annuelle, ponctuelle
- automatisable : `Oui`, `Non`, `Incertain`

## Section F — Journal de bord

Objectif :
- comprendre la routine réelle du répondant
- distinguer quotidien, hebdomadaire et périodique

Sous-parties :
- `F.1 - Routine quotidienne`
- `F.2 - Routine hebdomadaire`
- `F.3 - Cycles mensuels et périodiques`

Champs clés :
- matin
- matinée
- après-midi
- soir
- début de semaine
- fin de semaine
- mois
- trimestre
- annuel
- déplacements

## Section G — Points de douleur

Objectif :
- prioriser les irritants
- quantifier le temps perdu
- détecter doublons et débordements horaires

Sous-parties :
- `G.1 - Top 5 des irritants`
- `G.2 - Doublons et redondances`
- `G.3 - Travail hors horaires`

Pour chaque irritant :
- description
- temps perdu
- sévérité

Compléments :
- tâches faites plusieurs fois
- tâches reportées le soir, la nuit ou le week-end

## Section H — Vision IA

Objectif :
- projeter la cible de transformation IA
- préciser les usages attendus à moyen terme

Sous-parties :
- `H.1 - Idéal à 6 mois`
- `H.2 - Vision à 18 mois`
- `H.3 - Déploiement métier et KPI`

Champs clés :
- tâche à automatiser en priorité
- pourquoi cette priorité
- vision d’une journée type avec l’IA
- tâches à déléguer complètement à l’IA
- expertise humaine à conserver
- stratégie de déploiement
- indicateurs de succès

## Section I — Contraintes

Objectif :
- identifier les limites de conformité, sécurité, technique et gouvernance

Sous-parties :
- `I.1 - Confidentialité et conformité`
- `I.2 - Contraintes techniques`
- `I.3 - Contraintes calendaires`
- `I.4 - Commentaires libres`

Champs clés :
- données sensibles à ne pas exposer
- règles / normes / politiques
- hébergement ou contraintes infra
- approbations nécessaires
- systèmes à connecter
- délais à respecter
- politique interne IA
- autres points importants

## Section 10 — Envoi et récapitulatif

Objectif :
- sauvegarder en base
- envoyer un export
- récapituler l’état du dossier

Blocs visibles :
- état du dossier
- progression
- tâches libres
- destinataire
- paramètres de restitution

Champs principaux :
- email de destination
- email en copie
- message d’accompagnement
- format du document
- protection mot de passe du document Word

Formats disponibles :
- `CSV`
- `PDF`
- `Word (.docx)`

Actions disponibles :
- sauvegarder en base
- sauvegarder et envoyer
- exporter en JSON
- imprimer / sauvegarder en PDF

## Logique de sauvegarde

Le formulaire :
- se sauvegarde localement dans le navigateur
- restaure l’état précédent
- peut enregistrer la réponse en base Supabase

Fichier principal :
- [src/context/FormContext.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/context/FormContext.tsx)

Clés locales :
- `audit_ia_gerard_v2`
- `audit_session_id`
- `audit_response_id`

## Données de sortie

Le formulaire stocke notamment :
- identité répondant
- progression
- données complètes du formulaire en JSON
- statut de complétion
- session et éventuel token d’invitation

Table historique :
- `form_responses`

## Ce qu’il faut analyser en priorité

Si ton objectif est de revoir le formulaire d’audit avant une nouvelle version, les points les plus importants à étudier sont :

- la longueur réelle du parcours : 10 étapes
- les dépendances au domaine métier dans la section B
- le poids des sections qualitatives `F`, `G`, `H`, `I`
- la nécessité ou non de garder l’étape d’envoi intégrée au formulaire
- la distinction entre :
  - formulaire d’audit complet
  - formulaire prospect court

## Recommandation

Pour une analyse rapide, lis d’abord dans cet ordre :

1. [src/lib/formProgress.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/formProgress.ts)
2. [src/types/form.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/types/form.ts)
3. [src/sections/Section0_Accueil.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section0_Accueil.tsx)
4. [src/sections/Section2_Taches.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section2_Taches.tsx)
5. [src/sections/Section10_Envoi.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/sections/Section10_Envoi.tsx)

