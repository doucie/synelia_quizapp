# PLAN — Corrections MCD « Entretiens & évaluation » (associations EVALUATION)

## Statut
- Plan en cours de complétion : plusieurs corrections signalées par le prof, fournies
  progressivement. Implémentation non commencée (OK utilisateur attendu).
- Rythme : chaque correction ajoute sa section ci-dessous ; on n'implémente qu'à la fin,
  après le OK global de l'utilisateur.

## Contexte

Le prof a signalé plusieurs corrections sur le MCD « Entretiens & évaluation »
(`src/diagrams/nouveau/mcd/entretiens_evaluation.ts`, id `mcd-entretiens-evaluation`),
le premier point portant sur des associations manquantes autour de `EVALUATION`.

Faits vérifiés (BD réelle documentée — `cartographie-fonctionnelle-front/bd_documentee` :
`exemples/data.js` + `quizapp_db_documentation_20260810.md`) :
- `evaluations.candidate_interview_id` **NOT NULL** → FK `candidate_interview.id`.
- `evaluations.interview_participant_id` **nullable** → FK `interview_participant.id`
  (note `data.js:301` : « chaque évaluateur a sa propre ligne pour le même
  candidate_interview »).
- Pas de FK directe `evaluations.interview_id` : le lien vers ENTRETIEN passe par
  `candidate_interview`.
- MLD `mld/entretiens_evaluation.ts` et MPD `mpd/entretiens_evaluation.ts` : les FK
  `candidate_interview_id` et `interview_participant_id` sont **déjà présentes** sur
  EVALUATIONS → seuls les MCD manquent les associations conceptuelles.

---

## Correction 1 — Associations manquantes autour de EVALUATION

### Logique métier (cardinalités validées)

- `candidate_interview_id` NOT NULL → chaque évaluation concerne **exactement 1**
  CANDIDAT_ENTRETIEN → `1,1` côté EVALUATION.
- Un CANDIDAT_ENTRETIEN peut avoir plusieurs évaluations (une par évaluateur) ou aucune →
  `0,n`.
- `interview_participant_id` nullable → chaque évaluation est rattachée à **au plus 1**
  PARTICIPANT_ENTRETIEN → `0,1` côté EVALUATION.
- Un PARTICIPANT_ENTRETIEN peut soumettre plusieurs évaluations (sur différents candidats)
  ou aucune → `0,n`.

Résultat (conformes au retour prof) :
- `CANDIDAT_ENTRETIEN (0,n) — concerner — (1,1) EVALUATION`
- `PARTICIPANT_ENTRETIEN (0,n) — soumettre — (0,1) EVALUATION`

### Changements — `src/diagrams/nouveau/mcd/entretiens_evaluation.ts`

- [ ] **Retirer** `e-recevoir` (ENTRETIEN → EVALUATION, `cardFrom: '1,1'`,
  `cardTo: '1,1'`, `isStrong: true`) : pas de FK directe en BD, et cardinalité fausse
  (un entretien reçoit de nombreuses évaluations via candidats × évaluateurs). Décision
  utilisateur : retrait (option A).
- [ ] **Ajouter** `e-concerner` :
  ```ts
  {
    id: 'e-concerner',
    source: 'candidat_entretien',
    target: 'evaluation',
    type: 'relationship',
    data: { label: 'concerner', cardFrom: '0,n', cardTo: '1,1' },
  },
  ```
- [ ] **Ajouter** `e-soumettre` :
  ```ts
  {
    id: 'e-soumettre',
    source: 'participant_entretien',
    target: 'evaluation',
    type: 'relationship',
    data: { label: 'soumettre', cardFrom: '0,n', cardTo: '0,1' },
  },
  ```

---

## Correction 2 — Chaînon manquant entre ITEM_EVALUATION et GRILLE_MODELE

### Logique métier (cardinalités validées)

Comme pour FORMULAIRE → VERSION_FORMULAIRE → QUESTION (même logique de versionnement) :
la BD réelle intercale deux niveaux entre la grille et l'item noté.

Faits vérifiés (`data.js` + doc `quizapp_db_documentation_20260810.md`) :
- `evaluation_item.evaluation_grid_template_item_id` **NOT NULL** (doc:651) → chaque item
  noté référence **exactement 1** CRITERE_GRILLE ; **UNIQUE** `(evaluation_id,
  evaluation_grid_template_item_id)` (doc:665) → une évaluation ne note pas deux fois le
  même critère.
