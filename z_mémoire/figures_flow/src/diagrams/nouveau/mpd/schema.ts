import type { Attribute, EntityNode, SqlLegendItem } from '../../../types'

/**
 * SOURCE DE VÉRITÉ DU MPD
 * ========================
 * Les 21 tables des 2 figures MPD sont décrites ICI, une seule fois, et les deux
 * vues en sont générées :
 *
 *   - vue « tables »  -> toTableFigure()   (src/diagrams/nouveau/mpd/*.ts)
 *   - vue « script »  -> buildScriptFigure() (src/diagrams/nouveau/mpd_sql/*.ts)
 *
 * Une table ne peut donc pas diverger entre les deux vues : c'est le générateur
 * qui produit les deux, pas deux saisies manuelles.
 *
 * Référentiel : plans/rules/regles_mpd.md
 * Plan        : plans/implementations/20260928_mpd_script.md
 */

export type OnDelete = 'CASCADE' | 'SET NULL' | 'RESTRICT'

export interface MpdReference {
  table: string
  onDelete: OnDelete
  /**
   * La table cible n'est pas dans le périmètre des 21 tables.
   * Le MPD est un extrait de lecture (13 relations sur 34 ne sont pas figurées) :
   * la FK est alors soit cross-figure, soit pendante. La colonne est conservée
   * (c'est un attribut du MLD), seule la cible n'est pas dessinée.
   */
  external?: boolean
}

export interface MpdColumn {
  name: string
  type: string
  nullable?: boolean
  autoIncrement?: boolean
  references?: MpdReference
  default?: string
  onUpdate?: string
}

export interface MpdIndex {
  name: string
  columns: string[]
  why: string
}

export interface MpdTable {
  name: string
  /** Entité MCD d'origine (règle 12 : la correspondance se documente). */
  mcd: string
  /** Table de jonction -> PK composite, jamais d'IDENTifiant inventé (règle 3). */
  junction?: boolean
  columns: MpdColumn[]
  primaryKey: string[]
  uniqueKeys?: MpdIndex[]
  indexes?: MpdIndex[]
  /** Commentaire affiché en tête du bloc de script. */
  note?: string
}

// ===========================================================================
//  Colonnes systématiques (règle 7) — hors figures, présentes dans le script
// ===========================================================================
//  Elles ne sont pas des attributs du MLD : c'est précisément pourquoi elles
//  n'apparaissent pas dans la vue « tables ». Elles sont systématiques sur les
//  21 tables, donc ajoutées par le générateur plutôt que recopiées 21 fois.
// ===========================================================================

