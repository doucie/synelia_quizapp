# Figure 10 — `memoire-bf-grille` (3.2.8 Besoins fonctionnels)

8 cartes strictement identiques en grille 4×2 — seule la teinte de fond code
les 3 familles. Ni bandeau, ni titre de section, ni bordure : la grille reste
d’un seul tenant, distincte de la matrice de permissions.

## Contenu (verbatim matrice BF, `body.typ:450-457`)

- [x] Socle (`bg-muted`) : BF-01 Authentification et droits, BF-02 Référentiels.
- [x] Parcours (bleu 210) : BF-03 Campagnes, BF-04 Candidatures, BF-05 Quiz,
      BF-06 Entretiens et décisions.
- [x] Transverse (ambre 30) : BF-07 Notifications, BF-08 Pilotage.
- [x] Insert `body.typ` après la table BF (:458), avant « Matrice acteurs ».

## Décisions

- [x] Variante `bf` (`bfId`, `bfIcon`, `bfColor`) → `BfNode` monolithe
      (`minHeight` commun relevé). Rangée haute : médaillon blanc + badge
      `BF-0x` teinte famille à droite ; nom encre gras ; phrase `/85` verbatim.
- [x] Icônes : Feather pur sauf BF-03 — `lock`, `layers`, `inbox`,
      `check-square`, `calendar`, `bell`, `grid`. **Mégaphone Heroicons
      outline (MIT) pour BF-03**, stroke normalisé à 2 (natif 1.5), exception
      documentée dans `icons.tsx`.
- [x] Zéro arête (précédent fig. 6), aucune `<Handle>` ; rigide, `fontScale:
      4/3`, fonte épinglée, `exportWidth` = `width`. Cartes sans bordure.
- [x] Phrases-attentes raccourcies à l’essentiel sans changer le sens
      (matrice : phrases longues) — voir figure.

## Géométrie (8 nœuds / 0 arête)

- [x] Grille 4×2, cartes 360 px, gouttières 40 px (canevas ~1640).
      `CARD_MIN` 310 : BF-01 (« Authentification et droits » passe sur 2 lignes
      à 22 px) débordait du plancher 300 de 6 px — relevé harness, pas estimé.
- [x] Relever écrans : `minHeight` commun, teintes lisibles mais pâles.
- [x] Contrôle visuel : hauteurs strictement égales, grille d’un seul tenant.

## Vérification

- [x] `tsc.cmd` (baseline 76), `vite build`.
- [x] Harness 8/0, export (8 rasters, 0 `var()`).
- [x] Compile Typst, commit `feat(memoire)`, MAJ `AGENTS.md`.
