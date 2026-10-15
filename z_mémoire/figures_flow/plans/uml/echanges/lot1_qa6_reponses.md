# Échange collab — Lot 1 sexies : séquence « Passer le quiz » → réponses (à envoyer à Claude)

> Suite de `lot1_qa5_reponses.md`. Mêmes conventions : squelette recopié,
> faits sourcés `fichier:ligne`, `NON TROUVÉ` en toutes lettres.
>
> **Squelette supposé : CONFIRMÉ à 95 %.** Corrections : pas d’endpoints
> façon `/quiz/start` — tout est `POST /applications/*` (tout-en-POST).
> Chaîne : `/verify-email/:token` (crée tentative PENDING + quizToken,
> puis +3s vers `/quiz/:id/:token`, ou `/suivre-candidature` sans quiz) →
> `get-quiz` → `save-quiz-answer` (par question) + `touch-quiz`
> (activité + anti-triche) → `complete-quiz`.

---

## Q1. FRONT : composants, services, navigations, chrono, fréquence touch

- `verify-email` : service `application.service.ts:248-267` (`POST
  /applications/verify-email`, `{user:1, data:{searchString:token}}`) ;
  composant `verify-email.ts:40-87` (token du `paramMap :26-38`). Succès
  `:55-71` : `quizToken ?? searchString` (`:57`), si quiz +3s →
  `/quiz/:applicationId/:quizToken` (`:63-65`, route `app.routes.ts:607-610`),
  sinon +3s → `/suivre-candidature` (`:68-70`). Échec `:45-49` (message),
  HTTP `404 → Token invalide ou expiré`, `400 → déjà utilisé` (`:78-83`).
- `get-quiz` : service `:275-295` ; composant `quiz.ts:179-241`
  (`ngOnInit` lit `paramMap`, `loadQuiz`, pas de navigation — écran intro
  `quiz.html:32-98`, bouton `startQuiz :94`). `startQuiz :243-256` :
  `handleUserActivity(true)`, `quizStarted`, listeners anti-triche +
  `enterFullscreen()` si requis (`:251-254`).
- `save-quiz-answer` : service `:300-333` (détournement de champs :
  `candidatePhone=questionId`, `candidateCvPath=answerId`, `:322-323`) ;
  composant `persistQuestionAnswer :793-823` (choix `:273`, commentaire
  `:333`, texte `:342`, navigation `:769-791` ; pas d’appel si rien à
  sauver `:776-779`). Navigation `goToNext :280-290` (dernière → `submitQuiz`),
  erreur bloquante `:803-808` (`abandonn|temps limite|déjà été complété|
  token invalide` → `handleBlockingQuizError :587-594`).
- `complete-quiz` : service `:341-361` ; composant `completeQuizRequest
  :373-418` (via `submitQuiz :300-303`), succès `:398-404` (compteurs,
  `quizCompleted`, **aucune navigation** — vue `quiz.html:225-247`, sortie
  manuelle `goHome :420-422` → `/`). Expiration → `handleTimeExpired
  :476-486` → `completeQuizRequest(true)`.
- **Chrono oui côté front** : `initializeCountdown :443-474`
  (`remainingTime = quizData.remainingTime ?? totalTimeAllowed-timeElapsed`,
  `setInterval 1s :459-473`, `0 → handleTimeExpired`), seuils danger ≤60s /
  warning (`:161-177`, chip `:122-126`).
- **`touch-quiz` : throttle 30 s** d’activité (`activityPingIntervalMs`,
  `quiz.ts:77`, `handleUserActivity :521-554`, `force` pour quiz/start/
  submit/flush) + **flush anti-triche 2 s** (`recordAntiCheatEvent
  :692-706` → `pending` → `flushAntiCheatEvents :708-715` →
  `handleUserActivity(true)`). Réponse : compteurs sync (`:547`), échec
  réseau = remise en file (`:549-553`, pas de perte).
- Écoutes : `pointerdown/keydown/mousemove/scroll/touchstart/focus/
  visibilitychange` (`:76,495-506`) ; anti-triche : `visibilitychange→hidden
  = TAB_SWITCH` (`:631-639`), `fullscreenchange = FULLSCREEN_EXIT +
  re-enter` (`:641-651`), `Ctrl+C/X/V = COPY_PASTE` + blocage (`:666-690`),
  raccourcis bloqués sans remontée (`:672-677`). `MULTI_SESSION` : **jamais
  émis côté front**.

