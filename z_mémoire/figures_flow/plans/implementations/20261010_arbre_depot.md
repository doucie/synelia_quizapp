# Figure 15 — `memoire-arbre-depot` (6.3 Implémentation du frontend)

Le dépôt comme ce qu’il est : un arbre — racine en haut à gauche, tronc
vertical, 3 coudes en L. Rappel direct fig. 5 (mêmes logos Angular/Spring +
baleine Docker, autre moment du mémoire).

## Contenu (verbatim brief + table 6.3)

- [x] Racine « Dépôt SyneliaQuizApp » (gras, pas mono).
- [x] `quizapp/` + Application Spring Boot + desc backend (`springboot`) ;
      `quizapp_front/` + Application Angular + desc frontend (`angular`) ;
      `docker-compose.yml` + Services d’infrastructure locale + desc
      (`docker`). Noms mono 22, sous-titre 16 `muted` empilé (38 car. mono =
      ~500 px, pas de place en ligne), desc italique `/85` à droite.
- [x] Insert `body.typ` après la table 6.3 (fin ~:1170).

## Décisions

- [x] Variante `tree` (`treeTitle`, `treeBranches?: TreeBranch[]` :
      `name/sub/logo/desc`) → `TreeNode` monolithe (précédent `RingsNode`) :
      racine + 3 rangées HTML + tronc/coudes SVG calculés (x≈40). Aucune
      `<Handle>`, zéro arête RF.
- [x] Logos : `angular`/`springboot` existants (accents fig. 5 : 335/100) +
      **`docker` Simple Icons CC0 rapatrié** (baleine officielle), recoloré
      210 — proche du bleu marque, règle série ; `LOGO_BRAND.docker`.
- [x] Mono = stack système `ui-monospace` (pas de fonte custom : la mesure au
      harness EST la vérité d’export). Rigide, `fontScale: 4/3`, fonte
      épinglée (sans), canevas ~1400 px, rangées ~120 px.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 1/0 : 3 logos SVG, tronc + 3 coudes.
- [x] Visuel : arbre lisible, rappel fig. 5 immédiat.
- [x] Export (1 raster, 0 `var()`), Typst, commit `feat(memoire)`, `AGENTS.md`.
