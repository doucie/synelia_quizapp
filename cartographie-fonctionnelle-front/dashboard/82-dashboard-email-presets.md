# Dashboard Email Presets

## 1. Identite

- Routes couvertes: `/dashboard/email-presets` et `/dashboard/email-presets/:id`
- Guard: `permissionGuard(['VIEW_EMAIL_TEMPLATE'])`
- Variante de creation: `?mode=new`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/email-editor/email-editor.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/email-editor/email-editor.html`

## 2. Objectif Produit

La page sert a administrer les layouts HTML reutilisables associes aux templates email, avec edition, duplication, preview et catalogage par categorie.

## 3. Etat Constate

- [x] Le composant `EmailEditorComponent` bascule en mode `preset` lorsque la route commence par `email-presets`.
- [x] La variante `/:id` ne constitue pas une page distincte: elle preselecione simplement le preset cible.
- [x] Le composant charge a la fois les presets et les templates, meme en mode preset, pour conserver la logique transverse de l'editeur.
- [x] La liste est searchable par nom, categorie et description.
- [x] Les presets sont desormais charges uniquement via API; il n'existe plus de fallback frontend sur des presets hardcodes.
- [x] Le formulaire gere `name`, `category`, `htmlStructure`, `previewImage` et `description`.
- [x] Les operations `sauvegarder`, `dupliquer` et `supprimer` sont immediates et relisent la liste apres succes.
- [x] Le mode source HTML et la preview partagee avec les templates restent disponibles ici.
- [x] Le front filtre localement les presets `isDeleted === true` au retour de `GET /emailTemplatePreset/getAll`.
- [ ] Verifier la strategie lorsque des templates actifs referencent encore un preset qu'on souhaite supprimer.
- [ ] Verifier si les categories de preset doivent rester hardcodees dans le front.

## 4. Blocs UI Constates

### 4.1 Header

- [x] titre dynamique `Editeur de presets email`
- [x] bouton de bascule vers `Templates`
- [x] bouton `Nouveau`
- [x] bouton `Sauvegarder`

### 4.2 Liste de presets

- [x] recherche texte
- [x] select des presets existants
- [x] resume de la selection avec nom et categorie
- [x] compteurs affiche / charge

### 4.3 Formulaire preset

- [x] champ `Nom du preset`
- [x] select `Categorie`
- [x] champ `Description`
- [x] edition du layout HTML
- [x] actions `Dupliquer` et `Supprimer` pour un preset existant

### 4.4 Outils d'edition et preview

- [x] mode WYSIWYG / HTML source
- [x] explorer de variables reutilise pour injecter des placeholders
- [x] preview HTML isolee

## 5. Donnees Affichees Ou Editees

- `name`
- `category`
- `htmlStructure`
- `previewImage`
- `description`
- references templates associees indirectement via `presetId`

## 6. Services Et Endpoints

- liste des presets via `GET /emailTemplatePreset/getAll`
- creation via `POST /emailTemplatePreset/create`
- mise a jour via `POST /emailTemplatePreset/update`
- suppression via `POST /emailTemplatePreset/delete`
- chargement de support des templates via `POST /emailTemplate/getByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Un `GET /emailTemplatePreset/getAll` alimente exclusivement la page; une liste vide doit produire une UI vide, pas une galerie legacy locale.
- Des objets `emailTemplatePreset` contenant au minimum `id`, `name`, `category`, `htmlStructure`, `previewImage`, `description`, `isDeleted`.
- Une suppression coherente avec les references `email_template.preset_id`: soit blocage explicite, soit nullification / remediation transparente.
- Une lecture/ecriture reservee aux profils autorises, coherente avec la garde frontend de l'editeur email.
- Un stockage du HTML brut compatible avec la preview iframe et la reutilisation par les templates.

## 8. Entites Metier Impliquees

- `email_template_preset`
- `email_template`
- catalogue de categories de preset

## 9. Questions Ou Ecarts A Qualifier

- [ ] La suppression d'un preset doit-elle etre interdite tant qu'un template actif l'utilise ?
- [ ] Les categories (`APPLICATION_VERIFICATION`, `PASSWORD_RESET`, `GENERIC`, etc.) doivent-elles etre derivees du backend ou d'un referentiel admin editable ?
- [ ] La propriete `previewImage` est-elle reellement exploitee dans l'UI finale ou seulement stockee pour plus tard ?

- [ ] Vérifier la conformité entre la BD actuelle et les formulaires/cartes/filtres front réellement exposés par cette page.
- [ ] Vérifier, si la page expose une création via modale ou inline, qu’aucun contrôle `ngModel` n’est monté dans un vrai tag `<form>` sans `name` ni configuration `standalone`, afin d’éviter un défaut Angular `NG01352` et un rendu partiel.
- [ ] Vérifier, si la page expose des validations locales obligatoires, qu’elles relisent bien un state réellement synchronisé avec la saisie et qu’elles ne masquent pas un défaut de binding ou un décalage de contrat backend/front.
- [ ] Vérifier, si la page expose une édition via modale ou inline, que les valeurs d’origine sont bien réhydratées dès l’ouverture et au premier rendu.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/email-presets` avec un compte autorise.
2. Verifier le chargement de la liste, la recherche et la preselection via `/dashboard/email-presets/:id`.
3. Creer un preset vide via `?mode=new`, remplir le HTML puis sauvegarder.
4. Dupliquer un preset existant et verifier que la copie revient en mode creation.
5. Supprimer un preset de test et verifier le comportement des templates qui le referenceaient.
