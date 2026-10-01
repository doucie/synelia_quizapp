import type { DiagramDefinition, DiagramSection, EntityNode, RelationshipEdge } from '../../../types'
import { mct0CreationCampagne } from './mct_0_creation_campagne'
import { mct1Candidature } from './mct_1_candidature'
import { mct2Quiz } from './mct_2_quiz'
import { mct3Entretien } from './mct_3_entretien'
import { mct4Decision } from './mct_4_decision'
import { mct5Annulation } from './mct_5_annulation'

/**
 * Les figures de parcours du MCT v2 : T0 → T2 d'un côté, T3 → T5 de l'autre.
 *
 * Le cycle de vie était initialement assemblé sur une seule figure
 * (`mct-v2-combine`, 7 traitements sur ~4480 px de haut). À ce zoom — ≈ 0.16 en
 * `fitView` — la figure devenait illisible. Elle est donc coupée en deux lots
 * fonctionnels, chacun sur 3 rangs (~1920 px, zoom ≈ 0.3) :
 *
 * - `mctParcours1` : T0 Créer la campagne, T1 Candidature, T2 Quiz — l'amont, du
 *   besoin de recrutement au résultat du quiz.
 * - `mctParcours2` : T3 Entretien, T4 Décision, T5 Annulation — l'aval, de
 *   l'évaluation de l'entretien à la décision d'annulation.
 *
 * **T6 n'est dans aucune des deux**, et ce n'est pas un oubli : l'audit n'a aucun
 * lien entrant ni sortant, il n'a jamais fait partie de la chaîne. Il reste
 * uniquement sur sa figure individuelle `mct-v2-6-audit`. L'ancien titre
 * « Parcours complet (T0 → T6) » était donc inexact — le découpage le corrige.
 *
 * **La couture T2 → T3 n'est pas représentée.** `x-t2-r1-t3-op` ne peut pas
 * traverser deux figures, donc « Quiz validé » reste sans arête sortante et
 * « Entretien planifié » sans arête entrante. Choix assumé : rien n'est ajouté
 * (ni nœud de sortie, ni libellé modifié) pour ne pas introduire d'élément absent
 * du modèle Merise — la continuité est portée par les titres « 1/2 » et « 2/2 »
 * et par le texte du mémoire.
 */

/** Hauteur d'une rangée de traitement. Le nœud le plus bas d'un MCT est à y ≈ 500. */
const ROW_HEIGHT = 640

function prefixNodes(nodes: EntityNode[], prefix: string, offsetY: number): EntityNode[] {
  return nodes.map((n) => ({
    ...n,
    id: `${prefix}${n.id}`,
    position: { x: n.position.x, y: n.position.y + offsetY },
  }))
}

function prefixEdges(edges: RelationshipEdge[], prefix: string): RelationshipEdge[] {
  return edges.map((e) => ({
    ...e,
    id: `${prefix}${e.id}`,
    source: `${prefix}${e.source}`,
    target: `${prefix}${e.target}`,
  }))
}

/** Un traitement à assembler, avec le préfixe qu'il portera dans la figure. */
interface Entry {
  prefix: string
  source: DiagramDefinition
}

interface CrossLink {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
}

/**
 * Un résultat de T*n* déclenche la synchronisation de T*n+1* : le lien entre
 * traitements arrive sur le triangle, pas sur l'événement du traitement suivant
 * (qui reste le déclencheur interne, propre à T*n+1*). Les côtés sont explicites :
 * `bottom` sur le résultat, `top` sur le triangle (seul handle cible d'un `mct-syncop`).
 */
function buildCombine(opts: {
  id: string
  title: string
  domain: string
  entries: Entry[]
  crossLinks: CrossLink[]
}): DiagramDefinition {
  const { id, title, domain, entries, crossLinks } = opts

  // Les rangées sont réindexées à partir de 0 : chaque figure repart de y = 0.
  const nodes = entries.flatMap(({ prefix, source }, i) => prefixNodes(source.nodes, prefix, i * ROW_HEIGHT))

  // Un lien ne peut pas relie deux figures. Si un `CrossLink` cite une extrémité
  // absente du lot (traitement déplacé d'une figure à l'autre), il est retiré
  // plutôt que dessiné dans le vide, et l'erreur est signalée.
  const nodeIds = new Set(nodes.map((n) => n.id))
  const dangling = crossLinks.filter((e) => !nodeIds.has(e.source) || !nodeIds.has(e.target))
  if (dangling.length > 0) {
    console.error(
      `[${id}] liens croisés ignorés, extrémité absente de la figure :`,
      dangling.map((e) => `${e.id} (${e.source} → ${e.target})`).join(', '),
    )
  }

  const edges: RelationshipEdge[] = [
    ...entries.flatMap(({ prefix, source }) => prefixEdges(source.edges, prefix)),
    ...crossLinks
      .filter((e) => !dangling.includes(e))
      .map((e): RelationshipEdge => ({
        ...e,
        type: 'traitement',
        data: { isDashed: true },
      })),
  ]

  /** Groupes déplaçables : un « traitement » = les nœuds partageant un préfixe. */
  const sections: DiagramSection[] = entries.map(({ prefix, source }) => ({
    id: prefix.replace(/-$/, '').toUpperCase(),
    prefix,
    label: source.domain,
  }))

  return { id, title, category: 'traitements', domain, nodes, edges, sections }
}

export const mctParcours1: DiagramDefinition = buildCombine({
  id: 'mct-v2-parcours-1',
  title: 'MCT v2 — Parcours 1/2 (T0 → T2)',
  domain: 'MCT v2 — Amont : de la campagne au quiz',
  entries: [
    { prefix: 't0-', source: mct0CreationCampagne },
    { prefix: 't1-', source: mct1Candidature },
    { prefix: 't2-', source: mct2Quiz },
  ],
  crossLinks: [
    { id: 'x-t0-r1-t1-op', source: 't0-mct0-r1', target: 't1-mct1-op', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'x-t1-r1-t2-op', source: 't1-mct1-r1', target: 't2-mct2-op', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
})

export const mctParcours2: DiagramDefinition = buildCombine({
  id: 'mct-v2-parcours-2',
  title: 'MCT v2 — Parcours 2/2 (T3 → T5)',
  domain: 'MCT v2 — Aval : de l’entretien à la décision',
  entries: [
    { prefix: 't3-', source: mct3Entretien },
    { prefix: 't4-', source: mct4Decision },
    { prefix: 't5-', source: mct5Annulation },
  ],
  crossLinks: [
    { id: 'x-t3-r1-t4-op', source: 't3-mct3-r1', target: 't4-mct4-op', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'x-t4-r1-t5-op', source: 't4-mct4-r1', target: 't5-mct5-op', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'x-t4-r2-t5-op', source: 't4-mct4-r2', target: 't5-mct5-op', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'x-t4-r3-t5-op', source: 't4-mct4-r3', target: 't5-mct5-op', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
})
