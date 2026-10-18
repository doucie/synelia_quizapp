# AGENTS.md — Contexte projet pour les sessions

Projet de fin d'études (ENSIT 2026, entreprise SYNELIA) : plateforme web de **recrutement via quiz**,
avec processus complet (campagnes, candidatures, quiz, entretiens, évaluations, décisions).
Vue d'ensemble rapide : `README.md` racine.

## Blocs principaux

| Dossier | Rôle |
|---|---|
| `quizapp/` | Backend **Java 21 / Spring Boot 3.5** (WAR). Package `tech.synelia.quizapp`. JPA/MySQL, migrations Flyway, API **tout en POST** (`POST /entity/action`, format `{user, datas[]}`), code généré Telosys (`TelosysTools/`). |
| `quizapp_front/` | Frontend **Angular 20** (SCSS, BEM, variables CSS `:root`). Parcours candidat + dashboard. Routes : `src/app/app.routes.ts`. |
| `z_mémoire/` | Mémoire (sources Typst `template_memoire/typst/`), figures, et **`figures_flow/`** : SPA React Flow **indépendante** des diagrammes Merise/UML (MCD/MLD/MPD + MCT/SAT/MPT/MOT). |
| `cartographie-fonctionnelle-front/` | Cartographie métier route-first, base de données cible, audits, évolutions fonctionnelles. |

## Conventions & règles (références — ne pas réécrire ici)

- `to-do/rules/general-rules.md` : API tout-en-POST, update partiel (`""` → ignorer, `null` → mettre à null, autre → mettre à jour), front envoie `null` au lieu de `""`, pas de couleurs en dur, réutiliser l'existant, mettre à jour les checklists.
- `to-do/rules/to-do-rules-back.md` : structure par entité (Entity/Business/Repository/`_Repository`/Controller/Dto/`_Dto`/Transformer), responsabilités fixes, interdits anti-spaghetti, checklist pré-merge.
- `to-do/rules/to-do-rules-front.md` + `quizapp_front/RULES.md` : uniquement les variables CSS/design-tokens fournis (aucune couleur/px/font hardcodée), pas d'émojis (icônes/SVG), composants réutilisables, ne pas piper une date déjà formatée `dd/MM/yyyy`.
- Git : milestones/commits en conventional commits (ex. `fix(edge): …`, `feat(edge): …`).

## figures_flow (contexte de travail le plus actif)

