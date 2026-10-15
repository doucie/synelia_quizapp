# Échange collab — Lot 1 : UC candidat (à envoyer à Claude)

> Protocole : l’intermédiaire copie ce brief à Claude. Claude dessine et
> rend **un SVG + sa palette déclarée** ; ses questions éventuelles sont
> recopiées ci-dessous (§ Questions), les réponses y sont ajoutées, puis le
> tout lui est renvoyé. Le SVG livré est déposé dans
> `src/diagrams/uml/claude/` et intégré TEL QUEL (`ClaudeSvgNode` +
> `recolor`, voir `src/utils/umlRecolor.ts`).

## Ce que Claude doit dessiner

Un diagramme de cas d’utilisation « Parcours candidat », 9 cas, d’après
son `cas_utilisation_candidat.svg` (qu’il a déjà), **corrigé** comme suit :

1. Acteurs : **Candidat** (gauche, principal) + **Serveur SMTP** (droite,
   secondaire, relié à « Vérifier son email » uniquement).
2. Cas (9) : Postuler à une campagne / Vérifier son email / Passer le quiz
   / S’authentifier par code / Détecter une triche / Répondre à l’invitation
   / Proposer une autre date / Demander un changement / Retirer sa candidature.
3. Relations : Passer → Vérifier (`include`) ; Passer → Code (`include`) ;
   Détecter → Passer (`extend [anti-triche activé]`) ; Proposer → Répondre
   (`extend [autre date souhaitée]`) ; Demander → Code (`include`) ;
   Retirer → Code (`include`). Associations pleines sans flèche pour le reste.
4. Sens imposés : `include` base → inclus ; `extend` extension → base.

## Faits projet (vérifiés sur le code — sourcés, à ne pas réinventer)

- Rôles réels : SUPER_ADMIN, ADMIN, RECRUITER, CANDIDATE
  (`quizapp/.../utils/enums/UserRole.java:8-12`). Pas de rôle Évaluateur
  (c’est une permission d’entité + participation entretien,
  `EvaluationsBusiness.java:801-829`).
- Candidat sans permissions système : que des endpoints publics
  (`SecurityConfig.java:29-40` : create, verify-email, get-quiz,
  save-quiz-answer, complete-quiz, touch-quiz, withdraw, track,
  respond-interview, submit-ask).
- Code de suivi : 6 majuscules + email (`ApplicationsBusiness.java:
  4186-4207`) ; exigé avec l’email pour retrait (`:3838-3883`), demande
  (`submitTrackedCandidateAsk`), suivi quiz (`:2725`).
- Email exigé avant le quiz (`validateQuizSessionAccess`,
  `ApplicationsBusiness.java:2701`) ; la vérification crée la tentative.
- Anti-triche réel et configurable (`app_config.anti_cheat_enabled`,
  override campagne ; événements TAB_SWITCH / FULLSCREEN_EXIT / COPY_PASTE
  via `touch-quiz`, politiques WARN/FLAG/FAIL).
- Emails 100 % synchrones (aucun `@Async`) ; SMTP externe configurable en
  base, **inactif par défaut** (`smtp_config`, port 587, STARTTLS) — tout
  scénario avec email suppose « config SMTP active ».
- Retrait volontaire = abandon niveau candidature + notification interne
  aux recruteurs (`APPLICATION_WITHDRAWN`) ; demandes = IDENTITY / EMAIL /
  PHONE (`CandidateAskRequestType.java:3-6`).

## Contraintes SVG (intégration `figures_flow`, mémoire imprimé)

- `<text>` réel (jamais vectorisé), police au choix (remplacée par
  Cabinet Grotesk à l’intégration).
- **Palette réduite et déclarée** en tête de réponse (chaque couleur
  listée avec son usage) — toute couleur non déclarée bloque l’intégration.
- Pas de `var()` CSS non défini ; textes secondaires bien contrastés
  (≥ 14 px si gris) ; pastilles `«include»` / `«extend [condition]»`
  lisibles ; ellipses sans rognage de libellé.
- `viewBox` explicite, fond blanc ou transparent, pas de dépendance
  externe (pas de `<img>`, pas de font web).

## Livrable attendu

1. Le fichier `uc_candidat.svg`.
2. La palette déclarée (couleur → usage).
3. Les éventuelles questions ci-dessous.

## Questions de Claude → réponses

*(vide — à remplir au fil des allers)*
