# 20261017 — Versions sombres des jetons figures (`--fig-*`)

Demande : « ajoute une version dark pour toutes les couleurs qui n'en ont pas »
(fig. 7 nommée). Le toggle sombre (`ThemeToggle` → `.dark` sur `<html>`) adapte
déjà les figures qui parlent en tokens ; les hex en dur des figures récentes
n'ont pas de variante sombre. Périmètre : fig. 7 + fig. 8 — la fig. 22
(`PaletteNode`) ne bouge PAS (les hex y sont la donnée affichée) ; `MoscowNode`
et les figures antérieures restent token/teintes (déjà adaptées).

## Mécanisme — tokens CSS (choix utilisateur « vas y » = recommandé)

`src/index.css` : `--fig-*` déclarés sous `:root` (clair) et `:root.dark`
(sombre) ; nœuds référencent `var(--fig-x)` inline → adaptation automatique,
résolu par computed styles à l'export (pas de hook JS, pas de re-render).

| token | light | dark | rôle |
|---|---|---|---|
| `--fig-navy` | `#1a365d` | `#1a365d` (inchangé) | bande d'en-tête fig. 7 — texte blanc partout |
| `--fig-cost` | `#1a365d` | `#90cdf4` (blue.300) | coûts fig. 7 (2ᵉ rôle de l'ancien `INK`) |
| `--fig-success` | `#38a169` | `#68d391` (green.300) | Oui |
| `--fig-warning` | `#dd6b20` | `#f6ad55` (orange.300) | `~` |
| `--fig-neutral` | `#4a5568` | `#a0aec0` (gray.400) | Non |
| `--fig-soft` | `#f7fafc` | `#2d3748` (gray.800) | bandeaux de section |
| `--fig-line` | `#cbd5e0` | `#4a5568` (gray.600) | filets internes |
| `--fig-frame` | `#a0aec0` | `#718096` (gray.500) | contour + soulignement en-tête |
| `--fig-tint` | `rgba(56,161,105,.06)` | `rgba(72,187,120,.10)` | colonne Synelia |
| `--fig-danger` | `#e53e3e` | `#feb2b2` (red.300) | couche Interface fig. 8 (Angular) |
| `--fig-secondary` | `#2c5282` | `#90cdf4` (blue.300) | couche Stockage fig. 8 (MySQL) |
| `--fig-flow` | `#3182ce` (accent thème) | `#90cdf4` (blue.300) | flèches fig. 8 |
| `--fig-flow-soft` | `rgba(49,130,206,.10)` | `rgba(144,205,244,.12)` | pastilles fig. 8 |
| `--fig-flow-line` | `#63b3ed` (blue.300) | `#2b6cb0` (blue.700) | bord pastille |
| `--fig-flow-ink` | `#2c5282` (secondary) | `#bee3f8` (blue.200) | texte pastille |

## Fig. 8 aux couleurs de la palette documentaire (suite directe, même jour)

Décision utilisateur : couches `danger` (Angular) / `success` (Spring Boot) /
`secondary` (MySQL, couleur principale du logo), lettre « sql » du logo en
`warning` — « my » et le dauphin restent secondary. Les flux passent de
l'indigo HTML source à l'accent de la palette (`--fig-flow-*`, ex-`indigo`).

- **Piège** : `hsla()` (`src/utils/color.ts`) ne parse que `hsl(H…)`/hex — sur
  un `var(--fig-x)` elle renvoie `undefined`. Teintes de couche →
  `color-mix(in srgb, ${color} N%, transparent)` (helper `tinted`, résoluble
  par computed styles ; 7 % carte, 14 % médaillon, 10 % pastille, 30 % bord).
- **Logo bicolore** : le path Simple Icons mysql est un path unique (8
  sous-chemins : dauphin + M·y·S·Q·trou-Q·L). Annotation par-dessus : les 4
  sous-chemins « sql » (S, Q + son contre-forme, L) extraits par tokeniseur
  (flags d'arc `00` à re-scinder) et repositionnés en absolu → const
  `MYSQL_SQL_PATH` + prop `sqlFill?: string` sur `Logo` (overlay
  `<path>` même fill-rule : le path de base reste intact, les
  contreformes « my » sont préservées).

- [x] `index.css` : les 13 jetons (2 blocs)
- [x] `BenchmarkNode.tsx` : `INK` scindé en `NAVY`/`COST`, références `var(--fig-*)`, import `hsla` retiré (teinte via `--fig-tint`)
- [x] `StackFlowNode.tsx` : 4 constantes indigo → `--fig-flow-*`, teintes `tinted()` (`color-mix`), `sqlFill` sur le logo MySQL
- [x] `logos.tsx` : `MYSQL_SQL_PATH` + prop `sqlFill`
- [x] `stack_flux.ts` : `layer.color` → `var(--fig-danger/success/secondary)`
- [x] `npx tsc --noEmit` + `npx vite build` OK
- [ ] vérif visuelle des deux thèmes (basculer via `ThemeToggle`) + rendu du logo bicolore

## Export toujours clair (décision (a))

L'export ⤓ est un artefact d'impression (figures du mémoire) : `exportSvg.ts`
force le thème clair pour la durée de la capture — `withLightTheme()` retire la
classe `.dark` avant rasterisation et la rétablit dans tous les cas d'arrêt.
Portage : `exportNodeSvg` (capture unique) et `exportSvg` → wrapper sur
`exportSvgLight`. Le fond de page exporté (computed `body`) devient donc
toujours clair, même en navigation sombre.

- [x] `withLightTheme` + wrappers (`exportSvg.ts`)
