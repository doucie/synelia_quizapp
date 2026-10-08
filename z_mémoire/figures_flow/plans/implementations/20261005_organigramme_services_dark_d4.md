# Plan - Organigramme Synelia : fond de thème, contour des services, fonte épinglée

Suite de `20261004_organigramme_paysage_refonte.md`. Quatre retours de lecture sur la
figure, dont un qui a demandé trois corrections successives avant d'être compris.

## Pourquoi

### 1. En dark mode, les services étaient du blanc sur blanc

`OrgNode` posait `backgroundColor: '#ffffff'` sur un service. Ce blanc était un choix
justifié — l'original distingue les services par un fond blanc — mais il était **figé**,
alors que l'encre du libellé suit `text-foreground`. En mode sombre, on obtenait donc
une encre claire sur fond blanc : les intitulés disparaissaient. La figure étant
figée (`rigidLayout`), on ne pouvait pas y échapper en déplaçant les boîtes.

Décision : un service porte `hsl(var(--background))`, donc le fond de la page, dans les
deux thèmes. L'export suit le thème courant **par choix** : `exportSvg.ts` ne force
aucun fond, et le SVG du mémoire s'exporte en clair. Ne pas « corriger » `exportSvg.ts`
en forçant le blanc.

### 2. Un service sans teinte n'a plus de trait qui le sépare

Le fond blanc était aussi le discriminant de niveau. Le remplacer par le fond de page
retire ce discriminant, et il n'en restait pas d'autre : `border-border` vaut 95 % de
clarté, donc le contour était invisible à l'impression sur page blanche.

Décision : la couleur de la direction passe sur les **4 côtés** d'un service. Le liseré
gauche 3 px est conservé — il reste le rappel du niveau. Portée : `LEVEL_STYLE` porte
un drapeau `edge`, et la carte fait `borderColor: style.edge ? color : undefined`. Les
deux autres niveaux gardent `border-border` : leur fond teinté les détache déjà.

### 3. La 4ᵉ direction déséquilibrait la rangée

`Performance Financière & Fiscalité` est le plus long intitulé des cinq, et les cinq
boîtes font la même largeur (contrat `DIR_W` = 450 px). Décision : abréger en
**« Perf. Financière & Fiscalité »**. Choix de lisibilité, pas correctif de
débordement : l'intitulé complet tenait déjà sur deux lignes, donc `NOM.dir` et la
hauteur des directions sont inchangés, et `body.typ` garde la forme longue.

### 4. Les services de `d4` se recouvraient — et c'était la fonte

**C'est le point important du plan, et il a été mal diagnostiqué deux fois.**

Le symptôme : « Trésorerie / Comptabilité » et « Fiscalité » se touchaient. Le
mécanisme est bien celui d'un plancher trop court : la position d'un service vaut
`Y_SVC_1 + j * (h + V.svc)`, donc elle est **calculée depuis le plancher**, et une
boîte qui le dépasse grandit vers le bas et vient sur la suivante.

Le plancher de la colonne 3 valait 61, l'entraxe 79, l'écart observé 2 px. Trois
correctifs ont été essayés successivement, et les trois sont erronés :

| `SVC_H[3]` |Ce qu'on croyait | Ce que c'était |
|---|---|---|
| 61 → 84 | « 61 est trop serré, 84 couvrirait deux lignes » | 84 ne couvre même pas deux lignes : il faut 100,5 |
| 84 → 101 | « deux lignes font 100,5, donc 101 » | le bon chiffre, dans la **mauvaise** fonte |

Le relevé de l'écran de l'utilisateur a tranché :

```
d4 | plancher 84 | hauteurs 84/100/84 | lignes 1/2/1 | jeu pour 1 ligne 0/-24/0
   d4-s1 -> d4-s2 : ecart 18
   d4-s2 -> d4-s3 : ecart 2
```

`hauteur 100` pour un plancher de 84, et surtout **`jeu -24`** : dans le navigateur de
l'utilisateur, « Trésorerie / Comptabilité » dépasse de 24 px la largeur disponible et
passe sur deux lignes. Ce n'était donc pas une fragilité de 2 px comme supposé, c'est
un refus net.

