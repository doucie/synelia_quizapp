# Figure 14 — `memoire-merise-uml` (4.2.1) : REFONTE en inventaires équilibrés

Deux panneaux Atouts/Limites (4+4), sans gagnant, sans chevron. Le verdict
est une ligne de choix contextuel. La grille à surlignages plaidait pour
Merise — `VersusRow`, chevrons et intensités supprimés avec elle.

## Contenu (Claude/Gemini + table 4.2.1, raccourci sans changer le sens)

- [x] Merise 4+4, UML 4+4 (voir figure) ; verdict neutre « Données
      relationnelles → Merise ; objet, agile, comportements → UML ».
- [x] Ligne « Maîtrise pédagogique » non reprise (l’aspect francophone vit
      dans le texte + atout enseignement/administration francophones).
- [x] Insert `body.typ` après la table (:643), avant « À l’issue… » (:645) —
      inchangé (même fichier SVG).

## Décisions (refonte)

- [x] Variante `versus` : `versusRows`/`VersusRow` supprimés →
      `versusPanels?: VersusPanel[]` (`title/color/solid/strengths/
      weaknesses`) ; `versusVerdict` conservé, réorienté neutre.
- [x] `VersusNode` réécrit : 2 colonnes (~640 px, canevas 1400) — bandeau
      plein (navy solid/texte blanc vs bleu `210` solid/texte blanc) + groupes
      `ATOUTS`/`LIMITES` (micro-labels, items 18 px, marqueurs SVG `+`/`−`
      teinte du camp). Verdict blanc bordure navy, spans navy/bleu = camps.
- [x] Navy/bleu pleins imposés par le brief (exception hors SAFE_HUES).
      Zéro arête RF, aucune `<Handle>` ; rigide, `fontScale: 4/3`, fonte
      épinglée.

## Vérification (refonte)

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 1/0 : 2 panneaux, 8+8 items, 16 marqueurs, **0 chevron**,
      verdict.
- [x] Visuel : équilibre, aucun camp avantagé.
- [x] Re-export (1 raster, 0 `var()`), Typst, commit `feat(memoire)`,
      `AGENTS.md`.
