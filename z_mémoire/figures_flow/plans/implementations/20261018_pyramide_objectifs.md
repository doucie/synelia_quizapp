# 20261018 — Fig. 4 refaite : `pyramide_objectifs` (vraie pyramide, apex perspective)

Remplace `figures_html/pyramide_objectifs.html` (§1.4.1 objectifs généraux,
`body.typ:162`).

**Conception v1 abandonnée** (bandes empilées numérotées + pastilles, colonne
de cartes) : restylage des HTML — même critique que figs 2/3. Puis **v2
abandonnée à son tour** : 4 bandes de largeurs dégressives avec pastilles =
toujours des cartes, le triangle n'était pas un triangle.

## Conception v2 (abandonnée au rendu)
- **Métaphore** : le § étage 3 objectifs généraux du socle vers le sommet et
  la caption introduit le pilotage par la donnée ⇒ **vrai triangle clip-path**
  (motif exact `MoscowNode` : 4 bandes égales `flex:1`, `bandClip` en %,
  sommet x=50 %/y=0, racine étirée) :
  - socle **Digitaliser le processus** (`--fig-secondary`) — « logique éclatée
    → plateforme centralisée », « moins de manipulations manuelles, parcours
    visible » ;
  - bande **Automatiser les évaluations** (`--fig-warning`) — « quiz
    configurable, correction automatique », « pré-filtrage plus objectif,
    jugement humain appuyé » (verbatim §) ;
  - bande **Faciliter la collaboration** (`--fig-success`) — « évaluations
    multi-recruteurs », « coordination entretiens & décisions » ;
  - apex **Piloter par la donnée** (`--fig-navy`), note *perspective* —
    décision utilisateur : apex conservé, avec annotation « perspective ».
- Texte **dans** les bandes (`--fig-soft`, ancrage 56 %, apex 82 %) — plus de
  colonne latérale, plus de pastilles, plus de légende : la forme seule dit
  l'empilement. Axe **MATURITÉ** (`--fig-frame`, flèche en haut) à gauche.

## Conception v3 (agrandissement, en cours d'approbation)
- **Bug constaté au rendu** : la v2 pyramidale s'écroule en fin de hauteur —
  les bandes `flex:1` n'ont aucune hauteur intrinsèque sans colonne de cartes
  (dans MoscowNode, c'est la colonne de cartes qui donne la hauteur). La leçon
  rejoint la règle pyramide : *une pyramide seule a besoin d'un moteur de
  hauteur.*
- **Correctif** : hauteurs de bandes FIXES 92/118/138/152 (= 500 px) — le
  précédent « hauteurs fixes admises dans le nœud » de `perimetre_projet` ;
  agrandissement pyramide 660 → 860 px, W 720 → 910 (axe MATURITÉ inclus) ;
  encre plus grande : titre 18, lignes 13. Données/sémantique inchangées
  (apex `perspective`).

## Fait
- [x] `types/index.ts` : `ObjPyrLevel` réduit à (title, lines, color, note?),
      champ `objPyrLevels` (sommet → socle).
- [x] `src/components/Nodes/ObjectifsPyramidNode.tsx` réécrit (clip-path +
      axe, zéro carte) ; `src/diagrams/memoire/objectifs_pyramide.ts`
      (W 720, ordre sommet → socle).
- [x] Validation `tsc` + `build` ; commit `refactor(memoire)` v2 (3b39c9c).
- [x] v3 : `BAND_H` fixes 92/118/138/152, pyramide 860, W 910, encre 18/13 ;
      validation `tsc` + `build`.
- [ ] Export utilisateur → `objectifs-pyramide` ;
      substitution `body.typ:162` (caption inchangée) ; `git rm
      pyramide_objectifs.png` ; `typst compile` ; commits `docs(typst)`.
