import type { DiagramDefinition, DiagramSection, EntityNode, RelationshipEdge } from '../../../types'
import { mct0CreationCampagne } from '../../archive/mct_0_creation_campagne'
import { mct1Candidature } from '../../archive/mct_1_candidature'
import { mct2Quiz } from '../../archive/mct_2_quiz'
import { mct3Planification } from '../../archive/mct_3_planification'
import { mct4ConduiteEntretien } from '../../archive/mct_4_conduite_entretien'
import { mct5Evaluation } from '../../archive/mct_5_evaluation'
import { mct6Decision } from '../../archive/mct_6_decision'
import { mct7Annulation } from '../../archive/mct_7_annulation'
import { mct8Audit } from '../../archive/mct_8_audit'

/**
 * Les figures de parcours du MCT v2 : les 9 traitements T0 → T8 de
 * `plans/mct/nouveaux_mct.md`, répartis en quatre figures.
 *
 * Le cycle de vie était initialement assemblé sur une seule figure
 * (`mct-v2-combine`, 7 traitements sur ~4480 px de haut). À ce zoom — ≈ 0.16 en
 * `fitView` — la figure devenait illisible. Elle est donc coupée en quatre lots
 * fonctionnels :
 *
 * - `mctParcours1` : T0 Créer la campagne, T1 Candidature, T2 Quiz — l'amont, du
 *   besoin de recrutement au résultat du quiz.
 * - `mctParcours2` : T3 Planification, T4 Conduire l'entretien, T5 Évaluation —
 *   tout le cycle d'entretien, du créneau réservé au verdict.
 * - `mctParcours3` : T6 Décision, T7 Annulation — la décision et sa mise en
 *   æuvre, avec les deux résultats de T6 qui alimentent la synchronisation de T7.
 * - `mctParcours4` : T8 Audit, seul sur sa figure. Ce n'est pas un oubli :
 *   l'audit est transverse, il n'a aucun lien entrant ni sortant, donc il n'a
 *   jamais fait partie de la chaîne. Il est isolé pour que les trois figures
 *   précédentes forment une lecture continue T0 → T7.
 *
 * **Les sources sont les figures individuelles, dans `archive/`.** Elles portent
 * `category: 'archive'` (elles ne sont plus lues isolément) mais restent la seule
 * definition du modèle : c'est le même arrangement que le MOT v2, qui importe
 * ses MCT depuis `archive/`.
 *
* **Deux coutures ne sont pas représentées.** Une arête ne peut pas relier deux
 * figures : `x-t2-r1-t3-op` et `x-t5-r1-t6-op` citent une extrémité absente du
 * lot, `buildCombine` les retire donc et signale l'erreur. Conséquence : « Quiz
 * validé » et « Entretien validé » restent sans arête sortante. « Candidat accepté
 * pour l'évaluation » apparaît comme le déclencheur propre de T3. Choix assumé :
 * rien n'est ajouté (ni nœud de sortie, ni libellé modifié) pour ne pas introduire
 * d'élément absent du modèle Merise — la continuité est portée par les titres
 * « 1/4 » … « 4/4 » et par le texte du mémoire.
 *
 * Les pentagones de T3 et de T6 restent donc **vides** alors que le plan leur donne
 * deux événements : chacun n'a qu'une flèche entrante dessinée — son événement
 * propre. `syncLabel` décrit les flèches dessinées, pas la logique abstraite.
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

  // Un lien ne peut pas relier deux figures. Si un `CrossLink` cite une extrémité
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
  title: 'MCT v2 — Parcours 1/4 (T0 → T2)',
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
  title: 'MCT v2 — Parcours 2/4 (T3 → T5)',
  domain: 'MCT v2 — Cycle d\'entretien : planification, conduite, évaluation',
  entries: [
    { prefix: 't3-', source: mct3Planification },
    { prefix: 't4-', source: mct4ConduiteEntretien },
    { prefix: 't5-', source: mct5Evaluation },
  ],
  crossLinks: [
    { id: 'x-t3-r1-t4-op', source: 't3-mct3-r1', target: 't4-mct4-op', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'x-t4-r1-t5-op', source: 't4-mct4-r1', target: 't5-mct5-op', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
})

export const mctParcours3: DiagramDefinition = buildCombine({
  id: 'mct-v2-parcours-3',
  title: 'MCT v2 — Parcours 3/4 (T6 → T7)',
  domain: 'MCT v2 — Décision et annulation',
  entries: [
    { prefix: 't6-', source: mct6Decision },
    { prefix: 't7-', source: mct7Annulation },
  ],
  crossLinks: [
    { id: 'x-t6-r1-t7-op', source: 't6-mct6-r1', target: 't7-mct7-op', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'x-t6-r2-t7-op', source: 't6-mct6-r2', target: 't7-mct7-op', sourceHandle: 'bottom', targetHandle: 'top' },
  ],
})

export const mctParcours4: DiagramDefinition = buildCombine({
  id: 'mct-v2-parcours-4',
  title: 'MCT v2 — Parcours 4/4 (T8)',
  domain: 'MCT v2 — Audit',
  entries: [
    { prefix: 't8-', source: mct8Audit },
  ],
  crossLinks: [],
})