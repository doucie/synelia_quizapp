-- =============================================================================
-- V1_006 : Données de test pour le développement
-- Créé le 2025-07-27 — Jeu de données réaliste pour tester l'application
-- =============================================================================

-- =============================================================================
-- 1. UTILISATEURS (2 nouveaux : 1 admin + 1 recruteur)
--    Mot de passe : Test2025!
-- =============================================================================
INSERT INTO `user` (id, first_name, last_name, username, email, phone, password,
                    is_default_password, user_role, is_online, is_locked,
                    admin_mode, page_size_preference,
                    created_at, created_by, is_deleted, search_string)
VALUES
    (2, 'Marie', 'Dupont', 'mdupont', 'marie.dupont@synelia.tech', '0601020304',
     '$2b$12$R6KQErVJTgOBZpCPbzD2QeqbPeqEf.qrKZAkb1s7ocPQngvlPO17y',
     FALSE, 'ADMIN', FALSE, FALSE, FALSE, 10,
     NOW(), 1, FALSE, 'marie dupont mdupont marie.dupont@synelia.tech admin'),

    (3, 'Jean', 'Martin', 'jmartin', 'jean.martin@synelia.tech', '0605060708',
     '$2b$12$R6KQErVJTgOBZpCPbzD2QeqbPeqEf.qrKZAkb1s7ocPQngvlPO17y',
     FALSE, 'RECRUITER', FALSE, FALSE, FALSE, 10,
     NOW(), 1, FALSE, 'jean martin jmartin jean.martin@synelia.tech recruiter');

-- =============================================================================
-- 2. DÉPARTEMENTS (2 nouveaux, IDs 5-6)
-- =============================================================================
INSERT INTO departments (id, department_name, department_desc, created_at, created_by, is_deleted, search_string)
VALUES
    (5, 'Commercial',  'Département Commercial et Ventes',      NOW(), 1, FALSE, 'commercial ventes'),
    (6, 'Juridique',   'Département Juridique et Conformité',   NOW(), 1, FALSE, 'juridique conformité');

-- =============================================================================
-- 3. SPÉCIALITÉS (4 nouvelles, IDs 8-11)
-- =============================================================================
INSERT INTO specialities (id, speciality_name, speciality_desc, department_id, created_at, created_by, is_deleted, search_string)
VALUES
    (8,  'Vente B2B',          'Vente aux entreprises',                     5, NOW(), 1, FALSE, 'vente b2b entreprises'),
    (9,  'Relation Client',    'Gestion de la relation client',             5, NOW(), 1, FALSE, 'relation client'),
    (10, 'Droit des Affaires', 'Droit commercial et des sociétés',          6, NOW(), 1, FALSE, 'droit affaires commercial'),
    (11, 'Conformité',         'Conformité réglementaire et RGPD',          6, NOW(), 1, FALSE, 'conformité rgpd réglementaire');

-- =============================================================================
-- 4. QUESTIONS (10 questions variées)
-- =============================================================================
INSERT INTO question (id, question_ref, question_text, question_chrono, question_type, score, difficulty_level, speciality_id,
                      created_at, created_by, is_deleted, search_string)
