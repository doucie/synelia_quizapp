INSERT INTO email_template (
    template_key,
    subject_template,
    body_template,
    description,
    available_variables,
    action_type,
    is_active,
    created_at,
    is_deleted,
    search_string
)
SELECT
    'candidate_ask_result',
    'Suite a votre demande de correction - {{companyName}}',
    '<p>Bonjour {{first_name}} {{last_name}},</p><p>Votre demande de correction concernant <strong>{{candidate_ask_type_label}}</strong> a ete <strong>{{ask_status_label}}</strong>.</p>{{ask_summary_block}}{{decision_reason_block}}{{verification_notice_block}}<p>Vous pouvez consulter le suivi de votre candidature ici : <a href="{{app_link}}">{{app_link}}</a>.</p><p>Cordialement,<br/>L''equipe de recrutement</p>',
    'Notification envoyee au candidat apres validation ou refus d''une demande de correction.',
    'first_name,last_name,candidate_ask_type_label,ask_status_label,ask_summary_block,decision_reason_block,verification_notice_block,app_link,companyName,currentYear',
    'CANDIDATE_ASK_RESULT',
    1,
    NOW(),
    0,
    'candidate_ask_result CANDIDATE_ASK_RESULT'
WHERE NOT EXISTS (
    SELECT 1
    FROM email_template
    WHERE template_key = 'candidate_ask_result'
);