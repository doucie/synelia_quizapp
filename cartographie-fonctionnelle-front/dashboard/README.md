# Inventaire Dashboard

## Fiches deja creees

- [x] [00-dashboard-shell.md](./00-dashboard-shell.md)
- [x] [05-dashboard-overview.md](./05-dashboard-overview.md)
- [x] [06-dashboard-profile.md](./06-dashboard-profile.md)
- [x] [07-dashboard-settings.md](./07-dashboard-settings.md)
- [x] [10-dashboard-campaigns.md](./10-dashboard-campaigns.md)
- [x] [11-dashboard-campaigns-new.md](./11-dashboard-campaigns-new.md)
- [x] [12-dashboard-campaign-detail.md](./12-dashboard-campaign-detail.md)
- [x] [13-dashboard-campaign-edit.md](./13-dashboard-campaign-edit.md)
- [x] [14-dashboard-forms.md](./14-dashboard-forms.md)
- [x] [15-dashboard-forms-new.md](./15-dashboard-forms-new.md)
- [x] [16-dashboard-forms-edit.md](./16-dashboard-forms-edit.md)
- [x] [20-dashboard-candidates.md](./20-dashboard-candidates.md)
- [x] [21-dashboard-candidate-detail.md](./21-dashboard-candidate-detail.md)
- [x] [25-dashboard-decisions.md](./25-dashboard-decisions.md)
- [x] [30-dashboard-interviews.md](./30-dashboard-interviews.md)
- [x] [31-dashboard-interview-create.md](./31-dashboard-interview-create.md)
- [x] [35-dashboard-evaluations.md](./35-dashboard-evaluations.md)
- [x] [40-dashboard-pipeline-templates.md](./40-dashboard-pipeline-templates.md)
- [x] [41-dashboard-pipeline-template-edit.md](./41-dashboard-pipeline-template-edit.md)
- [x] [50-dashboard-users.md](./50-dashboard-users.md)
- [x] [51-dashboard-departments.md](./51-dashboard-departments.md)
- [x] [52-dashboard-specialities.md](./52-dashboard-specialities.md)
- [x] [53-dashboard-questions.md](./53-dashboard-questions.md)
- [x] [54-dashboard-answers.md](./54-dashboard-answers.md)
- [x] [60-dashboard-system-role-permissions.md](./60-dashboard-system-role-permissions.md)
- [x] [61-dashboard-business-groups.md](./61-dashboard-business-groups.md)
- [x] [62-dashboard-user-permissions.md](./62-dashboard-user-permissions.md)
- [x] [70-dashboard-entities.md](./70-dashboard-entities.md)
- [x] [71-dashboard-merise.md](./71-dashboard-merise.md)
- [x] [80-dashboard-email-editor.md](./80-dashboard-email-editor.md)
- [x] [82-dashboard-email-presets.md](./82-dashboard-email-presets.md)
- [x] [90-dashboard-evaluate-fullscreen.md](./90-dashboard-evaluate-fullscreen.md)
- [x] [91-dashboard-evaluate-link.md](./91-dashboard-evaluate-link.md)

## Fiches a produire ensuite

- [x] toutes les fiches `entities/*` actuellement montees dans `app.routes.ts`
- [x] synthese transversale sur les ecarts CRUD / guards / mapping -> [../entities/370-synthese-ecarts-entities-vs-dashboard.md](../entities/370-synthese-ecarts-entities-vs-dashboard.md)
- [x] backlog correctif priorise issu de cette synthese -> [../entities/380-backlog-correctif-priorise.md](../entities/380-backlog-correctif-priorise.md)

## Lots `entities/*` deja crees

- [x] `users`
- [x] `applications`
- [x] `interviews`
- [x] `source-tokens`
- [x] `questions`
- [x] `decisions`
- [x] `business-groups`
- [x] `candidate-token`
- [x] `candidate-ask`
- [x] `candidate-answers`
- [x] `evaluations`
- [x] `candidate-interview`
- [x] `forms`
- [x] `form-versions`
- [x] `form-questions`
- [x] `notifications`
- [x] `email-templates`
- [x] `mail-log`
- [x] `smtp-config`
- [x] `app-config`
- [x] `legal-texts`
- [x] `interview-participant`
- [x] `application-progress`
- [x] `email-verification-tokens`
- [x] `pipeline-templates`
- [x] `pipeline-stages`
- [x] `business-group-permissions`
- [x] `user-business-groups`
- [x] `invitation-codes`
- [x] `entity-permissions`
- [x] `system-role-permissions`
- [x] `user-permission-overrides`
- [x] `campaigns`
- [x] `departments`
- [x] `specialities`
- [x] `answers`

## Priorite suggeree

1. Aucune route `entities/*` restante non documentee dans l'inventaire courant.
2. Executer le lot P0 sur guards / permissions puis la chaine `speciality` / `department`.
3. Ensuite, approfondissements transverses DTO / helpers caches / simplification des routes doublons.

## Note

- Les variantes `/dashboard/email-editor/:id` et `/dashboard/email-presets/:id` sont couvertes par les fiches principales, car elles reutilisent strictement le meme composant et la meme logique metier que leurs routes de base.
- Les routes `/dashboard/evaluate` et `/dashboard/evaluate/:link` reutilisent aussi le meme composant, mais gardent deux fiches distinctes car leurs contrats d'entree diffÃ¨rent: `?interviewId=` pour le fallback interne, `:link` pour le lien court d'evaluation.
- Le lot formulaires dashboard distingue maintenant la liste metier `/dashboard/forms` des routes cibles `/dashboard/forms/new` et `/dashboard/forms/:id/edit`; le rattachement ou detachement d'un formulaire a une campagne est documente comme un sous-flux des pages campagne, pas comme une page technique a exposer aux utilisateurs metier.
- Le detail candidature cible sur `/dashboard/candidates/:id` est maintenant documente dans [21-dashboard-candidate-detail.md](./21-dashboard-candidate-detail.md); [20-dashboard-candidates.md](./20-dashboard-candidates.md) reste la fiche de la liste et du passage vers ce detail.
