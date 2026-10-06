# Quadrant frontend — Figure 3 (2026-10-06)

## Objectif

Positionner Angular, React et Vue.js sur deux axes de compromis pour montrer
pourquoi Angular correspond le mieux au projet : structure imposée et robustesse
entreprise. Aucun quadrant surligné : c’est la position d’Angular, nettement
dans le coin supérieur droit, qui porte l’argumentation.

## Contenu gelé

Axes (libellés aux extrémités uniquement) :
- horizontal : « Flexible, non opinionné » (gauche) / « Structure imposée, opinionné » (droite) ;
- vertical : « Léger, écosystème généraliste » (bas) / « Robuste entreprise, modules intégrés » (haut).

Points (ordre relatif imposé, positions approximatives) :
- Angular (0.78, 0.20) : TypeScript par défaut, DI native, routage/formulaires intégrés, CLI complet.
- React (0.38, 0.52) : souplesse, large écosystème, mais choix complémentaires requis.
- Vue.js (0.44, 0.74) : courbe douce, bonne documentation, écosystème entreprise restreint.

Légendes alignées sur le tableau de 2.4.3 : aucune retouche nécessaire.

## Architecture retenue

- Catégorie existante : `memoire`.
- Nouvelle variante : `quadrant`, avec `quadKind: 'zone' | 'dot' | 'tag' | 'hline' | 'vline' | 'axisLabel'`.
- Nouveau composant : `QuadrantNode.tsx`.
- Nouvelle définition : `diagrams/memoire/quadrant_frontend.ts`.
- Identifiant : `memoire-quadrant-frontend`.
- Composition : 1 fond zoné + 2 axes + 3 pastilles + 3 tags + 4 libellés, 0 arête.
- Figure rigide : `rigidLayout: true`.

## Refonte dot + tag (retour lisibilité)

Les cartes-points de 380 px se chevauchaient (React × Vue). Le marqueur de
données (pastille 44 px, sur la coordonnée exacte) est découplé de son
étiquette (tag 300 px) posée dans le blanc voisin. Le fond zoné (quatre
teintes `SAFE_HUES` à alpha égal 0.08 : `210`, `30`, `285`, `330`) habille le
graphe sans classer personne — alpha identique partout, donc aucun quadrant
avantagé.

## Restylage tags sobres + SAFE_HUES (retour style)

Tags bandeau jugés trop voyants : mini-carte langage OrgNode — fond
transparent, bordure uniforme 1 px, barre latérale interne 4 px pleine
hauteur, nom coloré dans le même bloc que la légende `/85`. Pastilles sans
initiales (les noms sont dans les tags) : anneau assombri + ombre douce.
Couleurs `SAFE_HUES` texte-safe : Angular `hsl(0, 85%, 42%)`, React
`hsl(225, 90%, 45%)`, Vue `hsl(130, 75%, 33%)`. Zones inchangées.

Piège serveur dev : après ces retouches, le canvas affichait encore l’ancien
style alors que le module servi était neuf — le processus Vite historique
servait un graphe périmé (puis est tombé : relance détachée via `node
.\node_modules\vite\bin\vite.js`). Redémarrer le serveur dev lève le doute.
En cas de rendu suspect après édition, redémarrer avant de conclure à un bug.

## Tags fluides 540 px (retour lisibilité, même lot)

Nom inline en gras coloré + légende dans le même flux, boîtes élargies à
540 px pour tenir en deux lignes (trois pour Angular, le plus long). Tags en
bas à droite (Angular, côté libre) ou en bas à gauche (React, Vue — l’axe
vertical barre leur droite) de leur pastille. Fond légèrement transparent
(teinte à 0.08). Vérifié à l’export : boîtes complètes 540 px, pastilles aux
coordonnées, pastille React `225` bien bleue (le cyan de la première capture
venait du serveur périmé).

## Modifications prévues

- [x] `src/types/index.ts` : variante `quadrant`, champs `quadKind`, `quadColor`, `quadLegend`.
- [x] `src/components/Nodes/QuadrantNode.tsx` : point, axes, libellés.
- [x] `src/components/Nodes/EntityNode.tsx` : délégation de la variante `quadrant`.
- [x] `src/diagrams/memoire/quadrant_frontend.ts` : modèle exact et géométrie.
- [x] `src/diagrams/index.ts` : enregistrement de la figure.
- [x] Plan et `AGENTS.md` : documentation.
- [x] `body.typ` et export SVG : intégration au mémoire (section 2.4.3).

## Géométrie et typographie

- Graphe : `1000 × 1000`, origine `(320, 120)`, canevas `1620 × 1240`.
- Pastilles 44 px aux coordonnées exactes ; tags 540 px dans le blanc voisin
  (Angular `(1060, 360)` bas-droite, React `(130, 668)` et Vue `(190, 888)`
  bas-gauche), sans aucun chevauchement entre eux ni avec les axes.
- Nom ~9 pt coloré, légende ~8 pt romaine `/85`, dans le même bloc.
- Libellés d’axes : ~8 pt, `text-foreground/85` (règle contraste).
- Aucune hauteur fixe ni `%` sur les racines : `exportWidth` en px inline,
  traits fixes sur enfants internes (leçons Figures 1–2, §8).
- Fonte épinglée : Cabinet Grotesk ; `fontScale: 4/3`.

## Couleurs

Teintes exactes `SAFE_HUES` :
- Angular : `hsl(335, 100%, 40%)`.
- React : `hsl(210, 100%, 40%)`.
- Vue.js : `hsl(166, 100%, 40%)` — limite assumée en texte (~2:1) ; pastilles,
  bordures et barres portent la teinte exacte, texte des descriptions en
  encre `/85`.
Fond des descriptions en teinte à `0.094` (convention MPD-SQL).
- Axes : `bg-foreground/30`, sans flèches.

Ces couleurs identifient les frameworks ; elles n’encodent aucun rang.

Piège `replaceAll` : les remplacements de couleurs n’avaient touché que les
tags — les appels `dot()` n’avaient pas la virgule finale attendue par
`oldString`, donc les pastilles gardaient les anciennes teintes (dont le cyan
React, bien visible). Corrigé en ciblant les trois lignes `dot()`
explicitement. Leçon : après un `replaceAll`, re-grepper le fichier pour
vérifier qu’il ne reste aucune occurrence de l’ancien motif.

## Validation

- [x] Contenu et ordre relatif exacts.
- [x] 13 nœuds, 0 arête, 0 poignée.
- [x] Aucune ligne enroulée ou rognée, aucun chevauchement tag/axe/tag.
- [x] Pastilles aux coordonnées du modèle (mesure pixels), zone exacte au pixel près.
- [x] Export SVG complet et lisible.
- [x] Insertion et compilation Typst.
- [x] `npx tsc --noEmit` sans nouvelle erreur.
- [x] `npx vite build` réussi.
- [x] Aucun caractère CJK introduit.
- [x] Aucun commit sans instruction explicite.