- Démarrer : `cd z_mémoire/figures_flow && npm run dev`. Build : `npx vite build`. Typecheck : `npx tsc --noEmit`.
- Projet **indépendant** du front Angular. Docs : `README.md` dédié + méthode Merise dans `plans/rules/regles_mcd.md`.
- Persistance **localStorage** : positions `figures_flow:diagram:<id>`, côtés `figures_flow:edge_sides:<id>`, overlay debug `figures_flow:debug_edges` (bouton `DEBUG` → ancrage déclaré→résolu, offset px ; sur l'organigramme : `runY`/`targetY`/`dY` + hauteur mesurée, seul moyen de voir un dépassement de `minHeight`). Overlay porté par `RelationshipEdge`, `TraitementEdge` **et `OrgBusEdge`**, obligatoirement via `EdgeLabelRenderer` (`BaseEdge` rend un `<path>` en namespace SVG — un `<div>` à côté ne rendrait rien).
- Plans par convention : `plans/implementations/YYYYMMDD_<sujet>.md`, avec checkboxes `[ ]`/`[x]`. Addenda des détails rapatriés : `plans/implementations/20261015_addenda_condensation.md`.
- Export SVG (figure + bloc ⤓) : **invariant de placement** (raster dimensionné *et* positionné d'après la boîte réellement rasterisée ; contrat `[data-export-root]`, sinon `dx`/`dy` de `captureNodePadded`) et **bordure repeinte au raster** — `plans/rules/regles_export_svg.md` (polices auto-hébergées `src/assets/fonts/`, vars `--mct-*` recopiées, `exportWidth` px inline jamais `%`).
- **3 invariants valables pour toute figure** : jamais de `height` posée (`captureNodePadded` la jette — seul `minHeight` en `data` survit) ; un corps `calc(var(--x,1)*Npx)` en `style` inline, jamais en classe Tailwind arbitraire ; toute variable d'échelle déclarée aux 2 endroits (`DiagramCanvas` + `CAPTURE_CSS_VARS` dans `exportSvg.ts`).

### État actuel (arêtes : ancrages et MCT)
- Offset partagé par **ancrage résolu** (RF v12 ancre sans handle sur le 1er handle) : `resolveHandleId` / `edgePathOffset` / `edgeAnchorGroup` + `validHandles` (source unique, gère `mct-syncop`) dans `src/components/Edges/edgeAnchors.ts`. Reliquat : **Option A** (sanifier les `edge_sides` périmées).
- MCT verticaux par défaut (sortie bas, entrée haut) : ordre des `<Handle>` de `Handles({ order })` (`ProcessNode.tsx`) **identique** à `handleIdsOf` (`MCT_SOURCE/TARGET_HANDLES`), sinon RF et l'offset divergent. `'vertical'` seulement `mct-*` ; MOT hérite via `archive/`.
- `plans/mct/nouveaux_mct.md` = source de vérité des libellés (raccourcis sans changer le sens, parenthèses retirées sauf `(RET)`/`(REF)` T6). 9 traitements en `archive/` (`category: 'archive'`, ids `mct-v2-N-*`) ; `event-result` arrive sur la **synchronisation** (`CrossLink` : `tN-mctN-op`, `targetHandle: 'top'`) ; `syncLabel` = opérateur des flèches dessinées (T1/T2/T4/T5 `ET`, T7 formule, T0/T8/T3/T6 vides — T3/T6 assumés, coutures non représentées). 4 parcours (`mct-v2-parcours-1..4`, fabrique `buildCombine`, `ROW_HEIGHT` 640, croisées 2/2/2/0) ; un cross-link inter-figures est retiré + `console.error` ; T8 solo.
- Pentagone : bande utile réservée en **HAUTEUR** (`paddingBottom ≥ paddingTop + 2×encre − lineBox` → `pt-3 pb-7` à 12 px, `pt-1 pb-4` à 8 px). Faux remèdes revertés : `items-stretch`, `pb-[18px]`. `syncFontSize` = typographique seul (T7 = 9). Résultats à `y: 450` ; MOT legacy +10 px ; `MotSync`/`MotMatrix`/`MotMctCell` morts (`ProcessNode.tsx:370-371`).
- Arêtes MCT droites (`data.straight` posé par `DiagramCanvas` via `startsWith('mct')`, un seul endroit) ; escalier sinon (`RelationshipEdge`, non modifié). Ancre événement = un handle `top`.
- Encadrements (4 parcours seuls) : un seul cadre (`hovered`/`focused`, `focused` = préfixe sans survol ailleurs), verrou sans trait persistant (`data-locked` supprimé), filtre `hovered \|\| focused` (jamais `locked`), glissement groupé persisté `lockedSections`. `<DiagramCanvas key={id}>` : tout changement de figure = remontage ; ids uniques. Piège `localStorage` : positions périmées après remaniement → bouton `↺`.
- `ConfirmDialog` (seul dialogue, pas de Radix) : 3 sites (`Toolbar` + reload, `MotTableToolbar`, `MotEditToolbar`), portail `body` `z-[1100]` (viewport transformé), a11y complète, voile `bg-black/50` assumé. Figures `rigidLayout` sans bouton ; 6 `↺` d'arêtes hors périmètre.

### État actuel (figures du mémoire — 1 ligne par figure, détails dans les plans)

Règles partagées : catégorie `memoire`, rigide (`rigidLayout`, fonte Cabinet Grotesk épinglée, `fontScale: 4/3`), nœud composite unique + zéro arête RF sauf 4/7/8/9/16, teintes acteurs fig. 1 (`210/240/285/330`, jamais hiérarchiques ailleurs), texte petit → `foreground/85` (jamais pâleur), export `captures/8-figures-memoire/` + insertion Typst. Légende : `plans/implementations/20261015_addenda_condensation.md`.

| # | Figure (`src/diagrams/memoire/`) | § | Point de vigilance | Plan |
|---|---|---|---|---|
| 1 | `acteurs_systeme` (`actor`→`ActorNode`) | 1.3.2 | Neutralité par la géométrie (555/60/120), pas par l'absence de couleurs | 20261006_acteurs_systeme |
| 2 | `perimetre_projet` (`scope`→`ScopeNode`, générique) | 1.3.3 | Hauteurs fixes admises *dans* le nœud ; pills `bg-muted` solide ; paie/contrats flous assumés | 20261006_perimetre_projet |
| 3 | `quadrant_frontend` (`quadrant`→`QuadrantNode`) | 2.4.3 | Marqueur 44 px découplé du tag (540 px final) ; zonage 4 teintes alpha égales ; Angular 335 / React 210 / Vue 166 | 20261006_quadrant_frontend |
| 4 | `arbre_sgbd` (`decision`→`DecisionNode`) | 2.4.4 | Réponse = nœud `answer` (10/9/0, fini les ancrages partagés) ; arêtes `traitement` + pastille Oui/Non ; sorties en tirets, descentes vert 128 via `data.stroke` ; logos inline, gris en `currentColor` ; Q3 « Oui » provisoire | 20261006_arbre_sgbd |
| 5 | `tour_stack` (`stack`→`StackNode`) | 2.4.5 | Logos partagés `Nodes/logos.tsx` recolorés (335/100/0/128) ; fantômes en puces `muted` ; bandeau `vertical-rl` par `minHeight` | 20261007_tour_stack |
| 6 | `fiches_persona` (`persona`→`PersonaNode`) | 3.1.1 | Grille 2×2, `minHeight` 780 ; avatars DiceBear Notionists plein inline + crop `cover` ; avatar 144 plein-cercle | 20261007_fiches_persona |
| 7 | `cycle_etape` (`state`→`StateNode`) | 4.3.3 | Reconstruite sur `ApplicationProgressBusiness` (PENDING pré-créées) ; 1re à pointes (`markerEnd`, export réécrit les ids en `m0…`) ; `right-low` étagé ; `labelBorder` réservé ici ; `AWAITING_VALIDATION`/`EXPIRED` omis | 20261007_cycle_etape |
| 8 | `auth_fourche` (`auth`→`AuthNode`) | 3.2.1 | Convergence en point unique (`top` + `noAnchorOffset`, `dx=0`) ; fourche garde l'offset ; Feather partagées (`link`, pas de `ticket`) ; `STEP_MIN` 116 | 20261008_auth_fourche |
| 9 | `notif_canaux` (`notif`→`NotifNode`) | 3.2.7 | 3 colonnes zéro croisement (2 rejetées) ; Bézier par opt-in `data.curved` ; exception en pointillés sans pastille (explication dans le caption) | 20261009_notifications |
| 10 | `bf_grille` (`bf`→`BfNode`, monolithe) | 3.2.8 | 8 cartes identiques 4×2, seule la teinte code les familles ; `minHeight` 310 ; mégaphone Heroicons (pas de mégaphone Feather) | 20261009_besoins_fonctionnels |
| 11 | `anneaux_acteurs` (`rings`→`RingsNode`) | 3.2.9 tab.1 | Centre Candidat → extérieur Super admin (ne pas inverser) ; taille classe, couleur identifie ; callouts 300 px (le 340 mordait) | 20261009_acteurs_concentriques |
| 12 | `hub_nfr` (`hub`→`HubNode`) | 3.3 | Inverse des concentriques : 7 médaillons égaux (orbit 340), **aucune teinte**, traits sans pointes | 20261010_hub_nfr |
| 13 | `rg_kanban` (`rg`→`RgNode`) | 3.6 | Flèche verticale RÈGLE→EFFET par carte (l'horizontale tombait à ~10 car./ligne) ; `hubTitle` 1 ligne 24 px | 20261010_rg_kanban |
| 14 | `merise_uml` (`versus`→`VersusNode`) | 4.2.1 | v3 balance 3-3, chaque ligne montre son penchant ; grille 460/260/460 ; navy/bleu hors SAFE_HUES assumés | 20261010_merise_uml |
| 15 | `arbre_depot` (`tree`→`TreeNode`) | 6.3 | Tronc + 3 coudes en L (pas un tableau) ; nom mono 22 ; baleine `docker` recolorée 210 | 20261010_arbre_depot |
| 16 | `deploiement_local` (`deploy`→`DeployNode`) | 6.6 | Trait plein/pointillé = natif/conteneurisé ; hôte = poste (tour À CÔTÉ) ; écran SOUS les arêtes (`data-edges-above` + `edgesAbove`) ; 8 handles (RF ne monte pas l'arête sans ancre) ; couloir proxy 210 px, notes 18 px | 20261010_deploiement_local |
| 17 | `niveaux_tests` (`levels`→`LevelsNode`, flux) | 7.1 | 3 bandes ÉGALES (pas une pyramide) ; exemples en langage courant sourcés du dépôt ; remplace la pyramide (png intact) | 20261013_niveaux_tests |
| 18 | `jauges_modules` (`gauge`→`GaugeNode`, flux) | 8.2 | **Aucun pourcentage** (qualitatif) : vert 128 à 88 %, ambre 30 à 64 % ; tableau conservé | 20261013_jauges_modules |
| 19 | `benchmark_matrice` (`benchmark`→`BenchmarkNode`) | 2.2 | Matrice 6 sections / 14 lignes ; style « Encre » (en-tête navy plein, bandeaux `#f7fafc`, cellules sans pastille, filets horizontaux seuls `#cbd5e0`/contour `#a0aec0` — `--input` invisible à l'impression) ; colonne Synelia teintée + Oui/`~`/Non = jetons de la fig. 22 (`success #38a169` / `warning #dd6b20` / gris `#4a5568` neutre — pas de rouge danger ici) ; `hsla()` accepte l'hex ; coût en € (source CP1252 « 6 000 ? ») ; couleurs via `--fig-*` (version sombre) ; notes Synelia retirées (verbatim dans `figures_html/`) ; export SVG substitué (`memoire-benchmark-matrice.svg` dans `body.typ:230`) | 20261016_refonte_fig7_8_23 |
| 20 | `stack_flux` (`stackflow`→`StackFlowNode`) | 2.3 | Pile 3-tiers en nœud composite, 2 flux en divs (pas d'arêtes RF) ; colours palette documentaire : interface `--fig-danger` / serveur `--fig-success` / stockage `--fig-secondary` (« sql » du logo MySQL en `--fig-warning` via `sqlFill`+`MYSQL_SQL_PATH`) ; teintes `color-mix` (`hsla()` ne parse pas les `var()`) ; flux `--fig-flow-*` (version sombre) ; export SVG à substituer à `stack_technique.png` | 20261016_refonte_fig7_8_23 |
| 21 | `moscow_pyramide` (`moscow`→`MoscowNode`) | 3.5 | Triangle = 4 bandes `clip-path` en % (`flex:1`, racine stretch) → hauteur exacte de la colonne de cartes, apex x=50 %/y=0 ; axe en HTML (`vertical-rl`, `--fig-frame`) ; jetons palette documentaire (`--fig-danger/warning/secondary/neutral`, texte bande `--fig-soft` + effectif 80 %) ; `tinted()` color-mix (pas de `hsla` sur `var()`) ; sans `sub`/`note` ; pastilles toutes au même motif (WON'T via `--fig-neutral`) ; `W` 1370 / pyramide 640 ; substituée (`memoire-moscow-pyramide.svg`, `body.typ`) | 20261016_refonte_fig7_8_23 |
| 22 | `palette_typst` (`palette`→`PaletteNode`) | — (insertion à décider) | 12 pastilles en 2 groupes : 6 jetons verbatim de `template_memoire/typst/theme.typ` (`primary #1a365d` … `line #cbd5e0`) + 6 **propositions** de démonstration (Chakra : success/warning/danger/info/surface/tone, PAS dans `theme.typ`) ; hex = donnée affichée (mono) ; bande pleine + filet `hsl(var(--input))` ; palette document ≠ `SAFE_HUES` (`palette-colors`) | 20261017_palette_typst |

### État actuel (organigramme — socle : `20261003_organigramme_synelia.md`)

- `organigramme-synelia-avec-ag` (23 nœuds / 8 arêtes, paysage A4 25,3 cm, remplace `figures_html/`) : **régénérer le SVG puis le mémoire, jamais l'inverse**. Socle (rigide, hook-dans-effect interdit, invariants, corps imprimés, `busGap`, `trunkFraction`, formule `dY`, relevés après fonte) : voir 20261003. Ici les deltas : 14 liens direction→services supprimés → contrat `SVC_W === DIR_W`, plancher **par colonne** ; `data.orgLevel` gov/dir/svc ; services = fond du thème + contour 4 côtés couleur direction (`border-border` invisible à 95 %) ; export en clair ; fonte épinglée (relevés : `gov` 154, `pmo` 156, `dir` 204 ; dépassements = double encodage CP1252, commit `0efbba4`) ; `SVC_H` par colonne (61/100/140, col3 = 61) ; d4 abrégée ; page `#landscape-figure` (`width: 25.3cm`, `placement: none`).

### État actuel (UML — collab Claude, restart lot 0)
- Lot A (`UcNode` maison + 3 UC) **abandonné et supprimé** : restart propre (« tout jeter pour ne pas se tromper »). Conservés : catégorie **`uml`** (`types`, `Sidebar` « UML » ◑), règles et vérification (`plans/uml/`).
- Mécanisme : variante **`claude`** (`claudeSvg` brut `?raw` + `claudeColors?`) → **`ClaudeSvgNode`** : le SVG livré est rendu **tel quel** après `recolorClaudeSvg` (`src/utils/umlRecolor.ts` : palette `DEFAULT_CLAUDE_MAP` → teintes fig. 1, fonte Cabinet Grotesk, purge C2PA ; couleur non mappée = pastille rouge hors export + `console.error`). Nœud composite unique, zéro arête RF, largeur `exportWidth`, hauteur `viewBox` (jamais `height`).
- Échanges : `plans/uml/echanges/lotN_*.md` (un par lot, faits sourcés fichier:ligne + contraintes SVG + Q&A) ; SVG livrés dans `src/diagrams/uml/claude/`.
- **Intégration lot 1 (15 figures)** : copies dans `src/diagrams/uml/claude/`, registre `src/diagrams/uml/claude.ts` (8 UC, 3 états, 2 séquences, composants, déploiement — `variant: 'claude'`, `exportWidth: 1200`, originaux `results_claude/` intacts), `umlRecolor` +3 couleurs second lot. Contenu non vérifié, `body.typ` intact — vérifications avancées plus tard.
- Détails : `z_mémoire/figures_flow/plans/implementations/20261013_uml_lot_a_uc.md` (abandonné), `z_mémoire/figures_flow/plans/implementations/20261015_uml_integration_claude.md`.

## Pour naviguer
- Base cible BD post-migration 420 : `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_cible_post_420_migration.md`.
- Backlog/audits/checklists : dossier `to-do/` (livrables, règles, prompts).
- Fiches pages/entités front : `cartographie-fonctionnelle-front/dashboard/`, `…/entities/`, `…/public/`.