VALUES
    -- Développement Web (speciality_id=1)
    (1, 'Q-WEB-001', 'Quel langage est principalement utilisé pour le développement backend avec Spring Boot ?',
     30, 'SINGLE_CHOICE', 1, 'EASY', 1, NOW(), 1, 0, 'java spring boot backend'),

    (2, 'Q-WEB-002', 'Parmi les technologies suivantes, lesquelles sont utilisées pour le frontend web ?',
     45, 'MULTIPLE_CHOICE', 2, 'MEDIUM', 1, NOW(), 1, 0, 'frontend html css javascript'),

    (3, 'Q-WEB-003', 'JavaScript est un langage compilé.',
     15, 'TRUE_FALSE', 1, 'EASY', 1, NOW(), 1, 0, 'javascript compilé interprété'),

    (10, 'Q-WEB-004', 'Quelles requêtes SQL permettent de modifier des données dans une base ?',
     60, 'MULTIPLE_CHOICE', 3, 'HARD', 1, NOW(), 1, 0, 'sql insert update delete'),

    -- Développement Mobile (speciality_id=2)
    (4, 'Q-MOB-001', 'Quel framework permet de développer des apps mobiles cross-platform avec JavaScript ?',
     30, 'SINGLE_CHOICE', 2, 'MEDIUM', 2, NOW(), 1, 0, 'react native mobile cross-platform'),

    -- Data Science (speciality_id=3)
    (5, 'Q-DATA-001', 'Quelle bibliothèque Python est la plus utilisée pour le Machine Learning supervisé ?',
     45, 'SINGLE_CHOICE', 3, 'HARD', 3, NOW(), 1, 0, 'python machine learning scikit-learn'),

    -- DevOps (speciality_id=4)
    (6, 'Q-DEVOPS-001', 'Quel outil est utilisé pour la conteneurisation d''applications ?',
     30, 'SINGLE_CHOICE', 2, 'MEDIUM', 4, NOW(), 1, 0, 'docker conteneurisation devops'),

    -- Marketing Digital (speciality_id=5)
    (7, 'Q-MKT-001', 'Que signifie SEO ?',
     20, 'SINGLE_CHOICE', 1, 'EASY', 5, NOW(), 1, 0, 'seo référencement marketing'),

    -- Comptabilité (speciality_id=6)
    (8, 'Q-COMPTA-001', 'Quel document comptable résume la situation financière d''une entreprise à un instant donné ?',
     30, 'SINGLE_CHOICE', 1, 'EASY', 6, NOW(), 1, 0, 'bilan comptable finances'),

    -- Recrutement (speciality_id=7)
    (9, 'Q-RH-001', 'Décrivez votre expérience la plus significative en gestion d''équipe.',
     120, 'TEXT', 5, 'MEDIUM', 7, NOW(), 1, 0, 'expérience gestion équipe management');

-- =============================================================================
-- 5. RÉPONSES (3-4 par question à choix)
-- =============================================================================
INSERT INTO answer (id, question_id, answer_text, answer_type, answer_order, is_correct,
                    created_at, created_by, is_deleted, search_string)
