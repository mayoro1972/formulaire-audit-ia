import { ArrowUpRight, CheckCircle2, Clock3, Globe2, Mail, Shield, Sparkles, Target, Workflow } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { getSupabaseFunctionHeaders, getSupabaseFunctionUrl, isSupabaseConfigured, supabaseConfigMessage } from '../lib/supabase';

type Language = 'fr' | 'en' | 'es';
type FieldType = 'text' | 'textarea' | 'select';

interface CopyMap {
  fr: string;
  en: string;
  es: string;
}

interface FieldDefinition {
  id: string;
  type: FieldType;
  label: CopyMap;
  placeholder?: CopyMap;
  options?: CopyMap[];
  defaultValue?: CopyMap;
  wide?: boolean;
}

interface SectionDefinition {
  id: string;
  eyebrow: CopyMap;
  title: CopyMap;
  fields: FieldDefinition[];
}

const recipientEmail = 'contact@transferai.ci';

const pageCopy = {
  brand: {
    fr: 'TransferAI',
    en: 'TransferAI',
    es: 'TransferAI',
  },
  languageLabel: {
    fr: 'Langue',
    en: 'Language',
    es: 'Idioma',
  },
  pagePill: {
    fr: 'Formulaire de préparation à l’audit',
    en: 'Audit preparation form',
    es: 'Formulario de preparación para auditoría',
  },
  pageTitle: {
    fr: 'Préparez votre visite d’audit en quelques minutes',
    en: 'Prepare your audit visit in just a few minutes',
    es: 'Prepare su visita de auditoría en solo unos minutos',
  },
  pageIntro: {
    fr: "Merci de renseigner ce formulaire avant notre rencontre. Vos réponses aideront notre équipe à préparer un audit plus ciblé, plus fluide et plus utile pour votre organisation.",
    en: 'Please complete this form before our meeting. Your answers will help our team prepare a more focused, smoother and more useful audit for your organization.',
    es: 'Por favor complete este formulario antes de nuestra reunión. Sus respuestas ayudarán a nuestro equipo a preparar una auditoría más enfocada, más fluida y más útil para su organización.',
  },
  pageSecondary: {
    fr: "Vous pouvez le remplir à votre rythme et nous l'envoyer avant la visite pour nous permettre de mieux préparer la rencontre.",
    en: 'You can complete it at your own pace and send it to us before the visit so we can prepare the meeting more effectively.',
    es: 'Puede completarlo a su ritmo y enviárnoslo antes de la visita para que podamos preparar mejor la reunión.',
  },
  openWindow: {
    fr: 'Ouvrir dans une fenêtre dédiée',
    en: 'Open in a dedicated window',
    es: 'Abrir en una ventana dedicada',
  },
  heroCards: [
    {
      icon: Clock3,
      title: {
        fr: '10 minutes environ',
        en: 'About 10 minutes',
        es: 'Aproximadamente 10 minutos',
      },
      text: {
        fr: 'Une version courte, pensée pour aller à l’essentiel avant la visite.',
        en: 'A short version designed to focus on what matters before the visit.',
        es: 'Una versión corta pensada para centrarse en lo esencial antes de la visita.',
      },
    },
    {
      icon: Workflow,
      title: {
        fr: 'Préparation ciblée',
        en: 'Focused preparation',
        es: 'Preparación enfocada',
      },
      text: {
        fr: 'Vos réponses orientent notre cadrage, nos questions et notre plan d’audit.',
        en: 'Your answers guide our framing, our questions and our audit plan.',
        es: 'Sus respuestas orientan nuestro enfoque, nuestras preguntas y nuestro plan de auditoría.',
      },
    },
    {
      icon: Mail,
      title: {
        fr: 'Envoi avant rencontre',
        en: 'Send before the meeting',
        es: 'Envío antes de la reunión',
      },
      text: {
        fr: `Le formulaire peut être transmis à ${recipientEmail} avant notre visite.`,
        en: `The form can be sent to ${recipientEmail} before our visit.`,
        es: `El formulario puede enviarse a ${recipientEmail} antes de nuestra visita.`,
      },
    },
  ],
  sidebarTitle: {
    fr: 'Votre synthèse de préparation',
    en: 'Your preparation summary',
    es: 'Su resumen de preparación',
  },
  sidebarFocus: {
    fr: 'Axe principal',
    en: 'Primary focus',
    es: 'Enfoque principal',
  },
  sidebarFocusValue: {
    fr: 'Service client multicanal',
    en: 'Multichannel customer service',
    es: 'Servicio al cliente multicanal',
  },
  sidebarOffer: {
    fr: 'Approche recommandée',
    en: 'Recommended approach',
    es: 'Enfoque recomendado',
  },
  sidebarOfferValue: {
    fr: "Préparation d’un audit ciblé, cadrage des quick wins et structuration d’un premier cas d’usage orienté réponses assistées et traitement des demandes récurrentes.",
    en: 'Preparation of a focused audit, framing of quick wins and structuring of a first use case centered on assisted responses and recurring request handling.',
    es: 'Preparación de una auditoría focalizada, definición de quick wins y estructuración de un primer caso de uso centrado en respuestas asistidas y tratamiento de solicitudes recurrentes.',
  },
  sidebarBenefits: {
    fr: 'Bénéfices attendus',
    en: 'Expected benefits',
    es: 'Beneficios esperados',
  },
  sidebarBenefitsValue: {
    fr: 'Meilleure homogénéité des réponses, délais plus courts et réduction des tâches de re-saisie.',
    en: 'More consistent responses, shorter turnaround times and less repetitive re-entry work.',
    es: 'Mayor coherencia en las respuestas, tiempos más cortos y menos tareas repetitivas de reingreso.',
  },
  sidebarChecklist: {
    fr: 'Ce que nous préparerons avec vos réponses',
    en: 'What we will prepare with your answers',
    es: 'Lo que prepararemos con sus respuestas',
  },
  sidebarChecklistItems: {
    fr: ['Les bonnes questions pour la visite', "Les cas d'usage prioritaires", 'Les quick wins les plus réalistes', 'Le bon périmètre de démarrage'],
    en: ['The right questions for the visit', 'The top priority use cases', 'The most realistic quick wins', 'The right starting scope'],
    es: ['Las preguntas correctas para la visita', 'Los casos de uso prioritarios', 'Los quick wins más realistas', 'El alcance inicial adecuado'],
  },
  sidebarSubmission: {
    fr: 'Transmission',
    en: 'Submission',
    es: 'Envío',
  },
  sidebarSubmissionValue: {
    fr: `Une fois complété, le formulaire pourra être envoyé à ${recipientEmail} pour nous permettre de préparer au mieux la rencontre.`,
    en: `Once completed, the form can be sent to ${recipientEmail} so we can prepare the meeting properly.`,
    es: `Una vez completado, el formulario podrá enviarse a ${recipientEmail} para que podamos preparar mejor la reunión.`,
  },
  focusExplanationTitle: {
    fr: 'Pourquoi ces questions complémentaires ?',
    en: 'Why these additional questions?',
    es: '¿Por qué estas preguntas adicionales?',
  },
  focusExplanationText: {
    fr: "Ces quelques questions nous aident à mieux comprendre votre contexte opérationnel exact, à confirmer le bon périmètre de départ et à préparer une visite d’audit plus utile pour votre équipe.",
    en: 'These additional questions help us better understand your exact operating context, confirm the right starting scope and prepare a more useful audit visit for your team.',
    es: 'Estas preguntas adicionales nos ayudan a comprender mejor su contexto operativo exacto, confirmar el alcance inicial adecuado y preparar una visita de auditoría más útil para su equipo.',
  },
  focusExplanationPoints: {
    fr: ['valider le bon périmètre métier', 'comprendre vos volumes réels', "préparer des recommandations plus pertinentes"],
    en: ['validate the right business scope', 'understand your real volumes', 'prepare more relevant recommendations'],
    es: ['validar el alcance de negocio adecuado', 'comprender sus volúmenes reales', 'preparar recomendaciones más pertinentes'],
  },
  sendSectionEyebrow: {
    fr: 'Étape finale',
    en: 'Final step',
    es: 'Paso final',
  },
  sendSectionTitle: {
    fr: 'Envoyez votre formulaire de préparation',
    en: 'Send your preparation form',
    es: 'Envíe su formulario de preparación',
  },
  sendSectionText: {
    fr: `Lorsque vous êtes prêt, envoyez vos réponses à ${recipientEmail}. Notre équipe pourra ainsi les relire avant la visite et mieux préparer l’audit.`,
    en: `When you are ready, send your answers to ${recipientEmail}. Our team will review them before the visit and prepare the audit more effectively.`,
    es: `Cuando esté listo, envíe sus respuestas a ${recipientEmail}. Nuestro equipo las revisará antes de la visita y preparará mejor la auditoría.`,
  },
  sendButton: {
    fr: 'Envoyer mes réponses',
    en: 'Send my answers',
    es: 'Enviar mis respuestas',
  },
  sendCardTitle: {
    fr: 'Ce que cet envoi nous permet de faire',
    en: 'What this submission allows us to do',
    es: 'Lo que este envío nos permite hacer',
  },
  sendCardItems: {
    fr: ['Préparer les questions utiles', 'Valider les hypothèses métier', 'Rendre la visite plus productive'],
    en: ['Prepare the right questions', 'Validate business hypotheses', 'Make the visit more productive'],
    es: ['Preparar las preguntas adecuadas', 'Validar las hipótesis de negocio', 'Hacer la visita más productiva'],
  },
  sendHintReady: {
    fr: `Votre email est prêt pour ${recipientEmail}. Vérifiez le message puis envoyez-le.`,
    en: `Your email draft is ready for ${recipientEmail}. Review it and send it when ready.`,
    es: `Su borrador de correo está listo para ${recipientEmail}. Revíselo y envíelo cuando esté listo.`,
  },
  sendHintMissing: {
    fr: "Merci de renseigner au minimum l'organisation, le nom et l'email du répondant avant l'envoi.",
    en: 'Please complete at least the organization name, respondent name and respondent email before sending.',
    es: 'Por favor complete al menos el nombre de la organización, el nombre y el correo electrónico de la persona que responde antes de enviar.',
  },
  sendInProgress: {
    fr: 'Envoi en cours...',
    en: 'Sending...',
    es: 'Envío en curso...',
  },
  responseIdLabel: {
    fr: 'Identifiant de suivi',
    en: 'Tracking ID',
    es: 'Identificador de seguimiento',
  },
  responseIdHelp: {
    fr: "Cet identifiant confirme que la réponse a bien été enregistrée dans notre circuit avant traitement par l'expert.",
    en: 'This identifier confirms that the response was recorded in our workflow before expert review.',
    es: 'Este identificador confirma que la respuesta se registró correctamente en nuestro flujo antes de la revisión del experto.',
  },
} as const;

