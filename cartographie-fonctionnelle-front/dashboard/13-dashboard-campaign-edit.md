# Dashboard Campaign Edit

## 1. Identite

- Route: `/dashboard/campaigns/:id/edit`
- Guard: `campaignEditGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.component.html`
- Particularite: même composant que la création, mais alimenté par `campaignId`

## 2. Objectif Produit

La page sert à modifier une campagne existante, ses paramètres, sa spécialité, son pipeline et les recruteurs associés, avec migration potentielle des candidats si le pipeline change. C'est aussi le point métier où l'utilisateur ajoute, retire ou duplique les formulaires à rattacher à cette campagne.

## 3. Etat Constate

- [x] L’édition charge la campagne existante, la spécialité et les accès recruteurs actuels.
- [x] Les recruteurs existants sont rechargés et marqués dans `initialRecruiterIds` pour éviter de renvoyer inutilement certaines notifications.
- [x] Le formulaire est prérempli par `populateForm()`.
- [x] Le changement de pipeline peut ouvrir un scénario de migration candidats.
- [x] La sauvegarde appelle `updateCampaign()` puis resynchronise les accès et notifications.
- [x] Les formulaires déjà liés sont rechargés en édition, peuvent être ajoutés ou retirés, et la sauvegarde propage bien la synchronisation des liens `campaign_form`.
- [x] Quand un formulaire partagé doit diverger pour cette campagne, l’écran prépare une duplication dédiée avant de synchroniser les liens.
- [x] La suppression d’un recruteur retire les permissions campagne gérées par `saveCampaignAccess()` via un diff `grant/revoke` sur les clés `ADMIN`, `CREATOR`, `UPDATE`, `DELETE`, `EVALUATE`, `CORRECT_TEST`, `PLANIFY`, `ADVANCE_PIPELINE`, `FOLLOW`.
- [x] La modal de migration est bien rendue avec compteur de candidats migrables, option `Ne migrer personne` et CTA `Migrer les N candidat(s)`.
- [x] Après mise à jour, la page revient vers `/dashboard/campaigns`, y compris si la synchronisation secondaire échoue ensuite.

## 4. Differences Principales Par Rapport A La Creation

- La page démarre avec `campaignId` dans l’URL.
- Les valeurs existantes sont injectées dans le formulaire.
- La spécialité actuelle est rechargée à part.
- Les recruteurs actuels sont récupérés depuis les accès campagne.
- Le mot clé métier ici n’est plus `create`, mais `update` + `sync permissions`.

## 5. Blocs UI Constates

Les blocs UI sont globalement les mêmes que la création:

- [x] header retour + titre `Modifier la campagne`
- [x] informations générales
- [x] spécialité recherchable
- [x] pipeline template + aperçu
- [x] configuration campagne
- [x] formulaires de campagne avec association, retrait et duplication ciblée si divergence
- [x] gestion des recruteurs et permissions
- [x] modal de migration si changement de pipeline

## 6. Services Et Endpoints

### 6.1 Chargement edition

- `CampaignService.getCampaignById()` -> `POST /campaigns/getAllByCriteria`
- `SpecialityService.getById()` -> endpoint spécialité détail
- `CampaignService.getCampaignAccess()` -> lecture via permissions d’entité `CAMPAIGN`
- `CampaignFormService.getLinks({ campaignId })` -> chargement des formulaires déjà liés et de leur ordre d’assignation
- `FormVersionService.getAllByCriteria()` -> contexte de partage / publication des formulaires déjà liés
- `FormService.getAllByCriteria()` -> recherche des formulaires sélectionnables

### 6.2 Sauvegarde edition

- `CampaignService.updateCampaign()` -> `POST /campaigns/update`
- `CampaignService.saveCampaignAccess()` -> `POST /entityPermission/grant` / `POST /entityPermission/revoke`
- `CampaignService.createNotification()` -> `POST /notifications/create` pour nouveaux recruteurs ajoutés
- `FormService.syncCampaignLinks()` -> synchronisation explicite des formulaires sélectionnés avec la campagne
- `FormService.duplicateForCampaign()` -> duplication dédiée d’un formulaire partagé avant rattachement si la campagne doit diverger

### 6.3 Migration pipeline

- `ApplicationProgressService.getMigratableCandidates()` -> identification des candidats migrables
- `ApplicationProgressService.migrateMultipleCandidates()` -> migration en lot vers le nouveau template
- `PipelineStageService` -> rechargement des étapes du template sélectionné

## 7. Ce Que Le Backend Doit Envoyer

- Une campagne réhydratable proprement en formulaire.
- Des accès campagne exacts permettant de reconstruire tous les drapeaux par recruteur.
- Une mise à jour campagne qui renvoie la campagne modifiée ou au moins son identité stable.
- Des endpoints permissions capables de retirer proprement les droits campagne gérés devenus obsolètes.
- Une stratégie de migration pipeline compatible avec les candidats déjà engagés.
- Des formulaires récupérables, contextualisés via `campaign_form`, et duplicables explicitement quand une campagne doit diverger d’un formulaire partagé.

## 8. Entites Metier Impliquees

- `campaign`
- `speciality`
- `pipelineTemplate`
- `applicationProgress`
- `entityPermission`
- `notification`
- `user`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Quand un recruteur est retiré, faut-il aussi nettoyer des notifications ou traces associées ?
- [ ] La migration pipeline doit-elle rester binaire (`tout migrer` / `ne migrer personne`) ou devenir plus guidée ?
- [x] L’édition redirige actuellement vers la liste `/dashboard/campaigns`, pas vers le détail campagne.
- [x] L’ajout ou le retrait des formulaires liés est désormais documenté comme un sous-flux de cette page, et non de `/dashboard/forms` ni d’un écran technique `campaign-form`.

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns/:id/edit` sur une campagne existante.
2. Modifier un champ simple puis sauvegarder.
3. Ajouter un recruteur, retirer un autre, puis sauvegarder.
4. Ajouter puis retirer un formulaire lié, puis vérifier la persistance de la synchronisation des liens `campaign_form`.
5. Si une divergence campagne-spécifique est nécessaire, dupliquer un formulaire partagé puis vérifier que la copie est rattachée à la campagne à la sauvegarde.
6. Vérifier la propagation réelle des permissions campagne après sauvegarde.
7. Changer le pipeline si le cas est supporté et contrôler le flux de migration.
8. Vérifier la redirection finale vers `/dashboard/campaigns`.