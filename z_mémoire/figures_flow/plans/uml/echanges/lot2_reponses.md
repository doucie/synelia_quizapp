# Échange collab — Lot 2 : campagne, architecture, déploiement → réponses (à envoyer à Claude)

> Mêmes conventions : questions recopiées, faits sourcés `fichier:ligne`,
> `NON TROUVÉ` en toutes lettres, aucun secret (ni mot de passe, ni clé),
> rien d’inventé. Interprétation logique signalée quand le code est
> incohérent (réalité PUIS attendu).

---

## A. CAMPAGNE — table des transitions

Enum : `DRAFT, PENDING, OPEN, PAUSED, CLOSED`
(`quizapp/.../utils/enums/CampaignStatus.java:3-8`). Colonne
`campaign_status NOT NULL` (`dao/entity/Campaigns.java:58-59`) + indicateur
`isArchived` (booléen **hors statut**, voir archive). Matrice
`canTransitionTo` (`:20-35`) : DRAFT→PENDING/OPEN/CLOSED ;
PENDING→OPEN/DRAFT/CLOSED ; OPEN→PAUSED/DRAFT/CLOSED ;
PAUSED→OPEN/DRAFT/CLOSED ; CLOSED→DRAFT/PENDING/OPEN.

| Source | Cible | Événement déclencheur | Condition / garde (prérequis) | Effets de bord | Fichier:ligne |
|---|---|---|---|---|---|
| DRAFT | PENDING | `POST /campaigns/publish` | Début futur (`resolveDraftPublicationTargetStatus :701-707`) + spécialité + template + ≥1 formulaire (`:742-756`), dates cohérentes (`:765-769`) | Statut + `updatedAt/By` | CampaignsBusiness.java:735-780 |
| DRAFT | OPEN | `POST /campaigns/publish` | Début passé/absent + mêmes prérequis | Idem | :701-707,:735-780 |
| Quelconque | OPEN | `POST /campaigns/open` | Aucun prérequis codé | `isPublished=true`, `campaignStart=now` (`:788-790`) | :782-798 |
| Quelconque | CLOSED | `POST /campaigns/close` | Aucun | `campaignEnd=now`, `isPublished=false` (`:806-808`) | :800-816 |
| OPEN | PAUSED | `POST /campaigns/pause` | Campagne démarrée ; date de reprise (si fournie) future et < fin (`:830-847`) | Statut (+ `campaignStart`=reprise si fournie `:848`) | :818-859 |
| PAUSED | OPEN | `POST /campaigns/resume` | Aucun | `isPublished=true` (`:867`) | :861-876 |
| Quelconque | (dépublié) | `POST /campaigns/unpublish` | Aucun | `isPublished=false` + `applyDerivedStatus` (`:884-885`, cible NON VÉRIFIÉE en détail) | :878-893 |
| DRAFT/CLOSED (non publié) | (archivé, statut inchangé) | `POST /campaigns/archive` | `isPublished=false` sinon refus « Depubliez-la d’abord » (`:901-904`) | `isArchived=true`, **statut inchangé** (`:906`) | :895-914 |
| (archivé) | (désarchivé, statut inchangé) | `POST /campaigns/unarchive` | Aucune | `isArchived=false`, statut inchangé (`:922`) | :916-930 |
| PENDING | OPEN | **Scheduler** 300 s (`CampaignLifecycleScheduler:41`) | `campaign_start <= today` (`:84-88`) | `isPublished=true` (`:85`), `updatedBy=0` (système, `:60`) | :78-89 |
| OPEN | CLOSED | **Scheduler** | `campaign_end < today` **OU quota `max_apply` atteint** (`countByCampaignId`, `:91-101`) | `isPublished=false` (`:92,98`) | :90-103 |
| PAUSED | CLOSED | **Scheduler** | `campaign_end < today` (`:105-108`) | `isPublished=false` (`:106`) | :104-110 |
| Quelconque | Quelconque | `POST /campaigns/update` (CRUD) | `UPDATE_CAMPAIGNS` | **Contourne la matrice** (statut libre) — point logique : la matrice ne vaut que pour les endpoints dédiés | Controller + factory |

- Scheduler : `@Scheduled(fixedRate=300000)` (`:41`), `@Transactional`
  (`:42`), candidats `findTransitionableCampaigns` (`:44`), DRAFT jamais
  touché (doc `:27`, `default→null :111`), garde `canTransitionTo` (`:57`),
  `saveAll` (`:73`).
- Transitions de la matrice **non observées** dans les endpoints lus :
  toutes les cibles `DRAFT` (aucun endpoint ne pose DRAFT sauf
  `applyDerivedStatus` de `unpublish`, cible non détaillée), `CLOSED→PENDING`
  (aucun endpoint ; `resume` ne vise que OPEN). À modéliser comme chemins
  théoriques (matrice) ou à omettre — pas comme flux codés.

## B. ARCHITECTURE — composants

### B.1 Backend : packages (`quizapp/src/main/java/tech/synelia/quizapp/`)

Organisation en **couches par entité** (pattern Telosys), pas en modules
domaine. Dépendances : `rest/api → business → dao/repository →
dao/entity`, `utils/*` partout, `security/config` par injection.

