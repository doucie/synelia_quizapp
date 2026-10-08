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
 *   3. les 14 services sont **empilés** sous leur direction, sans lien.
 *
 * Le point 3 est un choix, pas un oubli. Les 14 segments verticaux qui reliaient
 * chaque service à sa direction ont été retirés : empilés sur la même abscisse,
 * ils se confondaient en un tronc unique dont le trait disparaissait derrière les
 * boîtes, et il fallait suivre le filet pour deviner à quelle rangée il
 * appartenait. Le rattachement est désormais porté par l'alignement et la teinte
 * — d'où le contrat `SVC_W === DIR_W`, sans lequel les services flotteraient dans
 * leur colonne et le regroupement disparaîtrait avec les liens.
 *
 * Il ne reste donc que **8 arêtes** : 2 maillons de gouvernance, 1 raccord de PMO
 * et 5 barres de direction. Les cinq barres partagent `sg` comme source et le
 * même `busGap`, donc leurs `busY` coïncident et leurs segments horizontaux se
 * recouvrent en une seule barre — c'est le but, pas un artefact.
 *
 * `rigidLayout` : cette figure est un **placement imposé**. Le drapeau empêche
 * `DiagramCanvas` de charger des positions sauvegardées et coupe le
 * glissement — voir `DiagramDefinition.rigidLayout`.
 */

/**
 * Teintes reprises **verbatim** de la figure d'origine, qui en déclare 9 named
 * et les réemploie à trois endroits : bordure gauche, fond teinté, sur-titre —
 * plus la couleur des branches de la direction.
 *
 * Hex et non `hsl()` : les seules conversions qui tenaient exactement étaient
 * celles de `ag` et `d5`, les 7 autres tombaient à 1 à 2 degrés près — et `d1`
 * était franchement fausse, en cyan (hsl 180) au lieu du ciel de l'original
 * (hsl 198). Un diagramme de Merise n'a pas à payer une dérive de teinte pour
 * un arrondi : la valeur de référence est recopiée telle quelle.
 */
const C = {
  dg: '#2563eb',
  ag: '#1e3a5f',
  sg: '#4f46e5',
  pmo: '#0d9488',
  d1: '#0284c7',
  d2: '#059669',
  d3: '#7c3aed',
  d4: '#d97706',
  d5: '#475569',
  /** Gris de la chaîne de gouvernance et de la barre de distribution, d'après l'original. */
  branch: '#64748b',
}

/**
 * Largeur du canevas : **dérivée**, plus jamais une valeur en dur à maintenir.
 *
 * Elle ne vaut pas seulement cadrage. La taille de police utile se déduit du
 * rapport corps / largeur du canevas, puisque la figure est réduite à la largeur
 * d'une page :
 *
 *     pt = largeur utile × 28,3465 / (w_px / B_px)
 *
 * Ce qui compte n'est donc pas le nombre de pixels, mais la **densité** : le
 * nombre de corps de caractère qui tiennent en travers. Reprendre le dessin
 * portrait en paysage sans rien changer ferait passer la densité de 43,3 à 25,3
 * et le corps de 10,3 à 16,0 pt — une figure de 37,3 cm de haut dans une zone de
 * 17,6 cm. D'où le recalage ci-dessous.
 *
 * Cible : une densité de ~66 px par corps sur les 25,3 cm utiles d'une page A4
 * paysage pleine (marges 2,2 cm), soit **~10,9 pt** pour l'intitulé — un peu
 * mieux que les 10,3 pt du portrait, donc le paysage gagne en lisibilité au lieu
 * d'en perdre.
 */
const COL_PITCH = 500
/** Marge latérale du canevas, pour que la figure respire au lieu de toucher les bords. */
const MARGIN = 72
const CANVAS_W = 5 * COL_PITCH + 2 * MARGIN
const CENTER = CANVAS_W / 2
/** Abscisse du centre de la colonne `i` (0 à 4). */
const colX = (i: number) => CENTER + (i - 2) * COL_PITCH

/**
 * Les boîtes de gouvernance sont seules sur leur rangée : rien ne les contraint en
 * largeur. 500 px leur laisse un intitulé sur une ligne à 40 px.
 */
const GOV_W = 500
/**
 * Colonnes : la largeur est bornée par l'entraxe, sinon la boîte mord sur sa
 * voisine. 450 px dans un entraxe de 500 laisse un gouttier de 50 px, juste ce
 * qu'il faut pour que deux directions voisines ne se lisent pas comme une seule
 * bande de couleur.
 */
const DIR_W = 450
/**
 * `SVC_W === DIR_W` n'est pas un choix mais un **contrat** : les liens sous les
 * directions ayant été supprimés, le rattachement d'un service à sa direction est
 * porté par l'alignement et la teinte, et il n'a plus que ceux-ci. Une largeur
 * différente ferait flotter les services dans leur colonne et le regroupement
 * disparaîtrait. Voir l'en-tête du fichier.
 */
