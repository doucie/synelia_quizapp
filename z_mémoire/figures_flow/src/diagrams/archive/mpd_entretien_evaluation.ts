// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const entretienEvaluation: DiagramDefinition = {
  id: 'mpd-entretien-evaluation',
  title: 'Entretien & Évaluation',
  category: 'archive',
  domain: 'Entretien & Évaluation',
  nodes: [
    {
      id: 'interviews',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'interviews',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'application_progress_id', isFK: true, type: 'int unsigned NN' },
          { name: 'campaign_id', isFK: true, type: 'int unsigned' },
          { name: 'interview_date', type: 'datetime NN' },
          { name: 'interview_type', type: 'varchar(20)' },
          { name: 'interview_location', type: 'varchar(255)' },
          { name: 'meet_link', type: 'varchar(500)' },
          { name: 'interview_status', type: 'varchar(20)' },
        ],
      },
    },
    {
      id: 'candidate_interview',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'candidate_interview',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'interview_id', isFK: true, type: 'int unsigned NN' },
          { name: 'decline_reason', type: 'varchar(500)' },
          { name: 'candidate_response_status', type: 'varchar(30)' },
        ],
      },
    },
    {
      id: 'interview_participant',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'interview_participant',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'interview_id', isFK: true, type: 'int unsigned NN' },
          { name: 'user_id', isFK: true, type: 'int unsigned NN' },
          { name: 'can_update', type: 'tinyint(1)' },
          { name: 'can_evaluate', type: 'tinyint(1)' },
          { name: 'evaluation_status', type: 'varchar(20)' },
        ],
      },
    },
    {
      id: 'evaluations',
      type: 'entity',
      position: { x: 700, y: 150 },
      data: {
        label: 'evaluations',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'candidate_interview_id', isFK: true, type: 'int unsigned NN' },
          { name: 'interview_participant_id', isFK: true, type: 'int unsigned NN' },
          { name: 'evaluation_status', type: 'varchar(20)' },
          { name: 'submitted_at', type: 'datetime' },
          { name: 'global_score', type: 'double' },
        ],
      },
    },
    {
      id: 'evaluation_item',
      type: 'entity',
      position: { x: 1050, y: 150 },
      data: {
        label: 'evaluation_item',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'evaluation_id', isFK: true, type: 'int unsigned NN' },
          { name: 'criterion_id', isFK: true, type: 'int unsigned NN' },
          { name: 'score_value', type: 'double' },
          { name: 'text_value', type: 'text' },
          { name: 'weight_snapshot', type: 'double' },
        ],
      },
    },
    {
      id: 'pipeline_stage_criterion',
      type: 'entity',
      position: { x: 1050, y: -100 },
      data: {
        label: 'pipeline_stage_criterion',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'pipeline_stage_id', isFK: true, type: 'int unsigned NN' },
          { name: 'criterion_order', type: 'int NN' },
          { name: 'label', type: 'varchar(255) NN' },
          { name: 'criterion_type', type: 'varchar(20) NN' },
          { name: 'max_score', type: 'int' },
          { name: 'weight', type: 'double' },
        ],
      },
    },
    {
      id: 'evaluation_grid',
      type: 'entity',
      position: { x: 1400, y: -100 },
      data: {
        label: 'evaluation_grid',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'name', type: 'varchar(255) NN' },
          { name: 'description', type: 'text' },
          { name: 'is_active', type: 'tinyint(1)' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-interview-candint',
      source: 'interviews',
      target: 'candidate_interview',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-interview-participant',
      source: 'interviews',
      target: 'interview_participant',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-interview-eval',
      source: 'interviews',
      target: 'evaluations',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-eval-items',
      source: 'evaluations',
      target: 'evaluation_item',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-item-criterion',
      source: 'evaluation_item',
      target: 'pipeline_stage_criterion',
      type: 'relationship',
      data: {},
    },
    {
      id: 'e-criterion-grid',
      source: 'pipeline_stage_criterion',
      target: 'evaluation_grid',
      type: 'relationship',
      data: { isDashed: true },
    },
  ],
}