export const AUDIT_COLUMNS: MpdColumn[] = [
  { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
  { name: 'created_by', type: 'int unsigned', nullable: true },
  { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
  { name: 'updated_by', type: 'int unsigned', nullable: true },
  { name: 'is_deleted', type: 'tinyint(1)', default: '0' },
]

/** Règle 10 — valeurs identiques sur les 21 tables, posées une seule fois. */
export const STORAGE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'

const q = (name: string) => `\`${name}\``

// ===========================================================================
//  Figure 1 — « Campagnes & candidatures » (12 tables)
// ===========================================================================

export const MPD_CAMPAGNES: MpdTable[] = [
  {
    name: 'campaigns',
    mcd: 'CAMPAGNE',
    note: 'speciality_id et creator_id pointent hors figure (SPECIALITE, UTILISATEUR)',
    primaryKey: ['id'],
    indexes: [
      {
        name: 'idx_campaigns_template',
        columns: ['pipeline_template_id'],
        why: 'FK du modèle de pipeline + filtre des actives par modèle',
      },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'pipeline_template_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'pipeline_template', onDelete: 'SET NULL' },
      },
      {
        name: 'speciality_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'specialities', onDelete: 'SET NULL', external: true },
      },
      {
        name: 'creator_id',
        type: 'int unsigned',
        references: { table: 'user', onDelete: 'RESTRICT', external: true },
      },
      { name: 'title', type: 'varchar(255)' },
      { name: 'description', type: 'text', nullable: true },
      { name: 'status', type: 'varchar(20)' },
      { name: 'start_date', type: 'datetime', nullable: true },
      { name: 'end_date', type: 'datetime', nullable: true },
      { name: 'max_applications', type: 'int', nullable: true },
      { name: 'max_attempts', type: 'int', nullable: true },
      { name: 'is_published', type: 'tinyint(1)' },
      { name: 'is_archived', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'pipeline_template',
    mcd: 'MODELE_PIPELINE',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      { name: 'template_name', type: 'varchar(255)' },
      { name: 'is_default', type: 'tinyint(1)' },
      { name: 'is_active', type: 'tinyint(1)' },
      { name: 'is_locked', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'pipeline_stage',
    mcd: 'ETAPE_PIPELINE',
    note: 'evaluation_grid_template_version_id est cross-figure (figure 2)',
    primaryKey: ['id'],
    indexes: [
      {
        name: 'idx_stage_grid_version',
        columns: ['evaluation_grid_template_version_id'],
        why: 'FK de la grille d’évaluation + résolution de la version courante',
      },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'pipeline_template_id',
        type: 'int unsigned',
        references: { table: 'pipeline_template', onDelete: 'CASCADE' },
      },
      {
        name: 'evaluation_grid_template_version_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'evaluation_grid_template_version', onDelete: 'SET NULL', external: true },
      },
      { name: 'stage_type', type: 'varchar(50)' },
      { name: 'stage_label', type: 'varchar(255)' },
      { name: 'stage_order', type: 'int' },
      { name: 'is_required', type: 'tinyint(1)' },
      { name: 'is_eliminating', type: 'tinyint(1)' },
      { name: 'is_active', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'campaign_form',
    mcd: 'PROPOSER (association)',
    junction: true,
    note: 'PK composite héritée du MLD : aucun identifiant inventé',
    primaryKey: ['campaign_id', 'form_id'],
    columns: [
      {
        name: 'campaign_id',
        type: 'int unsigned',
        references: { table: 'campaigns', onDelete: 'CASCADE' },
      },
      {
        name: 'form_id',
        type: 'int unsigned',
        references: { table: 'form', onDelete: 'CASCADE' },
      },
      { name: 'assignment_order', type: 'int' },
    ],
  },
  {
    name: 'form',
    mcd: 'FORMULAIRE',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      { name: 'name', type: 'varchar(255)' },
      { name: 'description', type: 'text', nullable: true },
      { name: 'is_active', type: 'tinyint(1)' },
      { name: 'is_timed', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'form_version',
    mcd: 'VERSION_FORMULAIRE',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'form_id',
        type: 'int unsigned',
        references: { table: 'form', onDelete: 'CASCADE' },
      },
      { name: 'version_number', type: 'int' },
      { name: 'is_published', type: 'tinyint(1)' },
      { name: 'is_locked', type: 'tinyint(1)' },
      { name: 'randomize_questions', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'form_questions',
    mcd: 'REGROUPER (association)',
    junction: true,
    note: 'PK composite héritée du MLD : aucun identifiant inventé',
    primaryKey: ['form_version_id', 'question_id'],
    columns: [
      {
        name: 'form_version_id',
        type: 'int unsigned',
        references: { table: 'form_version', onDelete: 'CASCADE' },
      },
      {
        name: 'question_id',
        type: 'int unsigned',
        references: { table: 'question', onDelete: 'CASCADE' },
      },
      { name: 'question_order', type: 'int' },
      { name: 'custom_time_limit', type: 'int', nullable: true },
    ],
  },
  {
    name: 'question',
    mcd: 'QUESTION',
    primaryKey: ['id'],
    indexes: [
      {
        name: 'idx_question_speciality',
        columns: ['speciality_id'],
        why: 'FK de la spécialité + banque de questions par métier',
      },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'speciality_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'specialities', onDelete: 'SET NULL', external: true },
      },
      { name: 'statement', type: 'text' },
      { name: 'type', type: 'varchar(20)' },
      { name: 'score', type: 'int' },
      { name: 'time_limit', type: 'int', nullable: true },
      { name: 'difficulty', type: 'varchar(20)', nullable: true },
      { name: 'requires_manual_correction', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'answer',
    mcd: 'REPONSE',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'question_id',
        type: 'int unsigned',
        references: { table: 'question', onDelete: 'CASCADE' },
      },
      { name: 'type', type: 'varchar(20)' },
      { name: 'text', type: 'text' },
      { name: 'answer_order', type: 'int' },
      { name: 'is_correct', type: 'tinyint(1)' },
      { name: 'is_comment_allowed', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'applications',
    mcd: 'CANDIDATURE',
    note: 'source_token_id est une FK pendante (TOKEN_SOURCE hors figure)',
    primaryKey: ['id'],
    uniqueKeys: [
      {
        name: 'uq_applications_form_email',
        columns: ['form_version_id', 'candidate_email'],
        why: 'Un candidat ne soumet qu’une fois le même formulaire',
      },
    ],
    indexes: [
      {
        name: 'idx_applications_email',
        columns: ['candidate_email'],
        why: 'Recherche d’une candidature par email',
      },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'form_version_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'form_version', onDelete: 'RESTRICT' },
      },
      {
        name: 'source_token_id',
        type: 'int unsigned',
        references: { table: 'source_token', onDelete: 'SET NULL', external: true },
      },
      { name: 'candidate_first_name', type: 'varchar(100)' },
      { name: 'candidate_last_name', type: 'varchar(100)' },
      { name: 'candidate_email', type: 'varchar(255)' },
      { name: 'candidate_phone', type: 'varchar(20)', nullable: true },
      { name: 'candidate_cv', type: 'varchar(1000)', nullable: true },
      { name: 'candidate_cover_letter', type: 'longtext', nullable: true },
      { name: 'candidate_birthdate', type: 'date', nullable: true },
      { name: 'is_email_verified', type: 'tinyint(1)' },
      { name: 'is_abandoned', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'application_progress',
    mcd: 'AVANCEMENT',
    primaryKey: ['id'],
    indexes: [
      { name: 'idx_progress_status', columns: ['progress_status'], why: 'Filtrage du tableau de suivi' },
      { name: 'idx_progress_application', columns: ['application_id'], why: 'FK + historique d’une candidature' },
      { name: 'idx_progress_stage', columns: ['pipeline_stage_id'], why: 'FK + regroupement par étape' },
      { name: 'idx_progress_start', columns: ['start_date'], why: 'Tri chronologique du suivi' },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'application_id',
        type: 'int unsigned',
        references: { table: 'applications', onDelete: 'CASCADE' },
      },
      {
        name: 'pipeline_stage_id',
        type: 'int unsigned',
        references: { table: 'pipeline_stage', onDelete: 'RESTRICT' },
      },
      { name: 'progress_status', type: 'varchar(20)' },
      { name: 'start_date', type: 'datetime', nullable: true },
      { name: 'end_date', type: 'datetime', nullable: true },
      { name: 'score', type: 'decimal(5,2)', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'validated_at', type: 'datetime', nullable: true },
      { name: 'validation_comment', type: 'text', nullable: true },
      { name: 'skipped_at', type: 'datetime', nullable: true },
      { name: 'skip_reason', type: 'varchar(255)', nullable: true },
      { name: 'reopened_at', type: 'datetime', nullable: true },
      { name: 'reopen_reason', type: 'varchar(255)', nullable: true },
    ],
  },
  {
    name: 'decisions',
    mcd: 'DECISION',
    note: 'annulled_decision_id : divergence assumée (BD physique : cancels_decision_id)',
    primaryKey: ['id'],
    indexes: [
      { name: 'idx_decisions_user', columns: ['user_id'], why: 'FK + historique des décisions d’un recruteur' },
      {
        name: 'idx_decisions_annulled',
        columns: ['annulled_decision_id'],
        why: 'FK réflexive : résolution des annulations en cascade',
      },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'application_progress_id',
        type: 'int unsigned',
        references: { table: 'application_progress', onDelete: 'RESTRICT' },
      },
      {
        name: 'user_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'user', onDelete: 'SET NULL', external: true },
      },
      {
        name: 'annulled_decision_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'decisions', onDelete: 'SET NULL' },
      },
      { name: 'decision_type', type: 'varchar(50)' },
      { name: 'justification', type: 'text', nullable: true },
      { name: 'decision_mode', type: 'varchar(30)' },
    ],
  },
]

// ===========================================================================
//  Figure 2 — « Entretiens & utilisateurs » (9 tables)
// ===========================================================================

export const MPD_ENTRETIENS: MpdTable[] = [
  {
    name: 'user',
    mcd: 'UTILISATEUR',
    note: 'Table au singulier alors que le reste du schéma est au pluriel (arbitrage assumé)',
    primaryKey: ['id'],
    uniqueKeys: [
      { name: 'uq_user_email', columns: ['email'], why: 'Identifiant de connexion' },
      { name: 'uq_user_username', columns: ['username'], why: 'Identifiant de connexion' },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'company_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'companies', onDelete: 'SET NULL', external: true },
      },
      { name: 'last_name', type: 'varchar(100)' },
      { name: 'first_name', type: 'varchar(100)' },
      { name: 'email', type: 'varchar(255)' },
      { name: 'username', type: 'varchar(100)' },
      { name: 'system_role', type: 'varchar(50)' },
    ],
  },
  {
    name: 'evaluation_grid_template',
    mcd: 'GRILLE_MODELE',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      { name: 'template_name', type: 'varchar(255)' },
      { name: 'description', type: 'text', nullable: true },
      { name: 'is_active', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'evaluation_grid_template_version',
    mcd: 'VERSION_GRILLE',
    note: 'contenu_hashé (sic) du MLD -> content_hash : faute de frappe corrigée au MPD',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'evaluation_grid_template_id',
        type: 'int unsigned',
        references: { table: 'evaluation_grid_template', onDelete: 'CASCADE' },
      },
      { name: 'version_number', type: 'int' },
      { name: 'is_published', type: 'tinyint(1)' },
      { name: 'content_hash', type: 'varchar(64)' },
      { name: 'locked_at', type: 'datetime', nullable: true },
    ],
  },
  {
    name: 'evaluation_grid_criterion',
    mcd: 'CRITERE',
    note: 'Arbitrage : la BD physique l’appelait evaluation_grid_template_item',
    primaryKey: ['id'],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'evaluation_grid_template_version_id',
        type: 'int unsigned',
        references: { table: 'evaluation_grid_template_version', onDelete: 'CASCADE' },
      },
      { name: 'criterion_order', type: 'int' },
      { name: 'label', type: 'varchar(255)' },
      { name: 'criterion_type', type: 'varchar(20)' },
      { name: 'max_score', type: 'decimal(5,2)' },
      { name: 'weight', type: 'decimal(5,2)' },
      { name: 'is_required', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'interviews',
    mcd: 'ENTRETIEN',
    note: 'application_progress_id est cross-figure (figure 1)',
    primaryKey: ['id'],
    indexes: [
      { name: 'idx_interviews_status', columns: ['status'], why: 'Filtrage du planning' },
      { name: 'idx_interviews_progress', columns: ['application_progress_id'], why: 'FK + entretiens d’un avancement' },
      { name: 'idx_interviews_scheduled', columns: ['scheduled_at'], why: 'Tri chronologique du planning' },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'application_progress_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'application_progress', onDelete: 'SET NULL', external: true },
      },
      { name: 'scheduled_at', type: 'datetime' },
      { name: 'interview_type', type: 'varchar(20)' },
      { name: 'interview_location', type: 'varchar(255)', nullable: true },
      { name: 'video_link', type: 'varchar(500)', nullable: true },
      { name: 'status', type: 'varchar(20)' },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'start_time', type: 'datetime', nullable: true },
      { name: 'end_time', type: 'datetime', nullable: true },
    ],
  },
  {
    name: 'convocation',
    mcd: 'CONVOCATION',
    note: 'Arbitrage : la BD physique l’appelait candidate_interview',
    primaryKey: ['id'],
    indexes: [
      { name: 'idx_convocation_status', columns: ['response_status'], why: 'Suivi des réponses en attente' },
      { name: 'idx_convocation_proposed', columns: ['proposed_at'], why: 'Tri des convocations proposées' },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'interview_id',
        type: 'int unsigned',
        references: { table: 'interviews', onDelete: 'CASCADE' },
      },
      { name: 'proposed_at', type: 'datetime' },
      { name: 'response_status', type: 'varchar(20)' },
      { name: 'decline_reason', type: 'varchar(500)', nullable: true },
      { name: 'duration_minutes', type: 'int', nullable: true },
      { name: 'responded_at', type: 'datetime', nullable: true },
      { name: 'alternative_requested_at', type: 'datetime', nullable: true },
    ],
  },
  {
    name: 'interview_evaluator',
    mcd: 'EVALUATEUR_ENTRETIEN',
    note: 'Arbitrage : la BD physique l’appelait interview_participant',
    primaryKey: ['id'],
    uniqueKeys: [
      {
        name: 'uq_interview_evaluator',
        columns: ['interview_id', 'user_id'],
        why: 'Un utilisateur n’est évaluateur qu’une fois par entretien',
      },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'interview_id',
        type: 'int unsigned',
        references: { table: 'interviews', onDelete: 'CASCADE' },
      },
      {
        name: 'user_id',
        type: 'int unsigned',
        references: { table: 'user', onDelete: 'CASCADE' },
      },
      { name: 'can_modify', type: 'tinyint(1)' },
      { name: 'can_delete', type: 'tinyint(1)' },
      { name: 'can_evaluate', type: 'tinyint(1)' },
      { name: 'is_admin', type: 'tinyint(1)' },
      { name: 'follows_application', type: 'tinyint(1)' },
      { name: 'evaluation_status', type: 'varchar(20)' },
      { name: 'is_online', type: 'tinyint(1)' },
      { name: 'has_finished', type: 'tinyint(1)' },
    ],
  },
  {
    name: 'evaluations',
    mcd: 'EVALUATION',
    primaryKey: ['id'],
    indexes: [
      { name: 'idx_evaluations_status', columns: ['status'], why: 'Filtrage des évaluations à valider' },
      { name: 'idx_evaluations_convocation', columns: ['convocation_id'], why: 'FK + évaluation d’une convocation' },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'convocation_id',
        type: 'int unsigned',
        references: { table: 'convocation', onDelete: 'CASCADE' },
      },
      {
        name: 'evaluator_id',
        type: 'int unsigned',
        nullable: true,
        references: { table: 'interview_evaluator', onDelete: 'SET NULL' },
      },
      { name: 'status', type: 'varchar(20)' },
      { name: 'submitted_at', type: 'datetime', nullable: true },
      { name: 'global_score', type: 'decimal(5,2)', nullable: true },
      { name: 'global_comment', type: 'text', nullable: true },
      { name: 'validated_at', type: 'datetime', nullable: true },
    ],
  },
  {
    name: 'evaluation_item',
    mcd: 'NOTE_CRITERE',
    note: 'weight_snapshot / max_score_snapshot : dénormalisation justifiée (grille mutable)',
    primaryKey: ['id'],
    indexes: [
      { name: 'idx_item_evaluation', columns: ['evaluation_id'], why: 'FK + notes d’une évaluation' },
      { name: 'idx_item_criterion', columns: ['criterion_id'], why: 'FK + notes sur un critère' },
    ],
    columns: [
      { name: 'id', type: 'int unsigned', autoIncrement: true },
      {
        name: 'evaluation_id',
        type: 'int unsigned',
        references: { table: 'evaluations', onDelete: 'CASCADE' },
      },
      {
        name: 'criterion_id',
        type: 'int unsigned',
        references: { table: 'evaluation_grid_criterion', onDelete: 'RESTRICT' },
      },
      { name: 'score_value', type: 'decimal(5,2)', nullable: true },
      { name: 'text_value', type: 'text', nullable: true },
      { name: 'weight_snapshot', type: 'decimal(5,2)', nullable: true },
      { name: 'max_score_snapshot', type: 'decimal(5,2)', nullable: true },
    ],
  },
]

