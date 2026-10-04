import type { DiagramDefinition, EntityNodeData } from '../../types'

/**
 * Organigramme du Groupe Synelia — gouvernance, directions et services.
 *
 * Remplace `figures_html/organigramme_synelia_avec_ag.html`, dont le tracé était
 * figé : les lignes étaient des `<line>` SVG écrites à la main, donc elles ne
 * suivaient ni un déplacement de boîte ni un changement dePolice, et
 * `preserveAspectRatio="none"` déformait l'ensemble. Ici les connecteurs sont
 * des arêtes : ils recalculent leur géométrie au zoom et à l'export.
 *
 * Trois rangs, lus de haut en bas :
 *   1. DG → AG → SG, chaîne de gouvernance (trait renforcé) ;
 *   2. le SG distribue ses 5 directions sur une barre horizontale, et le PMO
 *      s'accroche au **milieu du tronc** qui descend du SG, en pointillé, vers la
 *      gauche de sa boîte ;
 *   3. chaque direction suspend ses services — une arête par service.
 *
 * Les services d'une direction sont **empilés** et non répartis : la colonne ne
 * fait que 255 px d'entraxe, trois services de 224 px n'y tiennent pas de côté.
 * Leurs arêtes sont donc verticales et confondues sur le même axe — le trait
 * disparaît derrière les boîtes (les arêtes sont sous les nœuds) et réapparaît
 * dans les intervalles : on lit un tronc avec des boîtes accrochées, ce qui est
 * la convention usuelle pour une liste de sous-entités.
 *
 * `rigidLayout` : cette figure est un **placement imposé**. Le drapeau empêche
 * `DiagramCanvas` de charger des positions sauvegardées et coupe le
 * glissement — voir `DiagramDefinition.rigidLayout`.
 */

/** Teintes reprises de la figure d'origine. `data.color` est au format `hsl()`. */
const C = {
  dg: 'hsl(221, 83%, 53%)',
  ag: 'hsl(214, 52%, 25%)',
  sg: 'hsl(243, 75%, 59%)',
  pmo: 'hsl(175, 84%, 32%)',
  d1: 'hsl(180, 98%, 39%)',
  d2: 'hsl(161, 94%, 30%)',
  d3: 'hsl(262, 83%, 58%)',
  d4: 'hsl(32, 95%, 44%)',
  d5: 'hsl(215, 19%, 35%)',
}

/**
 * Largeur du canevas. Elle ne vaut pas seulement cadrage : la taille de police
 * utile se déduit du rapport corps/largeur, puisque la figure est réduite à une
 * page A4 portrait pleine. 1300 px donne ~10,7 pt pour l'intitulé à 30 px.
 */
const CANVAS_W = 1300
const CENTER = CANVAS_W / 2
/** Entraxe des 5 colonnes de directions. */
const COL_PITCH = 255
/** Abscisse du centre de la colonne `i` (0 à 4). */
const colX = (i: number) => CENTER + (i - 2) * COL_PITCH

/** Les boîtes de gouvernance sont seules sur leur rangée : rien ne les contraint en largeur. */
const GOV_W = 340
/** Colonnes : la largeur est bornée par l'entraxe, sinon la boîte mord sur sa voisine. */
const DIR_W = 224
const SVC_W = 224
/** Latéral, donc plus large que sa colonne sans jamais approcher celle d'à côté. */
const PMO_W = 260
/**
 * Abscisse du centre du PMO : le **gouttier entre les 4ᵉ et 5ᵉ directions**.
 *
 * L'organigramme d'origine le plaçait à 73 % de la largeur (1110 px pour 1520) ;
 * il a été poussé un peu plus à droite à la demande, en s'alignant sur une
 * référence de la figure plutôt que sur un pourcentage — un pourcentage se
 * désynchronise dès que `COL_PITCH` bouge, le gouttier non. Le PMO reste
 * entièrement dans le canevas, et sa position verticale le tient à l'écart des
 * directions : le seul recouvrement possible est avec la barre, donc avec `V.bar`.
 */
const PMO_CX = colX(3) + DIR_W / 2 + (COL_PITCH - DIR_W) / 2

