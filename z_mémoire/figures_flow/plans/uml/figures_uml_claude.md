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

Vérifie si ton école impose des diagrammes précis. Si tu veux, on commence par le cas d'utilisation : donne-moi la liste de tes rôles et fonctionnalités réels, et je te propose acteurs et cas d'utilisation à partir de ton schéma.

----

Voici d'abord les règles, regroupées en trois blocs, puis un exemple complet pour SyneliaQuizApp.

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

## Exemple complet : SyneliaQuizApp

z_mémoire\figures_flow\plans\uml\exemples_claude_svg\cas_utilisation_syneliaquizapp.svg

Dans ce diagramme, on retrouve les règles ci-dessus :

- **Règle 3** : les acteurs principaux sont à gauche, et le Serveur SMTP, acteur secondaire, est à droite, relié à « Envoyer une notification ».
- **Règle 8** : « Passer le quiz » inclut « S'authentifier par code ». Ce cas inclus est obligatoire, et il correspond à ton `candidate_token`.
- **Règle 8 (cas partagé)** : « Planifier un entretien » et « Prendre une décision » incluent la même notification, au lieu de la dessiner deux fois.
- **Règle 9** : « Détecter une triche » étend « Passer le quiz ». Elle ne se produit que si l'anti-triche est activé dans la config, donc tu peux écrire la condition `[anti-triche activé]` dans ton mémoire.
- **Règle 10** : la flèche à triangle vide fait de l'Administrateur un Recruteur spécialisé. L'administrateur hérite donc de tous les cas du recruteur et ajoute la gestion des utilisateurs et la configuration de l'application.

Quelques points sont des hypothèses de ma part, déduites de ton schéma, à vérifier avant de les reprendre :

