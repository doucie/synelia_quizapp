-- =============================================================================
-- V1_034 : Suppression des templates legacy et création de 9 templates
--          fonctionnels — un par type d'action.
-- Créé le 2026-05-05
-- Prérequis : V1_033 appliqué (10 presets fonctionnels dans email_template_preset).
-- =============================================================================
--
-- Architecture backend (confirmée par EmailTemplateBusiness.renderBodyTemplate) :
--
--   body_template           = HTML complet standalone.
--                             Le backend n'opère aucun merge avec le preset au rendu.
--                             Récupéré ici via sous-requête depuis email_template_preset.
--
--   preset_id               = Référence au preset utilisé par l'éditeur frontend.
--                             Non utilisé au rendu côté backend.
--
--   editable_variables_json = JSON {"title":..., "subtitle":..., "content":...,
--                                   "buttonText":..., "buttonLink":...}
--                             Valeurs par défaut des champs éditables.
--                             Mergées en premier dans buildRenderVariables(),
--                             puis écrasées par les variables runtime.
--
--   available_variables     = CSV des variables business/runtime, repris
--                             de EMAIL_ACTION_EDITOR_CONFIGS (email-editor.ts).
--
-- =============================================================================

-- ─── Étape 1 : Suppression physique de tous les templates existants ───────────
-- DELETE physique (et non soft-delete) car email_template a une UNIQUE KEY sur
-- template_key. Un UPDATE is_deleted=1 conserverait la contrainte d'unicité et
-- bloquerait les INSERT qui suivent.
-- =============================================================================
DELETE FROM email_template;

-- ─── Étape 2 : Insertion des 9 templates fonctionnels ─────────────────────────

