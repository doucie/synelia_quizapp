# PLAN — FK cross-domaines MLD + renvois bas de figure

Date : 2026-09-22
Référence : règle 10 + recensement final acté dans
`plans/implementations/20260919_passage_mcd_mld.md` (annexe « Inventaire cross-domaines »).

## Statut

- **Documentation faite (20260922)** : ce plan + notation ajoutée dans `plans/rules/regles_mld.md`
  (§8, « Renvois cross-domaines ») + README (section Types). Aucune implémentation à ce stade.
- **Implémentation validée « go » (20260922)** : 6 colonnes FK dans les `mld/*.ts`, exposants
  `refMarker`, bloc « Renvois » sous le diagramme, **+ cible théorique « Convocation »** dans
  `entretiens_evaluation.ts` (MCD + MLD), **+ exemples `bd_documentee`** (multi-convocations) et
  **+ notes « cible pas encore atteinte en BD physique »** (3 emplacements). Checkpoints ci-dessous.

## Contexte & décisions

- Le MLD est découpé en figures par sous-domaine (BD trop grande pour une figure). Une liaison
  inter-figures produit une **FK réelle dans la table source** (jamais l'entité cible, jamais une
  table de liaison inter-figures) + un **renvoi bas de figure** (règle 10).
- Les 6 FKs proviennent du recensement final (source : `bd_actuelle/quizapp_db_described_20260818.md`) :
  colonnes physiques confirmées, `pipeline_stage_evaluation_criterion` supprimée en V1_080 (le lien
  ETAPE_PIPELINE × VERSION_GRILLE est porté par `pipeline_stage.evaluation_grid_template_version_id`).
- Nullabilité : source physique du snap 20260818. `ENTRETIEN.#id_avancement` est nullable dans le
  snap (NOT NULL dans la cible théorique 420 — passera quand la BD sera alignée).
- Périphérie : FK acteurs/audit (`validated_by`, `creator_id`…), `SOURCE_TOKEN`, `TENTATIVE_QUIZ`,
  `SPECIALITE` = hors périmètre (documentées dans le recensement).

## Étapes

### Documentation (fais, commité)

- [x] Créer ce plan.
- [x] `plans/rules/regles_mld.md` §8 : bloc « Renvois cross-domaines ».
- [x] `README.md` : mettre à jour la section Types (`refMarker`, `notes`) + ligne de feature.

### Type (`src/types/index.ts`)

- [x] `Attribute` : ajouter `refMarker?: string` (exposant ¹ ² ³ porté par la FK cross).
- [x] `DiagramDefinition` : ajouter `notes?: { marker: string; text: string }[]` (renvois de la figure).

### Rendu

- [x] `src/components/Nodes/EntityNode.tsx` : afficher `<sup>{attr.refMarker}</sup>` après le nom
      de l'attribut FK (exposant en gris, discret).
- [x] `src/components/DiagramCanvas.tsx` : rendre le bloc « Renvois — entités définies hors figure »
      en **enfant de `<ReactFlow>`** (espace transformé → pan/zoom avec la figure), positionné sous
      le nœud le plus bas (`max(nodes.position.y) + 90`), styles tokens (`border-border`,
      `bg-background/80`, `text-muted-foreground`, `pointer-events-none`). Affiché uniquement si
      `diagram.notes?.length`.

### Données — 6 FKs à ajouter (184 → 190 attributs, 29 relations inchangées)

`src/diagrams/nouveau/mld/candidatures_suivi.ts` :

- [x] `CANDIDATURE` + `{ name: '#id_version_formulaire', type: 'INT', isFK: true, nullable: true, refMarker: '1' }`
      (après la PK) — renvoi ¹ VERSION_FORMULAIRE (Campagnes & pipeline).
- [x] `AVANCEMENT` + `{ name: '#id_etape_pipeline', type: 'INT', isFK: true, refMarker: '2' }`
      (après `#id_candidature`) — renvoi ² ETAPE_PIPELINE (Campagnes & pipeline).
- [x] `DECISION` + `{ name: '#id_utilisateur', type: 'INT', isFK: true, nullable: true, refMarker: '3' }`
      (après `#id_avancement`) — renvoi ³ UTILISATEUR (Utilisateurs & droits).
- [x] `diagram.notes` : 3 renvois (1/2/3).

`src/diagrams/nouveau/mld/campagnes_pipeline.ts` :

- [x] `ETAPE_PIPELINE` + `{ name: '#id_version_grille', type: 'INT', isFK: true, nullable: true, refMarker: '1' }`
      (après `#id_modele_pipeline`) — renvoi ¹ VERSION_GRILLE (Entretiens & évaluation).
- [x] `REGLE_NOTIFICATION` + `{ name: '#id_modele_email', type: 'INT', isFK: true, nullable: true, refMarker: '2' }`
      (après `#id_etape_pipeline`) — renvoi ² MODELE_EMAIL (Communication, hors figure).
