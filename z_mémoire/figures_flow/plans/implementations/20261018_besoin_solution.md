# 20261018 — Fig. 3 refaite : `besoin_solution` (entonnoir éclaté → plateforme)

Remplace `figures_html/du_besoin_a_la_solution.html` (§1.3.3, `body.typ:148`).

**Conception v1 abandonnée** (3 paires problème → réponse) : restylage des
HTML — même critique que fig. 2. Règle : la figure illustre le §, elle ne
traduit pas du texte en cartes de texte.

## Conception v2 (approuvée : entonnoir)
- **Métaphore** : le § donne 4 raisons de retenir la plateforme unifiée
  (centraliser, automatiser, standardiser, transparence) ⇒ **nuage éclaté**
  (gauche, 8 puces inclinées : Boîte mail, Excel, Drive · NAS, Google Forms,
  Appels, Critères variables, Double saisie, Aucune trace — verbatim des
  §1.3.1/1.3.2) → flèche d'aspiration → **SyneliaQuizApp** (bloc navy central)
  → **4 sorties fléchées** (phase courte chacune : Un référentiel commun à tous
  les acteurs / Fin des opérations répétitives / Grilles et processus
  homogènes / Suivi clair et transparent du parcours).
- Jetons : centraliser `--fig-secondary`, automatiser `--fig-success`,
  standardiser `--fig-warning`, tracer `--fig-neutral`, plateforme `--fig-navy`.
- Abandonnés : 6 blocs numérotés, colonne « VERS », footer, coût Workable
  (~1 200 vs ~6 000 € déjà portés par le texte et la fig. 7) ; le chiffre de
  migrations (69→84) disparaît avec les blocs.

## Fait
- [x] `types/index.ts` : `Variant` + `'pairs'`, `BesoinScatterItem`
      (label, tilt), `BesoinOutput` (title, line, icon, color=jeton),
      champs `besoinScatter`/`besoinOutputs`.
- [x] `src/components/Nodes/BesoinFunnelNode.tsx` (v2) ; `BesoinPairsNode.tsx`
      supprimé ; délégation `EntityNode` mise à jour.
- [x] `src/diagrams/memoire/besoin_solution.ts` (W 1360).
- [x] Validation `tsc` + `build` ; commit `refactor(memoire)` v2 (3b39c9c).
- [ ] Export utilisateur → `besoin-solution` ;
      substitution `body.typ:148` (caption inchangée) ; `git rm
      du_besoin_a_la_solution.png` ; `typst compile` ; commits `docs(typst)`.

