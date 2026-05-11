# Livrable I — Audit sécurité (OWASP Top 10 2021)

**Date :** 2026-05-11
**Statut :** ✅ Complet (audit niveau plan ; tests pénétration hors scope)

---

## I.1 — A01 : Broken Access Control

- [ ] 🔴 **CRITIQUE [BACK — sécurité]** : naming rôle incohérent entre enum (`UserRole.SUPER`), `@PreAuthorize('SUPER_ADMIN')`, FRONT (`UTILISATEUR`). **Risque** : un `@PreAuthorize` qui ne matche jamais ouvre ou ferme par erreur un endpoint.
- [ ] 🔴 **CRITIQUE [BACK — sécurité]** : `QuestionController` autorise `UTILISATEUR` (valeur fantôme non présente en enum Java) — comportement réel à clarifier.
- [ ] 🔴 **HAUTE [FRONT — sécurité]** : routes `/dashboard/entities/*` toutes gardées par `MANAGE_APP_CONFIG` — un user avec cette unique perm peut éditer 38 tables. **Découper par entité.**
- [ ] 🟠 **MOYENNE [BACK]** : auditer chaque controller pour `@PreAuthorize` absent + confirmer que la couche Business vérifie `EntityPermission` (pas uniquement le controller).
- [ ] 🟠 **MOYENNE [BACK]** : `application.candidate_email` — vérifier qu'un candidat ne peut accéder qu'à ses propres applications (autorisation row-level via `candidate_token`).
- [ ] 🟠 **MOYENNE [FULL-STACK]** : confirmer que tous les endpoints `getByCriteria` filtrent par `is_deleted=false` par défaut (sinon IDOR sur lignes "supprimées").

---

## I.2 — A02 : Cryptographic Failures

- [ ] 🟠 **MOYENNE [BACK]** : auditer l'algorithme de hash mot de passe (`user.password`) — doit être **BCrypt / Argon2**.
- [ ] 🟠 **MOYENNE [BACK]** : auditer le JWT — algo `HS256` minimum, secret ≥ 256 bits, pas de `alg=none`.
- [ ] 🟠 **MOYENNE [BACK]** : `quiz_token`, `candidate_token`, `email_verification_tokens.token` — confirmer génération via `SecureRandom` (CSPRNG), longueur ≥ 32 chars.
- [ ] 🟠 **MOYENNE [BACK — config]** : `smtp_config.password` — stocké chiffré en BD ou en clair ? Doit être chiffré.

---

## I.3 — A03 : Injection

### SQL
- [x] 🟢 **OK** : Spring Data JPA + JPQL paramétré → protégé contre SQL injection par défaut.
- [ ] 🟠 **À AUDITER [BACK]** : Custom repos `_<Entity>Repository.java` — si du SQL natif est utilisé, vérifier paramétrage strict.
- [ ] 🟠 **À AUDITER [BACK]** : système de critères dynamiques (`OperatorEnum` EQ/NEQ/GT/LT/CONTAINS) — si concaténation de strings côté criteria-builder, risque.

### XSS
- [ ] 🔴 **HAUTE [BACK — Thymeleaf]** : templates email Thymeleaf — vérifier que les variables candidat (`th:text` et non `th:utext`) sont bien échappées. *Risque XSS stocké si recruteur reçoit un email contenant `<script>` injecté via `candidate.name`.*
- [ ] 🟠 **MOYENNE [FRONT]** : Angular protège par défaut (`{{ }}` échappe HTML) — vérifier qu'aucun `[innerHTML]` n'est utilisé sans sanitization (notamment dans `email-editor`).

### Path traversal
- [ ] 🟠 **MOYENNE [BACK]** : endpoint `/files/upload/cv` — vérifier validation du nom de fichier (no `../`), extension whitelistée (PDF/DOC/DOCX), taille max.

---

## I.4 — A04 : Insecure Design

- [ ] 🟠 **MOYENNE [BACK — quiz]** : `quiz_token` est-il à usage unique ? Anti-rejeu ? Rate-limiting ?
- [ ] 🟠 **MOYENNE [BACK — auth]** : tentatives login répétées — rate-limiting / lockout ?
- [ ] 🟠 **MOYENNE [BACK — invitation_code]** : `validate` endpoint — rate-limit pour empêcher brute-force ?

---

## I.5 — A05 : Security Misconfiguration

