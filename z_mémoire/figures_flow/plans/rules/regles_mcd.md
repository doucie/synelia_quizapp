# Règles Merise — MCD

> Source : règles fondamentales de la méthode Merise appliquées au niveau Conceptuel de Données.
> Utilisées comme référence méthodologique pour le mémoire (§7.5).

---

## 1. Entités

- Une entité représente un **objet du monde réel** (concret, abstrait ou événement), ayant une existence propre et distincte (`CANDIDAT`, `CAMPAGNE`, `FORMULAIRE`).
  > *Ex : `CANDIDAT` et `CAMPAGNE` sont deux entités séparées, car un candidat existe indépendamment d'une campagne précise, et une campagne existe même sans candidat inscrit.*
- Une entité doit avoir **au moins un attribut** : son identifiant. Une entité « vide » n'est pas valide.
  > *Ex : `FORMULAIRE` doit au minimum porter `id_formulaire`, jamais une entité sans aucun attribut.*
- Deux entités distinctes ne doivent jamais avoir la même signification métier — si deux entités désignent la même chose, il faut les **fusionner**.
  > *Ex : si `CANDIDAT` et `POSTULANT` désignent la même chose, il faut fusionner les deux en une seule entité.*
- Une entité doit être **discernable** : chaque occurrence doit pouvoir être distinguée de toute autre grâce à son identifiant.
  > *Ex : deux candidats homonymes (même nom, même prénom) restent distinguables grâce à `id_candidat`, indépendamment de leur nom.*
- Toute entité doit être **reliée** au reste du schéma par au moins une association (pas d'entité isolée, sauf cas justifié).

### Catégories d'objets

| Type | Exemples |
|------|----------|
| Objet concret | `CANDIDAT`, `UTILISATEUR` |
| Objet abstrait mais stable | `CAMPAGNE`, `FORMULAIRE`, `GROUPE_METIER` |
| Événement / fait | `DEMANDE_CHANGEMENT_GROUPE`, `DECISION` |

> Règle : **si ça a besoin d'être identifié individuellement et mémorisé dans le temps, c'est une entité** — peu importe si c'est « physique » ou non.

---

## 2. Attributs

- **Atomique (1FN)** : un attribut ne doit pas être décomposable en sous-éléments ayant un sens séparément.
  > *Ex : `nom_complet = "Kouassi Emi"` doit être éclaté en `nom` et `prenom` si le métier a besoin de les manipuler séparément (recherche par nom seul, tri, etc.).*
- **Pas multivalué** : si une entité peut avoir plusieurs valeurs pour un même attribut, ça devient une entité séparée reliée par une association.
  > *Ex : si un candidat peut avoir plusieurs numéros de téléphone, on ne met pas `"0700000000, 0100000000"` dans un seul champ — on crée une entité `TELEPHONE` reliée à `CANDIDAT` par une association.*
- **Unicité de rattachement** : un attribut ne doit apparaître **qu'une seule fois** dans tout le MCD, rattaché à une seule entité.
  > *Ex : `date_naissance` n'existe qu'une fois dans tout le MCD, rattachée uniquement à `CANDIDAT` — jamais recopiée ailleurs.*
- **Pas calculable** : un attribut ne doit jamais être calculable à partir d'autres attributs déjà présents.
  > *Ex : si tu as déjà `date_naissance`, tu ne stockes pas aussi `age` — l'âge se calcule à la volée. C'est le même problème que `aggregated_quiz_score`, calculable depuis les tentatives de quiz.*
- **Rattachement direct** : chaque attribut doit être rattaché à l'entité (ou association) qui le concerne réellement — c'est la base de la règle de dépendance fonctionnelle.

---

## 3. Identifiants (clé primaire conceptuelle)

- Chaque entité a un **identifiant unique** qui distingue sans ambiguïté chaque occurrence.
  > *Ex : `id_question` distingue deux questions même si elles ont exactement le même `enonce`.*
- L'identifiant est **minimal** : aucun sous-ensemble ne doit suffire à identifier l'entité.
  > *Ex : si `EVALUATION` est identifiée par `(id_interview, id_candidat)`, il ne faut aucun sous-ensemble de ces deux qui suffise seul — sinon l'un des deux est inutile dans la clé.*
- Toutes les autres propriétés dépendent **de la totalité** de l'identifiant (2FN dès le MCD).
  > *Ex : si la clé de `REPONSE` est `(id_question, id_reponse)`, alors `texte` doit dépendre des deux ensemble, pas juste de `id_question`.*
- Un identifiant ne doit jamais être vide ou nul.
  > *Ex : chaque occurrence de `UTILISATEUR` doit obligatoirement avoir un `id_utilisateur` renseigné, sans exception.*
- Par convention, on **souligne** l'identifiant dans le schéma.
- **Pas de clé étrangère en MCD** : un lien s'exprime uniquement par une **association** avec ses cardinalités — jamais par un attribut qui « pointe » vers une autre entité.
  > *Ex : si dans ton MCD tu vois `id_campagne` posé directement dans `DEMANDE_CHANGEMENT_GROUPE`, c'est une erreur — ça doit être une association `CONCERNE` reliant les deux entités.*

---

## 4. Associations (relations entre entités)

- Une association relie **deux entités ou plus** ; elle exprime un lien sémantique (`POSTULE`, `EVALUE`, `CONTIENT`).
  > *Ex : `POSTULE` relie `CANDIDAT` et `CAMPAGNE` : un candidat postule à une campagne.*
- Le nom est un **verbe** à l'infinitif ou conjugué — jamais un nom commun (réservé aux entités).
  > *Ex : `EVALUE` (pas `EVALUATION`, qui serait un nom — réservé aux entités).*
- Une association peut porter des **attributs propres** — seulement si l'attribut dépend de **l'ensemble** des entités liées.
  > *Ex : `date_candidature` sur `POSTULE` a du sens seulement dans le contexte « ce candidat + cette campagne », donc elle reste sur l'association, pas sur `CANDIDAT` seul.*
- Une association **réflexive** est autorisée (entité reliée à elle-même), avec des rôles distincts sur chaque patte.
  > *Ex : `DECISION` reliée à elle-même via `ANNULE` — une décision peut en annuler une autre (comme `cancels_decision_id`).*
- Préférer les associations **binaires** aux associations n-aires.
  > *Ex : au lieu d'une association à 3 branches `CANDIDAT`-`FORMULAIRE`-`CAMPAGNE`, préférer `CANDIDATURE` reliée à chacune séparément.*

---

## 5. Cardinalités

Chaque patte porte une cardinalité **(min, max)** répondant à : *au minimum combien de fois ? au maximum combien ?*

| Cardinalité | Signification |
|-------------|---------------|
| `0,1` | Participation optionnelle, au plus une fois |
| `1,1` | Participation obligatoire, exactement une fois |
| `0,n` | Participation optionnelle, plusieurs fois possibles |
| `1,n` | Participation obligatoire, plusieurs fois possibles |

- La cardinalité se lit **côté entité**, en regardant vers l'association (pas l'inverse — erreur fréquente).
  > *Ex : sur `CANDIDAT (0,n) — POSTULE — (0,n) CAMPAGNE`, on lit « un candidat postule à 0 ou plusieurs campagnes » (côté `CANDIDAT`) et « une campagne reçoit 0 ou plusieurs candidats » (côté `CAMPAGNE`).*
