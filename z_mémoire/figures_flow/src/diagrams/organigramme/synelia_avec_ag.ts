import type { DiagramDefinition, EntityNodeData } from '../../types'

/**
 * Organigramme du Groupe Synelia â€” gouvernance, directions et services.
 *
 * Remplace `figures_html/organigramme_synelia_avec_ag.html`, dont le tracÃ© Ã©tait
 * figÃ© : les lignes Ã©taient des `<line>` SVG Ã©crites Ã  la main, donc elles ne
 * suivaient ni un dÃ©placement de boÃ®te ni un changement dePolice, et
 * `preserveAspectRatio="none"` dÃ©formait l'ensemble. Ici les connecteurs sont
 * des arÃªtes : ils recalculent leur gÃ©omÃ©trie au zoom et Ã  l'export.
 *
 * Trois rangs, lus de haut en bas :
 *   1. DG â†’ AG â†’ SG, chaÃ®ne de gouvernance (trait renforcÃ©) ;
 *   2. le SG distribue ses 5 directions sur une barre horizontale, et le PMO
 *      s'accroche au **milieu du tronc** qui descend du SG, en pointillÃ©, vers la
 *      gauche de sa boÃ®te ;
 *   3. chaque direction suspend ses services â€” une arÃªte par service.
 *
 * Les services d'une direction sont **empilÃ©s** et non rÃ©partis : la colonne ne
 * fait que 255 px d'entraxe, trois services de 224 px n'y tiennent pas de cÃ´tÃ©.
 * Leurs arÃªtes sont donc verticales et confondues sur le mÃªme axe â€” le trait
 * disparaÃ®t derriÃ¨re les boÃ®tes (les arÃªtes sont sous les nÅ“uds) et rÃ©apparaÃ®t
 * dans les intervalles : on lit un tronc avec des boÃ®tes accrochÃ©es, ce qui est
 * la convention usuelle pour une liste de sous-entitÃ©s.
 *
 * `rigidLayout` : cette figure est un **placement imposÃ©**. Le drapeau empÃªche
 * `DiagramCanvas` de charger des positions sauvegardÃ©es et coupe le
 * glissement â€” voir `DiagramDefinition.rigidLayout`.
 */

/**
 * Teintes reprises **verbatim** de la figure d'origine, qui en dÃ©clare 9 named
 * et les rÃ©emploie Ã  trois endroits : bordure gauche, fond teintÃ©, sur-titre â€”
 * plus la couleur des branches de la direction.
 *
 * Hex et non `hsl()` : les seules conversions qui tenaient exactement Ã©taient
 * celles de `ag` et `d5`, les 7 autres tombaient Ã  1 Ã  2 degrÃ©s prÃ¨s â€” et `d1`
 * Ã©tait franchement fausse, en cyan (hsl 180) au lieu du ciel de l'original
 * (hsl 198). Un diagramme de Merise n'a pas Ã  payer une dÃ©rive de teinte pour
 * un arrondi : la valeur de rÃ©fÃ©rence est recopiÃ©e telle quelle.
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
  /** Gris de la chaÃ®ne de gouvernance et de la barre de distribution, d'aprÃ¨s l'original. */
  branch: '#64748b',
}

/**
 * Largeur du canevas : **dÃ©rivÃ©e**, plus jamais une valeur en dur Ã  maintenir.
 *
 * Elle ne vaut pas seulement cadrage. La taille de police utile se dÃ©duit du
 * rapport corps / largeur du canevas, puisque la figure est rÃ©duite Ã  la largeur
 * d'une page :
 *
 *     pt = largeur utile Ã— 28,3465 / (w_px / B_px)
 *
 * Ce qui compte n'est donc pas le nombre de pixels, mais la **densitÃ©** : le
 * nombre de corps de caractÃ¨re qui tiennent en travers. Reprendre le dessin
 * portrait en paysage sans rien changer ferait passer la densitÃ© de 43,3 Ã  25,3
 * et le corps de 10,3 Ã  16,0 pt â€” une figure de 37,3 cm de haut dans une zone de
 * 17,6 cm. D'oÃ¹ le recalage ci-dessous.
 *
 * Cible : une densitÃ© de ~66 px par corps sur les 25,3 cm utiles d'une page A4
 * paysage pleine (marges 2,2 cm), soit **~10,9 pt** pour l'intitulÃ© â€” un peu
 * mieux que les 10,3 pt du portrait, donc le paysage gagne en lisibilitÃ© au lieu
 * d'en perdre.
 */