- `evaluation_grid_template_item.evaluation_grid_template_version_id` **NOT NULL** (doc:712)
  → chaque critère appartient à **exactement 1** VERSION_GRILLE.
- `evaluation_grid_template_version.evaluation_grid_template_id` → chaque version appartient
  à **exactement 1** GRILLE_MODELE (FK list `data.js:669-670`).
- Une grille a 0..n versions (ex. grille 1 → v1 publiée/verrouillée + v2 non publiée,
  `data.js:341-342`) ; une version définit 0..n critères (ex. v1 → 3 items, `data.js:352-354`) ;
  un critère peut être noté 0..n fois (ex. critère 1 « Communication » → items 1 et 4).
- MPD `mpd/entretiens_evaluation.ts` : les 3 entités + 3 FK sont déjà présentes → seul le
  MCD est en retard.

Résultat (conformes au retour prof) :
- `GRILLE_MODELE (0,n) — versionner_grille — (1,1) VERSION_GRILLE`
- `VERSION_GRILLE (0,n) — définir — (1,1) CRITERE_GRILLE`
- `CRITERE_GRILLE (0,n) — noter — (1,1) ITEM_EVALUATION`

### Changements — `src/diagrams/nouveau/mcd/entretiens_evaluation.ts`

- [ ] **Retirer** `e-evaluer` (ITEM_EVALUATION → GRILLE_MODELE direct,
  `cardFrom: '1,1'`, `cardTo: '1,n'`) : le lien direct est remplacé par la vraie chaîne.
  Résout au passage l'infraction `e-evaluer` de l'audit
  `20260819_audit_infractions_mcd.md` (correction « inverser les cardinalités » obsolète).
- [ ] **Ajouter** l'entité `version_grille` / VERSION_GRILLE (position initiale (1400,170)) :
  ```ts
  {
    id: 'version_grille',
    type: 'entity',
    position: { x: 1400, y: 170 },
    data: {
      label: 'VERSION_GRILLE',
      variant: 'mcd',
      attributes: [
        { name: 'id_version', isPK: true },
        { name: 'numero_version' },
        { name: 'est_publiee' },
        { name: 'empreinte_contenu' },
        { name: 'verrouillee_le' },
      ],
    },
  },
  ```
- [ ] **Ajouter** l'entité `critere_grille` / CRITERE_GRILLE (position initiale (1250,350)) :
  ```ts
  {
    id: 'critere_grille',
    type: 'entity',
    position: { x: 1250, y: 350 },
    data: {
      label: 'CRITERE_GRILLE',
      variant: 'mcd',
      attributes: [
        { name: 'id_critere', isPK: true },
        { name: 'ordre' },
        { name: 'libelle' },
        { name: 'type_critere' },
        { name: 'score_max' },
        { name: 'poids' },
        { name: 'est_requis' },
      ],
    },
  },
  ```
- [ ] **Ajouter** 3 edges (sens source→target = sens BD, les badges affichent les bonnes
  cardinalités de chaque côté) :
  ```ts
  {
    id: 'e-versionner',
    source: 'grille_modele',
    target: 'version_grille',
    type: 'relationship',
    data: { label: 'versionner_grille', cardFrom: '0,n', cardTo: '1,1' },
  },
  {
    id: 'e-definir',
    source: 'version_grille',
    target: 'critere_grille',
    type: 'relationship',
    data: { label: 'definir', cardFrom: '0,n', cardTo: '1,1' },
  },
  {
    id: 'e-noter',
    source: 'critere_grille',
    target: 'item_evaluation',
    type: 'relationship',
    data: { label: 'noter', cardFrom: '0,n', cardTo: '1,1' },
  },
  ```

---

## Correction 3 — Cardinalités `convoquer` et `integrer` inversées

### Logique métier (cardinalités validées)

Faits vérifiés (doc `quizapp_db_documentation_20260810.md`) :
- `candidate_interview.interview_id` **NOT NULL**, index non-unique `MUL` (doc:578) →
  chaque CANDIDAT_ENTRETIEN référence **exactement 1** entretien ; un entretien convoque
  0..n candidats. Choix utilisateur : `0,n` côté ENTRETIEN.
