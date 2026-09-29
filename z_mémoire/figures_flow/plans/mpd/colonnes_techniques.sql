-- ============================================================================
--  MPD — Colonnes techniques & décisions physiques
--  ============================================================================
--  Projet      : QuizApp — plateforme de recrutement via quiz (Synelia)
--  SGBD        : MySQL 8.x
--  Périmètre   : les 21 tables des 2 figures MPD
--                (mpd-campagnes-candidatures, mpd-entretiens-utilisateurs)
--  Réf. règles : plans/rules/regles_mpd.md  (règles 6, 7, 8, 9, 10, 11)
--  Plan        : plans/implementations/20260928_passage_mld_mpd.md
--
--  ----------------------------------------------------------------------------
--  POURQUOI CE FICHIER EST HORS FIGURES
--  ----------------------------------------------------------------------------
--  Les figures MPD montrent le MLD typé : tables, colonnes, types SQL, PK/FK,
--  nullabilité, politiques ON DELETE. Elles ne répètent PAS ce qui est
--  systématique sur les 21 tables, ni ce qui est purement physique :
--
--    - répéter 5 colonnes d'audit sur 21 tableaux noierait le diagramme sous
--      une information identique partout ;
--    - le MCD/MLD reste la bd_cible (principe acté le 20260922) : une colonne
--      absente du MLD n'a pas sa place DANS la figure. Elle est documentée ici.
--
--  Conséquence de lecture :
--    figure MPD = le MLD, avec ses types et ses contraintes
--    ce script  = le MLD, plus ce que la méthode physique ajoute par nature
--
--  Ce script est un document de conception, pas un script de migration
--  Flyway : il est en PUR ADDITIF (ALTER TABLE ADD) et n'est pas exécuté tel
--  quel. Voir plans/mpd/README.md.
-- ============================================================================


-- ############################################################################
--  RÈGLE 10 — Moteur de stockage, charset et collation
-- ############################################################################
--  Valeurs identiques sur LES 21 tables, donc posées une seule fois ici.
--
--    ENGINE=InnoDB   -> transactions + contraintes FK (MyISAM les ignore)
--    utf8mb4         -> accents ET emoji sur 4 octets (utf8 3 octets : insuffisant)
--    _unicode_ci     -> comparaisons insensibles a la casse ET aux accents
--
--  A reprendre sur chaque CREATE TABLE / ALTER TABLE de la migration.
-- ############################################################################

SET @engine        = 'InnoDB';
SET @charset       = 'utf8mb4';
SET @collation     = 'utf8mb4_unicode_ci';
-- Application : ALTER TABLE `x` ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ############################################################################
--  RÈGLE 7 — Colonnes techniques systématiques
-- ############################################################################
--  5 colonnes sur LES 21 tables. Elles n'ont pas d'information metier propre
--  a une table : c'est exactement ce qui les rend systématiques.
--
--    created_at   -> tracabilite : creation de la ligne
--    created_by   -> tracabilite : auteur (FK user.id, SET NULL -> l'historique
--                     survit a la suppression de son auteur)
--    updated_at   -> tracabilite : derniere modification
--    updated_by   -> tracabilite : auteur de la derniere modification
--    is_deleted   -> soft delete : le MPD introduit ce que le MCD ignore
--
--  created_by / updated_by sont des FK optionnelles : le systeme doit accepter
--  une ligne creee par un batch ou un script (created_by IS NULL).
-- ############################################################################

--   ALTER TABLE `campaigns`
--     ADD COLUMN `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     ADD COLUMN `created_by`  INT UNSIGNED NULL,
--     ADD COLUMN `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
--                                              ON UPDATE CURRENT_TIMESTAMP,
--     ADD COLUMN `updated_by`  INT UNSIGNED NULL,
--     ADD COLUMN `is_deleted`  TINYINT(1)   NOT NULL DEFAULT 0,
--     ADD CONSTRAINT `fk_campaigns_created_by` FOREIGN KEY (`created_by`)
--       REFERENCES `user` (`id`) ON DELETE SET NULL,
--     ADD CONSTRAINT `fk_campaigns_updated_by` FOREIGN KEY (`updated_by`)
--       REFERENCES `user` (`id`) ON DELETE SET NULL;

