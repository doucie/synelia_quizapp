# Plan - Ordre de dependance des fichiers de cartographie front

**Date :** 2026-05-21
**Statut :** Plan de tri initial pret a servir de feuille de route

## Objet

Ce fichier classe **tous les fichiers Markdown actuellement presents** dans `cartographie-fonctionnelle-front` du **moins dependant** au **plus dependant**.

L'idee est la meme que dans `to-do/livrables` :

- [ ] commencer par le socle qui ne depend presque de rien ;
- [ ] monter ensuite vers les pages qui consomment des referentiels ;
- [ ] finir par les pages qui agregent plusieurs sous-systemes et par les fichiers de synthese.

## Convention de lecture

- [ ] La dependance ici est **documentaire et fonctionnelle**, pas seulement *technique* runtime.
- [ ] Un fichier est place tard s'il faut deja comprendre plusieurs routes, entites, permissions ou sous-systemes pour l'auditer proprement.
- [ ] Quand plusieurs fichiers sont dans le meme niveau, l'ordre interne est **recommande**, pas mathematiquement strict.
- [ ] Ce plan ne couvre que les fichiers **deja presents** dans `cartographie-fonctionnelle-front` au moment de sa creation.

## Niveau 0 - Socle documentaire et index

Commencer ici. Ce sont les fichiers qui servent de cadre, d'inventaire ou de gabarit pour tout le reste.

- [ ] _plan-ordre-dependances.md
- [ ] README.md
- [ ] _modele-fiche-page.md
- [ ] _inventaire-routes.md
- [ ] public/README.md
- [ ] dashboard/README.md
- [ ] entities/README.md
- [ ] entities/00-pattern-crud-entity.md

## Niveau 1 - Entree publique minimale et shell d'application

Ces fiches demandent peu de connaissance metier detaillee. Elles posent surtout l'entree dans l'application et le conteneur dashboard.

- [ ] public/10-home.md
- [ ] public/40-connexion.md
- [ ] public/60-mot-de-passe-oublie.md
- [ ] dashboard/00-dashboard-shell.md

## Niveau 2 - Referentiels racines et surfaces admin directes

Ces fiches reposent surtout sur des objets racines ou quasi racines : utilisateur, groupes, templates, configurations globales, departements.

- [ ] entities/200-entities-app-config.md
- [ ] entities/190-entities-smtp-config.md
- [ ] entities/210-entities-legal-texts.md
- [ ] entities/10-entities-users.md
- [ ] entities/70-entities-business-groups.md
- [ ] entities/250-entities-pipeline-templates.md
- [ ] entities/340-entities-departments.md
- [ ] entities/310-entities-system-role-permissions.md
- [ ] dashboard/50-dashboard-users.md
- [ ] dashboard/61-dashboard-business-groups.md
- [ ] dashboard/40-dashboard-pipeline-templates.md
- [ ] dashboard/51-dashboard-departments.md
- [ ] dashboard/60-dashboard-system-role-permissions.md

## Niveau 3 - Dependances de premier niveau sur les referentiels

Ici commencent les objets qui s'appuient sur les racines precedentes : specialites, stages, rattachements de groupes, notifications, inscription par code, profil.

- [ ] entities/350-entities-specialities.md
- [ ] entities/260-entities-pipeline-stages.md
- [ ] entities/270-entities-business-group-permissions.md
- [ ] entities/280-entities-user-business-groups.md
- [ ] entities/290-entities-invitation-codes.md
- [ ] entities/240-entities-email-verification-tokens.md
- [ ] entities/160-entities-notifications.md
- [ ] entities/90-entities-candidate-ask.md
- [ ] dashboard/52-dashboard-specialities.md
- [ ] dashboard/41-dashboard-pipeline-template-edit.md
- [ ] dashboard/06-dashboard-profile.md
- [ ] public/50-inscription.md

## Niveau 4 - Communication transverse et banque de questions

Ce niveau regroupe deux branches de complexite moyenne :

- [ ] la pile communication (`email templates`, `mail log`, `settings`, editeur email) ;
- [ ] la pile question/reponse qui servira ensuite aux formulaires et au quiz.

