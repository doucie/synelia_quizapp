# 20261025 — Figures d'architecture : la cible, sans notation de statut

## Demande utilisateur

« C'est la cible qu'on doit présenter dans le mémoire. L'application n'est pas
terminée, ça ne sert à rien de faire une figure qui s'accroche strictement au
réel vu que le réel contient des bugs. Les figures doivent s'inspirer du réel au
mieux, mais représenter en priorité ce qui doit être. »

Contexte : `deploiement_cible_syneliaquizapp.svg` (livré par Claude, intégré tel
quel) distingue **existant** et **proposé** par des contours pointillés, des
mentions « proposé » et une légende. Rien dans `plans/uml/archi_regles.md`
n'autorise cette notation : la règle 5 réserve le pointillé aux **flèches de
dépendance sans interface formalisée**, et le fichier ne contient en réalité que
les 10 règles du diagramme de composants (le déploiement n'en a aucune).

## Décisions

| Question | Décision |
|---|---|
| Notation de statut (pointillés, « proposé », légende existant/cible) | **Interdite** : une figure = un point de vue, tout est dessiné plein |
| Note « Aujourd'hui : un seul poste… » | retirée du SVG → légende du mémoire |
| Portée de la règle | UML / architecture uniquement (les figures du mémoire gardent leurs règles) |
| Déploiement UML vs fig. 16 | **pas un doublon** : fig. 16 = existant local, UML = cible ; les deux restent |

## Modifications

- [x] `src/diagrams/uml/claude/deploiement_cible_syneliaquizapp.svg`
      - 9 `stroke-dasharray` (attribut) + 9 (style) supprimés : cadres nginx et
        CI/CD, boîte nginx, MinIO, pastille de légende, 4 polygones fins
      - `«server» · proposé` → `«server»` (×2)
      - légende supprimée (2 pastilles + « Existe dans le projet » / « Proposé
        (cible) ») ; note de bas de figure supprimée
      - sous-titre MinIO `CV (cible)` → `CV`
      - `<desc>` réécrit sans « proposé »
      - `viewBox` recadré : `0 0 680 674.96` → `0 0 680 656` (contenu jusqu'à
        y = 616, marge 40 px comme en haut)
      - `<title>` inchangé (« Diagramme de déploiement cible… » est juste) ;
        bloc `<metadata>` C2PA non touché (purgé par `umlRecolor`)
- [x] `plans/uml/archi_regles.md` — addenda 20261025 « règle projet : les
      figures montrent la cible » (6 points), séparé du verbatim Claude
- [x] `plans/uml/verification.md` — ARCHI-2 réécrit (cible conservée, plus un
      doublon), « prochaine étape » mise à jour, légende à reporter dans `body.typ`
- [x] `plans/uml/triage.md` — note après le tableau : déploiement **dans le corps**
- [x] `AGENTS.md` — une puce dans « État actuel (UML) »
- [x] `claude.ts` : inchangé (`uml-deploiement-cible`, `exportWidth: 1200`)

## Vérifications

- [x] SVG bien formé (`[xml]`), `viewBox="0 0 680 656"`, 14 `rect`, 34 `text`
- [x] `dasharray` = 0, `propos` = 0 dans le fichier
- [x] `npx vite build` (vers `%TEMP%`)
- [ ] relecture visuelle `npm run dev` : cadres pleins, plus de bande de légende
      en bas, rien qui se chevauche
- [ ] export SVG (⤓) refait (le `viewBox` a changé)

## Écarté, et pourquoi

- **Garder les pointillés avec une légende** : une légende ne rend pas la
  notation conforme aux règles, et elle entretient le mélange existant/cible.
- **Retirer nginx / CI/CD / MinIO** (option « strict ») : la figure se réduit
  alors à la fig. 16 et n'a plus d'objet — or c'est précisément la cible qu'on
  veut montrer.
- **Marquer les éléments par une note UML `«planned»`** : notation inventée pour
  un besoin que la règle 6 (un cadre = un point de vue) supprime.

## Suite

Le **contenu** des 15 figures UML n'a jamais été vérifié et `body.typ` n'en
référence aucune : audit figure par figure à faire avec la même grille
(conforme aux règles, exact au regard de la cible, aucune notation inventée).
