# BL-009 - Audit des routes sans point d'entree ou sans usage

## Conclusion rapide

- Aucune route technique de base sous `dashboard/entities/*` n'apparait morte a ce stade: elles sont toutes surfacees au minimum par le hub `Gestion des Entites`.
- Les vraies candidates cote front ne viennent pas du dedoublement volontaire `dashboard/entities/*` vs `dashboard/*`, mais surtout de routes metier dont le surfacing sidebar etait incoherent avec les permissions reelles au moment de l'audit.
- Apres alignement des permissions sidebar pour `Questions`, `Reponses` et `Groupes metiers`, aucune page metier clairement inutile n'est identifiee.
- Les seules routes sans appel interne observable assume restent surtout des aliases/redirects (`/home`, `/campaigns`) ou des routes contextuelles/deep-link qui restent utiles (`/dashboard/evaluate`, `/postuler/:sourceToken`, `/verify-email/:token`, `/quiz/:applicationId/:quizToken`, routes `:page`, routes `new/edit/detail`).

## Methode

- Inventaire des routes depuis `quizapp_front/src/app/app.routes.ts`.
- Croisement avec les points d'entree front observes dans:
  - `quizapp_front/src/app/pages/dashboard/dashboard.ts`
  - `quizapp_front/src/app/pages/dashboard/dashboard.html`
  - `quizapp_front/src/app/pages/dashboard/entities/entities.ts`
  - `quizapp_front/src/app/pages/dashboard/entities/entities.html`
  - les appels `router.navigate(...)`, `routerLink`, et les generateurs de liens contextuels.
- Verification complementaire des routes externes/deep-link cote backend quand necessaire.

## Resultats prioritaires

### F1 - `/dashboard/questions` : entree sidebar absente au moment de l'audit, cause source corrigee

Statut recommande: `corrige dans la sidebar`

Preuves:

- La route existe dans `quizapp_front/src/app/app.routes.ts:59` et le guard exige `VIEW_QUESTION` a `quizapp_front/src/app/app.routes.ts:131` et `quizapp_front/src/app/app.routes.ts:136`.
- Le seul surfacing declaratif retrouve cote dashboard est l'item sidebar de `quizapp_front/src/app/pages/dashboard/dashboard.ts:177`.
- Cet item sidebar utilise la permission `VIEW_QUESTIONS` a `quizapp_front/src/app/pages/dashboard/dashboard.ts:179`.
- Le catalogue frontend ne declare pourtant que `VIEW_QUESTION` a `quizapp_front/src/app/core/constants/permissions.constants.ts:110`.
- Aucune autre navigation explicite vers `/dashboard/questions` n'a ete retrouvee dans le front.

Impact:

- La page metier existait deja, mais son entree principale etait masquee par une cle de permission non resolue.
- La configuration source a ete alignee ensuite sur `VIEW_QUESTION` dans la sidebar.

### F2 - `/dashboard/answers` : route utile, avec entree sidebar corrigee

Statut recommande: `corrige dans la sidebar`

Preuves:

- La route existe dans `quizapp_front/src/app/app.routes.ts:63` et le guard exige `VIEW_ANSWER` a `quizapp_front/src/app/app.routes.ts:141` et `quizapp_front/src/app/app.routes.ts:146`.
- L'item sidebar utilise `VIEW_ANSWERS` a `quizapp_front/src/app/pages/dashboard/dashboard.ts:186` et `quizapp_front/src/app/pages/dashboard/dashboard.ts:188`.
- Le catalogue frontend ne declare que `VIEW_ANSWER` a `quizapp_front/src/app/core/constants/permissions.constants.ts:114`.
- La route n'est cependant pas morte: la page technique raw `entities-answers` ouvre bien `/dashboard/answers` via `quizapp_front/src/app/pages/dashboard/entities/solo/answers/entities-answers.ts:545`.

Impact:

- La page metier restait joignable, mais surtout depuis la surface technique raw et non depuis le menu attendu.
- La configuration source a ete alignee ensuite sur `VIEW_ANSWER` dans la sidebar.

### F3 - `/dashboard/business-groups` : route utile, avec entree sidebar corrigee

Statut recommande: `corrige dans la sidebar`

Preuves:

- La route existe dans `quizapp_front/src/app/app.routes.ts:455` et son guard utilise `MANAGE_SYSTEM_ROLES` a `quizapp_front/src/app/app.routes.ts:457`.
- L'item sidebar pointe bien vers `/dashboard/business-groups` a `quizapp_front/src/app/pages/dashboard/dashboard.ts:214`, mais il est conditionne par `MANAGE_BUSINESS_GROUPS` a `quizapp_front/src/app/pages/dashboard/dashboard.ts:216`.
- Cette cle `MANAGE_BUSINESS_GROUPS` n'apparait nulle part ailleurs dans le front.
- La route reste joignable via les CTA des surfaces raw:
  - `quizapp_front/src/app/pages/dashboard/entities/solo/business-groups/entities-business-groups.ts:60`
  - `quizapp_front/src/app/pages/dashboard/entities/solo/business-group-permissions/entities-business-group-permissions.ts:89`

Impact:

