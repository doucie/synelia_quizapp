Super ! 

Il y a plusieurs choses à faire (si tu sens que certaines tâches sont trop nombreuses pour une seule itération, note les juste quelque part pour les réaliser plus tard):

- Pour les Enums, on doit aussi s'assurer que dans les APIs, si un champ utilise un Enum, aucune autre valeurs que celles contenues dans l'Enum en question n'est acceptée.

- Dans les fichiers que tu as créé, certaines tâches demandent d'auditer ou de lister. Donc fais ces audits pour ajouter des tâches supplémentaires ou de nouveaux livrables s'il le faut

- B.8 — Migrations Flyway : V1_034 est absent dans le projet mais bien enregistré en base, c'était une supressions involontaire

- Dans Campaign Status, j'aimerais bien qu'on ajoute un statut DRAFT s'il n'y a rien comme attribut ou autre qui indique une campagne au statut de brouillon

- C.5 — Pages dashboard métier : form-versions n'a pas vraiment besoin de page métier puisque les utilisateurs ne vont pas vraiment utiliser cela. C'est surtout utilisé en back. Mais peut être que dans la page métier dédiée aux forms, on peut permettre la gestion de form-versions (par exemple, un utilisateur pourrait vouloir restaurer une ancienne version du formulaire)

De même pour legal text (c'est déjà géré dans les settings même si je ne sais pas encore si ça marche), source-tokens (on les créé directement pendant la création de campagne)

La page pour group-change-request doit être accessible depuis la page pour les groupes. Je pense que cela sera plus naturel ainsi. On va sur /dashboard/business-groups, on clique sur un groupe, on peut voir les membres du groupe et le ou les admins du groupe peuvent voir les demandes d'adhésion

La page de correction manuelle doit être accessible depuis la page des candidats. On clique sur un candidat, on peut voir les détails de la candidature, un onglet pour corriger les reponses qui ont besoin de correction selon les autorisations.

Si on fait une page métier pour les presets je pense qu'il faudrait la coupler avec les emails. On a déjà des pages pour créer et modifier les presets et les emails mais c'est vrai que des pages métier seraient bien.

- C.6 — Routes (`app.routes.ts`) pour les routes, va falloir s'assurer qu'on a pas de route "orpheline". J'appelle route orpheline une route qui est présente mais qui n'est pas facilement accéssible. pas exemple, on a la route /connexion qui marche mais il n'y a pas de lien pour se connecter sur la page principale '/'. On a fait ça pour rendre l'accès à la page "connexion" un peu moins instinctive parce qu'elle est réservée aux internes et que les candidats ne doivent pas penser à tort qu'ils peuvent s'inscrire et se connecter comme des internes. mais il faudrait peut être penser à mettre un bouton quelque part peut être de façon voilée, je ne sais pas trop

- On ne doit pas aussi oublier d'auditer sur le front les boutons ou liens ou autre qui ne mènent à rien si ce n'est pas déjà fait

- D.1 — Endpoints BACK existants mais NON consommés côté FRONT : getAllByCriteria et updateAll doivent être utilisés sur les pages du type /dashboard/entities/nom-entité car ils permettent de voir et mettre à jour des enregistrements supprimés logiquement. Les pages /dashboard/entities/nom-entités servent à l'utilisateur super. getByCriteria et update sont les "VOIR" et "MODIFIER" par défaut pour les autres pages

Pour les APIs non appelées il va falloir déterminer où exactement elles doivent être appelées et si il y a certaines qu'on a pas besoin d'appeler, soit, mais pas besoin de les supprimer.

- D.4 — Pages FRONT existantes sans API BACK correspondante : La page merise a vraiment besoin d'une API et d'un algorithme d'organisation d'affichage front fiable. Il ne faut pas que ce soit en dur

- E.2 — Persona : ADMIN /// SMTP/app_config peuvent être vus par les admins et recruteurs mais pas modifiés

- F.3 — Vue par sévérité //// j'ai absolument aucune idée de si queel/* controller est toujours utilisé. Normalement, il a été créé pour qeel-container dans le dashboard. S'il ne sert à rien en ce moment même et bien on peut le supprimer. //// `MinioConfig` vs `quizapp/uploads/cv/` local — doublon ? : Encore une fois je ne sais pas. Faudrait supprimer ce qui n'est pas utile ou tout simplement choisir le meilleur à utiliser et délaisser l'autre. ///  Comptes candidats (`candidate_accounts_enabled`) — fonctionnalité réellement activée côté UI ? : nous avions prévu de créer une table pour les comptes candidat. l'admin pourrait ensuite lui même choisir si il veut que les candidats aient un compte (ce qui améliorera le suivi de candidatures pour ces derniers, de voir toutes leurs candidatures, de s'abonner pour recevoir des news par rapport aux nouvelles campagnes de recrutement etc...)

- En parlant de candidat, le parcour candidat est un peu incomplet E.4 — Persona : CANDIDAT /// il n'y a toujours pas de page pour les candidats qui leur permet de voir les campagnes en cours, les campagnes qui commenceront bientôt et les campagnes récemment terminé

- On a besoin d'un audit pour les pages qui ont impérativement besoin de pagination mais qui n'en ont pas. C'est le casde beaucoup de pages métier. Actuellement, il n'y a pas beaucoup de données dans ma base puisque je suis en phase de développement, mais si une entreprise vient à l'utiliser, les données vont rapidement grossir et sans pagination, ça risque de devenir un problème. Donc il faudrait penser à créer un composant de pagination pour les pages métier et l'utiliser là où il faut, sinon même partout

- Est ce que tous les filtres de recherche (select, barre de recherche, checkboxes) fonctionnent normalement ? Il faut aussi un audit si ce n'est pas déjà fait

- Est ce que le système de notifications est complet ? Il faudrait faire un audit de tout ce qui doit générer une notification et vérifier si c'est OK

- G.1 — Colonnes BD potentiellement mortes, le champs search_string est éffectivement utilisé pour les recherches full_text. à chaque création ou modification d'un enregistrement, il est censé se mettre à jour en recopiant tous les champs de l'enregistrement séparés par des virgules. mais attention, il ne faut pas faired'ajout, s'il y a mise à jour, il supprime ce qui était là avant et regénère le search string. d'ailleurs les search_string doivent être de type TEXT et on doit prendre en compte la possibilité que la taille du search_string à enregistrer dépasse la taille maximale et prévoir quelque chose à faire dans ce cas précis.

applications.quiz_level sert à noter où est ce que le candidat est arrivé exactement dans le quiz. exemple : le candidat répond jusqu'à la question 3 du quiz et son ordinateur s'éteint. On peut lui permettre de reprendre là où il s'était arrêté parce que dans quiz_level on enregistre justement 3 dès qu'il arrive à la troisième question. Mais cela ne prends pas effet si par exemple les questions sont aléatoires. Et il y a aussi le fait que pour une campagne donnée, on peut décider que les forms sont choisis de façon aléatoires par exemple (voir to-do\to-do-2026-04-28-business-flow-gap-checklist.md 6.1), dans ce cas, on doit décider d'une politique de quand exactement le candidat peut reprendre là où il s'était arrêté et quand est ce qu'il ne peut pas. on doit également ajouter un champ pour les questions aléatoires dans la table campagne si ce n'est pas déjà fait

application_abandoned : déclenchement UI, il faudrait prévoir quelque chose pour permettre au candidat d'abadonner sa candidature à n'importe quel moment sur la page de suivie. on peut aussi marquer la candidature comme abandonnée si par exemple elle a été créé mais le candidat n'est pas arrivé à une étape du pipeline qui permet de passer le relais aux recruteurs. exemple : dans le pipeline, à partir d'un moment, le candidat doit passeer un test, le candidat a commencé mais il n'a pas terminé. à partir d'un certain moment, sa candidature doit passer à abandonnée ou peut être directement à archiver. il faudrait un attribut pour archiver les candidatures s'il n'y en a pas.

pre_screen_decision_mail_sent` / `final_decision_mail_sent` : cela vient d'une ancienne version où on avait pas de pipeline personnalisable du coup ça devient obsolete. le but était surtout de vérifier dire si un mail avait bien été envoyé au candidat après par exemple une planification d'entretien ou quoi que ce soit d'autre. Peut être que au niveau de pipeline_stage on pourrait ajouter un attribut du genre "email requis" + "email automatique". En gros, un email peut être requis ou non, et si l'email est requis, il peut être automatique ou non. Cela veut dire que dans le cas où un email est requis pour l'étape mais n'est pas automatique, on va devoir demander à l'utilisateur de cliquer lui même quelque part pour envoyer le mail (avec la possibilité d'ajouter une note suppémentaire dans le mail avant la signature), sinon, lui donner la possibilité de pouvoir l'envoyer après. Je crois qu'il y a déjà un truc du genre au niveau de la création d'entretien. Donc il va falloir faire une vérification à chaque niveau du pipeline oùc'est nécéssaire pour vérifier si le mail est automatiaue ou si on doit plutôt demander. En ce qui concerne "mail_sent" on peut ajouter l'attribut dans application_progress ou bien dans les différentes tables "entretien", "decisions", "evaluations" je sais pas, qu'est ce que tu en pense ? Ou pour l'instant, on garde tout simple et les mails sont envoyés automatiquement à chaque étape où il y a besoin ? Que vaudrait il mieux de faire ?

`campaigns.is_timed` : oui ce serait bien d'afficher dans l'ui et surtout lors de la création/modification je ne sais même pas s'il y a un bouton (checkbox) pour chronométrer la campagne ou non. Et va falloir décider comment on chronomètre. Est ce qu'on se sert de la durée des questions pour chaque formulaires ? Dans ce cas, est ce qu'on devrait pouvoir décider à part de si un formulaire pour une campagne est chronométré et un autre non ? 

`campaigns.max_apply` oui la limite devrait être appliquée au backend.

`campaign_crud.follow` / `is_admin` / `is_creator` / `can_planify` / `can_accept_pre_screen` / `can_accept_final` — toutes ces colonnes sont-elles éditables UI ? oui, mais à savoir si certaines colonnes ne sont pas devenues obsolètes. On a déjà entity_permission, est ce que cela ne pourrait pas "overthrow" campaign_crud ?

D'ailleurs dans entity_permission je pense qu'on pourrait ajouter businessGroupId, roleId parce que par exemple, quand on créé une campage, on peut vouloir décider que tout un groupe puisse participer à cette campagne au lieu de sélectionner utilisateur par utilisateur. Donc au lieu de créer un enregistrement pour tous les membres du groupe, on peut vouloir en faire un seul... Qu'en pense tu ?

`interview_participant.is_online` / `has_finished` / `last_ping_at` — mécanisme online utilisé partout ? : Cela est utilisé lors des interview dans le chat en direct je crois bien

`notifications.object_table_name` = la table / `object_table_id` = l'id de l'enregistrement dans la table. Par exemple, un nouveau candidat dans la campagne que j'ai créé, on m'envoie une notif sur laquelle quand je clique, j'attéris sur le nouveau candidat parce que `notifications.object_table_name` = applications et `object_table_id` = l'id du nouveau candidat en question


`question.question_ref` — UUID ; utilisé pour quoi ? voir to-do\to-do-2026-03-27.md PARTIE B.


`user.admin_mode` — UI permet de l'activer ? sur quels écrans il a effet ? : C'est utilisé sur presque toutes les pages du dashboard dans la sidebar (sidebar-admin-toggle)

`user.page_size_preference` — pris en compte sur tous les tableaux ? : Oui sur tous les tableaux des pages du type /dashboard/entities/nom-entité


`app_config.color_scheme` (`violet`) vs `primary_color` (`#7C3AED`) — redondants ou complémentaires ? : je ne comprends pas la question... le app_config.color_scheme permet de choisir la couleur du thème sachant que pplusieurs entrepprises pourraient vouloir utiliser l'application et qu'elles ont différents logos, différentes brands et donc forcément une préférence en terme de couleur.


G.3 — Conventions code : C'est justement les noms pluriel qu'il faut utiliser au niveau de la bd mais c'est pas vraiment une tâche très importante


- Dans les formulaires de création et de modification, il faudrait un badge (?) pour certains champs qui pourraient être compliqués à comprendre. Comme ça quand l'utilisateur pose la souris sur le badge pendant peut être une seconnde ou deux, il a une explication du champs et de ses options s'il y en a


- H.5 — Sous-système : Tokens / liens publics : Je pense que même quand un utilisateur s'inscrit avec un code d'invitation, après s'être inscrit il doit valider son email avant de pouvoir utiliser l'application.

- Je pense aussi que la durée avant expiration du code d'invitation doit être modifiable via app config

- Est ce que la récupération de mot de passe est gérée ?