--   ALTER TABLE `pipeline_template`          ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `pipeline_stage`              ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `campaign_form`               ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `form`                        ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `form_version`                ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `form_questions`              ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `question`                    ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `answer`                      ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `applications`                ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `application_progress`        ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `decisions`                   ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `interviews`                  ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `convocation`                 ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `interview_evaluator`         ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `evaluations`                 ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `evaluation_item`             ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `evaluation_grid_template`     ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `evaluation_grid_template_version`
--                                                 ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `evaluation_grid_criterion`   ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;
--   ALTER TABLE `user`                        ADD COLUMN `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ... ;

--  Colonnes techniques NON systématiques (règle 7 les mentionne, mais elles ne
--  portent d'information que sur certaines tables) :
--  ---------------------------------------------------------------------------
--  `search_string` VARCHAR(500) NULL + index FULLTEXT : recherche plein texte
--  sur `candidate_first_name` / `candidate_last_name` / `email`.
--    ALTER TABLE `applications`
--      ADD COLUMN `search_string` VARCHAR(500) NULL,
--      ADD FULLTEXT KEY `ft_applications_search` (`search_string`);


-- ############################################################################
--  RÈGLE 6 — Contraintes d'unicite
-- ############################################################################
--  Le MLD ne porte AUCUNE unicite : c'est une notion physique, introduite ici
--  et seulement ici, a partir du metier.
--
--  Unicite portee par une cle etrangere COMPOSITE, SANS colonne surrogate.
--  ATTENTION : le MLD ne porte AUCUNE FK directe campagne -> candidature.
--  La chaine est applications.form_version_id -> form_version.form_id -> form,
--  et campaign_form (campaign_id, form_id) relie la campagne a ce formulaire.
--  L'unicite porte donc sur la version de formulaire et l'email du candidat :
--  un candidat ne soumet qu'une fois le meme formulaire.
--  -> remplace la colonne id inventee, la PK reste (form_version_id, candidate_email).
-- ############################################################################

--   ALTER TABLE `applications`
--     ADD UNIQUE KEY `uq_applications_form_email` (`form_version_id`, `candidate_email`);

--   ALTER TABLE `interview_evaluator`
--     ADD UNIQUE KEY `uq_interview_evaluator` (`interview_id`, `user_id`);

--   ALTER TABLE `user`
--     ADD UNIQUE KEY `uq_user_email`    (`email`),
--     ADD UNIQUE KEY `uq_user_username` (`username`);

--   ALTER TABLE `campaign_form`
--     ADD UNIQUE KEY `uq_campaign_form` (`campaign_id`, `form_id`);
--   -- (deja couvert par la PK composite : montre ici la regle, pas un besoin reel)


-- ############################################################################
--  RÈGLE 8 — Index de performance
-- ############################################################################
--  Decision PUREMENT physique, impossible a deduire du MLD : elle se prend a
--  partir des requetes attendues. On n'indexe que ce qui est reellement
--  interroge ; un index de trop coute a l'ecriture.
--
--  Regle empirique retenue : index sur toute colonne de FK (jointure + integrite
--  referentielle) et sur toute colonne de statut (filtrage de listes), sauf si
--  elle est deja couvert par un prefixe de PK composite ou d'un autre index.
-- ############################################################################

--  --- FK deja couvertes par la PK composite : AUCUN index supplementaire ---
--    campaign_form   (campaign_id, form_id)   -> PK
--    form_questions  (form_version_id, question_id) -> PK

--  --- Filtrage de listes par statut (requetes dashboard recurrentes) ---
--  NB : `applications` ne porte AUCUNE colonne de statut. Son etat courant est
--  derivé de `application_progress` : l'index pertinent est donc sur
--  application_progress, pas sur applications.
--   ALTER TABLE `application_progress` ADD KEY `idx_progress_status`      (`progress_status`);
--   ALTER TABLE `interviews`           ADD KEY `idx_interviews_status`   (`status`);
--   ALTER TABLE `convocation`          ADD KEY `idx_convocation_status`  (`response_status`);
--   ALTER TABLE `evaluations`          ADD KEY `idx_evaluations_status`  (`status`);

--  --- Acces par FK (jointure + integrite referentielle) ---
--   ALTER TABLE `application_progress`   ADD KEY `idx_progress_application` (`application_id`);
--   ALTER TABLE `application_progress`   ADD KEY `idx_progress_stage`      (`pipeline_stage_id`);
--   ALTER TABLE `interviews`             ADD KEY `idx_interviews_progress` (`application_progress_id`);
--   ALTER TABLE `evaluation_item`        ADD KEY `idx_item_evaluation`     (`evaluation_id`);
--   ALTER TABLE `evaluation_item`        ADD KEY `idx_item_criterion`      (`criterion_id`);
--   ALTER TABLE `evaluations`            ADD KEY `idx_evaluations_convocation` (`convocation_id`);
--   ALTER TABLE `decisions`              ADD KEY `idx_decisions_user`      (`user_id`);
--   ALTER TABLE `campaigns`              ADD KEY `idx_campaigns_template` (`pipeline_template_id`);
--   ALTER TABLE `pipeline_stage`         ADD KEY `idx_stage_grid_version` (`evaluation_grid_template_version_id`);
--   ALTER TABLE `question`               ADD KEY `idx_question_speciality`(`speciality_id`);

--  --- Tri chronologique des flux ---
--   ALTER TABLE `application_progress` ADD KEY `idx_progress_start`    (`start_date`);
--   ALTER TABLE `interviews`           ADD KEY `idx_interviews_scheduled` (`scheduled_at`);
--   ALTER TABLE `convocation`          ADD KEY `idx_convocation_proposed`  (`proposed_at`);

--  --- Resolution d'annulation (FK reflexive, diagramme cyclique) ---
--   ALTER TABLE `decisions`            ADD KEY `idx_decisions_annulled` (`annulled_decision_id`);

--  --- Recherche d'une candidature ---
--   ALTER TABLE `applications`         ADD KEY `idx_applications_email` (`candidate_email`);


-- ############################################################################
--  RÈGLE 9 — Denormalisation VOLONTAIRE
-- ############################################################################
--  Ces colonnes n'existent PAS au MLD. Elles ne sont donc PAS dans la figure.
--  Elles sont ici parce que c'est le MPD, et le MPD, ou l'on tranche ce genre
--  de compromis de performance.
--
--  Chaque colonne doit repondre a 3 questions :
--    1. quelle requete evite-t-elle ?
--    2. a quel cout de coherence ?
--    3. qui la rafraichit ?
--  Une colonne denormalisee doit rester identifiable : on doit pouvoir la
--  supprimer le jour ou la requete qu'elle evite disparait.
-- ############################################################################

--  --- applications : etat courant synthetise ---
--  `applications` est une table de SYNTHESE et de POINTEURS COURANTS
--  (post-migration 420). Le detail vit dans application_progress.
--  Aucune colonne de statut n'y figure : l'etat courant est portable ici.
--
--  ALTER TABLE `applications`
--    ADD COLUMN `current_pipeline_stage_id`    INT UNSIGNED NULL,
--    ADD COLUMN `current_pipeline_stage_label` VARCHAR(255) NULL,
--    ADD COLUMN `aggregated_quiz_score`        DECIMAL(5,2) NULL,
--    ADD COLUMN `aggregated_interview_score`   DECIMAL(5,2) NULL;
--
--  1. evite    : un JOIN + GROUP BY sur application_progress + evaluations a
--                chaque affichage de la liste des candidatures du dashboard.
--  2. cout     : desynchronise si un avancement change et que la synthese n'est
--                pas rafraichie (valeur potentiellement perimee).
--  3. qui      : la transaction qui clot l'etape de pipeline met a jour
--                current_pipeline_stage_* ; le calcul du score agrege est
--                declenche a la soumission de l'evaluation.
--  4. suppress : suppression triviale si le dashboard accepte de paginer sur
--                la synthise plutot que de recalculer.

--  --- evaluation_item : snapshots (PRESENTS au MLD, rappeles ici) ---
--  `weight_snapshot` / `max_score_snapshot` sont au MLD (coefficient_fige /
--  note_max_figee) et figurent dans la figure. C'est un denormalisation
--  JUSTIFIEE : la note doit rester fidele a la grille au moment de l'evaluation,
--  alors que la grille peut evoluer ensuite.
--   ALTER TABLE `evaluation_item` ADD KEY `idx_item_evaluation` (`evaluation_id`);

--  --- evaluation_grid_criterion : libelle portable ---
--  ALTER TABLE `evaluation_item`
--    ADD COLUMN `criterion_label_snapshot` VARCHAR(255) NULL;
--  meme justification que ci-dessus (la grille peut etre renommee apres coup).


-- ############################################################################
--  RÈGLE 11 — Structure complexe reintegrable en JSON
-- ############################################################################
--  Plutot qu'une sous-table par variante de configuration, on stocke une
--  structure flexible. Compromis PHYSIQUE UNIQUEMENT : le MCD/MLD restent en
--  3FN.
--  Contrepartie a assumer : pas de contrainte sur le contenu, pas de jointure
--  possible, index uniquement via des colonnes generees.
-- ############################################################################

--   ALTER TABLE `evaluation_grid_criterion`
--     ADD COLUMN `config_json` JSON NULL;
--  Contenu : regles de validation propres au type de critere
--  (longueur min/max, format regex, options autorisees).
--
--   ALTER TABLE `pipeline_stage`
--     ADD COLUMN `config_json` JSON NULL;
--  Contenu : regles de transition (etapes suivantes autorisees, conditions).


-- ############################################################################
--  POINT DE VIGILANCE — `user` est un mot reserve MySQL
-- ############################################################################
--  `user` n'est pas reserve en MySQL 8.0.x, mais il l'etait en MySQL 5.x et le
--  reste dans plusieurs outils. Toutes les occurrences sont backtick-ees :
--
--    REFERENCES `user` (`id`)
--    ALTER TABLE `user` ...
--
--  A noter : la table est au SINGULIER (`user`) alors que le reste du schema est
--  au PLURIEL (`campaigns`, `applications`, `questions`). Arbitrage assume
--  (cf. plans/rules/regles_mpd.md, table de correspondance).
-- ############################################################################


-- ############################################################################
--  FK PENDANTE — `applications.source_token_id`
-- ############################################################################
--  La colonne est un attribut du MLD : elle est donc conservee dans la figure.
--  Mais sa cible, la relation TOKEN_SOURCE, est hors perimetre MPD
--  (cf. plans/audit/20260819_hors_scope_mcd.md).
--
--  Consequence : dans les 2 figures MPD, cette FK est pendante. Deux options a
--  trancher plus tard :
--    (a) rejouer TOKEN_SOURCE dans une 3e figure MPD, la FK redevient resolue ;
--    (b) declarer applications.source_token_id comme colonne transverse vers une
--        table non representee, et ne pas tracer de contrainte SQL ici.
--
--  Etat actuel : (b), documentee.
-- ############################################################################