Et la cause : `check "Cabinet Grotesk" = false`, les quatre poids `unloaded`, seules
Poppins 400 et 700 `loaded`. `useFontPreference` (`src/hooks/useFontPreference.ts:16`)
lit `localStorage['figures_flow:font']` et **écrase `--font-sans` sur
`documentElement`** — un réglage cosmétique de la toolbar décide de la géométrie d'une
figure destined à l'impression. Le profil de l'utilisateur était sur Poppins ; les
scripts CDP, qui partaient d'un profil neuf, prenaient le défaut Cabinet Grotesk. **On
mesurait une autre figure que celle affichée.**

Le modèle de hauteur, lui, est exact et se vérifie sur les quatre valeurs :

| composition | calcul | hauteur | `SVC_H` |
|---|---|---|---|
| 1 ligne, sans titulaire | `2 + 10 + 8 + 40,25` | 61 | 61 |
| 1 ligne + titulaire | `60,25 + 4 + 35` | 99,25 | 100 |
| 2 lignes + titulaire | `99,25 + 40,25` | 139,5 | 140 |
| 2 lignes, sans titulaire | `60,25 + 40,25` | 100,5 | *100* |

Les 20 px de chrome (`1 + 1` de bordures, `py` 5 de la carte, `py-1` de l'intitulé) sont
la cause de la première erreur : « deux lignes » ne vaut pas deux interlignes.

#### Décision : épingler la fonte de la figure

`DiagramDefinition` gagne `fontFamily`, appliqué par `DiagramCanvas` sur la racine qui
porte déjà `--org-font-scale`, et recopié par `exportSvg` sur son wrapper. La toolbar et
la sidebar gardent la fonte choisie ; la figure, non.

`SVC_H[3]` **revient à 61**, le relevé exact dans la fonte de référence, cohérent avec
les 100 et 140 des autres colonnes. La pile `'Cabinet Grotesk', system-ui, sans-serif`
se replie sur des fontes **plus étroites** : un échec de chargement réduit le nombre de
lignes, donc le mode de défaillance est sûr.

Note : `fontFamily` est recopié **comme valeur inline**, pas comme variable custom. Le
clone de l'export est reparenté sous `document.body` (`exportSvg.ts:438`) et perd
l'héritage de la racine du canevas — sans la recopie, une figure épinglée
s'exporterait dans la police de celui qui exporte, et le SVG du mémoire ne serait pas
reproductible.

## Méthode de mesure

Rien n'est estimable à la main ici : `NOM` et `SVC_H` se **relèvent** par CDP, après
chargement de la fonte. Quatre scripts, tous dans `%TEMP%\opencode` :

| script | ce qu'il produit |
|---|---|
| `measure-org.mjs` | planchers, mesures, arêtes, `fonts: loaded` |
| `verify-org.mjs` | export + texte, planchers, position des rasters, contraste, **fonte** |
| `bordure-org.mjs` | couleur et épaisseur du contour, surface occupée |
| `directions-org.mjs` | intitulé des cinq directions, lus dans le DOM |

Piège écarté : le texte est rasterisé, donc illisible dans le SVG. Seul le DOM permet de
vérifier un libellé.

Deux contrôles ajoutés par ce plan.

**Le contraste**, qui bascule `.dark` dans le DOM et relit `getComputedStyle` sur chaque
carte, plutôt que d'exporter deux fois : le défaut cherché est purement CSS, et un
export sombre aurait écrasé le SVG du mémoire. Le fond des niveaux supérieurs étant une
teinte semi-transparente, elle est composée sur le fond de page avant calcul — sans
cela on mesurerait le contraste de la teinte pure, c'est-à-dire un chiffre sans écran
correspondant. La couleur des quatre côtés se lit via `borderTopColor` …
`borderLeftColor`, et `getComputedStyle(card).color` suffit pour l'encre : `OrgNode` ne
pose aucune couleur sur la carte, elle hérite de `--foreground`, ce que lit le libellé
via `text-foreground`. Cibler le libellé parmi les enfants serait fragile, leur ordre
changeant selon qu'un intitulé ou un titulaire est présent.

**La fonte, en configuration hostile.** `verify-org.mjs` force
`figures_flow:font = 'Poppins'` dans le profil avant de charger la page, puis exige que
la pile calculée contienne `Cabinet Grotesk`. Le défaut ne se produit qu'avec la mauvaise
fonte : un contrôle qui ne l'exercerait pas ne prouverait rien. C'est cette assertion qui
avait fait défaut — sans elle, la divergence passait inaperçue et chaque mesure partait
d'un profil différent.

Corollaire de méthode : **un relevé doit déclarer la fonte dans laquelle il est pris.**
Désormais la fonte est une donnée de la figure, donc elle est lisible à côté des
planchers qu'elle conditionne.

## Liste de contrôle

- [x] `Nodes/OrgNode.tsx` : `hsl(var(--background))` au lieu de `#ffffff`
- [x] `Nodes/OrgNode.tsx` : `LEVEL_STYLE.edge` + `borderColor` conditionnel
- [x] `Nodes/OrgNode.tsx` : en-tête réécrit (le fond blanc n'est plus le discriminant)
- [x] `diagrams/organigramme/synelia_avec_ag.ts` : `DIRECTION_LABELS[3]` abrégé
- [x] `types/index.ts` : `DiagramDefinition.fontFamily`, contrat documenté
- [x] `DiagramCanvas.tsx` : `fontFamily` sur la racine du canevas
- [x] `utils/exportSvg.ts` : `font-family` calculé recopié sur le wrapper de capture
- [x] `diagrams/organigramme/synelia_avec_ag.ts` : `fontFamily` épinglé sur la figure
- [x] `diagrams/organigramme/synelia_avec_ag.ts` : `SVC_H[3]` revenu à **61**
- [x] `synelia_avec_ag.ts` : indentation de `rigidLayout` réparée (au passage)
- [x] Mesure CDP : 23 nœuds, 23 boîtes **exactement** à leur plancher, dont `d4` à 61
- [x] Export SVG : 2531 × 1591, 23 rasters — **inchangé**
- [x] `verify-org.mjs` : 0 texte suspect, 0 hors-plancher, 0 écart de raster
- [x] `verify-org.mjs` : contraste 15,7 (clair) / 17,7 (sombre), plancher 3
- [x] `verify-org.mjs` : profil forcé sur Poppins, `epinglee: true`, code de sortie 0
- [x] `bordure-org.mjs` : 14 services encadrés sur 4 côtés, 1/1/1/3 px
- [x] Compilation Typst : 135 pages, une seule paysage (la 16)
- [x] `npx tsc --noEmit` : **76** erreurs de référence, soit la baseline, 0 ajoutée
- [x] `npx vite build`
- [x] `AGENTS.md` : section organigramme

## Ce que la vérification a donné

Le canevas n'a pas bougé : 2531 × 1591 avant comme après, alors que `d4` est passé de
84 à 61. Le bas du canevas est fixé par `SVC_H[max]` — 140, pas 61 — et la colonne 3
s'arrête à 1310, très en deçà des 1479 des colonnes à 140.

Le cadre des services occupe **3,2 %** de la surface d'une boîte au plus, contre 2,3 %
pour une colonne moyenne : c'est un cadre, pas un pavé coloré. Le liseré gauche reste à
3 px et les trois autres côtés à 1 px.

### Point ouvert : le contraste du contour en dark

Le contraste du contour, mesuré contre le fond de page, vaut **4,73 en clair** mais
**1,68 en sombre**. En dark, une teinte de direction sombre sur un fond quasi noir ne se
devine à peine. Ce n'est pas un défaut d'implémentation — le contraste de l'**encre** est
de 17,7, donc les intitulés restent parfaitement lisibles — mais la boîte perd sa
délimitation. Deux voies si le mode sombre devient la référence : éclaircir le contour
seulement en sombre, ou lui donner `foreground` à faible opacité. **Rien n'est tranché** :
la figure imprimée est claire, et l'écart n'a donc aucun effet sur le mémoire.

### Écart assumé sur le corps imprimé

Inchangé : le plan visait 10,9 pt, l'export sort à ~11,3 pt à 25,3 cm. Voir
`20261004_organigramme_paysage_refonte.md`.

## Reste ouvert

Les MCD, MLD et MPD ne sont pas rigides et suivent donc encore la fonte de la toolbar.
Le champ `fontFamily` leur est disponible, mais je ne les épingle pas dans ce lot : leurs
positions sont stockées par nœud, un reflux les déforme sans les superposer de façon
systématique. À traiter figure par figure si un cas se présente.