| Package | Rôle | Témoin |
|---|---|---|
| `business/` (50 `*Business`) | Logique métier, transactions | `ApplicationProgressBusiness.java:34-37` importe `ApplicationProgressRepository, MailLogRepository` |
| `rest/api/` (47 contrôleurs) | Exposition tout-en-POST `{user,datas[]}` | `ApplicationsController.java:30` importe `ApplicationsBusiness` |
| `rest/fact/` | Fabrique générique (contrôle + pagination) | `ControllerFactory.java:30` importe `BusinessFactory` |
| `dao/entity/` | Mapping JPA | `Applications.java:64` `@Column(candidate_cv_path)` |
| `dao/repository/` (+ `customize/`) | Spring-Data + `@Query` / critères | `ApplicationsRepository.java:16,27,87` |
| `security/` | JWT, chiffrement (AES/RSA maison, BCrypt) | `JwtService.java:17`, `JwtAuthenticationFilter.java:27` |
| `config/` | Beans transverses | `SecurityConfig.java:18` (filtre JWT), `MinioConfig.java:6`, `WebSocketConfig.java:9`, `MailConfig.java:14` |
| `user/managment/` | Connexion legacy Telosys | `UserManagmentBusiness.java:34,38` |
| `utils/` (+ `dto/transformer/enums/contract`) | Contrats `Request/Response`, DTO, enums, helpers | `Utilities.java:31` (BCrypt) |
| `websocket/` | Push temps réel (QEEL) | `QeelWebSocketHandler.java:14` importe `OnlineStatsBusiness` |

### B.2 Bibliothèques (`quizapp/pom.xml`, Java 21, WAR)

`spring-boot-starter-parent 3.5.6` (`:9`, BOM) ; `spring-boot-starter-security`
(`:57`, auth/BCrypt/rôles) ; `jjwt-api/impl/jackson 0.12.6` (`:276-289`,
JWT) ; `spring-boot-starter-data-jpa` (`:216`, Hibernate) ;
`flyway-core` + `flyway-mysql` (`:222-227`, ~85 migrations
`db/migration`) ; mail : `thymeleaf` (`:177`, templates),
`spring-context-support` (`:181`, `JavaMailSender`), `jakarta.mail 2.0.1`
(`:186`, SMTP) ; `spring-boot-starter-data-redis` (`:245`) + `jedis`
(`:249`, cache/sessions) ; `minio 8.6.0` (`:260`, objet S3) ;
`mapstruct 1.5.5.Final` (`:34,93`, Entity↔DTO) ; `lombok` (`:35`) ;
`springdoc-openapi 2.2.0` (`:147`, Swagger) ; `spring-boot-starter-websocket`
(`:50`, QEEL) ; `poi 5.4.0` (`:134-141`, Excel) ; `okhttp 4.10.0` (`:126`,
client HTTP).

### B.3 Frontend Angular

- Version : **Angular 20.2.0** (`@angular/core:common:compiler:forms:
  platform-browser:router ^20.2.0`), TypeScript ~5.9.2, RxJS 7.8,
  `quizapp_front/package.json:27,46`.
- Dossiers `src/app/` : `pages/` (apply-position, campaigns, connexion,
  dashboard, home, inscription, mot-de-passe-oublie, quiz,
  track-application, verify-email), `core/` (constants, guards,
  interceptors, interfaces, models, services, utils), `shared/`,
  `components/`, `pipes/`, `directives/`, `services/`.
- Services API (`core/services/*.service.ts`, ~57) : `ApiService` (gabarit
  legacy `:9`), `ApplicationService` (`:154`), `AuthService`
  (`auth/auth.service.ts:21`, token localStorage `:225-226`), `NotificationService`
  (`:67`), `FileService` (`:20`), `campaign/permission/smtp-config/
  mail-log-crud/online-stats/connexion.service`, `source-token.service`
  (hors core, pour le guard).
- Guards : `authGuard`/`noAuthGuard` (`auth.guard.ts:9,40`),
  `permissionGuard([...])` (AU MOINS UNE, bypass SUPER, `:56`),
  `campaignViewGuard` (`:84`), `campaignEditGuard` (`:126`),
  `interviewCreateGuard` (`:166`), `roleGuard` (rôle via `route.data`,
  `:215-230`), `sourceTokenGuard` (format 6 + validation API, `:10-33`).
- **Intercepteur** `core/interceptors/api.interceptor.ts:41` :
  `Authorization: Bearer` après `isTokenExpired` (`:63`), `401→/connexion`
  (`:81`), `403` (`:88`), `0 → backend 8085 inaccessible` (`:93`),
  `500` (`:98`), `""→null` (`cleanFormData :67`).

### B.4 Intégrations externes

- MySQL : version serveur exacte **NON TROUVÉE** (driver
  `com.mysql.cj.jdbc.Driver`, dialecte `MySQLDialect`
  (`application-local.properties:5,11-12`), connecteur managé
  (`pom.xml:83-85`), `ENGINE=InnoDB CHARSET=utf8mb4` (`V1_001:31`),
  `jdbc:mysql://localhost:3306/quizapp_db` (`pom.xml:361`)).
