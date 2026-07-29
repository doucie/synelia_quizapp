# Plan — figures_flow

Réécriture des diagrammes Merise/UML avec React Flow (@xyflow/react).

---

## Phase 0 — Initialisation du projet

- [x] Initialiser le projet Vite + React + TypeScript
- [/] Installer dépendances (faire `npm install react@19 react-dom@19 @xyflow/react@12 clsx lucide-react` puis `npm install -D @vitejs/plugin-react @tailwindcss/vite tailwindcss typescript @types/react @types/react-dom`)
- [x] Configurer Tailwind CSS (via Vite plugin), définir les couleurs custom et le mode dark (classe sur `<html>`)
- [x] Créer la structure de dossiers (src/components, src/diagrams, src/types, src/hooks, src/utils)
- [x] Configurer tsconfig (strict, paths)
- [x] Créer l'index.html avec une SPA basique (sidebar + zone de rendu)
- [ ] Vérifier que `npm run dev` fonctionne (après npm install)

## Phase 1 — Types & données

### 1.1 Modèles (src/types/)

- [x] Définir `EntityNode` : id, type (mcd-entity | mld-table | mpd-table), position, data { label, attributes: Attribute[], color?, badge? }
- [x] Définir `Attribute` : name, type? (SQL pour MPD), isPK, isFK, isNew?, isDeleted?, description?
- [x] Définir `RelationshipEdge` : id, source, target, label?, cardFrom?, cardTo?, isStrong?, isDashed?
- [x] Définir `DiagramDefinition` : id, title, category (mcd|mld|mpd), domain, nodes: EntityNode[], edges: RelationshipEdge[]

### 1.2 Déclarations (src/diagrams/)

**MCD — 6 diagrammes**

- [x] `mcd/identite_permissions.ts` — 3 entités (UTILISATEUR, GROUPE_METIER, PERMISSION_ENTITE)
- [x] `mcd/identite_permissions_moderne.ts` — même MCD, variante colorée alternative
- [x] `mcd/campagnes_pipeline.ts` — 9 entités
- [x] `mcd/candidature_quiz.ts` — 6 entités
- [x] `mcd/entretien_evaluation.ts` — 7 entités
- [x] `mcd/audit_notifications.ts` — 3 entités

**MLD — 5 diagrammes**

- [x] `mld/identite_permissions.ts` — 6 tables
- [x] `mld/campagnes_pipeline.ts` — 11 tables
- [x] `mld/candidature_quiz.ts` — 6 tables
- [x] `mld/entretien_evaluation.ts` — 7 tables
- [x] `mld/audit_notifications.ts` — 3 tables

**MPD — 5 diagrammes**

- [x] `mpd/identite_permissions.ts` — 6 tables avec types SQL
- [x] `mpd/campagnes_pipeline.ts` — 11 tables avec types SQL
- [x] `mpd/candidature_quiz.ts` — 6 tables avec types SQL
- [x] `mpd/entretien_evaluation.ts` — 7 tables avec types SQL
- [x] `mpd/audit_notifications.ts` — 3 tables avec types SQL

## Phase 2 — Composants de base

### 2.1 Nœuds personnalisés (src/components/Nodes/)

- [x] `EntityNode.tsx` — nœud unique adaptable (MCD entity, MLD table, MPD table) via un prop `variant`
- [x] Variante `mcd` : PK souligné, badges PK, couleurs sobres
- [x] Variante `mld` : badge PK violet, préfixe FK, table de jonction avec style distinctif
- [x] Variante `mpd` : badge PK/PF, FK, type SQL en grisé

### 2.2 Arêtes personnalisées (src/components/Edges/)

- [x] `RelationshipEdge.tsx` — chemin SVG lissé avec cardinalités aux extrémités
- [x] Style strong → trait continu coloré, dashed → trait pointillé grisé
- [x] Label `verb` au centre (utilisé en MCD) dans un petit badge

### 2.3 Layout & Navigation (src/components/)

- [x] `Sidebar.tsx` — liste des diagrammes groupés par catégorie (MCD, MLD, MPD) avec accordéons
- [x] `Toolbar.tsx` — boutons : zoom +/-/fit, theme toggle
- [x] `ThemeToggle.tsx` — bouton soleil/lune pour basculer light/dark, persisté dans localStorage
- [x] `DiagramCanvas.tsx` — wrapper React Flow avec les nœuds/arêtes du diagramme courant

## Phase 3 — Logique applicative

### 3.1 Persistance (src/hooks/)

- [x] `useDiagramPersistence.ts` — sauvegarde/restaure les positions des nœuds dans localStorage (clé = id du diagramme)
- [x] Option "Réinitialiser" (bouton `↺`) qui efface les positions sauvegardées + reload

