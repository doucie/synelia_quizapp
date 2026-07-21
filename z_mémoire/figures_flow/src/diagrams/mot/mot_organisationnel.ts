import type { DiagramDefinition } from '../../types'

export const motOrganisationnel: DiagramDefinition = {
  id: 'mot-organisationnel',
  title: 'MOT — Modèle Organisationnel de Traitement',
  category: 'mot',
  domain: 'MOT — Traitements organisationnels',
  nodes: [
    {
      id: 'mot-matrix', type: 'process', position: { x: 50, y: 50 },
      data: {
        variant: 'mot-matrix', label: 'MOT',
        motMatrix: {
          columns: ['Candidat', 'Recruteur', 'Système'],
          treatments: [
            {
              id: 'T1', label: 'Soumettre la candidature', nature: 'Manuel', actor: 'Candidat',
              triggeringEvent: 'Campagne ouverte et accessible',
              mctEvents: ['Campagne ouverte et accessible', 'Email candidat vérifié', 'Quota campagne non atteint', 'Formulaire actif'],
              mctSync: 'ET',
              mctOperation: {
                label: 'T1 — Soumettre la candidature',
                items: ['Enregistrer candidature', 'Lancer parcours sélection', 'Ouvrir 1ère étape', 'Remettre scores à zéro'],
                rules: ['OK', 'Quota atteint', 'Token invalide'],
              },
              mctResults: [
                { label: 'Candidature enregistrée', rule: 'OK' },
                { label: 'Quota dépassé', rule: 'Quota atteint', fail: true },
                { label: 'Lien invalide', rule: 'Token invalide', fail: true },
              ],
            },
            {
              id: 'T2', label: 'Répondre au quiz', nature: 'Manuel (interactif)', actor: 'Candidat',
              triggeringEvent: 'Étape de quiz active',
              mctEvents: ['Étape de quiz active', 'Quiz démarré par le candidat', 'Quota de tentatives non atteint'],
              mctSync: 'ET',
              mctOperation: {
                label: 'T2 — Répondre au quiz',
                items: ['Démarrer session', 'Générer questions', 'Enregistrer réponses', 'Calculer score', 'Valider/rejeter'],
                rules: ['Score >= seuil', 'Correction manuelle', 'Score < seuil'],
              },
              mctResults: [
                { label: 'Quiz réussi', rule: 'Score >= seuil' },
                { label: 'En attente de correction', rule: 'Correction manuelle' },
                { label: 'Quiz échoué', rule: 'Score < seuil', fail: true },
              ],
            },
            {
              id: 'T3', label: 'Conduire et évaluer l\'entretien', nature: 'Semi-automatique', actor: 'Recruteur',
              triggeringEvent: 'Entretien planifié',
              mctEvents: ['Entretien planifié', 'Évaluations soumises'],
              mctSync: 'ET',
              mctOperation: {
                label: 'T3 — Conduire et évaluer l\'entretien',
                items: ['Vérifier présence candidat', 'Recueillir évaluations', 'Calculer score moyen', 'Valider ou refuser'],
                rules: ['Évaluations favorables', 'Candidat absent', 'Score insuffisant'],
              },
              mctResults: [
                { label: 'Entretien validé', rule: 'Évaluations favorables' },
                { label: 'Entretien annulé', rule: 'Candidat absent', fail: true },
                { label: 'Entretien refusé', rule: 'Score insuffisant', fail: true },
              ],
            },
            {
              id: 'T4', label: 'Valider la décision du recruteur', nature: 'Manuel', actor: 'Recruteur',
              triggeringEvent: 'Candidat en phase de décision',
              mctEvents: ['Candidat en phase de décision', 'Décision du recruteur'],
              mctSync: 'ET',
              mctOperation: {
                label: 'T4 — Valider la décision',
                items: ['Vérifier droits', 'Recueillir justification', 'Enregistrer audit'],
                rules: ['Décision favorable', 'Décision en sursis', 'Décision défavorable'],
              },
              mctResults: [
                { label: 'Candidat retenu', rule: 'Décision favorable' },
                { label: 'Candidat en attente', rule: 'Décision en sursis' },
                { label: 'Candidat refusé', rule: 'Décision défavorable', fail: true },
              ],
            },
            {
              id: 'T5', label: 'Gérer la demande d\'annulation', nature: 'Manuel', actor: 'Recruteur',
              triggeringEvent: 'Décision antérieure non immuable',
              mctEvents: ['Décision antérieure non immuable', 'Demande d\'annulation formulée'],
              mctSync: 'ET',
              mctOperation: {
                label: 'T5 — Gérer l\'annulation',
                items: ['Vérifier droits annulation', 'Vérifier si annulation possible', 'Recueillir justificatif', 'Enregistrer audit'],
                rules: ['Annulation autorisée', 'Décision immuable'],
              },
              mctResults: [
                { label: 'Étape rouverte', rule: 'Annulation autorisée' },
                { label: 'Décision inchangée', rule: 'Décision immuable', fail: true },
              ],
            },
            {
              id: 'T6', label: 'Journaliser audit_event', nature: 'Automatique', actor: 'Système',
              triggeringEvent: 'Toute opération métier',
              mctEvents: ['Toute opération métier'],
              mctSync: '',
              mctOperation: {
                label: 'T6 — Journaliser audit',
                items: ['Comparer état avant/après', 'Identifier auteur', 'Enregistrer trace'],
                rules: ['Opération journalisée'],
              },
              mctResults: [
                { label: 'Trace enregistrée', rule: 'Opération journalisée' },
              ],
            },
          ],
        },
      },
    },
  ],
  edges: [],
}
