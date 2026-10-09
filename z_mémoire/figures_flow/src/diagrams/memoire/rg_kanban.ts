import type { DiagramDefinition } from '../../types'

/**
 * Règles de gestion — kanban en 4 colonnes (3.6).
 *
 * 9 règles regroupées en 4 familles thématiques (pas 8 colonnes par domaine,
 * illisible) : chaque carte montre la règle ET sa conséquence, reliées par
 * une flèche — une relation cause→conséquence, pas une liste.
 *
 * Libellés sourcés du brief (versions courtes de la table RG, 3.6) : noms
 * verbatim, règles et effets raccourcis sans changer le sens. Icônes
 * d’en-tête uniquement (4 au total, 100 % Feather), pas une par carte.
 */

const C1 = 'hsl(210, 100%, 40%)'
const C2 = 'hsl(240, 100%, 40%)'
const C3 = 'hsl(285, 100%, 40%)'
const C4 = 'hsl(30, 100%, 40%)'

const W = 1720

export const rgKanban: DiagramDefinition = {
  id: 'memoire-rg-kanban',
  title: 'Règles de gestion — kanban en 4 colonnes',
  category: 'memoire',
  domain: '3.6 — Règles de gestion',
  nodes: [
    {
      id: 'kanban',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Règles de gestion par famille',
        variant: 'rg' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        rgCols: [
          {
            title: 'Cadre et accès',
            icon: 'lock' as const,
            color: C1,
            cards: [
              { id: 'RG-01', name: 'Campagnes', rule: 'Une campagne ne peut être ouverte que si son cadre métier est cohérent.', effect: 'Le backend bloque les activations incohérentes.' },
              { id: 'RG-02', name: 'Accès public', rule: 'L’accès candidat dépend du lien, de l’état de campagne et des limites métier.', effect: 'Les points d’entrée publics vérifient le contexte avant création de dossier.' },
              { id: 'RG-03', name: 'Vérification email', rule: 'Certaines actions publiques exigent un email validé.', effect: 'La vérification devient une précondition métier, pas un confort d’interface.' },
            ],
          },
          {
            title: 'Intégrité des données',
            icon: 'database' as const,
            color: C2,
            cards: [
              { id: 'RG-04', name: 'Versionning formulaire', rule: 'Une version ayant servi ne doit plus être altérée destructivement.', effect: 'Le verrouillage protège la comparabilité des réponses.' },
              { id: 'RG-05', name: 'Pipeline', rule: 'application_progress est la source de vérité de l’avancement.', effect: 'Les écrans dérivent de l’historique, pas d’un statut simplifié.' },
            ],
          },
          {
            title: 'Décisions et permissions',
            icon: 'sliders' as const,
            color: C3,
            cards: [
              { id: 'RG-06', name: 'Entretiens/décisions', rule: 'Un entretien ou une décision doit être rattaché à la bonne étape du pipeline.', effect: 'Historique lisible des événements menant au verdict.' },
              { id: 'RG-07', name: 'Permissions', rule: 'Une action dépend du rôle global ET d’un droit contextualisé.', effect: 'Contrôles d’accès réalisés côté backend, avec contexte métier.' },
            ],
          },
          {
            title: 'Traçabilité',
            icon: 'search' as const,
            color: C4,
            cards: [
              { id: 'RG-08', name: 'Correction quiz', rule: 'Toute correction manuelle reste identifiable, datée, attribuable.', effect: 'Traçabilité de l’évaluation préservée et révisable.' },
              { id: 'RG-09', name: 'Audit', rule: 'Les décisions critiques doivent être justifiables a posteriori.', effect: 'Le modèle conserve l’information nécessaire à l’audit.' },
            ],
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
