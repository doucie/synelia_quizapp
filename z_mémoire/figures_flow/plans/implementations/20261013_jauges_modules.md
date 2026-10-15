# Figure 18 — `memoire-jauges-modules` (8.2 Fonctionnalités implémentées)

Le tableau § 8.2 en six jauges : une ligne par module, remplissage selon
le niveau qualitatif, synthèse verbatim. Dernière figure de la série
(`plan_figures_claude.md` : 18 figures + machine à états).

## Contenu (verbatim tableau § 8.2, `body.typ:1404-1409`)

- [x] 5 × Élevé (vert 128, jauge 88 %) : Campagnes et formulaires,
      Candidatures, Quiz technique, Entretiens, Évaluations et décisions.
- [x] 1 × Moyen à élevé (ambre 30, jauge 64 %, choix demandeur) :
      Administration transverse — signale le module perfectible
      (« certaines zones restent perfectibles », résumé).
- [x] Synthèses raccourcies sans changer le sens ; label textuel à côté
      de la jauge, aucun pourcentage (niveaux qualitatifs, pas de fausse
      précision face au jury).

## Décisions

- [x] Nouvelle variante `gauge` (`gaugeRows?: GaugeRow[]` : nom/icône/
      `level: 'high'|'mid'`/synthèse) → `GaugeNode`, dispatchée depuis
      `EntityNode`. Nœud composite unique, zéro arête, aucune `<Handle>`
      (précédent fig. 17).
- [x] 6 lignes en flux (hauteurs auto) : médaillon 56 (`muted`, icône
      teinte niveau) + nom + synthèse italique `/85` + jauge 300×18
      (fond `muted`) + label gras à droite. Seule la largeur est posée
      (`exportWidth` = 1300), jamais `height` (invariant n°1).
- [x] Icônes : `megaphone`/`inbox`/`checksquare`/`calendar` pixel-identiques
      à la fig. 10 (boucle besoins → livré) ; `sliders` (kanban fig. 13,
      colonne Décisions et permissions) + `tool` en substitutions
      documentées — ni balance ni engrenage n’existent chez Feather.
- [x] Figure rigide (`rigidLayout`, `fontScale: 4/3`, Cabinet Grotesk).
- [x] Retrait légende fig. 17 (« Noms simplifiés… », retour demandeur) :
      `NOTE_SIZE` + `<span>` supprimés dans `LevelsNode.tsx` (flux, aucun
      plancher à reprendre).
- [x] Tableau § 8.2 conservé + figure après (choix demandeur) ; caption
      « Couverture fonctionnelle par module — niveaux et synthèses ».

## Vérification

- [x] `tsc` (zéro erreur nouvelle, reste = baseline), `vite build`.
- [x] Visuel validé par le demandeur.
- [x] Export ⤓ (fig. 17 ré-export sans légende, 478 Ko + fig. 18, 505 Ko ;
      1 raster chacune, 0 `var()`), `body.typ` § 8.2 (figure après le
      tableau), mémoire recompilé (12,6 Mo), `AGENTS.md`.