const COL_PITCH = 500
/** Marge latÃ©rale du canevas, pour que la figure respire au lieu de toucher les bords. */
const MARGIN = 72
const CANVAS_W = 5 * COL_PITCH + 2 * MARGIN
const CENTER = CANVAS_W / 2
/** Abscisse du centre de la colonne `i` (0 Ã  4). */
const colX = (i: number) => CENTER + (i - 2) * COL_PITCH

/**
 * Les boÃ®tes de gouvernance sont seules sur leur rangÃ©e : rien ne les contraint en
 * largeur. 500 px leur laisse un intitulÃ© sur une ligne Ã  40 px.
 */
const GOV_W = 500
/**
 * Colonnes : la largeur est bornÃ©e par l'entraxe, sinon la boÃ®te mord sur sa
 * voisine. 450 px dans un entraxe de 500 laisse un gouttier de 50 px, juste ce
 * qu'il faut pour que deux directions voisines ne se lisent pas comme une seule
 * bande de couleur.
 */
const DIR_W = 450
/**
 * `SVC_W === DIR_W` n'est pas un choix mais un **contrat** : les liens sous les
 * directions ayant Ã©tÃ© supprimÃ©s, le rattachement d'un service Ã  sa direction est
 * portÃ© par l'alignement et la teinte, et il n'a plus que ceux-ci. Une largeur
 * diffÃ©rente ferait flotter les services dans leur colonne et le regroupement
 * disparaÃ®trait. Voir l'en-tÃªte du fichier.
 */
const SVC_W = DIR_W
/** Le PMO dÃ©borde volontairement dans les colonnes 4 et 5 â€” voir `PMO_CX`. */
const PMO_W = 450
/**
 * Abscisse du centre du PMO : le **gouttier entre les 4áµ‰ et 5áµ‰ directions**.
 *
 * L'organigramme d'origine le plaÃ§ait Ã  73 % de la largeur (1110 px pour 1520) ;
 * il a Ã©tÃ© poussÃ© un peu plus Ã  droite Ã  la demande, en s'alignant sur une
 * rÃ©fÃ©rence de la figure plutÃ´t que sur un pourcentage â€” un pourcentage se
 * dÃ©synchronise dÃ¨s que `COL_PITCH` bouge, le gouttier non. Le PMO reste
 * entiÃ¨rement dans le canevas, et sa position verticale le tient Ã  l'Ã©cart des
 * directions : le seul recouvrement possible est avec la barre, donc avec `V.bar`.
 */
const PMO_CX = colX(3) + DIR_W / 2 + (COL_PITCH - DIR_W) / 2