- [ ] 🔴 **HAUTE [BACK — debug]** : `GET /userDebug/roles-debug` exposé en debug — à supprimer en prod.
- [ ] 🟠 **MOYENNE [BACK]** : auditer `SecurityConfig.cors()` — origines autorisées explicites (pas `*` en prod).
- [ ] 🟠 **MOYENNE [BACK]** : headers HTTP (HSTS, X-Frame-Options, X-Content-Type-Options, CSP) — configurés ?
- [ ] 🟠 **MOYENNE [BACK]** : Spring `actuator` exposé ? endpoints sensibles (`/env`, `/heapdump`) protégés ?
- [ ] 🟠 **MOYENNE [FULL-STACK]** : `application.properties` ne contient pas de secrets en clair en prod (utiliser variables d'environnement).
- [ ] 🟠 **MOYENNE [FRONT]** : `merise` page (debug) — exposée en prod ? Devrait être désactivée par config.

---

## I.6 — A06 : Vulnerable & Outdated Components

- [ ] 🔵 **[BACK]** : `mvn dependency:tree` + `mvn versions:display-dependency-updates` + scan CVE (`mvn org.owasp:dependency-check-maven:check`).
- [ ] 🔵 **[FRONT]** : `npm audit` + `npx ng update`.
- [ ] 🔵 **[FULL-STACK]** : Dockerfile et `docker-compose.yml` — images base récentes ?

---

## I.7 — A07 : Identification & Authentication Failures

- [ ] 🟠 **MOYENNE [BACK]** : politique mot de passe (longueur min, complexité) côté création User ?
- [ ] 🟠 **MOYENNE [BACK]** : reset password — token à durée limitée, single-use, lié à user.
- [ ] 🟠 **MOYENNE [BACK]** : email_verification_tokens — `consumed_at` (single-use) ? expiration ?
- [ ] 🟠 **MOYENNE [BACK]** : session JWT — rotation refresh token (`refreshable=true` ?), blacklist sur logout.

---

## I.8 — A08 : Software & Data Integrity Failures

- [ ] 🔵 **[BACK]** : déploiement — vérification d'intégrité des artefacts (signature, checksum).
- [ ] 🔵 **[BACK]** : `form_version.is_locked` — empêche modification post-publication ; vérifier qu'aucun endpoint ne bypasse ce verrou.

---

## I.9 — A09 : Security Logging & Monitoring Failures

- [x] 🟢 **OK** : `LoggingAspect` présent côté BACK.
- [ ] 🟠 **MOYENNE [BACK]** : logs structurés (JSON) ? Centralisation (ELK/Loki) ?
- [ ] 🟠 **MOYENNE [BACK]** : événements sécurité loggés : login échoué, accès refusé, élévation de privilège, modification permissions, suppression entité, accès données sensibles.
- [ ] 🟠 **MOYENNE [BACK]** : pas de logs de mots de passe / tokens / PII en clair.

---

## I.10 — A10 : Server-Side Request Forgery (SSRF)

- [ ] 🟠 **MOYENNE [BACK — SMTP]** : `smtp_config.host` est paramétrable — un admin malveillant pourrait pointer vers un host interne. Whitelist ou block IPs privées.
- [ ] 🔵 **[BACK — Minio]** : `MinioConfig` — endpoint hardcodé en conf ? Pas configurable utilisateur.

---

## I.11 — Spécificités métier quizapp

### Vol de quiz / triche
- [ ] 🟠 **MOYENNE [BACK]** : `quiz_token` partagé entre candidats — protection ?
- [ ] 🟠 **MOYENNE [BACK]** : limite tentatives quiz par candidature (`campaigns.max_apply`) — appliquée ?
- [ ] 🟠 **MOYENNE [BACK]** : `quiz_timer_start` / `quiz_timer_lock_expires_at` — peut-on déclencher côté serveur uniquement (pas de paramètre côté client) ?

### Vol de CV / RGPD
- [ ] 🟠 **MOYENNE [BACK — RGPD]** : suppression effective des données candidat (right to be forgotten) — soft-delete suffit-il ? Anonymisation ?
- [ ] 🟠 **MOYENNE [BACK — RGPD]** : `legal_text` versionné — consentement candidat horodaté ?
- [ ] 🟠 **MOYENNE [BACK — RGPD]** : stockage CV (`uploads/cv/`) — chiffrement at-rest ? Accès par URL signée Minio seulement ?

### Manipulation pipeline
- [ ] 🟠 **MOYENNE [BACK]** : endpoints `advance`/`fail`/`skip`/`rollback` — vérifier permissions (un recruteur sans droit ne peut pas rollback une décision finale).

---

## I.12 — Synthèse sécurité priorisée

### CRITIQUE (action immédiate)
1. Harmoniser naming rôles (`UserRole`) — risque de bypass autorisation.
2. Découper permissions routes FRONT (`MANAGE_APP_CONFIG` trop large).
3. Supprimer ou wrap `GET /userDebug/roles-debug` en prod.
4. Auditer escape Thymeleaf dans templates email (XSS).

### HAUTE
5. Auditer génération + invalidation de tous les tokens (quiz, candidat, source, email).
6. Auditer hash password + algo JWT + secrets.
7. Rate-limiting login, quiz, invitation-code validation.

### MOYENNE
8. Validation upload CV (extension, taille, path traversal).
9. Headers HTTP sécurité + CORS strict.
10. Logs sécurité (login échec, élévation, suppression).
11. RGPD : suppression effective + chiffrement CV.

### Audits techniques
12. `mvn org.owasp:dependency-check-maven:check` + `npm audit`.
13. Tests d'intrusion ciblés (quiz_token brute-force, IDOR sur applications).
