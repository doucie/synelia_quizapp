# Acteurs du système — Figure 1 (2026-10-06)

## Objectif

Ajouter une figure rigide, neutre et plate présentant les quatre acteurs du système
dans l’ordre de la section 1.3.2, sans suggérer de hiérarchie.

## Contenu gelé

1. Super administrateur — SA — Pilotage global et paramètres sensibles.
2. Administrateur — A — Référentiels et configuration technique.
3. Recruteur — R — Pilotage opérationnel du recrutement.
4. Candidat — C — Parcours public sécurisé.

## Architecture retenue

- Nouvelle catégorie durable : `memoire`.
- Nouvelle variante : `actor`.
- Nouveau composant : `ActorNode.tsx`.
- Nouvelle définition : `diagrams/memoire/acteurs_systeme.ts`.
- Identifiant : `memoire-acteurs-systeme`.
- Figure rigide : `rigidLayout: true`.
- Aucune arête et aucune poignée.

## Modifications prévues

- [x] `src/types/index.ts` : catégories, variante et champs d’acteur.
- [x] `src/components/Nodes/ActorNode.tsx` : cercle, rôle, fonction et filet commun.
- [x] `src/components/Nodes/EntityNode.tsx` : délégation de la variante `actor`.
- [x] `src/diagrams/memoire/acteurs_systeme.ts` : modèle exact et géométrie.
- [x] `src/diagrams/index.ts` : enregistrement de la figure.
- [x] `src/components/Sidebar.tsx` : catégorie Mémoire.
- [x] `src/utils/entityColors.ts` : conserver la couleur explicite des acteurs.
- [x] Plan et `AGENTS.md` : documentation.
- [x] `body.typ` et export SVG : intégration au mémoire.

## Géométrie et typographie

- Canevas : `2640 px`.
- Colonnes : `555 px`, gouttières : `60 px`.
- Cercles : `120 px`.
- Même `minHeight`, sans hauteur fixe.
- Rôle : gras, encre du thème.
- Fonction : italique, encre atténuée du thème.
- Fonte épinglée : Cabinet Grotesk.
- Racine d’export : `data-export-root`.

## Couleurs de départ

- Super administrateur : `hsl(210, 100%, 40%)`.
- Administrateur : `hsl(240, 100%, 40%)`.
- Recruteur : `hsl(285, 100%, 40%)`.
- Candidat : `hsl(330, 100%, 40%)`.

Ces couleurs distinguent les acteurs sans les classer. Elles ont été validées
visuellement avant l’export définitif et ne devront pas être réutilisées comme
échelle hiérarchique dans une autre figure.

## Validation

- [x] Ordre et textes exacts.
- [x] Colonnes et cercles identiques.
- [x] Aucune interaction, arête ou poignée.
- [x] Export SVG complet et lisible.
- [x] Insertion et compilation Typst.
- [x] `npx tsc --noEmit` sans nouvelle erreur.
- [x] `npx vite build` réussi.
- [x] Aucun caractère CJK introduit.
- [x] Aucun commit sans instruction explicite.

## Correctif largeurs d’export (2026-10-06)

- Même défaut que la Figure 2 : cartes resserrées à 508–527 px au lieu de 555
  dans le SVG (cercles non équidistants). `data.exportWidth` en px inline sur
  chaque racine (`ActorNode` + filet), cf. `regles_export_svg` §8.
- Figure réexportée et mémoire recompilé avec le correctif.
