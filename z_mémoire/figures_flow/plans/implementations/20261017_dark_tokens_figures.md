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
| `--fig-indigo` | `#6366f1` | `#818cf8` (indigo.400) | flèches fig. 8 |
| `--fig-indigo-soft` | `#eef2ff` | `#1e1b4b` (indigo.950) | pastilles fig. 8 |
| `--fig-indigo-line` | `#a5b4fc` | `#4338ca` (indigo.700) | bord pastille |
| `--fig-indigo-ink` | `#3730a3` | `#c7d2fe` (indigo.200) | texte pastille |

- [x] `index.css` : les 13 jetons (2 blocs)
- [x] `BenchmarkNode.tsx` : `INK` scindé en `NAVY`/`COST`, références `var(--fig-*)`, import `hsla` retiré (teinte via `--fig-tint`)
- [x] `StackFlowNode.tsx` : 4 constantes indigo → `--fig-indigo-*`
- [x] `npx tsc --noEmit` + `npx vite build` OK
- [ ] vérif visuelle des deux thèmes (basculer via `ThemeToggle`)

## Export toujours clair (décision (a))

L'export ⤓ est un artefact d'impression (figures du mémoire) : `exportSvg.ts`
force le thème clair pour la durée de la capture — `withLightTheme()` retire la
classe `.dark` avant rasterisation et la rétablit dans tous les cas d'arrêt.
Portage : `exportNodeSvg` (capture unique) et `exportSvg` → wrapper sur
`exportSvgLight`. Le fond de page exporté (computed `body`) devient donc
toujours clair, même en navigation sombre.

- [x] `withLightTheme` + wrappers (`exportSvg.ts`)
