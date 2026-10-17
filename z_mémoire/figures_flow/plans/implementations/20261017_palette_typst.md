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


