# Règles Merise — MLD

> Source : règles de transformation MCD → MLD (méthode Merise).
> Utilisées comme référence méthodologique pour le mémoire (§7.6), en continuité avec les règles MCD (§7.5).

---

## 1. Passage des entités vers les relations

- Chaque entité devient une **relation (table)** portant les mêmes attributs ; l'identifiant devient la **clé primaire**, soulignée.
  > *Ex : `CANDIDAT(id_candidat, nom, prenom, email)` — `id_candidat` souligné, aucun attribut perdu ni ajouté.*
- Le nom de la relation **reprend celui de l'entité**, sans traduction ni reformulation à ce stade — la bascule vers l'anglais/snake_case n'intervient qu'au passage vers le MPD.
  > *Ex : l'entité `CAMPAGNE` reste `CAMPAGNE` au MLD ; elle ne devient `campaign` qu'au MPD.*

---

## 2. La Contrainte d'Intégrité Fonctionnelle (CIF) pilote la migration de clé

- Quand une patte porte une cardinalité **max = 1** (CIF), la clé primaire de l'entité côté « 1 » **migre comme clé étrangère** dans la relation côté « n ». L'association elle-même disparaît en tant que relation autonome.
  > *Ex : `APPLICATION_PROGRESS (0,n) — CONCERNE — (1,1) APPLICATION` : la CIF est côté `APPLICATION`. Au MLD, `id_application` migre comme clé étrangère : `APPLICATION_PROGRESS(id_progress, ..., #id_application)`.*
- S'il existe des attributs propres à l'association, ils **migrent avec la clé étrangère**, dans la même relation — pas de relation séparée créée pour si peu.
  > *Ex : si `CONCERNE` portait un attribut `date_maj`, il rejoindrait `APPLICATION_PROGRESS` aux côtés de `#id_application`.*
- Une CIF « 1,1 » stricte (obligatoire et unique) donne une **clé étrangère non nulle (NOT NULL)**.
  > *Ex : `emettre/generer` entre `CANDIDATURE` et `TOKEN_CANDIDAT` est `(1,1)` côté `CANDIDATURE` — aucun token n'existe sans candidature. Au MLD : `TOKEN_CANDIDAT(id_token, ..., #id_candidature NOT NULL)`.*

---

## 3. Sans CIF (N,N des deux côtés) → l'association devient une relation à part entière

- Si **aucune** des deux pattes n'a de cardinalité max = 1 (donc N,N des deux côtés), l'association devient une **relation indépendante**, dont la clé primaire est la **concaténation des identifiants** des entités reliées.
  > *Ex : `CANDIDAT (0,n) — POSTULE — (0,n) CAMPAGNE` : aucune CIF. Au MLD : `POSTULE(#id_candidat, #id_campagne, date_candidature)`, avec une clé primaire composée.*
- Si l'association N,N n'a **aucun attribut propre**, la relation ne contient que les deux clés étrangères — rien d'autre.
  > *Ex : `CAMPAGNE (0,n) — PROPOSER — (0,n) FORMULAIRE` : `PROPOSER(#id_campagne, #id_formulaire)`, sans aucune autre colonne.*
- Chaque clé étrangère de cette relation composite **référence sa relation d'origine**, exactement comme n'importe quelle FK.
  > *Ex : dans `POSTULE`, `id_candidat` référence `CANDIDAT.id_candidat` et `id_campagne` référence `CAMPAGNE.id_campagne`, indépendamment l'une de l'autre.*

---

## 4. Cardinalités « molles » et valeurs nulles

- Une cardinalité **min = 0** sur la patte qui reste après migration se traduit par une clé étrangère **nullable** ; **min = 1** la rend **obligatoire (NOT NULL)**.
  > *Ex : `compter` entre QUESTION et REPONSE, fixée à `(0,n)` côté QUESTION / `(1,1)` côté REPONSE : la clé étrangère `#id_question` dans REPONSE est donc **obligatoire (NOT NULL)** — chaque réponse appartient obligatoirement à une question.*
- La nullabilité doit découler de la **cardinalité conceptuelle validée**, jamais de la structure physique existante prise comme point de départ.
  > *Ex : une colonne nullable dans la vraie base ne justifie pas à elle seule une cardinalité `(0,1)` si la logique métier dit `(1,1)` — c'est la logique qui commande, la base physique s'ajuste ensuite.*

---

## 5. Associations réflexives

- Une association reliant une entité à elle-même donne une clé étrangère qui référence **la même relation**, avec un **nom de rôle explicite** pour éviter toute ambiguïté avec la clé primaire.
  > *Ex : `DECISION — ANNULE — DECISION` devient `DECISION(id_decision, ..., #id_decision_annulee)` — la colonne ne s'appelle pas `id_decision` (déjà pris) mais reprend le rôle joué : « décision annulée ».*

