# UML — Règles du diagramme de séquence + exemple (source : Claude, verbatim)

> Découpage de `figures_uml_claude.md` (l.141-176). Aucun bavardage à
> retirer dans ce bloc (pas de question ni d’offre de suite).

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

`exemples_claude_svg/sequence_passer_le_quiz.svg`
