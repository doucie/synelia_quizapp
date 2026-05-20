# Tri documentaire — alignement BD / backend / frontend

**Date :** 2026-05-18
**Objectif :** réduire la confusion sur les fichiers produits autour du chantier "BD ↔ code" et indiquer clairement lesquels servent encore de repère.

> Ce document ne remplace pas les décisions ni le code. Il sert a savoir **quoi ouvrir**, **quoi relire avec prudence**, et **quoi ne plus utiliser comme pilotage principal**.

---

## 1. A garder comme references principales

### 1.1 Verites techniques et fonctionnelles a conserver

- `to-do/to-do-2026-05-18-db-backlog-unique.md`
  - **Role :** backlog courant simplifie.
  - **Utilite :** point d'entree pratique pour reprendre le chantier sans relire tout `v1 + v2 + v3`.

- `to-do/bd_actuelle/quizapp_db_described.md`
  - **Role :** photo de la BD observee.
  - **Utilite :** base de comparaison schema ↔ code.
  - **Attention :** ce fichier peut etre en retard sur certaines migrations deja presentes dans le repo.

- `to-do/livrables/J-decisions-et-arbitrages.md`
  - **Role :** source principale des clarifications et arbitrages fonctionnels.
  - **Utilite :** document a lire en premier avant toute reprise du chantier.
  - **Pourquoi le garder au centre :** c'est le fichier qui explique ce qui a ete confirme, annule, reformule ou tranche.

- `quizapp/src/main/resources/db/migration/`
  - **Role :** verite technique du schema cible deja code cote backend.
  - **Utilite :** permet de verifier ce qui a reellement ete engage dans le projet, au-dela des notes et backlog.

- `quizapp/src/main/java/` et `quizapp_front/src/`
  - **Role :** verite d'implementation.
  - **Utilite :** a toujours privilegier si un livrable ou un backlog dit quelque chose de different.

---

## 2. A utiliser comme support, pas comme source unique

### 2.1 Backlogs cumulatifs

- `to-do/to-do-2026-05-11-db-code-alignment-backlog.md`
  - **Role :** backlog Z initial.
  - **Etat :** toujours utile, car il contient les items de base `Z-001...`.

- `to-do/to-do-2026-05-12-db-code-alignment-backlog-v2.md`
  - **Role :** complet du backlog initial avec les items `Z-200...`.
  - **Etat :** utile, mais a lire comme un supplement et non comme un remplacement.

- `to-do/to-do-2026-05-13-db-code-alignment-backlog-v3.md`
  - **Role :** ajoute les nouveaux items `Z3-...` issus des decisions J.5/J.6.
  - **Etat :** utile, mais ne remplace ni v1 ni v2.

**Conclusion pratique :** les trois backlogs sont **cumulatifs**. Aucun des trois ne suffit seul.

### 2.2 Livrables de cartographie

- `to-do/livrables/A-inventaire-bd.md`
- `to-do/livrables/C-inventaire-frontend.md`
- `to-do/livrables/D-reconciliation-apis.md`
- `to-do/livrables/E-personas-parcours.md`
- `to-do/livrables/G-qualite-transverse.md`
- `to-do/livrables/H-sous-systemes.md`
- `to-do/livrables/I-securite-owasp.md`

**Role :** cartographie large et analyse de gaps.

**Utilite :** bons documents pour retrouver un sujet, une zone fonctionnelle ou une hypothese de travail.

**Limite :** ils ne doivent pas etre traites comme verite absolue si le code ou les migrations ont evolue depuis.

### 2.3 Livrables a relire avec plus de prudence

- `to-do/livrables/B-inventaire-backend.md`
  - **Risque :** il ne reflete plus completement l'etat actuel du repo, notamment depuis l'arrivee de migrations plus recentes.

- `to-do/livrables/F-matrice-traceabilite.md`
  - **Risque :** bon panorama, mais peut etre partiellement depasse des que des migrations ou du code avancent sans mise a jour equivalente du livrable.

### 2.4 Audits table par table

- `to-do/livrables/L-plan-audit-table-par-table.md`
- `to-do/livrables/L-audit-*.md`

**Role :** atelier d'audit detaille.