- `interview_participant.interview_id` **nullable** (doc:609, durcissement reporté) → en
  BD réelle ce serait `0,1` ; **décision utilisateur : ne pas respecter le nullable**
  (durcissement) → `1,1` côté PARTICIPANT_ENTRETIEN.

Résultat :
- `ENTRETIEN (0,n) — convoquer — (1,1) CANDIDAT_ENTRETIEN`
- `ENTRETIEN (0,n) — integrer — (1,1) PARTICIPANT_ENTRETIEN`

### Changements — `src/diagrams/nouveau/mcd/entretiens_evaluation.ts`

- [ ] `e-convoquer` : `cardFrom: '1,1' → '0,n'`, `cardTo: '1,n' → '1,1'`.
- [ ] `e-inclure` : `cardFrom: '1,1' → '0,n'`, `cardTo: '1,n' → '1,1'`.

---

## Correction 4 — Cardinalité `contenir` (EVALUATION → ITEM_EVALUATION)

### Explication de la remarque prof « sans contrainte d'unicité »

Une cardinalité `1` sur un côté = **NOT NULL** (au moins 1) **+ UNIQUE** (au plus 1).
- `evaluation_item.evaluation_id` est **NOT NULL** → chaque item appartient à exactement
  1 évaluation → `1,1` côté ITEM_EVALUATION.
- `evaluation_id` n'a **aucune** UNIQUE → le même `evaluation_id` apparaît dans plusieurs
  lignes `evaluation_item` → une évaluation contient **plusieurs** items → `0,n` côté
  EVALUATION (pas `1,1`). Le seul UNIQUE est `(evaluation_id,
  evaluation_grid_template_item_id)` (doc:665) : il interdit de noter deux fois le même
  critère **dans la même** évaluation, il ne limite pas le nombre d'items par évaluation.

Résultat (choix utilisateur `0,n`, une évaluation DRAFT peut être vide) :
- `EVALUATION (0,n) — contenir — (1,1) ITEM_EVALUATION`

### Changements — `src/diagrams/nouveau/mcd/entretiens_evaluation.ts`

- [ ] `e-contenir-item` : `cardFrom: '1,1' → '0,n'`, `cardTo` conserve `'1,1'`.

---

## Vérifications (fin de plan, implémentation par lots)

- [ ] Lot 1 (Correction 1) : associations EVALUATION, `npx tsc --noEmit` sans nouvelle erreur.
- [ ] Lot 2 (Correction 2) : chaîne grille → version → critère, `npx tsc --noEmit` sans
  nouvelle erreur.
- [ ] Lot 3 (Corrections 3 & 4) : cardinalités convoquer/integrer/contenir, `npx tsc --noEmit`
  sans nouvelle erreur.
- [ ] `npx vite build` OK (le bundle dist change : les diagrammes y sont compilés).
- [ ] Contrôle visuel utilisateur :
  - `CANDIDAT_ENTRETIEN (0,n) — concerner — (1,1) EVALUATION`,
    `PARTICIPANT_ENTRETIEN (0,n) — soumettre — (0,1) EVALUATION`, `e-recevoir` disparu ;
  - chaîne `GRILLE_MODELE (0,n) — versionner_grille — (1,1) VERSION_GRILLE (0,n) — définir —
    (1,1) CRITERE_GRILLE (0,n) — noter — (1,1) ITEM_EVALUATION`, `e-evaluer` disparu ;
  - `ENTRETIEN (0,n) — convoquer — (1,1) CANDIDAT_ENTRETIEN`,
    `ENTRETIEN (0,n) — integrer — (1,1) PARTICIPANT_ENTRETIEN`,
    `EVALUATION (0,n) — contenir — (1,1) ITEM_EVALUATION`.

## Fichiers concernés
- `src/diagrams/nouveau/mcd/entretiens_evaluation.ts`
- Aucun changement MLD/MPD (FK déjà présentes) ni de composant (RelationshipEdge non touché).
- Ce fichier de plan.

## Commits proposés (conventional commits)
1. `docs(plan): plan complet corrections MCD Entretiens & évaluation` — sauvegarde avant
   implémentation (point de rollback).
2. `fix(mcd): corrections associations et cardinalites Entretiens & évaluation` (diagramme ;
   lot 1 → 3, vérifiés un par un).
3. `build(mcd): artefacts dist` — selon la demande utilisateur.