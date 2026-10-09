# Figure 14 — `memoire-merise-uml` (4.2.1 Démarche Merise retenue)

Arbitrage NUANCÉ sur 6 critères : Merise 4 lignes (2 nettes), UML 1 nette,
1 neutre. L’intensité du surlignage porte la nuance — net ≠ léger ≠ neutre.

## Contenu (brief = versions courtes de la table `body.typ:637-642`)

- [x] 6 lignes : Nature (neutre) / Découpage (Merise léger) / Données
      (**Merise net**) / Dynamique (**UML net**) / Pédagogie (Merise léger) /
      Compatibilité (**Merise net**), textes verbatim du brief.
- [x] Bandeau verdict verbatim (« Merise » navy, « UML » bleu, spans inline).
- [x] Insert `body.typ` après la table (:643), avant « À l’issue… » (:645).

## Décisions

- [x] Variante `versus` (`versusRows?: VersusRow[]`, `versusVerdict?:
      [string, string]`) → `VersusNode` monolithe (précédent `RingsNode`) :
      grille 460/260/460, en-têtes, 6 rangées, verdict pleine largeur. Zéro
      arête RF, aucune `<Handle>`.
- [x] Navy `hsl(222, 65%, 30%)` / bleu pâle `210 @ 0.08` (brief impose
      navy/bleu clair — exception documentée, hors SAFE_HUES). Net : bordure
      2 px + teinte `0.12` ; léger : 1 px + `0.06` ; neutre : rien.
- [x] Chevrons SVG inline (pas de `▸` texte, fonte-dépendant) : cellule
      gagnante, côté extérieur, vers le camp ; plein en net, 50 % en léger.
- [x] Corps 20, critères 19 gras, en-têtes 24, verdict 20 ; rigide,
      `fontScale: 4/3`, fonte épinglée, canevas ~1400 px.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 1/0 : 6 rangées, surlignages 4M/1U, chevrons 3◂/1▸, verdict.
- [x] Visuel : net > léger > neutre.
- [x] Export (1 raster, 0 `var()`), Typst, commit `feat(memoire)`, `AGENTS.md`.