const sections: SectionDefinition[] = [
  {
    id: 'identity',
    eyebrow: {
      fr: 'Bloc 1',
      en: 'Section 1',
      es: 'Bloque 1',
    },
    title: {
      fr: 'Votre contexte',
      en: 'Your context',
      es: 'Su contexto',
    },
    fields: [
      {
        id: 'organization_name',
        type: 'text',
        label: {
          fr: 'Organisation',
          en: 'Organization',
          es: 'Organización',
        },
        placeholder: {
          fr: "Nom de l'entreprise ou de l'institution",
          en: 'Company or institution name',
          es: 'Nombre de la empresa o institución',
        },
      },
      {
        id: 'decision_maker_name',
        type: 'text',
        label: {
          fr: 'Nom et prénom',
          en: 'Full name',
          es: 'Nombre y apellidos',
        },
        placeholder: {
          fr: 'Nom du répondant',
          en: 'Respondent name',
          es: 'Nombre de la persona que responde',
        },
      },
      {
        id: 'decision_maker_email',
        type: 'text',
        label: {
          fr: 'Email du répondant',
          en: 'Respondent email',
          es: 'Correo electrónico de la persona que responde',
        },
        placeholder: {
          fr: 'Adresse email professionnelle',
          en: 'Professional email address',
          es: 'Correo electrónico profesional',
        },
      },
      {
        id: 'role_title',
        type: 'text',
        label: {
          fr: 'Fonction',
          en: 'Role',
          es: 'Cargo',
        },
        placeholder: {
          fr: 'Votre poste actuel',
          en: 'Your current role',
          es: 'Su cargo actual',
        },
      },
      {
        id: 'team_scope',
        type: 'text',
        label: {
          fr: 'Équipe ou service concerné',
          en: 'Team or department concerned',
          es: 'Equipo o área involucrada',
        },
        placeholder: {
          fr: 'Service, direction ou équipe',
          en: 'Team, unit or department',
          es: 'Equipo, unidad o departamento',
        },
      },
      {
        id: 'sector_activity',
        type: 'text',
        label: {
          fr: "Secteur d'activité",
          en: 'Business sector',
          es: 'Sector de actividad',
        },
        placeholder: {
          fr: 'Votre secteur principal',
          en: 'Your main sector',
          es: 'Su sector principal',
        },
      },
      {
        id: 'country',
        type: 'text',
        label: {
          fr: 'Pays',
          en: 'Country',
          es: 'País',
        },
        placeholder: {
          fr: 'Pays principal',
          en: 'Main country',
          es: 'País principal',
        },
      },
      {
        id: 'website',
        type: 'text',
        label: {
          fr: 'Site web',
          en: 'Website',
          es: 'Sitio web',
        },
        placeholder: {
          fr: 'https://...',
          en: 'https://...',
          es: 'https://...',
        },
        wide: true,
      },
    ],
  },
  {
    id: 'priorities',
    eyebrow: {
      fr: 'Bloc 2',
      en: 'Section 2',
      es: 'Bloque 2',
    },
    title: {
      fr: 'Vos priorités métier',
      en: 'Your business priorities',
      es: 'Sus prioridades de negocio',
    },
    fields: [
      {
        id: 'priority_outcome',
        type: 'textarea',
        label: {
          fr: 'Quel résultat souhaitez-vous obtenir en priorité ?',
          en: 'What result do you want to achieve first?',
          es: '¿Qué resultado desea obtener en prioridad?',
        },
        placeholder: {
          fr: "Décrivez le résultat principal attendu",
          en: 'Describe the main outcome you expect',
          es: 'Describa el principal resultado esperado',
        },
        defaultValue: {
          fr: 'Réduire les délais de réponse tout en gardant une qualité homogène.',
          en: 'Reduce response times while keeping quality consistent.',
          es: 'Reducir los tiempos de respuesta manteniendo una calidad homogénea.',
        },
        wide: true,
      },
      {
        id: 'priority_1',
        type: 'text',
        label: {
          fr: 'Priorité 1',
          en: 'Priority 1',
          es: 'Prioridad 1',
        },
        placeholder: {
          fr: 'Votre priorité la plus urgente',
          en: 'Your most urgent priority',
          es: 'Su prioridad más urgente',
        },
      },
      {
        id: 'priority_2',
        type: 'text',
        label: {
          fr: 'Priorité 2',
          en: 'Priority 2',
          es: 'Prioridad 2',
        },
        placeholder: {
          fr: 'Deuxième priorité',
          en: 'Second priority',
          es: 'Segunda prioridad',
        },
      },
      {
        id: 'priority_3',
        type: 'text',
        label: {
          fr: 'Priorité 3',
          en: 'Priority 3',
          es: 'Prioridad 3',
        },
        placeholder: {
          fr: 'Troisième priorité',
          en: 'Third priority',
          es: 'Tercera prioridad',
        },
      },
      {
        id: 'main_pain_point',
        type: 'textarea',
        label: {
          fr: "Quel irritant vous pénalise le plus aujourd'hui ?",
          en: 'What is the main friction slowing you down today?',
          es: '¿Cuál es la principal fricción que le penaliza hoy?',
        },
        placeholder: {
          fr: 'Décrivez le problème le plus pénalisant',
          en: 'Describe the most costly issue',
          es: 'Describa el problema más costoso',
        },
        defaultValue: {
          fr: 'Les demandes arrivent sur plusieurs canaux et les équipes reformulent souvent les mêmes réponses.',
          en: 'Requests come through multiple channels and teams often rewrite the same answers.',
          es: 'Las solicitudes llegan por varios canales y los equipos reformulan con frecuencia las mismas respuestas.',
        },
        wide: true,
      },
    ],
  },
  {
    id: 'operations',
    eyebrow: {
      fr: 'Bloc 3',
      en: 'Section 3',
      es: 'Bloque 3',
    },
    title: {
      fr: 'Vos opérations au quotidien',
      en: 'Your day-to-day operations',
      es: 'Sus operaciones diarias',
    },
    fields: [
      {
        id: 'repetitive_tasks',
        type: 'textarea',
        label: {
          fr: 'Quelles sont les 3 à 5 tâches les plus répétitives ?',
          en: 'What are the 3 to 5 most repetitive tasks?',
          es: '¿Cuáles son las 3 a 5 tareas más repetitivas?',
        },
        placeholder: {
          fr: 'Décrivez les tâches qui reviennent le plus souvent',
          en: 'Describe the tasks that come back most often',
          es: 'Describa las tareas que se repiten con mayor frecuencia',
        },
        defaultValue: {
          fr: 'Tri des demandes, qualification, réponse standard, escalade et relance des dossiers en attente.',
          en: 'Request triage, qualification, standard response, escalation and follow-up on pending cases.',
          es: 'Clasificación de solicitudes, calificación, respuesta estándar, escalado y seguimiento de casos pendientes.',
        },
        wide: true,
      },
      {
        id: 'weekly_volume',
        type: 'text',
        label: {
          fr: 'Volume traité par semaine',
          en: 'Weekly volume handled',
          es: 'Volumen tratado por semana',
        },
        placeholder: {
          fr: 'Nombre de dossiers, demandes ou tickets',
          en: 'Number of cases, requests or tickets',
          es: 'Número de casos, solicitudes o tickets',
        },
      },
      {
        id: 'current_delays',
        type: 'text',
        label: {
          fr: 'Délais actuels moyens',
          en: 'Current average turnaround time',
          es: 'Plazos actuales promedio',
        },
        placeholder: {
          fr: 'Temps moyen de traitement ou de réponse',
          en: 'Average processing or response time',
          es: 'Tiempo medio de tratamiento o respuesta',
        },
      },
      {
        id: 'manual_steps',
        type: 'textarea',
        label: {
          fr: 'Quelles étapes restent très manuelles ?',
          en: 'Which steps are still highly manual?',
          es: '¿Qué etapas siguen siendo muy manuales?',
        },
        placeholder: {
          fr: 'Décrivez les étapes manuelles les plus lourdes',
          en: 'Describe the heaviest manual steps',
          es: 'Describa las etapas manuales más pesadas',
        },
        defaultValue: {
          fr: 'Relecture des messages, enrichissement manuel du CRM et synthèse hebdomadaire.',
          en: 'Message review, manual CRM enrichment and weekly synthesis.',
          es: 'Relectura de mensajes, enriquecimiento manual del CRM y síntesis semanal.',
        },
        wide: true,
      },
    ],
  },
  {
    id: 'tools',
    eyebrow: {
      fr: 'Bloc 4',
      en: 'Section 4',
      es: 'Bloque 4',
    },
    title: {
      fr: 'Outils et données',
      en: 'Tools and data',
      es: 'Herramientas y datos',
    },
    fields: [
      {
        id: 'current_tools',
        type: 'textarea',
        label: {
          fr: "Quels outils utilisez-vous aujourd'hui ?",
          en: 'Which tools are you using today?',
          es: '¿Qué herramientas utiliza hoy?',
        },
        placeholder: {
          fr: 'Listez les outils principaux',
          en: 'List the main tools',
          es: 'Liste las herramientas principales',
        },
        defaultValue: {
          fr: 'Zendesk, Outlook, WhatsApp Business, Excel et CRM interne.',
          en: 'Zendesk, Outlook, WhatsApp Business, Excel and internal CRM.',
          es: 'Zendesk, Outlook, WhatsApp Business, Excel y CRM interno.',
        },
        wide: true,
      },
      {
        id: 'data_types',
        type: 'textarea',
        label: {
          fr: 'Quelles données ou quels documents manipulez-vous ?',
          en: 'What data or documents do you handle?',
          es: '¿Qué datos o documentos maneja?',
        },
        placeholder: {
          fr: 'Décrivez les données ou documents concernés',
          en: 'Describe the relevant data or documents',
          es: 'Describa los datos o documentos relevantes',
        },
        defaultValue: {
          fr: 'Messages entrants, historique client, pièces justificatives et notes de traitement.',
          en: 'Incoming messages, customer history, supporting files and processing notes.',
          es: 'Mensajes entrantes, historial del cliente, documentos de respaldo y notas de tratamiento.',
        },
      },
      {
        id: 'sensitive_data_constraints',
        type: 'textarea',
        label: {
          fr: 'Quelles données sont sensibles ou confidentielles ?',
          en: 'Which data is sensitive or confidential?',
          es: '¿Qué datos son sensibles o confidenciales?',
        },
        placeholder: {
          fr: 'Précisez les éléments à protéger en priorité',
          en: 'Specify what must be protected first',
          es: 'Indique qué debe protegerse en prioridad',
        },
        defaultValue: {
          fr: 'Coordonnées clients, historique de réclamations et données contractuelles.',
          en: 'Customer contact details, complaint history and contract data.',
          es: 'Datos de contacto de clientes, historial de reclamaciones y datos contractuales.',
        },
      },
      {
        id: 'desired_integrations',
        type: 'textarea',
        label: {
          fr: 'Quelles intégrations seraient utiles ?',
          en: 'Which integrations would be useful?',
          es: '¿Qué integraciones serían útiles?',
        },
        placeholder: {
          fr: 'Décrivez les outils à relier',
          en: 'Describe the tools to connect',
          es: 'Describa las herramientas a conectar',
        },
        defaultValue: {
          fr: 'CRM client, base de connaissance et outil de ticketing.',
          en: 'Customer CRM, knowledge base and ticketing system.',
          es: 'CRM de clientes, base de conocimiento y herramienta de tickets.',
        },
      },
    ],
  },
  {
    id: 'adoption',
    eyebrow: {
      fr: 'Bloc 5',
      en: 'Section 5',
      es: 'Bloque 5',
    },
    title: {
      fr: 'Formation et adoption',
      en: 'Training and adoption',
      es: 'Formación y adopción',
    },
    fields: [
      {
        id: 'ai_maturity_level',
        type: 'select',
        label: {
          fr: 'Avez-vous déjà testé des outils IA ?',
          en: 'Have you already tested AI tools?',
          es: '¿Ya ha probado herramientas de IA?',
        },
        options: [
          {
            fr: 'Jamais',
            en: 'Never',
            es: 'Nunca',
          },
          {
            fr: 'Un peu',
            en: 'A little',
            es: 'Un poco',
          },
          {
            fr: 'Régulièrement',
            en: 'Regularly',
            es: 'Con regularidad',
          },
          {
            fr: 'Équipe déjà outillée',
            en: 'Team already equipped',
            es: 'Equipo ya equipado',
          },
        ],
        defaultValue: {
          fr: 'Un peu',
          en: 'A little',
          es: 'Un poco',
        },
      },
      {
        id: 'desired_use_case_family',
        type: 'select',
        label: {
          fr: 'Quel usage vous intéresse le plus ?',
          en: 'Which use case interests you the most?',
          es: '¿Qué caso de uso le interesa más?',
        },
        options: [
          {
            fr: 'Gagner du temps',
            en: 'Save time',
            es: 'Ahorrar tiempo',
          },
          {
            fr: 'Mieux répondre',
            en: 'Respond better',
            es: 'Responder mejor',
          },
          {
            fr: 'Mieux analyser',
            en: 'Analyze better',
            es: 'Analizar mejor',
          },
          {
            fr: 'Mieux documenter',
            en: 'Document better',
            es: 'Documentar mejor',
          },
          {
            fr: 'Mieux former',
            en: 'Train better',
            es: 'Formar mejor',
          },
        ],
        defaultValue: {
          fr: 'Mieux répondre',
          en: 'Respond better',
          es: 'Responder mejor',
        },
      },
      {
        id: 'training_expectations',
        type: 'textarea',
        label: {
          fr: "Quel type d'accompagnement attendez-vous ?",
          en: 'What type of support are you expecting?',
          es: '¿Qué tipo de acompañamiento espera?',
        },
        placeholder: {
          fr: 'Audit, prototype, formation, accompagnement...',
          en: 'Audit, prototype, training, support...',
          es: 'Auditoría, prototipo, formación, acompañamiento...',
        },
        defaultValue: {
          fr: "Un audit ciblé puis un prototype simple avant formation de l'équipe.",
          en: 'A focused audit followed by a simple prototype before team training.',
          es: 'Una auditoría focalizada seguida de un prototipo simple antes de formar al equipo.',
        },
        wide: true,
      },
    ],
  },
  {
    id: 'goals',
    eyebrow: {
      fr: 'Bloc 6',
      en: 'Section 6',
      es: 'Bloque 6',
    },
    title: {
      fr: 'Objectif à 3 mois',
      en: '3-month objective',
      es: 'Objetivo a 3 meses',
    },
    fields: [
      {
        id: 'quick_win_90_days',
        type: 'textarea',
        label: {
          fr: 'Quel quick win attendez-vous sous 90 jours ?',
          en: 'What quick win do you expect within 90 days?',
          es: '¿Qué quick win espera en 90 días?',
        },
        placeholder: {
          fr: 'Décrivez un premier résultat concret',
          en: 'Describe a first concrete result',
          es: 'Describa un primer resultado concreto',
        },
        defaultValue: {
          fr: "Avoir un premier assistant de réponse et de synthèse pour les demandes récurrentes.",
          en: 'Have a first response and synthesis assistant for recurring requests.',
          es: 'Tener un primer asistente de respuesta y síntesis para solicitudes recurrentes.',
        },
        wide: true,
      },
      {
        id: 'success_kpi',
        type: 'text',
        label: {
          fr: 'Comment mesurerez-vous le succès ?',
          en: 'How will you measure success?',
          es: '¿Cómo medirá el éxito?',
        },
        placeholder: {
          fr: 'Indicateur principal de succès',
          en: 'Main success metric',
          es: 'Indicador principal de éxito',
        },
      },
      {
        id: 'internal_sponsor',
        type: 'text',
        label: {
          fr: 'Qui doit valider ou sponsoriser le projet ?',
          en: 'Who needs to validate or sponsor the project?',
          es: '¿Quién debe validar o patrocinar el proyecto?',
        },
        placeholder: {
          fr: 'Nom ou fonction du sponsor',
          en: 'Sponsor name or role',
          es: 'Nombre o cargo del patrocinador',
        },
      },
    ],
  },
];

