# 20261018 — Fig. 2 refaite : `processus_as_is` (chaîne à maillons rompus)

Remplace `figures_html/processus_recrutement_as_is.html` (§1.3.1, `body.typ:130`).

**Conception v1 abandonnée** (bandeau stats + 3 chaînes de cartes outils +
ruptures) : restylage des HTML, pas un vrai dessin — critique utilisateur
(« exactement les mêmes figures avec d'autres styles »). Règle retenue : toute
figure illustre le § avec une métaphore, elle ne ré-étiquette pas du texte.

## Conception v2 (approuvée)
- **Métaphore** : le § parle de « maillons » simples dont la chaîne est rompue
  entre outils et personnes ⇒ une **chaîne littérale de 4 maillons** (icônes
  Feather `megaphone`/`inbox`/`tool`/`checksquare` + nom + précision courte du
  texte) séparés par **3 jonctions ouvertes** (demi-maillons SVG qui ne se
  touchent pas + pastille `!`), chaque rupture étiquetée du symptôme verbatim
  (pertes d'information / lenteurs / dépendance à la mémoire individuelle).
- Bandeau de stats conservé en tête (5–7 / 0 / 0 % + phrase courte, décision
  utilisateur) ; conclusion RGPD/biais/perte de temps verbatim en pied.
- Divers : typo « Ressaissie » du source corrigée ; SVG décoratif gradient du
  source abandonné ; footer abandonné.

## Fait
- [x] `types/index.ts` : `Variant` + `'asis'`, `AsisLink`/`AsisBreak`,
      champs `asisLinks`/`asisBreaks`/`asisStats`/`asisProblem`/`asisConclusion`.
- [x] `src/components/Nodes/ProcessusAsIsNode.tsx` (v2 : 4 maillons, jonctions
      SVG rompues, jetons navy/danger) + délégation `EntityNode`.
- [x] `src/diagrams/memoire/processus_as_is.ts` (W 1240).
- [x] `src/utils/richText.ts` : `richParts()` (`**gras**` → `strong`).
- [x] Validation `tsc` (132 erreurs systémiques connues hors périmètre) + `build`.
- [ ] Export utilisateur → `captures/8-figures-memoire/processus-as-is.svg` ;
      substitution `body.typ:130` (caption inchangée) ; `git rm
      processus_recrutement_as_is.png` ; `typst compile` ; commits
      `docs(typst)` + mise à jour plan.
