import type { Node, Edge } from '@xyflow/react'
import type { SqlTokenKind } from '../utils/sqlTokens'

export type Category = 'mcd' | 'mld' | 'mpd' | 'mpd-sql' | 'traitements' | 'archive' | 'palette' | 'mot' | 'organigramme' | 'memoire'

export type ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-syncop' | 'mct-operation' | 'mct-result' | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane' | 'mpt-layer' | 'mot-matrix'

export type Variant = 'mcd' | 'mld' | 'mpd' | 'mpd-sql' | 'org-box' | 'actor' | 'scope' | 'quadrant' | 'decision' | 'stack' | 'persona' | 'state' | 'auth' | 'notif' | 'bf' | 'rings' | 'hub' | 'rg' | 'versus' | 'tree' | 'deploy' | ProcessVariant

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
  /** Initiale affichée dans le cercle d’un acteur du mémoire. */
  actorInitial?: string
  /** Phrase-fonction affichée sous le rôle d’un acteur du mémoire. */
  actorFunction?: string
  /** Filet commun d’alignement, sans acteur ni texte. */
  actorRule?: boolean
  /** Rôle d’un nœud de périmètre : cadre composite, ligne ou légende. */
  scopeKind?: 'frame' | 'item' | 'caption'
  /** Lignes rendues dans un cadre de périmètre (variante `scope`, `frame`). */
  scopeItems?: string[]
  /** Ton d’une ligne de périmètre : mise en avant ou mise en retrait. */
  scopeTone?: 'included' | 'excluded'
  /** Rôle d’un nœud de quadrant : fond, pastille, étiquette, axe ou libellé. */
  quadKind?: 'zone' | 'dot' | 'tag' | 'hline' | 'vline' | 'axisLabel'
  /** Couleur de la pastille d’un point de quadrant. */
  quadColor?: string
  /** Légende courte sous le nom d’un point de quadrant. */
  quadLegend?: string
  /** Alignement du texte d’un libellé d’axe de quadrant. */
  quadAlign?: 'left' | 'center' | 'right'
  /** Teintes des quatre zones d’un fond de quadrant (haut-gauche, haut-droit, bas-gauche, bas-droit). */
  quadCells?: [string, string, string, string]
  /** Rôle d’un nœud d’arbre de décision : question, réponse, feuille écartée ou feuille retenue. */
  decisionKind?: 'question' | 'answer' | 'out' | 'kept'
  /** Justificatif court sous le nom d’une feuille d’arbre de décision. */
  decisionNote?: string
  /** Logo affiché sur une feuille d’arbre de décision (SVG inline, Simple Icons). */
  decisionLogo?: 'mysql' | 'postgresql' | 'mongodb' | 'mariadb' | 'angular' | 'springboot' | 'flyway'
  /** Rôle d’un nœud de tour technique : couche, bandeau transversal ou légende. */
  stackKind?: 'layer' | 'band' | 'caption'
  /** Logo d’une couche de la tour (SVG inline, recoloré en accent SAFE_HUES). */
  stackLogo?: 'mysql' | 'angular' | 'springboot' | 'flyway'
  /** Accent SAFE_HUES d’une couche (logo + nom). */
  stackColor?: string
  /** Raison du choix, une ligne du tableau de synthèse, raccourcie sans changer le sens. */
  stackReason?: string
  /** Alternatives envisagées puis écartées, en fantômes (verbatim du tableau). */
  stackGhosts?: string[]
  /** Avatar illustré d’une fiche persona (DiceBear inline, même style). */
  personaAvatar?: 'candidat' | 'recruteur' | 'admin' | 'superadmin'
  /** Couleur du rôle d’une fiche persona (teinte fig. 1 : 210/240/285/330). */
  personaColor?: string
  /** Attentes principales d’une fiche persona (verbatim du tableau 3.1.1). */
  personaAttentes?: string
  /** Risque métier d’une fiche persona (verbatim du tableau 3.1.1). */
  personaRisque?: string
  /** Conséquence sur la conception (verbatim du tableau 3.1.1). */
  personaConception?: string
  /** Rôle d’un nœud de machine à états : départ, état actif ou terminal, fantôme, lecture dossier ou étiquette. */
  stateKind?: 'start' | 'active' | 'terminal' | 'ghost' | 'dossier' | 'tag'
  /** Précision sous le nom d’un état actif (rôle de l’étape dans le cycle). */
  stateDesc?: string
  /** Ton d’un état : terminaux (vert, rouge, gris) ou occurrence (bleus, vert, ambre). */
  stateTone?: 'kept' | 'rejected' | 'muted' | 'pending' | 'active' | 'done' | 'skipped'
  /** Rôle d’un nœud de fourche d’authentification : départ, bandeau de branche, étape ou convergence. */
  authKind?: 'start' | 'band' | 'step' | 'merge'
  /** Icône Feather d’une étape de fourche (jeux partagé `Nodes/icons.tsx`). */
  authIcon?: 'key' | 'shield' | 'users' | 'lock' | 'link' | 'mail' | 'hash' | 'usercheck'
  /** Teinte SAFE_HUES de la branche d’une étape ou d’un bandeau de fourche. */
  authColor?: string
  /** Rôle d’un nœud de correspondance notifications : événement ou canal. */
  notifKind?: 'event' | 'channel'
  /** Icône Feather d’un canal de notification (jeu partagé `Nodes/icons.tsx`). */
  notifIcon?: 'bell' | 'mail'
  /** Accent SAFE_HUES d’un canal de notification (nom + médaillon). */
  notifColor?: string
  /** Identifiant d’une carte de besoins fonctionnels (`BF-01`…`BF-08`). */
  bfId?: string
  /** Icône d’une carte de besoins fonctionnels (jeu partagé `Nodes/icons.tsx`). */
  bfIcon?: 'lock' | 'layers' | 'megaphone' | 'inbox' | 'checksquare' | 'calendar' | 'bell' | 'grid'
  /** Teinte de famille d’une carte de besoins fonctionnels (socle / parcours / transverse). */
  bfColor?: string
  /** Phrase-attente d’une carte de besoins fonctionnels (verbatim matrice, raccourcie sans changer le sens). */
  bfDesc?: string
  /** Anneau d’acteur d’une figure concentrique (variante `rings`, du centre vers l’extérieur). */
  rings?: RingData[]
  /** Titre du hub central d’une figure en étoile (variante `hub`). */
  hubTitle?: string
  /** Rayons du hub (variante `hub`, ordre horaire depuis le haut). */
  spokes?: HubSpoke[]
  /** Colonnes du kanban des règles de gestion (variante `rg`). */
  rgCols?: RgColumn[]
  /** Lignes de balance Merise/UML (variante `versus`, 3-3 projet). */
  versusRows?: VersusRow[]
  /** Verdict en deux parties (contexte Merise, contexte UML) du bandeau de synthèse (variante `versus`). */
  versusVerdict?: [string, string]
  /** Titre racine de l’arborescence de dépôt (variante `tree`). */
  treeTitle?: string
  /** Branches de l’arborescence de dépôt (variante `tree`, ordre d’affichage). */
  treeBranches?: TreeBranch[]
  /** Rôle d’un nœud de déploiement : cadre conteneur ou service (variante `deploy`). */
  deployKind?: 'frame' | 'service'
  /** Titre d’un cadre de déploiement (variante `deploy`, `frame`). */
  deployTitle?: string
  /** Cadre en tirets = conteneurisé (variante `deploy`, `frame`). */
  deployDashed?: boolean
  /** Logo d’un service ou d’un cadre (variante `deploy`, jeu `logos.tsx`). */
  deployLogo?: DeployLogo
  /** Icône Feather d’un cadre (variante `deploy`, `frame`) : marques via `deployLogo`, symboles via `deployIcon`. */
  deployIcon?: 'monitor'
  /** Illustration d’un cadre ou d’un service (variante `deploy`, `deployArt.tsx`).
   * `host-machine` : le cadre hôte EST le poste (coque + lunette + pied + tour). */
  deployArt?: 'host-machine' | 'browser' | 'containers'
  /** Illustration après le titre (variante `deploy`, `frame`) plutôt qu’avant. */
  deployArtAfter?: boolean
  /** Port mis en évidence d’un service déployé (variante `deploy`, `service`). */
  deployPort?: string
  /** Précision sous le nom d’un service (variante `deploy`, `service`). */
  deployNote?: string
  /** Badge d’un service (ex. EXTERNE) (variante `deploy`, `service`). */
  deployBadge?: string
  /** Accent SAFE_HUES d’un service ou d’un logo (variante `deploy`). */
  deployAccent?: string
  /**
   * Largeur px explicite de la racine d’export (`[data-export-root]`).
   *
   * Les largeurs en `%` (`w-full`) ne survivent pas au clone de capture :
   * l’enveloppe clonée perd sa largeur calculée et la racine se rétracte sur
   * son contenu, alignée à gauche — alors que le raster, lui, garde les
   * dimensions mesurées sur le live. Toute racine dont la largeur porte la
   * géométrie DOIT donc la poser ici, en px inline (cf. `regles_export_svg`,
   * §8). Rester cohérent avec le `width` du `style` du nœud dans le modèle.
   */
  exportWidth?: number
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
  /**
   * Niveau hiérarchique d'une boîte d'organigramme, qui décide de son style.
   *
   * L'organigramme d'origine distingue déjà les niveaux par la boîte et non par
   * le trait : les services sont les seules boîtes à fond blanc et à bordure
   * gauche fine. Retiré de ce niveau, ce signal — le seul qui reste une fois les
   * liens sous les directions supprimés.
   *
   * Par défaut `dir`, le style le plus proche de l'ancien style unique.
   */
  orgLevel?: 'gov' | 'dir' | 'svc'
}