const focusSection: SectionDefinition = {
  id: 'focus',
  eyebrow: {
    fr: 'Complément métier',
    en: 'Business focus',
    es: 'Enfoque de negocio',
  },
  title: {
    fr: 'Questions spécifiques à votre contexte',
    en: 'Questions specific to your context',
    es: 'Preguntas específicas para su contexto',
  },
  fields: [
    {
      id: 'focus_channels',
      type: 'select',
      label: {
        fr: "Quels canaux traitez-vous aujourd'hui ?",
        en: 'Which channels are you handling today?',
        es: '¿Qué canales está gestionando hoy?',
      },
      options: [
        {
          fr: 'Email',
          en: 'Email',
          es: 'Correo electrónico',
        },
        {
          fr: 'WhatsApp',
          en: 'WhatsApp',
          es: 'WhatsApp',
        },
        {
          fr: 'Téléphone',
          en: 'Phone',
          es: 'Teléfono',
        },
        {
          fr: 'CRM',
          en: 'CRM',
          es: 'CRM',
        },
        {
          fr: 'Mix de plusieurs canaux',
          en: 'A mix of several channels',
          es: 'Una combinación de varios canales',
        },
      ],
      defaultValue: {
        fr: 'Mix de plusieurs canaux',
        en: 'A mix of several channels',
        es: 'Una combinación de varios canales',
      },
    },
    {
      id: 'focus_ticket_volume',
      type: 'text',
      label: {
        fr: 'Combien de demandes ou tickets traitez-vous par semaine ?',
        en: 'How many requests or tickets do you handle per week?',
        es: '¿Cuántas solicitudes o tickets gestiona por semana?',
      },
      placeholder: {
        fr: 'Volume estimé hebdomadaire',
        en: 'Estimated weekly volume',
        es: 'Volumen semanal estimado',
      },
    },
    {
      id: 'focus_target_delay',
      type: 'text',
      label: {
        fr: 'Quel délai souhaitez-vous améliorer en priorité ?',
        en: 'Which response time do you want to improve first?',
        es: '¿Qué plazo desea mejorar en prioridad?',
      },
      placeholder: {
        fr: 'Délai cible',
        en: 'Target turnaround time',
        es: 'Plazo objetivo',
      },
    },
  ],
};