export const ALL_TABLES: MpdTable[] = [...MPD_CAMPAGNES, ...MPD_ENTRETIENS]

export function getTable(name: string): MpdTable {
  const found = ALL_TABLES.find((t) => t.name === name)
  if (!found) throw new Error(`Table MPD inconnue : ${name}`)
  return found
}

function crossFigureOf(table: string): string {
  if (MPD_CAMPAGNES.some((t) => t.name === table)) return 'Campagnes & candidatures'
  return 'Entretiens & utilisateurs'
}

// ===========================================================================
//  Générateur — vue « tables » (règle 5 : NOT NULL / NULL, règle 12 : noms)
// ===========================================================================

function toAttribute(table: MpdTable, col: MpdColumn): Attribute {
  const isPK = table.primaryKey.includes(col.name)
  const isFK = col.references != null

  const parts: string[] = []
  if (col.type) parts.push(col.type)
  if (col.autoIncrement) parts.push('AUTO_INCREMENT')
  if (col.references) {
    parts.push(`FK → ${col.references.table}.id`)
    parts.push(`ON DELETE ${col.references.onDelete}`)
  }

  return {
    name: col.name,
    type: parts.join(' '),
    isPK,
    isFK,
    nullable: col.nullable,
  }
}

export function toTableFigure(table: MpdTable, position: { x: number; y: number }): EntityNode {
  return {
    id: table.name,
    type: 'entity',
    position,
    data: {
      label: table.name,
      variant: 'mpd',
      badge: table.junction ? 'JONCTION' : undefined,
      attributes: table.columns.map((c) => toAttribute(table, c)),
    },
  }
}