/**
 * Hauteurs des boÃ®tes : elles sont posÃ©es en `min-height`, jamais en `height`.
 *
 * `height` serait abandonnÃ©e Ã  l'export (`captureNodePadded` applique
 * `clone.style.height = 'auto'`), `min-height` est un longhand distinct et
 * survit. Deux consÃ©quences, et c'est tout l'intÃ©rÃªt du choix :
 *
 *   - les boÃ®tes d'une mÃªme rangÃ©e font **la mÃªme hauteur** Ã  l'Ã©cran comme Ã 
 *     l'impression, et la figure ne bouge plus au chargement de la police ;
 *   - les valeurs ci-dessous deviennent les hauteurs **rÃ©elles**, donc la
 *     gÃ©omÃ©trie est calculÃ©e et non estimÃ©e : le milieu du tronc du SG tombe
 *     exactement sur le centre du PMO, et `busGap` se mesure depuis le bas rÃ©el
 *     de la boÃ®te comme le fait `OrgBusEdge`.
 *
 * ## Ces valeurs ne sont pas mesurÃ©es
 *
 * âš ï¸ **Elles doivent Ãªtre reprises sur le tableau journalisÃ© par `OrgBusEdge`
 * (bouton DEBUG) avant de considÃ©rer la figure terminÃ©e.** Les nombres ci-dessous
 * sont un **amorÃ§age calculÃ©**, pas un relevÃ© : la hauteur d'un texte dÃ©pend de
 * la fonte rÃ©elle, et la formule Â« pire cas de la rangÃ©e Â» s'est dÃ©jÃ  trompÃ©e
 * deux fois sur cette figure â€” `pmo` de 31 px et `d2` de 35 px, la seconde parce
 * que son intitulÃ© prenait 4 lignes et non 3. Ã€ ce jour, **21 des 23 boÃ®tes
 * tenaient Ã  l'estimation et 2 ont dÃ©bordÃ©**, donc 2 sur 23 est le taux d'erreur
 * attendu ici, pas 0.
 *
 * L'amorÃ§age ci-dessous est obtenu en additionnant, pour chaque niveau :
 * `(lignes Ã— corps Ã— interligne) + les espacements fixes du style`. Le nombre de
 * lignes est le seul terme rÃ©ellement incertain â€” d'oÃ¹ le passage en paysage qui
 * **Ã©largit** les colonnes de 224 Ã  450 px, censÃ© faire tenir les intitulÃ©s sur
 * moins de lignes qu'avant. Ne pas les rÃ©estimer Ã  la main : les relever.
 *
 * Un plancher dÃ©passÃ© ne se voit pas sur la boÃ®te, il se voit sur ce qui s'y
 * raccorde : voir la formule de `dY` sous `Y_PMO`.
 *
 * `pmo` est le seul plancher qui diffÃ¨re du modÃ¨le, et pour une raison
 * gÃ©omÃ©trique : la course horizontale de `sg-pmo` est Ã  une hauteur fixe
 * (`V.bar / 2`) et n'atteint le milieu de la face gauche que si la boÃ®te fait
 * exactement `pmo`. La largeur du PMO n'y peut rien : c'est la hauteur qui compte.
 */
/**
 * Hauteur d'un plan de texte : lignes Ã— corps Ã— interligne, plus l'espacement
 * fixe du niveau. Le sur-titre est en `leading-tight` (1,25) et l'intitulÃ© en
 * `leading-[1.15]`, d'oÃ¹ deux interlignes distincts ; les espacements sont les
 * `py-1` / `pb-1` / `pt-1` des trois lignes de `OrgNode`, plus le padding et les
 * bordures du niveau.
 */
const textH = (lines: number, size: number, leading: number, gap: number) =>
  lines * size * leading + gap

/** Corps effectifs Ã  `fontScale: 4/3` â€” voir `BASE` dans `OrgNode`. */
const B = 4 / 3
const S_EYEBROW = 20 * B
const S_LABEL = 30 * B
const S_PERSON = 24 * B
/** Services : corps Ã  0,875 de la base, cf. `SERVICE_FONT` dans `OrgNode`. */
const S_SVC_LABEL = 30 * B * 0.875
const S_SVC_PERSON = 24 * B * 0.875

/**
 * Espacements fixes par niveau, en px : padding haut + bas + les deux bordures de
 * 1 px. Le niveau `svc` est le seul dont le fond change, pas la mÃ©canique â€” d'oÃ¹
 * une padding plus serrÃ©e, reprise de l'original (5 px verticalement).
 */
const CHROME = {
  gov: 2 * 8 + 2,
  dir: 2 * 10 + 2,
  svc: 2 * 5 + 2,
} as const

const NOM = {
  /** 1 sur-titre + 1 intitulÃ© + 1 titulaire, tous sur une ligne Ã  500 px de large. */
  gov: Math.ceil(
    textH(1, S_EYEBROW, 1.25, 4) +
      textH(1, S_LABEL, 1.15, 8) +
      textH(1, S_PERSON, 1.25, 4) +
      CHROME.gov,
  ),
  /** Sur-titre 1 ligne, intitulÃ© 2 lignes (20 caractÃ¨res Ã  40 px dans 420 px utiles). */
  pmo: Math.ceil(
    textH(1, S_EYEBROW, 1.25, 4) + textH(2, S_LABEL, 1.15, 8) + CHROME.gov,
  ),
  /** Sur-titre 1 ligne, intitulÃ© 2 lignes (jusqu'Ã  29 caractÃ¨res), titulaire 1 ligne. */
  dir: Math.ceil(
    textH(1, S_EYEBROW, 1.25, 4) +
      textH(2, S_LABEL, 1.15, 8) +
      textH(1, S_PERSON, 1.25, 4) +
      CHROME.dir,
  ),
  /** Pas de sur-titre : intitulÃ© 2 lignes, titulaire 1 ligne. */
  svc: Math.ceil(
    textH(2, S_SVC_LABEL, 1.15, 8) + textH(1, S_SVC_PERSON, 1.25, 4) + CHROME.svc,
  ),
}

