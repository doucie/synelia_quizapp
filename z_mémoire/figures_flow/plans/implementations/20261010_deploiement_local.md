# Figure 16 — `memoire-deploiement-local` (6.6 Exécution locale et DevOps)

Topologie d’exécution : natif sur l’hôte vs conteneurisé dans Compose.
Le trait plein/pointillé porte le sens, pas le fond.

## Contenu (verbatim § 6.6 + table `:1274-1278`)

- [x] Cadre plein « Machine hôte (développement local) » ; cadre pointillé
      « Docker Compose » + baleine.
- [x] Angular `:4200` (HMR) → proxy `/api/**` → Spring `:8080` → MySQL
      `:3306` (EXTERNE + Flyway) / Redis `:6379` / MinIO `:9000/9001`.
- [x] Insert `body.typ` après la table (`:1279`), avant « Démarche qualité ».

## Décisions

- [x] Nœuds RF + arêtes (les 4 flèches à pointes + pastille veulent
      `TraitementEdge`) : 2 cadres + 5 services. Cadres tailles fixes
      (`style.width` + `minHeight` exact), rendus d’abord, sans `<Handle>`.
- [x] Variante `deploy` (`deployKind`, `deployTitle`, `deployDashed`,
      `deployLogo`, `deployPort`, `deployNote`, `deployBadge`,
      `deployAccent`) → `DeployNode`. Ports mono 26 teintés (335/100/128/0/
      210) ; badge EXTERNE neutre ; hôte encre pleine 2 px, Compose tirets
      2 px `muted` + baleine 28.
- [x] Routage final (correction demandeur : redis à DROITE) : angular
      `right`→spring `left` (pastille proxy) ; spring `bottom`→mysql `top` +
      minio `left` (éventail X) ; spring `right`→redis `left` (descente
      x≈1060, à 30 px de Redis, traverse le haut de Compose). **Zéro
      croisement** — le croisement (620, 450) du swap précédent a disparu
      avec l’ancienne arête.
- [x] `DeployNode` rend les **8 handles** (4 source + 4 target) : React Flow
      **ne monte pas** une arête dont l’ancre source/cible n’existe pas
      (e-sp-redis `left→left` invisible tant que `left` source manquait —
      piège relevé au harness, 3 arêtes au lieu de 4, zéro erreur console).
- [x] Logos : `redis` + `minio` Simple Icons CC0 rapatriés (`LOGO_BRAND`
      documentés) ; angular/spring/mysql/docker existants.
- [x] `ensureBottomBorder` ignore déjà `dashed` (fix fig. 7) — le pointillé
      survit ; pastille proxy `labelPx` 12.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 7/4 : 4 `marker-end`, 1 pastille proxy, 5 rasters + 2 cadres.
- [x] Visuel : pointillé vs plein, ports lisibles, zéro croisement parasite.
- [x] Notes 1 ligne (relevé : 2 lignes débordaient les planchers) ; port 24
      (`:9000 / 9001` mono 26 passait à la ligne) ; MySQL élargi 460 (badge
      EXTERNE volait la largeur) ; minio `y` 765 (écart 5 px → 20 px).
- [x] Export (8 rasters + pastille, 0 `var()`), Typst, commit `feat(memoire)`,
      `AGENTS.md`.
