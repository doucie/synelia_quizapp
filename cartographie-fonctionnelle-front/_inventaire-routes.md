# Inventaire Initial Des Routes Montees

Ce fichier liste les pages montees identifiees dans `quizapp_front/src/app/app.routes.ts`.

Convention de statut:

- `[x]` fiche creee
- `[~]` inventoriee mais encore a rediger
- `[ ]` a traiter

Important: ces statuts de l'inventaire indiquent d'abord la presence d'une fiche documentaire. Ils ne garantissent pas, a eux seuls, qu'une fiche a deja ete re-auditee recemment contre le code reel.

## Public

- [x] `/` -> [public/10-home.md](./public/10-home.md)
- [x] `/campagnes` -> [public/20-campagnes-publiques.md](./public/20-campagnes-publiques.md)
- [x] `/suivre-candidature` -> [public/30-suivre-candidature.md](./public/30-suivre-candidature.md)
- [x] `/connexion` -> [public/40-connexion.md](./public/40-connexion.md)
- [x] `/inscription` -> [public/50-inscription.md](./public/50-inscription.md)
- [x] `/mot-de-passe-oublie` -> [public/60-mot-de-passe-oublie.md](./public/60-mot-de-passe-oublie.md)
- [x] `/postuler/:sourceToken` -> [public/70-postuler-source-token.md](./public/70-postuler-source-token.md)

## Dashboard Shell Et Pages Metier

- [x] `/dashboard` shell partage -> [dashboard/00-dashboard-shell.md](./dashboard/00-dashboard-shell.md)
- [x] `/dashboard/overview` -> [dashboard/05-dashboard-overview.md](./dashboard/05-dashboard-overview.md)
- [x] `/dashboard/profile` -> [dashboard/06-dashboard-profile.md](./dashboard/06-dashboard-profile.md)
- [x] `/dashboard/settings` -> [dashboard/07-dashboard-settings.md](./dashboard/07-dashboard-settings.md)
- [x] `/dashboard/campaigns` -> [dashboard/10-dashboard-campaigns.md](./dashboard/10-dashboard-campaigns.md)
- [x] `/dashboard/campaigns/new` -> [dashboard/11-dashboard-campaigns-new.md](./dashboard/11-dashboard-campaigns-new.md)
- [x] `/dashboard/campaigns/:id` -> [dashboard/12-dashboard-campaign-detail.md](./dashboard/12-dashboard-campaign-detail.md)
- [x] `/dashboard/campaigns/:id/edit` -> [dashboard/13-dashboard-campaign-edit.md](./dashboard/13-dashboard-campaign-edit.md)
- [x] `/dashboard/candidates` -> [dashboard/20-dashboard-candidates.md](./dashboard/20-dashboard-candidates.md)
- [x] `/dashboard/decisions` -> [dashboard/25-dashboard-decisions.md](./dashboard/25-dashboard-decisions.md)
- [x] `/dashboard/interviews` -> [dashboard/30-dashboard-interviews.md](./dashboard/30-dashboard-interviews.md)
- [x] `/dashboard/interviews/create` -> [dashboard/31-dashboard-interview-create.md](./dashboard/31-dashboard-interview-create.md)
- [x] `/dashboard/evaluations` -> [dashboard/35-dashboard-evaluations.md](./dashboard/35-dashboard-evaluations.md)
- [x] `/dashboard/pipeline-templates` -> [dashboard/40-dashboard-pipeline-templates.md](./dashboard/40-dashboard-pipeline-templates.md)
- [x] `/dashboard/pipeline-templates/:id/edit` -> [dashboard/41-dashboard-pipeline-template-edit.md](./dashboard/41-dashboard-pipeline-template-edit.md)
- [x] `/dashboard/users` -> [dashboard/50-dashboard-users.md](./dashboard/50-dashboard-users.md)
- [x] `/dashboard/departments` -> [dashboard/51-dashboard-departments.md](./dashboard/51-dashboard-departments.md)
- [x] `/dashboard/specialities` -> [dashboard/52-dashboard-specialities.md](./dashboard/52-dashboard-specialities.md)
- [x] `/dashboard/questions` -> [dashboard/53-dashboard-questions.md](./dashboard/53-dashboard-questions.md)
- [x] `/dashboard/answers` -> [dashboard/54-dashboard-answers.md](./dashboard/54-dashboard-answers.md)
- [x] `/dashboard/system-role-permissions` -> [dashboard/60-dashboard-system-role-permissions.md](./dashboard/60-dashboard-system-role-permissions.md)
- [x] `/dashboard/business-groups` -> [dashboard/61-dashboard-business-groups.md](./dashboard/61-dashboard-business-groups.md)
- [x] `/dashboard/user-permissions` -> [dashboard/62-dashboard-user-permissions.md](./dashboard/62-dashboard-user-permissions.md)
- [x] `/dashboard/entities` -> [dashboard/70-dashboard-entities.md](./dashboard/70-dashboard-entities.md)
- [x] `/dashboard/merise` -> [dashboard/71-dashboard-merise.md](./dashboard/71-dashboard-merise.md)
- [x] `/dashboard/email-editor` -> [dashboard/80-dashboard-email-editor.md](./dashboard/80-dashboard-email-editor.md)
- [x] `/dashboard/email-editor/:id` -> [dashboard/80-dashboard-email-editor.md](./dashboard/80-dashboard-email-editor.md)
- [x] `/dashboard/email-presets` -> [dashboard/82-dashboard-email-presets.md](./dashboard/82-dashboard-email-presets.md)
- [x] `/dashboard/email-presets/:id` -> [dashboard/82-dashboard-email-presets.md](./dashboard/82-dashboard-email-presets.md)
- [x] `/dashboard/evaluate` -> [dashboard/90-dashboard-evaluate-fullscreen.md](./dashboard/90-dashboard-evaluate-fullscreen.md)
- [x] `/dashboard/evaluate/:link` -> [dashboard/91-dashboard-evaluate-link.md](./dashboard/91-dashboard-evaluate-link.md)

## Dashboard Entities

Le bloc `dashboard/entities/*` est inventorie dans [entities/README.md](./entities/README.md).

Regle retenue:

- une fiche par route de page reelle;
- le suffixe `/:page` ne cree pas une deuxieme fiche distincte;
- les variantes `/:id` qui reutilisent strictement le meme composant et la meme logique peuvent pointer vers une fiche unique;
- les CRUD proches de `EntityCrudBase` peuvent commencer par le pattern commun avant la fiche page dediee.