-- ---------------------------------------------------------------------------
-- 2.1  APPLICATION_VERIFICATION
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'application_verification',
    'Verification de votre adresse email - {{companyName}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'APPLICATION_VERIFICATION' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Verifiez votre adresse email","subtitle":"Confirmez votre adresse pour finaliser votre dossier","content":"<p>Bonjour {{first_name}},</p><p>Merci pour votre candidature. Cliquez sur le bouton ci-dessous pour valider votre adresse email et activer votre acces.</p><p>Si vous n''avez pas effectue cette demande, vous pouvez ignorer cet email en toute securite.</p>","buttonText":"Verifier mon email","buttonLink":"{{verification_link}}"}',
    'Email de verification envoye apres depot de candidature.',
    'first_name,last_name,verification_link,tracking_code,campaign_title,companyName,currentYear',
    'APPLICATION_VERIFICATION',
    (SELECT id FROM email_template_preset
     WHERE category = 'APPLICATION_VERIFICATION' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.2  PASSWORD_RESET
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'password_reset',
    'Reinitialisation de vos acces {{companyName}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'PASSWORD_RESET' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Reinitialisation de votre mot de passe","subtitle":"Votre demande de reinitialisation a ete prise en compte","content":"<p>Bonjour {{first_name}},</p><p>Votre mot de passe a ete reinitialise. Retrouvez vos nouveaux identifiants ci-dessous.</p><p><strong>Email :</strong> {{email}}<br><strong>Nouveau mot de passe :</strong> {{new_password}}</p><p>Nous vous recommandons de modifier ce mot de passe des votre prochaine connexion.</p>","buttonText":"Acceder a l''application","buttonLink":"{{app_link}}"}',
    'Email contenant les informations de reinitialisation du mot de passe.',
    'first_name,last_name,email,new_password,app_link,companyName,currentYear',
    'PASSWORD_RESET',
    (SELECT id FROM email_template_preset
     WHERE category = 'PASSWORD_RESET' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.3  INVITATION_CODE
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'invitation_code',
    'Invitation a rejoindre {{companyName}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'INVITATION_CODE' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Vous etes invite(e) a rejoindre la plateforme","subtitle":"Creez votre compte en quelques instants","content":"<p>Bonjour,</p><p>Vous avez ete invite(e) a rejoindre <strong>{{companyName}}</strong> en tant que <strong>{{role}}</strong>.</p><p>Utilisez le lien ci-dessous ou votre code d''invitation :</p><p><strong>Votre code :</strong> {{code}}<br><strong>Expire le :</strong> {{expired_at}}</p>","buttonText":"Creer mon compte","buttonLink":"{{registration_link}}"}',
    'Invitation a creer un compte via un code ou un lien d''inscription.',
    'email,role,code,registration_link,expired_at,app_link,companyName,currentYear',
    'INVITATION_CODE',
    (SELECT id FROM email_template_preset
     WHERE category = 'INVITATION_CODE' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.4  CANDIDATE_ASK_RESULT
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'candidate_ask_result',
    'Suite a votre demande de correction - {{companyName}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'CANDIDATE_ASK_RESULT' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Suite a votre demande","subtitle":"Votre demande de modification a ete traitee","content":"<p>Bonjour {{first_name}} {{last_name}},</p><p>Votre demande concernant <strong>{{candidate_ask_type_label}}</strong> a ete <strong>{{ask_status_label}}</strong>.</p>{{ask_summary_block}}{{decision_reason_block}}{{verification_notice_block}}<p>Pour consulter le suivi de votre candidature, cliquez ci-dessous.</p>","buttonText":"Voir ma candidature","buttonLink":"{{app_link}}"}',
    'Notification envoyee apres validation ou refus d''une demande de correction candidat.',
    'first_name,last_name,candidate_ask_type_label,ask_status_label,ask_summary_block,decision_reason_block,verification_notice_block,app_link,companyName,currentYear',
    'CANDIDATE_ASK_RESULT',
    (SELECT id FROM email_template_preset
     WHERE category = 'CANDIDATE_ASK_RESULT' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.5  PRE_SCREEN_DECISION
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'pre_screen_decision',
    'Resultat de votre preselection - {{campaign_title}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'PRE_SCREEN_DECISION' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Resultat de votre preselection","subtitle":"Candidature a {{campaign_title}}","content":"<p>Bonjour {{first_name}} {{last_name}},</p><p>Suite a l''examen de votre candidature pour la campagne <strong>{{campaign_title}}</strong>, nous vous informons que votre preselection a ete <strong>{{decision_label}}</strong>.</p><p>Pour consulter le detail de votre dossier, cliquez sur le bouton ci-dessous.</p>","buttonText":"Voir ma candidature","buttonLink":"{{app_link}}"}',
    'Email envoye suite a une decision de preselection (acceptation ou refus).',
    'first_name,last_name,candidate_full_name,candidate_email,campaign_title,decision_type,decision_stage,decision_label,application_status,app_link,companyName,currentYear',
    'PRE_SCREEN_DECISION',
    (SELECT id FROM email_template_preset
     WHERE category = 'PRE_SCREEN_DECISION' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.6  FINAL_DECISION
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'final_decision',
    'Resultat final de votre candidature - {{campaign_title}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'FINAL_DECISION' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Decision finale concernant votre candidature","subtitle":"Candidature a {{campaign_title}}","content":"<p>Bonjour {{first_name}} {{last_name}},</p><p>Apres examen approfondi de votre dossier pour la campagne <strong>{{campaign_title}}</strong>, nous vous informons que votre candidature a ete <strong>{{decision_label}}</strong>.</p><p>Nous vous remercions de l''interet que vous portez a notre organisation et vous souhaitons plein succes dans la suite de vos demarches.</p>","buttonText":"Voir le detail","buttonLink":"{{app_link}}"}',
    'Email envoye suite a une decision finale (acceptation ou refus definitif).',
    'first_name,last_name,candidate_full_name,candidate_email,campaign_title,decision_type,decision_stage,decision_label,application_status,app_link,companyName,currentYear',
    'FINAL_DECISION',
    (SELECT id FROM email_template_preset
     WHERE category = 'FINAL_DECISION' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.7  INTERVIEW_INVITE
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'interview_convocation',
    'Convocation a un entretien - {{campaign_title}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'INTERVIEW_INVITE' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Convocation a un entretien","subtitle":"Campagne : {{campaign_title}}","content":"<p>Bonjour {{first_name}} {{last_name}},</p><p>Votre candidature a retenu notre attention. Nous avons le plaisir de vous convoquer a un entretien selon les modalites suivantes :</p><p><strong>Date et heure :</strong> {{interview_date}}<br><strong>Type d''entretien :</strong> {{interview_type_text}}<br><strong>Lieu / Lien :</strong> {{location_or_link}}</p>{{additional_note}}","buttonText":"Confirmer ma presence","buttonLink":"{{app_link}}"}',
    'Email de convocation a un entretien avec date, type et lieu ou lien.',
    'first_name,last_name,campaign_title,interview_date,interview_type_text,location_or_link,additional_note,companyName,currentYear',
    'INTERVIEW_INVITE',
    (SELECT id FROM email_template_preset
     WHERE category = 'INTERVIEW_INVITE' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.8  QUIZ_INVITE
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'quiz_invitation',
    'Invitation au quiz - {{campaign_title}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'QUIZ_INVITE' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Invitation a passer le quiz","subtitle":"Campagne : {{campaign_title}}","content":"<p>Bonjour {{first_name}} {{last_name}},</p><p>Dans le cadre de votre candidature pour <strong>{{campaign_title}}</strong>, nous vous invitons a completer un quiz en ligne.</p><p><strong>Date limite :</strong> {{quiz_deadline}}<br><strong>Duree estimee :</strong> {{quiz_duration}}</p><p>Cliquez sur le bouton ci-dessous pour acceder au quiz.</p>","buttonText":"Commencer le quiz","buttonLink":"{{quiz_link}}"}',
    'Invitation a completer un quiz avec delai et lien d''acces.',
    'first_name,last_name,campaign_title,quiz_link,quiz_deadline,quiz_duration,companyName,currentYear',
    'QUIZ_INVITE',
    (SELECT id FROM email_template_preset
     WHERE category = 'QUIZ_INVITE' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- 2.9  WELCOME
-- ---------------------------------------------------------------------------
INSERT INTO email_template (
    template_key, subject_template, body_template, editable_variables_json,
    description, available_variables, action_type, preset_id,
    is_active, is_deleted, created_at, updated_at
) VALUES (
    'welcome_email',
    'Bienvenue chez {{companyName}}',
    (SELECT html_structure FROM email_template_preset
     WHERE category = 'WELCOME' AND is_deleted = FALSE LIMIT 1),
    '{"title":"Bienvenue chez {{companyName}} !","subtitle":"Votre compte est pret, vous pouvez commencer","content":"<p>Bonjour {{first_name}},</p><p>Nous sommes ravis de vous accueillir sur notre plateforme. Votre compte est desormais actif et toutes les fonctionnalites vous sont accessibles.</p><p>N''hesitez pas a nous contacter si vous avez des questions.</p>","buttonText":"Acceder a la plateforme","buttonLink":"{{app_link}}"}',
    'Email de bienvenue envoye apres validation du compte.',
    'first_name,last_name,companyName,app_link,currentYear',
    'WELCOME',
    (SELECT id FROM email_template_preset
     WHERE category = 'WELCOME' AND is_deleted = FALSE LIMIT 1),
    1, 0, NOW(), NOW()
);
