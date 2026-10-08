# Figure 9 — `memoire-notif-canaux` (3.2.7 Notifications)

Correspondance plusieurs-à-plusieurs événements → canaux, avec une exception
qui se voit : le défaut de configuration critique ne part qu’en pointillés
vers la notification interne. Le dashboard (2ᵉ sujet de la section) n’a pas de
figure — visibilité/filtrage, pas une relation de correspondance.

## Contenu (verbatim § 3.2.7 + brief)

- [x] Gauche (6 boîtes grises) : nouvelle candidature soumise,
      vérification d’email requise, convocation à un entretien, réponse du
      candidat reçue, décision rendue, défaut de configuration critique.
- [x] Droite : email transactionnel (`mail`, 330) en **haut**, notification
      interne (`bell`, 210) en **bas** — l’exception sort d’en bas à gauche et
      arrive en bas à droite : pointillé court, pastille dégagée.
- [x] Arêtes : 1–5 vers les 2 canaux (plein) ; 6 vers in-app seul (pointillé
      + pastille « interne uniquement » + légende sous l’événement 6).
- [x] Insert `body.typ` après 1er § 3.2.7 (:440), avant § dashboard.

## Décisions

- [x] Variante `notif` (`event`/`channel`/`caption`) → `NotifNode` ;
      `bell` ajoutée au jeu partagé `icons.tsx` (Feather, MIT).
- [x] Bézier véritable : opt-in `data.curved` (`getBezierPath`, même pattern
      que `straight`). L’export recopie le `d` — coût nul côté `exportSvg.ts`.
- [x] Pas de `noAnchorOffset` : l’éventail ±14 px distingue les 2 traits issus
      d’un même événement, l’étalement en Y sépare les 6 arrivées.
- [x] Canaux 210/330 (cohérent fig. 8) ; événements gris ; pastille bordure
      assortie (`labelBorder`, précédent fig. 7).
- [x] Tous handles déclarés (`right` → `left`), `traitement` muettes sauf
      l’exception ; rigide, `fontScale: 4/3`, fonte épinglée.

## Géométrie (9 nœuds / 11 arêtes)

- [x] Événements 440 px (`x` 40, pas 130 dès `y` 40) ; canaux 480 px
      (`x` 720, email `y` 200, in-app `y` 500) ; légende `y` 830.
- [x] Relever écrans : `minHeight` événements/canaux, pastille dégagée.
- [x] Contrôle visuel : pointillé + pastille intacts parmi les courbes.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 9/11 + pastille + légende, export (0 `var()`).
- [x] Compile Typst, commit `feat(memoire)`, MAJ `AGENTS.md`.
