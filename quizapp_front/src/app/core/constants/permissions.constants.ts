/**
 * Constantes de permissions — miroir de FunctionalityEnum.java côté backend.
 * Organisées par catégories pour affichage dans les pages admin.
 */

export interface PermissionCategory {
  label: string;
  permissions: PermissionDef[];
}

export interface PermissionDef {
  key: string;
  label: string;
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    label: 'Campagnes',
    permissions: [
      { key: 'VIEW_CAMPAIGNS', label: 'Voir les campagnes' },
      { key: 'CREATE_CAMPAIGNS', label: 'Créer une campagne' },
      { key: 'UPDATE_CAMPAIGNS', label: 'Modifier une campagne' },
      { key: 'DELETE_CAMPAIGNS', label: 'Supprimer une campagne' },
    ]
  },
  {
    label: 'Candidatures',
    permissions: [
      { key: 'VIEW_APPLICATIONS', label: 'Voir les candidatures' },
      { key: 'CREATE_APPLICATIONS', label: 'Créer une candidature' },
      { key: 'UPDATE_APPLICATIONS', label: 'Modifier une candidature' },
      { key: 'DELETE_APPLICATIONS', label: 'Supprimer une candidature' },
    ]
  },
  {
    label: 'Entretiens',
    permissions: [
      { key: 'VIEW_INTERVIEWS', label: 'Voir les entretiens' },
      { key: 'CREATE_INTERVIEWS', label: 'Créer un entretien' },
      { key: 'UPDATE_INTERVIEWS', label: 'Modifier un entretien' },
      { key: 'DELETE_INTERVIEWS', label: 'Supprimer un entretien' },
    ]
  },
  {
    label: 'Évaluations',
    permissions: [
      { key: 'VIEW_EVALUATIONS', label: 'Voir les évaluations' },
      { key: 'CREATE_EVALUATIONS', label: 'Créer une évaluation' },
      { key: 'UPDATE_EVALUATIONS', label: 'Modifier une évaluation' },
      { key: 'DELETE_EVALUATIONS', label: 'Supprimer une évaluation' },
    ]
  },
  {
    label: 'Décisions',
    permissions: [
      { key: 'VIEW_DECISIONS', label: 'Voir les décisions' },
      { key: 'CREATE_DECISIONS', label: 'Créer une décision' },
      { key: 'UPDATE_DECISIONS', label: 'Modifier une décision' },
      { key: 'DELETE_DECISIONS', label: 'Supprimer une décision' },
    ]
  },
  {
    label: 'Pipeline',
    permissions: [
      { key: 'VIEW_PIPELINE_TEMPLATE', label: 'Voir les modèles pipeline' },
      { key: 'CREATE_PIPELINE_TEMPLATE', label: 'Créer un modèle pipeline' },
      { key: 'UPDATE_PIPELINE_TEMPLATE', label: 'Modifier un modèle pipeline' },
      { key: 'DELETE_PIPELINE_TEMPLATE', label: 'Supprimer un modèle pipeline' },
      { key: 'MANAGE_PIPELINE_TEMPLATE', label: 'Gérer les pipelines' },
      { key: 'ADVANCE_PIPELINE', label: 'Avancer une candidature dans le pipeline' },
      { key: 'MIGRATE_CANDIDATE_PIPELINE', label: 'Migrer un candidat entre pipelines' },
      { key: 'VIEW_PIPELINE_STAGE', label: 'Voir les étapes pipeline' },
      { key: 'CREATE_PIPELINE_STAGE', label: 'Créer une étape pipeline' },
      { key: 'UPDATE_PIPELINE_STAGE', label: 'Modifier une étape pipeline' },
      { key: 'DELETE_PIPELINE_STAGE', label: 'Supprimer une étape pipeline' },
      { key: 'VIEW_APPLICATION_PROGRESS', label: 'Voir la progression candidature' },
      { key: 'CREATE_APPLICATION_PROGRESS', label: 'Créer une progression' },
      { key: 'UPDATE_APPLICATION_PROGRESS', label: 'Modifier une progression' },
      { key: 'DELETE_APPLICATION_PROGRESS', label: 'Supprimer une progression' },
    ]
  },
  {
    label: 'Utilisateurs',
    permissions: [
      { key: 'VIEW_USER', label: 'Voir les utilisateurs' },
      { key: 'CREATE_USER', label: 'Créer un utilisateur' },
      { key: 'UPDATE_USER', label: 'Modifier un utilisateur' },
      { key: 'DELETE_USER', label: 'Supprimer un utilisateur' },
    ]
  },
  {
    label: 'Départements & Spécialités',
    permissions: [
      { key: 'VIEW_DEPARTMENTS', label: 'Voir les départements' },
      { key: 'CREATE_DEPARTMENTS', label: 'Créer un département' },
      { key: 'UPDATE_DEPARTMENTS', label: 'Modifier un département' },
      { key: 'DELETE_DEPARTMENTS', label: 'Supprimer un département' },
      { key: 'VIEW_SPECIALITIES', label: 'Voir les spécialités' },
      { key: 'CREATE_SPECIALITIES', label: 'Créer une spécialité' },
      { key: 'UPDATE_SPECIALITIES', label: 'Modifier une spécialité' },
      { key: 'DELETE_SPECIALITIES', label: 'Supprimer une spécialité' },
    ]
  },
  {
    label: 'Questions & Réponses',
    permissions: [
      { key: 'VIEW_QUESTION', label: 'Voir les questions' },
      { key: 'CREATE_QUESTION', label: 'Créer une question' },
      { key: 'UPDATE_QUESTION', label: 'Modifier une question' },
      { key: 'DELETE_QUESTION', label: 'Supprimer une question' },
      { key: 'VIEW_ANSWER', label: 'Voir les réponses' },
      { key: 'CREATE_ANSWER', label: 'Créer une réponse' },
      { key: 'UPDATE_ANSWER', label: 'Modifier une réponse' },
      { key: 'DELETE_ANSWER', label: 'Supprimer une réponse' },
    ]
  },
  {
    label: 'Administration',
    permissions: [
      { key: 'VIEW_APP_CONFIG', label: 'Voir la configuration' },
      { key: 'CREATE_APP_CONFIG', label: 'Créer une configuration' },
      { key: 'UPDATE_APP_CONFIG', label: 'Modifier la configuration' },
      { key: 'DELETE_APP_CONFIG', label: 'Supprimer une configuration' },
      { key: 'VIEW_EMAIL_TEMPLATE', label: 'Voir les modèles email' },
      { key: 'CREATE_EMAIL_TEMPLATE', label: 'Créer un modèle email' },
      { key: 'UPDATE_EMAIL_TEMPLATE', label: 'Modifier un modèle email' },
      { key: 'DELETE_EMAIL_TEMPLATE', label: 'Supprimer un modèle email' },
      { key: 'VIEW_SMTP_CONFIG', label: 'Voir la config SMTP' },
      { key: 'CREATE_SMTP_CONFIG', label: 'Créer une config SMTP' },
      { key: 'UPDATE_SMTP_CONFIG', label: 'Modifier la config SMTP' },
      { key: 'DELETE_SMTP_CONFIG', label: 'Supprimer une config SMTP' },
      { key: 'VIEW_LEGAL_TEXT', label: 'Voir les textes légaux' },
      { key: 'CREATE_LEGAL_TEXT', label: 'Créer un texte légal' },
      { key: 'UPDATE_LEGAL_TEXT', label: 'Modifier un texte légal' },
      { key: 'DELETE_LEGAL_TEXT', label: 'Supprimer un texte légal' },
      { key: 'VIEW_INVITATION_CODE', label: 'Voir les codes invitation' },
      { key: 'CREATE_INVITATION_CODE', label: 'Créer un code invitation' },
      { key: 'UPDATE_INVITATION_CODE', label: 'Modifier un code invitation' },
      { key: 'DELETE_INVITATION_CODE', label: 'Supprimer un code invitation' },
    ]
  },
  {
    label: 'Groupes & Permissions',
    permissions: [
      { key: 'VIEW_BUSINESS_GROUP', label: 'Voir les groupes métiers' },
      { key: 'CREATE_BUSINESS_GROUP', label: 'Créer un groupe métier' },
      { key: 'UPDATE_BUSINESS_GROUP', label: 'Modifier un groupe métier' },
      { key: 'DELETE_BUSINESS_GROUP', label: 'Supprimer un groupe métier' },
      { key: 'MANAGE_SYSTEM_ROLES', label: 'Gérer les rôles système' },
      { key: 'VIEW_ENTITY_PERMISSION', label: 'Voir les permissions entité' },
      { key: 'UPDATE_ENTITY_PERMISSION', label: 'Modifier les permissions entité' },
    ]
  },
];

/** Toutes les clés de permissions en liste plate */
export const ALL_PERMISSIONS: string[] = PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.key));