VALUES
    -- Q1 : Java / Spring Boot (SINGLE_CHOICE)
    (1,  1, 'Java',       'FIXED', 1, 1, NOW(), 1, 0, 'java'),
    (2,  1, 'Python',     'FIXED', 2, 0, NOW(), 1, 0, 'python'),
    (3,  1, 'Ruby',       'FIXED', 3, 0, NOW(), 1, 0, 'ruby'),
    (4,  1, 'PHP',        'FIXED', 4, 0, NOW(), 1, 0, 'php'),

    -- Q2 : Frontend technologies (MULTIPLE_CHOICE)
    (5,  2, 'HTML',        'FIXED', 1, 1, NOW(), 1, 0, 'html'),
    (6,  2, 'CSS',         'FIXED', 2, 1, NOW(), 1, 0, 'css'),
    (7,  2, 'JavaScript',  'FIXED', 3, 1, NOW(), 1, 0, 'javascript'),
    (8,  2, 'MySQL',       'FIXED', 4, 0, NOW(), 1, 0, 'mysql'),

    -- Q3 : JavaScript compilé (TRUE_FALSE)
    (9,  3, 'Vrai',  'FIXED', 1, 0, NOW(), 1, 0, 'vrai'),
    (10, 3, 'Faux',  'FIXED', 2, 1, NOW(), 1, 0, 'faux'),

    -- Q4 : React Native (SINGLE_CHOICE)
    (11, 4, 'React Native', 'FIXED', 1, 1, NOW(), 1, 0, 'react native'),
    (12, 4, 'Swift',        'FIXED', 2, 0, NOW(), 1, 0, 'swift'),
    (13, 4, 'Kotlin',       'FIXED', 3, 0, NOW(), 1, 0, 'kotlin'),

    -- Q5 : ML Library (SINGLE_CHOICE)
    (14, 5, 'Scikit-learn', 'FIXED', 1, 1, NOW(), 1, 0, 'scikit-learn'),
    (15, 5, 'Pandas',       'FIXED', 2, 0, NOW(), 1, 0, 'pandas'),
    (16, 5, 'NumPy',        'FIXED', 3, 0, NOW(), 1, 0, 'numpy'),
    (17, 5, 'Matplotlib',   'FIXED', 4, 0, NOW(), 1, 0, 'matplotlib'),

    -- Q6 : Docker (SINGLE_CHOICE)
    (18, 6, 'Docker',      'FIXED', 1, 1, NOW(), 1, 0, 'docker'),
    (19, 6, 'Git',         'FIXED', 2, 0, NOW(), 1, 0, 'git'),
    (20, 6, 'Jenkins',     'FIXED', 3, 0, NOW(), 1, 0, 'jenkins'),

    -- Q7 : SEO (SINGLE_CHOICE)
    (21, 7, 'Search Engine Optimization',   'FIXED', 1, 1, NOW(), 1, 0, 'search engine optimization'),
    (22, 7, 'Social Engagement Online',     'FIXED', 2, 0, NOW(), 1, 0, 'social engagement online'),
    (23, 7, 'Secure Email Operation',       'FIXED', 3, 0, NOW(), 1, 0, 'secure email operation'),

    -- Q8 : Bilan comptable (SINGLE_CHOICE)
    (24, 8, 'Le bilan',                   'FIXED', 1, 1, NOW(), 1, 0, 'bilan'),
    (25, 8, 'Le compte de résultat',      'FIXED', 2, 0, NOW(), 1, 0, 'compte résultat'),
    (26, 8, 'Le journal',                 'FIXED', 3, 0, NOW(), 1, 0, 'journal'),

    -- Q9 : TEXT — pas de réponse prédéfinie

    -- Q10 : SQL modification (MULTIPLE_CHOICE)
    (27, 10, 'INSERT',  'FIXED', 1, 1, NOW(), 1, 0, 'insert'),
    (28, 10, 'UPDATE',  'FIXED', 2, 1, NOW(), 1, 0, 'update'),
    (29, 10, 'DELETE',  'FIXED', 3, 1, NOW(), 1, 0, 'delete'),
    (30, 10, 'SELECT',  'FIXED', 4, 0, NOW(), 1, 0, 'select');

-- =============================================================================
-- 6. CAMPAGNES (3 campagnes avec différents statuts)
-- =============================================================================
INSERT INTO campaigns (id, campaign_title, campaign_desc, campaign_status,
                       campaign_start, campaign_end, max_apply,
                       all_can_evaluate, total_questions, is_timed,
                       creator_id, speciality_id,
                       created_at, created_by, is_deleted, search_string)
VALUES
    (1, 'Développeur Web Junior 2025',
     'Recrutement de développeurs web juniors pour renforcer l''équipe technique. Profil recherché : maîtrise de Java/Spring Boot et des bases frontend.',
     'ACTIVE',  DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 50,
     TRUE, 4, TRUE, 1, 1,
     DATE_SUB(NOW(), INTERVAL 10 DAY), 1, FALSE,
     'développeur web junior 2025 java spring boot'),

    (2, 'Data Scientist Senior',
     'Recherche d''un Data Scientist expérimenté pour piloter les projets IA. Compétences en Python, ML et Deep Learning requises.',
     'PENDING', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 20,
     FALSE, 1, FALSE, 1, 3,
     DATE_SUB(NOW(), INTERVAL 3 DAY), 1, FALSE,
     'data scientist senior python ia machine learning'),

    (3, 'DevOps Engineer',
     'Poste de DevOps Engineer pour automatiser le CI/CD et gérer l''infrastructure cloud. Docker, Kubernetes et AWS requis.',
     'CLOSED', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 30,
     TRUE, 1, TRUE, 1, 4,
     DATE_SUB(NOW(), INTERVAL 65 DAY), 1, FALSE,
     'devops engineer ci/cd docker kubernetes aws');