1. **Les rôles réels** : j'ai supposé trois acteurs, candidat, recruteur et administrateur. Vérifie tes valeurs de `user_role` et tes permissions. Si l'administrateur n'est pas un recruteur dans ton code, enlève la généralisation.
2. **Le cas « Évaluer un candidat »** : il est réservé aux participants d'entretien avec `can_evaluate`. Si tu veux montrer cette nuance, tu peux ajouter un acteur « Évaluateur », mais le diagramme deviendrait plus chargé.
3. **La limite de lisibilité** : j'ai 14 cas d'utilisation, donc on est au maximum de la règle 13. Si ton diagramme réel en compte plus (corrections manuelles, gestion des modèles d'email, demandes du candidat...), fais plutôt un diagramme global simplifié plus un diagramme détaillé par acteur.

Ce schéma est fait dans mon outil de rendu. Pour ton mémoire, reproduis-le dans le tien, ou dans draw.io ou PlantUML si ton outil ne gère pas encore ce type de figure.

Dis-moi si tu veux que je rédige la fiche textuelle de « Passer le quiz » (règle 14), ou si on passe directement aux diagrammes de séquence.

----

Il est bien pour une vue d'ensemble, mais il n'est pas complet pour un mémoire. Il fait une vingtaine de lignes de moins que ton application réelle, et je l'ai volontairement limité à 14 cas pour rester lisible. Je te conseille de le diviser plutôt que de tout mettre dans un seul schéma.

## Structure que je te recommande

1. **Un diagramme global** (celui que j'ai fait, ou une version encore plus simple) : les acteurs et les grands objectifs, sans détail. Il sert d'introduction.
2. **Un diagramme détaillé par acteur ou par module**, qui développe les cas que le global ne montre pas :
   - **Candidat** : postuler, vérifier son email, passer le quiz (avec authentification par code, anti-triche), répondre à une invitation, demander une modification de ses informations, abandonner sa candidature.
   - **Recruteur, partie configuration** : gérer les campagnes, les formulaires, les questions et les versions, les modèles de pipeline et les grilles d'évaluation.
   - **Recruteur, partie suivi des candidatures** : consulter les candidatures, valider, sauter ou rouvrir une étape, corriger manuellement une réponse libre, planifier et mener un entretien, évaluer, décider, traiter les demandes des candidats.
   - **Administrateur** : gérer les utilisateurs, les groupes et leurs permissions, les invitations, configurer l'application (SMTP, anti-triche, textes légaux, modèles d'email), consulter l'audit.

Ça fait environ 5 diagrammes, chacun avec 8 à 12 cas d'utilisation, donc lisibles. Il manque aussi un petit groupe de cas communs à presque tous les rôles, comme se connecter, réinitialiser son mot de passe, consulter ses notifications ou accepter une invitation. Tu peux les ajouter au global, ou en faire un mini-diagramme « Authentification ».

## Comment t'assurer d'être complète

Ne te fie pas à ma liste, qui vient de ton schéma de base et pas de ton code. Prends plutôt deux sources :

- les valeurs de `functionality` dans `system_role_permission` et `business_group_permission`, qui sont déjà une liste des fonctionnalités par rôle ;
- les contrôleurs Spring Boot ou les routes Angular, regroupés par rôle. Ton IA dans VSCode peut te sortir cette liste en quelques minutes.

Chaque fonctionnalité de cette liste doit se retrouver dans un cas d'utilisation, ou être regroupée dans un cas plus général comme « Gérer les formulaires ».

## Pour le mémoire

Ajoute sous chaque figure une phrase qui dit ce qu'elle couvre, par exemple « Figure X : cas d'utilisation du candidat ». Écris aussi les fiches textuelles seulement pour 3 ou 4 cas importants (passer le quiz, valider une étape, planifier un entretien, évaluer), et pas pour les 50 cas. Le jury attend des exemples représentatifs, pas un catalogue.

Veux-tu que je te prépare le diagramme du candidat en détail, ou qu'on commence par la fiche textuelle de « Passer le quiz » ?

----

z_mémoire\figures_flow\plans\uml\exemples_claude_svg\cas_utilisation_candidat

Ensuite, le recruteur côté configuration. Ici, les extensions sont toutes sur la même ligne que leur cas de base, ce qui rend le diagramme plus lisible.

z_mémoire\figures_flow\plans\uml\exemples_claude_svg\cas_utilisation_recruteur_configuration.svg
z_mémoire\figures_flow\plans\uml\exemples_claude_svg\cas_utilisation_recruteur_suivi.svg

Le quatrième concerne les entretiens et leur évaluation. L'envoi de l'invitation passe par le Serveur SMTP.

z_mémoire\figures_flow\plans\uml\exemples_claude_svg\cas_utilisation_entretiens_evaluation.svg

Le dernier est celui de l'administrateur. L'acteur est placé en bas pour que le nom « Administrateur », plus long que les autres, ne croise aucun trait.

z_mémoire\figures_flow\plans\uml\exemples_claude_svg\cas_utilisation_administrateur.svg

Voilà les cinq diagrammes de cas d'utilisation : le global, puis ceux du candidat, du recruteur en configuration, du recruteur en suivi des candidatures et de l'administrateur.

**Ceux que je mettrais dans le mémoire**

1. Le diagramme global, en introduction de la partie UML.
2. Le diagramme du candidat. C'est lui qui montre le mieux les relations `include` et `extend`, avec la vérification d'email, l'authentification par code et la détection de triche.
3. Le diagramme « entretiens et évaluation ». Il illustre bien la logique métier propre à ton application et il utilise le serveur SMTP.

Les deux autres (recruteur en configuration et administrateur) sont plus répétitifs, car ils sont surtout composés de « Gérer X ». Mets-les en annexe, ou garde-les pour la soutenance si on te demande plus de détails.

**À vérifier avant de les recopier**

- **Les noms viennent de ton schéma de base de données, pas de ton code.** Compare chaque cas avec tes écrans Angular ou tes contrôleurs Spring. Retire ce qui n'existe pas et ajoute ce qui manque.
- **Les extensions sont des choix de modélisation.** J'ai par exemple supposé que « Publier une version » étend « Gérer les formulaires » et que « Clôturer un entretien » étend « Mener un entretien ». Si dans ton application ces actions sont obligatoires, passe-les en `include`.
- **L'administrateur hérite des cas du recruteur.** Ce n'est pas dessiné dans ces diagrammes mais dans le global, avec la flèche de généralisation. Si tu ne gardes pas le global, ajoute une phrase sous la figure de l'administrateur pour le dire.
- **L'authentification n'apparaît pas.** Se connecter, réinitialiser son mot de passe et consulter ses notifications sont des cas communs à tous les rôles. Si tu veux les montrer, ajoute-les au diagramme global.

Pour la suite, je te propose la fiche textuelle de « Passer le quiz » (précondition, scénario nominal, scénarios alternatifs, postconditions). Elle sert ensuite de base au diagramme de séquence correspondant. On la fait maintenant ?

----

Oui, ton IA dans VSCode est mieux placée pour le diagramme final, parce qu'elle peut lire tes vrais contrôleurs, services et repositories, alors que moi je ne vois que ton schéma de base. Je te donne donc les règles et un exemple visuel pour comprendre la notation, puis un prompt à lui transmettre.

## Les règles du diagramme de séquence

### A. Les éléments

1. **Participants et lignes de vie** : chaque participant est un rectangle en haut, prolongé par une ligne verticale pointillée. L'acteur humain est à gauche, puis les composants dans l'ordre de la chaîne d'appel. *Exemple : Candidat, Front Angular, API Spring Boot, Base MySQL.*
2. **Un seul niveau de détail par figure** : soit des composants (Front, API, BD), soit des classes (`QuizController`, `QuizService`, `QuizRepository`), mais pas un mélange des deux. *Exemple : si tu écris `QuizService`, ne mets pas aussi « API » dans la même figure.*
3. **Le temps descend** : l'ordre vertical est l'ordre chronologique, sans échelle de durée. *Exemple : « Vérifie le code » est dessiné avant « Questions + règles ».*
4. **Message synchrone** : flèche pleine à pointe pleine, l'émetteur attend la réponse. *Exemple : le Front appelle `POST /quiz/start` et attend.*
5. **Message de retour** : flèche pointillée à pointe ouverte. Elle est facultative quand la réponse est évidente, mais utile pour les résultats importants. *Exemple : la BD répond « Tentative valide » à l'API.*
6. **Message asynchrone** : flèche à pointe ouverte, l'émetteur n'attend pas. *Exemple : l'envoi d'un email, si ton API le fait en `@Async`.*
7. **Auto-message** : une flèche qui boucle sur la même ligne de vie. *Exemple : l'API « Calcule le score ».*
8. **Barre d'activation** : un rectangle fin sur la ligne de vie, tant que le participant traite la demande. *Exemple : la barre de l'API pendant qu'elle traite `/quiz/start`.*
9. **Nommage et numérotation** : un message porte un appel concret (endpoint ou méthode), pas une phrase vague, et il est numéroté pour pouvoir être cité dans le texte. *Exemple : « 2 : POST /quiz/start » et non « envoie des données ».*

### B. Les fragments combinés

10. **`alt`** : alternatives exclusives, comme un `if / else`. Les zones sont séparées par un trait pointillé, avec une condition entre crochets. *Exemple : [code valide] ou [code invalide].*
11. **`opt`** : bloc facultatif, comme un `if` sans `else`. *Exemple : [onglet quitté], le signalement n'a lieu que si le candidat change d'onglet.*
12. **`loop`** : répétition avec sa condition. *Exemple : [pour chaque question].*
13. **`ref`, `par`, `break`** : `ref` renvoie vers un autre diagramme pour éviter de le répéter, `par` montre des traitements en parallèle, `break` une sortie anticipée. *Exemple : un `ref` « Authentification par code » à la place d'un sous-diagramme déjà dessiné.*

### C. Bonnes pratiques

14. **Un diagramme par scénario** : il correspond à un cas d'utilisation. *Exemple : celui-ci illustre « Passer le quiz ».*
15. **Nominal d'abord** : dessine le scénario normal et seulement les 1 ou 2 alternatives importantes, pas tous les cas d'erreur.
16. **Lisible** : 4 à 6 participants et 15 à 20 messages au maximum. Au-delà, découpe ou utilise un `ref`.
17. **Cohérent avec le reste du mémoire** : mêmes noms que dans les cas d'utilisation, le MCD et le code réel.
18. **Pas d'algorithme** : une logique interne détaillée relève d'un diagramme d'activité, pas d'un diagramme de séquence.

## Exemple : « Passer le quiz »
z_mémoire\figures_flow\plans\uml\exemples_claude_svg\sequence_passer_le_quiz.svg


----

## Les règles du diagramme états-transitions

### A. Les éléments

1. **État** : rectangle arrondi qui désigne une situation durable, pendant laquelle l'objet attend un événement. Il se nomme avec un adjectif ou un participe passé. *Exemple : « En attente », « Validée ». « Valider » serait faux, c'est une action.*
2. **Un diagramme par objet** : il décrit le cycle de vie d'un seul objet métier qui possède un statut. *Exemple : l'étape d'avancement (`application_progress`), la tentative de quiz ou l'évaluation, chacune dans son propre diagramme.*
3. **État initial** : un disque plein, un seul par diagramme, avec une seule flèche sortante et sans événement. *Exemple : à la création de l'étape, l'objet entre dans « En attente ».*
4. **État final** : un cercle contenant un disque plein. Il n'a aucune transition sortante, et un diagramme peut en avoir plusieurs. *Exemple : la candidature retirée met fin au cycle de l'étape.*
5. **Transition** : une flèche d'un état source vers un état cible, déclenchée par un événement. *Exemple : « démarrer » fait passer de « En attente » à « En cours ».*
6. **Syntaxe `événement [garde] / action`** : l'événement déclenche la transition, la garde entre crochets est une condition à remplir, et l'action après le slash s'exécute pendant la transition. Chaque partie est facultative. *Exemple : `valider [seuil atteint] / enregistrer la date`.*
7. **Gardes exclusives** : si plusieurs transitions partent du même état avec le même événement, leurs gardes ne doivent pas pouvoir être vraies en même temps. *Exemple : `terminer [score ≥ seuil]` et `terminer [score < seuil]`.*
8. **Activités internes** : dans un compartiment sous le nom de l'état, `entry /` s'exécute à l'entrée, `do /` pendant le séjour et `exit /` à la sortie. *Exemple : « Terminée » avec `entry / calculer score`.*
9. **Transition interne ou boucle** : un événement traité sans changer d'état. *Exemple : en « En cours », « répondre / sauvegarder » ne fait pas quitter l'état.*
10. **État composite** : un état qui contient des sous-états. Une transition qui part du composite s'applique à tous ses sous-états. *Exemple : « Non terminée » contient « En attente » et « En cours », et « sauter » ou « retirer » fonctionnent depuis les deux.*
11. **Pseudo-état de choix** : un losange qui oriente selon une condition évaluée au moment du passage. *Exemple : après « terminer », [score ≥ seuil] mène à « Validée », sinon à une autre branche.*

### B. Bonnes pratiques

12. **Pas d'état sans sortie**, sauf les états finaux. Chaque état doit aussi être atteignable depuis l'état initial. *Exemple : « Sautée » doit pouvoir être rouverte, sinon c'est un état final à dessiner comme tel.*
13. **Les noms d'états correspondent aux valeurs réelles du statut** dans ta base et dans ton code. *Exemple : les valeurs de l'enum `progress_status`.*
14. **États métier, pas techniques** : un état par situation significative, pas un état par booléen. *Exemple : « Validée » est un état, `validated_at IS NOT NULL` n'en est pas un.*
15. **Transitions cohérentes avec les autres diagrammes** : chaque événement correspond à un cas d'utilisation ou à un message de séquence. *Exemple : « valider » correspond au cas « Valider une étape ».*

## Exemple : cycle de vie d'une étape du pipeline
z_mémoire\figures_flow\plans\uml\exemples_claude_svg\etats_etape_pipeline.svg

Ce diagramme montre les règles 3 à 6, 8, 10 et 12 : l'état initial, l'état final, la syntaxe `événement [garde] / action`, `entry /` dans « Terminée » et l'état composite « Non terminée ».

Les noms des états et des événements sont une hypothèse de ma part, déduite de tes colonnes `started_at`, `completed_at`, `validated_at`, `skipped_at`, `reopened_at` et `abandoned`. Compare-les avec les vraies valeurs de `progress_status` et avec le code qui change ce statut. Les règles de gestion, comme le seuil de validation, la justification obligatoire ou le fait que « Sautée » puisse être rouverte, doivent venir de ton code et pas de ma lecture du schéma.

Je dois aussi corriger le diagramme de séquence précédent : les endpoints que j'y ai mis (`/quiz/start`, `/answers`, `/quiz/submit`) sont des exemples. Remplace-les par ceux de ton contrôleur Spring Boot.

Ton IA dans VSCode peut sortir ces deux informations du code. Voici un prompt à lui donner :

> Pour le scénario « Passer le quiz », trace le chemin réel dans le code, du contrôleur au service puis au repository. Donne-moi la liste des endpoints, des méthodes appelées et des tables touchées, avec le fichier et la ligne pour chacun. Ensuite, trouve l'enum du statut de `application_progress`, ses valeurs, et chaque endroit du code qui change ce statut, avec l'événement déclencheur et les conditions. N'invente rien : si tu ne trouves pas quelque chose, dis-le.

Pour la suite, je te propose deux diagrammes plus simples, qui complètent bien celui-ci : l'évaluation (brouillon, soumise, validée) et la tentative de quiz. Je peux les dessiner dans le même style, ou on peut passer au diagramme de composants et de déploiement.


----

Je te donne les règles des deux diagrammes, chacune avec un exemple, puis un visuel pour chacun. Le diagramme de composants montre comment ton logiciel est découpé, et le diagramme de déploiement montre où il tourne.

## Diagramme de composants

1. **Composant** : une unité modulaire du logiciel, remplaçable, qui expose des interfaces. Elle est dessinée comme un rectangle avec une petite icône de composant. *Exemple : « Contrôleurs REST », « Accès aux données ».*
2. **Interface fournie** (rond, ou « sucette ») : ce que le composant offre aux autres. *Exemple : le backend fournit l'API REST.*
3. **Interface requise** (demi-cercle, ou « prise ») : ce dont le composant a besoin pour fonctionner. *Exemple : l'application Angular requiert l'API REST.*
4. **Connecteur d'assemblage** : le rond d'un composant qui s'emboîte dans la prise d'un autre, pour relier un fournisseur à son consommateur. *Exemple : Angular et les contrôleurs REST, reliés par l'API REST.*
5. **Dépendance** : une flèche pointillée quand le lien n'a pas d'interface formalisée, avec éventuellement un stéréotype comme `«use»`. *Exemple : les services métier utilisent la couche d'accès aux données.*
6. **Frontière** : un grand rectangle qui regroupe les composants d'un même sous-système. *Exemple : « Backend Spring Boot » englobe les contrôleurs, les services et la persistance.*
7. **Systèmes externes** : ils sont dessinés hors de la frontière, souvent en gris. *Exemple : MySQL et le serveur SMTP.*
8. **Bonne granularité** : des modules ou des couches cohérents, entre 5 et 10 composants, jamais une classe isolée. *Exemple : « Services métier » est un composant, `QuizService` est une classe.*
9. **Sens des dépendances** : de la couche haute vers la couche basse, sans cycle. *Exemple : contrôleurs → services → accès aux données, jamais l'inverse.*
10. **Technologies sur les liens** : annote le protocole ou la bibliothèque. *Exemple : `«JDBC»` entre l'accès aux données et MySQL.*

## Exemple : architecture de SyneliaQuizApp
z_mémoire\figures_flow\plans\uml\exemples_claude_svg\composants_syneliaquizapp.svg
z_mémoire\figures_flow\plans\uml\exemples_claude_svg\deploiement_syneliaquizapp.svg

Plusieurs éléments de ces deux diagrammes sont des hypothèses que tu dois vérifier avant de les recopier :

- **Les composants du backend** : j'ai pris une architecture Spring Boot classique en couches (contrôleurs, services, accès aux données). Si ton code est organisé par domaine (candidatures, quiz, entretiens), refais le diagramme avec ces modules, qui correspondent mieux à ton MCD.
- **L'hébergement** : je n'ai aucune information sur ton déploiement réel. Je n'ai donc mis ni Docker, ni Nginx, ni cloud. Ajoute-les s'ils existent, ainsi que le serveur qui sert l'application Angular.
- **Les ports et protocoles** : 587 et STARTTLS viennent des valeurs par défaut de ta table `smtp_config`, et 3306 est le port par défaut de MySQL. HTTPS est une supposition. Remplace-les par tes vraies valeurs.
- **Les nœuds** : j'ai dessiné trois machines séparées. Si tout tourne sur un seul serveur (en conteneurs Docker, par exemple), fais un seul nœud avec plusieurs environnements d'exécution.

Ton IA dans VSCode peut vérifier tout ça rapidement. Voici un prompt :

> Liste-moi les modules ou packages Java principaux du backend et les dépendances entre eux, ainsi que les bibliothèques utilisées pour la base de données, les emails et les migrations. Lis aussi le Dockerfile, le docker-compose et les fichiers de configuration (`application*.properties` ou `.yml`) s'ils existent, et donne-moi les ports, les protocoles et la structure du déploiement. Ne me montre aucun mot de passe ni secret.

Il te reste surtout le diagramme de classes ciblé. Je te conseille de le faire sur un seul module intéressant, comme le moteur de pipeline, pour montrer ta conception logicielle sans refaire le MCD. Je peux te donner les règles et un exemple, comme pour les autres.

----

Oui, tu peux en abandonner plusieurs, et tu devrais le faire. Un mémoire est jugé sur la qualité de l'analyse, pas sur le nombre de figures. Chaque figure dans le corps doit être commentée par au moins un paragraphe, donc 20 figures sans commentaire alourdissent le mémoire sans le renforcer.

| Figure | Décision | Pourquoi |
|---|---|---|
| **MCD global** (vue d'ensemble) | Corps | Figure centrale de ta démarche Merise. |
| **MCD détaillés par sous-domaine** | 2 ou 3 dans le corps, le reste en annexe | Choisis les plus riches, par exemple le quiz et les entretiens et évaluation. |
| **MLD** | Corps en notation textuelle, courte | Les règles de passage MCD → MLD suffisent à montrer ta maîtrise. |
| **MPD** | Annexe (script SQL) et 1 ou 2 exemples dans le corps | Le script existe déjà. |
| **MCT** | 1 ou 2 dans le corps (le processus de recrutement), le reste en annexe | Un exemple bien commenté vaut mieux que tous les processus. |
| **Cas d'utilisation global** | Corps | C'est l'entrée de toute la partie UML. |
| **Cas d'utilisation du candidat** | Corps | Il montre le mieux les relations `include` et `extend`. |
| **Cas d'utilisation : recruteur (configuration), recruteur (suivi), entretiens et évaluation, administrateur** | Annexe, ou abandon | Ils se ressemblent beaucoup, avec surtout des « Gérer X ». |
| **Séquence « Passer le quiz »** | Corps | Elle montre le cœur technique de ton application. |
| **États-transitions de l'étape de pipeline** | Corps | Elle apporte une information que le MCD ne contient pas. |
| **Composants** | Corps | Presque attendu dans un master de génie logiciel. |
| **Déploiement** | Corps si ton chapitre d'architecture n'a pas déjà un schéma équivalent, sinon abandon | Il est court, mais il fait doublon avec les composants si l'architecture est déjà décrite. |
| **Diagramme de classes** | Abandon | Il recoupe le MCD et tu n'as pas à le faire. |
| **États de l'évaluation et du quiz** | Abandon, ou une phrase dans le texte | Ils sont linéaires et n'apprennent rien de plus que celui de l'étape. |

Dans le corps, tu peux viser environ 10 à 12 figures pour toute la modélisation : 3 ou 4 pour Merise et 6 à 8 pour UML. Les autres vont en annexe, ce qui montre que ton travail est complet sans alourdir la lecture.

Vérifie avec ton école si les annexes comptent dans la limite de pages. Si elles ne comptent pas, déplacer les figures secondaires en annexe est la solution la plus simple. Si elles comptent, abandonne plutôt les diagrammes de cas d'utilisation répétitifs et le déploiement.

Si tu me donnes le plan de ton mémoire (chapitres et sections), je peux te proposer où placer chaque figure du corps et ce qu'il faut écrire sous chacune.
