# Bilan de Santé - QuizApp (24 Mars 2026)

## Vue d'ensemble

Ce dossier contient le bilan complet de santé de l'application QuizApp (backend Spring Boot + frontend Angular).

## Fichiers du bilan

| Fichier | Description |
|---------|-------------|
| [01-MODIFICATIONS-EFFECTUÉES.md](01-MODIFICATIONS-EFFECTUÉES.md) | Changements appliqués lors de cette session |
| [02-FICHIERS-SUPPRIMABLES.md](02-FICHIERS-SUPPRIMABLES.md) | Fichiers/dossiers pouvant être supprimés sans impact |
| [03-SECURITE.md](03-SECURITE.md) | Problèmes de sécurité critiques identifiés |
| [04-OPTIMISATION-BACKEND.md](04-OPTIMISATION-BACKEND.md) | Problèmes d'architecture et performance côté backend |
| [05-OPTIMISATION-FRONTEND.md](05-OPTIMISATION-FRONTEND.md) | Problèmes de qualité et performance côté frontend |
| [06-SEPARATION-FRONT-BACK.md](06-SEPARATION-FRONT-BACK.md) | Analyse de la bonne répartition des responsabilités |
| [07-PLAN-ACTION.md](07-PLAN-ACTION.md) | Plan d'action priorisé pour les corrections |

## Score de santé global

| Critère | Score | Détail |
|---------|-------|--------|
| Sécurité | 🔴 2/10 | Pas d'authentification réelle, tokens forgés côté client |
| Architecture Backend | 🟠 5/10 | Couches respectées globalement mais violations dans UserController |
| Performance Backend | 🟠 4/10 | 6 requêtes SQL pour les stats, pas de pagination, N+1 |
| Qualité Frontend | 🟡 5/10 | 40+ fuites mémoire, 5 composants QEEL dupliqués |
| Séparation Front/Back | 🟠 4/10 | Auth gérée côté client, logique métier dispersée |
| Maintenabilité | 🟡 5/10 | Duplication de code, composants trop gros |
| **Score Global** | **🟠 4.2/10** | **Fonctionnel mais vulnérable, à sécuriser en priorité** |