/**
 * DÃ©gagement vertical sous le PMO, en px : la distance entre le bas du PMO et la
 * barre de distribution. C'est le seul Ã©cart qui doit rester visible, sinon le
 * PMO semble toucher la barre.
 */
const PMO_CLEARANCE = 27

/**
 * Gardes verticales, en px.
 *
 * Toutes exprimÃ©es en fraction du corps de base plutÃ´t qu'en px : le canevas est
 * dimensionnÃ© pour l'impression, donc une garde en px se dilate d'un facteur 4/3
 * quand `fontScale` change, et les proportions se calent de la figure se
 * dÃ©rÃ¨glent. Ici `link` vaut 1,1 em, `svc` 0,45 em, `drop` 0,65 em et
 * `dirToSvc` 1,6 em.
 */
const em = (n: number) => Math.round(n * S_LABEL)
const V = {
  /** Entre deux maillons de la chaÃ®ne de gouvernance. */
  link: em(1.1),
  /**
   * Du bas du SG Ã  la barre des directions.
   *
   * Elle doit aussi laisser passer le PMO, qui pend au milieu du tronc. Le
   * dÃ©gagement vaut `bar / 2 âˆ’ NOM.pmo / 2`, donc il est **imposÃ©** par la hauteur
   * du PMO et ne peut pas Ãªtre choisi indÃ©pendamment d'elle :
   *
   *     bar = NOM.pmo + 2 Ã— PMO_CLEARANCE
   *
   * D'oÃ¹ le calcul plutÃ´t qu'une constante en dur : si la hauteur du PMO change,
   * la garde suit. C'est le seul levier du canevas qui ne serve Ã  rien d'autre,
   * donc le premier Ã  serrer si la page paysage dÃ©borde â€” et le seul Ã 
   * pouvoir l'Ãªtre.
   */
  bar: NOM.pmo + 2 * PMO_CLEARANCE,
  /** De la barre au haut des directions : une chute, pas un contact. */
  drop: em(0.65),
  /**
   * Du bas d'une direction au premier service.
   *
   * Il ne relie plus rien depuis la suppression des 14 liens : c'est dÃ©sormais
   * le **seul** blanc entre les deux rangs, donc la respiration qui montre
   * l'appartenance d'un service Ã  sa direction. Il vaut plus que la garde
   * `link`, qui ne sÃ©pare que des maillons d'une mÃªme chaÃ®ne.
   */
  dirToSvc: em(1.6),
  /** Entre deux services empilÃ©s. */
  svc: em(0.45),
}

/** Empilement vertical : chaque rangÃ©e part de la prÃ©cÃ©dente, plus rien Ã  retrancher. */
const Y_DG = 0
const Y_AG = Y_DG + NOM.gov + V.link
const Y_SG = Y_AG + NOM.gov + V.link
const BAR_Y = Y_SG + NOM.gov + V.bar
const Y_DIR = BAR_Y + V.drop
const Y_SVC_1 = Y_DIR + NOM.dir + V.dirToSvc

/**
 * Hauteur d'une colonne de services, pour la colonne `i`.
 *
 * **Par colonne, pas globale.** Depuis la suppression des liens, chaque colonne
 * est un groupe visuellement autonome : elle ne doit pas hÃ©riter du plancher de sa
 * voisine. Un global forcerait les 14 boÃ®tes Ã  la hauteur de la plus haute,
 * donc au padding de la plus bavarde de la figure â€” les colonnes aux intitulÃ©s
 * courts se rempliraient derechef de vide.
 *
 * L'estimation par colonne reste la seule source d'incertitude (cf. `NOM`) : le
 * dÃ©passement Ã©ventuel est ce que le tableau DEBUG doit signaler, colonne par
 * colonne.
 */
