## J.3 — Questions ouvertes à tran

- Q-001 — Stratégie de reprise du quiz
Option A

- Q-002 — Stratégie d'envoi des mails de pipeline
Option B

- Q-003 — Chronométrage des campagnes
Option C
Sachant qu'une campagne peut avoir plusieurs formulaires, et un formulaire est lié à une seule campagne, il serait peut être plus utile d'avoir le champ is_timed par formulaire.

En gros, les questions d'un formulaire peuvent avoir une durée, mais si is_timed pour le formulaire est à false on ignore les durées.

Au contraire, si is_timed est à true, on exige que pour le formulaire, toutes les questions aient une durée (par exemple, chaque fois qu'on enregistre un formulaire, que ce soit via update ou create, on peut vérifier)

(Il faut donner la possibilité au recruteur de tester un formulaire ou une campagne.)

Dans campaingns, on peut plutôt utiliser le champs time_all_forms (booléen). Quand ce champ est à false, on regarde juste is_timed, au niveau des différents forms de la campagne. Mais si l'utilisateur veut mettre le champs à true, on doit aussi passer tous les is_timed des formulaires utilisés par la campagne à true, donc blocage si certaines questions n'ont pas de durées.



- Q-004 — `campaign_crud` vs `entity_permission`
refonte, campaign_crud n'a pas vraiment besoin d'exister. si creator peut être déduit par created_by, on doit s'assurer que created_by ne peut jamais être modifié nul part
is_admin est différent de created_by. celui qui a créé est admin et peut ajouter d'autres personnnes comme admin de la campagne. Les autres admins de la campagne ont à peu près les mêmes droits de base que le créateur de la campagne sur cette dernière


- Q-005 — `entity_permission` + `business_group_id` / `role_id`
oui, appliquer avec user_id à NULL


- Q-006 — Lien "Connexion" voilé sur la page d'accueil `/`
Option B


- Q-007 — `pipeline_stage.mail_sent` localisation
Ouais, l'option C semple être la plus raisonnable


## AUTRE TRAVAIL D'AUDIT A FAIRE
J'aimerais, que pour chaque table existante en bd (en prenant en compte les changements à faire), par chaque champ, tu recherche les options possibles et que tu vérifie si tout ce qui est en rapport avec la table est OK ou non. Et également, chercher comment l'utilisateur va utiliser la table dans une analyse ergonomique, vérifier si les pages dont l'utilisateur a besoin sont présentes et si ces dernières sont fonctionnelles. Vérifier les liaisons de la table et comment elles impactent cette dernière

Exemple :

Je prends la table campaigns (même s'il serait mieux de commencer par les tables qui n'ont aucunes clés étrangères et qui ne dépendent aucunement des autres. Ensuite, les tables qui ont une seule clé étrangère, les tables qui en ont deux... Bref ainsi de suite.)

### 2.1 `campaigns`
- `id` : `int unsigned` : NO : PK
- `campaign_title` : `varchar(255)` : NO
- `campaign_desc` : `text` : YES
- `campaign_status` : `varchar(7)` : NO — **enum implicite** (DRAFT/OPEN/CLOSED/PAUSED ?)
- `campaign_start` : `datetime` : YES
- `campaign_end` : `datetime` : YES
- `max_apply` : `int` : YES
- `all_can_evaluate` : `tinyint(1)` : NO
- `total_questions` : `int` : YES
- ~~`is_timed` : `tinyint(1)` : NO : 0~~ 
- `pipeline_template_id` : `int unsigned` : YES : **FK → pipeline_template.id**
- `form_assignment_strategy` : `varchar(30)` : YES — **enum implicite** (RANDOM/SEQUENTIAL/ROUND_ROBIN ?)
- `form_assignment_exhaustion_policy` : `varchar(20)` : YES — **enum implicite** (CYCLE/STOP/REUSE ?)
- ~~`creator_id` : `int unsigned` : YES : **FK → user.id**~~
- `speciality_id` : `int unsigned` : YES : **FK → specialities.id**


Clée étrangère dans :
`form`,
`interviews`,
`source_token`

Liée explicitement à :
`specialities`

Liée implicitement à :
`business_group_permission`,
`system_role_permission`,
`entity_permission`,
`user_permission_override`


## POSSIBLES CHAMPS MANQUANTS
- Champ pour déterminer si la campagne est prête à être publiée.
    > Raison : une campagne au statut BROUILLON est logiquement une campagne qui n'est pas publiée et donc qui ne peut pas être active même si la date de début arrive. Il faut que l'utilisateur indique clairement que la campagne est publiée pour qu'elle puisse avoir les statuts PENDING, ACTIVE etc

- Champ pour déterminer si la campagne est archivée ou pas
    > Raison : on devrait pouvoir archiver une campagne pour ne plus l'afficher sur certaines pages.


# FONCTIONNALITES ATTENDUES :
> Le SUPER doit pouvoir voir, créer, modifier, supprimer et restaurer une campagne (via la page entities/campaigns) 
    - Il y a t-il des APIs pour cela ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
    - Il y a t-il des pages font dédiées ou un chemin logique pour que le SUPER puisse accéder à ces fonctionnalités via le front ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
    - Le front et le back sont ils correctement connectés ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
> L'utilisateur doit pouvoir voir, créer, modifier, et supprimer une campagne selon ses droits
    - Il y a t-il des APIs pour cela ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
    - Il y a t-il des pages font dédiées ou un chemin logique pour que l'utilisateur puisse accéder à ces fonctionnalités via le front ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
    - Le front et le back sont ils correctement connectés ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
> Le candidat doit pouvoir voir les campagnes publiées et y postuler
    - Il y a t-il des APIs pour cela ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
    - Il y a t-il des pages font dédiées ou un chemin logique pour que le candidat puisse accéder à ces fonctionnalités via le front ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.
    - Le front et le back sont ils correctement connectés ? Sinon qu'est ce qui manque et quelles sont les tâches à faire.

## VERIFICATIONS PAR CHAMPS
- `id` : `int unsigned` : NO : PK
> ...

- `campaign_title` : `varchar(255)` : NO
> Utilisé à la création : OUI
> Utilisé à la modification : OUI
> Champ Obligatoire : OUI
> 255 caratères max
Pour chaque règle, vérifier si elle doit être appliquée dans le back, dans le front ou dans les deux et faire un audit de ce qui est appliqué et de ce qui ne l'est pas. Et vérifier si le parsing est correct

> Proposition de règles
    Nombre minimum de caractères ? (à confirmer)

- `campaign_desc` : `text` : YES
> Utilisé à la création : OUI
> Utilisé à la modification : OUI
> Champ Obligatoire : NON
Pour chaque règle, vérifier si elle doit être appliquée dans le back, dans le front ou dans les deux et faire un audit de ce qui est appliqué et de ce qui ne l'est pas. Et vérifier si le parsing est correct
    - 
- `campaign_status` : `varchar(7)` : NO — **enum implicite** (DRAFT/OPEN/CLOSED/PAUSED ?)
> Utilisé à la création : OUI
> Utilisé à la modification : OUI
> Champ Obligatoire : OUI
> Enum (DRAFT, PENDING, OPEN, PAUSED, CLOSED)
    - DRAFT : Quand la campagne n'est pas publiée
        * Impossible qu'un DRAFT soit publié
        * Impossible de passer de DRAFT à PENDING, OPEN, PAUSED car un DRAFT n'est pas publié
    - PENDING : Campagne publiée mais date de début pas encore atteinte
        *
        * 
    - OPEN : Campagne publiée et date de début atteinte ou dépassée
        *
        * 
    - PAUSED : Campagne publiée et OPEN à laquelle on ne peut participer pour l'instant
        *
        * 
    - CLOSED : Campagne OPEN ou EN_PAUSE terminée car dete de fin arrivée, ou nombre de candidature max atteint ou fermée par un utilisateur
        *
        * 
Pour chaque règle, vérifier si elle doit être appliquée dans le back, dans le front ou dans les deux et faire un audit de ce qui est appliqué et de ce qui ne l'est pas. Et vérifier si le parsing est correct

> Proposition de règles
    ???


etc


# VERIFICATION PAR FK
- `speciality_id` : `int unsigned` : YES : **FK → specialities.id**
    > Utilisé à la création : OUI
    > Utilisé à la modification : OUI
    > Champ Obligatoire : OUI
    > Pouvoir créer une spécialité en même temps que pendant la création d'une campagne : NON


# VERIFICATIONS PAR CHAMPS PROPOSES :
etc.

# FRONT/BACK
Vérifier APIs, Front et connexions entre Front et Back et trouver les corrections manquantes
Définir comment axactement l'utisateur doit acceder aux focntionnalités via le front, quel page, quel bouton et est ce que c'est fait...







BREF, c'est un peu difficile à expliquer mes j'ai vraiment besoin d'un truc un pour déterminer si tout fonctionne et savoir ce qu'il reste à faire sous forme de tâches précises, un gros audit infaillible pour déterminer ce qu'il faut faire et ce qui existe déjà en vérifiant d'abord les focntions attendues pour chaque table, les règles attendues pour chaque champs, les implications sur la table et dans les autres tables en vérifiant

Frontend Angular :

bouton/formulaire
méthode appelée
service HTTP
endpoint appelé

Backend Spring :

contrôleur REST
service métier
repository
sauvegarde DB

Puis :

réponse renvoyée
traitement côté Angular
affichage résultat/erreur


Un peu comme to-do\to-do-2026-04-25-business-flow-tree.md mais de façon plus corcée parce que, bien malgré le fait qu'on a réalisé toutes les tâches de to-do\to-do-2026-04-28-business-flow-gap-checklist.md, il y avait quand même des choses qui ne fonctionnaient pas, des problèmes de parsing, des attributs dont on a pastenu compte des fonctionnalités, des pages, boites de dialogue ou onglets manquants pour certaines fonctionnalités. En vrai, ce serait bon d'établir un pipeline complet pour chaque table en commençant d'abord par les tables qui ne dépendent pas des autres et vérifier minutieusement au détail près si vraiment tout est prêt, que tout est connecté.

Ce serait vraiment de faire un gros fichier pour chaque table, mais AVANT MEME de faire ça, il faudrait un plan infaillible pour pouvoir détecter absolument tout le pipeline possible à partir des attributs et des liaisons d'une table et vérifier de façon très précise si tout est en place et tout est connecté au détail près.



