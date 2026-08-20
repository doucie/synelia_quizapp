import type { DiagramDefinition } from '../../../types'

export const utilisateursDroits: DiagramDefinition = {
  id: 'mcd-utilisateurs-droits',
  title: 'Utilisateurs & droits',
  category: 'mcd',
  domain: 'Utilisateurs & droits',
  nodes: [
    {
      id: 'utilisateur',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'UTILISATEUR',
        variant: 'mcd',
        attributes: [
          { name: 'id_utilisateur', isPK: true },
          { name: 'nom' },
          { name: 'prenom' },
          { name: 'email' },
          { name: 'username' },
          { name: 'role_systeme' },
        ],
      },
    },
    {
      id: 'groupe_metier',
      type: 'entity',
      position: { x: 600, y: 0 },
      data: {
        label: 'GROUPE_METIER',
        variant: 'mcd',
        attributes: [
          { name: 'id_groupe', isPK: true },
          { name: 'libelle_groupe' },
          { name: 'description' },
        ],
      },
    },
    {
      id: 'permission_entite',
      type: 'entity',
      position: { x: 0, y: 400 },
      data: {
        label: 'PERMISSION_ENTITE',
        variant: 'mcd',
        attributes: [
          { name: 'id_permission', isPK: true },
          { name: 'type_entite' },
          { name: 'id_entite' },
          { name: 'cle_permission' },
        ],
      },
    },
    {
      id: 'groupe_permission',
      type: 'entity',
      position: { x: 400, y: 250 },
      data: {
        label: 'PERMISSION_GROUPE',
        variant: 'mcd',
        attributes: [
          { name: 'id_permission', isPK: true },
          { name: 'groupe_id' },
          { name: 'fonctionnalite' },
        ],
      },
    },
    {
      id: 'utilisateur_permission',
      type: 'entity',
      position: { x: -200, y: 250 },
      data: {
        label: 'PERMISSION_UTILISATEUR',
        variant: 'mcd',
        attributes: [
          { name: 'id_permission', isPK: true },
          { name: 'utilisateur_id' },
          { name: 'fonctionnalite' },
          { name: 'est_autorise' },
        ],
      },
    },
    {
      id: 'demande_changement_groupe',
      type: 'entity',
      position: { x: 600, y: 400 },
      data: {
        label: 'DEMANDE_CHANGEMENT_GROUPE',
        variant: 'mcd',
        attributes: [
          { name: 'id_demande', isPK: true },
          { name: 'raison' },
          { name: 'statut' },
        ],
      },
    },
    {
      id: 'notification',
      type: 'entity',
      position: { x: 0, y: 600 },
      data: {
        label: 'NOTIFICATION',
        variant: 'mcd',
        attributes: [
          { name: 'id_notification', isPK: true },
          { name: 'type' },
          { name: 'acteur' },
          { name: 'lien' },
          { name: 'est_lue' },
          { name: 'type_entite' },
          { name: 'id_entite' },
        ],
      },
    },
    {
      id: 'evenement_audit',
      type: 'entity',
      position: { x: 400, y: 600 },
      data: {
        label: 'EVENEMENT_AUDIT',
        variant: 'mcd',
        attributes: [
          { name: 'id_evenement', isPK: true },
          { name: 'type_entite' },
          { name: 'id_entite' },
          { name: 'type_action' },
          { name: 'justification' },
          { name: 'etat_avant' },
          { name: 'etat_apres' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-appartenir',
      source: 'utilisateur',
      target: 'groupe_metier',
      type: 'relationship',
      data: { label: 'appartenir', cardFrom: '0,n', cardTo: '0,n' },
    },
    {
      id: 'e-disposer',
      source: 'utilisateur',
      target: 'permission_entite',
      type: 'relationship',
      data: { label: 'disposer', cardFrom: '0,n', cardTo: '0,n' },
    },
    {
      id: 'e-soumettre',
      source: 'utilisateur',
      target: 'demande_changement_groupe',
      type: 'relationship',
      data: { label: 'soumettre', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-detenir-perm',
      source: 'utilisateur',
      target: 'utilisateur_permission',
      type: 'relationship',
      data: { label: 'detenir', cardFrom: '0,n', cardTo: '0,n' },
    },
    {
      id: 'e-beneficier-groupe-perm',
      source: 'groupe_metier',
      target: 'groupe_permission',
      type: 'relationship',
      data: { label: 'beneficier', cardFrom: '0,n', cardTo: '0,n' },
    },
    {
      id: 'e-recevoir-notification',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
      data: { label: 'obtenir', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-realiser-audit',
      source: 'utilisateur',
      target: 'evenement_audit',
      type: 'relationship',
      data: { label: 'realiser', cardFrom: '0,n', cardTo: '1,1' },
    },
  ],
}
