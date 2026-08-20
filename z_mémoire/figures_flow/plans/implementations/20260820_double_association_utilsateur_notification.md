# Plan — Double association UTILISATEUR ↔ NOTIFICATION

> Date : 2026-08-20
> Contexte : NOTIFICATION possède `acteur` (texte) mais devrait avoir une FK vers UTILISATEUR
> Règle Merise : deux rôles distincts = deux associations distinctes

---

## Problème

NOTIFICATION a un attribut `acteur` qui représente l'utilisateur ayant déclenché la notification. En Merise, cette relation doit être modélisée par une **association**, pas par un attribut texte. Or, NOTIFICATION est déjà reliée à UTILISATEUR via l'association `obtenir` (destinataire).

**Solution Merise :** Deux associations séparées entre les mêmes entités :
- `obtenir` : UTILISATEUR → NOTIFICATION (destinataire)
- `déclencher` : UTILISATEUR → NOTIFICATION (acteur)

---

## Étape 1 — Types (src/types/index.ts)

Ajouter des champs optionnels pour spécifier les handles source/target :

```typescript
export interface RelationshipEdgeData {
  label?: string
  cardFrom?: string
  cardTo?: string
  cardFromSide?: 'source' | 'left' | 'right' | 'top' | 'bottom'
  cardToSide?: 'source' | 'left' | 'right' | 'top' | 'bottom'
  isStrong?: boolean
  isDashed?: boolean
  diagramId?: string
  handleFrom?: string  // ← AJOUTER
  handleTo?: string    // ← AJOUTER
}
```

---

## Étape 2 — RelationshipEdge (src/components/Edges/RelationshipEdge.tsx)

### 2a. Utiliser les handles explicites dans le path

Remplacer le calcul du path (ligne 118) pour utiliser `handleFrom`/`handleTo` si fournis :

```typescript
// AVANT (ligne 118-126)
const [edgePath, labelX, labelY] = getSmoothStepPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  borderRadius: 8,
})

// APRÈS
const explicitSourceHandle = data?.handleFrom
const explicitTargetHandle = data?.handleTo

const [edgePath, labelX, labelY] = getSmoothStepPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  borderRadius: 8,
  sourceHandleId: explicitSourceHandle ?? undefined,
  targetHandleId: explicitTargetHandle ?? undefined,
})
```

> **Note :** Vérifier que `getSmoothStepPath` de `@xyflow/react` supporte `sourceHandleId`/`targetHandleId`. Sinon, utiliser les positions des handles pour offset le path manuellement.

### 2b. Forcer les handles dans le rendu

Dans le JSX, passer les handles explicites au composant `BaseEdge` via `style` ou `pathOptions` si nécessaire.

---

## Étape 3 — MCD (src/diagrams/nouveau/mcd/utilisateurs_droits.ts)

### 3a. Supprimer l'attribut `acteur` de NOTIFICATION

```typescript
// AVANT
attributes: [
  { name: 'id_notification', isPK: true },
  { name: 'type' },
  { name: 'acteur' },    // ← SUPPRIMER
  { name: 'lien' },
  { name: 'est_lue' },
]

// APRÈS
attributes: [
  { name: 'id_notification', isPK: true },
  { name: 'type' },
  { name: 'lien' },
  { name: 'est_lue' },
]
```

### 3b. Modifier l'edge existant `obtenir`

Utiliser des handles différents pour éviter le chevauchement :

```typescript
{
  id: 'e-obtenir',
  source: 'utilisateur',
  target: 'notification',
  type: 'relationship',
  data: {
    label: 'obtenir',
    cardFrom: '0,n',
    cardTo: '1,1',
    handleFrom: 'right',   // ← AJOUTER
    handleTo: 'left',      // ← AJOUTER
  },
},
```

### 3c. Ajouter l'edge `déclencher`

```typescript
{
  id: 'e-declencher',
  source: 'utilisateur',
  target: 'notification',
  type: 'relationship',
  data: {
    label: 'déclencher',
    cardFrom: '0,n',
    cardTo: '0,1',
    handleFrom: 'bottom',  // ← AJOUTER
    handleTo: 'top',       // ← AJOUTER
  },
},
```

---

## Étape 4 — MLD (src/diagrams/nouveau/mld/utilisateurs_droits.ts)

Mettre à jour l'entité NOTIFICATION dans le MLD avec deux FK :

```typescript
{
  id: 'notification',
  type: 'entity',
  position: { x: 0, y: 600 },
  data: {
    label: 'NOTIFICATION',
    variant: 'mld',
    attributes: [
      { name: 'id', isPK: true },
      { name: 'type' },
      { name: 'lien' },
      { name: 'est_lue' },
      { name: 'destinataire_id', isFK: true },  // ← AJOUTER (vers UTILISATEUR)
      { name: 'acteur_id', isFK: true },         // ← AJOUTER (vers UTILISATEUR)
    ],
  },
},
```

---

## Étape 5 — MPD (src/diagrams/nouveau/mpd/utilisateurs_droits.ts)

Le MPD n'a pas d'entité NOTIFICATION (elle n'est pas dans le MPD actuel). Si elle y est ajoutée plus tard :

```sql
notif_destinataire INT UNSIGNED FK → user.id
notif_actor INT UNSIGNED FK → user.id
```

---

## Étape 6 — Documentation

### 6a. plans/audit/20260819_hors_scope_mcd.md

Mettre à jour l'entrée NOTIFICATION si nécessaire (pas d'action requise, `acteur` est déjà un attribut).

### 6b. README.md

Aucun changement requis (NOTIFICATION reste dans le mapping).

---

## Récapitulatif des fichiers

| Fichier | Action |
|---------|--------|
| `src/types/index.ts` | Ajouter `handleFrom`/`handleTo` à `RelationshipEdgeData` |
| `src/components/Edges/RelationshipEdge.tsx` | Utiliser handles explicites dans `getSmoothStepPath` |
| `src/diagrams/nouveau/mcd/utilisateurs_droits.ts` | Supprimer `acteur`, modifier `obtenir`, ajouter `déclencher` |
| `src/diagrams/nouveau/mld/utilisateurs_droits.ts` | Ajouter `destinataire_id` et `acteur_id` à NOTIFICATION |

---

## Vérification

- [ ] `npx vite build` passe sans erreur
- [ ] Les deux edges entre UTILISATEUR et NOTIFICATION sont visibles et distincts
- [ ] Les cardinalités sont correctes : `obtenir` (0,n / 1,1), `déclencher` (0,n / 0,1)
- [ ] L'attribut `acteur` n'apparaît plus dans le MCD
- [ ] Le MLD montre deux FK qualifiées dans NOTIFICATION
