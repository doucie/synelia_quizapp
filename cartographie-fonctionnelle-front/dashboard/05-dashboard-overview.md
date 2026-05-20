# Dashboard Overview

## 1. Identite

- Route: `/dashboard/overview`
- Guard: page fille du shell `dashboard`, donc protégée par `authGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/overview/overview.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/overview/overview.html`

## 2. Objectif Produit

La page sert de point d’entrée connecté minimal: elle accueille l’utilisateur, affiche les grands compteurs du produit et insère un composant de synthèse complémentaire (`QEEL`).

## 3. Etat Constate

- [x] La page affiche un message de bienvenue avec prénom et rôle.
- [x] Elle charge des compteurs centralisés via `DashboardStatsService`.
- [x] Elle expose quatre KPI simples: candidatures, entretiens, évaluations, décisions.
- [x] Elle embarque ensuite le composant `QeelModernComponent`.
- [ ] Vérifier le contenu exact et le contrat backend du composant `QEEL`, qui n’est pas détaillé dans cette fiche.
- [ ] Vérifier si les compteurs doivent être adaptés au rôle connecté ou s’ils restent globaux.

## 4. Blocs UI Constates

- [x] Titre de bienvenue personnalisé
- [x] Rappel du rôle utilisateur
- [x] Grille de 4 cartes statistiques
- [x] État de chargement visuel des cartes
- [x] Bloc `QEEL moderne` sous les stats

## 5. Donnees Affichees

- `currentUser().firstName`
- `currentUser().role`
- `counts['applications']`
- `counts['interviews']`
- `counts['evaluations']`
- `counts['decisions']`

## 6. Services Et Endpoints

- `AuthService.getCurrentUser()` -> contexte utilisateur local
- `DashboardStatsService.getCounts()` -> `GET /api/dashboard/counts`
- `QeelModernComponent` -> dépendance visuelle à documenter séparément si son rôle devient critique

## 7. Ce Que Le Backend Doit Envoyer

- Un payload de compteurs simple, de type `Record<string, number>`.
- Des clés stables: `applications`, `interviews`, `evaluations`, `decisions`.
- Des compteurs cohérents avec le périmètre visible de l’utilisateur connecté si la sécurité fonctionnelle l’exige.

## 8. Entites Metier Impliquees

- agrégats dashboard
- `application`
- `interview`
- `evaluation`
- `decision`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les compteurs doivent-ils être filtrés par rôle, groupe métier ou campagnes accessibles ?
- [ ] Le bloc `QEEL` relève-t-il d’un autre flux métier à documenter séparément ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/overview` avec un utilisateur connecté.
2. Vérifier le prénom et le rôle affichés.
3. Contrôler le chargement des 4 KPI.
4. Comparer les valeurs avec les listes réelles `candidates`, `interviews`, `evaluations`, `decisions`.
5. Noter si les compteurs semblent globaux ou contextualisés par permissions.