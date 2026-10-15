# Addenda — détails rapatriés de AGENTS.md (condensation 2026-10-15)

> Chaque section complète le plan indiqué : faits exacts qui n’y figuraient
> pas (audit de couverture du 2026-10-15 — voir todo de session). AGENTS.md
> ne garde qu’une ligne par figure + renvoi. Ne rien enlever ici sans
> remettre la ligne correspondante dans AGENTS.md.

## MCT — `interface CrossLink` (complète `20261001_decoupe_parcours_mct.md`)

- Modèle dans `src/diagrams/traitements/v2/mct_combine.ts` : `interface
  CrossLink` — un résultat de T*n* se relie à la **synchronisation** de
  T*n+1* (`tN-mctN-op`, `targetHandle: 'top'`), pas à son événement ;
  l’événement reste le déclencheur interne du traitement suivant.

## MCT — code mort `MotMatrix` / `MotMctCell` / `MotSync` (complète `20261002_mct_ajustements_t0_t3_t4_t6_t7.md`)

- `ProcessNode.tsx:370-371` : « `motMatrix` n’est fourni par aucune figure
  enregistrée, donc `MotMatrix` / `MotMctCell` / `MotSync` ne sont… » morts.
  Ne pas les ressusciter sans fournisseur.

## Fig. 1 — export et insertion (complète `20261006_acteurs_systeme.md`)

- Export : `z_mémoire/template_memoire/typst/captures/8-figures-memoire/
  memoire-acteurs-systeme.svg`, inséré après les paragraphes des acteurs de
  la section 1.3.2. L’ancien `captures/6-architecture/acteurs_systeme.png`
  n’est référencé nulle part et reste intact.

## Fig. 2 — insertion (complète `20261006_perimetre_projet.md`)

- Export : `z_mémoire/template_memoire/typst/captures/8-figures-memoire/
  memoire-perimetre-projet.svg`, inséré après le paragraphe des frontières
  de la section 1.3.3.

## Fig. 5 — `stackKind` et bandeau (complète `20261007_tour_stack.md`)

- `stackKind: 'layer' | 'band' | 'caption'` (`tour_stack.ts:43,67`,
  `StackNode.tsx:102-115`). Bandeau `REST en couches` en `vertical-rl`,
  hauteur exacte par `minHeight` (4×150 + 3×20, couches à leur plancher).

## Fig. 6 — teintes (complète `20261007_fiches_persona.md`)

- Teintes fig. 1 (SA `210`, A `240`, R `285`, C `330`).

## Fig. 7 — `ArrowClosed` et légende (complète `20261007_cycle_etape.md`)

- Pointes de flèche : `markerEnd` (`ArrowClosed`, couleur explicite).
- Légende body : occurrences pré-crées + réouverture + dossier, sans
  numéro dur (un comparateur à venir casserait un numéro écrit en dur).

## Fig. 8 — médaillon et mesure (complète `20261008_auth_fourche.md`)

- Étapes = lignes légères (médaillon 44 px + texte).
- Convergence mesurée `dx=0` au harness (pastille `STEP_MIN` 116, pas 140).

## Fig. 9 — rejet des 2 colonnes (complète `20261009_notifications.md`)

- En 2 colonnes, haut-gauche→bas-droit croisait toujours
  bas-gauche→haut-droit : d’où les **3 colonnes, zéro croisement**.

## Fig. 13 — `hubTitle` (complète `20261010_rg_kanban.md`)

- `hubTitle` repassé en une ligne 24 px (`hubLines` supprimé — a failli
  manger `Medallion`, tsc 96→76).

## Fig. 14 — grille et exception couleurs (complète `20261010_merise_uml.md`)

- Grille 460/260/460, surlignages net/léger/neutre.
- Navy/bleu imposés par le brief : exception hors SAFE_HUES, assumée.

## Fig. 15 — logo 44 (complète `20261010_arbre_depot.md`)

- Logo 44 px (`TreeNode.tsx:32`, miroir des autres figures).

## Fig. 16 — `isStrong` et aération (complète `20261010_deploiement_local.md`)

- 4 flèches `markerEnd` **`isStrong`** (pattern fig. 7), pastille
  `labelPx: 20` (~7,5 pt imprimés).
- Aération 2026-10-12 : spring +40 px à droite (couloir proxy 170→210 px),
  angular/mysql +40 px vers le bas (lien proxy en escalier `right→left`),
  notes `NOTE_SIZE` 16→18 (`DeployNode.tsx:30`).

## Fig. 17 — légende retirée (complète `20261013_niveaux_tests.md`)

- Légende « Noms simplifiés — extraits du dépôt, pas un inventaire »
  retirée (retour demandeur) : `LevelsNode.tsx` sans `NOTE_SIZE`, flux
  intact — penser au ré-export ⤓ à chaque retouche.

## Organigramme — encodage, ordre d’export, placement (complète `20261004_organigramme_paysage_refonte.md`)

- Les deux dépassements de plancher venaient d’un **double encodage
  CP1252** du fichier (commit `0efbba4`) : `é` y occupait deux caractères,
  donc les intitulés passaient sur une ligne de plus. (Contexte aussi en
  `20261005_confirmations_reinitialisation.md:109`.)
- **Régénérer le SVG puis le mémoire, jamais l’inverse** ; le SVG exporté
  est la source de vérité imprimée.
- Page paysage : `placement: none` (`header: none` sur cette page, donc une
  figure flottée n’aurait nulle part où aller) — cf. `theme.typ`
  `#landscape-figure`.
- Dimensions de référence : canevas 2644×1582, export recadré 2531 px
  (cf. `20261003_organigramme_synelia.md:234`).