---

## 6. Associations n-aires (3 entités ou plus)

- Une association reliant **trois entités ou plus** devient **systématiquement une relation indépendante**, avec en clé primaire la concaténation des identifiants de toutes les entités participantes — jamais de simple migration de clé ici, quelles que soient les cardinalités.
  > *Ex : une association hypothétique reliant `CANDIDAT`, `CAMPAGNE` et `GROUPE_METIER` en une seule fois donnerait `(#id_candidat, #id_campagne, #id_groupe_metier, ...)`.*

---

## 7. Cas déjà réglés en amont (au MCD)

- Les attributs multivalués déjà extraits en entités séparées au MCD n'imposent **aucune règle spéciale** au MLD : ils suivent simplement la règle 1 (entité → relation), puis la règle 2 ou 3 selon leur association avec l'entité d'origine.
  > *Ex : si `TELEPHONE` a été créée comme entité séparée pour `CANDIDAT`, elle devient au MLD `TELEPHONE(id_telephone, numero, #id_candidat)` — une CIF classique, rien de plus.*
- Une **spécialisation/héritage** modélisée au MCD se traduit par une **clé primaire partagée** entre relation mère et relations filles : chaque sous-type hérite de l'identifiant de la mère, qui devient à la fois sa clé primaire et sa clé étrangère.
  > *Ex : si `UTILISATEUR` se spécialise en `RECRUTEUR` et `CANDIDAT_UTILISATEUR`, `RECRUTEUR(#id_utilisateur, ...)` porte `id_utilisateur` comme clé primaire ET comme clé étrangère vers `UTILISATEUR`.*

---

## 8. Notation et conventions du MLD

| Élément | Notation |
|---------|----------|
| Clé primaire | soulignée (ou en tête de liste, entre parenthèses) |
| Clé étrangère | précédée de `#`, jamais soulignée |
| Relation | `NOM_RELATION(attribut1, attribut2, ...)` |
| Clé composée | tous les éléments regroupés en tête, séparés par une virgule |

- On garde le **français** à ce niveau, comme au MCD — la bascule anglais/snake_case n'intervient qu'au passage MLD → MPD, où une table de correspondance MCD↔MPD est tenue en annexe.
  > *Ex : `CANDIDAT` et `id_candidat` restent en français au MLD ; ils ne deviennent `applications` / `id` qu'au MPD.*

---

## 9. Vérifications finales de cohérence

- Chaque clé étrangère doit référencer une **clé primaire existante** — jamais un attribut non-clé.
  > *Ex : `#id_campagne` dans `POSTULE` doit référencer `CAMPAGNE.id_campagne`, jamais un attribut comme `CAMPAGNE.nom`.*
- Aucune relation ne doit se retrouver **sans clé primaire**, même après une migration ou une fusion.
  > *Ex : après la migration dans `APPLICATION_PROGRESS`, on vérifie qu'elle garde bien son propre identifiant `id_progress` comme clé primaire — la clé étrangère `#id_application` ne le remplace pas.*
- Le **nombre de relations** doit rester cohérent avec le nombre d'entités + le nombre d'associations N,N ou n-aires du MCD — aucune relation oubliée, aucune ajoutée sans raison.
  > *Ex : sur les tables prévues pour le schéma, chaque relation doit se justifier soit par une entité MCD, soit par une association N,N/n-aire — pas de table ajoutée « au cas où ».*

---

## Exemples concrets (projet)

| Association MCD | Cardinalités | Résultat au MLD |
|-----------------|--------------|-----------------|
| CONCERNE (APPLICATION_PROGRESS–APPLICATION) | `(0,n)` / `(1,1)` | Migration : `#id_application` dans `APPLICATION_PROGRESS` |
| POSTULE (CANDIDAT–CAMPAGNE) | `(0,n)` / `(0,n)` | Nouvelle relation : `POSTULE(#id_candidat, #id_campagne, date_candidature)` |
| PROPOSER (CAMPAGNE–FORMULAIRE) | `(0,n)` / `(0,n)` | Nouvelle relation sans attribut : `PROPOSER(#id_campagne, #id_formulaire)` |
| COMPTER (QUESTION–REPONSE) | `(0,n)` / `(1,1)` | Migration : `#id_question` NOT NULL dans `REPONSE` |
| EMETTRE/GENERER (CANDIDATURE–TOKEN_CANDIDAT) | `(0,n)` / `(1,1)` | Migration : `#id_candidature` NOT NULL dans `TOKEN_CANDIDAT` |
| ANNULE (DECISION–DECISION, réflexive) | `(0,1)` / `(0,1)` | Migration réflexive : `#id_decision_annulee` dans `DECISION` |