## Q2. BACKEND par endpoint (ordre réel, repos, tables, réponse)

Repos injectés (`ApplicationsBusiness.java:66-120`) : `applications`,
`applicationQuizAttempt`, `quizAntiCheatEvent`, `appConfig`,
`candidateAnswer`, `emailVerificationToken`, `formQuestions`,
`formVersion`, `campaignForm`, `formBusiness`, `question`, `answer`,
`applicationProgressBusiness`, `applicationProgressRepository`,
`sourceToken`, `campaigns`. Contrôleur `ApplicationsController.java:
117-165`, 5 routes tout-POST, publiques (`SecurityConfig.java:31-35`).

- `verify-email` (`:1005-1154`) : searchString vide→400 (`:1015-1024`) ;
  token introuvable→404 (`:1031-1040`), déjà utilisé→400 (`:1045-1051`),
  expiré→400 (`:1054-1060`), mauvais type→400 (`:1063-1069`), sans
  candidature→404 (`:1072-1079`) ; `isUsed/UsedAt` (`:1082-1084`),
  `quizToken=UUID` (`:1088`), `createQuizAttemptForVerifiedApplication`
  (`:1092`, `:3434-3462` : insert `PENDING, screeningMode=NONE,
  manualCorrectionStatus=NOT_REQUIRED, timeElapsed=0` + snapshot timing) ;
  sans étape QUIZ → branche sans-quiz (`:1093-1115`, `emailVerified=true`,
  `quizToken=null`) ; sinon `emailVerified=true` (`:1118-1121`), 200
  (`:1136-1139`). Écrit : `email_verification_token`, `applications`,
  `application_quiz_attempt`. Renvoie : `id, trackingCode, quizToken,
  hasQuizStage + getFullInfos`.
- `get-quiz` (`:1287-1567`, `@Transactional`) : id/token→400 (`:1295-1315`,
  `resolveQuizToken :2626-2632`) ; `findOne` (`:1319`), `resolveQuizAttempt`
  (`:1320`), `validateQuizSessionAccess` (`:1321`), `enforceQuizInactivityPolicy`
  (`:1326`), `applyAntiCheatPolicyOnAccess` (`:1331`), `needsInitialization`
  (`:1345`), `isQuizResumable` (`:1346`, pas de reprise si tirage aléatoire
  + réponses + STARTED → **403** `:1352,1870-1883`), `PENDING→STARTED`
  (`:1358-1368`), `ensureQuizStageReady` (`:1369`, clôt CANDIDATURE `:3142`,
  QUIZ→IN_PROGRESS `:3167`), timing (`:1370`, expiré → `completeQuizInternal
  + 408 :1371-1374`), `touchQuizLastActivity` (`:1375`), init réponses
  (`:1381`, `formQuestions :1184`, `answer :1225`, inserts `is_selected=false`),
  boucle questions (`:1452-1513`, chrono `override ?? question ?? 10 :1475`,
  **sans `isCorrect`** `:1505`). Renvoie `quizData` (`:1520-1540`) : ids,
  `isTimed/resumable`, `totalTimeAllowed/timeElapsed/remainingTime`,
  `quizStatus`, questions, `antiCheat`.
- `save-quiz-answer` (`:1943-2175`) : id/question/token→400 (`:1951-1987`,
  `questionId ?? parse(candidatePhone)` `:1961-1965`) ; find/resolve/validate
  (`:1992-1994`), inactivité (`:1999`), anti-triche (`:2004`), stage ready
  (`:2009`), timing (expiré→408, `:2010-2014`) ; TEXT (`:2046-2065`) vs
  choix (appartenance vérifiée →400 `:2075-2083`, unicité SINGLE →400
  `:2085-2095`, **commentaire obligatoire →400** si requis `:2110-2118`,
  save si changé `:2120-2130`) ; `touchQuizLastActivity` (`:2137`) ; 200
  `Réponse sauvegardée` (`:2146-2149`).
- `touch-quiz` (`:2281-2338`) : id/token→400, find/resolve/validate,
  inactivité, anti-triche, stage ready, timing (408 si expiré), `touch`,
  résumés tentatives (`:2323-2325`), 200 `Activité quiz enregistrée`.
- `complete-quiz` (`:2188-2278`) : id/token→400, find/resolve/validate, pas
  d’anti-triche ici, formVersion requise (404 `:2229-2232`), inactivité,
  stage ready, timing, `completeQuizInternal` (`:2242`), `getFullInfos`
  (`:2249`), 200 (`complété` ou `Temps limite atteint…`, `:2251-2258`).

