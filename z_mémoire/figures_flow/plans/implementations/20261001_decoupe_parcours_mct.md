# PLAN — Découpe du MCT cycle de vie en deux figures de parcours

Date : 2026-10-01
Précédent : `plans/implementations/20260930_mct_combine_figure.md` (création de la figure combinée des
7 traitements) et `plans/implementations/20260930_traitements_verrou_mct.md` (encadrements).

## Contexte

La figure `mct-v2-combine` assemblait les **7 MCT v2** sur une seule figure verticale de
7 rangées de 640 px, soit **4480 px de haut**. Le `fitView` (`DiagramCanvas.tsx:621`,
`padding: 0.2`) la ramenait à un zoom **≈ 0.16** : sur le canvas de la sidebar, la figure devenait
illisible — c'est ce qui a motivé la découpe.

Découpage retenu, sur une coupure fonctionnelle :

| Figure | Traitements | Phase | Sections | Préfixes |
|---|---|---|---|---|
| 1 | T0, T1, T2 | amont — de la campagne au quiz | `T0`, `T1`, `T2` | `t0-`, `t1-`, `t2-` |
| 2 | T3, T4, T5 | aval — de l'entretien à la décision | `T3`, `T4`, `T5` | `t3-`, `t4-`, `t5-` |

Chaque figure fait **3 rangées (~1920 px)**, zoom `fitView` **≈ 0.3**. Les lignes sont réindexées à
partir de 0 dans chaque figure (`i * ROW_HEIGHT` relatif au lot, plus à l'index global).

## Décisions

- **T6 (audit) n'est dans aucune des deux figures.** Ce n'est pas un oubli : l'audit n'a **aucun lien
  entrant ni sortant**, il n'a jamais fait partie de la chaîne. Le plan du 2026-09-30 le constatait
  déjà (« T6 reste isolé en bas, aucune arête transverse »). Il reste uniquement sur sa figure
  individuelle `mct-v2-6-audit`, déjà enregistrée : une troisième figure « parcours = T6 » n'aurait
  été qu'un doublon strict.
  Effet de bord desirable : l'ancien titre « Parcours complet (T0 → T6) » était **inexact**, le
  découpage le supprime.
- **La couture T2 → T3 n'est pas représentée.** `x-t2-r1-t3-op` ne peut pas traverser deux figures :
  « Quiz validé » (fig. 1) reste donc sans arête sortante et « Entretien planifié » (fig. 2) sans
  arête entrante. **Rien n'est ajouté** — ni nœud de sortie/entrée, ni modification des libellés des
  MCT — pour ne pas introduire d'élément absent du modèle Merise. La continuité est portée par les
  titres « 1/2 » et « 2/2 » et par le texte du mémoire.
- **`mct-v2-combine` est supprimé**, remplacé par les deux figures. Rien d'autre ne l'importait.
- **Les préfixes restent attachés aux numéros de traitement** (`t3-`, `t4-`, `t5-` dans la figure 2,
  et non `t0-`, `t1-`, `t2-`) : les badges des encadrements restent T3/T4/T5 et les ids de nœuds
  restent alignés sur les figures individuelles.
- **Mise en page inchangée** : verticale, 1 traitement par rangée, pas d'offset X (les MCT partagent
  déjà la bande `x ∈ [20, 420]`).

## Résultat implémenté

