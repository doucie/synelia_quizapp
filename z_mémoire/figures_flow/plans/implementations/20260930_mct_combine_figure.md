# PLAN — Figure MCT unique (parcours complet T0 → T6)

Date : 2026-09-30
Référence : notation `event-result-T*` de `plans/mct/nouveaux_mct.md` (§ « Notation `event-result-T*` »),
composition par aplatissement/préfixe déjà en place dans `src/diagrams/mot/mot_organisationnel_v2.ts:41-55`.

> **⚠️ Figure décomposée le 2026-10-01.** `mct-v2-combine` n'existe plus : à ≈ 0.16 de zoom les 7
> traitements étaient illisibles. La figure est coupée en deux — `mct-v2-parcours-1` (T0–T2) et
> `mct-v2-parcours-2` (T3–T5) — et T6 reste seul sur sa figure individuelle. Le fichier
> `mct_combine.ts` existe toujours, devenu une fabrique. Voir
> `plans/implementations/20261001_decoupe_parcours_mct.md`. Ce document décrit l'état à sa date.

## Contexte & décisions

- Les **7 MCT v2 existants** (`src/diagrams/traitements/v2/mct_0..mct_6.ts`, T0–T6) sont combinés
  en **une seule figure**. Pas d'alignement préalable sur le découpage T0–T8 du plan : hors périmètre.
- **Aucun formatage particulier, aucun texte ajouté.** Pas d'en-tête de section, pas de bande, pas de
  légende : chaque nœud `mct-syncop` porte déjà son préfixe `T0 —` … `T6 —` dans son libellé.
- Mise en page **verticale, 1 traitement par rangée** (`offsetY = index * 640`). Pas d'offset X : les 7
  diagrammes partagent déjà la même bande `x ∈ [20, 420]`.
- Seuls liens tracés : ceux de la notation `event-result-T*` du plan. **T6 (audit) reste isolé** en bas
  (son événement `Opération métier réalisée` est générique, aucune arête transverse).
- Les **7 figures individuelles restent enregistrées** dans la sidebar ; la figure combinée s'ajoute à la suite.

## Résultat implémenté (2026-09-30)

- [x] `src/diagrams/traitements/v2/mct_combine.ts` — helpers `prefixNodes` / `prefixEdges`,
      tableau `sections` (7 entrées `t0-` … `t6-`), tableau `crossLinks` (7 arêtes).
      **28 nœuds, 21 arêtes internes, 7 arêtes inter-sections.**
- [x] `src/diagrams/index.ts` — import + entrée `mctCombine` après `mct6Audit`,
      commentaire du bloc passé de `(7)` à `(8 : 7 MCT + figure combinée)`.
- [x] `npm run lint` : **0 nouvelle erreur** (70 erreurs avant, 70 après).
- [x] `npx vite build` : bundle OK (634 kB / 172 kB gzip).

## Fichiers

| Action | Fichier |
|---|---|
| Créer | `src/diagrams/traitements/v2/mct_combine.ts` |
| Modifier | `src/diagrams/index.ts` |

Aucune modification de `ProcessNode.tsx`, `DiagramCanvas.tsx`, `TraitementEdge.tsx`.

## Métadonnées

```ts
id: 'mct-v2-combine'
title: 'MCT v2 — Parcours complet (T0 → T6)'
category: 'traitements'   // obligatoire : DiagramCanvas.tsx:297 -> defaultEdgeOptions type 'traitement'
domain: 'MCT v2 — Cycle de vie d\'une candidature'
```

`category: 'traitements'` est obligatoire : `DiagramCanvas.tsx:297,335` n'applique le type d'arête
`'traitement'` que pour cette catégorie.

## Sections aplaties

| # | prefix | source | nœuds | arêtes |
|---|--------|--------|-------|--------|
| 0 | `t0-` | `mct0CreationCampagne` | 3 | 2 |
| 1 | `t1-` | `mct1Candidature` | 4 | 3 |
| 2 | `t2-` | `mct2Quiz` | 4 | 3 |
| 3 | `t3-` | `mct3Entretien` | 5 | 4 |
| 4 | `t4-` | `mct4Decision` | 5 | 4 |
| 5 | `t5-` | `mct5Annulation` | 4 | 3 |
| 6 | `t6-` | `mct6Audit` | 3 | 2 |

`ROW_HEIGHT = 640` : le nœud le plus bas d'une rangée est à `y ≈ 500`, ce qui laisse ~140 px de
gouttière pour le routage des arêtes inter-sections.

## Arêtes inter-traitements

Toutes `type: 'traitement'` et `data: { isDashed: true }`.

