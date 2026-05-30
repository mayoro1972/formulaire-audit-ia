# Refonte du formulaire d'audit TransferAI a partir du workflow V3

Ce document ressort le formulaire d'audit existant, le relie aux 13 domaines d'expertise TransferAI, puis propose une refonte exploitable avec le workflow `TransferAI Prospecting V3 CRM Enhanced [FINAL]`.

Objectif :
- conserver la richesse du formulaire expert TransferAI,
- simplifier drastiquement le formulaire rempli par le prospect,
- aligner le tout avec les champs utilises dans `Assemble Prospect Context`,
- permettre une reutilisation directe dans la `General Executive Letter`.

## 1. Sources prises en compte

Sources audit :
- [docs/AUDIT_FORM_EXTRACT.md](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/docs/AUDIT_FORM_EXTRACT.md)
- [src/types/form.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/types/form.ts)
- [src/lib/competencyDomains.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/lib/competencyDomains.ts)

Sources site web / demande initiale :
- [src/pages/ProspectRequestPage.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/pages/ProspectRequestPage.tsx)
- [src/types/prospect.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/types/prospect.ts)
- [supabase/functions/save-prospect-request/index.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/functions/save-prospect-request/index.ts)

Sources workflow prospection V3 :
- [/Users/marius_ayoro/Documents/GitHub/connect-ia-bloom/docs/transferai-admin/62_n8n_Prospection_V3_CRM_final.json](/Users/marius_ayoro/Documents/GitHub/connect-ia-bloom/docs/transferai-admin/62_n8n_Prospection_V3_CRM_final.json)

Noeuds clefs du workflow :
- `Set Target`
- `Normalize Public Signals`
- `Sanitize Prospect Data For LLM`
- `Call OpenAI Pre-Audit`
- `Call OpenAI Problems Solutions`
- `Call OpenAI ROI`
- `Assemble Prospect Context`
- `Generate Executive Letter`
- `Generate Tailored Audit Form`

## 2. Ce que le formulaire d'audit actuel contient deja

Le formulaire d'audit actuel est riche et pertinent, mais il est trop long pour un premier contact prospect.

Structure actuelle :
- `Accueil`
- `Charge de travail`
- `Taches identifiees`
- `Ajustements`
- `Profil early adopter`
- `Taches libres`
- `Journal de bord`
- `Points de douleur`
- `Vision IA`
- `Contraintes`
- `Envoi et recapitulatif`

Ce qui est vraiment utile a conserver :
- l'identite du repondant et le domaine principal,
- la cartographie des taches recurrentes,
- les irritants et doublons,
- les volumes et delais,
- les outils et donnees,
- les contraintes de confidentialite / conformite,
- la vision cible et les KPI,
- les specificites par domaine metier.

## 3. Les 13 domaines d'expertise TransferAI deja portes par le formulaire

Le formulaire dynamique s'appuie sur `competencyDomains` et couvre deja 13 domaines :

1. `Assistanat & Secretariat`
2. `Ressources Humaines`
3. `Marketing & Communication`
4. `Finance & Comptabilite`
5. `Juridique & Conformite`
6. `Service client & relation client`
7. `Donnees & Analyse`
8. `Administration & Gestion`
9. `Management & Leadership`
10. `Systemes d'information & Transformation digitale`
11. `Formation & Pedagogie`
12. `Sante, social & bien-etre`
13. `Diplomatie & Affaires Internationales`

Point important :
- ces 13 domaines sont des `domaines de competence`,
- le workflow V3 raisonne aussi en `cas d'usage / signaux sectoriels`,
- il faut donc une passerelle entre les deux, pas un remplacement.

## 4. Ce que le workflow V3 attend vraiment

### 4.1 Champs d'entree de base

Le workflow V3 part d'un noyau de donnees prospect :
- `organization_name`
- `website`
- `country`
- `organization_type`
- `sector_guess`
- `decision_maker_name`
- `target_email`
- `custom_page_paths_csv`
- `source_backend`
- `source_label`
- `raw_source_id`

### 4.2 Champs issus de la demande publique du site

Le formulaire web actuel capture deja :
- `fullName`
- `profession`
- `email`
- `phone`
- `city`
- `country`
- `activitySector`
- `needDescription`
- `wantsExpertCall`

### 4.3 Champs transmis au LLM apres sanitation

