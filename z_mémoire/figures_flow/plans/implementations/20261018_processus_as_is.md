# 20261018 — Fig. 2 refaite : `processus_as_is` (processus de recrutement as-is)

Remplace `figures_html/processus_recrutement_as_is.html` (§1.3.1, `body.typ:130`).
Décisions utilisateur : **refaire en Gouvernance** (« complètement mauvaise »),
bandeau de stats conservé verbatim, conclusion en pied.

## Verbatim source (figé)
- Titre : « Processus de recrutement actuel — Un parcours éclaté » ; tag SITUATION ACTUELLE.
- Stats : `5–7` Outils distincts / `0` Standardisation / `0 %` Traçabilité ;
  phrase : « Chaque cycle de recrutement mobilise 5 à 7 outils différents sans
  aucune communication entre eux. Les décisions reposent sur des critères
  subjectifs, sans historique consultable. En cas de litige, impossible de
  reconstituer le fil décisionnel. »
- Phase 1 « Diffusion de l'offre » : Traitement de texte (Fichier .docx) —!
  (aucune liaison entre les outils)— Messagerie (Envoi groupé manuel) —!
  (diffusion non tracée)— Réseaux sociaux (Publications manuelles).
- Phase 2 « Réception et tri des candidatures » : Boîte email (CV + lettres en
  PJ) —! (ressaissie manuelle des données)— Tableur (Suivi manuel · Doublons) —!
  (fichiers dispersés)— Dossiers partagés (Drive · NAS · Copies locales).
- Phase 3 « Évaluation et décision » : Formulaire externe (Google Forms ·
  Typeform) —! (résultats déconnectés du dossier candidat)— Appel / Visio
  (Notes papier · Aucune trace) —! (décision sans justification documentée)—
  Décision finale (Email · Aucun archivage).
- Conclusion : « Conséquence : un processus éclaté, sans standardisation ni
  traçabilité, qui expose l'entreprise à des risques de non-conformité RGPD,
  des biais de recrutement, et une perte de temps considérable pour les équipes
  RH. La mise en place d'une plateforme unifiée — SyneliaQuizApp — devient
  indispensable. »
- Abandonné : le SVG décoratif gradient (arcs fléchés) du source, hors style
  Gouvernance ; footer HTML.

## Design
- Variante `'asis'` → `ProcessusAsIsNode` (pattern `RgNode`/`StackFlowNode`,
  nœud composite, zéro arête RF).
- Bandeau stats : 3 médaillons (chiffre `--fig-danger`-teinté, label
  `foreground/85`) + phrase problem à droite.
- 3 phases : numéro pastille + titre ; chaîne de cartes outil (nom bold +
  `kind` en `foreground/85`, fond surface, contour `--fig-line`) reliées par
  **ruptures** : pastille `!` `--fig-danger` + tooltip-texte de rupture rendu
  sous la chaîne en note (l'tooltip HTML n'existe pas à l'export) ou libellé
  court sous la pastille — trancher à l'implémentation (libellé sous pastille
  retenu par défaut).
- Conclusion : bande `--fig-soft`, bord gauche 5 px `--fig-danger`, verbatim.
- `W` ~1240 ; typographie Gouvernance (`fontScale 4/3`).

## Fait
- [ ] `types/index.ts` : `Variant` + `'asis'`, types `AsisPhase`/`AsisTool`
      (name, kind), champ `asisPhases` (ruptures avec label par jonction).
- [ ] `src/components/Nodes/ProcessusAsIsNode.tsx` + ?!EntityNode delegation.
- [ ] `src/diagrams/memoire/processus_as_is.ts` (verbatim ci-dessus).
- [ ] Validation `npx tsc --noEmit` (filtre erreurs NodeProps connues) + `npx vite build`.
- [ ] Export utilisateur → `captures/8-figures-memoire/processus-as-is.svg`
      (nom = `${id}.svg`) ; substitution `body.typ:130` (même caption) ;
      `git rm processus_recrutement_as_is.png` ; `typst compile` ; commits
      `feat(memoire)` + `docs(typst)`.