-- =============================================================================
-- 7. PERMISSIONS CAMPAGNE (campaign_crud)
-- =============================================================================
INSERT INTO campaign_crud (id, can_update, can_delete, can_evaluate, follow, is_admin, is_creator,
                           can_planify, can_accept_pre_screen, can_accept_final,
                           user_id, campaign_id, created_at, created_by, is_deleted, search_string)
VALUES
    -- Campagne 1 : super=creator, admin=évaluateur, recruiter=suivi
    (1, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  1, 1, NOW(), 1, FALSE, NULL),
    (2, TRUE,  FALSE, TRUE,  TRUE,  FALSE, FALSE, TRUE,  TRUE,  FALSE, 2, 1, NOW(), 1, FALSE, NULL),
    (3, FALSE, FALSE, TRUE,  TRUE,  FALSE, FALSE, FALSE, FALSE, FALSE, 3, 1, NOW(), 1, FALSE, NULL),

    -- Campagne 2 : super=creator, admin
    (4, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  1, 2, NOW(), 1, FALSE, NULL),
    (5, TRUE,  FALSE, TRUE,  TRUE,  FALSE, FALSE, TRUE,  TRUE,  FALSE, 2, 2, NOW(), 1, FALSE, NULL),

    -- Campagne 3 : super=creator
    (6, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  1, 3, NOW(), 1, FALSE, NULL);

-- =============================================================================
-- 8. FORMULAIRES (1 par campagne)
-- =============================================================================
INSERT INTO form (id, form_name, form_desc, is_active, campaign_id, created_at, created_by, is_deleted, search_string)
VALUES
    (1, 'Quiz Développeur Web',    'Formulaire d''évaluation des compétences web',       1, 1, NOW(), 1, 0, 'quiz développeur web'),
    (2, 'Quiz Data Science',       'Formulaire d''évaluation des compétences en data',   1, 2, NOW(), 1, 0, 'quiz data science'),
    (3, 'Quiz DevOps',             'Formulaire d''évaluation des compétences DevOps',    1, 3, NOW(), 1, 0, 'quiz devops');

-- =============================================================================
-- 9. VERSIONS DE FORMULAIRE
-- =============================================================================
INSERT INTO form_version (id, form_id, version_number, is_published, is_locked, created_at, created_by, is_deleted, search_string)
VALUES
    (1, 1, 1, 1, 0, NOW(), 1, 0, 'v1 quiz web'),
    (2, 2, 1, 0, 0, NOW(), 1, 0, 'v1 quiz data'),
    (3, 3, 1, 1, 1, NOW(), 1, 0, 'v1 quiz devops');

-- =============================================================================
-- 10. QUESTIONS DE FORMULAIRE (form_questions)
-- =============================================================================
INSERT INTO form_questions (id, form_version_id, question_id, question_order, chrono_override,
                            created_at, created_by, is_deleted, search_string)
VALUES
    -- Form version 1 (Dev Web) : Q1, Q2, Q3, Q10
    (1, 1, 1,  1, NULL, NOW(), 1, 0, NULL),
    (2, 1, 2,  2, NULL, NOW(), 1, 0, NULL),
    (3, 1, 3,  3, NULL, NOW(), 1, 0, NULL),
    (4, 1, 10, 4, 90,   NOW(), 1, 0, NULL),

    -- Form version 2 (Data Science) : Q5
    (5, 2, 5, 1, NULL, NOW(), 1, 0, NULL),

    -- Form version 3 (DevOps) : Q6
    (6, 3, 6, 1, NULL, NOW(), 1, 0, NULL);