const SVC_LINES: Record<number, { label: number; person: number }> = {
  0: { label: 2, person: 1 }, // Marketing & Communication, 25 caractÃ¨res
  1: { label: 2, person: 1 }, // Bureau de Gestion de Projets, 29 caractÃ¨res
  2: { label: 2, person: 1 }, // BU Expertise & Innovation, 25 caractÃ¨res
  3: { label: 1, person: 0 }, // ContrÃ´le de Gestion, TrÃ©sorerie / ComptabilitÃ©
  4: { label: 1, person: 1 }, // Ressources Humaines, Administratif
}
const svcHeight = (i: number) => {
  const lines = SVC_LINES[i]
  return Math.ceil(
    textH(lines.label, S_SVC_LABEL, 1.15, 8) +
      (lines.person ? textH(lines.person, S_SVC_PERSON, 1.25, 4) : 0) +
      CHROME.svc,
  )
}

/**
 * Le PMO pend au **milieu du tronc** du SG, et sa course horizontale est Ã 
 * cette hauteur exacte (`trunkFraction: 0.5`) : les deux valeurs ne peuvent pas
 * diverger. D'oÃ¹ le `Y_PMO` recentrÃ© sur ce mÃªme milieu â€” sinon le coude de
 * l'arÃªte se mettrait Ã  cheniller dans le vide pour rattraper l'Ã©cart.
 *
 * L'Ã©cart rÃ©siduel entre la course et l'arrivÃ©e s'Ã©crit, toutes hauteurs rÃ©elles
 * `h` connues :
 *
 *     dY = (NOM.gov âˆ’ h_sg) + (h_pmo âˆ’ NOM.pmo) / 2
 *
 * Les deux termes doivent Ãªtre nuls, et chacun pour une raison diffÃ©rente :
 * `NOM.gov` cale la course (elle part du bas **rÃ©el** du SG), `NOM.pmo` cale
 * l'arrivÃ©e (elle vise le centre **rÃ©el** du PMO). Un seul des deux suffit Ã 
 * casser l'arrivÃ©e droite, et le symptÃ´me â€” un dÃ©crochement vertical Ã  la face du
 * PMO â€” ne dÃ©signe pas la cause : il faut le tableau de `OrgBusEdge` pour la
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
   * Hauteur plancher, venue de `NOM`. Elle est portÃ©e par `data` et non par
   * `style` parce que la cible de l'export est la carte interne : le `style` du
   * nÅ“ud s'applique au wrapper `react-flow__node`, qui n'est pas rasterisÃ©.
   */
  minHeight: number
}

