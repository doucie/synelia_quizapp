# SyneliaQuizApp

> Plateforme web de gestion du processus de recrutement avec évaluation technique automatisée  
> Projet de fin d'études — ENSIT 2026 — Entreprise d'accueil : SYNELIA

---

## Structure du projet

### ⚙️ Application

| Dossier | Description |
|---|---|
| `quizapp/` | Backend Spring Boot (Java 21) — API REST, sécurité, logique métier, persistance JPA/MySQL, migrations Flyway |
| `quizapp_front/` | Frontend Angular 20 — interface monopage, parcours candidat/recruteur/admin, quiz technique |

### 📐 Conception & documentation fonctionnelle

| Dossier | Description |
|---|---|
| `arborescence-frontend/` | Arborescence complète des pages, composants et services du frontend Angular |
| `cartographie-fonctionnelle-front/` | Cartographie métier détaillée : base de données cible, audits techniques, évolutions fonctionnelles |

### 📄 Mémoire

| Dossier | Description |
|---|---|
| `z_mémoire/template_memoire/typst/` | Sources du mémoire (Typst) — `main.typ`, thème, sections, bibliographie |
| `z_mémoire/figures_html/` | Figures, captures d'écran et diagrammes intégrés dans le mémoire |
| `z_mémoire/bibliographie/` | Références bibliographiques |
| `z_mémoire/ensit/` | Documentation sur l'ENSIT (formation, programmes) |
| `z_mémoire/synelia/` | Documentation sur SYNELIA (historique, expertises, organigramme) |

---

## Fichiers clés

| Fichier | Contenu |
|---|---|
| `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_cible_post_420_migration.md` | Schéma cible de la base de données après la migration 420 (pipeline multi-occurrences) |
| `cartographie-fonctionnelle-front/audit/2026-05-30-pipeline-multi-occurrences-audit.md` | Audit technique de la migration pipeline multi-occurrences |
| `cartographie-fonctionnelle-front/evolution/420-evolution-pipeline-multi-occurrences.md` | Spécification fonctionnelle de l'évolution pipeline multi-occurrences |
| `z-synelia-tasks/rules/regles-frontend.md` | Règles et conventions de développement frontend (Angular, SCSS, design tokens) |
| `z-synelia-tasks/rules/regles-backend.md` | Règles et conventions de développement backend (Spring Boot, JPA, API REST) |

---

## Démarrage rapide

```bash
# Backend
cd quizapp
./mvnw spring-boot:run

# Frontend
cd quizapp_front
npm start

# Services auxiliaires (Redis, MinIO)
docker compose up -d
```

Le backend démarre sur `http://localhost:8085`, le frontend sur `http://localhost:4200`.
