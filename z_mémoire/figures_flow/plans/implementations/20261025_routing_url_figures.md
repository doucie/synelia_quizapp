# 20261025 — URL par figure (`/<id>`) + clic droit « ouvrir dans un nouvel onglet »

## Demande utilisateur

1. Chaque figure doit avoir une **URL propre** : `http://localhost:5173/<figure-name>`.
2. Le **clic droit** sur la navigation (sidebar) doit proposer « Ouvrir dans un
   nouvel onglet » / « Copier l'adresse du lien ».

Décisions tranchées (questions posées, réponses utilisateur) :

| Question | Décision |
|---|---|
| Slug | **l'`id` existant** (`/memoire-arbre-sgbd`, `/organigramme-synelia-avec-ag`) — zéro normalisation, déjà unique et stable, déjà utilisé par l'export SVG et les clés `localStorage` |
| `http://localhost:5173/` | **redirection** (`replaceState`) vers la figure courante : toute URL affichée nomme une figure |
| Historique | **`pushState`** : Précédent/Suivant parcourent les figures visitées |

## État initial constaté

- Aucun routeur : `package.json` = React 19 + Vite + Tailwind + `@xyflow/react`
  (+ `lucide-react`, `clsx`, `html-to-image`). Pas de `react-router`.
- `useSidebarState.ts` : l'état actif vit **uniquement** dans
  `localStorage['figures_flow:sidebar'].activeDiagramId`, lu une fois au montage
  (`App.tsx:16-22`). Aucun `pushState`/`popstate` dans `src/` (vérifié) ;
  seul `window.location.reload()` (`App.tsx:43`).
- Navigation = `<button>` (`Sidebar.tsx:62-73`) → aucune cible pour le menu
  contextuel du navigateur.
- `Sidebar` est réutilisé par `FullscreenOverlay.tsx:122-127` : **une seule**
  correction couvre les deux sites de navigation (sidebar normale + plein écran).
- Tous les `id` sont des slugs kebab-case d'un seul segment, uniques (`-archive`
  suffixe les doublons d'archive, ex. `mcd-campagnes-pipeline-archive`).

## Modifications

- [x] **`src/hooks/useDiagramRoute.ts` (nouveau)** — routage history, zéro dépendance :
      - `slugFromPath(pathname)` : trim des `/`, refus des chemins multi-segments,
        `decodeURIComponent` protégé (try/catch) ;
      - `useDiagramRoute()` → `{ routeId, navigate(id, { replace? }) }` ;
      - `navigate` écrit `history.pushState` (défaut) ou `replaceState`, **et**
        n'écrit que si `slugFromPath(location.pathname) !== id` (évite les entrées
        d'historique parasites sur `/memoire-x/` vs `/memoire-x`) ;
      - listener `popstate` → réaligne `routeId` (Précédent/Suivant), nettoyé au
        démontage.
- [x] **`src/App.tsx`** — l'URL devient la source de vérité :
      - supprimer le `useState<DiagramDefinition | null>` (l.16-22) ;
      - `activeDiagram` **dérivé** (`useMemo`) : `getDiagram(routeId)` → sinon
        `getDiagram(activeDiagramId)` (localStorage) → sinon `diagrams[0]` ;
      - effet de normalisation : `routeId !== activeDiagram.id` →
        `navigate(activeDiagram.id, { replace: true })` (couvre `/` **et** les ids
        inconnus) ; inerte ensuite, pas de boucle ;
      - effet `document.title = "<titre> — Figures Flow"` (distingue les onglets
        ouverts par clic droit) ;
      - `onSelect` (l.64 et l.99) → `handleSelectDiagram` (`navigate(d.id)`) ;
      - **conserver** l'effet l.46-48 (écriture `activeDiagramId`) : il ne sert
        plus qu'à mémoriser la dernière figure pour une arrivée sur `/` ;
      - inchangés : `key={activeDiagram?.id}` (l.90), `exportSvg(`${id}.svg`)` (l.31),
        `handleResetPositions` (le reload retombe sur la même URL).