/**
 * Hauteurs des boîtes : elles sont posées en `min-height`, jamais en `height`.
 *
 * `height` serait abandonnée à l'export (`captureNodePadded` applique
 * `clone.style.height = 'auto'`), `min-height` est un longhand distinct et
 * survit. Deux conséquences, et c'est tout l'intérêt du choix :
 *
 *   - les boîtes d'une même rangée font **la même hauteur** à l'écran comme à
 *     l'impression, et la figure ne bouge plus au chargement de la police ;
 *   - les valeurs ci-dessous deviennent les hauteurs **réelles**, donc la
 *     géométrie est calculée et non estimée : le milieu du tronc du SG tombe
 *     exactement sur le centre du PMO, et `busGap` se mesure depuis le bas réel
 *     de la boîte comme le fait `OrgBusEdge`.
 *
 * Ces valeurs sont des **mesures**, pas un calcul. La hauteur d'un texte dépend de
 * la fonte réelle, et le calcul « pire cas de la rangée » se trompé : sur les 23
 * boîtes, 21 tenaient à l'estimation et 2 ont débordé — `pmo` de 31 px et `d2` de
 * 35 px, cette dernière parce que son intitulé prenait 4 lignes et non 3. La
 * procédure pour reprendre les valeurs est le tableau de hauteurs journalisé par
 * `OrgBusEdge` (bouton DEBUG) : il compare chaque `minHeight` à la hauteur
 * mesurée. Ne pas les réestimer à la main.
 *
 * Un plancher dépassé ne se voit pas sur la boîte, il se voit sur ce qui s'y
 * raccorde : voir la formule de `dY` sous `Y_PMO`. Et dans les colonnes de
 * services, dont l'entraxe est de 22 px, un dépassement fait chevaucher les
 * boîtes.
 *
 * `pmo` est le seul plancher qui diffère du modèle, et pour une raison
 * géométrique : la course horizontale de `sg-pmo` est à une hauteur fixe
 * (`V.bar / 2`) et n'atteint le milieu de la face gauche que si la boîte fait
 * exactement `pmo`. La largeur du PMO n'y peut rien : c'est la hauteur qui compte.
 * 199 = sur-titre sur 2 lignes (54) + intitulé sur 3 lignes (111,5) + carte (32)
 * + bordures (2). Le sur-titre est le poste serré : 15 capitales gras à 20 px
 * dans 218 px utiles, soit ~0,73 em par caractère.
 */
const NOM = { gov: 204, pmo: 199, dir: 238, svc: 210 }

/** Gardes verticales, en px. */
const V = {
  /** Entre deux maillons de la chaîne de gouvernance. */
  link: 56,
  /**
   * Du bas du SG à la barre des directions.
   *
   * Elle doit aussi laisser passer le PMO, qui pend au milieu du tronc. Le
   * dégagement vaut `bar / 2 − NOM.pmo / 2`, donc il est **imposé** par la hauteur
   * du PMO : à `NOM.pmo = 199` mesuré, `bar = 253` laisse 27 px entre le bas du
   * PMO et la barre. C'est le seul levier du canevas qui ne serve à rien d'autre,
   * donc le premier à serrer si la page A4 déborde.
   */
  bar: 253,
  /** De la barre au haut des directions : une chute, pas un contact. */
  drop: 26,
  /** Du bas d'une direction au premier service : le tronc doit rester visible. */
  dirToSvc: 64,
  /** Entre deux services empilés. */
  svc: 22,
}

/** Empilement vertical : chaque rangée part de la précédente, plus rien à retrancher. */
const Y_DG = 0
const Y_AG = Y_DG + NOM.gov + V.link
const Y_SG = Y_AG + NOM.gov + V.link
const BAR_Y = Y_SG + NOM.gov + V.bar
const Y_DIR = BAR_Y + V.drop
const Y_SVC_1 = Y_DIR + NOM.dir + V.dirToSvc
const SVC_PITCH = NOM.svc + V.svc

/**
 * Le PMO pend au **milieu du tronc** du SG, et sa course horizontale est à
 * cette hauteur exacte (`trunkFraction: 0.5`) : les deux valeurs ne peuvent pas
 * diverger. D'où le `Y_PMO` recentré sur ce même milieu — sinon le coude de
 * l'arête se mettrait à cheniller dans le vide pour rattraper l'écart.
 *
 * L'écart résiduel entre la course et l'arrivée s'écrit, toutes hauteurs réelles
 * `h` connues :
 *
 *     dY = (NOM.gov − h_sg) + (h_pmo − NOM.pmo) / 2
 *
 * Les deux termes doivent être nuls, et chacun pour une raison différente :
 * `NOM.gov` cale la course (elle part du bas **réel** du SG), `NOM.pmo` cale
 * l'arrivée (elle vise le centre **réel** du PMO). Un seul des deux suffit à
 * casser l'arrivée droite, et le symptôme — un décrochement vertical à la face du
 * PMO — ne désigne pas la cause : il faut le tableau de `OrgBusEdge` pour la
 * trouver.
 */
const Y_PMO = Y_SG + NOM.gov + V.bar / 2 - NOM.pmo / 2