- [x] `src/diagrams/traitements/v2/mct_combine.ts` — le fichier devient une **fabrique**
      `buildCombine({ id, title, domain, entries, crossLinks })`. `prefixNodes` / `prefixEdges` /
      `ROW_HEIGHT` inchangés, `sections` toujours dérivé des entries. Deux exports :
      `mctParcours1` et `mctParcours2`. `mctCombine` et `MCT_COMBINE_SECTIONS` supprimés (le second
      n'avait aucun consommateur hors du fichier).
- [x] **Garde sur les liens croisés** : un `CrossLink` dont une extrémité est absente du lot est
      retiré de la figure et signalé par `console.error`. Sans elle, un traitement déplacé d'une
      figure à l'autre produirait une arête pendante dans le vide, sans erreur visible.
- [x] `src/diagrams/index.ts` — import `mctParcours1, mctParcours2`, les deux entrées remplacent
      `mctCombine`, commentaire du bloc `(8 : 7 MCT + figure combinée)` → `(9 : 7 MCT + 2 figures de parcours)`.
- [x] `src/index.css` et `src/components/DiagramCanvas.tsx` — les deux commentaires qui justifiaient
      les icônes à 24 px écran constants en citant `mct-v2-combine` à ≈ 0.16 : référence de figure et
      chiffres mis à jour (≈ 0.3, ~7 px). **La décision de design reste valide**, seul l'exemple change.
- [x] `npm run lint` : **68 erreurs, baseline exacte, 0 nouvelle** (aucune sur les fichiers modifiés).
- [x] `npx vite build` : OK — 641.00 kB / 174.31 kB gzip.

## Fichiers

| Action | Fichier |
|---|---|
| Réécrire | `src/diagrams/traitements/v2/mct_combine.ts` |
| Modifier | `src/diagrams/index.ts` |
| Modifier (commentaire) | `src/index.css`, `src/components/DiagramCanvas.tsx` |

Aucune modification des 7 MCT individuels, de `ProcessNode.tsx`, `TreatmentFrames.tsx`,
`TraitementEdge.tsx`. T6 est intact.

## Métadonnées

```ts
// Figure 1
id: 'mct-v2-parcours-1'
title: 'MCT v2 — Parcours 1/2 (T0 → T2)'
domain: 'MCT v2 — Amont : de la campagne au quiz'

// Figure 2
id: 'mct-v2-parcours-2'
title: 'MCT v2 — Parcours 2/2 (T3 → T5)'
domain: 'MCT v2 — Aval : de l’entretien à la décision'
```

`category: 'traitements'` est appliqué par la fabrique, comme avant : `DiagramCanvas.tsx:297,335`
n'applique le type d'arête `'traitement'` que pour cette catégorie.

## Sections et liens croisés

| | Avant (`mct-v2-combine`) | Figure 1 | Figure 2 |
|---|---|---|---|
| Nœuds | 28 | 11 (3 + 4 + 4) | 14 (5 + 5 + 4) |
| Arêtes internes | 21 | 8 | 11 |
| Liens croisés | 7 | 2 | 4 |
| Arêtes totales | 28 | 10 | 15 |
| Sections | 7 | 3 | 3 |

- Figure 1 : `x-t0-r1-t1-op`, `x-t1-r1-t2-op`.
- Figure 2 : `x-t3-r1-t4-op`, `x-t4-r1-t5-op`, `x-t4-r2-t5-op`, `x-t4-r3-t5-op`.
- Perdue : `x-t2-r1-t3-op` (la couture). Retirée du code, pas mise en réserve.
- Disparition de T6 : 3 nœuds, 2 arêtes internes. Contrôle : 28 − 3 = 25 nœuds, 28 − 2 − 1 = 25 arêtes.

## Choix assumés

- **Les badges de la figure 2 commencent à T3**, pas à T1. C'est la conséquence directe du choix
  « préfixes attachés aux numéros de traitement » : un traitement ne portera jamais le badge `T0`
  dans la figure 2. La figure 2 affiche `T3`, `T4`, `T5`.
- **`section.label` est inchangé** : il reprend toujours `source.domain` du MCT individuel
  (`MCT v2 - T3 – Entretien`…). Seuls les libellés de la *figure* (`domain`) sont nouveaux.
- **Aucune figure « vue d'ensemble »** des 7 traitements n'est conservée : à ≈ 0.16 de zoom elle se
  ferait concurrence avec les deux figures de parcours dans la sidebar.

## Points de vigilance

- **Les positions repartent des valeurs en dur.** Les ids de figure étant nouveaux, les clés
  `figures_flow:diagram:mct-v2-parcours-1` et `-2` sont vierges ; l'ancienne clé
  `figures_flow:diagram:mct-v2-combine` reste orpheline, sans conséquence. Un « Reset » avant les
  tests de mise en page est recommandé.
- **Les verrous d'encadrement sont vides au départ** sur les deux figures (ils étaient persistés par
  figure). Le comportement du verrou est inchangé, mais rien n'est verrouillé après le découpage.
- **Les ids de nœuds sont identiques à ceux de l'ancienne figure** (`t0-mct0-e1` … `t5-mct5-r2`) :
  si un jour on remet `id: 'mct-v2-combine'` sur la figure 1, ses positions sauvegardées sont
  retrouvées telles quelles.
- **Validation manuelle** : ouvrir les deux figures, vérifier les 3 encadrements et les 2 / 4 liens
  croisés, confirmer qu'**aucune arête pendante** n'apparaît dans la console, et re-tester le survol
  et le verrou sur chacune.