- [ ] entities/170-entities-email-templates.md
- [ ] entities/180-entities-mail-log.md
- [ ] dashboard/07-dashboard-settings.md
- [ ] dashboard/80-dashboard-email-editor.md
- [ ] dashboard/82-dashboard-email-presets.md
- [ ] entities/50-entities-questions.md
- [ ] entities/360-entities-answers.md
- [ ] dashboard/53-dashboard-questions.md
- [ ] dashboard/54-dashboard-answers.md

## Niveau 5 - Noyau campagne

On traite ici la campagne comme objet metier central, avant d'empiler formulaires, tokens, candidatures et permissions fines.

- [ ] entities/330-entities-campaigns.md
- [ ] public/20-campagnes-publiques.md

## Niveau 6 - Couche formulaires et tokens autour des campagnes

Ces fiches dependent deja des campagnes, et pour `form-questions`, de la banque de questions.

- [ ] entities/130-entities-forms.md
- [ ] entities/140-entities-form-versions.md
- [ ] entities/150-entities-form-questions.md
- [ ] entities/40-entities-source-tokens.md

## Niveau 7 - Cycle de candidature et decisions

Ce niveau repose sur la campagne, les formulaires, les tokens source et le quiz. Il couvre le coeur de la candidature et ses effets de bord immediats.

- [ ] entities/20-entities-applications.md
- [ ] entities/230-entities-application-progress.md
- [ ] entities/80-entities-candidate-token.md
- [ ] entities/100-entities-candidate-answers.md
- [ ] entities/60-entities-decisions.md
- [ ] dashboard/20-dashboard-candidates.md
- [ ] dashboard/25-dashboard-decisions.md
- [ ] public/70-postuler-source-token.md

## Niveau 8 - Entretiens, evaluation et suivi candidat avance

On monte ici sur tout ce qui depend des candidatures deja creees : entretiens, participants, evaluations et ecrans d'evaluation/suivi.

- [ ] entities/30-entities-interviews.md
- [ ] entities/120-entities-candidate-interview.md
- [ ] entities/220-entities-interview-participant.md
- [ ] entities/110-entities-evaluations.md
- [ ] dashboard/30-dashboard-interviews.md
- [ ] dashboard/31-dashboard-interview-create.md
- [ ] dashboard/35-dashboard-evaluations.md
- [ ] dashboard/90-dashboard-evaluate-fullscreen.md
- [ ] dashboard/91-dashboard-evaluate-link.md
- [ ] public/30-suivre-candidature.md

## Niveau 9 - Surcouches d'acces, pages pivots et agregats croises

Ces fiches consomment plusieurs sous-systemes a la fois : permissions polymorphes, vues campagne enrichies, inventaires transverses et indicateurs agreges.

- [ ] entities/300-entities-entity-permissions.md
- [ ] entities/320-entities-user-permission-overrides.md
- [ ] dashboard/62-dashboard-user-permissions.md
- [ ] dashboard/10-dashboard-campaigns.md
- [ ] dashboard/11-dashboard-campaigns-new.md
- [ ] dashboard/12-dashboard-campaign-detail.md
- [ ] dashboard/13-dashboard-campaign-edit.md
- [ ] dashboard/05-dashboard-overview.md
- [ ] dashboard/70-dashboard-entities.md
- [ ] dashboard/71-dashboard-merise.md

## Niveau 10 - Sorties de synthese et backlog

Ces fichiers arrivent en dernier, car ils doivent s'appuyer sur un corpus documentaire deja large et relativement stabilise.

- [ ] entities/390-audit-routes-entrees-usage.md
- [ ] evolution/400-evolution-modele-reponses-commentaires.md
- [ ] entities/370-synthese-ecarts-entities-vs-dashboard.md
- [ ] entities/380-backlog-correctif-priorise.md

## Regle pratique d'utilisation

- [ ] Si l'objectif est de **re-auditer progressivement** le dossier `cartographie-fonctionnelle-front`, travailler niveau par niveau dans l'ordre ci-dessus.
- [ ] Si l'objectif est de **corriger un sous-systeme precis**, prendre sa fiche cible puis remonter d'un niveau pour revisiter d'abord ses prerequis directs.