interface BoxSpec {
  label: string
  eyebrow?: string
  person?: string
  color: string
  /**
   * Hauteur plancher, venue de `NOM`. Elle est portée par `data` et non par
   * `style` parce que la cible de l'export est la carte interne : le `style` du
   * nœud s'applique au wrapper `react-flow__node`, qui n'est pas rasterisé.
   */
  minHeight: number
}

/**
 * `OrgNode` lit `label` / `eyebrow` / `person` ; la couleur sert à la bordure
 * gauche et au sur-titre. La seule dimension posée dans le `style` du nœud est la
 * **largeur** : c'est elle qui aligne les colonnes, et elle n'est pas touchée par
 * l'export. La hauteur, elle, passe par `data.minHeight` — voir `NOM` pour
 * pourquoi c'est un plancher et non une hauteur.
 */
const box = ({ label, eyebrow, person, color, minHeight }: BoxSpec): EntityNodeData => ({
  label,
  variant: 'org-box',
  eyebrow,
  person,
  color,
  minHeight,
})

interface DirectionSpec {
  key: string
  color: string
  /** Services de la direction : intitulé puis titulaire (absent si non communiqué). */
  services: { label: string; person?: string }[]
}

const DIRECTIONS: DirectionSpec[] = [
  {
    key: 'd1',
    color: C.d1,
    services: [
      { label: 'Direction Commerciale', person: 'M. Sidik Ouattara' },
      { label: 'Marketing & Communication', person: 'M. Jean Paul Kadjo' },
      { label: 'Pays', person: 'M. Jules Houantonon' },
    ],
  },
  {
    key: 'd2',
    color: C.d2,
    services: [
      { label: 'Direction Tech. & Delivery', person: 'M. Ulrich Fossou' },
      { label: 'Bureau de Gestion de Projets', person: 'M. Laganase Ouattara' },
      { label: 'Expérience Client', person: 'M. Brahima Koné' },
    ],
  },
  {
    key: 'd3',
    color: C.d3,
    services: [
      { label: 'BU Expertise & Innovation', person: 'M. Jean Vincent Kassi' },
      { label: 'BU Édition Logicielle' },
    ],
  },
  {
    key: 'd4',
    color: C.d4,
    services: [
      { label: 'Contrôle de Gestion' },
      { label: 'Trésorerie / Comptabilité' },
      { label: 'Fiscalité' },
    ],
  },
  {
    key: 'd5',
    color: C.d5,
    services: [
      { label: 'Ressources Humaines', person: 'Mme. Ornella Gossan' },
      { label: 'Juridique' },
      { label: 'Administratif', person: 'Mme. Christelle Nan' },
    ],
  },
]

const DIRECTION_LABELS = [
  'Business & International',
  // Abrégé pour tenir sur 3 lignes : à 4 lignes la boîte mesurait 273 px pour un
  // plancher de 238, et débordait donc sur l'écart vers ses services. Même
  // convention que `Admin. & Capital Humain` et `Performance Financière & Fis.`
  // ci-dessous.
  'Prod. & Expérience Client',
  'Innovation & Expertise',
  'Performance Financière & Fis.',
  'Admin. & Capital Humain',
]

const DIRECTION_TITULAIRES = [
  'M. Jules Houantonon',
  'Mme. Anah Coulibaly',
  'M. Stephane Ouattara',
  'Mme. Fatim Konate',
  'Direction des Ressources',
]

const nodes: DiagramDefinition['nodes'] = [
  {
    id: 'dg',
    type: 'entity',
    position: { x: CENTER - GOV_W / 2, y: Y_DG },
    style: { width: GOV_W },
    data: box({
      label: 'M. Patrick Kouassi',
      eyebrow: 'Direction Générale',
      person: 'Fondateur du Groupe',
      color: C.dg,
      minHeight: NOM.gov,
    }),
  },
  {
    id: 'ag',
    type: 'entity',
    position: { x: CENTER - GOV_W / 2, y: Y_AG },
    style: { width: GOV_W },
    data: box({
      label: 'M. Jorge Vilanova',
      eyebrow: 'Administrateur Général',
      color: C.ag,
      minHeight: NOM.gov,
    }),
  },
  {
    id: 'sg',
    type: 'entity',
    position: { x: CENTER - GOV_W / 2, y: Y_SG },
    style: { width: GOV_W },
    data: box({
      label: 'M. Stéphane Ouattara',
      eyebrow: 'Secrétariat Général',
      person: 'Secrétaire Général & COO',
      color: C.sg,
      minHeight: NOM.gov,
    }),
  },
  {
    // Le PMO est décalé à droite, au-dessus du gouttier qui sépare les 4ᵉ et 5ᵉ
    // directions (cf. `PMO_CX`). Sa course part du milieu du tronc du SG et entre
    // par la gauche — voir l'arête `sg-pmo`.
    id: 'pmo',
    type: 'entity',
    position: { x: PMO_CX - PMO_W / 2, y: Y_PMO },
    style: { width: PMO_W },
    data: box({
      label: 'Mme. Seynabou Diagne',
      eyebrow: 'PMO Gouvernance',
      color: C.pmo,
      minHeight: NOM.pmo,
    }),
  },
]

