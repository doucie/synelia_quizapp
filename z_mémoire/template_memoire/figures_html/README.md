# Figures HTML pour le mémoire

Pages HTML/CSS autonomes pour produire les schémas Merise du mémoire.
À ouvrir simplement dans un navigateur, puis capturer.

## Ouverture

Double-clique sur [index.html](index.html) ou ouvre directement une page :

- [mcd.html](mcd.html) — Modèle Conceptuel de Données
- [mld.html](mld.html) — Modèle Logique de Données Relationnel
- [mpd.html](mpd.html) — Modèle Physique de Données (MySQL 8)
- [sat.html](sat.html) — Schéma Analytique des Traitements (MOT : couloirs par acteur + phases temporelles)
- [mct.html](mct.html) — Modèle Conceptuel des Traitements (événements → synchro → opération → résultats)

Les cinq pages utilisent le même canevas absolu (`.canvas` + `<svg class="links">` + `window.LINKS`),
donc la barre d'outils ci-dessous est disponible partout, y compris pour repositionner
les événements / synchros / opérations / résultats du MCT et les tâches du SAT.

## Captures

Dépose tes captures dans [captures/](captures/). Convention de nommage :

```
captures/mcd.png
captures/mld.png
captures/mpd.png
captures/sat.png
captures/mct.png
```

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

Quand tes captures sont prêtes, remplace les blocs Merise dans
[../template_memoire/typst/sections/body.typ](../template_memoire/typst/sections/body.typ)
par :

```typst
figure(
  image("../../figures_html/captures/mcd.png", width: 100%),
  caption: [MCD cible du module recrutement.],
)
```

(et idem pour `mld`, `mpd`, `sat`, `mct`).
