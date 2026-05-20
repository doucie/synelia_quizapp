# Dashboard Campaign Edit

## 1. Identite

- Route: `/dashboard/campaigns/:id/edit`
- Guard: `campaignEditGuard`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/campaign-form/campaign-form.component.html`
- Particularite: même composant que la création, mais alimenté par `campaignId`

## 2. Objectif Produit

La page sert à modifier une campagne existante, ses paramètres, sa spécialité, son pipeline et les recruteurs associés, avec migration potentielle des candidats si le pipeline change.

## 3. Etat Constate

- [x] L’édition charge la campagne existante, la spécialité et les accès recruteurs actuels.
- [x] Les recruteurs existants sont rechargés et marqués dans `initialRecruiterIds` pour éviter de renvoyer inutilement certaines notifications.
- [x] Le formulaire est prérempli par `populateForm()`.
- [x] Le changement de pipeline peut ouvrir un scénario de migration candidats.
- [x] La sauvegarde appelle `updateCampaign()` puis resynchronise les accès et notifications.
- [ ] Vérifier les effets réels d’une suppression de droit recruteur sur les permissions d’entité existantes.
- [ ] Vérifier le rendu complet de la modal de migration et ses cas limites.

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
- [x] gestion des recruteurs et permissions
- [x] modal de migration si changement de pipeline

## 6. Services Et Endpoints

### 6.1 Chargement edition

- `CampaignService.getCampaignById()` -> `POST /campaigns/getAllByCriteria`
- `SpecialityService.getById()` -> endpoint spécialité détail
- `CampaignService.getCampaignAccess()` -> lecture via permissions d’entité `CAMPAIGN`

### 6.2 Sauvegarde edition

- `CampaignService.updateCampaign()` -> `POST /campaigns/update`
- `CampaignService.saveCampaignAccess()` -> `POST /entityPermission/grant` / `POST /entityPermission/revoke`
- `CampaignService.createNotification()` -> `POST /notifications/create` pour nouveaux recruteurs ajoutés

### 6.3 Migration pipeline

- `ApplicationProgressService` et services pipeline pour identifier et migrer les candidats concernés

## 7. Ce Que Le Backend Doit Envoyer

- Une campagne réhydratable proprement en formulaire.
- Des accès campagne exacts permettant de reconstruire tous les drapeaux par recruteur.
- Une mise à jour campagne qui renvoie la campagne modifiée ou au moins son identité stable.
- Des endpoints permissions capables de retirer proprement les droits devenus obsolètes.
- Une stratégie de migration pipeline compatible avec les candidats déjà engagés.

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
- [ ] La migration pipeline doit-elle être obligatoire, facultative ou plus guidée ?
- [ ] L’édition doit-elle rediriger vers la liste ou revenir vers le détail campagne ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/campaigns/:id/edit` sur une campagne existante.
2. Modifier un champ simple puis sauvegarder.
3. Ajouter un recruteur, retirer un autre, puis sauvegarder.
4. Vérifier la propagation réelle des permissions campagne après sauvegarde.
5. Changer le pipeline si le cas est supporté et contrôler le flux de migration.