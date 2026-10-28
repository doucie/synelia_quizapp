# 20261028 — Éditeur MCD / MLD (créer, modifier, supprimer ses propres modèles)

Demande : « une version de figures_flow où l'utilisateur peut créer ses MCD et
MLD lui-même plutôt que de les écrire en dur, comme un SaaS, avec ajout /
suppression / modification des entités, toujours persisté en local ».

Décisions validées :

- **MCD + MLD éditables**, **aucune dérivation automatique** MCD → MLD (ni
  maintenant ni plus tard dans ce lot) ;
- **nouvelle page dans `figures_flow`**, pas de fork : réutilisation du rendu,
  du thème et de l'export existants ;
- priorité absolue : créer / modifier / supprimer **figures, entités, attributs,
  associations** facilement (clavier d'abord) ;
- persistance `localStorage` uniquement (mono-utilisateur, mono-navigateur).

## Ce qui existe déjà et n'est pas réécrit

| Besoin | Déjà là |
|---|---|
| Rendu entité MCD (attributs + PK) / table MLD (type, PK, FK, nullable) | `components/Nodes/EntityNode.tsx` — rend n'importe quel `attributes[]`, la boîte grandit seule (aucune hauteur fixe) |
| Rendu association (libellé + cardinalités + attributs portés) | `components/Edges/RelationshipEdge.tsx`, `data.cardFrom` / `cardTo` |
| Teintes des entités | `utils/entityColors.ts` (`applyEntityColors`, déjà appliqué par `DiagramCanvas`) |
| Ancrages valides d'une arête | `components/Edges/edgeAnchors.ts` (`validHandles`, `resolveHandleId`) |
| Positions persistées | `figures_flow:diagram:<id>` (convention à imiter) |
| Export SVG | `utils/exportSvg.ts` (+ contrat `[data-export-root]`, `plans/rules/regles_export_svg.md`) |
| Dialogue de confirmation | `components/ConfirmDialog.tsx` (portail `body`, `z-[1100]`) |

Une figure utilisateur n'est donc qu'un `DiagramDefinition` **construit à la
volée** au lieu d'être importé d'un fichier `.ts`. `category: 'mcd' | 'mld'` est
déjà dans l'union `Category` → **aucune modification de `src/types/index.ts`**.

## Hors périmètre (assumé)

- dérivation MCD → MLD, MPD, SQL, cohérence avec MCT/MOT ;
- comptes, backend, « vrai » SaaS multi-utilisateurs ;
- mise en page automatique (aucune lib de layout installée : `dagre`/`elk` absent) ;
- association réflexive (entité ↔ elle-même) : refusée en v1 avec un message ;
- édition des figures statiques du mémoire (elles restent en dur, inchangées).

## Modèle de données

```ts
// src/editor/model.ts
export type Kind = 'mcd' | 'mld'

export interface AttrDef {
  id: string
  name: string
  type?: string      // MLD seulement (INT, VARCHAR(100)…)
  isPK?: boolean
  isFK?: boolean
  nullable?: boolean
}

export interface EntityDef {
  id: string
  name: string
  position: { x: number; y: number }
  attributes: AttrDef[]
}

export interface LinkDef {
  id: string
  name: string
  from: string
  to: string
  cardFrom?: string  // MCD seulement : '0,1' | '1,1' | '0,n' | '1,n'
  cardTo?: string
  attributes?: string[] // attributs portés par l'association
}

export interface ModelDoc {
  version: 1
  id: string
  title: string
  kind: Kind
  entities: EntityDef[]
  links: LinkDef[]
  updatedAt: number
}
```

Pont vers le rendu (le seul code de « traduction », ~80 lignes) :

```ts
toNodes(doc) → doc.entities.map(e => ({
  id: e.id, type: 'entity', position: e.position,
  data: { label: e.name, variant: doc.kind, attributes: e.attributes },
}))
toEdges(doc) → doc.links.map(l => ({
  id: l.id, source: l.from, target: l.to, type: 'relationship',
  data: { label: l.name, cardFrom: l.cardFrom, cardTo: l.cardTo, attributes: l.attributes },
}))
```

**Invariant** : `entity.id` = `node.id`, `link.id` = `edge.id` (aucune table de
correspondance), sinon les callbacks de suppression/déplacement de React Flow
deviennent faux.

## Persistance

| Clé | Contenu |
|---|---|
| `figures_flow:model:<id>` | le `ModelDoc` complet |
| `figures_flow:models` | index `[{ id, title, kind, updatedAt }]` — évite de charger tous les documents pour peupler la sidebar |

- autosave **debounce 300 ms** après chaque mutation + flush `beforeunload` ;
- `try/catch` systématique (mode privé, quota) — l'app doit rester utilisable
  sans persistance, comme `figures_flow:background` le fait déjà ;
- **export / import JSON** du document (fichier), seul vrai filet de sécurité :
  vider les données du site efface tout.

## Routage — contrainte à connaître

`hooks/useDiagramRoute.ts` n'accepte **qu'un seul segment** (`slugFromPath`
rejette les chemins multi-segments, `App` retombe alors sur la dernière figure).
Donc pas de `/editeur/<id>`. On prend un préfixe de slug :

- liste des modèles : `/mes-modeles`
- un modèle : `/modele-<id>`

Aucun id statique ne commence par `modele-` : pas de collision, et l'invariant
« un onglet = une vue » est conservé (l'URL reste la source de vérité).

Dans `App.tsx` : avant `getDiagram(routeId)`, si `routeId` commence par
`modele-`, rendre `<ModelEditor modelId={…} />` à la place de `DiagramCanvas`.
**`src/diagrams/index.ts` n'est pas touché** (WIP non commité de l'utilisateur).

## Fichiers

**Créés** — `src/editor/model.ts`, `store.ts`, `ModelEditor.tsx`,
`EditorCanvas.tsx`, `Inspector.tsx`, `AttributeRows.tsx` (+ `ModelsPage.tsx`
pour la liste).

**Modifiés, minimalement** — `src/App.tsx` (branche de route),
`src/components/Sidebar.tsx` (section « Mes modèles », lecture du store),
`src/components/FullscreenOverlay.tsx` (propage `onNavigate` à la sidebar),
`src/utils/entityColors.ts` (`SAFE_HUES` exporté, teinte figée à la création).

**Intouchés** — `DiagramCanvas.tsx`, `EntityNode.tsx`, `RelationshipEdge.tsx`,
`edgeAnchors.ts`, `utils/exportSvg.ts`, toutes les figures du mémoire et les
15 UML. La surbrillance de sélection est celle de React Flow, par défaut.

`nodeTypes` / `edgeTypes` sont privés à `DiagramCanvas` : les redéclarer en deux
lignes dans `EditorCanvas` (`{ entity: EntityNode }` / `{ relationship: RelationshipEdge }`).
Duplication assumée, aucun refactor d'un fichier de 700+ lignes.

## Étapes

> **État au 28/10 (session de mise en œuvre)** : étapes 0 à 7 livrées en première passe.
> Écarts assumés par rapport au plan, pour rester livrable :
> - `applyEntityColors` n'est pas appelé : la teinte est **figée dans le document**
>   (`EntityDef.color`, `SAFE_HUES` exporté), sinon supprimer une entité recolorerait
>   toutes les suivantes ;
> - pas d'enveloppe `data-export-root` : `toNodes` produit un nœud = une carte, le
>   repli « première carte bordée » de `exportSvg` s'applique tel quel ;
> - `A` n'est pas câblé : double-clic sur le fond + bouton `+ entité` suffisent, et
>   une touche muette dans un éditeur est un piège de plus ;
> - pas de surcharge de côté dans le panneau : le popover de `RelationshipEdge`
>   (déjà là, persisté sous `figures_flow:edge_sides:modele-<id>`) fait le travail ;
> - import JSON : `File.text()` + `Blob` (pas de `showSaveFilePicker`, absent de
>   Firefox) ; import d'une figure du mémoire : liste déroulante sur `/mes-modeles`.
> Recette manuelle (section du bas) restant à faire dans le navigateur.

### 0. Socle (2 h)

- [x] `model.ts` : types + `toNodes`/`toEdges` + `newEntity()`/`newAttr()` (ids `crypto.randomUUID`)
- [x] `store.ts` : `listModels`, `loadModel`, `saveModel`, `deleteModel`, `duplicateModel`, `renameModel`
- [x] `fromDiagram()` : conversion one-shot d'un `DiagramDefinition` statique vers `ModelDoc`
      (sert à l'étape 7, et de test : un MCD existant doit se recharger à l'identique)

### 1. Rendu en lecture seule (1 h 30)

- [x] `EditorCanvas` : `ReactFlow`, `nodeTypes`/`edgeTypes` locaux, couleur figée par entité
- [x] `ModelEditor` : lit le doc, construit nodes/edges, autosave
- [x] Route `/modele-<id>` branchée dans `App.tsx`
- [ ] **Recette** : ouvrir un modèle importé → pixel identique à la figure statique correspondante

### 2. Entités et attributs (3 h) — cœur du besoin

- [x] panneau entité : nom (autofocus), tableau d'attributs, compteurs
- [x] ajout / suppression / réordonnancement d'attributs (voir UX ci-dessous)
- [x] création d'entité : bouton + double-clic dans le vide (position au curseur via `screenToFlowPosition`)
- [x] suppression d'entité (confirmation : « N associations seront supprimées »)
- [x] déplacement : `onNodeDragStop` → `position` dans le doc (jamais à chaque frame)

### 3. Associations (2 h)

- [x] `onConnect` entre deux entités → `LinkDef` avec cardinalités par défaut `0,n` / `1,1`
- [x] panneau association : nom, `cardFrom`/`cardTo` (listes `0,1` `1,1` `0,n` `1,n`),
      attributs portés (un par ligne, `+`/`✕`)
- [x] suppression d'association ; auto-association refusée (message)
- [x] côté d'ancrage : repris du réglage persisté, filtré par `validHandles`,
      surchargeable par le popover de l'arête (éradique le réglage pixel)

### 4. Gestion des figures (1 h 30)

- [x] `/mes-modeles` : cartes (titre, type, nombre d'entités, date), nouveau MCD / nouveau MLD
- [x] renommer, dupliquer, supprimer (ConfirmDialog)
- [x] entrée sidebar « Mes modèles » + liste des modèles

### 5. Sécurité des données (1 h 30)

- [x] autosave debounce + flush `beforeunload` (et au démontage)
- [x] historique : pile de snapshots (80 pas), `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`, rafales regroupées
- [x] export JSON / import JSON (fichier)
- [x] export SVG ⤓ : réutilise `exportSvg` (aucun réglage d'enveloppe nécessaire)

### 6. Mode MLD (1 h 30)

- [x] `kind: 'mld'` → colonnes `type` / PK / FK / nullable affichées, cardinalités masquées
- [x] restriction : pas d'attributs portés (le bloc n'est pas rendu)
- [x] liens MLD = relation de FK (libellé seul, sans cardinalités)
- [ ] `isPK` unique conseillé (badge d'avertissement, jamais bloquant) — non fait

### 7. Récupération des 5 MCD + 5 MLD existants (30 min)

- [x] sélecteur « Partir d'une figure existante » sur `/mes-modeles`
      → `fromDiagram()` → `saveModel()` → ouverture
- [x] un modèle importé reste **indépendant** : modifier n'affecte jamais le fichier `.ts`

## UX détaillée (c'est là que se joue « facilement »)

Aucune modale pour les attributs. Panneau de droite (~320 px) selon la sélection :

| Sélection | Panneau |
|---|---|
| rien | réglages du modèle : titre, type (badge), compteurs, export |
| entité | nom, tableau d'attributs, suppression |
| association | nom, cardinalités, attributs portés, côté d'ancrage, suppression |

Une ligne d'attribut = `nom` · `type` · `PK ☑` · `FK ☑` · `NULL ☐` · `✕`.

| Raccourci | Effet |
|---|---|
| `A` / double-clic vide | nouvelle entité sous le curseur |
| `Entrée` dans une ligne | valide et crée la ligne suivante (focus dedans) |
| `Backspace` sur un nom vide | supprime la ligne |
| `Alt+↑` / `Alt+↓` | réordonne la ligne |
| `F2` / double-clic entité | focus sur le nom |
| `Suppr` | supprime la sélection (confirmation si l'entité porte des associations) |
| `Ctrl+D` | duplique l'entité |
| `Ctrl+Z` / `Ctrl+Shift+Z` | annuler / rétablir |
| `Ctrl+S` | force la sauvegarde (feedback visuel « enregistré ») |

Validation **non bloquante** (badges, jamais de formulaire refusé) : nom d'entité
dupliqué, entité sans PK (MLD), attribut sans nom (ignoré visuellement).

## Pièges identifiés et parades

1. **Route multi-segments impossible** → slugs `modele-<id>` (cf. plus haut).
2. **Ancrages sur graphe libre** : les figures du mémoire ont des handles choisis
   à la main ; ici les entités bougent. Parade : côté déduit de la géométrie +
   `validHandles` + surcharge dans le panneau.
3. **Auto-association** : boucle custom de `RelationshipEdge` non éprouvée →
   refusée en v1, message explicite.
4. **`nodeTypes` privés** → redéclaration locale (2 lignes), pas de refactor.
5. **Suppressions React Flow** (`onNodesDelete`/`onEdgesDelete`) : mapper sur le
   doc par id strict (invariant ci-dessus), sinon perte silencieuse.
6. **localStorage effaçable** → export/import JSON obligatoire (étape 5).
7. **Autosave sans historique = destructeur** : l'étape 5 passe **avant** l'usage
   réel ; si elle saute, l'autosave saute aussi (Ctrl+S explicite à la place).

## Budget et coupe-circuit

| Étape | Cumul |
|---|---|
| 0 | 2 h |
| 1 | 3 h 30 |
| 2 | 6 h 30 |
| 3 | 8 h 30 |
| 4 | 10 h |
| 5 | 11 h 30 |
| 6 | 13 h |
| 7 | 13 h 30 |

Ordre de coupe si le temps manque (on garde toujours 0–3) : 7 → 4 → 6 → 5
(et dans ce dernier cas, **pas d'autosave non plus**).

## Recette (à cocher avant de dire « fini »)

- [ ] créer un MCD vide, ajouter 3 entités, 4 attributs dont 1 PK, 2 associations avec cardinalités
- [ ] recharger la page (F5) → tout est là, positions comprises
- [ ] renommer une entité, réordonner 2 attributs, supprimer une association → cohérent
- [ ] supprimer une entité reliée → confirmation, associations disparues, pas d'arête fantôme
- [ ] `Ctrl+Z` ×3 remonte les trois dernières mutations
- [ ] dupliquer la figure, modifier la copie → l'original intact
- [ ] export SVG → fichier lisible, entités et cardinalités présentes
- [ ] export JSON puis suppression du modèle puis import → identique
- [ ] mode MLD : types, PK, FK, nullable affichés, pas de cardinalités
- [ ] aucune régression sur les figures statiques (MCD/MLD du mémoire, UML, organigramme)

## Dettes assumées (à documenter dans le README de l'éditeur)

- pas de dérivation MCD → MLD ;
- pas de mise en page automatique (placement manuel, `autoLayout()` en grille
  disponible dans `utils/autoLayout.ts` pour un « réorganiser » basique) ;
- une seule association entre deux entités possible par « tirer un lien »
  (les suivantes via le bouton « + association ») ;
- pas d'export PNG, pas d'impression directe.

## Références

- `plans/rules/regles_mcd.md` — vocabulaire Merise (entité, association, cardinalités)
- `plans/rules/regles_export_svg.md` — contrat d'export
- `src/diagrams/nouveau/mcd/*.ts` et `.../mld/*.ts` — forme de référence des données
- `AGENTS.md` — règles front (variables CSS uniquement, pas d'émojis, composants réutilisables)