// ===========================================================================
//  Générateur — vue « script » (CREATE TABLE exécutable)
// ===========================================================================

export interface CreateTableOptions {
  /** Ajoute les 5 colonnes systématiques d'audit (règle 7). Défaut : true. */
  audit?: boolean
  /** Ajoute les lignes de contraintes (règles 3, 4, 6, 8). Défaut : true. */
  constraints?: boolean
  /**
   * Tables effectivement créées par le script. Une FK dont la cible n'est pas
   * dans ce jeu ne peut pas être déclarée : le script resterait non exécutable.
   * Elle est alors rendue en commentaire, avec la raison — c'est exactement le
   * cas des 13 relations non figurées (extrait de lecture) et des 3 FK
   * cross-figures.
   */
  knownTables?: Iterable<string>
}

export function toCreateTable(table: MpdTable, options: CreateTableOptions = {}): string {
  const { audit = true, constraints = true, knownTables } = options
  const columns = audit ? [...table.columns, ...AUDIT_COLUMNS] : table.columns
  const known = knownTables ? new Set(knownTables) : null

  // Une « entrée » = une ou plusieurs lignes SQL dont la dernière porte la virgule.
  const entries: string[][] = []

  for (const col of columns) {
    const tokens: string[] = [q(col.name), col.type]
    if (!col.nullable) tokens.push('NOT NULL')
    if (col.autoIncrement) tokens.push('AUTO_INCREMENT')
    if (col.default) tokens.push('DEFAULT', col.default)
    if (col.onUpdate) tokens.push('ON UPDATE', col.onUpdate)
    entries.push([`  ${tokens.join(' ')}`])
  }

  if (constraints) {
    for (const uq of table.uniqueKeys ?? []) {
      entries.push([`  UNIQUE KEY ${q(uq.name)} (${uq.columns.map(q).join(', ')})`])
    }
    for (const idx of table.indexes ?? []) {
      entries.push([`  KEY ${q(idx.name)} (${idx.columns.map(q).join(', ')})`])
    }
    entries.push([`  PRIMARY KEY (${table.primaryKey.map(q).join(', ')})`])

    for (const col of columns) {
      const ref = col.references
      if (!ref) continue

      if (known && !known.has(ref.table)) {
        // La cible existe dans l'autre figure -> cross-figure ; sinon elle est
        // hors des 21 tables (13 relations non figurées du MPD).
        const crossFigure = ALL_TABLES.some((t) => t.name === ref.table)
        const where = crossFigure
          ? `cible créée dans la figure « ${crossFigureOf(ref.table)} »`
          : 'table absente des 21 tables (lien non figuré)'
        entries.push([
          `  -- FK cross-figure : ${q(col.name)} -> ${q(ref.table)} (${q('id')})` +
            (crossFigure ? '' : ' — hors périmètre'),
          `  --   ${col.type} ${col.nullable ? 'NULL' : 'NOT NULL'} : ${where}`,
          `  --   contrainte différée à la fin du script global`,
        ])
        continue
      }

      entries.push([
        `  CONSTRAINT ${q(`fk_${table.name}_${col.name}`)}`,
        `    FOREIGN KEY (${q(col.name)}) REFERENCES ${q(ref.table)} (${q('id')})`,
        `    ON DELETE ${ref.onDelete}`,
      ])
    }
  }

  const flat = entries.flat()
  const last = flat.length - 1

  return [
    `CREATE TABLE ${q(table.name)} (`,
    ...flat.map((line, i) => (i === last ? line : `${line},`)),
    `) ${STORAGE_OPTIONS};`,
  ].join('\n')
}

