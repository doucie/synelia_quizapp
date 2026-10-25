# 20261017 — Figure « Palette documentaire du mémoire »

Source : `z_mémoire/template_memoire/typst/theme.typ` (bloc `palette`, lignes 1-8)
+ usages constatés dans `theme.typ`/`sections/`. Style Gouvernance (`OrgNode`) +
conventions `memoire`. Id `memoire-palette-typst`, catégorie `memoire`,
1 rangée de 6 pastilles, jetons demandés uniquement (pas `accent_soft`).

## Jetons (verbatim theme.typ)
| jeton | hex | usage |
|---|---|---|
| primary | `#1a365d` | Titres de chapitres, filets 0,85 pt (20 usages) |
| secondary | `#2c5282` | Sous-titres, petites capitales (5) |
| accent | `#3182ce` | Liens (soulignés 0,4 pt) et étiquettes 9 pt (2) |
| ink | `#1a202c` | Texte fort, citations italiques (4) |
| muted | `#4a5568` | Textes secondaires, en-tête/pied, légendes (10) |
| line | `#cbd5e0` | Filets 0,4-0,8 pt et cadres (7) — seul jeton clair, `inkOnSwatch` |

## Lot unique
- [x] `Variant` + `'palette'` ; `paletteSwatches?` + `interface PaletteSwatch` (`types/index.ts`)
- [x] `src/components/Nodes/PaletteNode.tsx` (composite unique, zéro arête, aucun Handle ;
      bande couleur pleine + hex mono ; filet `hsl(var(--input))` ; `px()` `--org-font-scale`)
- [x] Délégation `EntityNode` → `PaletteNode`
- [x] `src/diagrams/memoire/palette_typst.ts` (hex verbatim, W = 1160, `rigidLayout`, `fontScale 4/3`)
- [x] Registre `src/diagrams/index.ts`
- [x] `npx tsc --noEmit` + `npx vite build` OK
- [x] Ligne 22 du tableau mémoire (`AGENTS.md`)
- [ ] export ⤓ (vérif navigateur) → `memoire-palette-typst.svg`
- [ ] insertion `body.typ` (emplacement à décider : annexes / intro des figures)

## Invariants
- jamais `height`, seul `minHeight` en `data` ; corps `calc(var(--org-font-scale,1)*Npx)` inline ;
  `exportWidth` px inline = `style.width` nœud ; racine `[data-export-root]`.
- Les hex sont **données** (chargement de `theme.typ`), pas du stylisme : la règle
  « pas de couleurs en dur » ne s'applique pas à cet affichage.
- Palette documentaire (`theme.typ`) ≠ accents des figures (`SAFE_HUES`, catégorie
  `palette` existante `palette-colors`) : familles distinctes, assumées.

## Addenda 20261017 — rangée « Proposition » (familles A + C)

2ᵉ rangée de **démonstration**, non normative (ne vit PAS dans `theme.typ`) :
sémantiques (famille A) + neutres intermédiaires (famille C), tirées de la même
échelle Chakra que le thème. `PaletteSwatch.group` range les pastilles (ordre des
données = source de vérité) ; `PaletteNode` rend un titre de groupe par rangée.

| jeton | hex | usage | Chakra |
|---|---|---|---|
| success | `#38a169` | Succès, validations | green.600 |
| warning | `#dd6b20` | Avertissements | orange.600 |
| danger | `#e53e3e` | Erreurs, rejets | red.500 |
| info | `#319795` | Information, transitions | teal.500 |
| surface | `#edf2f7` | Fonds de surface clairs (`inkOnSwatch`) | gray.100 |
| tone | `#718096` | Gris intermédiaire | gray.500 |

- [x] `PaletteSwatch.group?` (`types/index.ts`)
- [x] `PaletteNode` : rangées groupées (titre uppercase) + cartes inchangées
- [x] `palette_typst.ts` : 12 pastilles (6 thème + 6 propositions), W 1160
- [x] `npx tsc --noEmit` + `npx vite build` OK
- [ ] export ⤓ (`memoire-palette-typst.svg`) — pour le mémoire, ne figer que la
      rangée « Jetons du thème » si la proposition ne doit pas y figurer

## Addenda 20261017 bis — la Fig. 7 consomme les jetons sémantiques

Les 3 propositions sémantiques quittent le statut de simple démonstration : la
matrice de benchmark (Fig. 7, `BenchmarkNode.tsx`) les emploie désormais pour
Oui / `~` / Non et pour la colonne Synelia. `hsla()` (`src/utils/color.ts`)
accepte `#rrggbb` → `rgba(...)` (avant, seul `hsl(H…)` était parsé : un hex aurait
fait disparaître la teinte 0,07). Périmètre : **Fig. 7 seule** (ni fig. 4 ni
fig. 18, harmonisation ultérieure possible).