-- =============================================================================
-- 11. TOKENS SOURCE (3 tokens)
-- =============================================================================
INSERT INTO source_token (id, token_string, source_token_name, expiration_date, campaign_id,
                          created_at, created_by, is_deleted, search_string)
VALUES
    (1, 'WEB001', 'LinkedIn Dev Web',        DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NOW(), 1, FALSE, 'linkedin dev web web001'),
    (2, 'WEB002', 'Indeed Dev Web',           DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NOW(), 1, FALSE, 'indeed dev web web002'),
    (3, 'DAT001', 'LinkedIn Data Scientist',  DATE_ADD(NOW(), INTERVAL 60 DAY), 2, NOW(), 1, FALSE, 'linkedin data scientist dat001');

-- =============================================================================
-- 12. CANDIDATURES (5 candidats)
-- =============================================================================
INSERT INTO applications (id, candidate_first_name, candidate_last_name, candidate_email, candidate_phone,
                          candidate_cv_path, candidate_birth_date, motivation_letter,
                          email_verified, quiz_score, quiz_score_percent, quiz_level,
                          total_questions, quiz_token, quiz_status, time_elapsed,
                          total_evaluation_score, total_evaluation_number, total_evaluation_percentage,
                          application_status, visit_token,
                          interview_date, interview_status, application_abandoned,
                          pre_screen_decision_mail_sent, final_decision_mail_sent,
                          source_token_id, form_version_id,
                          created_at, created_by, is_deleted, search_string)
VALUES
    -- Alice : a postulé, quiz pas encore commencé
    (1, 'Alice', 'Martin', 'alice.martin@email.com', '0611223344',
     NULL, '1998-03-15', 'Passionnée par le développement web, je souhaite rejoindre votre équipe.',
     TRUE, NULL, NULL, NULL,
     4, 'qt-alice-2025-abc123def456', 'PENDING', 0,
     NULL, NULL, NULL,
     'ACTIVE', 'vt-alice-001',
     NULL, NULL, FALSE,
     FALSE, FALSE,
     1, 1,
     DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, FALSE,
     'alice martin alice.martin@email.com'),

    -- Bob : a terminé le quiz avec un bon score
    (2, 'Bob', 'Dupré', 'bob.dupre@email.com', '0622334455',
     'cv/bob_dupre_cv.pdf', '1995-07-22', 'Fort de 3 ans d''expérience en développement Java.',
     TRUE, 6, 86, 2,
     4, 'qt-bob-2025-xyz789ghi012', 'DONE', 185,
     80.0, 1, 80.0,
     'ACTIVE', 'vt-bob-002',
     DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', FALSE,
     FALSE, FALSE,
     1, 1,
     DATE_SUB(NOW(), INTERVAL 6 DAY), NULL, FALSE,
     'bob dupré bob.dupre@email.com'),

    -- Chloé : quiz terminé, rejetée après évaluation
    (3, 'Chloé', 'Bernard', 'chloe.bernard@email.com', '0633445566',
     'cv/chloe_bernard_cv.pdf', '1999-11-08', NULL,
     TRUE, 3, 43, 1,
     4, 'qt-chloe-2025-jkl345mno678', 'DONE', 240,
     45.0, 1, 45.0,
     'REJECT', 'vt-chloe-003',
     DATE_SUB(NOW(), INTERVAL 2 DAY), 'COMPLETED', FALSE,
     TRUE, FALSE,
     2, 1,
     DATE_SUB(NOW(), INTERVAL 8 DAY), NULL, FALSE,
     'chloé bernard chloe.bernard@email.com'),

    -- David : candidature Data Scientist, en attente
    (4, 'David', 'Leroy', 'david.leroy@email.com', '0644556677',
     'cv/david_leroy_cv.pdf', '1992-01-30', 'Expert en Python et Machine Learning avec 5 ans d''expérience.',
     TRUE, NULL, NULL, NULL,
     1, 'qt-david-2025-pqr901stu234', 'PENDING', 0,
     NULL, NULL, NULL,
     'ACTIVE', 'vt-david-004',
     NULL, NULL, FALSE,
     FALSE, FALSE,
     3, 2,
     DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, FALSE,
     'david leroy david.leroy@email.com'),

    -- Emma : quiz en cours
    (5, 'Emma', 'Moreau', 'emma.moreau@email.com', '0655667788',
     NULL, '1997-06-12', 'Développeuse passionnée par les nouvelles technologies.',
     TRUE, 2, NULL, NULL,
     4, 'qt-emma-2025-vwx567yza890', 'STARTED', 75,
     NULL, NULL, NULL,
     'ACTIVE', 'vt-emma-005',
     NULL, NULL, FALSE,
     FALSE, FALSE,
     1, 1,
     DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, FALSE,
     'emma moreau emma.moreau@email.com');