**Utilite :** tres utile pour rentrer dans le detail d'une table precise.

**Limite :** les mentions `FIXED` ou `[x]` doivent etre revalidees dans le code si le repo a bouge apres l'audit.

---

## 3. A classer comme historiques utiles

- `to-do/to-do-2026-05-11-db-code-coherence-research-plan.md`
  - **Role :** plan de methode.
  - **Etat :** historique utile, mais ce n'est pas un document de pilotage quotidien.

- `to-do/prompt/code-alignment-review.md`
- `to-do/prompt/code-alignment-revew2.md`
  - **Role :** prompts et contexte de generation.
  - **Etat :** utiles pour comprendre l'origine du chantier, pas pour piloter la suite.

- anciens `to-do-2026-03-*.md`, `to-do-2026-04-*.md`, `to-do-2026-05-04.md`
  - **Role :** historique de decisions, d'intentions et de refontes passees.
  - **Etat :** a conserver pour contexte, mais a ne plus utiliser comme feuille de route principale du chantier actuel.

---

## 4. Ce qu'il ne faut pas supprimer maintenant

- Ne pas supprimer les trois backlogs `2026-05-11`, `2026-05-12`, `2026-05-13`.
  - Ils se completent et contiennent encore des items uniques.

- Ne pas supprimer les `L-audit-*.md`.
  - Meme s'ils sont imparfaits, ils contiennent deja du travail d'investigation qui serait couteux a refaire.

- Ne pas supprimer `J-decisions-et-arbitrages.md`.
  - C'est le repere fonctionnel le plus important du lot.

- Ne pas supprimer `bd_actuelle/quizapp_db_described.md`.
  - Meme s'il faut le confronter aux migrations recentes, c'est encore la meilleure photo centralisee de la BD observee.

---

## 5. Ce qui est le plus trompeur aujourd'hui

- Penser que `v3` remplace `v1` et `v2`.
  - C'est faux : `v3` ajoute seulement de nouveaux items.

- Penser qu'un livrable marque `Consolide` ou un audit marque `FIXED` signifie que le repo est entierement aligne.
  - C'est faux : plusieurs ecarts existent encore entre la BD migree, les entites Java, les DTOs et le front.

- Penser que tout doit etre nettoye avant de reprendre.
  - C'est contre-productif : il vaut mieux garder l'historique, puis consolider progressivement.

---

## 6. Point de depart concret recommande

Si l'objectif est de reprendre le **backend** sans se reperdre, commencer par ce bloc :

1. `to-do/livrables/J-decisions-et-arbitrages.md`
   - relire surtout les decisions `D-015` a `D-024`

2. `quizapp/src/main/resources/db/migration/V1_038__campaigns_archived_time_status.sql`
   - verifier ce que la BD attend maintenant pour `campaigns` et `form`

3. `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/Campaigns.java`
   - verifier les champs encore manquants ou plus alignes

4. `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/Form.java`
   - verifier l'absence ou la presence de `is_timed`

5. `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/EntityPermission.java`
   - verifier l'alignement avec l'extension de scope groupe/role

**Pourquoi commencer la :**

- l'ecart est localise
- les migrations existent deja
- les incoherences sont visibles rapidement
- cela permet d'avancer sans rescanner tout le projet

---

## 7. Regle simple pour la reprise

Quand deux documents se contredisent, suivre cet ordre de priorite :

1. `J-decisions-et-arbitrages.md`
2. les migrations Flyway presentes dans `quizapp/src/main/resources/db/migration/`
3. le code reel dans `quizapp/src/main/java/` et `quizapp_front/src/`
4. les backlogs `v1`, `v2`, `v3`
5. les autres livrables et audits
6. les anciens to-do et prompts

---

## 8. Nettoyage possible plus tard

Quand un document consolide plus fiable existera, on pourra ensuite :

- archiver les anciens prompts de `to-do/prompt/`
- archiver le plan de recherche du 2026-05-11
- produire un backlog unique consolide a la place de `v1 + v2 + v3`
- marquer explicitement certains livrables comme `historique` ou `a revalider`

Pour l'instant, le bon tri consiste a **reclasser mentalement** les fichiers, pas a les supprimer.