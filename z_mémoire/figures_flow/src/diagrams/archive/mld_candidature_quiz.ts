// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const candidatureQuiz: DiagramDefinition = {
  id: 'mld-candidature-quiz',
  title: 'Candidature & Quiz',
  category: 'archive',
  domain: 'Candidature & Quiz',
  nodes: [
    {
      id: 'applications',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'candidature',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'candidate_first_name' },
          { name: 'candidate_last_name' },
          { name: 'candidate_email' },
          { name: 'candidate_phone' },
          { name: 'candidate_cv_path' },
          { name: 'motivation_letter' },
          { name: 'source_token_id', isFK: true },
          { name: 'form_version_id', isFK: true },
        ],
      },
    },
    {
      id: 'application_progress',
      type: 'entity',
      position: { x: 350, y: 0 },
      data: {
        label: 'avancement',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'application_id', isFK: true },
          { name: 'pipeline_stage_id', isFK: true },
          { name: 'progress_status' },
          { name: 'started_at' },
          { name: 'completed_at' },
          { name: 'score' },
        ],
      },
    },
    {
      id: 'quiz_attempt',
      type: 'entity',
      position: { x: 700, y: -150 },
      data: {
        label: 'tentative_quiz',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'application_id', isFK: true },
          { name: 'application_progress_id', isFK: true },
          { name: 'form_version_id', isFK: true },
          { name: 'quiz_token' },
          { name: 'quiz_status' },
          { name: 'score' },
          { name: 'score_percent' },
        ],
      },
    },
    {
      id: 'candidate_answer',
      type: 'entity',
      position: { x: 1050, y: -150 },
      data: {
        label: 'reponse_candidat',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'quiz_attempt_id', isFK: true },
          { name: 'question_id', isFK: true },
          { name: 'answer_id', isFK: true },
          { name: 'is_selected' },
          { name: 'free_text_response' },
        ],
      },
    },
    {
      id: 'decisions',
      type: 'entity',
      position: { x: 700, y: 150 },
      data: {
        label: 'decision',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'application_progress_id', isFK: true },
          { name: 'user_id', isFK: true },
          { name: 'decision_type' },
          { name: 'justification' },
        ],
      },
    },
    {
      id: 'candidate_ask',
      type: 'entity',
      position: { x: 350, y: 200 },
      data: {
        label: 'demande_candidat',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'application_id', isFK: true },
          { name: 'request_type' },
          { name: 'ask_status' },
          { name: 'new_email' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-app-progress',
      source: 'applications',
      target: 'application_progress',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-progress-quiz',
      source: 'application_progress',
      target: 'quiz_attempt',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-quiz-answers',
      source: 'quiz_attempt',
      target: 'candidate_answer',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-progress-decision',
      source: 'application_progress',
      target: 'decisions',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-app-ask',
      source: 'applications',
      target: 'candidate_ask',
      type: 'relationship',
      data: {},
    },
  ],
}

