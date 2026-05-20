# Inventaire Dashboard Entities

Le dashboard expose un grand nombre de routes `entities/solo/*`.

Regle documentaire retenue:

- une fiche par page reelle `entities/<nom>`;
- la variante `/:page` reutilise la meme fiche;
- on commence par un pattern CRUD commun pour accelerer la couverture;
- on detaille ensuite les pages qui s'ecartent fortement du pattern.

## Pattern commun

- [x] [00-pattern-crud-entity.md](./00-pattern-crud-entity.md)

## Syntheses transversales

- [x] [370-synthese-ecarts-entities-vs-dashboard.md](./370-synthese-ecarts-entities-vs-dashboard.md)

## Backlogs transversaux

- [x] [380-backlog-correctif-priorise.md](./380-backlog-correctif-priorise.md)

## Fiches detaillees deja creees

- [x] [10-entities-users.md](./10-entities-users.md)
- [x] [20-entities-applications.md](./20-entities-applications.md)
- [x] [30-entities-interviews.md](./30-entities-interviews.md)
- [x] [40-entities-source-tokens.md](./40-entities-source-tokens.md)
- [x] [50-entities-questions.md](./50-entities-questions.md)
- [x] [60-entities-decisions.md](./60-entities-decisions.md)
- [x] [70-entities-business-groups.md](./70-entities-business-groups.md)
- [x] [80-entities-candidate-token.md](./80-entities-candidate-token.md)
- [x] [90-entities-candidate-ask.md](./90-entities-candidate-ask.md)
- [x] [100-entities-candidate-answers.md](./100-entities-candidate-answers.md)
- [x] [110-entities-evaluations.md](./110-entities-evaluations.md)
- [x] [120-entities-candidate-interview.md](./120-entities-candidate-interview.md)
- [x] [130-entities-forms.md](./130-entities-forms.md)
- [x] [140-entities-form-versions.md](./140-entities-form-versions.md)
- [x] [150-entities-form-questions.md](./150-entities-form-questions.md)
- [x] [160-entities-notifications.md](./160-entities-notifications.md)
- [x] [170-entities-email-templates.md](./170-entities-email-templates.md)
- [x] [180-entities-mail-log.md](./180-entities-mail-log.md)
- [x] [190-entities-smtp-config.md](./190-entities-smtp-config.md)
- [x] [200-entities-app-config.md](./200-entities-app-config.md)
- [x] [210-entities-legal-texts.md](./210-entities-legal-texts.md)
- [x] [220-entities-interview-participant.md](./220-entities-interview-participant.md)
- [x] [230-entities-application-progress.md](./230-entities-application-progress.md)
- [x] [240-entities-email-verification-tokens.md](./240-entities-email-verification-tokens.md)
- [x] [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
- [x] [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md)
- [x] [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
- [x] [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)
- [x] [290-entities-invitation-codes.md](./290-entities-invitation-codes.md)
- [x] [300-entities-entity-permissions.md](./300-entities-entity-permissions.md)
- [x] [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
- [x] [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
- [x] [330-entities-campaigns.md](./330-entities-campaigns.md)
- [x] [340-entities-departments.md](./340-entities-departments.md)
- [x] [350-entities-specialities.md](./350-entities-specialities.md)
- [x] [360-entities-answers.md](./360-entities-answers.md)

## Routes entities identifiees

- [x] campaigns -> [330-entities-campaigns.md](./330-entities-campaigns.md)
- [x] users -> [10-entities-users.md](./10-entities-users.md)
- [x] departments -> [340-entities-departments.md](./340-entities-departments.md)
- [x] specialities -> [350-entities-specialities.md](./350-entities-specialities.md)
- [x] questions -> [50-entities-questions.md](./50-entities-questions.md)
- [x] answers -> [360-entities-answers.md](./360-entities-answers.md)
- [x] applications -> [20-entities-applications.md](./20-entities-applications.md)
- [x] interviews -> [30-entities-interviews.md](./30-entities-interviews.md)
- [x] source-tokens -> [40-entities-source-tokens.md](./40-entities-source-tokens.md)
- [x] evaluations -> [110-entities-evaluations.md](./110-entities-evaluations.md)
- [x] candidate-answers -> [100-entities-candidate-answers.md](./100-entities-candidate-answers.md)
- [x] candidate-ask -> [90-entities-candidate-ask.md](./90-entities-candidate-ask.md)
- [x] candidate-interview -> [120-entities-candidate-interview.md](./120-entities-candidate-interview.md)
- [x] candidate-token -> [80-entities-candidate-token.md](./80-entities-candidate-token.md)
- [x] interview-participant -> [220-entities-interview-participant.md](./220-entities-interview-participant.md)
- [x] decisions -> [60-entities-decisions.md](./60-entities-decisions.md)
- [x] notifications -> [160-entities-notifications.md](./160-entities-notifications.md)
- [x] forms -> [130-entities-forms.md](./130-entities-forms.md)
- [x] form-versions -> [140-entities-form-versions.md](./140-entities-form-versions.md)
- [x] form-questions -> [150-entities-form-questions.md](./150-entities-form-questions.md)
- [x] pipeline-templates -> [250-entities-pipeline-templates.md](./250-entities-pipeline-templates.md)
- [x] pipeline-stages -> [260-entities-pipeline-stages.md](./260-entities-pipeline-stages.md)
- [x] application-progress -> [230-entities-application-progress.md](./230-entities-application-progress.md)
- [x] email-verification-tokens -> [240-entities-email-verification-tokens.md](./240-entities-email-verification-tokens.md)
- [x] business-group-permissions -> [270-entities-business-group-permissions.md](./270-entities-business-group-permissions.md)
- [x] user-business-groups -> [280-entities-user-business-groups.md](./280-entities-user-business-groups.md)
- [x] invitation-codes -> [290-entities-invitation-codes.md](./290-entities-invitation-codes.md)
- [x] email-templates -> [170-entities-email-templates.md](./170-entities-email-templates.md)
- [x] mail-log -> [180-entities-mail-log.md](./180-entities-mail-log.md)
- [x] smtp-config -> [190-entities-smtp-config.md](./190-entities-smtp-config.md)
- [x] legal-texts -> [210-entities-legal-texts.md](./210-entities-legal-texts.md)
- [x] app-config -> [200-entities-app-config.md](./200-entities-app-config.md)
- [x] business-groups -> [70-entities-business-groups.md](./70-entities-business-groups.md)
- [x] system-role-permissions -> [310-entities-system-role-permissions.md](./310-entities-system-role-permissions.md)
- [x] user-permission-overrides -> [320-entities-user-permission-overrides.md](./320-entities-user-permission-overrides.md)
- [x] entity-permissions -> [300-entities-entity-permissions.md](./300-entities-entity-permissions.md)

## Pages probablement custom en priorite

- [x] users
- [x] questions
- [x] applications
- [x] interviews
- [x] source-tokens
- [x] decisions
- [x] business-groups
- [x] candidate-token
- [x] candidate-ask
- [x] candidate-answers
- [x] evaluations
- [x] candidate-interview
- [x] forms
- [x] form-versions
- [x] notifications
- [x] email-templates
- [x] mail-log
- [x] smtp-config
- [x] app-config
- [x] interview-participant
- [x] application-progress
- [x] email-verification-tokens
- [x] pipeline-templates
- [x] pipeline-stages
- [x] campaigns
- [x] departments
- [x] specialities
- [x] answers
- [x] invitation-codes
- [x] entity-permissions
- [x] system-role-permissions
- [x] user-permission-overrides

## Prochain lot suggere

- [x] answers / campaigns
- [x] departments / specialities
- [x] synthese transversale des ecarts `entities/*` vs pages dashboard specialisees
- [x] backlog correctif priorise a partir de la synthese
- [ ] execution du lot P0 guards / permissions
- [ ] execution du lot P0 `speciality` / `department`
- [ ] revue technique ciblee DTO / helpers caches sur les routes les plus risquées

## Pages probablement proches du pattern CRUD

- [x] departments
- [x] specialities
- [x] answers
