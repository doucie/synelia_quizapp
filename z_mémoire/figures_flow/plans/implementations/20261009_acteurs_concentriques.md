# Figure 11 — `memoire-anneaux-acteurs` (3.2.9, tableau 1 uniquement)

Le périmètre de contrôle de chaque acteur EN CONTIENT un autre : centre =
Candidat (restreint), extérieur = Super admin (englobant). Ne pas inverser.
Cible le **premier** tableau (Acteur/Opérations/Données/Niveau) — pas le
tableau Oui/Non/Partiel qui suit (déjà traité en matrice à pastilles).

## Contenu (tableau 1, `body.typ:476-479`, listes raccourcies)

- [x] Centre→extérieur : Candidat (330/C) → Recruteur (285/R) →
      Administrateur (240/A) → Super admin (210/SA). Teintes + initiales
      fig. 1 : la taille porte la hiérarchie, la couleur identifie le rôle
      (précédent fig. 6/8).
- [x] Insert `body.typ` entre les deux tableaux (:480/:482).

## Décisions

- [x] **Un seul nœud composite, zéro arête RF** : `RingsNode` monolithe
      (précédent `ScopeNode`/fig. 6/10) — 4 disques SVG (`r` 140/230/320/410,
      alpha 0.26→0.08 + contour 2 px) + labels HTML absolus + 4 callouts +
      lignes de fuite SVG. Aucune `<Handle>`, aucun ancrage à régler.
- [x] Texte sur anneau : **rôle seul** (retour demandeur — un niveau à cheval
      sur deux anneaux disait l’inverse du message de contenance), centré au
      milieu radial (0/185/275/365, règle uniforme, `maxWidth` = cordes).
      Niveau verbatim déménagé en 3ᵉ mini-bloc des callouts (`NIVEAU DE
      CONTRÔLE`, même langage que `OPÉRATIONS`/`DONNÉES`). `control`
      conservé dans `RingData`, aucun changement `types/`.
- [x] Callouts élargis 300→340, labels **inline** (`Opérations : …` — 3 lignes
      récupérées), corps 15→**18** (~7,3 pt imprimés). Bas descendus 620→680
      (collision Relevée au harness, 24 px), `H` 940→1100 (la hauteur ne
      change pas l’échelle d’impression — repli sans coût).
- [x] 4 callouts combinés (voté) : gauche Candidat/R, droite A/SA —
      pastille-initiale fig. 1 **au point de contact sur l’anneau**, mini-blocs
      Opérations/Données. Lignes calculées (`C + r·d̂`), pas mesurées.
- [x] Modèle générique : `rings?: RingData[]` (`role/control/color/initial/
      ops/items`) ; layout fixé par le composant. Rigide, `fontScale: 4/3`,
      fonte épinglée, canevas ~1500 px.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 1/0 : 4 cercles + 4 callouts + 4 lignes + 4 pastilles.
- [x] Visuel : ordre centre→extérieur, textes lisibles, zéro collision.
- [x] Export (1 raster, 0 `var()`), Typst, commit `feat(memoire)`, `AGENTS.md`.