DIRECTIONS.forEach((dir, i) => {
  const cx = colX(i)
  nodes.push({
    id: dir.key,
    type: 'entity',
    position: { x: cx - DIR_W / 2, y: Y_DIR },
    style: { width: DIR_W },
    data: box({
      label: DIRECTION_LABELS[i],
      eyebrow: `Direction ${i + 1}`,
      person: DIRECTION_TITULAIRES[i],
      color: dir.color,
      minHeight: NOM.dir,
    }),
  })

  dir.services.forEach((svc, j) => {
    const y = Y_SVC_1 + j * SVC_PITCH
    nodes.push({
      id: `${dir.key}-s${j + 1}`,
      type: 'entity',
      position: { x: cx - SVC_W / 2, y },
      style: { width: SVC_W },
      data: box({
        label: svc.label,
        person: svc.person,
        color: dir.color,
        minHeight: NOM.svc,
      }),
    })
  })
})

/** Gouvernance : les trois boîtes sont alignées, l'arête est donc un trait droit. */
const governance = (from: string, to: string): DiagramDefinition['edges'][number] => ({
  id: `${from}-${to}`,
  source: from,
  target: to,
  sourceHandle: 'bottom',
  targetHandle: 'top',
  type: 'orgBus',
  data: { busGap: 0, isStrong: true },
})

const edges: DiagramDefinition['edges'] = [
  governance('dg', 'ag'),
  governance('ag', 'sg'),
  // Le PMO s'accroche à la **liaison** qui descend du SG, pas à la boîte : sa
  // course horizontale part de la moitié du tronc (`trunkFraction: 0.5`) et entre
  // par la gauche du PMO. `busGap` reste aligné sur celui des cinq directions —
  // c'est cette valeur qui donne la longueur du tronc, donc la position du
  // milieu.
  //
  // `busRadius: 0` parce que ce raccord n'a rien d'une barre de distribution : il
  // part du milieu d'un tronc et entre de niveau dans la face du PMO. Angles
  // vifs, sinon la courbe de 12 px se lit comme un arrondi à l'arrivée, alors que
  // les deux seuls angles possibles (le départ du tronc et l'arrivée) sont des
  // coudes à 90°. Les cinq barres de directions gardent le rayon par défaut, qui
  // reste la bonne convention à cet endroit.
  //
  // L'arrivée est un segment **horizontal unique** : `runY` tombe exactement sur
  // le milieu de la face gauche, donc le dernier point de la polyligne est
  // confondu avec l'avant-dernier et disparaît. C'est le contrat de `NOM.pmo` qui
  // le garantit, pas une coïncidence.
  {
    id: 'sg-pmo',
    source: 'sg',
    target: 'pmo',
    sourceHandle: 'bottom',
    targetHandle: 'left',
    type: 'orgBus',
    data: { busGap: V.bar, trunkFraction: 0.5, isDashed: true, busRadius: 0 },
  },
]

DIRECTIONS.forEach((dir) => {
  // Même source, même `busGap` : les cinq `busY` coïncident, et leurs segments
  // horizontaux se recouvrent en une seule barre.
  edges.push({
    id: `sg-${dir.key}`,
    source: 'sg',
    target: dir.key,
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: 'orgBus',
    data: { busGap: V.bar, isStrong: true },
  })

  dir.services.forEach((_, j) => {
    // `busGap: 0` et des centres alignés : l'arête se réduit à un segment
    // vertical, ce qui donne le tronc commun aux services d'une direction.
    edges.push({
      id: `${dir.key}-${dir.key}-s${j + 1}`,
      source: dir.key,
      target: `${dir.key}-s${j + 1}`,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'orgBus',
      data: { busGap: 0 },
    })
  })
})

export const syneliaAvecAg: DiagramDefinition = {
  id: 'organigramme-synelia-avec-ag',
  title: 'Organigramme — Groupe Synelia',
  category: 'organigramme',
  domain: 'Gouvernance, directions opérationnelles et services',
  // Au-delà de ~1.2, les intitulés les plus longs débordent de leur colonne :
  // c'est un réglage de corps, pas de géométrie (les positions restent fixes).
  fontScale: 1,
  rigidLayout: true,
  nodes,
  edges,
}