Le noeud `Sanitize Prospect Data For LLM` ne laisse passer que :
- `organization_type`
- `sector_guess`
- `country`
- `signal_tags`
- `roi_clues`
- `page_keys`
- `public_text_sanitized_excerpt`

Les identifiants reels sont bloques ou pseudonymises :
- `organization_name`
- `website`
- `decision_maker_name`
- `target_email`
- `page_texts`
- `public_text`

### 4.4 Champs produits par `Assemble Prospect Context`

Le contexte final consolide notamment :
- `organization_summary`
- `probable_strengths`
- `probable_weaknesses`
- `probable_needs`
- `entry_point_niche`
- `confidence_score`
- `probable_problems`
- `probable_quick_wins`
- `recommended_offer`
- `offer_sequence`
- `recommended_training_bundle`
- `recommended_use_case`
- `best_selling_use_case`
- `commercial_priority_tier`
- `recommended_meeting_angle`
- `roi_hypothesis`
- `expected_time_savings`
- `expected_service_improvements`
- `expected_quick_wins`
- `delivery_timeline`
- `sector_variant`
- `single_primary_cta`

### 4.5 Ce que `Generate Tailored Audit Form` demande explicitement

Le prompt du workflow exige un mini-formulaire couvrant :
- priorites metier,
- irritants,
- outils actuels,
- donnees,
- attentes de formation,
- confidentialite,
- objectifs a 3 mois,
- volumes traites,
- delais actuels,
- objectifs de performance.

Conclusion :
- le mini-formulaire prospect doit etre court,
- mais il doit absolument contenir ces 10 blocs d'information,
- sinon il ne nourrit ni bien le pre-audit, ni bien la lettre executive.

## 5. Passerelle recommandee entre domaines d'expertise et cas d'usage V3

Voici la passerelle conseillee entre le formulaire TransferAI et les `signal_tags / roi_clues` du workflow.

| Domaine d'expertise TransferAI | Cas d'usage / signal V3 principal | Cas secondaires utiles |
| --- | --- | --- |
| Assistanat & Secretariat | `assistant_direction_documentaire` | `workflow_administratif` |
| Ressources Humaines | `recrutement_onboarding_augmente` | `formation_montee_en_competence`, `workflow_administratif` |
| Marketing & Communication | `machine_contenu_marketing` | `commentaire_donnees_reporting` |
| Finance & Comptabilite | `reporting_financier_assiste` | `workflow_administratif` |
| Juridique & Conformite | `workflow_administratif` | `banque_kyc_reporting` |
| Service client & relation client | `service_client_multicanal` | `workflow_administratif` |
| Donnees & Analyse | `commentaire_donnees_reporting` | `assistant_direction_documentaire` |
| Administration & Gestion | `workflow_administratif` | `assistant_direction_documentaire` |
| Management & Leadership | `assistant_direction_documentaire` | `commentaire_donnees_reporting` |
| SI & Transformation digitale | `support_it_intelligent` | `workflow_administratif` |
| Formation & Pedagogie | `formation_montee_en_competence` | `machine_contenu_marketing` |
| Sante, social & bien-etre | `telemedecine_triage_orientation` | `workflow_administratif` |
| Diplomatie & Affaires Internationales | `assistant_direction_documentaire` | `commentaire_donnees_reporting`, `workflow_administratif` |

Note :
- `operations_terrain_coordination` et `energie_industrie_services` doivent etre traites comme des `surcouches sectorielles`,
- pas comme de nouveaux domaines de competence,
- car ils traversent souvent plusieurs domaines internes : operations, admin, management, IT, reporting.

## 6. Architecture recommandee : deux formulaires, pas un seul

### 6.1 Formulaire A : `Formulaire expert TransferAI`

Usage :
- interne,
- restitution detaillee,
- annexes de mission,
- cadrage approfondi avant accompagnement.

Version recommandee : 7 sections au lieu de 10

1. `Identite & Perimetre`
   Champs :
   - repondant
   - poste
   - entite
   - domaine principal
   - domaines associes
   - equipe concernee

2. `Activites & Volumes`
   Champs :
   - 5 a 8 blocs d'activite
   - volumes hebdomadaires
   - delais actuels
   - heures a faible valeur

3. `Taches critiques`
   Champs :
   - taches prechargees par domaine
   - frequence
   - temps consomme
   - statut
   - commentaire de correction

4. `Irritants & Opportunites`
   Champs :
   - top 3 irritants
   - doublons
   - re-saisies
   - taches hors horaires
   - quick wins souhaites

