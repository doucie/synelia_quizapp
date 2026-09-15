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
- [x] **Patte source et patte cible indépendantes** (même principe qu'une arête normale) :
  le rendu part des ancrages React Flow réels (`sourceX/sourceY` + `sourcePosition`,
  `targetX/targetY` + `targetPosition`), chacun sur SON côté choisi dans le popover.
  Helper `buildReflexiveEdge` (`REFLEX_SPREAD=34`, `REFLEX_OFFSET=90`, `REFLEX_RADIUS=8`) :
  - **même côté** : boucle en U sur ce côté, deux ancres écartées de `±34` le long de l'arête
    (les points RF coïncident au centre de l'arête), boucle dépliée de `90` vers l'extérieur ;
  - **côtés différents** : projection de chaque ancre de `90` à l'extérieur du nœud
    (`R' = [x0−90, y0−90, w+180, h+180]`) et contournement **périmétrique par le chemin court**
    (tour sur le bord du rectangle extérieur, coins arrondis `Q` r=8) ; égalité → sens
    anti-horaire (défaut sans côté : right→left passe par le haut).
  - Les offsets de chemin partagés (`edgePathOffset`) sont réappliqués **en décalage tangentiel**
    le long de l'arête pour séparer plusieurs boucles sur le même côté.
  - Persistance inchangée (`setCardinalitySide` → `edge_sides`, rechargé par `DiagramCanvas`).
- [x] Badges `cardFrom`/`cardTo` : `fromOff = badgeOffset(sourcePosition)` et
  `toOff = badgeOffset(targetPosition)` — **aucun override self-loop** : chaque badge suit sa
  propre patte (ex. source top + target right → un badge au-dessus, un badge à droite).
- [x] Label « annuler » : sommet de la boucle dans le cas même côté, **milieu de la polyligne**
  du contournement dans le cas côtés différents.
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
- L'overlay DEBUG affiche les ancrages résolus React Flow (premier handle), pas les extrémités
  de la boucle — cosmétique, debug uniquement.