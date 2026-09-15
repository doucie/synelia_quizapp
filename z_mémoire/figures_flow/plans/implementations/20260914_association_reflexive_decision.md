# PLAN — Association réflexive ANNULE sur DECISION (MCD candidatures_suivi)

## Statut
- Implémentation faite, `vite build` OK.
- Vérification visuelle : à faire par l'utilisateur (bouton DEBUG + boucle sur DECISION).

## Contexte

Le prof a signalé une association manquante sur le MCD « Candidatures & suivi » : la
réflexive `ANNULE` sur `DECISION`, qui manque dans le MCD alors qu'elle existe en BD réelle
(`decisions.cancels_decision_id → decisions.id`).

Faits vérifiés :
- BD réelle : FK auto-référence `cancels_decision_id` (modes CANCEL / OVERRIDE / ROLLBACK),
  indexée **non-unique** (`V1_060__add_multi_occurrence_phase_a_schema.sql`).
- MLD `src/diagrams/nouveau/mld/candidatures_suivi.ts:108` et MPD
  `src/diagrams/nouveau/mpd/candidatures_suivi.ts:108` : `cancels_decision_id` déjà présente.
- Audit du 19/08 (`plans/audit/20260819_audit_bd_vs_diagrammes.md:509`) : « decision : ajouter
  mode_décision, annule_décision » → `mode_decision` déjà présent, il manquait le lien conceptuel.
- `@xyflow/system` v12 n'a **aucun** handling self-edge dans `getSmoothStepPath`/`getBezierPath`
  (vérifié dans `node_modules/@xyflow/system/dist/esm/utils/edges`) → une arête `source === target`
  produirait un trait traversant la carte si on ne fait rien.

## Logique métier (cardinalités validées)

- `cancels_decision_id` est **univalué** par décision → une décision annule au plus 1 autre → `0,1`.
- L'index `cancels_decision_id` est **non-unique** → une décision peut être la cible de plusieurs
  annulations dans le temps (override / rollback) → `0,n` sur le rôle « est annulée ».

Résultat : `DECISION (0,1) — ANNULER — (0,n) DECISION` (validation utilisateur : OK).
Pas de rôles nominatifs (« annule / est annulée par ») : l'utilisateur a confirmé « ANNULER » uniquement.

## Changements

### 1. MCD — `src/diagrams/nouveau/mcd/candidatures_suivi.ts`
- [x] Ajout de l'arête réflexive :
  ```ts
  {
    id: 'e-annuler',
    source: 'decision',
    target: 'decision',
    type: 'relationship',
    data: { label: 'annuler', cardFrom: '0,1', cardTo: '0,n' },
  },
  ```
- Rien côté nœud DECISION (pas de FK en MCD — règle `plans/rules/regles_mcd.md:57`).

### 2. Rendu de la boucle — `src/components/Edges/RelationshipEdge.tsx`
- [x] Détection `isSelfLoop = source === target`.
- [x] Branche self-loop : boucle **orthogonale style smoothstep** (2 segments + segment horizontal
  au sommet), coins arrondis `Q` rayon `r = 8` — cohérent avec le `borderRadius: 8` de
  `getSmoothStepPath` utilisé par les autres arêtes.
- [x] **Orientation paramétrique** : la boucle suit le côté choisi dans le popover
  (`loopSide` = `sourceHandle` explicite → sinon `targetHandle` → sinon `top`).
  Géométrie par côté sur la boîte du nœud `(x0,y0,w,h)`, `spread = 34`, `hauteur = 90` :
  - `top` : ancres `(cx−34, y0)` & `(cx+34, y0)`, boucle vers `outer = y0−90` ;
  - `bottom` : ancres `(cx−34, y0+h)` & `(cx+34, y0+h)`, boucle vers `outer = y0+h+90` ;
  - `left` : ancres `(x0, cy−34)` & `(x0, cy+34)`, boucle vers `outer = x0−90` ;
  - `right` : ancres `(x0+w, cy−34)` & `(x0+w, cy+34)`, boucle vers `outer = x0+w+90`.
  Persistance inchangée (`setCardinalitySide` → `edge_sides`, rechargé par `DiagramCanvas`).
- [x] Badges `cardFrom`/`cardTo` repositionnés avec `badgeOffset(loopPos)` — `fromOff`/`toOff`
  basculés selon `isSelfLoop` ; chaque badge reste près de son ancrage (ex. `top` : de part et
  d'autre au-dessus du bord haut).
- [x] Label « annuler » centré au sommet de la boucle (`labelX/labelY`).
- [x] Fallback dimensions `220`/`130` si `measured` indisponible au premier frame.
- `exportSvg` suit automatiquement (clone du `d` + capture des labels) — aucune modif.

### 3. Vérifications
- [x] `npx tsc --noEmit` : zéro erreur sur les fichiers modifiés (restent les pré-existantes
  `types/index.ts` / composants React Flow v12).
- [x] `npx vite build` OK.
- [ ] Contrôle visuel utilisateur : boucle sur DECISION orientable (top/bottom/left/right via le
  popover), badges `0,1` / `0,n` distincts, pilule « annuler » au sommet, persistence après reload,
  export SVG correct.

## Fichiers concernés
- `src/diagrams/nouveau/mcd/candidatures_suivi.ts`
- `src/components/Edges/RelationshipEdge.tsx`

## Notes / évolutions possibles (hors scope)
- Rôles nominatifs par patte (« annule » / « est annulée par ») sur les associations réflexives :
  nécessiterait un champ `roleFrom`/`roleTo` dans `RelationshipEdgeData` + rendu — non demandé.
- From et To réglés sur des côtés **différents** : la boucle suit `From` (Source prioritaire) — le
  To reste stocké mais ignoré pour la géométrie. Simplifier éventuellement le popover (une seule
  rangée) pour une arête réflexive.
- L'overlay DEBUG affiche les ancrages résolus React Flow (premier handle), pas les extrémités
  de la boucle — cosmétique, debug uniquement.