## Q3. ANTI-TRICHE : événements, enregistrement, seuils

- Types remontés : `TAB_SWITCH`, `FULLSCREEN_EXIT`, `COPY_PASTE`
  (+ `MULTI_SESSION` défini `:151` mais **jamais émis ni compté**).
- Enregistré : lignes `quiz_anti_cheat_event` (`eventType UPPER`,
  `occurredAt` parsé `dd/MM/yyyy HH:mm:ss` sinon now, metadata 500 car.,
  `persistAntiCheatEvents :2814-2851`) + compteurs `tab_switch_count` /
  `fullscreen_exit_count` (`:2845-2850`).
- Politique (`resolveAntiCheatPolicy :2785-2812`) : `app_config` + override
  campagne **sur `enabled` seul** (`:2807-2809`), seuils défaut 3/5
  (`:146-147`), modes WARN/FLAG/FAIL (`:143-145`).
- `tab_switch_max_warnings` (3) : **aucun effet serveur** (lu en `:157-168,
  2794, 2858`) — bannière front dégressive seule (`quiz.ts:578-584,721-729`).
- `tab_switch_max_actions` (5, `total = tab + fullscreen` `:2757`,
  COPY_PASTE ignoré) : WARN → rien (reste WATCHED) ; FLAG → `FLAGGED` +
  `cheatFlagCount++`, requête continue en 200 (`:2766-2768`) ; FAIL →
  `FAILED` + `completeQuizInternal` (clôture + scoring) + **403**
  `Tentative de triche détectée. Le quiz a été soumis automatiquement.`
  (`:2763-2781`). Bannière front `FAILED` (`quiz.ts:570-573`).

## Q4. TEMPS : expiration et contrôle serveur

- Snapshot (`applyQuizTimingSnapshot :2947-2960`, `ensureQuizTimingSnapshot
  :2962-2979`) : `timed/totalTimeAllowedSnapshot` (calcul
  `formBusiness.calculateTotalTimeAllowed :2940-2945`).
- `time_elapsed` = horloge murale, jamais décrémentée (`syncQuizTimeElapsed
  :3185-3216`, `max(stored, now-startedAt)`) ; `touchQuizLastActivity
  (:3022-2039)` : `startedAt ??= now`, `PENDING→STARTED`, `lastActivityAt=now`.
- `resolveQuizTimingState (:3218-3241)` : `(timed, total, elapsed clampé,
  restant, expired = clampé>=total)`.
- Expiration : `completeQuizInternal` **puis 408** `Temps limite dépassé.
  Le quiz a été soumis automatiquement.` sur get/save/touch (`:1371-1374`,
  `:2011-2014`, `:2312-2315`) ; complete renvoie 200 nuancé (`:2253-2255`).

## Q5. FIN DU QUIZ : score, statuts, manuel, emails

- `completeQuizInternal (:3243-3267)` : `startedAt ??= now`,
  `completedAt=now`, tentative **COMPLETED** (`:3255`), `refreshQuizScoringState`
  (`:3264`), `lockFormVersionIfNeeded` (`:3265`).
- Scoring (`evaluateQuiz :2407-2511`, `refresh :2378-2401`) : TEXT →
  manuel (`manualIsCorrect?+max`, sinon en attente) ; MULTIPLE → égalité
  exacte ; SINGLE/TRUE_FALSE → `isCorrect` ; `scorePercent=(score*100)/total`
  **entier tronqué** (`:2509`).
- `syncQuizProgressAfterScoring (:3464-3531)` : score posé (`:3482-3496`) ;
  tentative non-COMPLETED → stop (`:3498-3500`) ; **correction PENDING →
  stop, bascule QUIZ bloquée en IN_PROGRESS** (`:3502-3504`) ; seuil
  `passingScore` (config étape, défaut **50.0** `:207`, `:3511`) :
  `>=` → `passStage` (COMPLETED + étape suivante, `:3512-3519`) sinon
  `failStage` (FAILED + cascade SKIPPED si éliminatoire, `:3520-3527`).
- Correction manuelle : `manualCorrectionStatus NOT_REQUIRED/PENDING/
  COMPLETED` (`:2502-2507`) ; front affiche l’attente (`quiz.html:235-236`).
- **Emails/notifications à la complétion : NON TROUVÉ** (ni `sendEmail` ni
  `createInternalNotification` dans complete/scoring/sync/pass/fail).