5. `Outils, Donnees, Gouvernance`
   Champs :
   - outils utilises
   - sources de donnees
   - sensibilite des donnees
   - contraintes reglementaires
   - connecteurs souhaites
   - validations requises

6. `Maturite IA & Adoption`
   Champs :
   - outils IA deja testes
   - maturite percue
   - formats attendus
   - besoins de formation
   - sponsor interne

7. `Vision & KPI`
   Champs :
   - objectif 90 jours
   - objectif 6 mois
   - taches a deleguer
   - taches a garder humaines
   - KPI de succes

Ce formulaire remodele reste compatible avec les 13 domaines car :
- la section `Taches critiques` reste dynamique,
- les libelles de volumes peuvent rester adaptes par domaine,
- les questions communes sont factorisees.

### 6.2 Formulaire B : `Formulaire prospect simple interactif`

Usage :
- apres pre-audit,
- avant appel de 30 minutes,
- tres simple a lire,
- remplissage en liste,
- personnalisation par secteur et par domaine de competence.

Version recommandee : 6 sections courtes

1. `Votre contexte`
   Questions :
   - Votre organisation
   - Votre fonction
   - Le service ou l'equipe concerne(e)
   - Votre secteur d'activite
   - Votre site web

2. `Vos priorites metier`
   Questions :
   - Quel resultat voulez-vous obtenir en priorite ?
   - Quelles sont vos 3 priorites metier actuelles ?
   - Quel probleme vous coute le plus de temps aujourd'hui ?

3. `Vos operations au quotidien`
   Questions :
   - Quelles taches repetitives reviennent le plus souvent ?
   - Quels volumes traitez-vous chaque semaine ?
   - Quels sont vos delais actuels de traitement ou de reponse ?
   - Quelles etapes restent tres manuelles ?

4. `Outils et donnees`
   Questions :
   - Quels outils utilisez-vous aujourd'hui ?
   - Quelles donnees ou documents manipulez-vous ?
   - Quelles donnees sont sensibles ou confidentielles ?
   - Quelles integrations seraient utiles ?

5. `Formation et adoption`
   Questions :
   - Avez-vous deja teste des outils IA ?
   - Quels usages vous interessent le plus ?
   - De quel type d'accompagnement ou de formation avez-vous besoin ?

6. `Objectif a 3 mois`
   Questions :
   - Quel quick win attendez-vous sous 90 jours ?
   - Comment mesurerez-vous le succes ?
   - Qui devra valider ou sponsoriser le projet ?

## 7. Formulaire prospect simple propose, version texte

Cette version est celle que le prospect peut remplir facilement en mode liste.

### Bloc 1 - Identite

- Organisation :
- Nom et prenom :
- Fonction :
- Email :
- Telephone :
- Pays / ville :
- Secteur d'activite :
- Site web :

### Bloc 2 - Priorites

- Quel resultat souhaitez-vous obtenir en priorite ?
- Quelles sont vos 3 priorites metier du moment ?
- Quel irritant ou blocage vous penalise le plus ?

### Bloc 3 - Activites a simplifier

- Quelles sont les 3 a 5 taches les plus repetitives de votre equipe ?
- Environ combien de dossiers, demandes, tickets ou operations traitez-vous par semaine ?
- Quels sont vos delais actuels moyens ?
- Quelles taches prennent trop de temps pour peu de valeur ?

### Bloc 4 - Outils et donnees

- Quels outils utilisez-vous aujourd'hui ?
- Quelles donnees, documents ou messages manipulez-vous ?
- Y a-t-il des donnees sensibles a ne jamais exposer ?
- Faut-il connecter des outils existants ?

### Bloc 5 - Maturite et accompagnement

- Avez-vous deja utilise des outils IA ? Si oui, lesquels ?
- Souhaitez-vous surtout :
  - gagner du temps,
  - mieux repondre,
  - mieux analyser,
  - mieux documenter,
  - mieux former ?
- Quel type d'accompagnement attendez-vous :
  - audit,
  - prototype,
  - automatisation,
  - formation,
  - accompagnement equipe ?

### Bloc 6 - Cible a 90 jours

- Quel resultat concret voudriez-vous voir dans 3 mois ?
- Quel indicateur vous permettrait de dire que le projet est utile ?
- Qui doit valider le projet en interne ?

## 8. Modules sectoriels courts a ajouter en conditionnel