### 3.2 Édition interactive

- [x] Drag & drop natif React Flow (positions sauvegardées automatiquement)
- [x] Grille d'aimantation (snapToGrid: 10px)
- [x] Zoom (molette + boutons)
- [x] "Exporter SVG" — bouton `Export` dans toolbar, utilise `exportSvg.ts`

### 3.3 Utilitaires (src/utils/)

- [x] `autoLayout.ts` — placement initial intelligent (grille)
- [x] `exportSvg.ts` — capture du viewport React Flow en SVG

## Phase 4 — Styles & thèmes

### 4.0 Audit des variables CSS — corriger les valeurs manquantes

État actuel de `src/index.css` :

| Variable | Définie ? | Dark override ? | Problème |
|----------|-----------|-----------------|----------|
| `--color-brand-50..900` | ✅ `@theme` | ❌ jamais surchargé | Trop clair en dark mode |
| `--color-brand-950` | ❌ inexistante | — | Utilisé via `dark:bg-brand-950/30` dans Sidebar.tsx |
| `--color-surface` | ✅ `@theme` | ✅ `.dark` | OK |
| `--color-surface-alt` | ✅ `@theme` | ✅ `.dark` | OK |
| `--color-border` | ✅ `@theme` | ✅ `.dark` | OK |
| `--color-background` | ❌ inexistante | — | Utilisé via `bg-background/70` dans EntityNode.tsx |
| `--color-text` | ✅ conditionnel | ✅ conditionnel | OK mais pourrait être dans `@theme` |
| `--xy-edge-*` | ❌ inexistante (défaut React Flow) | — | À override pour coller au thème custom |
| `--xy-controls-button-background-color-default` | ❌ inexistante | — | React Flow a un défaut, mais pas adapté à notre dark |
| `--xy-node-background-color-default` | ❌ inexistante | — | Idem |
| `--xy-handle-background-color-default` | ❌ inexistante | — | Idem |

**Corrections effectuées :**
- [x] Ajouter `--color-background` dans `@theme` (et `.dark`) pour que `bg-background/70` fonctionne
- [x] Ajouter `--color-brand-950` dans `@theme` (et `.dark`) pour `dark:bg-brand-950/30`
- [x] Ajouter des dark variants pour `--color-brand-*` (palette inversée : 50→foncé en dark, 950→clair)
- [x] Overrider les 17 variables `--xy-*` React Flow dans `:root` et `.dark`
- [x] Déplacer `--color-text` dans `@theme` (avec override `.dark`)

### 4.1 Style calqué sur l'exemple Svelte Flow (`z_mémoire/figures_flow/exemple/`)

- [x] Police `'NT Dapper', system-ui, sans-serif` reprise de l'exemple
- [x] Variables `--xy-*` (17 variables) copiées et adaptées de l'exemple
- [x] Décorations : `shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]`, `border-border`, `bg-background/70`, `rounded-2xl`
- [x] Handles : `h-[10px] w-[10px] border-none bg-gray-400`

### 4.2 Toggle background dots

- [x] Bouton `▦` dans la toolbar pour activer/désactiver les points de fond (`<Background />`)
- [ ] État persisté optionnellement (localStorage)

### 4.3 Inspectabilité navigateur

- [x] Solution : `panOnDrag={1}` sur le canvas → clic gauche = sélection, clic droit = drag → on peut inspecter au clic gauche
- [ ] Optionnel : bouton toggle "🔍 Inspect" pour désactiver complètement le drag du pane

### 4.4 Type d'arêtes

- [x] Remplacer `getBezierPath` par `getSmoothStepPath` avec `borderRadius: 8`
- [x] Les smoothstep sont plus nettes, angles droits arrondis (style Merise)

### 4.5 Visibilité des cardinalités

- [x] `foreignObject` agrandis (36×36 au lieu de 24×24) avec offset `x={sourceX - 18}` / `y={sourceY - 18}`
- [x] Badges flottants avec `border border-border bg-background shadow-sm` pour meilleur contraste

### 4.6 Design des arêtes (smoothstep + cardinalités)

- [x] `getSmoothStepPath` + `borderRadius: 8`
- [x] Offset X/Y sur les foreignObject pour dégager les puces des bords
- [x] Labels de verbe MCD centrés via `x={(sourceX + targetX) / 2 - 50}` et fond `bg-background`

---

## Phase 5 — Tests & finitions

- [ ] Vérifier les 16 diagrammes : toutes les entités, attributs, liens, cardinalités sont fidèles
- [ ] Tester l'export SVG
- [ ] Tester la persistance (rechargement → positions conservées)
- [ ] Nettoyer la console (pas de warnings React)
- [ ] Vérifier l'inspectabilité dans DevTools

