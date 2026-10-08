# Figure 8 — `memoire-auth-fourche` (3.2.1 Authentification)

Fourche qui converge : un départ unique en haut, deux colonnes (internes /
candidat), une boîte large en bas où les deux traits fusionnent en un seul
point. Le message est la **convergence**, pas la comparaison — géométrie en Y,
volontairement distincte du comparateur de pipelines (deux rails indépendants).

## Contenu (verbatim brief + § 3.2.1, emojis → icônes Feather)

- [x] Départ : « Un utilisateur arrive sur la plateforme »
- [x] Bandeaux : « Utilisateurs internes » / « Candidat — parcours public »
- [x] Gauche (210) : identifiants (`key`) → RBAC (`shield`) → droits
      contextualisés (`users`) → espace interne différencié (`lock`)
- [x] Droite (330) : lien/token (`link`) → email (`mail`) → code suivi
      (`hash`) → accès restreint à sa candidature (`user-check`)
- [x] Convergence : « Accès contrôlé, conforme aux droits réels de l’utilisateur »
- [x] Insert `body.typ` après § 3.2.1, 2e paragraphe (:393)

## Décisions

- [x] Variante `auth` (`start`/`band`/`step`/`merge`) → `AuthNode`, dispatch
      `EntityNode`. Champs : `authKind`, `authIcon`, `authColor`.
- [x] Icônes Feather (MIT) partagées dans `Nodes/icons.tsx` : `key`, `shield`,
      `users`, `lock`, `link`, `mail`, `hash`, `user-check`. Pas de `ticket`
      chez Feather (il n’existe pas) → `link` pour « lien/token ». `PersonaNode`
      garde son jeu local (hors périmètre).
- [x] Couleurs votées : interne `210`, candidat `330` (cohérent fig. 1/6 :
      SA=210, C=330). Étapes fond teinté `0.06`, nom coloré ; convergence
      neutre, bordure encre 2 px. `128`/`30` interdits (sens pris en fig. 4/7).
- [x] Convergence en un point : les 2 arêtes d’arrivée portent
      `targetHandle: 'top'` + `noAnchorOffset: true` — sans ça, l’offset
      d’ancrage partagé éventaille à ±14 px (deux traits côte à côte). En
      `smoothstep`, les deux segments finaux verticaux se recouvrent → un seul
      tronc. La fourche garde l’offset (±14 px = l’éventail voulu).
- [x] Tous les handles déclarés → aucune entrée dans `edgeAnchors.ts`
      (précédent `arbre_sgbd`). Arêtes `type: 'traitement'`, muettes.
- [x] Bandeaux distincts des étapes (retour demandeur) : fond blanc opaque
      version thème (`hsl(var(--background))`, pas `#ffffff` figé) + bordure
      2 px couleur de branche. Même langage que la convergence.
- [x] Rigide : `rigidLayout`, `fontScale: 4/3`, fonte épinglée, `exportWidth` =
      `width`, `minHeight` par rangée (jamais `height`), texte `/85`.

## Géométrie (12 nœuds / 10 arêtes)

- [x] Colonnes 480 px (`x` 60 / 660, canevas 1200) ; départ 560 px centré
      (`x` 320, `y` 40) ; bandeaux `y` 220 ; étapes pas 140 dès `y` 340 ;
      convergence 1080 px (`x` 60, `y` 940).
- [x] L3 raccourci « Vérification des droits contextualisés » : la parenthèse
      `(campagne/entité)` faisait passer l’étape sur 2 lignes (150 px pour un
      pas de 120, chevauchement L3/L4 relevé au harness). Convention MCT :
      parenthèses techniques retirées, même sens — le § 3.2.1 au-dessus de la
      figure porte le détail campagne/entité. `STEP_MIN` 116 (relevé ~115 max).
- [x] Relever écrans : `minHeight` étapes, plancher convergence, entraxes.
- [x] Contrôle visuel : le tronc de convergence ne fait qu’un pixel de large.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Export CDP + `measure-svg` + `inspect-svg` (12 rasters, 0 `var()`).
- [x] Compile Typst, PDF relu, commit `feat(memoire)`, MAJ `AGENTS.md`.
