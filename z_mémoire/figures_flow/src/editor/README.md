# Éditeur MCD / MLD

Créer, modifier et supprimer ses propres modèles, sans toucher au code.
Les figures écrites en dur (`src/diagrams/nouveau/`) restent la référence :
l'éditeur réutilise **les mêmes composants** (`EntityNode`, `RelationshipEdge`),
donc une carte d'éditeur et une carte du mémoire sont la même carte.

## Où

- `/mes-modeles` — liste, création (`+ MCD`, `+ MLD`), renommer, dupliquer,
  supprimer, et « Partir d'une figure existante » (copie indépendante d'un
  MCD / MLD du mémoire).
- `/modele-<id>` — l'éditeur. Un slug, deux formes : `useDiagramRoute`
  n'accepte qu'un segment d'URL.

## Gestes

| Geste | Effet |
|---|---|
| double-clic sur le fond | nouvelle entité, posée au curseur |
| glisser d'un point d'ancrage (droite / gauche) vers un point d'une autre entité | nouvelle association |
| clic sur une carte / une arête | inspection dans le panneau de droite |
| glisser une carte | déplacement (enregistré au relâchement, aligné sur la grille de 10 px) |
| clic sur une pastille de cardinalité | choix du côté d'ancrage (persisté) |
| `Suppr` / `Retour arrière` | supprime la sélection, avec confirmation si l'entité porte des associations |
| `Ctrl+Z` / `Ctrl+Maj+Z` (ou `Ctrl+Y`) | annuler / rétablir |
| `Ctrl+S` | force l'enregistrement |
| `Échap` | désélectionne |
| pan du milieu ou clic droit glissé | déplace la vue (le clic gauche glissé sélectionne) |

Les attributs se saisissent en liste : `Entrée` ajoute la ligne suivante,
`Retour arrière` sur une ligne vide la retire.

## Persistance

- `figures_flow:model:<id>` — le document (`ModelDoc` : entités, associations,
  positions, teintes, types).
- `figures_flow:models` — l'index (titre, type, dates), pour la sidebar.
- `figures_flow:edge_sides:modele-<id>` — côtés d'ancrage des arêtes, écrits par
  le popover de `RelationshipEdge` (mécanisme existant, réutilisé tel quel).

Autosave à 400 ms après la dernière frappe, vidage à la fermeture de l'onglet.
Export JSON (portable, réimportable) et SVG (même `exportSvg` que les figures).

## Choix assumés

- **Aucune dérivation MCD → MLD** : les deux se dessinent séparément, un MLD
  n'est pas une projection calculée du MCD.
- **La teinte d'une entité est figée à sa création** : supprimer une entité ne
  recolore pas les autres (contrairement à `applyEntityColors`, qui indexe).
- **Pas d'auto-association** (entité reliée à elle-même) en v1 : le tracé
  réflexif existe dans `RelationshipEdge`, mais son édition n'est pas exposée.
- **Le document est la seule source de vérité** : React Flow n'écrit jamais une
  suppression ni une connexion directement, tout passe par `ModelDoc`.
- Pas de `showSaveFilePicker` (absent de Firefox) : `Blob` + `<a download>`.
