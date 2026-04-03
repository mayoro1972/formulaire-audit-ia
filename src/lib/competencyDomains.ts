import type { FormData } from '../types/form';

export interface DomainTaskGroup {
  title: string;
  tasks: [string, string, string][];
}

export interface CompetencyDomainProfile {
  key: string;
  label: string;
  summary: string;
  workloadCategories: string[];
  metricLabels: {
    emails: string;
    meetings: string;
    reports: string;
    sources: string;
    dossiers: string;
    missions: string;
    lowValueHours: string;
  };
  taskGroups: DomainTaskGroup[];
  automationIdeas: string[];
  inaccuracyExample: string;
  exclusionExample: string;
  expectationsExample: string;
  routinePrompts: {
    morning: string;
    midday: string;
    afternoon: string;
    endOfDay: string;
    monday: string;
    friday: string;
    month: string;
    quarter: string;
    year: string;
    travel: string;
  };
  constraints: {
    confidentiality: string;
    regulations: string;
    systems: string;
    policy: string;
    calendar: string;
  };
  vision: {
    delegate: string;
    human: string;
    deployment: string;
    kpis: string;
  };
}

const genericProfile: CompetencyDomainProfile = {
  key: 'generic',
  label: 'Multi-métiers',
  summary: "Trame générique pour cadrer les activités, irritants et opportunités d'automatisation d'un métier.",
  workloadCategories: [
    'Traitement opérationnel',
    'Coordination & suivi',
    'Analyse & contrôle qualité',
    'Conformité / validation',
    'Management / accompagnement',
    'Reporting & communication',
    'Projets & amélioration continue',
    'Autres activités',
  ],
  metricLabels: {
    emails: 'Emails/messages traités par jour',
    meetings: 'Réunions / points de coordination par semaine',
    reports: 'Livrables / rapports produits par mois',
    sources: 'Sources / outils consultés chaque semaine',
    dossiers: 'Dossiers / cas traités par mois',
    missions: 'Projets / missions menés simultanément',
    lowValueHours: 'Heures à faible valeur ajoutée par semaine',
  },
  taskGroups: [
    {
      title: 'B.1 — Opérations récurrentes',
      tasks: [
        ['Traitement des demandes entrantes', 'Quotidienne', '4–6h/sem'],
        ['Mise à jour des dossiers / outils', 'Quotidienne', '2–4h/sem'],
      ],
    },
    {
      title: 'B.2 — Coordination & validation',
      tasks: [
        ['Préparation des points / validations', 'Hebdomadaire', '2–3h/sem'],
        ['Relances et suivi des actions', 'Hebdomadaire', '2–3h/sem'],
      ],
    },
    {
      title: 'B.3 — Analyse & synthèse',
      tasks: [
        ['Collecte et consolidation des informations', 'Hebdomadaire', '2–4h/sem'],
        ['Production de synthèses / recommandations', 'Hebdomadaire', '2–4h/sem'],
      ],
    },
    {
      title: 'B.4 — Pilotage & amélioration',
      tasks: [
        ['Suivi des indicateurs et priorités', 'Mensuelle', '2–3h/mois'],
        ["Amélioration des processus d'équipe", 'Mensuelle', '2–3h/mois'],
      ],
    },
  ],
  automationIdeas: [
    'classifier et prioriser les demandes entrantes',
    'préparer des synthèses à partir des dossiers existants',
    'générer des comptes rendus et plans d’action',
  ],
  inaccuracyExample: "Ex : le temps de traitement des demandes urgentes est sous-estimé, surtout lors des pics d'activité.",
  exclusionExample: 'Ex : les arbitrages sensibles ou les validations engageant la responsabilité managériale doivent rester manuels.',
  expectationsExample: "Ex : disposer d'un copilote capable de structurer l'information, accélérer la production et réduire les relances.",
  routinePrompts: {
    morning: "ex : revue des messages, priorisation des urgences, mise à jour du plan de la journée...",
    midday: "ex : points d'équipe, traitement des dossiers prioritaires, validation de documents...",
    afternoon: "ex : analyse, rédaction, coordination avec les parties prenantes...",
    endOfDay: "ex : clôture des actions, relances, préparation du lendemain...",
    monday: "ex : cadrage de la semaine, arbitrage des priorités, alignement des équipes...",
    friday: "ex : consolidation, bilan d’avancement, handover, reporting...",
    month: "ex : reporting mensuel, clôture, suivi des indicateurs, revues de performance...",
    quarter: "ex : comités, revues stratégiques, ajustements de feuille de route...",
    year: "ex : planification annuelle, budget, revue des objectifs, montée en compétences...",
    travel: "ex : coordination multi-sites, ateliers, préparation des visites ou missions terrain...",
  },
  constraints: {
    confidentiality: 'ex : données internes, informations personnelles, contrats, éléments stratégiques...',
    regulations: 'ex : règles internes, RGPD, normes métier, exigences groupe ou clients...',
    systems: 'ex : ERP, CRM, GED, outils internes, messagerie, portail documentaire...',
    policy: "ex : politique d'usage IA à définir, validation DSI/RSSI, journalisation requise...",
    calendar: "ex : périodes de pointe, clôtures, campagnes, calendriers d'audit ou d'activité...",
  },
  vision: {
    delegate: 'ex : tri des demandes, préparation de synthèses, brouillons de réponses, reporting récurrent...',
    human: "ex : relation client, arbitrage, validation finale, négociation, conduite du changement...",
    deployment: "ex : commencer par un pilote sur l'équipe principale puis étendre aux autres entités...",
    kpis: "ex : temps gagné, baisse des erreurs, délai de réponse, satisfaction interne ou client...",
  },
};