function translate(value: CopyMap, language: Language) {
  return value[language];
}

function Field({
  field,
  language,
}: {
  field: FieldDefinition;
  language: Language;
}) {
  const wideClass = field.wide ? 'md:col-span-2' : '';
  const label = translate(field.label, language);
  const placeholder = field.placeholder ? translate(field.placeholder, language) : '';
  const defaultValue = field.defaultValue ? translate(field.defaultValue, language) : '';

  if (field.type === 'textarea') {
    return (
      <div className={wideClass}>
        <label className="mb-2 block">{label}</label>
        <textarea
          name={field.id}
          rows={4}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    const options = field.options ?? [];
    const defaultOption = defaultValue || (options[0] ? translate(options[0], language) : '');

    return (
      <div className={wideClass}>
        <label className="mb-2 block">{label}</label>
        <select name={field.id} defaultValue={defaultOption}>
          {options.map((option) => {
            const optionLabel = translate(option, language);
            return (
              <option key={optionLabel} value={optionLabel}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return (
    <div className={wideClass}>
      <label className="mb-2 block">{label}</label>
      <input
        name={field.id}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export default function ProspectSimpleAuditFormPreviewPage() {
  const [language, setLanguage] = useState<Language>('fr');
  const [sendHint, setSendHint] = useState('');
  const [sendState, setSendState] = useState<'idle' | 'success' | 'error'>('idle');
  const [sending, setSending] = useState(false);
  const [savedResponseId, setSavedResponseId] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  const currentUrl = `${window.location.origin}${window.location.pathname}?preview=prospect-simple-audit`;

  const fieldLabels = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    [...sections, focusSection].forEach((section) => {
      section.fields.forEach((field) => {
        map[field.id] = translate(field.label, language);
      });
    });
    return map;
  }, [language]);

  const openDedicatedWindow = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const buildSubmissionBody = (formData: FormData) => {
    const lines: string[] = [];

    const introByLanguage: Record<Language, string[]> = {
      fr: [
        'Bonjour,',
        '',
        "Veuillez trouver ci-dessous le formulaire de préparation rempli avant notre visite d'audit.",
        '',
        `Axe principal : ${pageCopy.sidebarFocusValue.fr}`,
        '',
        'Réponses du prospect :',
      ],
      en: [
        'Hello,',
        '',
        'Please find below the completed preparation form submitted before our audit visit.',
        '',
        `Primary focus: ${pageCopy.sidebarFocusValue.en}`,
        '',
        'Prospect answers:',
      ],
      es: [
        'Hola,',
        '',
        'A continuación encontrará el formulario de preparación completado antes de nuestra visita de auditoría.',
        '',
        `Enfoque principal: ${pageCopy.sidebarFocusValue.es}`,
        '',
        'Respuestas del prospecto:',
      ],
    };

    lines.push(...introByLanguage[language]);

    for (const [key, raw] of formData.entries()) {
      const value = String(raw).trim();
      if (!value) continue;
      lines.push(`- ${fieldLabels[key] || key}: ${value}`);
    }

    const closingByLanguage: Record<Language, string[]> = {
      fr: ['', 'Cordialement,'],
      en: ['', 'Best regards,'],
      es: ['', 'Saludos cordiales,'],
    };

    lines.push(...closingByLanguage[language]);

    return lines.join('\n');
  };

  const handleSend = () => {
    void (async () => {
      if (!formRef.current) return;

      const browserFormData = new FormData(formRef.current);
      const organization = String(browserFormData.get('organization_name') || '').trim();
      const respondent = String(browserFormData.get('decision_maker_name') || '').trim();
      const respondentEmail = String(browserFormData.get('decision_maker_email') || '').trim();

      if (!organization || !respondent || !respondentEmail) {
        setSendState('error');
        setSendHint(pageCopy.sendHintMissing[language]);
        setSavedResponseId('');
        return;
      }

      const normalizedFormData: Record<string, string> = {
        c_nom: respondent,
        c_email: respondentEmail,
        c_poste: String(browserFormData.get('role_title') || '').trim(),
        c_entite: organization,
        c_domaine: String(browserFormData.get('sector_activity') || '').trim(),
        c_domaines_associes: String(browserFormData.get('team_scope') || '').trim(),
        c_prio1: String(browserFormData.get('priority_1') || '').trim(),
        c_prio2: String(browserFormData.get('priority_2') || '').trim(),
        c_prio3: String(browserFormData.get('priority_3') || '').trim(),
        c_attentes: String(browserFormData.get('training_expectations') || '').trim(),
        c_inexact: String(browserFormData.get('priority_outcome') || '').trim(),
        g_doublons: String(browserFormData.get('main_pain_point') || '').trim(),
        f_matin: String(browserFormData.get('repetitive_tasks') || '').trim(),
        a_dossiers: String(browserFormData.get('weekly_volume') || '').trim(),
        a_perdues: String(browserFormData.get('current_delays') || '').trim(),
        c_exclure: String(browserFormData.get('manual_steps') || '').trim(),
        d_outils: String(browserFormData.get('current_tools') || '').trim(),
        d_usage: String(browserFormData.get('desired_use_case_family') || '').trim(),
        i_conf: String(browserFormData.get('sensitive_data_constraints') || '').trim(),
        i_sys: String(browserFormData.get('desired_integrations') || '').trim(),
        h_une: String(browserFormData.get('quick_win_90_days') || '').trim(),
        h_kpi: String(browserFormData.get('success_kpi') || '').trim(),
        h_humain: String(browserFormData.get('internal_sponsor') || '').trim(),
        email_dest: recipientEmail,
        email_cc: '',
        email_msg: '',
        language,
      };

      for (const [key, rawValue] of browserFormData.entries()) {
        normalizedFormData[key] = String(rawValue).trim();
      }

      if (!isSupabaseConfigured) {
        const subjectByLanguage: Record<Language, string> = {
          fr: `Formulaire de préparation audit - ${organization}`,
          en: `Audit preparation form - ${organization}`,
          es: `Formulario de preparación para auditoría - ${organization}`,
        };
        const body = buildSubmissionBody(browserFormData);
        const href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subjectByLanguage[language])}&body=${encodeURIComponent(body)}`;
        window.location.href = href;
        setSendState('success');
        setSendHint(`${pageCopy.sendHintReady[language]} ${supabaseConfigMessage}`);
        setSavedResponseId('');
        return;
      }

      setSending(true);
      setSendState('idle');
      setSendHint('');
      setSavedResponseId('');

      try {
        const sessionKey = 'prospect_simple_audit_session_id';
        const existingSessionId = window.sessionStorage.getItem(sessionKey);
        const sessionId = existingSessionId || crypto.randomUUID();
        window.sessionStorage.setItem(sessionKey, sessionId);

        const saveResponse = await fetch(getSupabaseFunctionUrl('save-form-response'), {
          method: 'POST',
          headers: await getSupabaseFunctionHeaders(),
          body: JSON.stringify({
            formData: normalizedFormData,
            completionPercentage: 100,
            sessionId,
          }),
        });

        const savePayload = await saveResponse.json().catch(() => null);

        if (!saveResponse.ok || !savePayload?.responseId) {
          throw new Error(savePayload?.error || 'Impossible d’enregistrer la réponse.');
        }

        const sendResponse = await fetch(getSupabaseFunctionUrl('send-form-email'), {
          method: 'POST',
          headers: await getSupabaseFunctionHeaders(),
          body: JSON.stringify({
            formData: normalizedFormData,
            responseId: savePayload.responseId,
            format: 'csv',
            email_msg: '',
          }),
        });

        const sendPayload = await sendResponse.json().catch(() => null);

        if (!sendResponse.ok) {
          throw new Error(sendPayload?.error || 'Impossible d’envoyer le formulaire.');
        }

        setSendState('success');
        setSendHint(pageCopy.sendHintReady[language]);
        setSavedResponseId(savePayload.responseId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur d’envoi du formulaire.';
        setSendState('error');
        setSendHint(message);
        setSavedResponseId('');
      } finally {
        setSending(false);
      }
    })();
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[6rem] h-72 w-72 rounded-full bg-cyan-200/18 blur-3xl" />
        <div className="absolute right-[-4rem] top-[10rem] h-96 w-96 rounded-full bg-amber-200/18 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[24%] h-80 w-80 rounded-full bg-blue-200/14 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-3 pt-5 md:px-5 md:pt-7">
        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="audit-section-header">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="audit-pill bg-blue-100 text-blue-800">{pageCopy.brand[language]}</span>
                <span className="audit-pill bg-emerald-100 text-emerald-800">{pageCopy.pagePill[language]}</span>
              </div>

              <div className="rounded-full border border-slate-900/10 bg-white/80 p-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {pageCopy.languageLabel[language]}
                  </span>
                  {(['fr', 'en', 'es'] as Language[]).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setLanguage(lng)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                        language === lng ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lng}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="display-font text-3xl font-semibold text-slate-950 md:text-5xl">
              {pageCopy.pageTitle[language]}
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 md:text-[15px]">
              {pageCopy.pageIntro[language]}
            </p>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500 md:text-[15px]">
              {pageCopy.pageSecondary[language]}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openDedicatedWindow}
                className="audit-button audit-button-primary border-0"
              >
                {pageCopy.openWindow[language]}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {pageCopy.heroCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.title.fr} className="rounded-[24px] border border-slate-900/8 bg-white/78 px-4 py-5 shadow-[0_18px_40px_rgba(15,37,66,0.05)]">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-slate-950 p-3 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{card.title[language]}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">{card.text[language]}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="panel-dark rounded-[28px] px-5 py-5 text-white md:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">
              {pageCopy.sidebarTitle[language]}
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">{pageCopy.sidebarFocus[language]}</div>
                <div className="mt-2 display-font text-xl font-semibold">{pageCopy.sidebarFocusValue[language]}</div>
              </div>

              <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">{pageCopy.sidebarOffer[language]}</div>
                <div className="mt-2 text-sm leading-6 text-white/86">{pageCopy.sidebarOfferValue[language]}</div>
              </div>

              <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">{pageCopy.sidebarBenefits[language]}</div>
                <div className="mt-2 text-sm leading-6 text-white/86">{pageCopy.sidebarBenefitsValue[language]}</div>
              </div>

              <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {pageCopy.sidebarChecklist[language]}
                </div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-white/78">
                  {pageCopy.sidebarChecklistItems[language].map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">{pageCopy.sidebarSubmission[language]}</div>
                <div className="mt-2 text-sm leading-6 text-white/86">{pageCopy.sidebarSubmissionValue[language]}</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <form ref={formRef} className="audit-form space-y-5">
            {sections.map((section) => (
              <div key={section.id} className="audit-card">
                <div className="mb-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{translate(section.eyebrow, language)}</div>
                  <div className="display-font mt-1 text-2xl font-semibold text-slate-950">{translate(section.title, language)}</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <Field key={field.id} field={field} language={language} />
                  ))}
                </div>
              </div>
            ))}

            <div className="audit-card">
              <div className="mb-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{translate(focusSection.eyebrow, language)}</div>
                <div className="display-font mt-1 text-2xl font-semibold text-slate-950">{translate(focusSection.title, language)}</div>
              </div>
              <div className="audit-note audit-note-info mb-5">
                <div className="font-semibold text-slate-900">{pageCopy.sidebarFocus[language]}: {pageCopy.sidebarFocusValue[language]}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">
                  {pageCopy.sidebarOfferValue[language]}
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-900/8 bg-white/72 px-5 py-5 mb-5">
                <div className="font-semibold text-slate-900">{pageCopy.focusExplanationTitle[language]}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {pageCopy.focusExplanationText[language]}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {pageCopy.focusExplanationPoints[language].map((point) => (
                    <div key={point} className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {focusSection.fields.map((field) => (
                  <Field key={field.id} field={field} language={language} />
                ))}
              </div>
            </div>

            <div className="audit-card">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{pageCopy.sendSectionEyebrow[language]}</div>
                  <div className="display-font mt-1 text-2xl font-semibold text-slate-950">{pageCopy.sendSectionTitle[language]}</div>
                </div>
                <span className="audit-pill bg-emerald-100 text-emerald-800">{recipientEmail}</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-[22px] border border-slate-900/8 bg-white/75 px-5 py-5">
                  <div className="text-sm leading-7 text-slate-700">
                    {pageCopy.sendSectionText[language]}
                  </div>

                  {sendHint && (
                    <div className={`audit-note mt-4 ${sendState === 'error' ? 'audit-note-danger' : sendState === 'success' ? 'audit-note-success' : 'audit-note-info'}`}>
                      <div className="text-sm leading-6 text-slate-700">{sendHint}</div>
                    </div>
                  )}

                  {sendState === 'success' && (
                    <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-emerald-600 p-2 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-emerald-950">
                            {language === 'fr'
                              ? `Formulaire transmis avec succès à ${recipientEmail}`
                              : language === 'en'
                                ? `Form successfully sent to ${recipientEmail}`
                                : `Formulario enviado correctamente a ${recipientEmail}`}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-emerald-900/80">
                            {language === 'fr'
                              ? "Notre équipe pourra relire votre réponse avant la visite et préparer l’audit dans de meilleures conditions."
                              : language === 'en'
                                ? 'Our team will be able to review your response before the visit and prepare the audit more effectively.'
                                : 'Nuestro equipo podrá revisar su respuesta antes de la visita y preparar mejor la auditoría.'}
                          </div>
                          {savedResponseId && (
                            <div className="mt-3 rounded-[18px] border border-emerald-200 bg-white/80 px-4 py-3">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800/80">
                                {pageCopy.responseIdLabel[language]}
                              </div>
                              <div className="mt-1 break-all font-mono text-sm text-emerald-950">
                                {savedResponseId}
                              </div>
                              <div className="mt-2 text-sm leading-6 text-emerald-900/80">
                                {pageCopy.responseIdHelp[language]}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {sendState === 'error' && sendHint && (
                    <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4">
                      <div className="font-semibold text-red-950">
                        {language === 'fr'
                          ? "L’envoi n’a pas abouti"
                          : language === 'en'
                            ? 'The submission could not be sent'
                            : 'No se pudo enviar el formulario'}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-red-900/80">
                        {language === 'fr'
                          ? "Vérifiez les champs requis et la configuration d’envoi, puis réessayez."
                          : language === 'en'
                            ? 'Please check the required fields and sending configuration, then try again.'
                            : 'Verifique los campos obligatorios y la configuración de envío, luego inténtelo de nuevo.'}
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending}
                      className="audit-button audit-button-primary border-0"
                    >
                      {sending ? pageCopy.sendInProgress[language] : pageCopy.sendButton[language]}
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-900/8 bg-slate-950 px-5 py-5 text-white">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{pageCopy.sendCardTitle[language]}</div>
                  <div className="mt-4 space-y-3">
                    {pageCopy.sendCardItems[language].map((item, index) => {
                      const icons = [Target, Shield, Sparkles];
                      const Icon = icons[index];

                      return (
                        <div key={item} className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-white/10 p-2 text-white">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="text-sm leading-6 text-white/80">{item}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </form>

          <aside className="space-y-5">
            <div className="audit-soft-card">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                {recipientEmail}
              </div>
              <div className="mt-3 text-lg font-semibold text-slate-900">
                {pageCopy.sendSectionTitle[language]}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                {pageCopy.sendSectionText[language]}
              </div>
            </div>

            <div className="audit-card">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                {pageCopy.openWindow[language]}
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-600">
                {pageCopy.pageSecondary[language]}
              </div>
              <button
                type="button"
                onClick={openDedicatedWindow}
                className="audit-button audit-button-secondary mt-4 w-full"
              >
                <Globe2 className="h-4 w-4" />
                {pageCopy.openWindow[language]}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
