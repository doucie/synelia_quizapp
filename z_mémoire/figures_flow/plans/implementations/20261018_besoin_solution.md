# 20261018 — Fig. 3 refaite : `besoin_solution` (du besoin à la solution, 3 paires)

Remplace `figures_html/du_besoin_a_la_solution.html` (§1.3.3, `body.typ:148`).
Décisions utilisateur : refaire car « quasi-pur texte, dur à lire » ; motif
retenu = **3 paires verticales problème → réponse** (une flèche horizontale par
paire, plus de colonne « VERS »).

## Verbatim source (figé)
1. Constat — État des lieux : processus éclaté sur 5 à 7 outils distincts
   (emails, Excel, Google Forms, dossiers partagés, appels) ; aucune
   standardisation : chaque recruteur applique ses propres critères ; absence
   totale de traçabilité : impossible de reconstituer un fil décisionnel ;
   données candidates dispersées, doublons fréquents, risque de perte.
4. Modules & Fonctionnalités implémentés : Campagnes (création, diffusion,
   pages publiques personnalisables, filtrage) ; Candidatures (soumission,
   vérification email, suivi du pipeline en temps réel) ; Quiz technique (QCM
   & texte libre, temps limité, correction automatique, scoring) ; Entretiens
   (planification, grille d'évaluation multi-critères, synthèse) ; Décisions
   (workflow structuré pré-sélection → entretien → décision finale, rollback).
2. Besoins identifiés : Centraliser l'ensemble du cycle dans une plateforme
   unique ; Automatiser l'évaluation via quiz paramétrables et correction
   automatique ; Standardiser les processus décisionnels (grilles communes,
   pipeline configurable) ; Tracer chaque action (conformité RGPD,
   transparence).
5. Architecture & Gouvernance : Angular 20.2 · Spring Boot 3.5.6 · Java 21 ·
   MySQL 8 · Redis 7 · MinIO ; JWT · Spring Security · RBAC 4 niveaux
   (Candidat, Recruteur, Admin, Super Admin) ; audit de chaque action sensible
   (entité, acteur, delta JSON avant/après) ; Docker Compose · migrations
   Flyway versionnées · CI/CD prêt.
3. Risques si statu quo : Iniquité (décisions subjectives, biais non
   documentés) ; Non-conformité (absence d'audit, exposition RGPD) ;
   Inefficacité (double saisie, perte de temps, cycles allongés) ; perte de
   candidats qualifiés par manque de suivi et de réactivité.
6. Bénéfices obtenus : Centralisation (1 outil unique remplace 5 à 7) ;
   Standardisation (grilles communes, scoring objectif, équité) ; Traçabilité
   (historique complet et horodaté) ; Réduction des coûts ~1 200 €/an
   (hébergement) vs ~6 000 €/an (Workable) ; Conformité RGPD natif (droit
   d'accès, suppression des données).

## Arbitrages
- **69 migrations Flyway omis** : le dépôt en compte 84 et le texte du mémoire
  (§7, L1287) dit « plus de cent » ⇒ libellé « migrations Flyway versionnées »
  sans nombre.
- Association des paires = lecture du source : (1→4), (2→5), (3→6).
- Jetons : gauche 1 `--fig-danger` / 2 `--fig-warning` / 3 `--fig-neutral` ;
  droite 4 `--fig-success` / 5 `--fig-secondary` / 6 `--fig-navy` (hex direct
  hors thèmatique via `tinted()`, asumption like fig. 14 : navy/bleu hors
  SAFE_HUES predict).

## Design
- Variante `'pairs'` → `BesoinPairsNode` (pattern `RgNode`) ; rangées
  `items-stretch`, flèche horizontale `--fig-frame` entre carte gauche et
  carte droite (même motif 3 fois).
- Bullet = tiret `foreground/85` (interdit : puce « › » du source) ; mots forts
  en bold ; titres + numéros pastilles teintées.

## Fait
- [ ] `types/index.ts` : `Variant` + `'pairs'`, type `BesoinPairSide`
      (num, title, lines), champ `besoinPairs`.
- [ ] `src/components/Nodes/BesoinPairsNode.tsx` + EntityNode delegation.
- [ ] `src/diagrams/memoire/besoin_solution.ts` (verbatim, W ~1360 :
      2 colonnes ~620 + flèche 64 + paddings).
- [ ] Validation `tsc`/`build` ; export utilisateur → `besoin-solution` ; 
      substitution `body.typ:148` (caption inchangée) ; `git rm
      du_besoin_a_la_solution.png` ; `typst compile` ; commits.
