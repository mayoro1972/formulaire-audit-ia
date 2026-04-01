# Cartographie du questionnaire

## Vue d'ensemble

L'application affiche 11 étapes :

1. `Accueil`
2. `A · Charge de travail`
3. `B · Tâches identifiées`
4. `C · Ajustements`
5. `D · Profil early adopter`
6. `E · Tâches libres`
7. `F · Journal de bord`
8. `G · Points de douleur`
9. `H · Vision IA`
10. `I · Contraintes`
11. `Envoi & récapitulatif`

Toutes les réponses sont réunies dans un seul objet `formData` porté par `FormContext`.

## Conventions de nommage

### Identité et métadonnées générales

- `c_nom`, `c_email`, `c_poste`, `c_entite`
- `eng1` à `eng4` pour les engagements
- `email_dest`, `email_cc`, `email_msg` pour l'écran d'envoi

### Section A : charge de travail

- `ch1_h` à `ch8_h` : heures par semaine
- `ch1_r` à `ch8_r` : part répétitive en pourcentage
- `a_emails`, `a_reunions`, `a_rapports`, `a_sources`, `a_dossiers`, `a_missions`, `a_perdues`

### Section B : tâches déjà identifiées

Les lignes sont codées dynamiquement avec le schéma :

- `${prefix}_f${index}` : fréquence
- `${prefix}_t${index}` : temps
- `${prefix}_c${index}` : confirmation

Préfixes actuellement utilisés :

- `tb-veille`
- `tb-lcb`
- `tb-audit`
- `tb-awa`

Exemple : `tb-veille_f0`, `tb-veille_t0`, `tb-veille_c0`.

### Section C : ajustements

- `c_inexact`
- `c_exclure`
- `c_prio1`, `c_prio2`, `c_prio3`
- `c_attentes`

### Section D : profil et maturité

- `sc1` à `sc5` : scores de 1 à 10
- `d_outils`, `d_usage`, `d_plus`, `d_moins`, `d_format_autre`
- `fmt1` à `fmt5` : préférences de format

### Section E : tâches libres

Section dynamique basée sur un compteur :

- `libreRowCount`
- `lib_d${n}` : description
- `lib_f${n}` : fréquence
- `lib_t${n}` : durée
- `lib_a${n}` : automatisable

Exemple : `lib_d1`, `lib_f1`, `lib_t1`, `lib_a1`.

### Section F : journal de bord

- `f_matin`
- `f_matinee`
- `f_apm`
- `f_soir`
- `f_lundi`
- `f_vendredi`
- `f_mois`
- `f_trim`
- `f_annuel`
- `f_deplac`

### Section G : irritants

Pour chacun des 5 irritants :

- `irr${n}_desc`
- `irr${n}_t`
- `irr${n}_s`

Champs complémentaires :

- `g_doublons`
- `g_nuit`

### Section H : vision IA

- `h_une`
- `h_pourquoi`
- `h_vision`
- `h_delegate`
- `h_humain`
- `h_awa`
- `h_kpi`

### Section I : contraintes

- `i_conf`
- `i_rgpd`
- `i_heberg`
- `i_appro`
- `i_sys`
- `i_cal`
- `i_pol`
- `i_autres`

## Cartographie par fichier

| Étape UI | Fichier | Finalité |
| --- | --- | --- |
| Accueil | `src/sections/Section0_Accueil.tsx` | identité, engagements, progression, partage du lien |
| A | `src/sections/Section1_Charge.tsx` | charge de travail et métriques hebdomadaires |
| B | `src/sections/Section2_Taches.tsx` | validation de tâches pré-identifiées |
| C | `src/sections/Section3_Ajustements.tsx` | corrections, exclusions, priorités |
| D | `src/sections/Section4_Profil.tsx` | maturité digitale et préférences d'usage |
| E | `src/sections/Section5_TachesLibres.tsx` | saisie libre de tâches complémentaires |
| F | `src/sections/Section6_Journal.tsx` | routines quotidiennes, hebdo, mensuelles |
| G | `src/sections/Section7_Douleurs.tsx` | irritants, doublons, travail hors horaires |
| H | `src/sections/Section8_Vision.tsx` | vision cible à 6 et 18 mois |
| I | `src/sections/Section9_Contraintes.tsx` | contraintes métier, techniques et réglementaires |
| Envoi | `src/sections/Section10_Envoi.tsx` | enregistrement, export, email, impression |

## Progression et complétion

### Ce que voit l'utilisateur

La sidebar et la navbar utilisent une progression synthétique par section, construite à partir de quelques champs sentinelles :

- identité
- charge
- priorités
- profil
- tâches libres
- journal
- irritants
- vision
- contraintes

### Ce qui est stocké en base

`submitToSupabase()` calcule `completion_percentage` en parcourant la majorité des champs de `initialFormData`.

En pratique :

- la progression UI donne un signal rapide
- la complétion stockée en base est plus proche d'un comptage global des champs remplis

## Export et restitution

`Section10_Envoi.tsx` permet :

- un enregistrement en base sans email
- un envoi email avec pièce jointe
- un export JSON brut du `formData`
- une impression navigateur

Formats actuellement pris en charge par `send-form-email` :

- CSV
- PDF
- Word (`.docx`)

## Particularités métier

Le questionnaire n'est pas générique. Les libellés métier, les tâches suggérées et certains textes de l'interface sont explicitement orientés :

- audit interne
- conformité et LCB-FT
- veille réglementaire
- pilotage régional AWA
- environnement Attijari / filiales

Pour transformer ce dépôt en produit multi-clients, il faudrait externaliser :

- les intitulés de sections
- les tâches préremplies de la section B
- les textes contextuels de la navbar et de l'accueil
- la structure des exports
