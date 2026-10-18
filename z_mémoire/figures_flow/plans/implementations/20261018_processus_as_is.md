# 20261018 — Fig. 2 refaite : `processus_as_is` (scène illustrée)

Remplace `figures_html/processus_recrutement_as_is.html` (§1.3.1, `body.typ:130`).

**Conception v1 abandonnée** (bandeau stats + 3 chaînes de cartes outils +
ruptures) : restylage des HTML, pas un vrai dessin — critique utilisateur
(« exactement les mêmes figures avec d'autres styles »). Règle retenue : toute
figure illustre le § avec une métaphore, elle ne ré-étiquette pas du texte.

## Conception v4 (retours au rendu de la v3) — scène nette reformulée
- **Bandeau de stats + conclusion du bas supprimés** (le § dit déjà 5–7
  outils/0 traçabilité et la carte RGPD) ⇒ scène seule.
- « **Offre** » placée **en haut** et reliée aux 3 canaux — en v3 elle
  n'alimentait qu'une seule tuile (arbre en T : tige → ligne horizontale → 3
  descentes fléchées, marge = mi-colonne exacte pour la ligne horizontale).
- **Canaux = 3 vraies plateformes d'emploi** : LinkedIn + **Indeed**
  (#2557A7) + **Glassdoor** (#0CAA41) — « on ne partage pas les offres par
  email, c'est vraiment rare » (décision utilisateur) ⇒ `AsisChannel.augmenté`
  sans `kind`, `ref` = union de logos ; `logos.tsx` + 2 paths Simple Icons.
- Récepteurs inchangés (mapping 1↔1 validé) : LinkedIn → `folder` Dossiers
  partagés · Indeed → `inbox` Boîte email · Glassdoor → `grid` Tableur ;
  bande 3 évaluation → décision et 2 ruptures `!` inchangées.

## Fait
- [x] `types/index.ts` : `AsisChannel` (`ref` union de logos, sans `kind`),
      `AsisEval`, champs `asisChannels`/`asisEvals`/`asisBreaks` —
      `AsisLink`/`asisLinks`/`asisStats`/`asisProblem`/`asisConclusion`
      supprimés.
- [x] `ProcessusAsIsNode.tsx` v4 (arbre en T, colonnes alignées par flex-gaps
      exacts, flèches SVG inline, zéro arête RF) + délégation `EntityNode`.
- [x] `processus_as_is.ts` (W 1240, données v4).
- [x] Validation `tsc` (erreurs systémiques connues hors périmètre) + `build`.
- [ ] Export utilisateur → `captures/8-figures-memoire/processus-as-is.svg` ;
      substitution `body.typ:130` (caption inchangée) ; `git rm
      processus_recrutement_as_is.png` ; `typst compile` ; commits
      `docs(typst)` + mise à jour plan.
