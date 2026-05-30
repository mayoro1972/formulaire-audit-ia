# User Guide - Prospecting CRM Enhanced - Formulaire prospect simple

Ce guide documente la configuration du `ProspectSimpleAuditForm` dans le parcours `TransferAI Prospecting V3 CRM Enhanced [FINAL]`.

Objectif :
- inserer un formulaire prospect simple dans la `General Executive Letter`,
- permettre au prospect de le remplir avant la visite,
- reutiliser le meme circuit de stockage et d'envoi que le formulaire d'audit du site,
- donner a l'expert un contexte plus riche avant l'audit complet.

## 1. Role du formulaire dans le parcours

Le formulaire prospect simple intervient apres le pre-audit V3.

Sequence cible :
1. le workflow produit le contexte via `Assemble Prospect Context`
2. la `General Executive Letter` est generee
3. la lettre contient un lien vers le formulaire
4. le prospect clique sur le lien
5. le formulaire s'ouvre dans une fenetre dediee
6. le prospect le remplit avant la visite
7. les reponses sont stockees dans Supabase puis transmises a `contact@transferai.ci`

## 2. Experience attendue cote prospect

La page doit se presenter comme une experience finale et non comme une maquette technique.

Exigences de presentation :
- interface trilingue `FR / EN / ES`
- langage simple et orientee metier
- aucun libelle technique visible comme `entry_point_niche`
- ouverture possible dans une fenetre dediee
- message de confirmation apres envoi
- affichage d'un identifiant de suivi quand la sauvegarde est reussie

Route de preview actuelle :
- [http://127.0.0.1:4177/?preview=prospect-simple-audit](http://127.0.0.1:4177/?preview=prospect-simple-audit)

Implementation actuelle :
- [src/pages/ProspectSimpleAuditFormPreviewPage.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/pages/ProspectSimpleAuditFormPreviewPage.tsx)
- [src/main.tsx](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/src/main.tsx)

## 3. Positionnement par rapport au workflow V3

Le formulaire ne remplace pas le pre-audit. Il vient le completer.

Le workflow doit fournir ou orienter :
- `entry_point_niche`
- `recommended_use_case`
- `recommended_offer`
- `roi_hypothesis`
- `sector_variant`
- `probable_quick_wins`
- `recommended_meeting_angle`

Regle importante :
- ces variables restent des variables internes,
- elles doivent etre traduites en vocabulaire prospect,
- elles servent a choisir l'angle principal, le module sectoriel et le ton de la page.

## 4. Structure du formulaire retenue

Tronc commun :
1. `Votre contexte`
2. `Vos priorites metier`
3. `Vos operations au quotidien`
4. `Outils et donnees`
5. `Formation et adoption`
6. `Objectif a 3 mois`

Surcouche conditionnelle :
- un seul module sectoriel en plus,
- choisi selon le cas d'usage dominant,
- par exemple : `service_client_multicanal`, `support_it_intelligent`, `machine_contenu_marketing`, `workflow_administratif`.

Schema de reference :
- [docs/PROSPECT_SIMPLE_FORM_V3.schema.json](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/docs/PROSPECT_SIMPLE_FORM_V3.schema.json)

## 5. Liaison avec la General Executive Letter

Le formulaire doit apparaitre dans la lettre executive comme un lien d'action clair.

Comportement attendu :
- le prospect voit un lien ou bouton de type `Completer le formulaire de preparation`
- le clic ouvre le formulaire dans une fenetre dediee
- le prospect peut le remplir plus tard avant la visite
- l'envoi prepare mieux l'appel ou la visite d'audit

Le formulaire doit ensuite renforcer la lettre ou la preparation commerciale avec :
- le resultat prioritaire
- les irritants principaux
- les volumes reels
- les delais actuels
- les quick wins attendus
- le sponsor interne

## 6. Routage technique retenu

Le formulaire prospect simple doit reutiliser exactement le meme setup que le formulaire d'audit du site.

Flux retenu :
1. sauvegarde via `save-form-response`
2. stockage dans la table `form_responses`
3. envoi email via `send-form-email`
4. destination principale `contact@transferai.ci`

References techniques :
- [supabase/functions/save-form-response/index.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/functions/save-form-response/index.ts)
- [supabase/functions/send-form-email/index.ts](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/supabase/functions/send-form-email/index.ts)

Benefices :
- pas de nouveau circuit a maintenir
- compatibilite avec le traitement expert existant
- meme logique d'archivage et d'extraction

## 7. Verification du stockage

Lors d'un envoi reussi :
- la page affiche un message de succes
- la page affiche aussi un `identifiant de suivi`
- cet identifiant correspond au `responseId` retourne par `save-form-response`

Ce point sert de preuve visible que la reponse a bien ete enregistree dans le circuit Supabase avant l'envoi email.

## 8. A retenir pour l'integration finale

Le bon modele d'exploitation est :
- `workflow V3` pour detecter le contexte
- `lettre executive` pour introduire le formulaire
- `formulaire prospect simple` pour obtenir les informations actionnables avant visite
- `formulaire expert` pour l'audit complet ensuite

Documentation complementaire :
- [docs/REFONTE_FORMULAIRE_AUDIT_V3.md](/Users/marius_ayoro/Documents/Playground/formulaire-audit-ia/docs/REFONTE_FORMULAIRE_AUDIT_V3.md)
