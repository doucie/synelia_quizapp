import type { DiagramDefinition } from '../../../types'
import { MPD_ENTRETIENS } from '../mpd/schema'
import { buildScriptFigure } from './layout'

/**
 * Figure « script SQL » — domaine Entretiens & utilisateurs (9 tables).
 *
 * `user` est créée en premier : c'est la cible des 5 colonnes d'audit `created_by`
 * / `updated_by` de tout le schéma, ainsi que de `interview_evaluator.user_id`.
 * Les contraintes d'audit correspondantes sont donc déclarables dans cette
 * figure (et seulement dans celle-ci) — voir `toAuditConstraints()`.
 *
 * Seule exception : `companies` n'est pas dans le périmètre des 21 tables, donc
 * `user.company_id` est commentée dans le script.
 */
export const scriptEntretiens: DiagramDefinition = buildScriptFigure({
  id: 'mpd-sql-entretiens',
  title: 'Script SQL — entretiens & utilisateurs',
  domain: 'Entretiens & utilisateurs',
  tables: MPD_ENTRETIENS,
  order: [
    // Socle : comptes et référentiels
    'user',
    'evaluation_grid_template',
    'evaluation_grid_template_version',
    'evaluation_grid_criterion',
    // Entretien
    'interviews',
    'convocation',
    'interview_evaluator',
    // Évaluation
    'evaluations',
    'evaluation_item',
  ],
})