export interface SqlLegendItem {
  kind: SqlTokenKind
  label: string
  sample: string
}

/** Un anneau d’acteur : rôle, teinte, initiale et phrase résumé du callout. */
export interface RingData {
  role: string
  color: string
  initial: string
  summary: string
}

/** Un rayon du hub qualité : identifiant, nom, icône et critère du médaillon. */
export interface HubSpoke {
  id: string
  name: string
  icon: 'zap' | 'shield' | 'checkcircle' | 'eye' | 'tool' | 'search' | 'award'
  criterion: string
}

/** Une carte règle→effet d’une colonne de règles de gestion. */
export interface RgCard {
  id: string
  name: string
  rule: string
  effect: string
}

/** Une colonne du kanban des règles de gestion : bandeau + cartes. */
export interface RgColumn {
  title: string
  icon: 'lock' | 'database' | 'sliders' | 'search'
  color: string
  cards: RgCard[]
}

/** Une ligne de balance Merise/UML : critère projet, deux positions, penchant, intensité. */
export interface VersusRow {
  criterion: string
  left: string
  right: string
  /** Camp vers lequel penche le point (`null` = neutre, aucun surlignage). */
  winner: 'left' | 'right' | null
  /** Point « net » (surlignage fort) ou « léger ». Inutilisé si neutre. */
  strong: boolean
}

