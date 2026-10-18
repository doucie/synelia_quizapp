# 20261018 — Fig. 2 refaite : `processus_as_is` (scène illustrée)

Remplace `figures_html/processus_recrutement_as_is.html` (§1.3.1, `body.typ:130`).

**Conception v1 abandonnée** (bandeau stats + 3 chaînes de cartes outils +
ruptures) : restylage des HTML, pas un vrai dessin — critique utilisateur
(« exactement les mêmes figures avec d'autres styles »). Règle retenue : toute
figure illustre le § avec une métaphore, elle ne ré-étiquette pas du texte.

**Conception v2 abandonnée après rendu utilisateur** (chaîne littérale de 4
maillons à jonctions rompues) : demande d'un truc explicite — diffusion sur
les réseaux (logos) puis **CV qui arrivent des différents réseaux à la fois**
(feuilles tombant des canaux). Règle affinée : représentation littérale du
processus (cf. fig. 16, instinctive).

## Conception v3 (en cours d'approbation) — scène nette
- **3 bandes verticales** : ① Diffusion : tuile « Offre » (`briefcase`) →
  flèche → 3 canaux réels [logo LinkedIn en marque `#0A66C2` · boîte email
  (`mail`) · plateformes d'emploi (`briefcase`)] ; ② Réception : sous chaque
  canal, **une feuille-CV** (`file-text`, inclinée, étiquette « CV ») plonge
  en dashed danger vers **son** récepteur [LinkedIn → `folder` Dossiers
  partagés · email → `inbox` Boîte email · plateformes → `grid` Tableur] ;
  ③ Évaluation → décision : 3 cartes enchaînées [Évaluations papier
  (`file-text`) → Appel/Visio (`phone`) → Décision finale (`checksquare`),
  carte finale teintée danger]. Rangée par l'utilisateur : pas de pile en vrac,
  chaque feuille va à son récepteur (« Neat clean »).
- **2 ruptures `!`** entre bandes : « Diffusion non tracée » / « Ressaisie
  manuelle · fichiers dispersés » ; la justification décisionnelle absente
  porte le hint de la carte finale (3 breaks v2 fusillés : lenteurs /
  dépendance à la mémoire.)
- Bandeau de stats + phrase-problème en tête conservés ; conclusion RGPD
  verbatim en pied (décisions déjà validées).
- Assets : `logos.tsx` + `linkedin` (path Simple Icons récupéré en ligne,
  marque `#0A66C2`) ; `icons.tsx` + `briefcase`/`filetext`/`phone`/`folder`
  (paths Feather).

## Fait
- [x] `types/index.ts` : `AsisChannel` (`kind: 'logo' | 'icon'`, `ref`,
      `receiver: { icon, label, note }`), `AsisEval` (icon
      `filetext|phone|checksquare`), champs `asisChannels`/`asisEvals` —
      `AsisLink`/`asisLinks` supprimés.
- [x] `ProcessusAsIsNode.tsx` v3 (scène, colonnes alignées bande 1 ↔ bande 2,
      flèches SVG inline, zéro arête RF) + délégation `EntityNode`.
- [x] `processus_as_is.ts` (W 1240, données v3).
- [x] Validation `tsc` (erreurs systémiques connues hors périmètre) + `build`.
- [ ] Export utilisateur → `captures/8-figures-memoire/processus-as-is.svg` ;
      substitution `body.typ:130` (caption inchangée) ; `git rm
      processus_recrutement_as_is.png` ; `typst compile` ; commits
      `docs(typst)` + mise à jour plan.
