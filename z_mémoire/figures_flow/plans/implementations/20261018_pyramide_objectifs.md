# 20261018 — Fig. 4 refaite : `pyramide_objectifs` (bandes empilées)

Remplace `figures_html/pyramide_objectifs.html` (§1.4.1 objectifs généraux,
`body.typ:162`). Décisions utilisateur : **bandes empilées** (fidèle au
source), PAS un vrai triangle clip-path (apex étriqué, pastilles debout
impraticable — leçon fig. 23) ; légende HTML supprimée (redondante).

## Verbatim source (figé, sommet → socle)
- 4 Piloter par la donnée : KPIs de recrutement / Analyse des sources / Taux de
  conversion / Amélioration continue.
- 3 Faciliter la collaboration : Évaluations multi-recruteurs / Tableaux de
  bord partagés / Notifications temps réel / Traçabilité décisionnelle.
- 2 Automatiser les évaluations : Quiz paramétrables / Correction
  automatique / Pipeline configurable / Relances et notifications / Scoring
  objectif.
- 1 Digitaliser le processus de recrutement : Plateforme web centralisée /
  Base candidats unique / Gestion des campagnes / Suppression Excel / emails /
  Portail candidat autonome.
- Ordre affiché sommet→socle (4 en haut, 1 en bas) — caption du mémoire :
  « Du socle de digitalisation au pilotage stratégique par la donnée. »

## Design
- Variante `'objpyr'` → `ObjectifsPyramidNode` (pattern `MoscowNode` :
  racine `items-stretch`, bandes `flex:1` mais largeurs décroissantes vers le
  sommet au lieu de clip-path : 100 % / 88 % / 76 % / 64 % centrées).
- Pastilles = motif fig. 23 (`tinted(level)` ~12 %, bordure 30 %, texte
  `hsl(var(--foreground))`), pastilles du niveau 4 poussées vers `--fig-navy`.
- Jetons niveaux : 1 `--fig-secondary`, 2 `--fig-warning`, 3 `--fig-success`,
  4 `--fig-navy` (réglable à l'œil à l'export) — num pastilles à gauche,
  connecteur trait `--fig-frame` + chevron haut entre bandes.
- Légende du source NON reprise ; footer NON repris.

## Fait
- [ ] `types/index.ts` : `Variant` + `'objpyr'`, type `ObjPyrLevel`
      (num, title, items[], token key), champ `objPyrLevels` (sommet→socle).
- [ ] `src/components/Nodes/ObjectifsPyramidNode.tsx` + EntityNode delegation.
- [ ] `src/diagrams/memoire/pyramide_objectifs.ts` (W ~1240).
- [ ] Validation `tsc`/`build` ; export utilisateur ; substitution
      `body.typ:162` (caption inchangée) ; `git rm pyramide_objectifs.png` ;
      `typst compile` ; commits.
