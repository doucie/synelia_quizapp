# UML — Règles composants/déploiement + exemples + prompt (source : Claude, verbatim)

> Découpage de `figures_uml_claude.md` (l.219-249). Le prompt VSCode est
> conservé : il sert la conception (vérification contre le code réel).
> Retirée : la question sur le diagramme de classes (l.249).

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

## Exemples : architecture de SyneliaQuizApp

- Composants : `exemples_claude_svg/composants_syneliaquizapp.svg`
- Déploiement : `exemples_claude_svg/deploiement_syneliaquizapp.svg`

Plusieurs éléments de ces deux diagrammes sont des hypothèses que tu dois vérifier avant de les recopier :

- **Les composants du backend** : j'ai pris une architecture Spring Boot classique en couches (contrôleurs, services, accès aux données). Si ton code est organisé par domaine (candidatures, quiz, entretiens), refais le diagramme avec ces modules, qui correspondent mieux à ton MCD.
- **L'hébergement** : je n'ai aucune information sur ton déploiement réel. Je n'ai donc mis ni Docker, ni Nginx, ni cloud. Ajoute-les s'ils existent, ainsi que le serveur qui sert l'application Angular.
- **Les ports et protocoles** : 587 et STARTTLS viennent des valeurs par défaut de ta table `smtp_config`, et 3306 est le port par défaut de MySQL. HTTPS est une supposition. Remplace-les par tes vraies valeurs.
- **Les nœuds** : j'ai dessiné trois machines séparées. Si tout tourne sur un seul serveur (en conteneurs Docker, par exemple), fais un seul nœud avec plusieurs environnements d'exécution.

Ton IA dans VSCode peut vérifier tout ça rapidement. Voici un prompt :

> Liste-moi les modules ou packages Java principaux du backend et les dépendances entre eux, ainsi que les bibliothèques utilisées pour la base de données, les emails et les migrations. Lis aussi le Dockerfile, le docker-compose et les fichiers de configuration (`application*.properties` ou `.yml`) s'ils existent, et donne-moi les ports, les protocoles et la structure du déploiement. Ne me montre aucun mot de passe ni secret.

Il te reste surtout le diagramme de classes ciblé. Je te conseille de le faire sur un seul module intéressant, comme le moteur de pipeline, pour montrer ta conception logicielle sans refaire le MCD.
