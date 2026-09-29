import type { DiagramDefinition } from '../../../types'
import { MPD_CAMPAGNES } from '../mpd/schema'
import { buildScriptFigure } from './layout'

/**
 * Figure « script SQL » — domaine Campagnes & candidatures (12 tables).
 *
 * L'ordre du tableau `order` EST l'ordre d'exécution : une table est déclarée
 * après toutes celles qu'elle référence, à deux exceptions près, signalées dans
 * les blocs concernés (`specialities`, `source_token` absentes des 21 tables ;
 * `user` et `evaluation_grid_template_version` traitées en figure 2).
 *
 * Chaque bloc est donc copiable et exécutable tel quel, dans l'ordre.
 */
export const scriptCampagnes: DiagramDefinition = buildScriptFigure({
  id: 'mpd-sql-campagnes',
  title: 'Script SQL — campagnes & candidatures',
  domain: 'Campagnes & candidatures',
  tables: MPD_CAMPAGNES,
  order: [
    // Socle du modèle de pipeline
    'pipeline_template',
    'form',
    'campaigns',
    'form_version',
    'pipeline_stage',
    // Formulaires et questions
    'campaign_form',
    'question',
    'form_questions',
    'answer',
    // Parcours d’une candidature
    'applications',
    'application_progress',
    'decisions',
  ],
})