-- =============================================================================
-- 13. RÉPONSES CANDIDAT (Bob a répondu aux 4 questions du quiz Dev Web)
-- =============================================================================
INSERT INTO candidate_answer (id, application_id, question_id, answer_id, free_text_response, is_selected,
                              created_at, created_by, is_deleted, search_string)
VALUES
    -- Bob : Q1 → Java (correct)
    (1, 2, 1, 1,  NULL, 1, NOW(), NULL, 0, NULL),
    -- Bob : Q2 → HTML + CSS + JavaScript (correct, 3 sélectionnées)
    (2, 2, 2, 5,  NULL, 1, NOW(), NULL, 0, NULL),
    (3, 2, 2, 6,  NULL, 1, NOW(), NULL, 0, NULL),
    (4, 2, 2, 7,  NULL, 1, NOW(), NULL, 0, NULL),
    -- Bob : Q3 → Faux (correct)
    (5, 2, 3, 10, NULL, 1, NOW(), NULL, 0, NULL),
    -- Bob : Q10 → INSERT + UPDATE + DELETE (correct)
    (6, 2, 10, 27, NULL, 1, NOW(), NULL, 0, NULL),
    (7, 2, 10, 28, NULL, 1, NOW(), NULL, 0, NULL),
    (8, 2, 10, 29, NULL, 1, NOW(), NULL, 0, NULL);

-- =============================================================================
-- 14. ENTRETIENS (2 entretiens)
-- =============================================================================
INSERT INTO interviews (id, interview_location, interview_date, interview_status,
                        meet_link, interview_evaluations_link, interview_note,
                        interview_mail_sent, interview_type,
                        started_at, ended_at,
                        evaluation_score, evaluation_number, evaluation_percentage,
                        campaign_id, application_id,
                        created_at, created_by, is_deleted, search_string)
VALUES
    -- Entretien 1 : Bob, planifié
    (1, 'Bureau 302, 3ème étage',
     DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED',
     'https://meet.google.com/abc-defg-hij', 'EVL1AB2C', NULL,
     TRUE, 'IN_PERSON',
     NULL, NULL,
     NULL, NULL, NULL,
     1, 2,
     NOW(), 1, FALSE, 'bob dupré entretien bureau 302'),

    -- Entretien 2 : Chloé, terminé avec évaluation
    (2, NULL,
     DATE_SUB(NOW(), INTERVAL 2 DAY), 'COMPLETED',
     'https://meet.google.com/xyz-uvwx-rst', 'EVL2DE3F',
     'Candidate avec des lacunes en algorithmique. Potentiel mais nécessite formation.',
     TRUE, 'VIDEO',
     DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY),
     45, 1, 45.0,
     1, 3,
     DATE_SUB(NOW(), INTERVAL 3 DAY), 1, FALSE, 'chloé bernard entretien vidéo');

-- =============================================================================
-- 15. PERMISSIONS ENTRETIEN (interview_crud)
-- =============================================================================
INSERT INTO interview_crud (id, can_update, can_delete, can_evaluate, is_admin, follow,
                            is_online, has_finished, last_ping_at,
                            user_id, interview_id,
                            created_at, created_by, is_deleted, search_string)