## Q6. ERREURS par endpoint (champ `Response.httpCode`)

- Communs `validateQuizSessionAccess (:2701-2730)` : `404 Application non
  trouvée` (`:2703`), `403 Token de quiz invalide…` (`:2710`), `403 Veuillez
  vérifier votre adresse email…` (`:2714`), `403 …marquée comme abandonnée`
  (`:2718`), `404 Aucun formulaire associé` (`:2722`), `400 Ce quiz a déjà
  été complété` (`:2726`). Inactivité → **408** `…abandonnée après une
  période d’inactivité` (`:2930-2938`, `:210`). Triche FAIL → **403**.
- `verify-email` : 400 token vide (`:1022`), 404 token (`:1038`), 400 déjà
  utilisé (`:1049`), 400 expiré (`:1058`), 400 type invalide (`:1067`),
  404 candidature (`:1077`), 500 sauvegarde (`:1148`).
- `get-quiz` : 400 id/token (`:1301,1313`), + communs, 408 expiration,
  **403 tirage aléatoire non reprenable** (`:1879-1882`), 404
  source/campagne/formulaire/questions (`:1397,1408,1422,1435`), 500 (`:1561`).
- `save-quiz-answer` : 400 id/question/token (`:1957,1973,1985`), +
  communs/inactivité/triche/408, 404 question/réponses (`:2029,2040`),
  400 hors-formulaire (`:2081`), 400 réponse unique (`:2093`), 400
  commentaire obligatoire (`:2116`), 400 nombre invalide (`:2160`), 500 (`:2169`).
- `complete-quiz` : 400 id/token (`:2202,2214`), + communs/inactivité (pas
  d’anti-triche), 404 formulaire (`:2231`), 500 (`:2272`).
- `touch-quiz` : 400 id/token (`:2286,2290`), + communs/inactivité/
  anti-triche/408.
- Étape non démarrée : **jamais refusée** (`ensureQuizStageReady :3155-3175`
  auto-active).

## Q7. ASYNCHRONE / SCHEDULER dans le parcours

- `@Async` : **NON TROUVÉ** sur tout le backend. Envois 100 % synchrones.
- `@Scheduled(fixedRate=60000) abandonInactiveQuizApplications
  (:2340-2360)` : toutes les 60 s, `findByQuizStatusAndApplicationNotAbandoned
  (STARTED,false)` (`:2343`), défaut inactivité 15 min (`:208`) ou
  `pipelineStage.inactivityTimeoutMinutes` (`:2981-2994`), réf
  `lastActivityAt ?? startedAt ?? progress.startedAt ?? updatedAt`
  (`:3009-3020`) → `applicationAbandoned=true` + progress **FAILED**
  `Quiz abandonné pour inactivité` (`:3073-3115`). Activé par
  `@EnableScheduling` (`QuizappApplication.java:10`).
- Hors parcours : `CampaignLifecycleScheduler.java:41` (300 s),
  `QeelWebSocketHandler.java:61` (10 s), `UserManagmentBusiness.java:696`
  (60 s).

## Q8. Incohérences (réalité → attendu — à verser au registre si suivi)

1. `max_warnings` sans effet serveur (bannière seule) → forçage FAIL-like
   ou renommage en seuil d’affichage.
2. `totalEvents` ignore COPY_PASTE/MULTI_SESSION (`:2757`) ; MULTI_SESSION
   jamais émis → un copieur intensif ne déclenche jamais FAIL.
3. Override campagne partiel (`enabled` seul `:2807-2809`).
4. `completeQuiz` sans `applyAntiCheatPolicyOnAccess` (vs get/save/touch).
5. `resolveQuizTimingState` rappelé sans usage (`saveQuizAnswer:2138`).
6. Bannière front optimiste (incrément local `:703` écrasé par serveur
   `:562-563`).
7. `isQuizSessionBlocked (:745-751)` ne couvre pas le message triche → 403
   silencieuse via save sans `blockOnError`.
8. `scorePercent` entier tronqué (`:2509`, ex. 1/6→16).
9. `screeningMode=NONE` initial (`:3452`) vs défaut WARN, corrigé au 1er
   accès (`:2759`).
10. `quiz.html:82` « le chrono démarre à l’ouverture » vs `quizStarted` au
    bouton alors que le back compte depuis `get-quiz/touch` — écart si
    attente sur l’intro.