Le mini-formulaire ne doit pas etre long. On ajoute seulement `1 module conditionnel` selon le secteur ou le `signal_tag` dominant.

### Service client

- Quel est votre volume de demandes ou tickets par semaine ?
- Quels canaux traitez-vous : email, WhatsApp, telephone, CRM, autre ?
- Quels delais de reponse souhaitez-vous ameliorer ?

### IT / support

- Combien d'incidents ou demandes support traitez-vous par semaine ?
- Avez-vous une base documentaire ou des procedures techniques ?
- Quelles demandes reviennent le plus souvent ?

### Marketing & communication

- Quels contenus produisez-vous le plus souvent ?
- Combien de campagnes ou publications gerez-vous par mois ?
- Ou perdez-vous le plus de temps : redaction, adaptation, validation, reporting ?

### Finance

- Quels reportings ou rapprochements sont les plus chronophages ?
- Quels delais de cloture ou de production souhaitez-vous reduire ?
- Quelles validations ou controles doivent rester humains ?

### RH

- Quels processus sont prioritaires : recrutement, onboarding, formation, administration RH ?
- Combien de dossiers ou demandes RH traitez-vous par mois ?
- Quelles informations sont les plus sensibles ?

### Donnees & analyse

- Quelles sources de donnees utilisez-vous ?
- Quelles analyses ou visualisations reviennent le plus souvent ?
- Ou se trouvent les plus gros efforts manuels : collecte, nettoyage, synthese ?

### Sante / social

- Quels dossiers ou suivis sont les plus repetitifs ?
- Quelles contraintes de confidentialite sont non negociables ?
- Quels comptes rendus ou coordinations vous prennent le plus de temps ?

### Banque / conformite

- Quels controles, revues ou reportings sont les plus frequents ?
- Quelles exigences de tracabilite ou de validation devez-vous respecter ?
- Quels documents ou flux sont les plus sensibles ?

### Operations terrain / logistique

- Quelles operations terrain faut-il coordonner chaque semaine ?
- Quels retours ou rapports remontent du terrain ?
- Quels delais ou pertes d'information voulez-vous reduire ?

### Energie / industrie

- Quels processus sont les plus repetitifs ou documentaires ?
- Quels rapports, relevés ou comptes rendus sont produits regulierement ?
- Quelles contraintes de securite ou de conformite s'appliquent ?

### Formation / pedagogie

- Quels supports ou evaluations preparez-vous souvent ?
- Faut-il personnaliser les contenus selon les publics ?
- Quel resultat attendez-vous : temps gagne, qualite, engagement, suivi ?

### Direction / management

- Quels points de pilotage ou de reporting reviennent chaque semaine ?
- Quels arbitrages vous prennent le plus de temps ?
- Quel type de synthese vous serait le plus utile ?

## 9. Ce qui doit alimenter la General Executive Letter

Pour remodeler correctement la `General Executive Letter`, il faut que le formulaire prospect simple alimente au minimum ces variables :

- `resultat_prioritaire`
- `top_3_priorites`
- `principal_irritant`
- `taches_repetitives`
- `volumes_hebdo`
- `delais_actuels`
- `outils_actuels`
- `donnees_sensibles`
- `besoin_formation`
- `quick_win_90_jours`
- `kpi_succes`
- `sponsor_interne`

Correspondance avec le workflow :
- `resultat_prioritaire` renforce `recommended_meeting_angle`
- `principal_irritant` nourrit `probable_problems`
- `quick_win_90_jours` renforce `probable_quick_wins`
- `volumes_hebdo` et `delais_actuels` renforcent `roi_hypothesis`
- `besoin_formation` renforce `recommended_training_bundle`
- `secteur + domaine + module conditionnel` renforcent `entry_point_niche` et `recommended_use_case`

## 10. Recommandation de modelisation finale

Je recommande de modeler la refonte comme suit :

1. `Niveau 1 - Demande initiale site`
   Champs tres courts.
   But : creer la fiche prospect et lancer le workflow.

2. `Niveau 2 - Pre-audit V3`
   Produit par le workflow a partir :
   - du site,
   - du web public,
   - des signaux sectoriels,
   - de la sanitation LLM.

3. `Niveau 3 - Formulaire prospect simple`
   Genere apres pre-audit.
   Court, conditionnel, lisible, centre sur les 10 informations demandees par `Generate Tailored Audit Form`.

