# Figure 14 — `memoire-merise-uml` (4.2.1) : v3 BALANCE 3-3 PROJET

6 points projet-spécifiques, 3 vers Merise (2 nets + 1 léger), 3 vers UML
(2 nets + 1 léger) : le vrai visage du projet. Chaque ligne montre vers quel
camp penche le point — c’est ce sens de la balance qui fait la valeur de la
figure (v1 : forme juste, fond biaisé ; v2 : fond équilibré mais aveugle,
simple répétition de texte). Verdict neutre, pas de ligne Pédagogie.

## Contenu (Claude/Gemini + table 4.2.1, raccourci sans changer le sens)

- [x] Merise 4+4, UML 4+4 (voir figure) ; verdict neutre « Données
      relationnelles → Merise ; objet, agile, comportements → UML ».
- [x] Ligne « Maîtrise pédagogique » non reprise (l’aspect francophone vit
      dans le texte + atout enseignement/administration francophones).
- [x] Insert `body.typ` après la table (:643), avant « À l’issue… » (:645) —
      inchangé (même fichier SVG).

## Décisions (v3 — balance 3-3)

- [x] 6 lignes validées : Base relationnelle (M net) / Règles de gestion
      (M net) / Équipe métier (M léger) / Code objet (U net) / Comportements
      dynamiques (U net) / Agilité et outillage (U léger). Verdict neutre.
- [x] `VersusNode` re-réécrit en grille (mécanique v1 : surlignages,
      chevrons) ; `VersusPanel` supprimé avec la v2 (pas de code mort) →
      retour de `VersusRow` (`criterion/left/right/winner/strong`).
      En-tête centre « Point projet », UML plein bleu/blanc (symétrie).
- [x] Navy/bleu, corps 20, critères 19, canevas 1320 — repris de la v1
      (validés à l’écran).

## Vérification (v3)

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 1/0 : 6 rangées, 3◂/3▸ (2 nets + 1 léger par camp), verdict.
- [x] Visuel : équilibre 3-3, aucun camp écrasé.
- [x] Re-export (1 raster, 0 `var()`), Typst, commit `feat(memoire)`,
      `AGENTS.md`.
