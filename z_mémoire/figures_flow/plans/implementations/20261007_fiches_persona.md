# Fiches persona — Figure 6 (2026-10-07)

- [x] `avatars.tsx` : 4 DiceBear « Notionists » (CC0, généré par script, ids suffixés)
- [x] Types : `Variant += 'persona'`, champs `personaAvatar`/`personaColor`/`personaAttentes`/`personaRisque`/`personaConception`
- [x] `PersonaNode.tsx` + dispatch `EntityNode` (variante `persona`)
- [x] Modèle `diagrams/memoire/fiches_persona.ts` + enregistrement (Mémoire 6/6)
- [x] Validation navigateur (4 nœuds / 0 arête / 4 avatars / 12 blocs)
- [x] Export SVG + mesure + `inspect-svg`
- [x] Insert `body.typ` 3.1.1 + recompile PDF
- [x] `tsc` (baseline 76, binaire local), commit

## Géométrie

- Grille 2×2 : cartes 560 px, gouttière 40, `minHeight` commun **780** (relevé :
  recruteur ~770, autres 700–735 ; +10 de marge). Les 4 cartes mesurent
  exactement leur plancher à l’écran comme à l’export.
- Export : 1240×1680, 4 rasters aux largeurs exactes, 0 arête.

## Avatars (premier visuel humain du mémoire)

- DiceBear « Notionists » **plein** (le `notionists-neutral` n’est que des
  taches abstraites — rejeté après inspection) : personnages illustrés, même
  style, fond teinté par rôle (`AVATAR_TINT`, même valeur qu’à la requête).
- Inline via `dangerouslySetInnerHTML` (50 Ko de paths : pas de JSX
  maintenable), `<metadata>` purgée (sinon texte licence dans le DOM),
  `viewboxMask` suffixé par rôle (4 instances inline).
- **Crop portrait `cover`** (`AVATAR_CROPS`, carré 900 haut-centré) : les SVG
  sont des scènes plein-pied, on ne montre que tête + épaules — vérifié à
  l’écran, les 4 visages cadrent du premier jet, aucun ajustement par avatar.
- **Avatar plein-cercle** : la tuile 120 px dans un rond 144 laissait des bords
  droits (traits coupés nets aux bornes du crop) — l’avatar fait désormais 144
  et remplit exactement le rond : tuile == clip, vérifié à l’écran.
- Icônes Feather MIT inline (`star`, `alert-triangle`, `settings`),
  `currentColor` teinte du rôle. Blocs au langage `QuadTag` (liseré 4 px).
- Textes verbatim du tableau 3.1.1 (lignes 373-376, qui priment sur l’énoncé).