4. `Niveau 4 - Formulaire expert TransferAI`
   Version detaillee pour mission d'audit, cadrage avance, livrables et lettre executive enrichie.

## 11. Decision de conception la plus importante

Le bon choix n'est pas de faire `un seul gros formulaire`.

Le bon choix est :
- `un formulaire prospect simple` pour obtenir vite les bons signaux,
- `un formulaire expert TransferAI` pour approfondir,
- `une passerelle explicite` entre domaines de competence et cas d'usage sectoriels du workflow.

Sans cette separation :
- le prospect trouve le formulaire trop long,
- le workflow n'obtient pas les champs vraiment utiles,
- la lettre executive reste trop generique.

## 12. Prochaine etape recommandee

Prochaine etape de build conseillee :
- creer une nouvelle page React `ProspectSimpleAuditForm`,
- alimentee par un schema JSON,
- avec `base questions + module conditionnel sectoriel`,
- puis pre-remplir la `General Executive Letter` avec les champs du mini-formulaire et de `Assemble Prospect Context`.

## 13. Configuration a reporter dans le user guide `Prospecting CRM Enhanced`

Pour exploitation operationnelle dans `TransferAI Prospecting V3 CRM Enhanced [FINAL]`, la configuration du formulaire prospect simple doit etre documentee comme suit.

### 13.1 Positionnement dans le workflow

Le formulaire prospect simple intervient :
- apres `Assemble Prospect Context`,
- avant la visite ou l'appel de cadrage,
- comme pont entre le pre-audit V3 et la `General Executive Letter`.

### 13.2 Logique d'envoi recommandee

Mode de diffusion :
- le lien du formulaire apparait dans la `General Executive Letter`,
- le clic ouvre le formulaire dans une fenetre dediee,
- le prospect le remplit avant la visite,
- le formulaire est ensuite transmis a `contact@transferai.ci`.

Objectif metier :
- laisser au prospect le temps de repondre,
- permettre a l'expert de relire les reponses avant la rencontre,
- preparer un audit complet avec un meilleur contexte.

### 13.3 Donnees d'entree a reutiliser depuis `Assemble Prospect Context`

Les variables suivantes doivent piloter l'habillage ou le pre-remplissage du formulaire :
- `entry_point_niche`
- `recommended_use_case`
- `recommended_offer`
- `roi_hypothesis`
- `sector_variant`
- `probable_quick_wins`
- `recommended_meeting_angle`

Regle d'usage :
- ne jamais afficher les noms techniques bruts au prospect,
- les convertir en vocabulaire commercial ou pedagogique,
- utiliser ces variables pour choisir le `module sectoriel` et la `promesse principale` du formulaire.

### 13.4 Structure fonctionnelle retenue

Tronc commun :
- `Votre contexte`
- `Vos priorites metier`
- `Vos operations au quotidien`
- `Outils et donnees`
- `Formation et adoption`
- `Objectif a 3 mois`

Surcouche conditionnelle :
- un seul module sectoriel ajoute selon le cas d'usage dominant,
- exemple : `service_client_multicanal`, `support_it_intelligent`, `reporting_financier_assiste`, etc.

### 13.5 Comportement attendu dans l'interface

Version cible de la page :
- trilingue `FR / EN / ES`,
- ton final et operationnel, sans wording de test,
- ouverture possible en fenetre dediee,
- message de confirmation apres envoi,
- affichage d'un `identifiant de suivi` quand la sauvegarde Supabase reussit.

### 13.6 Routage technique retenu

Le formulaire prospect simple doit reutiliser le meme circuit que le formulaire d'audit du site :
- sauvegarde via `save-form-response`,
- stockage dans `form_responses`,
- envoi email via `send-form-email`,
- destination principale `contact@transferai.ci`.

Benefice :
- pas de circuit parallele,
- meme logique d'extraction expert,
- meme gouvernance de stockage et d'envoi.

### 13.7 Artefacts de reference

Les fichiers de reference a citer dans le guide sont :
- [docs/PROSPECT_SIMPLE_FORM_V3.schema.json](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/docs/PROSPECT_SIMPLE_FORM_V3.schema.json)
- [src/pages/ProspectSimpleAuditFormPreviewPage.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/pages/ProspectSimpleAuditFormPreviewPage.tsx)
- [supabase/functions/save-form-response/index.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/functions/save-form-response/index.ts)
- [supabase/functions/send-form-email/index.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/functions/send-form-email/index.ts)