- [x] `diagram.notes` : 2 renvois (1/2).

`src/diagrams/nouveau/mld/entretiens_evaluation.ts` :

- [x] `ENTRETIEN` + `{ name: '#id_avancement', type: 'INT', isFK: true, nullable: true, refMarker: '1' }`
      (après la PK) — renvoi ¹ AVANCEMENT (Candidatures & suivi).
- [x] `diagram.notes` : 1 renvoi.

`src/diagrams/nouveau/mld/utilisateurs_droits.ts` : aucun changement (pas de FK cross).

## Étapes — cible théorique « Convocation » (validée le 20260922)

La BD physique n'emporte pas sur la BD théorique : **le MCD/MLD constitue la vraie `bd_cible`**.
Une occurrence `ENTRETIEN` peut concerner plusieurs convocations (cf. `InterviewsBusiness.java`
`ensureCandidateInterviewLink` : nouvelle `CandidateInterview` sur le même `interview_id` quand
aucune active) — d'où le modèle à deux couches.

`src/diagrams/nouveau/mcd/entretiens_evaluation.ts` :

- [x] `ENTRETIEN` : `date` → `date_planifiee` ; retrait `date_evaluation`, `date_fermeture`,
      `commentaire_fermeture` (10 attributs).
- [x] `CANDIDAT_ENTRETIEN` → `CONVOCATION` (id de nœud `candidat_entretien` conservé pour la
      persistance localStorage) : PK `id_convocation`, ajout `date_proposee`.
- [x] Arête `e-convoquer` : verbe `convoquer` → `proposer` (cardinalités inchangées).

`src/diagrams/nouveau/mld/entretiens_evaluation.ts` :

- [x] `ENTRETIEN` : `date` → `date_planifiee` ; retrait des 3 attributs ; ajout `#id_avancement` (FK
      cross, nullable).
- [x] `CONVOCATION` : PK `id_convocation`, `#id_entretien`, **`date_proposee` DATETIME NOT NULL**
      (snapshot par convocation), `statut_reponse`, `motif_refus`, `duree`, `date_reponse`,
      `date_alternative_demandee` (8 attributs).
- [x] `EVALUATION` : `#id_candidat_entretien` → `#id_convocation`.

Règles de vie (rappel — à faire vivre côté application, hors figures) : la convocation active porte
`date_proposee = ENTRETIEN.date_planifiee` ; **tout changement de date = nouvelle convocation**
(jamais un reset en place de la précédente) ; un retard se mesure entre la date acceptée et
`date_debut` réel.

## Vérifications

- [ ] `npx tsc --noEmit` : pas de nouvel échec au-delà des 70 erreurs pré-existantes connues.
- [ ] `npx vite build` : build OK (artefacts dist à committer).
- [ ] Test manuel `npm run dev` : exposants `refMarker` dans les blocs, bloc « Renvois » sous le
      nœud le plus bas, pan/zoom conservé, figure « Entretiens & évaluation » (MCD + MLD) conforme
      à la cible convocation.

## Écart cible théorique vs BD physique (à noter dans le recensement et les exemples)

- **Nom** : la BD physique a conservé `candidate_interview` ; la cible théorique la renomme
  `CONVOCATION`.
- **Dates** : en physique, la convocation ne porte pas de `date_proposee` (la date vit sur
  `interviews`). Cible théorique : `CONVOCATION.date_proposee` + a minima renommage
  `interviews.date` → `date_planifiee` (cf. `bd_documentee`).
- **Discipline** : en physique, `ensureCandidateInterviewLink` resets la convocation active en place
  (réponse + date). Cible théorique : tout changement de date = nouvelle convocation (ne jamais
  écraser la convocation précédente).

## Commits proposés (conventional commits)

1. `docs(diagrams): plan FK cross-domaines + cible convocation (plan 20260922, regles_mld §8, README types)`
2. `feat(diagrams): FK cross-domaines MLD (6 colonnes + renvois bas de figure)`
3. `feat(diagrams): cible théorique convocation (MCD+MLD entretiens)`
4. `docs(bd-documentee): exemples multi-convocations + écart cible théorique vs BD physique`
5. `build(diagrams): artefacts dist (FK cross + renvois + convocation)`

## Pièges / rappels

- Le bloc « Renvois » est un enfant de `<ReactFlow>` (espace flow) et non un `<Panel>` (espace
  écran) — sinon il ne se déplacerait pas avec la figure.
- Ne pas dessiner d'arête pour une FK cross (Règle 10) : la FK porte `#` + `refMarker`, l'entité
  cible n'est pas insérée dans la figure.
- Aucune table de liaison inter-figures (ex. `pipeline_stage_evaluation_criterion`, supprimée) :
  résolution en FK directe nullable sur la table dominante.