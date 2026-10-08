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
 * d’`edgeAnchors.ts`. Arêtes `type: 'traitement'`, toutes muettes : l’exception
 * se lit au pointillé seul, son explication est dans le caption du mémoire
 * (pastille et légende supprimées — illisibles à cette échelle).
 */

const INAPP = 'hsl(210, 100%, 40%)'
const EMAIL = 'hsl(330, 100%, 40%)'

// Trois colonnes (email à gauche, événements au milieu, in-app à droite) :
// chaque événement part à gauche vers l’email et à droite vers l’in-app —
// aucun trait n’en croise un autre (en deux colonnes, le haut-gauche vers le
// bas-droit croisait toujours le bas-gauche vers le haut-droit).
const EVT_W = 400
const EVT_X = 620
const EVT_MIN = 96
const CH_W = 420
const MAIL_X = 40
const INAPP_X = 1200
const CH_Y = 330
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
  label: string,
  notifIcon: 'bell' | 'mail',
  notifColor: string,
  x: number,
) => ({
  id,
  type: 'entity' as const,
  position: { x, y: CH_Y },
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

const edge = (
  id: string,
  source: string,
  target: string,
  sourceHandle: 'left' | 'right',
  targetHandle: 'left' | 'right',
  data = {},
) => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
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
    channel('ch-mail', 'Email transactionnel', 'mail', EMAIL, MAIL_X),
    channel('ch-inapp', 'Notification interne (in-app)', 'bell', INAPP, INAPP_X),
  ],
  edges: [
    edge('e-e1-mail', 'e1', 'ch-mail', 'left', 'right'),
    edge('e-e1-inapp', 'e1', 'ch-inapp', 'right', 'left'),
    edge('e-e2-mail', 'e2', 'ch-mail', 'left', 'right'),
    edge('e-e2-inapp', 'e2', 'ch-inapp', 'right', 'left'),
    edge('e-e3-mail', 'e3', 'ch-mail', 'left', 'right'),
    edge('e-e3-inapp', 'e3', 'ch-inapp', 'right', 'left'),
    edge('e-e4-mail', 'e4', 'ch-mail', 'left', 'right'),
    edge('e-e4-inapp', 'e4', 'ch-inapp', 'right', 'left'),
    edge('e-e5-mail', 'e5', 'ch-mail', 'left', 'right'),
    edge('e-e5-inapp', 'e5', 'ch-inapp', 'right', 'left'),
    // Exception : le défaut de configuration ne sort qu’en interne, en
    // pointillés — sans pastille ni légende : à cette échelle elles sortaient
    // illisibles, et l’agrandir créait des collisions. L’explication est
    // portée par le caption du mémoire.
    edge('e-e6-inapp', 'e6', 'ch-inapp', 'right', 'left', {
      isDashed: true as const,
    }),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
