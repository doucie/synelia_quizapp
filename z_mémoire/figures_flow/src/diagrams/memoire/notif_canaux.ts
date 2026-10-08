import type { DiagramDefinition } from '../../types'

/**
 * Notifications — correspondance événement → canal (3.2.7).
 *
 * Plusieurs événements métier déclenchent un ou plusieurs canaux : une
 * relation plusieurs-à-plusieurs, avec une exception marquée clairement — le
 * défaut de configuration critique ne part qu’en pointillés vers la
 * notification interne (alerte technique, pas destinée au candidat).
 *
 * Libellés sourcés du 1er paragraphe de 3.2.7 (vérification, convocation,
 * réponse candidat, décision, défaut de configuration critique) et du brief.
 * Le dashboard (2ᵉ sujet de la section) n’a pas de figure : visibilité et
 * filtrage ne sont pas une relation de correspondance.
 *
 * Courbes de Bézier (`data.curved`, opt-in de `TraitementEdge`) : les 11
 * traits se croisent au centre — ce « chargé » volontaire illustre le flux
 * multiple vers peu de canaux. Pas de `noAnchorOffset` : l’éventail ±14 px
 * distingue les deux traits issus d’un même événement, et l’étalement en Y
 * sépare les arrivées sur chaque canal. Tous les handles sont déclarés
 * (`right` → `left`) : pas d’entrée dans les familles verticales
 * d’`edgeAnchors.ts`. Arêtes `type: 'traitement'`, muettes sauf l’exception
 * (pastille + légende).
 */

const INAPP = 'hsl(210, 100%, 40%)'
const EMAIL = 'hsl(330, 100%, 40%)'

const EVT_W = 440
const EVT_X = 40
const EVT_MIN = 96
const CH_W = 480
const CH_X = 720
const CH_MIN = 150

const event = (id: string, y: number, label: string) => ({
  id,
  type: 'entity' as const,
  position: { x: EVT_X, y },
  style: { width: EVT_W },
  data: {
    label,
    variant: 'notif' as const,
    notifKind: 'event' as const,
    minHeight: EVT_MIN,
    // Toujours égal à `EVT_W` (cf. `exportWidth`).
    exportWidth: EVT_W,
  },
})

const channel = (
  id: string,
  y: number,
  label: string,
  notifIcon: 'bell' | 'mail',
  notifColor: string,
) => ({
  id,
  type: 'entity' as const,
  position: { x: CH_X, y },
  style: { width: CH_W },
  data: {
    label,
    variant: 'notif' as const,
    notifKind: 'channel' as const,
    notifIcon,
    notifColor,
    minHeight: CH_MIN,
    // Toujours égal à `CH_W` (cf. `exportWidth`).
    exportWidth: CH_W,
  },
})

const edge = (id: string, source: string, target: string, data = {}) => ({
  id,
  source,
  target,
  sourceHandle: 'right',
  targetHandle: 'left',
  type: 'traitement' as const,
  data: { curved: true as const, ...data },
})

export const notifCanaux: DiagramDefinition = {
  id: 'memoire-notif-canaux',
  title: 'Notifications — correspondance événement → canal',
  category: 'memoire',
  domain: '3.2.7 — Notifications et dashboard',
  nodes: [
    event('e1', 40, 'Nouvelle candidature soumise'),
    event('e2', 170, 'Vérification d’email requise'),
    event('e3', 300, 'Convocation à un entretien'),
    event('e4', 430, 'Réponse du candidat reçue'),
    event('e5', 560, 'Décision rendue'),
    event('e6', 690, 'Défaut de configuration critique'),
    channel('ch-mail', 200, 'Email transactionnel', 'mail', EMAIL),
    channel('ch-inapp', 500, 'Notification interne (in-app)', 'bell', INAPP),
    {
      id: 'caption',
      type: 'entity' as const,
      position: { x: EVT_X, y: 830 },
      style: { width: EVT_W },
      data: {
        label:
          'Interne uniquement — alerte technique, pas destinée au candidat.',
        variant: 'notif' as const,
        notifKind: 'caption' as const,
        // Toujours égal à `EVT_W` (cf. `exportWidth`).
        exportWidth: EVT_W,
      },
    },
  ],
  edges: [
    edge('e-e1-mail', 'e1', 'ch-mail'),
    edge('e-e1-inapp', 'e1', 'ch-inapp'),
    edge('e-e2-mail', 'e2', 'ch-mail'),
    edge('e-e2-inapp', 'e2', 'ch-inapp'),
    edge('e-e3-mail', 'e3', 'ch-mail'),
    edge('e-e3-inapp', 'e3', 'ch-inapp'),
    edge('e-e4-mail', 'e4', 'ch-mail'),
    edge('e-e4-inapp', 'e4', 'ch-inapp'),
    edge('e-e5-mail', 'e5', 'ch-mail'),
    edge('e-e5-inapp', 'e5', 'ch-inapp'),
    // Exception : le défaut de configuration ne sort qu’en interne, en
    // pointillés, avec pastille bordure assortie (précédent fig. 7).
    edge('e-e6-inapp', 'e6', 'ch-inapp', {
      isDashed: true as const,
      label: 'interne uniquement',
      labelPx: 12,
      labelBorder: INAPP,
    }),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
