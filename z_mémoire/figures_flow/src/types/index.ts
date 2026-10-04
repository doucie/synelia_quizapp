import type { Node, Edge } from '@xyflow/react'
import type { SqlTokenKind } from '../utils/sqlTokens'

export type Category = 'mcd' | 'mld' | 'mpd' | 'mpd-sql' | 'traitements' | 'archive' | 'palette' | 'mot' | 'organigramme'

export type ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-syncop' | 'mct-operation' | 'mct-result' | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane' | 'mpt-layer' | 'mot-matrix'

export type Variant = 'mcd' | 'mld' | 'mpd' | 'mpd-sql' | 'org-box' | ProcessVariant

export interface Attribute {
  name: string
  type?: string
  isPK?: boolean
  isFK?: boolean
  isNew?: boolean
  isDeleted?: boolean
  nullable?: boolean
  description?: string
}

export interface MotTreatmentData {
  id: string
  label: string
  nature: string
  actor: string
  triggeringEvent: string
  mctEvents: string[]
  mctSync: string
  mctOperation: { label: string, items: string[], rules: string[] }
  mctResults: Array<{ label: string, rule: string, fail?: boolean }>
}

export interface EntityNodeData {
  label: string
  variant: Variant
  attributes?: Attribute[]
  color?: string
  badge?: string
  syncLabel?: string
  /**
   * Taille en px du libellé de synchronisation, multipliée par `--mct-sync-scale`.
   * 12 par défaut. Passé à 9 par le nœud qui porte la formule de T7
   * (`(RET OU REF) ET DA`), le seul libellé assez long pour sortir du gabarit :
   * le pentagone reste ainsi proportionné à l'opération qu'il surmonte.
   */
  syncFontSize?: number
  items?: string[]
  emissionRules?: string[]
  rule?: string
  meta?: string
  detail?: string
  expression?: string
  fail?: boolean
  layer?: string
  dimensions?: { width: number; height: number }
  motMatrix?: { columns: string[], treatments: MotTreatmentData[] }
  /**
   * Vue « script » du MPD : le contenu d'un `CREATE TABLE` prêt à être lu
   * (coloration syntaxique) puis exporté en SVG pour le mémoire.
   * Déclenche la variante `mpd-sql` d'`EntityNode`.
   */
  sql?: string
  /** Entité MCD d'origine, affichée en sous-titre du bloc de script (règle 12). */
  mcd?: string
  /** Nombre de lignes du bloc, affiché dans l'en-tête. */
  lineCount?: number
  /** Aperçu du texte des colonnes systématiques (règle 7), hors figure « tables ». */
  auditNote?: string
  /** Légende de lecture de la vue « script » (couleur → signification). */
  sqlLegend?: SqlLegendItem[]
  /**
   * Sur-titre d'une boîte d'organigramme (variante `org-box`) : le rôle rendu
   * en capitales au-dessus du libellé, dans la couleur de la boîte. Absent sur
   * les simples services, qui n'ont qu'un libellé et un titulaire.
   */
  eyebrow?: string
  /** Titulaire d'une boîte d'organigramme, rendu en second ligne, atténué. */
  person?: string
  /**
   * Hauteur plancher de la carte, en px.
   *
   * À ne pas confondre avec `height`, que l'export abandonne (cf.
   * `captureNodePadded`) : `min-height` est un longhand distinct, il survit au
   * `clone.style.height = 'auto'`. Il donne donc des boîtes de hauteur identique
   * par rangée, sur l'écran comme dans le SVG, tout en laissant la boîte grandir
   * si le contenu déborde réellement.
   *
   * Lu par `OrgNode` et posé sur la **carte**, pas sur le `style` du nœud : la
   * cible de l'export est la carte interne, pas le wrapper `react-flow__node`.
   */
  minHeight?: number
}

export interface SqlLegendItem {
  kind: SqlTokenKind
  label: string
  sample: string
}

export type EntityNode = Node<EntityNodeData, 'entity'>

