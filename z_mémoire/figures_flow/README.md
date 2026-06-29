# figures_flow

Réécriture des diagrammes Merise/UML du mémoire avec React Flow.

## Objectif

Remplacer le système actuel `z_mémoire/figures_html/` (trop bugué) par une SPA moderne basée sur React Flow. Le projet est **indépendant** — pas de lien avec le front Angular du projet principal.

### Ce qui est repris de l'ancien système

- Les **noms d'entités/tables** (ex: `UTILISATEUR`, `CANDIDATURE`)
- Les **attributs/champs** (ex: `IdUtilisateur`, `Nom`, `Email`)
- Les **types SQL** pour les MPD
- Les **liens et cardinalités** entre entités

### Ce qui est réécrit de zéro

- **Tout le code** — aucune copie des fichiers HTML, CSS ou JS existants
- La logique de rendu (React Flow remplace le SVG custom + jQuery-like)
- L'éditeur (drag & drop React Flow natif au lieu du système `links.js`)
- Le style (Tailwind CSS, design carte moderne, light/dark mode)

## Contenu

16 diagrammes Merise à reproduire :

| # | Type | Domaine | Nb entités |
|---|------|---------|-----------|
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

## Stack

| Technologie | Usage |
|------------|-------|
| **React 18+** | Framework UI |
| **TypeScript** | Typage |
| **Vite** | Build / dev server |
| **@xyflow/react** | React Flow — rendu nœuds/liens |
| **Tailwind CSS v4** | Styles utilitaires |
| **lucide-react** | Icônes |
| **localStorage** | Persistance des positions |

Pas de Docker, pas de backend. `npm run dev` suffit.

## Architecture

```
figures_flow/
├── src/
│   ├── main.tsx              # Point d'entrée
│   ├── App.tsx               # Layout principal (sidebar + canvas)
│   ├── types/
│   │   └── index.ts          # Types EntityNode, Attribute, RelationshipEdge, DiagramDefinition
│   ├── diagrams/
│   │   ├── mcd/              # 6 fichiers, un par diagramme MCD
│   │   ├── mld/              # 5 fichiers MLD
│   │   └── mpd/              # 5 fichiers MPD
│   ├── components/
│   │   ├── Nodes/
│   │   │   └── EntityNode.tsx       # Nœud unique avec variante mcd|mld|mpd
│   │   ├── Edges/
│   │   │   └── RelationshipEdge.tsx  # Arête avec cardinalités et label
│   │   ├── Sidebar.tsx              # Navigation par catégorie
│   │   ├── Toolbar.tsx              # Zoom, grille, export, thème
│   │   ├── ThemeToggle.tsx          # Bascule light/dark
│   │   └── DiagramCanvas.tsx        # Wrapper React Flow
│   ├── hooks/
│   │   └── useDiagramPersistence.ts # localStorage save/restore
│   └── utils/
│       ├── autoLayout.ts            # Placement initial des nœuds
│       └── exportSvg.ts             # Export SVG standalone
├── index.html
├── PLAN.md                 # Plan de travail détaillé
└── README.md               # Ce fichier
```

## Démarrer

```bash
cd z_mémoire/figures_flow
npm install
npm run dev
```

Ouvrir l'URL affichée (généralement `http://localhost:5173`).

## Fonctionnalités prévues

- Navigation entre les 16 diagrammes via une sidebar
- Drag & drop des entités (positions persistées dans localStorage)
- Zoom avant/arrière, fit to view
- Grille d'aimantation (10px)
- Export SVG du diagramme courant
- Mode clair / sombre
- Layout initial automatique (évite les chevauchements)

## Design

- Chaque nœud est une carte arrondie (rounded-xl) avec header coloré
- Styles adaptés à chaque variante (MCD / MLD / MPD)
- Liens lissés avec cardinalités dans des capsules aux extrémités
- Labels de relation (verb) au centre des liens en MCD
- Palette sobre : pas de classifications "nouvelle entité" ou "pivot" — uniquement des couleurs par entité pour la lisibilité

## Principe Merise

Les trois niveaux de modélisation respectés :

- **MCD** (Modèle Conceptuel) : entités, associations, cardinalités, PK soulignée
- **MLD** (Modèle Logique) : tables, PK, FK (#), tables de jonction
- **MPD** (Modèle Physique) : tables avec types SQL, contraintes PK/FK/NN