/**
 * Bloc d'audit différé (règle 7).
 *
 * `created_by` / `updated_by` ne sont PAS des attributs du MLD : ce sont des
 * colonnes techniques. Les contraindre en `FOREIGN KEY` à l'intérieur du
 * `CREATE TABLE` obligerait `user` à être créée en premier, ce qui casserait
 * l'ordre de lecture pédagogique des figures. Elles sont donc ajoutées en fin
 * de script : le script reste exécutable ET l'ordre de lecture est préservé.
 *
 * `user` est exclue (auto-référence inutile).
 */
export function toAuditConstraints(table: MpdTable, knownTables?: string[]): string[] {
  if (table.name === 'user') return []
  if (knownTables && !knownTables.includes('user')) return []
  return ['created_by', 'updated_by'].map((col) => {
    const name = `fk_${table.name}_${col}`
    return (
      `ALTER TABLE ${q(table.name)} ` +
      `ADD CONSTRAINT ${q(name)} FOREIGN KEY (${q(col)}) REFERENCES ${q('user')} (${q('id')}) ` +
      `ON DELETE SET NULL;`
    )
  })
}

// ===========================================================================
//  Générateur — vue « script »
// ===========================================================================

export interface ScriptNodeOptions {
  /**
   * Tables créées par la figure. Une FK vers une table absente est commentée
   * plutôt que déclarée, pour que le script reste exécutable.
   */
  knownTables: string[]
}

