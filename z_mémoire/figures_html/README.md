# Figures HTML pour le mémoire

Pages HTML/CSS autonomes pour produire les schémas du mémoire, à ouvrir
simplement dans un navigateur.

## Ouverture

Double-clique sur [index.html](index.html). La page propose deux onglets :

| Onglet | Contenu |
|---|---|
| **À utiliser** | les 8 figures retenues pour le mémoire |
| **Écartées** | les 56 figures écartées, regroupées par motif (figure confuse, mal présentée, pas facilement compréhensible, non retenue) |

L'onglet **À utiliser** est actif par défaut à chaque ouverture. L'état
d'ouverture des accordéons de l'onglet *Écartées* est mémorisé dans
`localStorage` (clé `figures_index_open_folders`).

Aucun fichier n'est supprimé : les figures écartées restent sur le disque,
seule leur visibilité dans l'index change.

### Figures retenues (onglet « À utiliser »)

- [organigramme_synelia_avec_ag.html](organigramme_synelia_avec_ag.html) — Organigramme avec AG
- [matrice_benchmark.html](matrice_benchmark.html) — Matrice de benchmark
- [pyramide_moscow.html](pyramide_moscow.html) — Pyramide MoSCoW
- [stack_technique.html](stack_technique.html) — Stack technique
- [pubsub_notifications.html](pubsub_notifications.html) — Architecture de notifications
- [pyramide_tests.html](pyramide_tests.html) — Pyramide des tests
- [carte_api_endpoints.html](carte_api_endpoints.html) — Carte des endpoints API
- [pile_technologique.html](pile_technologique.html) — Pile technologique

### Figures écartées (onglet « Écartées »)

- **Bonne idée, mais figure confuse** : `uc_1_candidat_recruteur`,
  `uc_2_admin_gouvernance`, `uc_3_tableaux_bord`, `machine_etats_campagne`
- **Bonne idée, mais mal présentée** : `du_besoin_a_la_solution`,
  `pyramide_objectifs`, `machine_etats_candidature`
- **Bonne idée, pas facilement compréhensible** : `sequences`
- **Non retenues** : les 48 autres, dont l'intégralité des schémas Merise
  (MCD / MLD / MPD, SAT, MCT, MPT, MCC), les diagrammes de classes, les
  cas d'utilisation et l'architecture.

> Les schémas Merise du mémoire ne sont plus produits depuis ce dossier :
> la source actuelle est [../figures_flow](../figures_flow), qui les génère
> en SVG vectoriel. Les pages de ce dossier sont conservées comme archives.

## Mode édition (déplacement des entités)

Chaque page de schéma affiche en haut à droite une barre d'outils :

- **Édition** : active le glisser-déposer des entités (curseur main).
- **Grille 10 px** : aimante le déplacement sur une grille pour aligner proprement.
- **− / 100% / +** : dézoomer, reset à 100%, zoomer (raccourcis `Ctrl + -`, `Ctrl + 0`, `Ctrl + +`).
- **Ajuster** : zoom-fit sur la largeur du viewport.
- **⛶ Plein écran** : passe la figure courante en fullscreen (échap pour sortir). La barre reste disponible.
- **L−/L+ et H−/H+** : ajuste la largeur/hauteur du canevas par pas de 100 px.
- **Côté des liens** : en mode édition, un petit point violet s'affiche à chaque extrémité de chaque lien. Clique dessus pour faire tourner le point d'ancrage **haut → droite → bas → gauche → haut** sur l'entité.
- **▾ / ▸** : replie la barre (utile avant une capture).
- **Copier positions (JSON)** : copie un objet `{ "<data-entity>": { left, top, width } }` dans le presse-papier.
- **Copier styles HTML** : copie directement les attributs `data-entity="..." style="top:...; left:...; width:...;"` prêts à recoller dans le HTML.
- **Réinitialiser** : efface positions, taille, zoom, ancrages et état de pliage enregistrés localement, puis recharge la page.

Les positions, la taille du canevas, le zoom et les ancrages de liens sont
automatiquement sauvegardés dans `localStorage` (par page), donc tu peux
fermer/rouvrir l'onglet sans perdre ta mise en page.
Quand le rendu te plaît, clique sur **Copier styles HTML** et remplace les
attributs correspondants dans le `.html` pour figer la disposition dans le code.

Les liens (cardinalités, courbes) sont automatiquement re-routés en temps réel
pendant le déplacement, et distribués sur le côté de chaque entité pour qu'ils
ne se superposent pas. Si deux entités semblent trop proches, élargis le
`width` du canvas (attribut `style="width:..."` sur `.canvas`) ou écarte-les.

## Source de vérité

- Schéma BD : `cartographie-fonctionnelle-front/bd_actuelle/quizapp_db_described_20260530.md`
- Évolution appliquée : `cartographie-fonctionnelle-front/evolution/420-evolution-pipeline-multi-occurrences.md`

Conventions visuelles :
- bordure et bandeau **violet** = pivot métier (`campaigns`, `applications`, `application_progress`)
- bordure et bandeau **vert** = nouvelle table introduite par 420
- ligne **pleine** = relation forte (FK NOT NULL), ligne **pointillée** = relation faible / dénormalisée
- attribut **vert** = ajouté par 420, attribut **barré rouge** = supprimé par 420

## Insertion dans le mémoire Typst

Ne pas produire de PNG : chaque page dispose d'un bouton **« Exporter SVG »**
qui produit un fichier vectoriel, à déposer dans ce dossier sous le nom de la
figure. Remplace ensuite le bloc correspondant dans
[../template_memoire/typst/sections/body.typ](../template_memoire/typst/sections/body.typ)
par :

```typst
figure(
  image("../../figures_html/matrice_benchmark.svg", width: 100%),
  caption: [Matrice de benchmark.],
)
```

Le SVG reste net à l'impression quelle que soit l'échelle, contrairement à une
capture PNG.
