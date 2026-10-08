# Confirmations avant réinitialisation (2026-10-05)

## Objectif

Les réinitialisations de `figures_flow` sont destructives et silencieuses : un clic sur
`↺` efface les positions sauvegardées d'une figure (et, pour la barre principale,
recharge la page). Aucune confirmation n'était demandée.

Périmètre retenu après arbitrage :

| Cible | Décision |
|---|---|
| `↺` de `Toolbar` (barre normale **et** plein écran) | confirmée |
| `↺` de `MotTableToolbar` (config du tableau) | confirmée |
| `↺` de `MotEditToolbar` (positions du traitement) | confirmée |
| Six `↺` de `RelationshipEdge` (côté carte de cardinalité) | **hors périmètre** |
| Figures `rigidLayout` (organigramme) | sans bouton, donc sans dialogue |

## Choix d'interface

Voile sombre centré, deux boutons **Annuler** (gauche, focus initial) et l'action
destructive (droite). Pas de troisième issue ni de champ de saisie : la perte est
récupérable en réajustant à la main, la saisie n'a donc rien à protéger.

## Implémentation

`src/components/ConfirmDialog.tsx` — composant unique, aucun state global :

```ts
{ open, title, message, confirmLabel, onConfirm, onCancel }
```

- `open={false}` rend `null` : aucun portail vide dans le DOM des figures sans reset.
- `createPortal(…, document.body)`, `z-[1100]`.
- `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`.
- Focus initial sur **Annuler** (l'issue neutre), piégé par Tab entre les deux boutons,
  restitué au bouton déclencheur à la fermeture.
- Fermeture par Échap, clic sur le voile, ou Annuler.
- Voile `bg-black/50`, boîte sur `bg-popover` + tokens usuels.

Câblage : chaque toolbar garde son `useState` local et passe `true` au clic, au lieu
d'appeler l'action destructive. `Toolbar` couvre les deux barres puisqu'elle est rendue
aussi par `FullscreenOverlay`.

## Deux pièges rencontrés

1. **`fixed` ne fonctionne pas ici.** Les deux toolbars MOT sont rendues dans
   `.react-flow__pane`, dont le viewport porte un `transform` : un `fixed` déclaré dans
   cette subtree serait centré sur le viewport et mis à l'échelle par le zoom. Le portail
   vers `document.body` est donc obligatoire, et le `z-[1100]` doit rester au-dessus des
   `z-index: 1000` de `MotEditToolbar` et des popovers d'arêtes.

2. **Le libellé anglais `↺ Reset`.** `MotEditToolbar` affichait `↺ Reset` alors que
   `MotTableToolbar` affichait déjà `↺ Réinitialiser`. Aligné sur ce dernier — un dialogue
   français sous un bouton anglais n'a pas de sens.

## Vérification

Contrôle navigateur par CDP (Edge headless, profil jetable, `localStorage` pré-amorcé
pour ouvrir directement la bonne figure). Les deux harnais vivent **hors du dépôt**, dans
`%TEMP%\opencode\`.

| Contrôle | Résultat |
|---|---|
| Barre principale, figure zoomée | `14/14` — `dx = 0`, `dy = 0` sur la fenêtre |
| Les deux `↺` MOT, figure zoomée | `17/17` — `dx = 0`, `dy = 0` sur la fenêtre |
| Portail hors du pane | `!pane.contains(dialogue)` vrai sur les trois sites |
| Centrage au pixel près | mesuré, non déduit : un `fixed` aurait été décalé par le zoom |
| Fermeture | Échap, voile, Annuler — les trois |
| Accessibilité | `aria-modal`, titre et description rattachés, focus sur Annuler |
| Effet réel du reset | décalage injecté puis absent après confirmation |

### Une assertion qui était fausse, et ce qu'elle a corrigé

Le contrôle final ne pouvait pas être « la clé `localStorage` est absente » :
`handleResetPositions` fait bien `removeItem` + `reload`, mais `DiagramCanvas`
**repersiste les positions par défaut au remontage** — l'entrée est donc recréée, et
elle doit l'être. Vérifié sur `mcd-utilisateurs-droits` après décalage de `utilisateur`
à `(9999, 9999)` : l'entrée contient bien `{"x":0,"y":0,"groupe_metier":{"x":600,"y":0}…}`,
c'est-à-dire la disposition de la figure, pas le décalage injecté.

C'est aussi pourquoi un décalage réel est nécessaire : `{"positions":{}}` aurait donné
une indistinguishable avant/après, puisque la valeur par défaut est précisément « pas de
positions ».

### Détail sur le harnais : ne pas conclure à un bug trop vite

Deux échecs initiaux n'étaient **pas** des bugs de l'application :

- un `#root` vide sans exception, parce que la sonde attendait 5 s fixes alors que Vite
  transforme tout le graphe de modules à la première requête sur un profil neuf. Passé en
  attente active sur le DOM, la figure s'est montée. **Le délai par défaut de 40 s est
  insuffisant sur la toute première requête** : il faut relancer une fois le serveur
  réchauffé ;
- un clic sans effet sur le panneau MOT, parce que la recherche visait `button` alors que
  l'en-tête est un `<div onClick>`, puis parce que `querySelectorAll` rend les ancêtres
  avant leurs descendants — le premier élément correspondant était un conteneur dont
  l'`onClick` est nul. Le ciblage retenu est **l'élément le plus profond** dont le texte
  contient le motif.

Deux serveurs Vite tournaient aussi simultanément pendant ces essais ; le port `5199`
servait correctement le code courant.

## Contraintes respectées

- `npx tsc --noEmit` : **76** erreurs, la baseline préexistante, aucune dans les fichiers touchés.
- `npx vite build` : succès.
- Aucun caractère CJK introduit (le chemin `z_mémoire` a déjà été la cause d'un
  double encodage CP1252 sur `synelia_avec_ag.ts`).
- Le `bg-black/50` du voile est la seule couleur en dur du lot, validée explicitement.
- Aucun commit.