- Toujours définie sur chaque patte, sans exception.
  > *Ex : tu ne laisses jamais une patte sans `(min,max)`, même si ça semble « évident ».*

---

## 6. Contrainte d'intégrité fonctionnelle (CIF)

- Quand cardinalité max = **1** d'un côté, une occurrence côté « 1 » détermine de façon unique l'occurrence liée.
  > *Ex : `APPLICATION_PROGRESS (0,n) — CONCERNE — (1,1) APPLICATION` : une candidature a plusieurs étapes de progression, mais chaque étape appartient à une seule candidature.*
- C'est cette règle qui décide **où va la clé étrangère** au passage MCD→MLD : elle migre toujours du côté max=1 vers le côté max=n.
  > *Ex : la patte `(1,1)` côté `APPLICATION` indique qu'au MLD, la clé étrangère `id_application` ira dans la table `APPLICATION_PROGRESS`, pas l'inverse.*

---

## 7. Normalisation (dès le MCD)

| NF | Règle | Contre-exemple |
|----|-------|----------------|
| **1FN** | Attributs atomiques | `nom_complet` → `nom` + `prenom` |
| **2FN** | Non-clé dépend de **toute** la clé | `date_creation_question` dans `REPONSE` (clé composée) — dépend uniquement de `id_question` |
| **3FN** | Pas de dépendance transitive | `current_pipeline_stage_label` → dépend de `current_pipeline_stage_id` → dépendance indirecte → à exclure |

---

## 8. Cohérence globale

- **Pas d'entité isolée** : toute entité doit être reliée au schéma.
  > *Ex : une entité `LEGAL_TEXT` sans aucun lien avec le reste est suspecte — soit elle doit être reliée (ex : à `APP_CONFIG`), soit elle n'a pas sa place en tant qu'entité relationnelle.*
- **MCD = « quoi » uniquement** : pas de traitement, pas de séquence temporelle.
  > *Ex : le MCD dit « un candidat POSTULE à une campagne », pas « le système envoie un email 3 jours après la candidature » (ça, c'est un traitement → MCT).*
- **Pas de redondance** : un même fait représenté un seul endroit.
  > *Ex : si `email_candidat` est à la fois dans `CANDIDAT` et dans `CANDIDATURE`, c'est une redondance — un seul endroit doit porter cette info.*
- **Indépendance technique** : pas de type SQL, pas d'index, pas de choix de SGBD — ça vient au MPD uniquement.
  > *Ex : pas de `VARCHAR(255)` ni d'`AUTO_INCREMENT` dans un MCD.*

---

## Exemples concrets (projet)

| Règle | Erreur | Correction |
|-------|--------|------------|
| Pas de calculable | `aggregated_quiz_score` dans `APPLICATIONS` | Supprimé — calculé depuis les tentatives |
| Pas de dépendance transitive | `current_pipeline_stage_label` | Supprimé — dépend de `current_pipeline_stage_id` |
| Pas de FK en MCD | `campaign_id` dans `INTERVIEWS` | Supprimé — lien par association |
| Entité légitime | — | `DEMANDE_CHANGEMENT_GROUPE` : événement daté, cycle de vie |
