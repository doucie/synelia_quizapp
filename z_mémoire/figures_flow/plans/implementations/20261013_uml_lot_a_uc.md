# Lot A UML — 3 cas d’utilisation par acteur + socle `uc`/`uml`

> ⚠️ ABANDONNÉ — restart collab Claude (« tout jeter pour ne pas se
> tromper »). Code supprimé (`UcNode.tsx`, `uc_*.ts`, branche, types
> `Uc*`, enregistrements). Conservés : catégorie `uml`, sidebar,
> `plans/uml/*.md`, `verification.md` (matière des briefs). Remplacé par :
> variante `claude` (`ClaudeSvgNode` + `umlRecolor.ts`, SVG tel quel +
> remapping couleurs) et les briefs `plans/uml/echanges/lotN_*.md`.

Répond à `body.typ:564` (« un diagramme orienté administration, un
orienté recruteur, un orienté candidat »). Base : SVG de Claude
(`plans/uml/exemples_claude_svg/`), corrigés d’après `plans/uml/
verification.md` (intact, ainsi que `figures_uml_claude.md`).

## Socle

- [x] `Category 'uml'` (`types`, `Sidebar` « UML » ◑) : les diagrammes
      UML ne sont pas des figures mémoire, ils ont leur section.
- [x] Variant `'uc'` (`ucSystem`, `ucActors`, `ucCases`, `ucRelations` +
      `UcActor`/`UcCase`/`UcRelation`) → **`UcNode`**, dispatchée depuis
      `EntityNode`. Nœud composite unique, zéro arête RF : tout le dessin
      est en SVG interne déterministe (bonhommes, ellipses à libellés
      découpés, relations rognées au bord des ellipses par résolution
      quadratique `exit`/`entry`, pastilles `«include»`/`«extend»`).
- [x] Directions UML : `include` base → inclus, `extend` extension → base ;
      associations pleines sans flèche, include/extend pointillés fléchés.
- [x] **Reprise v2 du routage** (retour visuel : éventail depuis le
      bonhomme, ellipses jointives, diagonales sécantes) : **rail vertical**
      par acteur à 52 px (un seul trait acteur→rail) + horizontales
      rail→ellipse dans l’ordre des lignes ; traversées de colonne par
      l’interligne le plus proche (coude à 3 segments) ; include/extend en
      **coudes orthogonaux** (voies latérales/centrale +16 px par relation,
      pastille calée sur l’interligne du montant) ; entraxe 140 pour des
      ellipses de 132 max (2 lignes de 24 car.). Données `uc_*.ts`
      intactes.

## Figures (`src/diagrams/uml/`, rigides, 4/3, Cabinet Grotesk, W 1400)

- [x] `uml-uc-candidat` (9 cas) : parcours public + code de suivi en
      include partagé (Demander, Retirer), extend anti-triche et autre
      date, SMTP sur « Vérifier son email ».
- [x] `uml-uc-recruteur` (14 cas, max règle 13) : suivi + entretiens et
      évaluation fusionnés ; justification en include partagé ;
      **notification en `extend [notification requise]`** (correction :
      envoi conditionnel `InterviewsBusiness:728-738`) ; pas d’acteur
      Évaluateur (permission/participation).
- [x] `uml-uc-admin` (11 cas) : gouvernance + config SMTP en extend ;
      SMTP sur « Envoyer l’invitation ».
- [x] Config recruteur (`cas_utilisation_recruteur_configuration.svg`,
      10 cas « Gérer X ») : **non reprise**, en annexe backlog (règle 13 +
      triage Claude) — consigné ici, pas de code.

## Vérification

- [x] `tsc` (zéro erreur nouvelle, reste = baseline), `vite build`.
- [ ] Visuel : ellipses sans rognage, pastilles lisibles, traits nets.
- [ ] Exports ⤓ (`uml-uc-*.svg`, 1 raster, 0 `var()`), bascule `body.typ`
      § UC (remplacement ou ajout après les 3 PNG — à trancher au vu du
      visuel), `typst compile`, `AGENTS.md`.