---

## Notes techniques

- **Framework** : React 19 + TypeScript
- **Build** : Vite
- **Styling** : Tailwind CSS v4 (via `@tailwindcss/vite`) + variables CSS calquées sur l'exemple Svelte Flow
- **Diagram** : @xyflow/react (React Flow v12)
- **Icons** : lucide-react
- **Persistence** : localStorage (clé `figures_flow:positions:{diagramId}`)
- **Thème** : light/dark via classe `.dark` sur `<html>`, persisté dans localStorage
- **Pas de Docker** : tout est statique, `npm run dev` suffit
- **Aucun code copié** du système `figures_html` existant (sauf les noms d'entités, attributs, types et cardinalités)

## Inspirations visuelles

L'exemple dans `z_mémoire/figures_flow/exemple/` (Svelte Flow) sert de référence pour :
- La finesse des cartes (bordures, ombres, coins arrondis `rounded-2xl`)
- Les handles minimalistes (pastilles grises sans bordure)
- La typographie (font-mono sur les noms, texte bas de casse)
- Le thème sombre (fond noir/dégradé, cartes foncées avec bordures grises)
- Les arêtes smoothstep (angles droits arrondis, traits fins)
- Les points de fond (background dots discrets, toggle on/off)

## Diagrammes à reproduire (16)

| # | Catégorie | Domaine | Entités |
|---|-----------|---------|---------|
| 1 | MCD | Identité & Permissions | 3 |
| 2 | MCD | Identité & Permissions (moderne) | 3 |
| 3 | MCD | Campagnes & Pipeline | 9 |
| 4 | MCD | Candidature & Quiz | 6 |
| 5 | MCD | Entretien & Évaluation | 7 |
| 6 | MCD | Audit & Notifications | 3 |
| 7 | MLD | Identité & Permissions | 6 |
| 8 | MLD | Campagnes & Pipeline | 11 |
| 9 | MLD | Candidature & Quiz | 6 |
| 10 | MLD | Entretien & Évaluation | 7 |
| 11 | MLD | Audit & Notifications | 3 |
| 12 | MPD | Identité & Permissions | 6 |
| 13 | MPD | Campagnes & Pipeline | 11 |
| 14 | MPD | Candidature & Quiz | 6 |
| 15 | MPD | Entretien & Évaluation | 7 |
| 16 | MPD | Audit & Notifications | 3 |

---

## Phase 6 — Corrections (Bugs & Thème)

### 1. Bug : Changement de diagramme inopérant

**Fichier** : `src/components/DiagramCanvas.tsx`

**Problème** : `useNodesState`/`useEdgesState` ne se réinitialisent pas quand `diagram` change.

**Solution** (approche A) :
- Ajouter `useEffect` avec `[diagram?.id]` qui appelle `setNodes(initialNodes)` et `setEdges(initialEdges)` pour synchroniser l'état interne avec le nouveau diagramme.

**Solution alternative** (approche B) :
- Mettre `key={diagram?.id}` sur `<ReactFlow>` pour forcer un démontage/remontage complet. Plus simple mais perd l'état de glisser-déposer en cours.

### 2. Bug : Stale closure dans `useDiagramPersistence`

**Fichier** : `src/hooks/useDiagramPersistence.ts`

**Problème** : Le `useEffect` (l.13-28) capture `nodes` dans sa closure avec une dépendance `[diagramId]` seulement → au changement de diagramme, `nodes` est encore l'ancien tableau → `setNodes` mappe sur de mauvais nœuds.

**Solution** (déplacer la logique de chargement) :
- Supprimer le `useEffect` de chargement (l.13-28)
- Créer une fonction utilitaire `loadPositions(diagramId, nodes)` qui lit localStorage et fusionne les positions de manière synchrone
- L'appeler dans le `useMemo` de `initialNodes` dans `DiagramCanvas.tsx` → élimine la dépendance à un effet secondaire, les positions persistées sont appliquées immédiatement
- Garder `savePositions` (l.30-43) inchangé

### 3. Rendu visuel : réécriture du thème

**Fichier** : `src/index.css`

Remplacer tout le thème actuel (slate) par le thème shadcn/neutre de l'exemple svelteflow.dev :

#### 3a. `@theme` — variables de couleurs Tailwind v4

Définir toutes les couleurs via des références `hsl()` :
```
--color-background: hsl(var(--background))
--color-foreground: hsl(var(--foreground))
--color-card: hsl(var(--card))
--color-card-foreground: hsl(var(--card-foreground))
--color-border: hsl(var(--border))
--color-input: hsl(var(--input))
--color-ring: hsl(var(--ring))
--color-primary: hsl(var(--primary))
--color-primary-foreground: hsl(var(--primary-foreground))
--color-muted: hsl(var(--muted))
--color-muted-foreground: hsl(var(--muted-foreground))
--color-accent: hsl(var(--accent))
--color-accent-foreground: hsl(var(--accent-foreground))
--color-destructive: hsl(var(--destructive))
--color-destructive-foreground: hsl(var(--destructive-foreground))
--color-popover: hsl(var(--popover))
--color-popover-foreground: hsl(var(--popover-foreground))
```

#### 3b. `:root` — thème clair (HSL exacts de l'exemple)
```
--background: 0 0% 100%          → #ffffff
--foreground: 222.2 47.4% 11.2%  → #0f172a
--card: 0 0% 100%
--card-foreground: 222.2 47.4% 11.2%
--border: 214.3 31.8% 95%       → #f0f2f5
--input: 214.3 31.8% 91.4%      → #e8ecf0
--muted: 210 40% 96.1%           → #f1f5f9
--muted-foreground: 215.4 16.3% 46.9%
--primary: 333 100% 50%          → #ff007a (rose)
--primary-foreground: 210 40% 98%
--accent: 210 40% 96.1%
--accent-foreground: 222.2 47.4% 11.2%
--destructive: 0 100% 50%
--ring: 215 20.2% 65.1%
```

#### 3c. `.dark` — thème sombre (HSL exacts de l'exemple)
```
--background: 0 0% 6.7%          → #111111
--foreground: 0 0% 100%
--card: 0 0% 9%                  → #171717
--border: 0 0% 20%               → #333333
--input: 214.3 31.8% 22%
--muted: from hsl(var(--primary)) h 25% 12.9%   → #2a1a22
--muted-foreground: 215.4 16.3% 65%
--primary: 333 100% 50%          → #ff007a (identique)
--primary-foreground: 210 40% 98%
--accent: 217.2 32.6% 17.5%
--accent-foreground: 210 40% 98%
--secondary: 217.2 32.6% 17.5%
--destructive: 0 62.8% 30.6%    → #7f1d1d
--ring: 215 20.2% 65.1%
```

#### 3d. `--xy-*` — Svelte Flow variables (valeurs exactes de l'exemple)

État clair (`:root`) :
```
--xy-edge-stroke-default: #b1b1b7
--xy-edge-stroke-selected-default: #555
--xy-node-background-color-default: transparent
--xy-node-border-default: 1px solid #1a192b
--xy-node-boxshadow-selected-default: 0 0 0 0.5px #1a192b
--xy-handle-background-color-default: #1a192b
--xy-handle-border-color-default: #fff
--xy-background-pattern-dots-color-default: #91919a
--xy-selection-border-default: 1px dotted #0059dccc
--xy-edge-label-background-color-default: #fff
```

État sombre (`.dark`) :
```
--xy-edge-stroke-default: #3e3e3e
--xy-edge-stroke-selected-default: #727272
--xy-node-color-default: #f8f8f8
--xy-node-border-default: 1px solid #3c3c3c
--xy-node-background-color-default: #1e1e1e
--xy-node-boxshadow-selected-default: 0 0 0 0.5px #999
--xy-handle-background-color-default: #bebebe
--xy-handle-border-color-default: #1e1e1e
--xy-background-pattern-dots-color-default: #777
--xy-controls-button-background-color-default: #2b2b2b
--xy-controls-button-border-color-default: #5b5b5b
--xy-edge-label-background-color-default: #141414
--xy-edge-label-color-default: #f8f8f8
```

#### 3e. Ajustement du composant `EntityNode.tsx`

- Remplacer `bg-background/70` (semi-transparent) par `bg-card` (opaque, avec `--color-card: #ffffff` light / `#171717` dark)
- Supprimer le `bg-gray-400` sur les Handles — laisser les `--xy-*` variables CSS les contrôler
- Mettre à jour les badges de variante pour utiliser les couleurs du thème :
  - MCD : `bg-muted text-foreground`
  - MLD/MPD : `bg-primary/10 text-primary`

### Fichiers à modifier

1. `src/index.css` — réécriture complète du thème
2. `src/components/DiagramCanvas.tsx` — ajout `useEffect` pour reset nodes/edges
3. `src/hooks/useDiagramPersistence.ts` — suppression du `useEffect` de chargement, déplacement vers `loadPositions`
4. `src/components/Nodes/EntityNode.tsx` — `bg-card` au lieu de `bg-background/70`, handles via CSS variables
