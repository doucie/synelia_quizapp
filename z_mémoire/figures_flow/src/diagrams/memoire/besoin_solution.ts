import type { DiagramDefinition } from '../../types'

/**
 * Figure 3 — Du besoin à la solution (§1.3.3).
 *
 * Verbatim de `figures_html/du_besoin_a_la_solution.html` en 3 paires
 * problème → réponse ((1→4), (2→5), (3→6)) : le texte est intact sauf
 * « 69 migrations Flyway » omis (dépôt : 84 ; texte du mémoire : « plus de
 * cent ») ⇒ « migrations Flyway versionnées ». Couleurs = jetons `--fig-*`
 * (danger→success, warning→secondary, neutral→navy — voir `BesoinPairsNode`).
 */
const W = 1360

export const besoinSolution: DiagramDefinition = {
  id: 'memoire-besoin-solution',
  title: 'Du besoin à la solution — synthèse',
  category: 'memoire',
  domain: '1.3.3 — Nécessité d’une solution digitale',
  nodes: [
    {
      id: 'pairs',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Du besoin à la solution — synthèse',
        variant: 'pairs' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        besoinPairs: [
          {
            left: {
              num: 1,
              title: 'Constat — État des lieux',
              lines: [
                'Processus éclaté sur 5 à 7 outils distincts (emails, Excel, Google Forms, dossiers partagés, appels)',
                'Aucune standardisation : chaque recruteur applique ses propres critères d’évaluation',
                'Absence totale de traçabilité : impossible de reconstituer un fil décisionnel',
                'Données candidates dispersées, doublons fréquents, risque de perte d’information',
              ],
            },
            right: {
              num: 4,
              title: 'Modules & Fonctionnalités implémentés',
              lines: [
                'Campagnes : création, diffusion, pages publiques personnalisables, filtrage',
                'Candidatures : soumission, vérification email, suivi du pipeline en temps réel',
                'Quiz technique : QCM & texte libre, temps limité, correction automatique, scoring',
                'Entretiens : planification, grille d’évaluation multi-critères, synthèse',
                'Décisions : workflow structuré (pré-sélection → entretien → décision finale), rollback',
              ],
            },
          },
          {
            left: {
              num: 2,
              title: 'Besoins identifiés',
              lines: [
                'Centraliser l’ensemble du cycle de recrutement dans une plateforme unique',
                'Automatiser l’évaluation des candidats via des quiz paramétrables et une correction automatique',
                'Standardiser les processus décisionnels avec des grilles communes et un pipeline configurable',
                'Tracer chaque action pour garantir la conformité RGPD et la transparence',
              ],
            },
            right: {
              num: 5,
              title: 'Architecture & Gouvernance',
              lines: [
                'Stack : Angular 20.2 · Spring Boot 3.5.6 · Java 21 · MySQL 8 · Redis 7 · MinIO',
                'Sécurité : JWT · Spring Security · RBAC 4 niveaux (Candidat, Recruteur, Admin, Super Admin)',
                'Audit : chaque action sensible loguée — entité, acteur, delta JSON avant/après',
                'Déploiement : Docker Compose · migrations Flyway versionnées · CI/CD prêt',
              ],
            },
          },
          {
            left: {
              num: 3,
              title: 'Risques si statu quo',
              lines: [
                'Iniquité : décisions subjectives, biais de recrutement non documentés',
                'Non-conformité : absence d’audit, exposition RGPD',
                'Inefficacité : double saisie, perte de temps, cycles de recrutement allongés',
                'Perte de candidats qualifiés par manque de suivi et de réactivité',
              ],
            },
            right: {
              num: 6,
              title: 'Bénéfices obtenus',
              lines: [
                'Centralisation : 1 outil unique remplace 5 à 7 outils disparates',
                'Standardisation : grilles communes, scoring objectif, équité de traitement',
                'Traçabilité : historique complet et horodaté de chaque candidature',
                'Réduction des coûts : ~1 200 €/an (hébergement) vs ~6 000 €/an (Workable)',
                'Conformité : RGPD natif, droit d’accès, suppression des données',
              ],
            },
          },
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
