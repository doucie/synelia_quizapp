# 20261018 — Substitutions UML : figs. 14 (états campagne) et 15 (états candidature)

Doc de décision d'audit (§3.2). Décisions utilisateur : **remplacement** des deux
figures `figures_html` par les UML Claude d'états-transitions (déjà au catalogue,
lot 1) ; **double occurrence assumée** avec `cycle_etape` / `etats_etape` en §5
(angulaires différents : §3.2 besoins, §5 UML de complément).

## Constat de fond
- `machine_etats_campagne.html` : DRAFT/OPEN/**IN_PROGRESS**/CLOSED/**ARCHIVED** —
  faux au regard du code : `campaign_status` réel = `DRAFT, PENDING, OPEN,
  PAUSED, CLOSED` + `is_archived` booléen (var. `V1_038`, D-022, VARCHAR(20)) ;
  la doc (quizapp_db_documentation_20260810.md:1178) confirme.
- `machine_etats_candidature.html` : PENDING → EMAIL_VERIFIED → … → DECIDED —
  obsolète en cible post-420 : `application_status` et `quiz_status` sont
  **retirés** de `applications` (bd_actuelle_post_420 :§157-159) ; le parcours
  réel passe par `application_progress.progress_status` (PENDING/IN_PROGRESS/
  AWAITING_VALIDATION/COMPLETED/FAILED/SKIPPED) = exactement
  `etats_etape_pipeline_v2.svg` (AWAITING_VALIDATION omis, note du source).
- Le texte du mémoire ne cite jamais les anciens statuts ⇒ substitutions au
  niveau figure/caption uniquement.

## Fait
- [x] Exports utilisateur : `captures/8-figures-memoire/uml-etats-campagne.svg`,
      `uml-etats-etape.svg` (+ `uml-etats-tentative.svg`, réserve sans destination
      décidée — ne pas substituer sans décision).
- [ ] `body.typ:409` : `processus_recrutement…` NON (c'est fig. 2) — remplacer
      `machine_etats_campagne.png` par `uml-etats-campagne.svg`, caption
      « États-transitions de campagne — brouillon, mise en attente, ouverture,
      pause et clôture, avec archivage à part. »
- [ ] `body.typ:421` : remplacer `machine_etats_candidature.png` par
      `uml-etats-etape.svg`, caption « États-transitions d'une étape de
      pipeline — progression contrainte du dossier candidat. »
- [ ] `git rm` des 2 PNG ; `typst compile` sans warning ; commit `docs(typst)`.