export const competencyDomains: CompetencyDomainProfile[] = [
  {
    ...genericProfile,
    key: 'assistant-secretariat',
    label: 'Assistantat & Secrétariat',
    summary: "Optimiser l'agenda, les communications et la préparation documentaire de la direction.",
    workloadCategories: [
      'Agenda & planification',
      'Emails, appels & filtrage',
      'Préparation de documents',
      'Comptes rendus & suivi',
      'Coordination interne',
      'Support direction',
      'Organisation logistique',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Emails / demandes traités par jour',
      meetings: 'Réunions planifiées par semaine',
      reports: 'Comptes rendus / supports préparés par mois',
      sources: 'Canaux / outils suivis chaque semaine',
      dossiers: 'Dossiers administratifs traités par mois',
      missions: 'Événements / sujets suivis simultanément',
      lowValueHours: 'Heures de replanification / ressaisie par semaine',
    },
    taskGroups: [
      { title: 'B.1 — Agenda & réunions', tasks: [['Organisation des réunions et arbitrage agenda', 'Quotidienne', '4–6h/sem'], ['Préparation des ordres du jour et documents', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.2 — Courrier & comptes rendus', tasks: [['Tri des emails et rédaction de réponses', 'Quotidienne', '4–5h/sem'], ['Rédaction de comptes rendus de réunions', 'Hebdomadaire', '2–4h/sem']] },
      { title: 'B.3 — Coordination administrative', tasks: [['Suivi des demandes internes et relances', 'Quotidienne', '2–3h/sem'], ['Mise à jour des dossiers et fichiers partagés', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Support de direction', tasks: [['Préparation de présentations et notes', 'Hebdomadaire', '2–4h/sem'], ['Organisation logistique de déplacements / événements', 'Mensuelle', '3–4h/mois']] },
    ],
    automationIdeas: ['trier les emails et proposer des réponses', 'générer des comptes rendus structurés', 'préparer les checklists de réunion et de déplacement'],
  },
  {
    ...genericProfile,
    key: 'ressources-humaines',
    label: 'Ressources Humaines',
    summary: 'Structurer le recrutement, la gestion administrative RH et le suivi collaborateur.',
    workloadCategories: [
      'Recrutement',
      'Administration du personnel',
      'Paie & variables',
      'Formation & développement',
      'Relations sociales',
      'Reporting RH',
      'Gestion des talents',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes RH / emails traités par jour',
      meetings: 'Entretiens / réunions RH par semaine',
      reports: 'Rapports RH / tableaux de bord par mois',
      sources: 'SIRH / sources juridiques suivis par semaine',
      dossiers: 'Dossiers salariés / candidatures traités par mois',
      missions: 'Recrutements / projets RH en parallèle',
      lowValueHours: 'Heures de saisie / relances RH par semaine',
    },
    taskGroups: [
      { title: 'B.1 — Recrutement', tasks: [['Tri des candidatures et préqualification', 'Quotidienne', '3–5h/sem'], ['Planification des entretiens et suivi candidats', 'Hebdomadaire', '2–4h/sem']] },
      { title: 'B.2 — Administration RH', tasks: [['Préparation des contrats / avenants', 'Hebdomadaire', '2–3h/sem'], ['Suivi absences, congés et documents salariés', 'Quotidienne', '2–4h/sem']] },
      { title: 'B.3 — Formation & performance', tasks: [['Recueil des besoins de formation', 'Mensuelle', '2–3h/mois'], ['Suivi des objectifs et évaluations', 'Mensuelle', '3–4h/mois']] },
      { title: 'B.4 — Reporting & conformité RH', tasks: [['Mise à jour des indicateurs RH', 'Mensuelle', '2–3h/mois'], ['Veille réglementaire sociale', 'Hebdomadaire', '1–2h/sem']] },
    ],
    automationIdeas: ['préqualifier des CV et lettres de motivation', 'générer des drafts de contrats et communications RH', 'consolider les indicateurs RH automatiquement'],
  },
  {
    ...genericProfile,
    key: 'marketing-communication',
    label: 'Marketing & Communication',
    summary: 'Accélérer la production de contenus, la coordination de campagnes et le pilotage de marque.',
    workloadCategories: [
      'Campagnes marketing',
      'Création de contenus',
      'Réseaux sociaux',
      'Veille marché & concurrence',
      'Événementiel',
      'Relations presse / partenaires',
      'Reporting de performance',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes / emails marketing traités par jour',
      meetings: 'Points campagne / créa par semaine',
      reports: 'Rapports / bilans campagne par mois',
      sources: 'Sources marché / analytics consultées par semaine',
      dossiers: 'Campagnes / contenus gérés par mois',
      missions: 'Projets / lancements en parallèle',
      lowValueHours: 'Heures de reformulation / adaptation de contenus',
    },
    taskGroups: [
      { title: 'B.1 — Production de contenus', tasks: [['Rédaction de posts, emails ou articles', 'Quotidienne', '4–6h/sem'], ['Déclinaison multi-formats des contenus', 'Hebdomadaire', '2–4h/sem']] },
      { title: 'B.2 — Gestion de campagnes', tasks: [['Planification et coordination des campagnes', 'Hebdomadaire', '3–4h/sem'], ['Suivi des validations créatives', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.3 — Veille & analyse', tasks: [['Analyse des performances et reporting', 'Hebdomadaire', '2–3h/sem'], ['Veille concurrentielle et tendances', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Relations externes', tasks: [['Coordination avec agences / médias', 'Hebdomadaire', '2–3h/sem'], ['Préparation d’événements / lancements', 'Mensuelle', '3–5h/mois']] },
    ],
    automationIdeas: ['générer des variantes de contenus adaptées aux canaux', 'produire des synthèses de performance de campagne', 'créer des briefs et calendriers éditoriaux'],
  },
  {
    ...genericProfile,
    key: 'finance-comptabilite',
    label: 'Finance & Comptabilité',
    summary: 'Fluidifier la clôture, les contrôles, la production comptable et le reporting financier.',
    workloadCategories: [
      'Clôture & comptabilisation',
      'Rapprochements & contrôles',
      'Reporting financier',
      'Facturation & recouvrement',
      'Trésorerie',
      'Analyse budgétaire',
      'Conformité fiscale',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Emails / demandes comptables traités par jour',
      meetings: 'Points clôture / finance par semaine',
      reports: 'États / reportings produits par mois',
      sources: 'Sources comptables / fiscales consultées par semaine',
      dossiers: 'Pièces / dossiers financiers traités par mois',
      missions: 'Clôtures / projets financiers en parallèle',
      lowValueHours: 'Heures de ressaisie / rapprochement manuel',
    },
    taskGroups: [
      { title: 'B.1 — Comptabilisation & clôture', tasks: [['Saisie / contrôle des écritures', 'Quotidienne', '4–6h/sem'], ['Préparation de la clôture mensuelle', 'Mensuelle', '4–6h/mois']] },
      { title: 'B.2 — Contrôles & rapprochements', tasks: [['Rapprochements bancaires et analytiques', 'Hebdomadaire', '3–4h/sem'], ['Contrôles de cohérence et justification des comptes', 'Hebdomadaire', '3–4h/sem']] },
      { title: 'B.3 — Reporting & analyse', tasks: [['Production de reportings financiers', 'Mensuelle', '3–5h/mois'], ['Analyse des écarts budget / réalisé', 'Mensuelle', '2–4h/mois']] },
      { title: 'B.4 — Fiscalité & support', tasks: [['Préparation des déclarations et pièces fiscales', 'Mensuelle', '2–3h/mois'], ['Réponse aux demandes internes / auditeurs', 'Hebdomadaire', '2–3h/sem']] },
    ],
    automationIdeas: ['contrôler automatiquement les anomalies comptables', 'préparer des brouillons de commentaires de clôture', 'réconcilier et catégoriser les pièces justificatives'],
  },
  {
    ...genericProfile,
    key: 'juridique-conformite',
    label: 'Juridique & Conformité',
    summary: 'Renforcer la veille, la revue documentaire et la traçabilité des obligations de conformité.',
    workloadCategories: [
      'Veille réglementaire',
      'Revue contractuelle',
      'Conformité & contrôle',
      'Avis juridiques',
      'Contentieux / incidents',
      'Politiques & procédures',
      'Reporting & gouvernance',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes juridiques / conformité par jour',
      meetings: 'Comités / points conformité par semaine',
      reports: 'Notes / rapports de conformité par mois',
      sources: 'Sources juridiques consultées par semaine',
      dossiers: 'Contrats / dossiers traités par mois',
      missions: 'Revues / projets de conformité simultanés',
      lowValueHours: 'Heures de revue répétitive de documents',
    },
    taskGroups: [
      { title: 'B.1 — Veille & obligations', tasks: [['Lecture et qualification des nouveautés réglementaires', 'Hebdomadaire', '3–4h/sem'], ['Mise à jour du registre des obligations', 'Mensuelle', '2–3h/mois']] },
      { title: 'B.2 — Contrats & avis', tasks: [['Revue de contrats et clauses sensibles', 'Hebdomadaire', '3–5h/sem'], ['Rédaction de notes / avis juridiques', 'Hebdomadaire', '2–4h/sem']] },
      { title: 'B.3 — Contrôle conformité', tasks: [['Contrôles de niveau 1 / 2 et collecte de preuves', 'Hebdomadaire', '3–4h/sem'], ['Suivi des plans d’action de conformité', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Gouvernance & reporting', tasks: [['Préparation des comités et reporting', 'Mensuelle', '3–4h/mois'], ['Mise à jour des politiques / procédures', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['résumer des textes réglementaires et contrats', 'détecter les clauses à risque', 'préparer des tableaux de suivi des obligations et actions'],
  },
  {
    ...genericProfile,
    key: 'service-client',
    label: 'Service Client',
    summary: 'Réduire les délais de réponse, homogénéiser les réponses et mieux piloter la satisfaction client.',
    workloadCategories: [
      'Réponses clients',
      'Gestion des incidents',
      'Suivi des tickets',
      'Documentation / base de connaissance',
      'Escalade interne',
      'Reporting qualité',
      'Fidélisation / satisfaction',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes / tickets traités par jour',
      meetings: 'Points service / qualité par semaine',
      reports: 'Rapports de satisfaction / qualité par mois',
      sources: 'Bases de connaissance consultées par semaine',
      dossiers: 'Tickets / réclamations traités par mois',
      missions: 'Files / campagnes de support simultanées',
      lowValueHours: 'Heures de réponses répétitives par semaine',
    },
    taskGroups: [
      { title: 'B.1 — Traitement client', tasks: [['Réponse aux demandes entrantes', 'Quotidienne', '5–7h/sem'], ['Qualification et routage des tickets', 'Quotidienne', '3–4h/sem']] },
      { title: 'B.2 — Incidents & réclamations', tasks: [['Analyse des réclamations et priorisation', 'Hebdomadaire', '2–4h/sem'], ['Suivi des tickets en retard et escalades', 'Quotidienne', '2–3h/sem']] },
      { title: 'B.3 — Qualité & amélioration', tasks: [['Mise à jour de la base de connaissances', 'Hebdomadaire', '2–3h/sem'], ['Synthèse des irritants clients', 'Mensuelle', '2–3h/mois']] },
      { title: 'B.4 — Reporting & pilotage', tasks: [['Suivi des SLA / KPI service client', 'Hebdomadaire', '2–3h/sem'], ['Préparation des revues de satisfaction', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['proposer des réponses standardisées personnalisées', 'résumer les tickets pour accélérer les escalades', 'détecter les motifs récurrents de réclamation'],
  },
  {
    ...genericProfile,
    key: 'data-analyse',
    label: 'Data & Analyse',
    summary: 'Structurer la collecte, le nettoyage, l’analyse et la restitution de données à forte valeur.',
    workloadCategories: [
      'Collecte de données',
      'Nettoyage & préparation',
      'Analyse exploratoire',
      'Modélisation / scoring',
      'Data visualisation',
      'Documentation & qualité',
      'Support métier',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes d’analyse / data par jour',
      meetings: 'Ateliers / revues d’analyse par semaine',
      reports: 'Dashboards / rapports livrés par mois',
      sources: 'Sources de données exploitées par semaine',
      dossiers: 'Jeux de données / analyses traités par mois',
      missions: 'Use cases / études en parallèle',
      lowValueHours: 'Heures de nettoyage ou préparation manuelle',
    },
    taskGroups: [
      { title: 'B.1 — Préparation de données', tasks: [['Extraction et consolidation multi-sources', 'Hebdomadaire', '4–6h/sem'], ['Nettoyage et normalisation des datasets', 'Hebdomadaire', '3–5h/sem']] },
      { title: 'B.2 — Analyse & restitution', tasks: [['Analyse exploratoire et interprétation', 'Hebdomadaire', '3–4h/sem'], ['Production de dashboards / visualisations', 'Hebdomadaire', '2–4h/sem']] },
      { title: 'B.3 — Qualité & documentation', tasks: [['Documentation des hypothèses et méthodes', 'Hebdomadaire', '1–2h/sem'], ['Contrôle qualité des données / résultats', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Support aux métiers', tasks: [['Réponse aux demandes d’analyse ad hoc', 'Hebdomadaire', '2–4h/sem'], ['Préparation de recommandations pour les décideurs', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['décrire automatiquement un dataset et ses anomalies', 'générer des premières analyses narratives', 'documenter les transformations et visualisations'],
  },
  {
    ...genericProfile,
    key: 'administration-gestion',
    label: 'Administration & Gestion',
    summary: 'Réduire les tâches de suivi administratif, structurer les validations et fluidifier la coordination.',
    workloadCategories: [
      'Gestion administrative',
      'Suivi fournisseurs / achats',
      'Suivi budgétaire',
      'Coordination interne',
      'Gestion documentaire',
      'Reporting d’activité',
      'Appui opérationnel',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes administratives traitées par jour',
      meetings: 'Points de coordination par semaine',
      reports: 'Reportings / synthèses par mois',
      sources: 'Outils / référentiels suivis par semaine',
      dossiers: 'Dossiers administratifs traités par mois',
      missions: 'Sujets transverses suivis en parallèle',
      lowValueHours: 'Heures de saisie / contrôle documentaire',
    },
    taskGroups: [
      { title: 'B.1 — Processus administratifs', tasks: [['Préparation et vérification des dossiers', 'Quotidienne', '4–5h/sem'], ['Mise à jour des registres / bases', 'Quotidienne', '2–3h/sem']] },
      { title: 'B.2 — Achats & fournisseurs', tasks: [['Collecte des pièces et validations', 'Hebdomadaire', '2–3h/sem'], ['Suivi des demandes et relances', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.3 — Coordination & reporting', tasks: [['Préparation de synthèses d’activité', 'Hebdomadaire', '2–3h/sem'], ['Suivi des échéances administratives', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Amélioration continue', tasks: [['Mise à jour des procédures', 'Mensuelle', '2–3h/mois'], ['Suivi des plans d’amélioration', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['contrôler les dossiers incomplets', 'générer des relances et synthèses administratives', 'suivre les échéances et statuts automatiquement'],
  },
  {
    ...genericProfile,
    key: 'management-leadership',
    label: 'Management & Leadership',
    summary: 'Aider les managers à arbitrer, suivre la performance et orchestrer les équipes avec plus de clarté.',
    workloadCategories: [
      'Pilotage opérationnel',
      'Management d’équipe',
      'Décision & arbitrage',
      'Reporting exécutif',
      'Coordination transverse',
      'Développement des talents',
      'Transformation / projets',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes managériales / décisions par jour',
      meetings: 'Réunions d’équipe / comités par semaine',
      reports: 'Synthèses / reportings managériaux par mois',
      sources: 'Tableaux de bord / sources suivies par semaine',
      dossiers: 'Décisions / arbitrages suivis par mois',
      missions: 'Projets / chantiers stratégiques en parallèle',
      lowValueHours: 'Heures de reporting et consolidation manuelle',
    },
    taskGroups: [
      { title: 'B.1 — Pilotage quotidien', tasks: [['Préparation des points d’équipe', 'Hebdomadaire', '2–3h/sem'], ['Suivi des décisions et actions', 'Quotidienne', '2–3h/sem']] },
      { title: 'B.2 — Performance & reporting', tasks: [['Consolidation des KPI et faits marquants', 'Hebdomadaire', '2–4h/sem'], ['Préparation des reportings de direction', 'Mensuelle', '3–4h/mois']] },
      { title: 'B.3 — People management', tasks: [['Coaching, feedback et accompagnement', 'Hebdomadaire', '2–4h/sem'], ['Suivi charge / priorités de l’équipe', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Transformation', tasks: [['Cadrage et suivi des projets transverses', 'Hebdomadaire', '3–4h/sem'], ['Préparation des arbitrages stratégiques', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['préparer les briefs de décision', 'consolider les KPI et faits saillants', 'produire des plans d’action et synthèses d’équipe'],
  },
  {
    ...genericProfile,
    key: 'it-transformation-digitale',
    label: 'IT & Transformation Digitale',
    summary: 'Accélérer le run, la documentation, la priorisation des incidents et le cadrage des projets digitaux.',
    workloadCategories: [
      'Support / incidents',
      'Projets IT',
      'Architecture & intégration',
      'Sécurité & conformité',
      'Documentation technique',
      'Pilotage fournisseurs',
      'Formation utilisateurs',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Tickets / demandes IT traités par jour',
      meetings: 'Comités / ateliers IT par semaine',
      reports: 'Comptes rendus / reportings IT par mois',
      sources: 'Logs / outils / sources techniques par semaine',
      dossiers: 'Incidents / changements traités par mois',
      missions: 'Projets / chantiers IT en parallèle',
      lowValueHours: 'Heures de documentation ou tri manuel',
    },
    taskGroups: [
      { title: 'B.1 — Support & opérations', tasks: [['Qualification et tri des incidents', 'Quotidienne', '4–6h/sem'], ['Suivi des changements et mises en production', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.2 — Projets & cadrage', tasks: [['Rédaction d’expressions de besoin / specs', 'Hebdomadaire', '2–4h/sem'], ['Préparation des ateliers et comités projet', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.3 — Sécurité & conformité', tasks: [['Suivi des vulnérabilités / accès', 'Hebdomadaire', '2–3h/sem'], ['Mise à jour de la documentation de conformité', 'Mensuelle', '2–3h/mois']] },
      { title: 'B.4 — Documentation & adoption', tasks: [['Rédaction des procédures / runbooks', 'Hebdomadaire', '2–4h/sem'], ['Support aux utilisateurs et conduite du changement', 'Hebdomadaire', '2–3h/sem']] },
    ],
    automationIdeas: ['classifier les incidents et proposer des réponses', 'générer de la documentation technique', 'résumer les comptes rendus de projets et plans d’action'],
  },
  {
    ...genericProfile,
    key: 'formation-pedagogie',
    label: 'Formation & Pédagogie',
    summary: 'Industrialiser la préparation pédagogique, les évaluations et la personnalisation des parcours.',
    workloadCategories: [
      'Conception pédagogique',
      'Animation de sessions',
      'Évaluation des apprenants',
      'Suivi administratif',
      'Adaptation de contenus',
      'Veille pédagogique',
      'Reporting formation',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes / échanges pédagogiques par jour',
      meetings: 'Sessions / ateliers animés par semaine',
      reports: 'Bilans / évaluations produits par mois',
      sources: 'Sources pédagogiques consultées par semaine',
      dossiers: 'Parcours / apprenants suivis par mois',
      missions: 'Sessions / programmes en parallèle',
      lowValueHours: 'Heures de mise en forme / adaptation de contenus',
    },
    taskGroups: [
      { title: 'B.1 — Conception', tasks: [['Création ou adaptation de supports', 'Hebdomadaire', '4–6h/sem'], ['Préparation des séquences et objectifs pédagogiques', 'Hebdomadaire', '2–4h/sem']] },
      { title: 'B.2 — Animation & suivi', tasks: [['Animation de sessions et interactions', 'Hebdomadaire', '3–5h/sem'], ['Réponse aux questions des apprenants', 'Quotidienne', '2–3h/sem']] },
      { title: 'B.3 — Évaluation', tasks: [['Correction et analyse des évaluations', 'Hebdomadaire', '2–4h/sem'], ['Suivi individuel des progrès', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.4 — Pilotage formation', tasks: [['Reporting des sessions et satisfaction', 'Mensuelle', '2–3h/mois'], ['Mise à jour du catalogue / calendrier', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['générer des plans de cours et quiz', 'adapter des supports à plusieurs niveaux', 'résumer les feedbacks apprenants et résultats'],
  },
  {
    ...genericProfile,
    key: 'sante-bien-etre',
    label: 'Santé & Bien-être',
    summary: 'Sécuriser la documentation, fluidifier la coordination et libérer du temps de prise en charge ou d’accompagnement.',
    workloadCategories: [
      'Prise en charge / accompagnement',
      'Dossiers & traçabilité',
      'Planification',
      'Coordination pluridisciplinaire',
      'Prévention & suivi',
      'Veille réglementaire / qualité',
      'Reporting activité',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Demandes / suivis traités par jour',
      meetings: 'Réunions de coordination par semaine',
      reports: 'Comptes rendus / rapports par mois',
      sources: 'Protocoles / référentiels consultés par semaine',
      dossiers: 'Dossiers / bénéficiaires suivis par mois',
      missions: 'Programmes / prises en charge simultanés',
      lowValueHours: 'Heures de saisie / traçabilité manuelle',
    },
    taskGroups: [
      { title: 'B.1 — Suivi opérationnel', tasks: [['Mise à jour des dossiers et observations', 'Quotidienne', '4–5h/sem'], ['Planification des rendez-vous / interventions', 'Quotidienne', '2–3h/sem']] },
      { title: 'B.2 — Coordination', tasks: [['Partage d’informations avec les parties prenantes', 'Hebdomadaire', '2–3h/sem'], ['Préparation des réunions de suivi', 'Hebdomadaire', '1–2h/sem']] },
      { title: 'B.3 — Prévention & qualité', tasks: [['Suivi des indicateurs qualité / sécurité', 'Mensuelle', '2–3h/mois'], ['Mise à jour des protocoles et bonnes pratiques', 'Mensuelle', '2–3h/mois']] },
      { title: 'B.4 — Reporting', tasks: [['Production de synthèses d’activité', 'Mensuelle', '2–4h/mois'], ['Suivi des plans d’accompagnement', 'Hebdomadaire', '2–3h/sem']] },
    ],
    automationIdeas: ['structurer les comptes rendus et observations', 'préparer les synthèses de suivi', 'planifier et relancer les rendez-vous de manière assistée'],
  },
  {
    ...genericProfile,
    key: 'diplomatie-affaires-internationales',
    label: 'Diplomatie & Affaires Internationales',
    summary: 'Accélérer la veille géopolitique, la préparation de notes et la coordination multi-acteurs.',
    workloadCategories: [
      'Veille géopolitique',
      'Analyse & notes de synthèse',
      'Préparation de réunions / missions',
      'Coordination institutionnelle',
      'Suivi de partenariats',
      'Communication stratégique',
      'Reporting & représentation',
      'Autres activités',
    ],
    metricLabels: {
      emails: 'Télégrammes / messages traités par jour',
      meetings: 'Réunions / briefings par semaine',
      reports: 'Notes / synthèses produites par mois',
      sources: 'Sources internationales consultées par semaine',
      dossiers: 'Dossiers / pays / partenariats suivis par mois',
      missions: 'Missions / négociations en parallèle',
      lowValueHours: 'Heures de synthèse manuelle et reformatage',
    },
    taskGroups: [
      { title: 'B.1 — Veille & analyse', tasks: [['Collecte et tri des informations internationales', 'Quotidienne', '4–6h/sem'], ['Rédaction de notes et points de situation', 'Hebdomadaire', '3–5h/sem']] },
      { title: 'B.2 — Coordination diplomatique', tasks: [['Préparation des réunions bilatérales / multilatérales', 'Hebdomadaire', '2–4h/sem'], ['Suivi des engagements et correspondances', 'Hebdomadaire', '2–3h/sem']] },
      { title: 'B.3 — Missions & représentation', tasks: [['Préparation des dossiers de mission', 'Mensuelle', '3–4h/mois'], ['Consolidation des comptes rendus de mission', 'Mensuelle', '2–3h/mois']] },
      { title: 'B.4 — Pilotage & reporting', tasks: [['Suivi des partenariats / programmes', 'Mensuelle', '2–4h/mois'], ['Préparation des reportings exécutifs', 'Mensuelle', '2–3h/mois']] },
    ],
    automationIdeas: ['résumer rapidement des sources internationales', 'préparer des notes diplomatiques structurées', 'consolider les comptes rendus et suivis d’engagements'],
  },
];

const profileMap = new Map(competencyDomains.map((profile) => [profile.key, profile]));

export function getCompetencyDomainProfile(domainKey?: string): CompetencyDomainProfile {
  if (!domainKey) return genericProfile;
  return profileMap.get(domainKey) || genericProfile;
}

export function buildDomainAutomationBlueprint(formData: FormData) {
  const profile = getCompetencyDomainProfile(formData.c_domaine);
  const role = formData.c_poste?.trim() || profile.label;
  const associatedDomains = formData.c_domaines_associes?.trim();

  const title = associatedDomains
    ? `Trame IA pour ${role} (${profile.label} + domaines associés)`
    : `Trame IA pour ${role}`;

  const recommendation = `${profile.summary} L'automatisation doit prioriser ${profile.automationIdeas
    .slice(0, 2)
    .join(' et ')}.`;

  return {
    title,
    recommendation,
    priorityAreas: profile.workloadCategories.slice(0, 4),
    automationIdeas: profile.automationIdeas,
  };
}