const SVC_W = DIR_W
/** Le PMO déborde volontairement dans les colonnes 4 et 5 — voir `PMO_CX`. */
const PMO_W = 450
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
* ## Ces valeurs sont mesurées
 *
 * Relevé du 2026-10-04, **après** correction de l'encodage du fichier (voir
 * `git log` : le commit `0efbba4` avait enregistré ce fichier en double
 * encodage CP1252, si bien que les libellés s'affichaient `TrÃ©sorerie /
 * ComptabilitÃ©`). Les deux planchers qui débordaient étaient l'un et l'autre
 * des artefacts de ce mojibake : `Ã©` occupe deux caractères au lieu d'un, donc
 * « Trésorerie / Comptabilité » passait sur deux lignes et « Performance
 * Financière & Fiscalité » sur trois. Corrigé, **les 23 boîtes mesurent
 * exactement leur plancher**.
 *
 * C'est ce qui justifie de traiter `NOM` et `SVC_H` comme des constantes
 * figées plutôt que comme un calcul : la formule ci-dessous, qui additionne
 * `(lignes × corps × interligne) + les espacements fixes du style`, retombe
 * juste sur les 23, mais sa justesse tient à la fonte réelle et à un décompte
 * de lignes que rien ne vérifie. Un plancher est un **relevé**, il ne se
 * recalcule pas.
 *
 * Conséquence pratique : retoucher un libellé, un corps ou un interligne impose
 * de **relever à nouveau** (bouton DEBUG de `OrgBusEdge`, ou le script CDP du
 * plan), sinon `dY` se met à dériver sans qu'aucune boîte ne le signale.
 *
 * Un plancher dépassé ne se voit pas sur la boîte, il se voit sur ce qui s'y
 * raccorde : voir la formule de `dY` sous `Y_PMO`.
 *
 * `pmo` est le seul plancher qui diffère du modèle `gov`, et pour une raison
 * géométrique : la course horizontale de `sg-pmo` est à une hauteur fixe
 * (`V.bar / 2`) et n'atteint le milieu de la face gauche que si la boîte fait
 * exactement `pmo`. La largeur du PMO n'y peut rien : c'est la hauteur qui compte.
 */
/**
 * Corps de l'intitulé, à `fontScale: 4/3` — voir `BASE` et `px()` dans `OrgNode`.
 * Il ne sert plus qu'à exprimer les gardes verticales en `em` : les hauteurs, elles,
 * sont des relevés et ne se déduisent plus d'un corps.
 */
const S_LABEL = 30 * (4 / 3)

const NOM = {
  /** Sur-titre 1 ligne, intitulé 1 ligne, titulaire 1 ligne. */
  gov: 154,
  /** Sur-titre 1 ligne, intitulé 2 lignes, **sans titulaire**. */
  pmo: 156,
  /** Sur-titre 1 ligne, intitulé 2 lignes, titulaire 1 ligne. */
  dir: 204,
} as const

/**
 * Dégagement vertical sous le PMO, en px : la distance entre le bas du PMO et la
 * barre de distribution. C'est le seul écart qui doit rester visible, sinon le
 * PMO semble toucher la barre.
 */
const PMO_CLEARANCE = 27

/**
 * Gardes verticales, en px.
 *
 * Toutes exprimées en fraction du corps de base plutôt qu'en px : le canevas est
 * dimensionné pour l'impression, donc une garde en px se dilate d'un facteur 4/3
 * quand `fontScale` change, et les proportions se calent de la figure se
 * dérèglent. Ici `link` vaut 1,1 em, `svc` 0,45 em, `drop` 0,65 em et
 * `dirToSvc` 1,6 em.
 */
const em = (n: number) => Math.round(n * S_LABEL)
const V = {
  /** Entre deux maillons de la chaîne de gouvernance. */
  link: em(1.1),
  /**
   * Du bas du SG à la barre des directions.
   *
   * Elle doit aussi laisser passer le PMO, qui pend au milieu du tronc. Le
   * dégagement vaut `bar / 2 − NOM.pmo / 2`, donc il est **imposé** par la hauteur
   * du PMO et ne peut pas être choisi indépendamment d'elle :
   *
   *     bar = NOM.pmo + 2 × PMO_CLEARANCE
   *
   * D'où le calcul plutôt qu'une constante en dur : si la hauteur du PMO change,
   * la garde suit. C'est le seul levier du canevas qui ne serve à rien d'autre,
   * donc le premier à serrer si la page paysage déborde — et le seul à
   * pouvoir l'être.
   */
  bar: NOM.pmo + 2 * PMO_CLEARANCE,
  /** De la barre au haut des directions : une chute, pas un contact. */
  drop: em(0.65),
  /**
   * Du bas d'une direction au premier service.
   *
   * Il ne relie plus rien depuis la suppression des 14 liens : c'est désormais
   * le **seul** blanc entre les deux rangs, donc la respiration qui montre
   * l'appartenance d'un service à sa direction. Il vaut plus que la garde
   * `link`, qui ne sépare que des maillons d'une même chaîne.
   */
  dirToSvc: em(1.6),
  /** Entre deux services empilés. */
  svc: em(0.45),
}

/** Empilement vertical : chaque rangée part de la précédente, plus rien à retrancher. */
const Y_DG = 0
const Y_AG = Y_DG + NOM.gov + V.link
const Y_SG = Y_AG + NOM.gov + V.link
const BAR_Y = Y_SG + NOM.gov + V.bar
const Y_DIR = BAR_Y + V.drop
const Y_SVC_1 = Y_DIR + NOM.dir + V.dirToSvc

/**
 * Hauteur d'une colonne de services, pour la colonne `i` — **relevé du
 * 2026-10-04**, même passe que `NOM`.
 *
 * **Par colonne, pas globale.** Depuis la suppression des liens, chaque colonne
 * est un groupe visuellement autonome : elle ne doit pas hériter du plancher de sa
 * voisine. Un global forcerait les 14 boîtes à la hauteur de la plus haute,
 * donc au padding de la plus bavarde de la figure — les colonnes aux intitulés
 * courts se rempliraient derechef de vide.
 *
 * **Par colonne, pas par service.** L'inverse se paie aussi : un plancher
 * individuel fait se chevaucher les trois boîtes d'une colonne dès que l'une
 * d'elles dépasse l'entraxe, ce qui est le mode d'échec qu'avait rencontré `d2`
 * en portrait. La colonne est donc le grain le plus fin qui reste sûr.
 *
 *   colonne 0  Direction Commerciale, Marketing…, Pays      140   3 services, 3 titulaires
 *   colonne 1  Direction Tech. & Delivery, Expérience…     140   3 services, 3 titulaires
 *   colonne 2  BU Expertise…, BU Édition Logicielle        140   2 services, 1 titulaire
 *   colonne 3  Contrôle de Gestion, Trésorerie…            61   3 services, **aucun** titulaire
 *   colonne 4  Ressources Humaines, Juridique…             100   3 services, 2 titulaires
 *
 * Ces quatre valeurs sont les hauteurs **réelles** de la plus haute boîte de
 * chaque colonne, donc un relevé et pas un calcul : 61 = intitulé 1 ligne sans
 * titulaire, 100 = 1 ligne + titulaire, 140 = 2 lignes + titulaire. La colonne 3
 * est la seule sans titulaire, d'où son 61 ; un plancher unique de 140 y coûterait
 * 79 px de vide par boîte, soit deux lignes de service.
 *
 * **La colonne 3 ne tolère aucune autre fonte.** « Trésorerie / Comptabilité » est
 * à quelques pixels de tenir sur une ligne dans la fonte de référence : Poppins le
 * fait passer sur deux, et la boîte mesure alors 100 px au lieu de 61. Le plancher
 * étant 61 et l'entraxe `61 + V.svc` = 79, l'écart vers la boîte suivante tombait à
 * 2 px — le service Recouvrait le suivant. C'est ce qui a valu trois valeurs à
 * `SVC_H[3]` (61, 84, 101) avant qu'on cerne la bonne : **la variable muette
 * n'était pas le plancher, c'était la fonte.** Le correctif est `fontFamily` sur
 * la figure, pas un plancher plus large — un plancher de 100 ou 101 aurait guéri
 * l'organigramme dans la mauvaise fonte en laissant 40 px de vide à l'impression
 * dans la bonne.
 *
 * `Y_SVC_1` est commun aux cinq colonnes, donc c'est `SVC_H[max]` — et non
 * `SVC_H[0]` — qui détermine le bas du canevas.
 */
const SVC_H = [140, 140, 140, 61, 100] as const
const svcHeight = (i: number) => SVC_H[i]

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
  /** Niveau de style, cf. `EntityNodeData.orgLevel`. */
  orgLevel: NonNullable<EntityNodeData['orgLevel']>
  /**
   * Hauteur plancher, venue de `NOM`. Elle est portée par `data` et non par
   * `style` parce que la cible de l'export est la carte interne : le `style` du
   * nœud s'applique au wrapper `react-flow__node`, qui n'est pas rasterisé.
   */
  minHeight: number
}

/**
 * `OrgNode` lit `label` / `eyebrow` / `person` / `orgLevel` ; la couleur sert à la
 * bordure gauche et au sur-titre, et elle est **partagée** entre une direction et
 * ses services : c'est ce qui tient le regroupement depuis la suppression des
 * liens. La seule dimension posée dans le `style` du nœud est la **largeur** : c'est
 * elle qui aligne les colonnes, et elle n'est pas touchée par l'export. La hauteur,
 * elle, passe par `data.minHeight` — voir `NOM` pour pourquoi c'est un plancher et
 * non une hauteur.
 */
const box = ({
  label,
  eyebrow,
  person,
  color,
  orgLevel,
  minHeight,
}: BoxSpec): EntityNodeData => ({
  label,
  variant: 'org-box',
  eyebrow,
  person,
  color,
  orgLevel,
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

/**
 * Intitulés des cinq directions, dans l'ordre des colonnes.
 *
 * `d4` est abrégé en « Perf. … » : les cinq boîtes font la même largeur (450 px,
 * contrat `DIR_W`) et « Performance Financière & Fiscalité » est le plus long des
 * cinq, ce qui déséquilibre la rangée. Choix de **lisibilité**, pas un correctif
 * de débordement — l'intitulé complet tenait déjà sur deux lignes, donc
 * `NOM.dir` et la hauteur des cinq directions sont inchangés. Le texte de
 * `body.typ` garde la forme longue : l'abréviation ne concerne que la figure.
 */
const DIRECTION_LABELS = [
  'Business & International',
  'Production & Expérience Client',
  'Innovation & Expertise',
  'Perf. Financière & Fiscalité',
  'Administration & Capital Humain',
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
      orgLevel: 'gov',
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
      orgLevel: 'gov',
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
      orgLevel: 'gov',
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
      orgLevel: 'gov',
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
      orgLevel: 'dir',
      minHeight: NOM.dir,
    }),
  })

  // Plancher de la colonne, commun à ses services : c'est lui qui fait que les
  // boîtes d'une même direction font la même hauteur et que la colonne se lit
  // comme un bloc. Voir `svcHeight`.
  const h = svcHeight(i)
  dir.services.forEach((svc, j) => {
    nodes.push({
      id: `${dir.key}-s${j + 1}`,
      type: 'entity',
      position: { x: cx - SVC_W / 2, y: Y_SVC_1 + j * (h + V.svc) },
      style: { width: SVC_W },
      data: box({
        label: svc.label,
        person: svc.person,
        color: dir.color,
        orgLevel: 'svc',
        minHeight: h,
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
  data: { busGap: 0, isStrong: true, stroke: C.branch },
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
    data: {
      busGap: V.bar,
      trunkFraction: 0.5,
      isDashed: true,
      busRadius: 0,
      stroke: C.pmo,
    },
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
    data: { busGap: V.bar, isStrong: true, stroke: C.branch },
  })

  // **Aucun lien vers les services.** Les 14 segments verticaux qui les reliaient
  // à leur direction étaient supprimés le 2026-10-04 : voir l'en-tête du fichier.
  // Le rattachement est porté par l'alignement et la teinte, ce qui rend
  // l'alignement et la teinte **structurels** — voir `SVC_W` et `PMO_CX`.
})

export const syneliaAvecAg: DiagramDefinition = {
  id: 'organigramme-synelia-avec-ag',
  title: 'Organigramme — Groupe Synelia',
  category: 'organigramme',
  domain: 'Gouvernance, directions opérationnelles et services',
  /**
   * Corps × 4/3 : l'intitulé passe de 30 à 40 px.
   *
   * C'est le levier qui fait tenir la page paysage. La figure est réduite à
   * 25,3 cm de large, et la taille imprimée ne dépend que de la **densité**
   * `w/B` : sans cette multiplication, il faudrait réduire le canevas de 2644 à
   * ~1800 px pour atteindre 10,9 pt, ce qui ne laisserait plus la place de cinq
   * colonnes lisibles. Grossir le corps et le canevas dans la même proportion
   * garde la densité visée, et fait passer les intitulés de direction sur
   * 2 lignes au lieu de 3 à 4.
   *
   * Réglage de corps, pas de géométrie : les positions restent fixes.
   */
  fontScale: 4 / 3,
  /**
   * Fonte de référence de la figure — voir `fontFamily` dans `types/index.ts`.
   *
   * Les valeurs de `NOM` et de `SVC_H` sont un relevé pris **dans cette fonte**, et
   * elle est donc déclarée ici, sur la figure : c'est le seul endroit qui dit à la
   * fois « voici la fonte » et « voici les hauteurs mesurées dedans ».
   *
   * Les replis sont plus étroits que Cabinet Grotesk, donc un échec de chargement
   * réduit le nombre de lignes — le mode de défaillance sûr, puisque l'entraxe est
   * calé sur le plancher le plus bas. Choisir l'inverse, une pile plus large, ferait
   * déborder au chargement plutôt qu'à l'échec.
   */
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
  rigidLayout: true,
  nodes,
  edges,
}