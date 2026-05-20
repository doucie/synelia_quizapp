# Regles Backend / Structure - QuizApp

> Ce fichier definit les regles backend minimales pour eviter le code spaghetti dans `/quizapp`.

---

## 1. Structure obligatoire par table

Pour chaque table BD metier ou exposee par API, il faut au minimum :

- `dao/entity/Entity.java`
- `business/EntityBusiness.java`
- `dao/repository/EntityRepository.java`
- `dao/repository/customize/_EntityRepository.java`
- `rest/api/EntityController.java`
- `utils/dto/EntityDto.java`
- `utils/dto/customize/_EntityDto.java`
- `utils/dto/transformer/EntityTransformer.java`


---

## 2. Responsabilites fixes

- `Controller` : recoit la requete, applique le pattern API existant, verifie les droits, delegue au `Business`, ne contient pas de logique metier.
- `Business` : contient les validations, la logique metier, la propagation des valeurs par defaut, les controles de doublon, les verifications FK, `getFullInfos`, et l'orchestration.
- `Repository` : lit et ecrit en base, construit les criteres, ne contient pas de logique metier.
- `Dto` : contrat d'echange.
- `_Dto` : champs et comportements custom qui doivent survivre a la regeneration.
- `Transformer` : mapping entity <-> dto, jamais de logique metier.

---

## 3. APIs et methodes de base obligatoires

- `EntityController` doit exposer au minimum : `create`, `update`, `delete`, `getByCriteria`, `getAllByCriteria`, `updateAll`.
- `EntityBusiness` doit exposer au minimum : `create`, `update`, `delete`, `getByCriteria`, `getAllByCriteria`, `updateAll`, `getFullInfos`.
- Si un vrai besoin de fiche detaillee existe, `getFullInfos` peut aussi etre expose par API ; sinon il reste centralise dans le `Business` et reutilise par les APIs de base.
- `custom` n'est autorise que si le besoin metier ne rentre pas dans le socle standard.
- Convention projet : tout en `POST`.
- Convention update partiel : `""` -> ignorer, `null` -> mettre a `null`, autre -> mettre a jour.

---

## 4. Interdits anti-spaghetti

- Interdiction de mettre la logique metier dans le `Controller` ou le `Repository`.
- Interdiction d'appeler directement le `Repository` d'une autre entite pour faire un `save()` si cette entite possede deja un `Business` avec des regles metier.
- Interdiction de dupliquer les memes blocs `if/else` dans plusieurs methodes : factoriser dans une methode privee ou un helper metier.
- Interdiction de faire des `findById` / `findOne` repetitifs dans une boucle quand on peut precharger ou indexer les donnees avant traitement.
- Interdiction de lire une information depuis une entite miroir si cette information appartient deja a une autre entite source.
- Interdiction de laisser le front modifier `id`, `createdAt`, `createdBy` ou d'autres champs immuables.
- Interdiction de faire du mapping manuel disperse un peu partout : passer par le `Transformer`.

---

## 5. Regles de traitement

- Dans un traitement en lot, faire d'abord les validations, puis le `saveAll()` final.
- Les validations FK et `findOne` sur les entites liees doivent etre faites hors boucle quand c'est possible.
- Chaque `save()` doit etre precede d'une verification de doublon quand la regle metier l'exige.
- Les champs par defaut du parent doivent etre propages aux entites liees lors de la creation si l'heritage metier l'impose.
- Les mises a jour partielles doivent respecter le pattern existant du projet, sans reimplementer une logique differente selon l'entite.
- `searchString` doit etre regenere apres mutation, a partir de l'etat final de l'entite.
- Le soft delete, la restauration et les verifications associees doivent passer par le flux standard, pas par un traitement ad hoc cache dans un endpoint custom.

---

## 6. Checklist rapide avant merge

- Les validations d'entites liees (`findById`, `findOne`) sont-elles dans la boucle de traitement ? Si oui, sortir ce qui peut l'etre.
- Y a-t-il de la duplication de code dans les blocs `if/else` ? Si oui, factoriser.
- Les `save()` sur des entites d'autres couches passent-ils par le `Business` approprie ?
- Chaque `save()` est-il precede d'une verification de doublon si necessaire ?
- Les champs `default` des entites parentes sont-ils propages aux entites liees lors de la creation ?
- Les donnees sont-elles lues depuis l'entite qui les possede reellement ?
- Les FKs sont-elles validees avant le `saveAll()` ?
- Le `getFullInfos` est-il centralise dans le `Business` au lieu d'etre reconstruit partout ?
- Les champs immuables sont-ils proteges cote backend ?
- Le code suit-il le pattern existant du projet plutot qu'une variante ad hoc ?
