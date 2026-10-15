# Figure 17 (v2) — `memoire-niveaux-tests` (7.1 Stratégie de tests)

Trois niveaux outillés, dans l’ordre du texte : unitaires/slice,
intégration, fonctionnel. Chaque bande porte son objectif, ses outils et
des exemples en langage courant, sourcés du dépôt réel.

> V1 `memoire-cible-tests` (cible de risque, `bullseye`) abandonnée avant
> tout export : jugée ambiguë et difficile à comprendre — la densité de
> points demandait une légende pour être lue. Code supprimé
> (`BullseyeNode.tsx`, `cible_tests.ts`, champs `bulls*`), jamais référencé
> dans `body.typ`, aucun SVG produit.

## Contenu (sourcé du dépôt réel, vérifié)

- [x] Niveau 1 unitaires/slice (`mvnw test`) : permissions, formulaires et
      versions, évaluations, tokens, contrats JSON → ~30 classes
      (`PermissionServiceTest`, `FormVersionBusinessTest`,
      `FormDtoJsonContractTest`…).
- [x] Niveau 2 intégration (tests contrôleurs, `Postman`) : endpoints REST,
      contrats, scénarios rejouables (campagnes, quiz public, entretiens,
      notifications) → `Evaluations/Decision/DashboardControllerTest` + 2
      collections Postman.
- [x] Niveau 3 fonctionnel (`spec.ts`, recette manuelle) : quiz public,
      candidature, vérification email, suivi → ~22 specs (`quiz.spec`,
      `apply-position.spec`, `verify-email.spec`…).
- [x] Exemples simplifiés (retour demandeur : « noms faciles à comprendre »)
      + mention « Extraits du dépôt, pas un inventaire » (honnêteté jury).

## Décisions

- [x] Nouvelle variante `levels` (`testLevels?: TestLevel[]` : num/nom/
      icône/couleur/objectif/outils/exemples) → `LevelsNode`, dispatchée
      depuis `EntityNode`. Nœud composite unique, zéro arête, aucune
      `<Handle>` (précédent fig. 2).
- [x] 3 bandes horizontales ÉGALES, ordre du texte (1 en haut → 3 en bas) :
      la figure ne mesure pas l’effort, elle montre l’organisation — pas
      une pyramide des volumes. Chaque bande : médaillon numéroté + Feather
      (`tool`/`link`/`monitor`), nom + objectif `/85`, chips outils en mono
      teinté sur `muted`, chips exemples en clair bordure `muted`.
      Liseré 4 px + bordure teinte `0.30` (langage kanban fig. 13).
- [x] Mise en page en flux (hauteurs auto) : seule la largeur est posée
      (`exportWidth` = 1100 — resserré depuis 1400, le texte le plus long
      tient avec marge), jamais `height` (invariant n°1).
- [x] Figure rigide (`rigidLayout`, `fontScale: 4/3`, Cabinet Grotesk).
- [x] `body.typ` § 7.1 : `image(.../memoire-niveaux-tests.svg)` + caption ;
      phrase « esprit de la pyramide » conservée (toujours vraie) ;
      `pyramide_tests.png` intact, non référencé.

## Vérification

- [x] `tsc` (zéro erreur nouvelle, reste = baseline), `vite build`
      (303 modules).
- [x] Visuel validé par le demandeur (resserré 1400 → 1100).
- [x] Export ⤓ (`memoire-niveaux-tests.svg`, 508 Ko), `body.typ` § 7.1
      (image + caption), mémoire recompilé, `AGENTS.md`.