/**
 * `OrgNode` lit `label` / `eyebrow` / `person` / `orgLevel` ; la couleur sert Ã  la
 * bordure gauche et au sur-titre, et elle est **partagÃ©e** entre une direction et
 * ses services : c'est ce qui tient le regroupement depuis la suppression des
 * liens. La seule dimension posÃ©e dans le `style` du nÅ“ud est la **largeur** : c'est
 * elle qui aligne les colonnes, et elle n'est pas touchÃ©e par l'export. La hauteur,
 * elle, passe par `data.minHeight` â€” voir `NOM` pour pourquoi c'est un plancher et
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
  /** Services de la direction : intitulÃ© puis titulaire (absent si non communiquÃ©). */
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
      { label: 'ExpÃ©rience Client', person: 'M. Brahima KonÃ©' },
    ],
  },
  {
    key: 'd3',
    color: C.d3,
    services: [
      { label: 'BU Expertise & Innovation', person: 'M. Jean Vincent Kassi' },
      { label: 'BU Ã‰dition Logicielle' },
    ],
  },
  {
    key: 'd4',
    color: C.d4,
    services: [
      { label: 'ContrÃ´le de Gestion' },
      { label: 'TrÃ©sorerie / ComptabilitÃ©' },
      { label: 'FiscalitÃ©' },
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
  'Production & ExpÃ©rience Client',
  'Innovation & Expertise',
  'Performance FinanciÃ¨re & FiscalitÃ©',
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
      eyebrow: 'Direction GÃ©nÃ©rale',
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
      eyebrow: 'Administrateur GÃ©nÃ©ral',
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
      label: 'M. StÃ©phane Ouattara',
      eyebrow: 'SecrÃ©tariat GÃ©nÃ©ral',
      person: 'SecrÃ©taire GÃ©nÃ©ral & COO',
      color: C.sg,
      orgLevel: 'gov',
      minHeight: NOM.gov,
    }),
  },
  {
    // Le PMO est dÃ©calÃ© Ã  droite, au-dessus du gouttier qui sÃ©pare les 4áµ‰ et 5áµ‰
    // directions (cf. `PMO_CX`). Sa course part du milieu du tronc du SG et entre
    // par la gauche â€” voir l'arÃªte `sg-pmo`.
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

  // Plancher de la colonne, commun Ã  ses services : c'est lui qui fait que les
  // boÃ®tes d'une mÃªme direction font la mÃªme hauteur et que la colonne se lit
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

/** Gouvernance : les trois boÃ®tes sont alignÃ©es, l'arÃªte est donc un trait droit. */
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
  // Le PMO s'accroche Ã  la **liaison** qui descend du SG, pas Ã  la boÃ®te : sa
  // course horizontale part de la moitiÃ© du tronc (`trunkFraction: 0.5`) et entre
  // par la gauche du PMO. `busGap` reste alignÃ© sur celui des cinq directions â€”
  // c'est cette valeur qui donne la longueur du tronc, donc la position du
  // milieu.
  //
  // `busRadius: 0` parce que ce raccord n'a rien d'une barre de distribution : il
  // part du milieu d'un tronc et entre de niveau dans la face du PMO. Angles
  // vifs, sinon la courbe de 12 px se lit comme un arrondi Ã  l'arrivÃ©e, alors que
  // les deux seuls angles possibles (le dÃ©part du tronc et l'arrivÃ©e) sont des
  // coudes Ã  90Â°. Les cinq barres de directions gardent le rayon par dÃ©faut, qui
  // reste la bonne convention Ã  cet endroit.
  //
  // L'arrivÃ©e est un segment **horizontal unique** : `runY` tombe exactement sur
  // le milieu de la face gauche, donc le dernier point de la polyligne est
  // confondu avec l'avant-dernier et disparaÃ®t. C'est le contrat de `NOM.pmo` qui
  // le garantit, pas une coÃ¯ncidence.
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
  // MÃªme source, mÃªme `busGap` : les cinq `busY` coÃ¯ncident, et leurs segments
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
  // Ã  leur direction Ã©taient supprimÃ©s le 2026-10-04 : voir l'en-tÃªte du fichier.
  // Le rattachement est portÃ© par l'alignement et la teinte, ce qui rend
  // l'alignement et la teinte **structurels** â€” voir `SVC_W` et `PMO_CX`.
})

export const syneliaAvecAg: DiagramDefinition = {
  id: 'organigramme-synelia-avec-ag',
  title: 'Organigramme â€” Groupe Synelia',
  category: 'organigramme',
  domain: 'Gouvernance, directions opÃ©rationnelles et services',
  /**
   * Corps Ã— 4/3 : l'intitulÃ© passe de 30 Ã  40 px.
   *
   * C'est le levier qui fait tenir la page paysage. La figure est rÃ©duite Ã 
   * 25,3 cm de large, et la taille imprimÃ©e ne dÃ©pend que de la **densitÃ©**
   * `w/B` : sans cette multiplication, il faudrait rÃ©duire le canevas de 2644 Ã 
   * ~1800 px pour atteindre 10,9 pt, ce qui ne laisserait plus la place de cinq
   * colonnes lisibles. Grossir le corps et le canevas dans la mÃªme proportion
   * garde la densitÃ© visÃ©e, et fait passer les intitulÃ©s de direction sur
   * 2 lignes au lieu de 3 Ã  4.
   *
   * RÃ©glage de corps, pas de gÃ©omÃ©trie : les positions restent fixes.
   */
  fontScale: 4 / 3,
rigidLayout: true,
  nodes,
  edges,
}