- SMTP : clés seules, sans valeurs (`spring.mail.host/port/username/
  password`, `smtp.mail.adresse/host/port/password`, STARTTLS).
- CV : **disque local, pas MinIO** — `FileController.java:44`
  (`@Value app.upload.dir`), `:122` `Paths.get(uploadDir)`, `:139`
  `Files.copy`, `:142` chemin relatif persisté, `:185` lecture même
  dossier. `MinioConfig` non importé par `FileController`.
  `candidateCvPath` = simple chaîne (`Applications.java:64-65`).
- WebSocket QEEL : présence temps réel (`QeelWebSocketHandler.java:61`
  broadcast 10 s, `/ws/qeel` `WebSocketConfig.java:24`,
  `GET /api/qeel/stats|health`).

### B.5 Authentification

- JWT : `JwtService.java:29` (génération), `:49` (claims), `:57`
  (validité) ; `JwtAuthenticationFilter.java:38-59` (`Bearer`, rôles
  `ROLE_*` + cascade SUPER→ADMIN→RECRUITER) ; mots de passe BCrypt (12)
  + fallback SHA1 (`Utilities.java:281-289`,
  `UserManagmentBusiness.java:125-133`).
- Endpoint : `POST /userManager/connexion`
  (`UserManagmentController.java:48-50`, session JWT `:191`).
- Config : `SecurityConfig.java:51-53` (CSRF off, CORS, stateless),
  whitelist `:56-65`, `anyRequest.authenticated()` (`:69`), CORS
  `http://localhost:4200, http://localhost:8085` (`:81-84`).

## C. DÉPLOIEMENT

### C.1 Dockerfile, compose, CI/CD, nginx/Apache

- **Dockerfile : NON TROUVÉ** (glob vide). **CI/CD : NON TROUVÉ**
  (`.github/` sans workflows). **nginx/Apache : NON TROUVÉ.**
- `docker-compose.yml` (`:1-34`) : **2 services seulement** (pas de
  replicas) — `redis:7-alpine` (`6379:6379`, volume `redis_data`),
  `minio/minio:latest` (`9000:9000` S3 + `9001:9001` console, volumes
  `minio_data`). Pas de MySQL/backend/front conteneurisés.

### C.2 Processus, ports, communication (tout local, 1 nœud)

| Processus | Port | Protocole/lien |
|---|---|---|
| Angular (`ng serve --proxy-config proxy.conf.json`) | :4200 | Navigateur → :4200 ; `/api/**` proxifié → :8085 (`proxy.conf.json`, `environment.ts:3` `apiUrl http://localhost:8085`) — **pas de reverse proxy** |
| Spring Boot (`mvn spring-boot:run`, `start-backend.bat:1-5`) | :8085 (`application-local.properties:54` ; :8080 seulement template générique `filtered/`) | REST JSON tout-en-POST |
| MySQL externe | :3306/JDBC (`TelosysTools/databases.dbcfg:3`, `pom.xml:361`) | JPA/Hibernate, `ddl-auto=validate`, Flyway |
| Redis | :6379 (`application-local.properties:57-58`, défauts localhost) | Jedis, cache/sessions |
| MinIO | :9000 S3 + :9001 console | Client 8.6.0 (non utilisé pour les CV) |
| SMTP externe | 587/STARTTLS (défauts DDL/config, non seedé) | JakartaMail synchrone |

### C.3 Où est servi le front, comment atteint-il l’API

- Dev : `ng serve` sur :4200 ; proxy de dev vers :8085 (pas de nginx).
  Prod packagée : **NON TROUVÉ** (WAR sans front embarqué observé).
- CORS explicite 4200 + 8085 (`SecurityConfig.java:81-84`).

### C.4 Environnements (sans secrets — clés seules)

- Fichiers : `application.properties` (`profiles.active=local`,
  `app.upload.dir=uploads/cv`), `application.yml` (multipart, consul
  inexploité), `application-local.properties` (JDBC local, JPA, flyway,
  mail, Redis, JWT, `:8085`), `filtered/application*.properties`
  (templates `@...@`, Hikari, `:8080`), variantes `dev/staging/prod/local`
  (`demo_db` vs `quizapp_db`).
- Diffèrent : profils (`pom.xml:300-327` local/development/staging/
  production), URL base (clés `spring.datasource.url/username`, jamais de
  mot de passe ci-dessous), ports (8085 vs 8080), SMTP (clés gmail vs
  synelia, `:587` les deux).

### C.5 CV et logs

- CV : **fichier sur disque** `uploads/cv` (`app.upload.dir`), seul le
  chemin relatif en base (`candidateCvPath`, `FileController.java:142`) ;
  candidature anonyme = chaîne optionnelle, pas de fichier.
- Logs appli : **console** (`log.info`, `LoggerFactory`, niveaux
  `INFO/DEBUG/WARN` `application-local.properties:42-51`) ; **aucun
  appender fichier trouvé**. Logs métier : table `mail_log`
  (`V1_040`, `MailLog.java`, statuts `SENT/CANCELLED`) pour les emails.