/**
 * Bloc de script affichant le `CREATE TABLE` d'une table.
 *
 * Le commentaire de tête n'est pas un commentaire SQL : il est rendu dans
 * l'en-tête du bloc (pastille `CREATE TABLE`, nom, origine MCD, badge), pour
 * qu'on puisse lire la figure sans que le script soit bruité. Seul le corps du
 * `CREATE TABLE` est présenté comme du SQL.
 */
export function toScriptNode(
  table: MpdTable,
  position: { x: number; y: number },
  options: ScriptNodeOptions,
): EntityNode {
  const sql = toCreateTable(table, { knownTables: options.knownTables })
  const auditCols = AUDIT_COLUMNS.map((c) => c.name).join(', ')

  return {
    id: `sql-${table.name}`,
    type: 'entity',
    position,
    data: {
      label: table.name,
      variant: 'mpd-sql',
      badge: table.junction ? 'JONCTION' : 'TABLE',
      mcd: table.mcd,
      meta: table.note,
      sql,
      lineCount: sql.split('\n').length,
      auditNote: `colonnes systématiques (règle 7) : ${auditCols}`,
    },
  }
}

/** Bloc de légende : à quoi correspond chaque couleur du script. */
export function toLegendNode(position: { x: number; y: number }): EntityNode {
  return {
    id: 'sql-legende',
    type: 'entity',
    position,
    data: {
      label: 'Légende',
      variant: 'mpd-sql',
      badge: 'LECTURE',
      sqlLegend: LEGEND,
    },
  }
}

export const LEGEND: SqlLegendItem[] = [
  { kind: 'keyword', label: 'Mot-clé SQL', sample: 'CREATE TABLE' },
  { kind: 'type', label: 'Type physique', sample: 'int unsigned' },
  { kind: 'ident', label: 'Identifiant', sample: 'campaigns' },
  { kind: 'constraint', label: 'Contrainte', sample: 'PRIMARY KEY' },
  { kind: 'policy', label: 'Politique de suppression', sample: 'ON DELETE CASCADE' },
  { kind: 'literal', label: 'Valeur par défaut', sample: 'CURRENT_TIMESTAMP' },
  { kind: 'audit', label: 'Colonne systématique (règle 7)', sample: 'created_at' },
]

