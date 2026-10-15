# UML — Figures de cas d’utilisation (source : Claude, verbatim)

> Découpage de `figures_uml_claude.md` (l.51-137). Exemples SVG et conseils
> conservés tels quels. Retirées : les questions/offres de suite (« fiche
> quiz ou séquences ? », « diagramme du candidat ou fiche textuelle ? »,
> l.71/101/137) — bavardage, pas de contenu de conception.
>
> ⚠️ Coquille d’origine l.105 : `cas_utilisation_candidat` sans extension
> `.svg` (le fichier `exemples_claude_svg/cas_utilisation_candidat.svg`
> existe bien). Corrigée ci-dessous, original intact.

## Exemple complet : SyneliaQuizApp

`exemples_claude_svg/cas_utilisation_syneliaquizapp.svg`

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

## Structure recommandée (5 diagrammes)

Il est bien pour une vue d'ensemble, mais il n'est pas complet pour un mémoire. Il fait une vingtaine de lignes de moins que ton application réelle, et je l'ai volontairement limité à 14 cas pour rester lisible. Je te conseille de le diviser plutôt que de tout mettre dans un seul schéma.

1. **Un diagramme global** (celui que j'ai fait, ou une version encore plus simple) : les acteurs et les grands objectifs, sans détail. Il sert d'introduction.
2. **Un diagramme détaillé par acteur ou par module**, qui développe les cas que le global ne montre pas :
   - **Candidat** : postuler, vérifier son email, passer le quiz (avec authentification par code, anti-triche), répondre à une invitation, demander une modification de ses informations, abandonner sa candidature.
   - **Recruteur, partie configuration** : gérer les campagnes, les formulaires, les questions et les versions, les modèles de pipeline et les grilles d'évaluation.
   - **Recruteur, partie suivi des candidatures** : consulter les candidatures, valider, sauter ou rouvrir une étape, corriger manuellement une réponse libre, planifier et mener un entretien, évaluer, décider, traiter les demandes des candidats.
   - **Administrateur** : gérer les utilisateurs, les groupes et leurs permissions, les invitations, configurer l'application (SMTP, anti-triche, textes légaux, modèles d'email), consulter l'audit.

Ça fait environ 5 diagrammes, chacun avec 8 à 12 cas d'utilisation, donc lisibles. Il manque aussi un petit groupe de cas communs à presque tous les rôles, comme se connecter, réinitialiser son mot de passe, consulter ses notifications ou accepter une invitation. Tu peux les ajouter au global, ou en faire un mini-diagramme « Authentification ».

## Comment s’assurer d’être complète

Ne te fie pas à ma liste, qui vient de ton schéma de base et pas de ton code. Prends plutôt deux sources :

- les valeurs de `functionality` dans `system_role_permission` et `business_group_permission`, qui sont déjà une liste des fonctionnalités par rôle ;
- les contrôleurs Spring Boot ou les routes Angular, regroupés par rôle. Ton IA dans VSCode peut te sortir cette liste en quelques minutes.

Chaque fonctionnalité de cette liste doit se retrouver dans un cas d'utilisation, ou être regroupée dans un cas plus général comme « Gérer les formulaires ».

## Fichiers d’exemple

- Global : `exemples_claude_svg/cas_utilisation_syneliaquizapp.svg`
- Candidat : `exemples_claude_svg/cas_utilisation_candidat.svg`
- Recruteur configuration : `exemples_claude_svg/cas_utilisation_recruteur_configuration.svg`
- Recruteur suivi : `exemples_claude_svg/cas_utilisation_recruteur_suivi.svg`
- Entretiens et évaluation : `exemples_claude_svg/cas_utilisation_entretiens_evaluation.svg` — l'envoi de l'invitation passe par le Serveur SMTP.
- Administrateur : `exemples_claude_svg/cas_utilisation_administrateur.svg` — l'acteur est placé en bas pour que le nom « Administrateur », plus long que les autres, ne croise aucun trait.

Voilà les cinq diagrammes de cas d'utilisation : le global, puis ceux du candidat, du recruteur en configuration, du recruteur en suivi des candidatures et de l'administrateur.

## Ceux à mettre dans le mémoire (avis Claude)

1. Le diagramme global, en introduction de la partie UML.
2. Le diagramme du candidat. C'est lui qui montre le mieux les relations `include` et `extend`, avec la vérification d'email, l'authentification par code et la détection de triche.
3. Le diagramme « entretiens et évaluation ». Il illustre bien la logique métier propre à ton application et il utilise le serveur SMTP.

Les deux autres (recruteur en configuration et administrateur) sont plus répétitifs, car ils sont surtout composés de « Gérer X ». Mets-les en annexe, ou garde-les pour la soutenance si on te demande plus de détails.

## À vérifier avant de les recopier (avis Claude)

- **Les noms viennent de ton schéma de base de données, pas de ton code.** Compare chaque cas avec tes écrans Angular ou tes contrôleurs Spring. Retire ce qui n'existe pas et ajoute ce qui manque.
- **Les extensions sont des choix de modélisation.** J'ai par exemple supposé que « Publier une version » étend « Gérer les formulaires » et que « Clôturer un entretien » étend « Mener un entretien ». Si dans ton application ces actions sont obligatoires, passe-les en `include`.
- **L'administrateur hérite des cas du recruteur.** Ce n'est pas dessiné dans ces diagrammes mais dans le global, avec la flèche de généralisation. Si tu ne gardes pas le global, ajoute une phrase sous la figure de l'administrateur pour le dire.
- **L'authentification n'apparaît pas.** Se connecter, réinitialiser son mot de passe et consulter ses notifications sont des cas communs à tous les rôles. Si tu veux les montrer, ajoute-les au diagramme global.

## Pour le mémoire (avis Claude)

Ajoute sous chaque figure une phrase qui dit ce qu'elle couvre, par exemple « Figure X : cas d'utilisation du candidat ». Écris aussi les fiches textuelles seulement pour 3 ou 4 cas importants (passer le quiz, valider une étape, planifier un entretien, évaluer), et pas pour les 50 cas. Le jury attend des exemples représentatifs, pas un catalogue.
