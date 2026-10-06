# Périmètre du projet — Figure 2 (2026-10-06)

## Objectif

Montrer une frontière claire entre le périmètre couvert par SyneliaQuizApp v1 et les
exclusions assumées. Le cadre domine la composition ; les exclusions restent
visuellement secondaires, sans devenir illisibles.

## Contenu gelé

Titre du cadre : « Périmètre couvert — SyneliaQuizApp v1 ».
Légende sous le cadre : « Version 1 — cœur du processus de recrutement. »

Inclus (6) :
1. Utilisateurs, accès et référentiels.
2. Campagnes, formulaires et pipeline.
3. Candidatures et suivi candidat.
4. Quiz technique et correction.
5. Entretiens, évaluations et décisions.
6. Notifications et pilotage.

Exclus (6) :
1. Intégration directe avec les job boards.
2. Visioconférence intégrée.
3. Gestion de la paie / des contrats.
4. Application mobile native.
5. Multilingue.
6. Matching automatique par IA.

L’item 2 fusionne campagnes, formulaires versionnés et pipeline (BF-03 + épine
dorsale du chapitre 6) afin de garder la symétrie 6/6. La traçabilité et l’audit
sont transverses, portés par les décisions et l’historisation : pas d’item séparé.

## Architecture retenue

- Catégorie existante : `memoire`.
- Nouvelle variante : `scope`, avec `scopeKind: 'frame' | 'item' | 'caption'`.
- Nouveau composant générique et réutilisable : `ScopeNode.tsx`.
- Nouvelle définition : `diagrams/memoire/perimetre_projet.ts`.
- Identifiant : `memoire-perimetre-projet`.
- Composition : 1 cadre composite + 6 exclus + 1 légende, 0 arête.
- Figure rigide : `rigidLayout: true`.
- Pointillés de liaison : supprimés (bruit visuel, confusion possible avec les flux).

## Modifications prévues

- [x] `src/types/index.ts` : variante `scope` et champs `scopeKind`, `scopeItems`, `scopeTone`.
- [x] `src/components/Nodes/ScopeNode.tsx` : cadre, lignes, légende.
- [x] `src/components/Nodes/EntityNode.tsx` : délégation de la variante `scope`.
- [x] `src/diagrams/memoire/perimetre_projet.ts` : modèle exact et géométrie.
- [x] `src/diagrams/index.ts` : enregistrement de la figure.
- [x] Plan et `AGENTS.md` : documentation.
- [x] `body.typ` et export SVG : intégration au mémoire.

## Géométrie et typographie

- Canevas : `1680 px`, marges : `80 px`.
- Cadre : `820 px` à gauche ; colonne exclus : `640 px` ; gouttière : `60 px`.
- Titre ~10 pt, inclus ~8,5 pt, exclus ~7 pt imprimés (`fontScale: 4/3`).
- Lignes incluses de hauteur fixe et égale ; lignes exclues de hauteur fixe et égale.
- Aucune hauteur fixe sur les nœuds ; `minHeight` en données si besoin.
- Fonte épinglée : Cabinet Grotesk ; racine d’export : `data-export-root`.

## Couleurs

- Cadre et bandeau-titre : navy du mémoire `#1a365d` (texte blanc).
- Inclus : fond vert pâle, coche verte contrastée.
- Exclus : tokens neutres du thème, texte `text-foreground/85`,
  romain (pas d’italique) pour rester lisible à ~7 pt.
- Ces couleurs sont catégorielles et ne devront pas devenir une échelle
  hiérarchique ailleurs.

## Retouches après premier export (retour d’impression)

- Pills des exclus : `bg-muted/40` → `bg-muted` solide. À 40 % sur blanc, le
  fond devenait indiscernable du papier et les boîtes, pourtant de largeur
  égale, semblaient suivre la longueur du texte.
- Texte des exclus : `/75` → `/85`, comme la Figure 1. L’exception `/75` est
  révoquée : la secondarité passe par la taille et le style, jamais par la pâleur.
- Centrage vertical : `EXCLUDED_Y0 = 65`, soit (572 − 442) / 2 — cadre et
  colonne sont des hauteurs arithmétiques, le centrage ne peut pas dériver.

## Correctif largeurs d’export (2026-10-06)

- Les racines `w-full` se rétractaient sur leur contenu dans le SVG (cadre 648
  au lieu de 820, pills 194–502 selon le texte) : `data.exportWidth` en px
  inline sur chaque racine (`EntityNodeData`, cf. `regles_export_svg` §8).
- Sans ce correctif, le vide inclu/exclu mesurait 232 px au lieu de 60.
- Figure 1 concernée aussi : réexportée avec le même correctif.

## Retrait paie/contrats (2026-10-06)

- Item « Gestion de la paie / des contrats » retiré des exclus sans rejoindre
  les inclus : 5 exclus, `EXCLUDED_Y0 = 103` ((572 − 366) / 2).
- Note de périmètre futur (contrats, paies, entreprises) dans `AGENTS.md`,
  section figures du mémoire. Texte 1.3.3 inchangé : « hors du périmètre de
  cette version » couvre déjà le futur.

## Validation

- [x] Contenu exact validé.
- [x] 1 cadre + 6 inclus + 6 exclus + 1 légende, 0 arête, 0 poignée.
- [x] Aucune ligne rognée ou enroulée (`scrollWidth <= clientWidth` par ligne).
- [x] Cadre visuellement dominant sur capture.
- [x] Export SVG complet et lisible.
- [x] Insertion et compilation Typst.
- [x] `npx tsc --noEmit` sans nouvelle erreur.
- [x] `npx vite build` réussi.
- [x] Aucun caractère CJK introduit.
- [x] Aucun commit sans instruction explicite.
