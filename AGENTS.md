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

### État actuel (fix ancrages des arêtes)
- Les arêtes partagent un offset quand elles touchent le **même ancrage résolu** (React Flow v12 ancre sans handle sur le premier handle du nœud). Helpers dans `src/components/Edges/edgeAnchors.ts` (`resolveHandleId`, `edgePathOffset`, `edgeAnchorGroup`), overlay dans `src/utils/edgeDebug.ts`. Bouton de debug dans `DiagramCanvas.tsx`.
- **Déjà fait** : offset par ancrage résolu dans `RelationshipEdge.tsx` + `TraitementEdge.tsx`, commit `a4ec9ca`.
- **En attente (reliquat)** : **Option A** (sanifier les `edge_sides` périmées au chargement) et **Option B** (factoriser les copies de `getValidHandles` — `DiagramCanvas.tsx:30-39` ne gère pas `mct-syncop` ; B doit être couplé à A). Détails : `plans/implementations/20260830_points_ancrage_edges.md`.

## Pour naviguer
- Base cible BD post-migration 420 : `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_cible_post_420_migration.md`.
- Backlog/audits/checklists : dossier `to-do/` (livrables, règles, prompts).
- Fiches pages/entités front : `cartographie-fonctionnelle-front/dashboard/`, `…/entities/`, `…/public/`.
