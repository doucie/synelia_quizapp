-- =============================================================================
-- V1_004 : Ajout tables email_template, smtp_config, legal_text
-- Créé le 2026-03-29
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. email_template
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_template (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    template_key        VARCHAR(50)   NOT NULL,
    subject_template    VARCHAR(500)  NOT NULL,
    body_template       TEXT          NOT NULL,
    description         VARCHAR(500)  NULL,
    available_variables TEXT          NULL,
    is_active           BIT           DEFAULT 1,
    created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED  NULL,
    updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by          INT UNSIGNED  NULL,
    is_deleted          BIT           DEFAULT 0,
    search_string       TEXT          NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_email_template_key (template_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. smtp_config
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS smtp_config (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    host                VARCHAR(255)  NOT NULL,
    port                INT           NOT NULL DEFAULT 587,
    username            VARCHAR(255)  NULL,
    password_encrypted  VARCHAR(500)  NULL,
    smtp_auth           BIT           DEFAULT 1,
    starttls_enable     BIT           DEFAULT 1,
    starttls_required   BIT           DEFAULT 0,
    connection_timeout  INT           DEFAULT 5000,
    timeout             INT           DEFAULT 5000,
    write_timeout       INT           DEFAULT 5000,
    sender_name         VARCHAR(255)  NULL,
    sender_email        VARCHAR(255)  NULL,
    is_active           BIT           DEFAULT 0,
    created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED  NULL,
    updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by          INT UNSIGNED  NULL,
    is_deleted          BIT           DEFAULT 0,
    search_string       TEXT          NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. legal_text
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_text (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    text_key            VARCHAR(50)   NOT NULL,
    title               VARCHAR(255)  NOT NULL,
    content             TEXT          NOT NULL,
    description         VARCHAR(500)  NULL,
    is_active           BIT           DEFAULT 1,
    created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED  NULL,
    updated_at          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by          INT UNSIGNED  NULL,
    is_deleted          BIT           DEFAULT 0,
    search_string       TEXT          NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_legal_text_key (text_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Données initiales : templates d'emails
-- -----------------------------------------------------------------------------
INSERT INTO email_template (template_key, subject_template, body_template, description, available_variables, is_active, created_at, is_deleted) VALUES
('interview_convocation',
 'Convocation à un entretien - {{campaign_title}}',
 '<p>Bonjour {{first_name}} {{last_name}},</p><p>Nous avons le plaisir de vous informer que votre candidature a retenu notre attention.</p><p>Vous êtes convoqué(e) à un entretien pour le poste lié à la campagne <strong>{{campaign_title}}</strong>.</p><p><strong>Date :</strong> {{interview_date}}<br/><strong>Type :</strong> {{interview_type_text}}<br/><strong>Lieu / Lien :</strong> {{location_or_link}}</p><p>{{additional_note}}</p><p>Cordialement,<br/>L''équipe de recrutement</p>',
 'Email envoyé lors de la convocation d''un candidat à un entretien',
 '["first_name","last_name","campaign_title","interview_date","interview_type_text","location_or_link","additional_note"]',
 1, NOW(), 0),

('password_reset',
 'Réinitialisation de votre mot de passe',
 '<p>Bonjour {{first_name}} {{last_name}},</p><p>Votre mot de passe a été réinitialisé avec succès.</p><p><strong>Email :</strong> {{email}}<br/><strong>Nouveau mot de passe :</strong> {{new_password}}</p><p>Nous vous recommandons de changer ce mot de passe dès votre prochaine connexion.</p><p><a href="{{app_link}}">Accéder à l''application</a></p><p>Cordialement,<br/>L''équipe Synelia</p>',
 'Email envoyé lors de la réinitialisation du mot de passe d''un utilisateur',
 '["first_name","last_name","email","new_password","app_link"]',
 1, NOW(), 0),

('application_verification',
 'Confirmation de réception de votre candidature - {{campaign_title}}',
 '<p>Bonjour {{first_name}} {{last_name}},</p><p>Nous avons bien reçu votre candidature pour la campagne <strong>{{campaign_title}}</strong>.</p><p>Pour finaliser votre inscription, veuillez cliquer sur le lien suivant :</p><p><a href="{{verification_link}}">Vérifier ma candidature</a></p><p>Cordialement,<br/>L''équipe de recrutement</p>',
 'Email envoyé pour la vérification d''une candidature',
 '["first_name","last_name","verification_link","campaign_title"]',
 1, NOW(), 0),

('invitation_code',
 'Invitation à rejoindre la plateforme de recrutement',
 '<p>Bonjour {{first_name}},</p><p>Vous avez été invité(e) à rejoindre notre plateforme de recrutement en tant que <strong>{{role}}</strong>.</p><p><strong>Code d''invitation :</strong> {{invitation_code}}</p><p><a href="{{invitation_link}}">Créer mon compte</a></p><p>Ce code expire le {{expiry_date}}.</p><p>Cordialement,<br/>L''équipe Synelia</p>',
 'Email envoyé avec le code d''invitation pour créer un compte',
 '["first_name","invitation_code","invitation_link","expiry_date","role"]',
 1, NOW(), 0);

-- -----------------------------------------------------------------------------
-- 5. Données initiales : textes légaux
-- -----------------------------------------------------------------------------
INSERT INTO legal_text (text_key, title, content, description, is_active, created_at, is_deleted) VALUES
('candidate_consent',
 'Consentement candidat',
 '<p>J''accepte que mes données personnelles (nom, prénom, email, CV, réponses au questionnaire) soient collectées et traitées par Synelia dans le cadre de ce processus de recrutement. Ces données seront conservées pendant une durée maximale de 2 ans et ne seront pas transmises à des tiers sans mon consentement préalable. Je dispose d''un droit d''accès, de rectification et de suppression de mes données conformément au RGPD.</p>',
 'Texte affiché dans le checkbox de consentement de la page de candidature',
 1, NOW(), 0),

('privacy_policy',
 'Politique de confidentialité',
 '<h2>Politique de confidentialité</h2><p>Synelia s''engage à protéger la vie privée des utilisateurs de sa plateforme de recrutement.</p><h3>Données collectées</h3><p>Nous collectons les données suivantes : nom, prénom, adresse email, numéro de téléphone, CV, réponses aux questionnaires d''évaluation.</p><h3>Finalité du traitement</h3><p>Ces données sont traitées dans le cadre du processus de recrutement uniquement.</p><h3>Durée de conservation</h3><p>Les données sont conservées pendant une durée maximale de 2 ans après la dernière interaction.</p><h3>Vos droits</h3><p>Conformément au RGPD, vous disposez d''un droit d''accès, de rectification, d''effacement, de limitation du traitement et de portabilité de vos données.</p>',
 'Politique de confidentialité affichée via le lien "En savoir plus"',
 1, NOW(), 0),

('terms_of_use',
 'Conditions d''utilisation',
 '<h2>Conditions d''utilisation</h2><p>L''utilisation de la plateforme de recrutement Synelia est soumise aux présentes conditions.</p><h3>Accès</h3><p>L''accès à la plateforme est réservé aux utilisateurs disposant d''un compte valide.</p><h3>Responsabilités</h3><p>L''utilisateur s''engage à fournir des informations exactes et à ne pas utiliser la plateforme à des fins illégales.</p>',
 'Conditions générales d''utilisation de la plateforme',
 1, NOW(), 0);
