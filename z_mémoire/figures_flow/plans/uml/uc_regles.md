# UML — Règles des cas d’utilisation (source : Claude, verbatim)

> Découpage de `figures_uml_claude.md` (l.1-50). Instructions de Claude
> conservées telles quelles. Seule l’offre de démarrage (« on commence par
> le cas d’utilisation : donne-moi tes rôles… », l.21) est retirée : c’est
> du bavardage, pas une règle de conception.

Avec MCD, MLD, MPD et MCT déjà faits, UML doit couvrir ce que Merise ne montre pas : les acteurs, les interactions entre composants, le cycle de vie des objets et l'architecture. Voici ce que je te propose, dans l'ordre de priorité.

**À faire (le socle)**

1. **Diagramme de cas d'utilisation**. C'est la figure d'entrée de toute partie UML. D'après ton schéma, tu as au moins les acteurs candidat, recruteur/évaluateur et administrateur (à confirmer selon tes rôles réels). Je ferais un diagramme global simple, puis éventuellement un par acteur si le global devient illisible.
2. **Diagrammes de séquence**, 3 ou 4 scénarios clés qui montrent le dialogue Angular, API Spring Boot, base de données et mail :
   - dépôt de candidature avec vérification d'email ;
   - passation d'un quiz avec détection anti-triche (changements d'onglet, plein écran) ;
   - validation d'une étape du pipeline avec décision et envoi de notification ;
   - planification d'un entretien, évaluation par la grille, puis décision.
3. **Diagrammes états-transitions**. C'est probablement la figure la plus rentable pour ton projet, parce que ta base est pleine de statuts : l'avancement dans le pipeline (en attente, en cours, validé, sauté, rouvert), la tentative de quiz, l'entretien, et l'évaluation (brouillon, soumise, validée). Un diagramme par objet, et chacun apporte de l'information que le MCD ne contient pas.
4. **Diagramme de composants ou de déploiement**. Pour un master en génie logiciel, il est presque attendu : front Angular, API Spring Boot, MySQL, serveur SMTP, migrations Flyway, et éventuellement Docker.

**Optionnel, avec prudence**

- **Diagramme de classes** : ne refais pas le MCD en classes, ce serait un doublon et le jury le verra. Fais-le plutôt côté code, sur un seul module intéressant (le moteur de pipeline, par exemple, ou la couche service/contrôleur d'un domaine), pour montrer ta conception logicielle et pas ton modèle de données.
- **Diagramme d'activités** : il recoupe fortement le MCT. Ne le fais que pour un flux que ton MCT ne couvre pas bien, comme le parcours du candidat pendant le quiz.

**Mon minimum conseillé** : 1 cas d'utilisation, 3 séquences, 2 ou 3 états-transitions, 1 composants/déploiement et 1 classes ciblé, soit environ 8 à 10 figures. C'est suffisant pour un mémoire, tu n'as pas besoin de tout faire.

Vérifie si ton école impose des diagrammes précis.

## A. Les éléments du diagramme

1. **Frontière du système** : un rectangle nommé qui délimite ce que fait ton application. Les cas d'utilisation sont dedans et les acteurs dehors. *Exemple : le rectangle « SyneliaQuizApp ».*
2. **Acteur** : un rôle joué par un utilisateur ou un système externe, jamais une personne précise ni un composant interne. Il est dessiné hors de la frontière, avec un nom commun au singulier. *Exemple : « Recruteur » (pas « Marie ») et « Serveur SMTP » (système externe). « Base de données » serait faux, car c'est un élément interne.*
3. **Acteur principal et acteur secondaire** : le principal déclenche le cas d'utilisation et se place à gauche, le secondaire fournit un service et se place à droite. *Exemple : le Candidat déclenche « Postuler », le Serveur SMTP envoie les emails.*
4. **Cas d'utilisation** : une ellipse nommée par un verbe à l'infinitif avec son complément. Elle décrit un objectif de l'acteur qui produit un résultat observable, avec les mêmes mots que ton MCD (campagne, étape, candidature). *Exemple : « Postuler à une campagne » est correct, « Insérer dans la table applications » ne l'est pas.*
5. **Bonne granularité** : un cas d'utilisation est un objectif complet, ni un simple clic ni un métier entier. Regroupe les opérations CRUD en un seul cas. *Exemple : « Valider une étape » est bien, « Cliquer sur Valider » est trop fin, « Gérer le recrutement » est trop large. « Gérer les formulaires » remplace créer, modifier et supprimer.*

## B. Les relations

6. **Association** : un trait plein, sans flèche, entre un acteur et un cas d'utilisation. Chaque cas doit être relié à au moins un acteur, directement ou via include ou extend. *Exemple : Candidat — Postuler à une campagne.*
7. **Pas d'autres liens** : aucun trait entre deux acteurs (sauf généralisation) ni entre deux cas (sauf include, extend ou généralisation). *Exemple : pas de flèche « Postuler » → « Passer le quiz ». Ce serait un ordre chronologique, qui relève du diagramme de séquence ou du MCT.*
8. **`«include»`** : relation obligatoire, en flèche pointillée du cas de base vers le cas inclus. Elle sert à factoriser un comportement commun. *Exemple : « Passer le quiz » inclut « S'authentifier par code ». « Planifier un entretien » et « Prendre une décision » incluent tous deux « Envoyer une notification ».*
9. **`«extend»`** : relation optionnelle ou conditionnelle, en flèche pointillée de l'extension vers le cas de base, avec la condition entre crochets. *Exemple : « Détecter une triche » étend « Passer le quiz » [anti-triche activé].*
   Moyen mnémotechnique : avec include, le cas de base ne peut pas se passer de l'inclus. Avec extend, le cas de base fonctionne très bien sans l'extension.
10. **Généralisation** : une flèche à triangle vide, du spécialisé vers le général. Le spécialisé hérite de tous les cas d'utilisation du général. Elle s'applique surtout aux acteurs, rarement aux cas. *Exemple : Administrateur → Recruteur.*

## C. Bonnes pratiques

11. **Le quoi, pas le comment** : aucun détail technique dans les noms. *Exemple : « Soumettre ses réponses » est correct, « Appeler l'endpoint POST /quiz/submit » ne l'est pas.*
12. **Aucune chronologie** : le diagramme dit qui peut faire quoi, pas dans quel ordre. L'ordre va dans les séquences, les états et le MCT.
13. **Lisibilité** : environ 10 à 15 cas d'utilisation par diagramme. Au-delà, découpe par acteur ou par module. *Exemple : un diagramme global, puis un par acteur.*
14. **Une fiche textuelle par cas important** : nom, acteurs, préconditions, scénario nominal, scénarios alternatifs, postconditions. *Exemple : la fiche de « Passer le quiz ».*