export interface RelationshipEdgeData {
  label?: string
  cardFrom?: string
  cardTo?: string
  roleFrom?: string
  roleTo?: string
  cardFromSide?: 'source' | 'left' | 'right' | 'top' | 'bottom'
  cardToSide?: 'source' | 'left' | 'right' | 'top' | 'bottom'
  isStrong?: boolean
  isDashed?: boolean
  /**
   * Tracer l'arête en segment droit au lieu du tracé en escalier.
   *
   * Posé par `DiagramCanvas` d'après l'id de la figure (`data.straight`), jamais
   * par le composant d'arête lui-même : la règle « quelles figures sont droites »
   * est ainsi écrite à un seul endroit. À ce jour, seules les figures MCT le sont.
   */
  straight?: boolean
  diagramId?: string
  attributes?: string[]
  reflexOffset?: number
  reflexSpread?: number
  roleFromPos?: number
  roleToPos?: number
  roleFromSense?: 'auto' | 'forward' | 'backward'
  roleToSense?: 'auto' | 'forward' | 'backward'
  /**
   * Hauteur de la barre de distribution, en px sous le bord du nœud source.
   *
   * Lue par `OrgBusEdge` uniquement. Comme des frères partagent le même parent,
   * ils en déduisent le même `busY` sans coordination : leurs segments
   * horizontaux se recouvrent et forment une barre continue.
   */
  busGap?: number
  /** Rayon des angles de la barre de distribution. 0 = angles vifs. */
  busRadius?: number
  /**
   * Fraction de la descente à laquelle se fait la course horizontale, entre 0
   * (au bord du source) et 1 (sur la barre, le défaut).
   *
   * Lue par `OrgBusEdge` uniquement. Permet à une branche de s'accrocher au
   * **milieu du tronc** d'un parent au lieu de partir de la boîte elle-même ou de
   * descendre jusqu'à la barre — c'est ainsi que le PMO s'attache à la liaison
   * qui descend du SG. `busGap` doit rester aligné sur celui des frères pour que
   * la fraction porte sur le même segment visible.
   */
  trunkFraction?: number
}

export type RelationshipEdge = Edge<RelationshipEdgeData>

export type ProcessEdgeData = RelationshipEdgeData

export type ProcessEdge = Edge<ProcessEdgeData>

export interface MotTableConfig {
  colWidths: { temps: number; recruteur: number; candidat: number; systeme: number; type: number }
  rowHeights: number[]
  fontScale: number
  mctFontScales: { event: number; operation: number; result: number; sync: number }
}

export const DEFAULT_MOT_TABLE_CONFIG: MotTableConfig = {
  colWidths: { temps: 150, recruteur: 600, candidat: 600, systeme: 600, type: 150 },
  rowHeights: [400, 400, 400, 400, 400, 400, 400],
  fontScale: 1.0,
  mctFontScales: { event: 1.0, operation: 1.0, result: 1.0, sync: 1.0 },
}

export interface DiagramDefinition {
  id: string
  title: string
  category: Category
  domain: string
  nodes: EntityNode[]
  edges: RelationshipEdge[]
  /**
   * Groupes d'éléments déplaçables d'un bloc (un « traitement »).
   *
   * `prefix` doit correspondre au préfixe d'identifiant porté par les nœuds du
   * groupe : c'est lui qui sert de critère d'appartenance. Présent uniquement sur
   * les figures qui contiennent plusieurs traitements (MCT combinée) ; son
   * absence désactive complètement l'encadrement et le verrou.
   */
  sections?: DiagramSection[]
  /**
   * Échelle typographique de la figure, appliquée via `--org-font-scale`.
   *
   * La figure est dessinée pour l'impression : la taille de police utile se calcule
   * sur la largeur du canevas, pas sur le zoom de l'écran. Une figure large impose
   * donc une police large pour conserver le même corps une fois réduite à la
   * largeur d'une page A4. 1 par défaut ; n'expose qu'un curseur, pas une géométrie.
   */
  fontScale?: number
  /**
   * Figure au placement **imposé** : ses nœuds ne se déplacent pas.
   *
   * Réservé aux figures dont la géométrie est le contenu — un organigramme n'a
   * rien à arranger, contrairement à un MCD ou un MLD où l'on repositionne des
   * entités pour les désempiler. Le drapeau n'est lu que par `DiagramCanvas` :
   * il ignore les positions sauvegardées, les efface au chargement, et coupe le
   * glissement, la reconnexion d'arête, la sélection et la suppression au clavier.
   * Le panoramique et le zoom restent actifs — sans quoi la figure serait
   * consultable seulement en export.
   */
  rigidLayout?: boolean
}

export interface DiagramSection {
  /** Identifiant court affiché sur l'encadrement — `t0`, `t1`, … */
  id: string
  /** Préfixe d'identifiant des nœuds du groupe — `t0-`, `t1-`, … */
  prefix: string
  /** Libellé complet, à usage informative. */
  label: string
}
