# Dashboard Email Editor

## 1. Identite

- Routes couvertes: `/dashboard/email-editor` et `/dashboard/email-editor/:id`
- Guard: `permissionGuard(['VIEW_EMAIL_TEMPLATE'])`
- Variante de creation: `?mode=new` et optionnellement `?actionType=...`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/email-editor/email-editor.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/email-editor/email-editor.html`

## 2. Objectif Produit

La page permet d'administrer les templates email utilises par les flux automatiques, de lier un template a un preset HTML et de previsualiser le rendu final avec ses variables.

## 3. Etat Constate

- [x] Le meme composant gere la liste, la creation, l'edition et la consultation d'un template selon la route et les query params.
- [x] La variante `/:id` ne constitue pas une page distincte: elle preselecione simplement un template existant.
- [x] Le chargement initial lance en parallele les templates via `/emailTemplate/getByCriteria` et les presets via `/emailTemplatePreset/getAll`.
- [x] Le composant tolere les chargements partiels et remonte une notification si une partie seulement des donnees echoue.
- [x] La liste gauche est searchable par cle, action, description et statut, tout en gardant l'element selectionne visible meme si le filtre l'exclut.
- [x] L'action type pilote les suggestions de cle, la description attendue, le catalogue de variables et les presets recommandes.
- [x] Lors de la creation d'un nouveau template, le composant tente de rehydrater le preset par defaut du template actif de meme `actionType` via `/emailTemplate/getByActionType`.
- [x] Les operations `sauvegarder`, `dupliquer`, `supprimer` sont immediates et rechargent les donnees apres succes.
- [x] Le rendu de preview est isole dans un iframe/srcdoc et le mode source HTML dispose d'un editeur dedie.
- [x] Les variables editables sont persistantes dans `editableVariablesJson`, separees du `bodyTemplate` HTML.
- [ ] Verifier l'alignement entre les `actionType` proposes par le frontend et les flux backend effectivement branches a l'envoi automatique.
- [ ] Verifier si un droit de lecture seul `VIEW_EMAIL_TEMPLATE` suffit aussi pour autoriser les ecritures cote backend.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre dynamique `Editeur de templates email`
- [x] bouton de bascule vers `Presets`
- [x] bouton `Nouveau`
- [x] bouton `Sauvegarder`

### 4.2 Liste de templates

- [x] compteur charge / affiche
- [x] recherche texte
- [x] select listant les templates existants
- [x] resume de la selection courante avec cle, action et statut actif/inactif

### 4.3 Formulaire template

- [x] champ `Cle du template`
- [x] champ `Type d'action`
- [x] resume de configuration pour l'action selectionnee
- [x] champ `Sujet`
- [x] champ `Description`
- [x] select du preset applique
- [x] actions `Dupliquer` et `Supprimer` pour un template existant

### 4.4 Editeur de contenu

- [x] edition WYSIWYG et mode HTML source
- [x] insertion et exploration de variables
- [x] separation entre variables editables et variables metier/globales en lecture seule

### 4.5 Preview

- [x] preview du sujet
- [x] preview HTML rendue avec variables d'exemple
- [x] isolation du CSS email pour eviter les fuites vers le dashboard

## 5. Donnees Affichees Ou Editees

- `templateKey`
- `actionType`
- `subjectTemplate`
- `bodyTemplate`
- `editableVariablesJson`
- `description`
- `presetId`
- `isActive`
- variables de preview derivees du contexte metier/global et des variables editables

## 6. Services Et Endpoints

- liste des templates via `POST /emailTemplate/getByCriteria`
- creation via `POST /emailTemplate/create`
- mise a jour via `POST /emailTemplate/update`
- suppression via `POST /emailTemplate/delete`
- resolution du template actif par action type via `POST /emailTemplate/getByActionType`
- chargement des presets disponibles via `GET /emailTemplatePreset/getAll`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse `getByCriteria` avec `items` et `count`, compatible avec les templates non supprimes.
- Des objets `emailTemplate` contenant au minimum `id`, `templateKey`, `subjectTemplate`, `bodyTemplate`, `editableVariablesJson`, `description`, `actionType`, `presetId`, `isActive`.
- Une resolution par `actionType` qui renvoie le template actif par defaut, avec fallback legacy par `templateKey` pour les anciens flux tant que la migration n'est pas terminee.
- Une contrainte metier garantissant un seul template actif par `actionType` non vide.
- Un rendu backend qui echoue proprement en cas de placeholder `{{variable}}` non resolu et qui notifie l'administration au lieu d'envoyer un email casse.
- Une lecture/ecriture autorisee a minima pour `ADMIN` et `SUPER_ADMIN`, en restant coherente avec la garde frontend actuelle.

## 8. Entites Metier Impliquees

- `email_template`
- `email_template_preset`
- notifications admin sur erreurs de rendu/livraison email
- configuration SMTP et branding email

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les `actionType` `QUIZ_INVITE` et `WELCOME` sont exposes dans le front, mais aucun flux Java verifie n'a encore confirme leur usage automatique.
- [ ] Faut-il separer lecture et ecriture avec des permissions distinctes plutot qu'un simple `VIEW_EMAIL_TEMPLATE` ?
- [ ] Le catalogue de variables et de presets recommandes doit-il venir du backend plutot que d'une config frontend statique ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/email-editor` avec un compte autorise.
2. Selectionner un template existant puis verifier le chargement du sujet, du HTML, du preset et de la preview.
3. Ouvrir `/dashboard/email-editor/:id` et confirmer qu'il s'agit bien de la meme page avec preselection.
4. Creer un nouveau template via `?mode=new&actionType=...`, verifier l'hydratation des suggestions et du preset par defaut.
5. Sauvegarder, dupliquer puis supprimer un template de test.