- La route n'etait pas morte, mais son point d'entree principal en sidebar etait neutralise par une mauvaise cle de permission.
- La configuration source a ete alignee ensuite sur `MANAGE_SYSTEM_ROLES` dans la sidebar, comme les autres surfaces metier de cette zone.

## Routes techniques raw: pas de route morte observee

Constat:

- Les routes techniques de base sous `dashboard/entities/*` sont toutes referencees par le hub `Gestion des Entites` via la liste `entities` de `quizapp_front/src/app/pages/dashboard/entities/entities.ts:40` et le bouton `[routerLink]="entity.route"` de `quizapp_front/src/app/pages/dashboard/entities/entities.html:78`.
- Les routes `dashboard/entities/*/:page` ne sont pas des entrees de premier niveau; elles servent de routes de pagination/self-navigation depuis les pages raw elles-memes.

Conclusion:

- Le dedoublement `dashboard/entities/*` vs `dashboard/*` reste ici intentionnel et non un signal de route morte.

## Routes contextuelles cachees mais utilisees

Ces routes n'ont pas vocation a apparaitre dans le menu principal, mais des usages concrets ont bien ete retrouves.

### Aliases et redirects compatibilite

- `/home` dans `quizapp_front/src/app/app.routes.ts:12`
- `/campaigns` dans `quizapp_front/src/app/app.routes.ts:21`

Observation:

- Aucun appel interne explicite n'a ete retrouve vers ces aliases.
- Ils ressemblent a des redirects de compatibilite/bookmarks, pas a des routes mortes a supprimer d'urgence.

### Routes detail/create/edit

- `/dashboard/campaigns/new` est appelee depuis `quizapp_front/src/app/pages/dashboard/campaigns/campaigns.ts:161`.
- `/dashboard/campaigns/:id` est appelee depuis `quizapp_front/src/app/pages/dashboard/campaigns/campaigns.ts:189`.
- `/dashboard/campaigns/:id/edit` est appelee depuis `quizapp_front/src/app/pages/dashboard/campaign-detail/campaign-detail.ts:648`, `:715` et `:738`.
- `/dashboard/interviews/create` est appelee depuis `quizapp_front/src/app/pages/dashboard/interviews/interviews.ts:297` et `quizapp_front/src/app/pages/dashboard/applications/applications.ts:1022`.
- `/dashboard/pipeline-templates/:id/edit` est appelee depuis `quizapp_front/src/app/pages/dashboard/pipeline-templates/pipeline-templates.ts:112`, `:137`, `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.ts:449` et `quizapp_front/src/app/pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages.ts:154`.
- `/dashboard/email-editor`, `/dashboard/email-editor/:id`, `/dashboard/email-presets`, `/dashboard/email-presets/:id` sont pilotes depuis `quizapp_front/src/app/pages/dashboard/email-editor/email-editor.ts` et `quizapp_front/src/app/pages/dashboard/settings/settings.ts`.

### Routes fullscreen / deep-link dashboard

- `/dashboard/evaluate/:link` est appelee depuis `quizapp_front/src/app/pages/dashboard/evaluations-list/evaluations-list.ts:179` et generee depuis `quizapp_front/src/app/pages/dashboard/interviews/interviews.ts:848` et `:1007`.
- `/dashboard/evaluate` est generee sous forme d'URL avec query params depuis `quizapp_front/src/app/pages/dashboard/interviews/interviews.ts:849` et `:1010`.

### Routes publiques / externes

- `/postuler/:sourceToken` est atteinte depuis la page publique campagnes `quizapp_front/src/app/pages/campaigns/campaigns.ts:51` et via les liens copies/generes dans `quizapp_front/src/app/pages/dashboard/campaign-detail/campaign-detail.ts:573` et `quizapp_front/src/app/pages/dashboard/campaign-detail/campaign-detail.html:643`.
- `/verify-email/:token` est alimentee par le backend via `quizapp/src/main/java/tech/synelia/quizapp/business/ApplicationsBusiness.java:760`.
- `/quiz/:applicationId/:quizToken` est atteinte apres verification d'email depuis `quizapp_front/src/app/pages/verify-email/verify-email.ts:61`.

## Synthese par statut

### Corrigees dans la sidebar

- `/dashboard/questions`
- `/dashboard/answers`
- `/dashboard/business-groups`

### Cachees mais encore utiles

- `/home`
- `/campaigns`
- toutes les routes `:page`
- toutes les routes `new/edit/detail`
- `/dashboard/evaluate`
- `/dashboard/evaluate/:link`
- `/postuler/:sourceToken`
- `/verify-email/:token`
- `/quiz/:applicationId/:quizToken`

### A conserver sans action de nettoyage

- L'ensemble des routes raw `dashboard/entities/*` de base

## Recommandations pour la suite

Sans suppression de pages a ce stade:

1. Revalider les points d'entree reellement visibles pour les profils `super`, `admin`, `recruiter`.
2. Si l'objectif UX reste de rendre les pages metier discoverables sans passer par les surfaces raw, ajouter ensuite un CTA explicite depuis la page raw `entities-questions` vers `/dashboard/questions`.
3. Conserver l'audit BL-009 comme preuve qu'il s'agissait d'un sujet de navigation/permisions, pas d'un sujet de suppression de pages.
