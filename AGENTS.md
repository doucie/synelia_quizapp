# AGENTS.md — Contexte projet pour les sessions

Projet de fin d'études (ENSIT 2026, entreprise SYNELIA) : plateforme web de **recrutement via quiz**,
avec processus complet (campagnes, candidatures, quiz, entretiens, évaluations, décisions).
Vue d'ensemble rapide : `README.md` racine.

## Blocs principaux

| Dossier | Rôle |
|---|---|
| `quizapp/` | Backend **Java 21 / Spring Boot 3.5** (WAR). Package `tech.synelia.quizapp`. JPA/MySQL, migrations Flyway, API **tout en POST** (`POST /entity/action`, format `{user, datas[]}`), code généré Telosys (`TelosysTools/`). |
| `quizapp_front/` | Frontend **Angular 20** (SCSS, BEM, variables CSS `:root`). Parcours candidat + dashboard. Routes : `src/app/app.routes.ts`. |
| `z_mémoire/` | Mémoire (sources Typst `template_memoire/typst/`), figures, et **`figures_flow/`** : SPA React Flow **indépendante** des diagrammes Merise/UML (MCD/MLD/MPD + MCT/SAT/MPT/MOT). |
| `cartographie-fonctionnelle-front/` | Cartographie métier route-first, base de données cible, audits, évolutions fonctionnelles. |

## Conventions & règles (références — ne pas réécrire ici)

- `to-do/rules/general-rules.md` : API tout-en-POST, update partiel (`""` → ignorer, `null` → mettre à null, autre → mettre à jour), front envoie `null` au lieu de `""`, pas de couleurs en dur, réutiliser l'existant, mettre à jour les checklists.
- `to-do/rules/to-do-rules-back.md` : structure par entité (Entity/Business/Repository/`_Repository`/Controller/Dto/`_Dto`/Transformer), responsabilités fixes, interdits anti-spaghetti, checklist pré-merge.
- `to-do/rules/to-do-rules-front.md` + `quizapp_front/RULES.md` : uniquement les variables CSS/design-tokens fournis (aucune couleur/px/font hardcodée), pas d'émojis (icônes/SVG), composants réutilisables, ne pas piper une date déjà formatée `dd/MM/yyyy`.
- Git : milestones/commits en conventional commits (ex. `fix(edge): …`, `feat(edge): …`).

## figures_flow (contexte de travail le plus actif)

- Démarrer : `cd z_mémoire/figures_flow && npm run dev`. Build : `npx vite build`. Typecheck : `npx tsc --noEmit`.
- Projet **indépendant** du front Angular. Docs : `README.md` dédié + méthode Merise dans `plans/rules/regles_mcd.md`.
- Persistance **localStorage** : positions `figures_flow:diagram:<id>`, côtés de cardinalité `figures_flow:edge_sides:<id>`, et **overlay debug** `figures_flow:debug_edges` (bouton `DEBUG` en haut-droite → ancrage déclaré→résolu, taille de groupe, offset px).
- Plans par convention : `plans/implementations/YYYYMMDD_<sujet>.md`, avec checkboxes `[ ]`/`[x]`.
- Export SVG (figure + bloc ⤓) : bordure des cartes repeinte au raster — `plans/rules/regles_export_svg.md` (prérequis : polices auto-hébergées dans `src/assets/fonts/`).

### État actuel (fix ancrages des arêtes)
- Les arêtes partagent un offset quand elles touchent le **même ancrage résolu** (React Flow v12 ancre sans handle sur le premier handle du nœud). Helpers dans `src/components/Edges/edgeAnchors.ts` (`resolveHandleId`, `edgePathOffset`, `edgeAnchorGroup`), overlay dans `src/utils/edgeDebug.ts`. Bouton de debug dans `DiagramCanvas.tsx`.
- **Déjà fait** : offset par ancrage résolu dans `RelationshipEdge.tsx` + `TraitementEdge.tsx`, commit `a4ec9ca`.
- **En attente (reliquat)** : **Option A** seulement — sanifier les `edge_sides` périmées au chargement. **Option B close le 2026-10-01** : les 3 copies de `getValidHandles` sont remplacées par `validHandles` dans `src/components/Edges/edgeAnchors.ts` (gère `mct-syncop`, source unique pour `DiagramCanvas` + `RelationshipEdge` + `TraitementEdge`). Détails : `plans/implementations/20260830_points_ancrage_edges.md`.
- **Liens croisés du MCT combiné** : un résultat de T*n* se relie à la **synchronisation** de T*n+1* (`tN-mctN-op`, `targetHandle: 'top'`), pas à son événement — l'événement reste le déclencheur interne du traitement suivant. Modèle : interface `CrossLink` dans `src/diagrams/traitements/v2/mct_combine.ts`.
- **Ancrages par défaut verticaux du MCT (2026-10-01)** : sortie par le bas, entrée par le haut. L'ordre des `<Handle>` de `Handles({ order })` dans `src/components/Nodes/ProcessNode.tsx` doit rester **identique** à `handleIdsOf` (`MCT_SOURCE_HANDLES`/`MCT_TARGET_HANDLES`) dans `edgeAnchors.ts` — sinon React Flow (1er handle du type dans le DOM) et le calcul d'offset divergent. `'vertical'` uniquement pour `mct-event`/`mct-sync`/`mct-syncop`/`mct-operation`/`mct-result` ; SAT, MPT et `EntityNode.tsx` restent `'horizontal'`. Attention : MOT réutilise les MCT d'archive, donc tout default par variant MCT s'y applique aussi.
- **Arêtes MCT en segment droit (2026-10-01)** : `TraitementEdge.tsx` choisit entre `getStraightPath` et `getSmoothStepPath` sur `data.straight`, posé **uniquement** par `DiagramCanvas.tsx` (`initialEdges`) via `diagram.id.startsWith('mct')`. Ne pas faire sniffler l'id par le composant d'arête : la règle « quelles figures sont droites » est écrite à un seul endroit. Sont droites les **18 figures MCT** (`mct-v2-*` + archive `mct-*`) ; SAT, MPT, MOT, MCD, MLD et MPD gardent l'escalier et passent par `RelationshipEdge.tsx` (non modifié). L'offset d'ancrage s'applique tel quel : il produit des diagonales parallèles au lieu de marches parallèles. Détails : `plans/implementations/20261001_aretes_droites_mct.md`.