**Correction du 2026-10-01** : les cibles pointaient initialement sur l'**événement** du traitement suivant
(`t1-mct1-e1`, etc.). Relecture utilisateur : « quand un résultat devient un événement dans le traitement
suivant ». Or l'événement est le déclencheur **interne** de T*n+1* ; le lien entre traitements doit arriver sur
la **synchronisation**. Les cibles sont donc les triangles, et les deux côtés sont explicites.

| # | id | source | cible | sourceHandle | targetHandle |
|---|----|--------|-------|--------------|--------------|
| 1 | `x-t0-r1-t1-op` | `t0-mct0-r1` *Campagne initialisée* | `t1-mct1-op` | `bottom` | `top` |
| 2 | `x-t1-r1-t2-op` | `t1-mct1-r1` *Candidat accepté…* | `t2-mct2-op` | `bottom` | `top` |
| 3 | `x-t2-r1-t3-op` | `t2-mct2-r1` *Quiz validé* | `t3-mct3-op` | `bottom` | `top` |
| 4 | `x-t3-r1-t4-op` | `t3-mct3-r1` *Entretien validé* | `t4-mct4-op` | `bottom` | `top` |
| 5 | `x-t4-r1-t5-op` | `t4-mct4-r1` *Candidat retenu* | `t5-mct5-op` | `bottom` | `top` |
| 6 | `x-t4-r2-t5-op` | `t4-mct4-r2` *Candidat en attente* | `t5-mct5-op` | `bottom` | `top` |
| 7 | `x-t4-r3-t5-op` | `t4-mct4-r3` *Candidat refusé* | `t5-mct5-op` | `bottom` | `top` |

Justification des sources (`nouveaux_mct.md`) : `event-result-T0`, `event-result-T1`, `event-result-T2`,
`event-result-T5` (découpage 9 traitements), `event-result-T6` ×3.

`bottom` en source : les traitements sont empilés verticalement (colonnes x≈220), la sortie par le bas donne
un lien vertical lisible, là où la droite (1er handle implicite) décalait le tracé vers le bord de la figure.

Les branches en échec (`Candidature rejetée`, `Quiz échoué`, `Entretien refusé`, `Décision maintenue`)
ne déclenchent rien : aucune arête sortante, conforme à la notation.

**Hors périmètre, assumé** : aucun lien T5 → T6. « Décision annulée » / « Décision maintenue » ne déclenchent
pas la journalisation T6, dont l'événement (*Opération métier réalisée*) reste autonome.

**Écart de libellé assumé** : le résultat T1 réel est « Candidat accepté pour l'étape suivante
(T1.CAES) » alors que le plan écrit « Candidat accepté pour quiz ». On lie le nœud v2 tel quel,
sans renommage — le contenu des MCT n'est pas modifié par cette figure.

## Vérification manuelle (`npm run dev`)

- [ ] Sélectionner « MCT v2 — Parcours complet (T0 → T6) » dans la sidebar.
- [ ] L'enchaînement T0 → T1 → T2 → T3 → T4 → T5 est lisible de haut en bas.
- [ ] Les 3 arêtes vers `t5-mct5-op` se partagent bien l'offset (machinerie `edgeAnchors.ts`,
      commit `a4ec9ca`) : offsets −28 / 0 / +28 sur le handle `top` de la synchronisation.
- [ ] Les 3 arêtes entrant sur `t3-mct3-op` (2 événements internes + 1 lien croisé) sont espacées
      de 28 px sans chevauchement.
- [ ] `fitView` englobe les 7 rangées (~4480 px de haut × ~640 px de large).
- [ ] Export SVG : les 28 cartes + les 28 arêtes sont bien présentes.

## Points de vigilance

- ~~**`DiagramCanvas` : `getValidHandles` ne teste que `mct-operation`**~~ — **résolu le 2026-10-01**.
  Le reliquat Option B est levé : `validHandles` dans `edgeAnchors.ts` est désormais la source unique,
  utilisée par `DiagramCanvas`, `RelationshipEdge` et `TraitementEdge`. Il importait ici parce que les
  liens croisés visent désormais des `mct-syncop`. Voir `plans/implementations/20260830_points_ancrage_edges.md`.
- **Format d'insertion** : ~4480 px de haut pour ~640 de large ⇒ figure pleine page en **portrait A4**.
  Pour une page paysage, réduire `ROW_HEIGHT` ou scinder en deux figures.
- **Typst non modifié** : `template_memoire/typst/sections/body.typ:787-798` référence encore les
  3 figures MCT archivées (`mct-1-candidature-quiz`, `mct-2-entretien-evaluation`,
  `mct-3-decision-audit`). La substitution par la figure unique n'est pas faite.
- **Base de types cassée en amont** : `npm run build` échoue sur 70 erreurs préexistantes
  (`typescript` 6.0.3 + `@types/react` 19.2.17 plus stricts que le code : `EntityNodeData` ne satisfait
  plus `Record<string, unknown>`). Le bundling Vite, lui, passe. Non traité ici.
