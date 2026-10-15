# UML — Règles états-transitions + exemple + prompt (source : Claude, verbatim)

> Découpage de `figures_uml_claude.md` (l.178-214). Le prompt VSCode est
> conservé : il sert la conception (vérification contre le code réel).
> Retirée : la question de suite (« 2 diagrammes ou composants ? », l.214).

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

`exemples_claude_svg/etats_etape_pipeline.svg`

Ce diagramme montre les règles 3 à 6, 8, 10 et 12 : l'état initial, l'état final, la syntaxe `événement [garde] / action`, `entry /` dans « Terminée » et l'état composite « Non terminée ».

Les noms des états et des événements sont une hypothèse de ma part, déduite de tes colonnes `started_at`, `completed_at`, `validated_at`, `skipped_at`, `reopened_at` et `abandoned`. Compare-les avec les vraies valeurs de `progress_status` et avec le code qui change ce statut. Les règles de gestion, comme le seuil de validation, la justification obligatoire ou le fait que « Sautée » puisse être rouverte, doivent venir de ton code et pas de ma lecture du schéma.

Je dois aussi corriger le diagramme de séquence précédent : les endpoints que j'y ai mis (`/quiz/start`, `/answers`, `/quiz/submit`) sont des exemples. Remplace-les par ceux de ton contrôleur Spring Boot.

Ton IA dans VSCode peut sortir ces deux informations du code. Voici un prompt à lui donner :

> Pour le scénario « Passer le quiz », trace le chemin réel dans le code, du contrôleur au service puis au repository. Donne-moi la liste des endpoints, des méthodes appelées et des tables touchées, avec le fichier et la ligne pour chacun. Ensuite, trouve l'enum du statut de `application_progress`, ses valeurs, et chaque endroit du code qui change ce statut, avec l'événement déclencheur et les conditions. N'invente rien : si tu ne trouves pas quelque chose, dis-le.

Pour la suite, je te propose deux diagrammes plus simples, qui complètent bien celui-ci : l'évaluation (brouillon, soumise, validée) et la tentative de quiz.
