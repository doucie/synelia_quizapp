# Échange collab — Lot 2 bis : Redis, MinIO, WAR, mémoire, lancement (à envoyer à Claude)

> Mêmes conventions : questions recopiées, faits sourcés `fichier:ligne`,
> `NON TROUVÉ` en toutes lettres, aucun secret, rien d’inventé.

---

## Q1. Redis : usages réels

> Cherche RedisTemplate, StringRedisTemplate, @Cacheable, @EnableCaching, spring.session et Jedis dans tout le code Java. Donne chaque usage réel, ou NON TROUVÉ.

- `@EnableCaching` + `RedisCacheManager` : `quizapp/.../config/
  CacheConfig.java:16-20` (`RedisConnectionFactory` injectée `:11`).
- **Un seul usage** : `@Cacheable("qeelStats")`
  (`business/OnlineStatsBusiness.java:32`) — cache des stats de présence QEEL.
- `RedisTemplate`, `StringRedisTemplate`, `spring.session.*`, usage direct
  de Jedis (hors dépendance pom `jedis`, `:249`) : **NON TROUVÉ**.
- **Donc : Redis = cache des stats QEEL uniquement.** Pas de sessions
  partagées, pas de cache métier, pas de coordination via Redis dans le code.

## Q2. MinIO : usages réels

> Cherche MinioClient et toute injection de MinioConfig.

- Bean défini : `MinioClient.builder().endpoint(...)` dans
  `config/MinioConfig.java:23-26` (clés `minio.access.name/secret/url`
  `:15-20`, `minio.bucket.name/minio.default.folder`
  `ParamsUtils.java:86-89`).
- **Appelant de `generateMinioClient()` : NON TROUVÉ** (aucune injection
  `MinioConfig` / `MinioClient` dans le code). Bean orphelin : compose
  lance MinIO (`:9000/9001`), mais les CV passent par **disque local**
  (`uploads/cv`, `FileController.java:122-142`).

## Q3. Packaging WAR : ServletInitializer et exécution

> Le pom produit un WAR. Y a-t-il un SpringBootServletInitializer ? Où est-il censé tourner (Tomcat externe ou Spring Boot embarqué) ?

- Oui : `quizapp/.../ServletInitializer.java:1-13` (`extends
  SpringBootServletInitializer`, `configure → QuizappApplication.class`)
  — packaging `war` (`pom.xml:15`) : **déploiement sur Tomcat externe
  possible**.
- Usage constaté : **embarqué** — `mvn spring-boot:run`
  (`start-backend.bat:1-5`, `README.md:53`), `backend.log` : Tomcat embedded
  (`o.a.c.c.C.[Tomcat].[localhost]`, `nio-8081-exec`).
- Interprétation : WAR prévu pour un externe (production future),
  exploité en embarqué en développement. À dessiner : nœud « Spring Boot
  (JAR/WAR embarqué en dev, déployable Tomcat externe) », pas un Tomcat
  externe acquis.

## Q4. Mémoire : déploiement, hébergement, architecture existants (anti-doublon)

> Que dit-on du déploiement, de l'hébergement et de l'architecture ? Titres de sections et figures existantes, pour éviter un doublon.

- **§ Architecture globale du système** (`body.typ:606-619`,
  `ref-archi`) : texte couches (Angular / Spring / MySQL+Flyway /
  Redis+MinIO+emails, Clean Architecture) + **2 figures déjà en place** :
  - `captures/6-architecture/Architecture 1 – Acteurs, Frontend Angular & API REST.png` (`:610-611`).
  - `captures/6-architecture/Architecture 2 – Services métier, persistance & infrastructure.png` (`:614-615`, SMTP, MinIO, Redis).
- **⚠️ Un nouveau diagramme de composants ferait doublon** avec
  Architecture 1/2 : recommandation = **vérifier ces 2 PNG d’abord**
  (s’ils sont justes, abandonner le composants OU les remplacer
  proprement — pas les deux).
- § Exécution locale et chaîne DevOps (`:1263-1284`, table services
  `:1271-1278`) + **fig. 16 `memoire-deploiement-local.svg`** (topologie
  hôte vs Compose) : un diagramme de déploiement UML serait aussi un
  doublon — même arbitrage (vérifier/remplacer, pas empiler).
- Autres figures d’architecture/UML existantes : organigramme (`:99`),
  UC 1-3 (`:536-545`), classes 1-4 (`:978-991`), séquence 1 (`:1007`) +
  annexe B (3 séquences, `backmatter.typ:160-176`), organigramme,
  § technos backend/frontend/envs (`:1084-1142`).
- Organigramme : `captures/7-organigrammes/organigramme-synelia-avec-ag.svg`.

## Q5. Lancement et démonstration (README + mémoire)

> Les commandes de lancement des processus (backend, front, MySQL, Redis, MinIO) et la manière dont l'application est présentée en démonstration.

- `README.md:50-63` (démarrage rapide) :
  - Backend : `cd quizapp` + `./mvnw spring-boot:run` → `:8085`.
  - Front : `cd quizapp_front` + `npm start` (`ng serve --proxy-config
    proxy.conf.json`, `package.json:6`) → `:4200`.
  - Auxiliaires : `docker compose up -d` (Redis + MinIO).
- MySQL : **aucune commande** (serveur externe attendu sur :3306,
  Flyway migre au boot du backend).
- Démonstration (`body.typ:1374-1396`, § Démonstration) : **3 parcours
  en texte** (admin : référentiels/droits/paramètres ; recruteur :
  campagne→décision ; candidat : soumission→quiz→suivi), + 3 captures
  `9-annexes/` (home publique, overview, campaigns).
- Validation outillée : `mvnw test|verify` + `npm run build` + Karma
  headless + collections Postman (`:1293-1303`).