/** Une branche de l’arborescence de dépôt : nom, sous-titre, logo, description. */
export interface TreeBranch {
  name: string
  sub: string
  logo: 'angular' | 'springboot' | 'docker'
  color: string
  desc: string
}

/** Logo d’un service déployé ou d’un cadre conteneurisé (variante `deploy`). */
export type DeployLogo = 'angular' | 'springboot' | 'mysql' | 'redis' | 'minio' | 'docker'

export type EntityNode = Node<EntityNodeData, 'entity'>

export interface RelationshipEdgeData {
  label?: string
  /**
   * Corps en px de la pastille `label` de `TraitementEdge`. 10 par défaut
   * (calibré pour le MCT, texte à 12 px) ; l’arbre de décision du mémoire,
   * dont le texte est à 24 px, le porte à 22. Opt-in par arête : le défaut
   * fige le rendu des figures existantes.
   */
  labelPx?: number
  /**
   * Couleur de bordure de la pastille `label` (`TraitementEdge`), assortie à
   * la cible (ex. rouge vers REJETÉ). Sans elle : bordure `muted` 2 px.
   * `data.label` n’est utilisé que par la figure 4.3.3.
   */
  labelBorder?: string
  /**
   * Ignore l’offset d’ancrage partagé (`edgePathOffset`) des deux côtés.
   *
   * Quand plusieurs arêtes touchent le même ancrage, l’offset les éventaille
   * (±14 px à 2) : sur une descente droite (même abscisse en source et cible),
   * un offset d’un seul côté dessine un coude. Les descentes survivantes de
   * l’arbre de décision le posent pour rester pile sur l’axe. Opt-in par
   * arête : le défaut fige le rendu des figures existantes.
   */
  noAnchorOffset?: boolean
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
  /**
   * Tracer l'arête en courbe de Bézier au lieu du tracé en escalier.
   *
   * Même statut que `straight` : opt-in posé par la figure (`data.curved`),
   * jamais deviné par le composant. À ce jour, seule la correspondance
   * notifications l’utilise — l’export recopie le `d`, aucun coût côté
   * `exportSvg.ts`.
   */
  curved?: boolean
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
   * Couleur du trait, en CSS. Sinon `OrgBusEdge` retombe sur la couleur d'arête
   * par défaut de l'application, ce qui rend impossible de distinguer une branche
   * de gouvernance d'un rattachement latéral.
   *
   * Lue aussi par `TraitementEdge` (sélection prioritaire, défaut inchangé
   * sinon) : l’arbre de décision du mémoire colore ainsi ses descentes
   * survivantes en vert.
   *
   * L'organigramme d'origine utilise trois traitements : gris 2 px pour la
   * chaîne de gouvernance et la barre, teinte de l'entité 1,7 px en tirets pour
   * le PMO, teinte de la direction 1,2 px pour les liens vers les services.
   */
  stroke?: string
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
   * Pile de fontes de la figure, appliquée par héritage sur la racine du canevas.
   *
   * **Une figure dont les hauteurs sont un relevé doit épingler sa fonte.**
   *
   * `useFontPreference` laisse le sélecteur de la toolbar écrire `--font-sans` sur
   * `documentElement` : le choix de l'utilisateur est cosmétique, mais il change la
   * largeur du texte, donc le nombre de lignes, donc la hauteur des cartes. Or les
   * positions, elles, sont calculées à partir des planchers — un relevé pris dans
   * une seule fonte. Changer de fonte recalcule donc les hauteurs **sans**
   * recalculer les positions, et les cartes se recouvrent.
   *
   * Concretement, sur l'organigramme : « Trésorerie / Comptabilité » tient sur une
   * ligne en Cabinet Grotesk (61 px) et sur deux en Poppins (100 px), alors que le
   * plancher vaut 61 et que l'entraxe vaut 79. Le même texte, dans la même figure,
   * mesures 24 px de large de plus.
   *
   * Poser ce champ neutralise le sélecteur **pour la figure seulement** : la
   * toolbar et la sidebar gardent la fonte choisie par l'utilisateur. L'export
   * recopie la valeur calculée sur son wrapper (`utils/exportSvg.ts`), sans quoi le
   * clone — reparenté sous `body` — perdrait l'héritage et retomberait sur la
   * préférence du navigateur : le SVG exporté dépendrait alors de qui l'exporte.
   *
   * Choisir une pile dont les replis sont **plus étroits** que la fonte de référence
   * rend la figure résistante à un échec de chargement : le reflux réduit le
   * nombre de lignes, jamais l'inverse.
   *
   * Réservé aux figures rigides. Les figures déplaçables suivent la préférence :
   * leurs positions sont stockées par nœud, un reflux les déforme sans les
   * superposer de façon systématique.
   */
  fontFamily?: string
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