VALUES
    -- Entretien 1 : super + admin + recruiter
    (1, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  FALSE, FALSE, NULL, 1, 1, NOW(), 1, FALSE, NULL),
    (2, TRUE,  FALSE, TRUE,  FALSE, TRUE,  FALSE, FALSE, NULL, 2, 1, NOW(), 1, FALSE, NULL),
    (3, FALSE, FALSE, TRUE,  FALSE, TRUE,  FALSE, FALSE, NULL, 3, 1, NOW(), 1, FALSE, NULL),

    -- Entretien 2 : super + admin (terminé)
    (4, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  FALSE, TRUE,  DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 2, NOW(), 1, FALSE, NULL),
    (5, TRUE,  FALSE, TRUE,  FALSE, TRUE,  FALSE, TRUE,  DATE_SUB(NOW(), INTERVAL 2 DAY), 2, 2, NOW(), 1, FALSE, NULL);

-- =============================================================================
-- 16. ENTRETIENS CANDIDAT (candidate_interview)
-- =============================================================================
INSERT INTO candidate_interview (id, interview_start, interview_duration, application_id, interview_id,
                                 created_at, created_by, is_deleted, search_string)
VALUES
    (1, DATE_ADD(NOW(), INTERVAL 3 DAY), NULL, 2, 1, NOW(), 1, FALSE, NULL),
    (2, DATE_SUB(NOW(), INTERVAL 2 DAY), 45, 3, 2, NOW(), 1, FALSE, NULL);

-- =============================================================================
-- 17. ÉVALUATIONS (1 évaluation pour l'entretien terminé)
-- =============================================================================
INSERT INTO evaluations (id, candidate_mark, recruiter_comment, candidate_interview_id,
                         created_at, created_by, is_deleted, search_string)
VALUES
    (1, 45, 'Connaissances théoriques correctes mais manque de pratique. Difficultés sur les questions algorithmiques avancées.',
     2, NOW(), 2, FALSE, 'évaluation chloé bernard');

-- =============================================================================
-- 18. DÉCISIONS (2 décisions)
-- =============================================================================
INSERT INTO decisions (id, decision_type, is_cancel, application_id, user_id,
                       created_at, created_by, is_deleted, search_string)
VALUES
    (1, 'PRE_SCREEN_ACCEPT', FALSE, 2, 1, NOW(), 1, FALSE, 'accept bob dupré pré-sélection'),
    (2, 'PRE_SCREEN_REJECT', FALSE, 3, 1, NOW(), 1, FALSE, 'reject chloé bernard pré-sélection');

-- =============================================================================
-- 19. NOTIFICATIONS (4 notifications)
-- =============================================================================
INSERT INTO notifications (id, notif_type, notif_actor, notif_link, is_read,
                           object_table_name, object_table_id, user_id,
                           created_at, created_by, is_deleted, search_string)
VALUES
    (1, 'ADDED_TO_CAMPAIGN', 1, '/dashboard/campaigns', FALSE,
     'campaigns', 1, 2,
     DATE_SUB(NOW(), INTERVAL 5 DAY), 1, FALSE, NULL),

    (2, 'ADDED_TO_CAMPAIGN', 1, '/dashboard/campaigns', FALSE,
     'campaigns', 1, 3,
     DATE_SUB(NOW(), INTERVAL 5 DAY), 1, FALSE, NULL),

    (3, 'APPLICATION_RECEIVED', NULL, '/dashboard/candidates', FALSE,
     'applications', 2, 2,
     DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, FALSE, NULL),

    (4, 'EVALUATION_COMPLETED', 2, '/dashboard/evaluations', TRUE,
     'evaluations', 1, 1,
     DATE_SUB(NOW(), INTERVAL 1 DAY), 2, FALSE, NULL);