- [x] **`src/components/Sidebar.tsx`** — `<button>` → `<a href={'/' + d.id}>`
      (l.62-73), `className` inchangée **+ `block`** (un `<a>` est inline),
      `title={d.title}` (le libellé affiché est `d.domain`, abrégé),
      `aria-current={activeId === d.id ? 'page' : undefined}`, et :
      ```tsx
      onClick={(e) => {
        // Modificateur ou clic non-gauche : laisser le navigateur ouvrir un onglet.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        onSelect(d)
      }}
      ```
      Les en-têtes de catégorie (l.51) **restent des `<button>`** (accordéons, pas
      des destinations). `FullscreenOverlay.tsx` : **aucune modification**.
- [x] **`README.md`** — § *Démarrer* (l.369) : l'URL devient
      `http://localhost:5173/<id-figure>` ; § *Fonctionnalités* (l.373) : puces
      « une URL par figure, partageable et rechargeable » + « clic droit → ouvrir
      dans un nouvel onglet ».
- [x] **`vite.config.ts` : rien à faire** — `appType: 'spa'` est le défaut, donc
      `vite dev` **et** `vite preview` renvoient déjà `index.html` pour
      `/memoire-arbre-sgbd`. Réserve : un serveur statique nu exigerait un
      fallback (hors périmètre, app locale).

## Bénéfices collatéraux (changements de comportement assumés)

- Deux onglets peuvent afficher **deux figures différentes** ; l'`activeDiagramId`
  partagé de `localStorage` ne les fait plus se voler l'état (dernier onglet actif
  gagnait).
- F5 conserve la figure ; l'URL de la barre d'adresse est toujours partageable.
- `activeDiagramId` en `localStorage` n'est plus la référence : **repli de `/`
  uniquement**.

## Vérifications

- [x] `npx tsc --noEmit` : **aucune erreur dans les fichiers modifiés** (`App.tsx`,
      `Sidebar.tsx`, `useDiagramRoute.ts`). La commande reste rouge sur ~60 erreurs
      **préexistantes** et hors périmètre — génériques `Node<T>` de
      `@xyflow/react` 12.11 sous TypeScript 6.0 (`DiagramCanvas.tsx`,
      `EntityNode.tsx`, `ProcessNode.tsx`, `types/index.ts`, `entityColors.ts`,
      MCT `archive/`, `mot_organisationnel_v2.ts`, `useDiagramState.ts`). Vérifié :
      ces fichiers ne sont pas touchés par ce lot. `npx vite build` passe
      (344 modules) : bundle et imports valides.
- [x] Fallback SPA du dev server : `GET http://localhost:5199/memoire-arbre-sgbd`
      → **200** + `index.html` (`id="root"`) — rien à configurer dans `vite.config.ts`.
- [ ] `npm run dev` : `/` réécrit l'URL vers `/<id>` de la dernière figure, **sans**
      nouvelle entrée d'historique (le bouton Précédent sort du site)
- [ ] clic sur une figure → URL change ; Précédent revient à la figure précédente ;
      Suivant la rétablit
- [ ] F5 sur `/memoire-pyramide-tests` → même figure
- [ ] clic droit sur une ligne → « Ouvrir dans un nouvel onglet » et « Copier
      l'adresse du lien » ; le nouvel onglet affiche la bonne figure, titre d'onglet
      correct
- [ ] Ctrl+clic et clic-milieu → nouvel onglet ; clic gauche simple → pas de
      rechargement
- [ ] `/nimportequoi` → repli sur la figure par défaut, URL corrigée en `replace`
- [ ] sidebar en plein écran : comportement identique
- [ ] export SVG : nom de fichier inchangé (`${activeDiagram.id}.svg`)

## Écarté, et pourquoi

- **`react-router-dom`** : une seule route à un segment, pas de loader, pas de
  layout imbriqué → ~50 ko et un `BrowserRouter` pour rien.
- **Routage par hash (`#/id`)** : la demande est `/figure-name` ; le dev server
  gère déjà le fallback SPA.
- **Garder `activeDiagram` en `useState` + synchroniser l'URL à côté** : deux
  sources de vérité qui se disputent l'état — le bug multi-onglets actuel, en pire.
- **Slug dérivé du titre** : translittération des accents + collisions entre
  titres proches, pour un gain cosmétique.

## Journal

- 20261025 : plan rédigé (mode plan, aucun fichier du dépôt touché), puis appliqué.