### État actuel (encadrements des traitements)
- **Deux figures concernées** : `mct-v2-parcours-1` (T0, T1, T2) et `mct-v2-parcours-2` (T3, T4, T5) — `DiagramDefinition.sections` n'existe que dans `src/diagrams/traitements/v2/mct_combine.ts`. Aucune autre figure (MCT individuels, archive, MOT) ne rend d'encadrement. Découpage du 2026-10-01 : `plans/implementations/20261001_decoupe_parcours_mct.md`.
- **Un seul encadrement à la fois, rien au repos** : le cadre ne suit que `[data-hovered]` / `[data-focused]`, et `focused` vaut `focusedSectionId === prefix && hoveredSectionId === null` — sans ça, survoler B pendant que A est focalisé dessine deux cadres. Un traitement **verrouillé n'a aucun trait persistant** : `data-locked` et la règle CSS associée ont été supprimés (choix assumé, cf. `plans/implementations/20260930_traitements_verrou_mct.md`).
- **Ne pas casser le déverrouillage** : `TreatmentFrameControls` filtre sur `hovered || focused`. C'est correct parce que `.treatment-frame` est en `pointer-events: auto` et que `TreatmentFrames` rend *tous* les cadres sans filtre → le survol fait toujours réapparaître badge + icônes. Si le filtre repart sur `locked`, un cadenas isolé flottant sur la figure réapparaît.
- Le verrou ne joue que sur le **glissement groupé** (`resolveDragGroup`) et reste persisté via `lockedSections` dans `figures_flow:diagram:<id>` ; il ne touche pas `draggable` ni la sélection.
- `<DiagramCanvas>` est monté avec `key={activeDiagram?.id}` dans `App.tsx` : **tout changement de figure doit rester un remontage**, sinon l'effet de réinitialisation (dépendant de `diagram?.id`) ne se rejoue pas et l'état précédent reste affiché. Les ids de figures doivent rester uniques — les doublons d'archive ont été suffixes en `-archive`.

### État actuel (figures de parcours du MCT)
- `mct_combine.ts` est une **fabrique** `buildCombine({ id, title, domain, entries, crossLinks })` qui exporte `mctParcours1` (T0–T2) et `mctParcours2` (T3–T5). Chaque figure réindexe ses rangées à partir de 0 (`i * ROW_HEIGHT`), 3 × 640 px.
- **Un lien croisé ne peut pas traverser deux figures** : `buildCombine` retire et signale par `console.error` tout `CrossLink` dont une extrémité est absente du lot. Ne pas reintroduire `x-t2-r1-t3-op` (coupure T2→T3, non représentée) — la continuité est portée par les titres « 1/2 », « 2/2 » et le mémoire.
- **T6 est hors parcours**, volontairement : l'audit n'a aucun lien et reste sur sa figure individuelle `mct-v2-6-audit`.
- Les **préfixes restent attachés aux numéros de traitement** (`t3-`, `t4-`, `t5-` dans la figure 2) : les badges des encadrements montrent T3/T4/T5, pas T0/T1/T2.

## Pour naviguer
- Base cible BD post-migration 420 : `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_cible_post_420_migration.md`.
- Backlog/audits/checklists : dossier `to-do/` (livrables, règles, prompts).
- Fiches pages/entités front : `cartographie-fonctionnelle-front/dashboard/`, `…/entities/`, `…/public/`.