- [x] `hsla()` : branche hex → `rgba` (`src/utils/color.ts`)
- [x] `BenchmarkNode` : `GREEN #38a169` / `AMBER #dd6b20` / `RED #e53e3e`
- [x] `npx tsc --noEmit` + `npx vite build` OK
- [ ] vérif visuelle (`npm run dev`) : teinte 0,07 de l'en-tête/Synelia toujours peinte

## Addenda 20261020 — `accent_soft` rejoint la rangée « Jetons du thème »

La rangée du thème doit être **verbatim et exhaustive** : `theme.typ` contient 7
jetons, la figure n'en montrait que 6 (`accent_soft` avait été exclu du cahier
initial). Ajout entre `accent` et `line` (ordre de `theme.typ`), `inkOnSwatch`
(jeton clair). Usages sourcés : tableaux alternés (`theme.typ:114`),
`note-box` (`theme.typ:202-207`), cartes Merise (`sections/body.typ:887,901,915`).
`W` passe de 1160 à **1280** : la rangée Thème passe à 7 cartes (~160 px au lieu
de ~180) et le nom `accent_soft` doit tenir sur une ligne pour ne pas casser
l'alignement de la rangée ; fallback si ça dépasse au rendu : réduire
`NAME_SIZE` d'un cran (jamais de wrap).

- [x] `palette_typst.ts` : `accent_soft` + `W` 1280 + commentaire d'en-tête
      (7 jetons, usages sourcés)
- [x] `PaletteNode.tsx` inchangé (data-driven, `toGroups` by `group`)
- [x] `npx vite build` OK — ⚠ `npx tsc --noEmit` : 132 lignes d'erreurs
      **préexistantes** (WIP session 20261019, fig. 23/24, tous fichiers hors
      `palette_typst.ts` ; comptage identique avec/sans la modif, vérif par
      stash) — à régler sur le lot folklorique claude, pas ici
- [ ] vérif visuelle (`npm run dev`) : nom `accent_soft` sur une ligne, aucune
      rangée désalignée

## Addenda 20261020 bis — rangée « chromatiques » (3 hues franches)

Retour utilisateur : les pâles/neutres manquent de relief, il faut des teintes
franches. Nouvelle 3ᵉ rangée (groupe distinct, sinon la rangée « Proposition »
passerait à 9+ cartes trop étroites : le mélange forcerait le wrap des noms).
Même échelle Chakra v1 que le reste des propositions.

| jeton | hex | usage | Chakra |
|---|---|---|---|
| yellow | `#ecc94b` | Surlignage, points d'attention | yellow.500 |
| purple | `#805ad5` | Badges et étiquettes | purple.600 |
| pink | `#d53f8c` | Accents secondaires | pink.600 |

Suites de la séance : `cyan #00b5d8` ajouté puis **retiré le jour même** (retour
« too much » ; dans l'échelle Chakra, les hues restantes — blue/orange/teal/
green — collisionnent toutes avec des jetons déjà affichés, donc pas de
remplacement). `yellow` en `inkOnSwatch` (jaune clair) ; `W` inchangé (1280) ;
**16** pastilles en 3 groupes (7 thème + 6 sémantiques/neutres + 3 chroma).

- [x] `palette_typst.ts` : `CHROMA = 'Proposition — chromatiques (à valider)'`
      + 4 entrées + commentaire d'en-tête (10 propositions)
- [x] `PaletteNode.tsx` inchangé (groupes calculés via `toGroups`)
- [x] `npx vite build` OK — `tsc --noEmit` : erreurs préexistantes WIP
      fig. 23/24 inchangées (cf. addenda précédent)
- [ ] vérif visuelle (`npm run dev`) : 3 rangées alignées, noms jamais wrappés

## Addenda 20261025 — reclassée en catégorie `palette`

Demande utilisateur : la figure vit sous « Palette » dans la sidebar, pas sous
« Mémoire ». `category: 'palette'` + `git mv src/diagrams/memoire/palette_typst.ts
→ src/diagrams/palette/palette_typst.ts` (les dossiers reflètent les catégories).

**Id, URL et export inchangés** (`memoire-palette-typst`) : pas de casse des liens
`/memoire-palette-typst`, de la clé localStorage ni du nom du SVG exporté.
Aucun changement de rendu : `rigidLayout`, `fontScale: 4/3`, fonte Cabinet Grotesk
et `W = 1280` sont portés par la définition. `category` n'est lu que par
`Sidebar` (regroupement) et `DiagramCanvas` (`isTraitement`), tous deux insensibles
au passage `memoire → palette`.

- [x] `git mv` + `category: 'palette'` + commentaire d'en-tête (id conservé)
- [x] `diagrams/index.ts` : import déplacé, entrée sortie du bloc Mémoire
      (`23 + 2 Claude`) vers `Palette (2)`, après `color_palette`
- [x] Docs : `AGENTS.md` (ligne du tableau), `README.md` (ligne Palette)
- [ ] vérif visuelle (`npm run dev`) : figure sous « Palette », dernier groupe


