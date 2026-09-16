import type { DiagramDefinition } from '../../types'

export const configSysteme: DiagramDefinition = {
  id: 'mcd-config-systeme',
  title: 'Config système',
  category: 'archive',
  domain: 'Config système',
  nodes: [
    {
      id: 'configuration',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'CONFIGURATION',
        variant: 'mcd',
        attributes: [
          { name: 'id_config', isPK: true },
          { name: 'nom_entreprise' },
          { name: 'lien_app' },
          { name: 'html_logo' },
          { name: 'couleur_principale' },
          { name: 'schema_couleur' },
          { name: 'comptes_candidats_actives' },
          { name: 'anti_triche_actif' },
          { name: 'politique_screening' },
          { name: 'max_avertissements_onglet' },
          { name: 'max_actions_onglet' },
          { name: 'plein_ecran_requis' },
          { name: 'bloquer_raccourcis' },
          { name: 'bloquer_copier_coller' },
        ],
      },
    },
    {
      id: 'config_smtp',
      type: 'entity',
      position: { x: 700, y: 0 },
      data: {
        label: 'CONFIGURATION_SMTP',
        variant: 'mcd',
        attributes: [
          { name: 'id_smtp', isPK: true },
          { name: 'hote' },
          { name: 'port' },
          { name: 'nom_utilisateur' },
          { name: 'authentification' },
          { name: 'expediteur_nom' },
          { name: 'expediteur_email' },
          { name: 'est_actif' },
        ],
      },
    },
    {
      id: 'texte_juridique',
      type: 'entity',
      position: { x: 0, y: 400 },
      data: {
        label: 'TEXTE_JURIDIQUE',
        variant: 'mcd',
        attributes: [
          { name: 'id_texte', isPK: true },
          { name: 'cle_texte' },
          { name: 'titre' },
          { name: 'contenu' },
          { name: 'description' },
          { name: 'est_actif' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-utiliser-smtp',
      source: 'configuration',
      target: 'config_smtp',
      type: 'relationship',
      data: { label: 'utiliser', cardFrom: '1,1', cardTo: '0,1' },
    },
    {
      id: 'e-proposer-texte',
      source: 'configuration',
      target: 'texte_juridique',
      type: 'relationship',
      data: { label: 'inclure', cardFrom: '0,n', cardTo: '0,n' },
    },
  ],
}
