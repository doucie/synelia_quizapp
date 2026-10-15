# Intégration UML — 15 SVG de Claude dans figures_flow

Livraison : `plans/uml/echanges/results_claude/` (15 fichiers, 23-56 Ko,
même générateur Imagine/C2PA). Originaux intacts. Contenu non vérifié —
vérifications avancées plus tard.

## Intégration (mécanisme lot 0, inchangé)

- [x] Copie vers `src/diagrams/uml/claude/` (15 fichiers).
- [x] `umlRecolor.ts` : +3 couleurs du second lot (`252,252,251` →
      fond, `8,80,65` → 330 sombre, `60,52,137` → 285 sombre). Zéro hex,
      `context-stroke` déjà géré, C2PA purgé auto.
- [x] Registre `src/diagrams/uml/claude.ts` : 15 définitions
      (`uml-uc-candidat|global|recruteur-suivi|recruteur-campagnes|
      admin-droits|admin-config|super-admin|compte-acces,
      uml-etats-campagne|etape|tentative,
      uml-seq-quiz-nominal|anormales, uml-composants, uml-deploiement-cible`),
      `variant: 'claude'`, `exportWidth: 1200` uniforme (print à régler
      aux vérifications avancées), rigide, 4/3, Cabinet Grotesk, catégorie
      `uml`. Enregistrement `index.ts` (spread `umlClaudeFigures`).
- [x] `tsc` (zéro erreur nouvelle, reste = baseline), `vite build`.

## Figures

8 UC · 3 états (campagne, étape, tentative) · 2 séquences quiz (nominal
1140 px de haut, fins anormales) · composants v3 · déploiement cible.

## Reste (plus tard, comme demandé)

- Vérifications contenu par figure (corrections C-01→C-03 + dormants
  `verification.md`), exports ⤓, bascule `body.typ` / `backmatter.typ`
  (UC §527, séquences §1007 + annexe B, états, composants vs
  Architecture 1/2 existantes, déploiement vs fig. 16).
- `body.typ` et captures mémoire : intacts.
