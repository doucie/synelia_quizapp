# Audit implementation metier - QuizApp

Date: 2026-04-28  
Source audit: `to-do/to-do-business-flow-tree-2026-04-25.md`  
Perimetre: inspection du code backend/frontend et des migrations, sans execution end-to-end pendant cet audit.

## Legende

- `[x]` Implemente dans le code.
- `[~]` Partiel, incomplet, ou implemente d'une facon differente de la regle cible.
- `[ ]` Non trouve ou non orchestre.
- `[?]` Donnee/prerequis a verifier en base ou en demo.

Important:

- Ce document juge surtout la presence d'une implementation exploitable, pas l'etat reel des donnees de votre environnement.
- Les items `[?]` correspondent souvent a des preconditions de seed/configuration plutot qu'a un manque de code.

---

## 0. Preparation de la plateforme

## 0.1 Initialisation systeme

- [?] **P0 SYS-001** Verifier qu'un utilisateur SUPER existe dans `user` avec un role qui bypass toutes les permissions.
  A verifier: le bypass SUPER est bien implemente dans `PermissionService`, mais la presence d'un compte SUPER dans la base n'a pas ete validee ici.

- [?] **P0 SYS-002** Verifier qu'au moins une configuration SMTP active existe dans `smtp_config.is_active = true`.
  A verifier: la gestion SMTP et l'unicite d'une config active existent, mais il faut verifier qu'une ligne active est bien presente dans la base.

- [?] **P0 SYS-003** Verifier que les templates email essentiels existent dans `email_template`: invitation, verification candidature, convocation entretien, decision, reset password.
  A verifier: le moteur de templates email est present, mais rien ne garantit dans le code que tous les templates essentiels sont seed par defaut.

- [?] **P0 SYS-004** Verifier que le texte de consentement candidat existe dans `legal_text` avec `text_key = candidate_consent` et `is_active = true`.
  A verifier: l'administration des textes legaux est presente et le front public les lit, mais il faut verifier qu'un `candidate_consent` actif existe reellement.

- [?] **P1 SYS-005** Verifier qu'une configuration active existe dans `app_config` pour nom entreprise, logo/couleur et rendu emails.
  A verifier: `app_config` et le theming front sont bien branches, mais la presence d'une config active reste une verification de donnees.

- [?] **P1 SYS-006** Verifier que les permissions systeme de base sont seed dans `system_role_permission`.
  A verifier: `system_role_permission` est bien utilise par `PermissionService`, mais le seed reel des permissions de base n'a pas ete confirme pendant cet audit.

- [x] **P0 SYS-007** Si SMTP absent ou inactif: bloquer les parcours qui necessitent email ou afficher un mode demo clair.
  Base: le backend bloque desormais les flux email si aucune configuration SMTP active n'est disponible en base, sans fallback silencieux vers `application.properties`.

- [x] **P0 SYS-008** Si template email absent: empecher l'action metier ou utiliser un template fallback.
  Base: les flux email metier verifies passent maintenant par une garde uniforme qui exige un template actif; les fallbacks HTML locaux ont ete retires.

- [x] **P1 SYS-009** Si texte legal absent: bloquer la candidature publique, car le consentement candidat devient fragile.
  Base: la candidature publique est maintenant bloquee cote backend et cote front si `candidate_consent` est absent ou inactif.

---

## 1. Creation utilisateur par invitation

## 1.1 SUPER ou ADMIN cree une invitation

- [x] **P0 USR-001** SUPER peut creer une invitation pour un email donne.
  Base: le CRUD invitation existe et SUPER bypass les permissions.

- [x] **P0 USR-002** ADMIN peut creer une invitation seulement si ses permissions effectives l'autorisent.
  Base: la creation passe par les protections applicatives habituelles, donc ADMIN peut le faire si ses permissions l'autorisent.

- [x] **P0 USR-003** Le role cible est stocke dans `invitation_code.role`.
  Base: le role cible est bien persiste dans l'entite invitation.

- [x] **P0 USR-004** Le code est unique (`invitation_code.code`) et a une date d'expiration (`expired_at`).
  Base: le code et la date d'expiration sont geres cote metier.

- [x] **P0 USR-005** Un email d'invitation est envoye via `email_template` + `smtp_config`.
  Base: `InvitationCodeBusiness.sendInvitationEmail(...)` est present.

- [x] **P0 USR-006** Cas A: l'invite accepte avant `expired_at`, avec `is_used = false` et `is_deleted = false`.
  Base: `registerWithCode(...)` cree l'utilisateur, affecte le role et marque le code comme utilise.

- [x] **P0 USR-007** Cas B: l'invite accepte apres `expired_at`.
  Base: la relance d'une invitation expiree archive l'ancienne invitation, cree un nouveau code avec une nouvelle expiration de 48h, puis renvoie cette nouvelle invitation.

- [x] **P1 USR-008** Cas C: l'admin annule avant acceptation (`is_deleted = true`).
  Base: une invitation annulee devient invalide et l'inscription est refusee.

- [x] **P1 USR-009** Cas D: le code est deja utilise (`is_used = true`).
  Base: la reutilisation d'un code deja utilise est bien refusee.

- [x] **P1 USR-010** Cas E: l'email saisi ne correspond pas a `invitation_code.email`.
  Base: le formulaire public n'autorise pas une saisie d'email divergente; l'email de l'invitation fait foi.

## 1.2 Apres inscription: role de l'utilisateur

- [x] **P0 USR-011** Si `user.is_deleted = true`: connexion impossible.
  Base: les recherches login excluent les utilisateurs supprimes.

- [x] **P0 USR-012** Si `user.is_locked = true`: connexion impossible avec message clair.
  Base: `connexion(...)` bloque explicitement les comptes verrouilles.

- [x] **P1 USR-013** Si `is_default_password = true`: forcer changement mot de passe avant dashboard.
  Base: l'authentification, les guards, le shell dashboard et la page profil forcent maintenant la redirection vers `/dashboard/profile` tant que le mot de passe par defaut n'a pas ete remplace.

- [x] **P0 USR-014** Si role SUPER:
  Base: le bypass total des permissions SUPER est implemente.

- [x] **P0 USR-015** Si role ADMIN:
  Base: les permissions effectives sont bien calculees a partir du role systeme, des groupes et des overrides.

- [x] **P0 USR-016** Si role UTILISATEUR / RECRUTEUR:
  Base: les droits effectifs globaux et les acces campagne issus de `entity_permission` sont maintenant consommes sur les surfaces recruteur/utilisateur clefs; les actions secondaires de progression pipeline, decision et planification entretien sont filtrees cote front puis revalidees cote backend.

---

## 2. Permissions et groupes metiers

## 2.1 Calcul des permissions effectives

- [x] **P0 PERM-001** Si utilisateur SUPER: autoriser tout.
  Base: `PermissionService` bypass directement pour SUPER.

- [x] **P0 PERM-002** Sinon, charger permissions du role systeme (`system_role_permission.system_role`).
  Base: permissions de role systeme bien chargees.

- [x] **P0 PERM-003** Ajouter permissions de chaque groupe actif de l'utilisateur (`user_business_group` -> `business_group_permission`).
  Base: union des groupes activee dans `PermissionService`.

- [x] **P0 PERM-004** Appliquer `user_permission_override.is_allowed = true` comme GRANT individuel.
  Base: les overrides individuels GRANT sont appliques.

- [x] **P0 PERM-005** Appliquer `user_permission_override.is_allowed = false` comme DENY individuel, sauf regle contraire documentee pour ADMIN.
  Base: le DENY individuel gagne, avec garde-fou pour les permissions ADMIN de base.

- [x] **P0 PERM-006** Pour une campagne/entretien/template precis, verifier aussi `entity_permission`.
  Base: `hasEntityPermission(...)` existe bien.

- [x] **P0 PERM-007** Si permission globale absente mais `entity_permission` presente sur une campagne: autoriser uniquement cette campagne.
  Base: les guards de routes campagne autorisent maintenant l'acces detail/edition via les permissions d'entite de la campagne, meme sans permission globale de campagne.

- [x] **P0 PERM-008** Si permission globale presente mais `entity_permission` absente: autoriser selon regle globale.
  Base: les guards campagne conservent l'autorisation par permission globale, avec la regle existante de `admin_mode` pour l'edition quand elle est requise.

- [x] **P1 PERM-009** Si DENY individuel existe: afficher clairement dans l'admin pourquoi l'utilisateur ne peut pas agir.
  Base: l'ecran d'overrides utilisateur charge et sauvegarde desormais correctement `isAllowed`, et affiche explicitement qu'un `DENY` individuel prime sur les droits herites du role et des groupes metiers.

- [x] **P1 PERM-010** Si conflit groupe A donne droit et groupe B ne donne rien: le droit existe.
  Base: le calcul est bien un cumul des droits accordes.

- [x] **P1 PERM-011** Si conflit groupe donne droit et override individuel DENY: le DENY gagne, sauf SUPER.
  Base: cette priorite est bien respectee.

## 2.2 Demande pour rejoindre un groupe

- [x] **P1 GRP-001** Un utilisateur peut demander a rejoindre un groupe: creer `group_change_request.status = PENDING`.
  Base: creation de requete de groupe en `PENDING` presente.

- [x] **P1 GRP-002** L'utilisateur doit renseigner `reason` si obligatoire.
  Base: le champ `reason` est pris en charge par le flux de demande.

- [x] **P1 GRP-003** Un moderateur (`user_business_group.is_moderator = true`) ou ADMIN peut traiter la demande.
  Base: le traitement cote metier/admin est present.

- [x] **P1 GRP-004** Cas A: demande approuvee.
  Base: le passage en `APPROVED` et l'ajout en `user_business_group` sont maintenant idempotents; l'approbation reutilise ou reactive un membership existant au lieu de creer un doublon.

- [x] **P1 GRP-005** Cas B: demande rejetee.
  Base: `REJECTED`, `processed_by`, `processed_at` et notification sont geres.

- [x] **P2 GRP-006** Cas C: demande deja en attente pour le meme groupe.
  Base: le doublon `PENDING` pour le meme groupe est bien bloque.

- [x] **P2 GRP-007** Cas D: utilisateur deja membre du groupe.
  Base: la creation d'une demande est maintenant bloquee cote backend si l'utilisateur appartient deja activement au groupe cible.

---

## 3. Referentiels avant campagne

## 3.1 Departements et specialites

- [x] **P1 REF-001** ADMIN/SUPER peut creer un departement.
  Base: CRUD departements present.

- [x] **P1 REF-002** ADMIN/SUPER peut creer une specialite rattachee a `department_id`.
  Base: CRUD specialites present avec rattachement au departement.

- [x] **P0 REF-003** Une campagne doit pouvoir choisir une specialite (`campaigns.speciality_id`).
  Base: la campagne est bien reliee a une specialite.

- [x] **P1 REF-004** Si suppression d'un departement avec specialites: bloquer ou soft-delete coherent.
  Base: le delete departement bloque ou propose une suppression en cascade controlee.

- [x] **P1 REF-005** Si suppression d'une specialite utilisee par campagne/question: bloquer ou archiver.
  Base: la suppression d'une specialite utilisee par question/campagne est bien bloquee.

- [x] **P2 REF-006** Si aucune specialite existe: afficher appel a action dans creation campagne.
  Base: le formulaire de creation campagne detecte l'absence de specialites actives et affiche un etat vide avec un CTA vers la gestion des specialites.

---

## 4. Creation d'une campagne

## 4.1 Creation campagne par recruteur/admin

- [x] **P0 CMP-001** L'utilisateur doit avoir `CREATE_CAMPAIGNS` ou permission equivalent.
  Base: la route de creation campagne est protegee par `CREATE_CAMPAIGNS`.

- [x] **P0 CMP-002** Renseigner titre, description, dates, specialite, statut.
  Base: ces champs existent dans la campagne et dans les ecrans associes.

- [x] **P0 CMP-003** Renseigner ou choisir `pipeline_template_id`.
  Base: le rattachement campagne -> pipeline template est present.

- [x] **P0 CMP-004** Definir `max_apply` si limite de candidats.
  Base: le champ est porte par la campagne.

- [x] **P1 CMP-005** Definir `all_can_evaluate` pour savoir qui peut evaluer.
  Base: le champ metier est present cote campagne.

- [x] **P1 CMP-006** Definir `is_timed` et coherence avec chronos questions.
  Base: `is_timed` est bien transporte jusqu'au quiz.

- [x] **P0 CMP-007** Brouillon: visible admin/recruteur, non visible candidat.
  Base: la candidature publique refuse maintenant explicitement les campagnes `PENDING` via une regle backend centralisee reutilisee par `sourceToken/validate`, `sourceToken/info` et `ApplicationsBusiness.create()`.

- [x] **P0 CMP-008** Ouverte: candidat peut postuler si dates valides et limite non atteinte.
  Base: le flux public autorise seulement les campagnes `ACTIVE`, dans leur fenetre de dates, avec controle `max_apply` applique avant validation du lien et avant creation effective de candidature.

- [x] **P0 CMP-009** Fermee: nouvelle candidature bloquee, historique consultable.
  Base: le statut `CLOSED` bloque explicitement les nouvelles candidatures dans le flux public; l'historique existant n'est pas altere par ce correctif.

- [x] **P1 CMP-010** Archivee/supprimee: masquee des listes actives, historique garde.
  Base: les ecrans metier actifs et les selecteurs de campagnes excluent maintenant `isDeleted = true`, tandis que l'ecran admin entite conserve un mode historique explicite via le toggle d'affichage des supprimees.

- [x] **P1 CMP-011** Si `campaign_start` futur: candidature bloquee jusqu'a ouverture.
  Base: le backend bloque desormais les candidatures tant que `campaign_start` est dans le futur et renvoie un message explicite d'ouverture.

- [x] **P1 CMP-012** Si `campaign_end` depassee: candidature bloquee ou statut auto ferme.
  Base: le backend bloque desormais les nouvelles candidatures quand `campaign_end` est depassee, meme sans fermeture auto du statut.

- [x] **P1 CMP-013** Si pas de date: campagne controlee uniquement par statut.
  Base: en absence de `campaign_start` et `campaign_end`, seule la regle de statut (`ACTIVE` requis, `PENDING`/`CLOSED` bloques) s'applique dans le flux public.

- [x] **P0 CMP-014** Si nombre candidatures >= `max_apply`: bloquer nouvelle candidature.
  Base: le backend compte maintenant les candidatures existantes par campagne et bloque toute nouvelle creation quand la limite est atteinte, y compris au sein d'un meme batch de creation.

- [x] **P1 CMP-015** Si `max_apply` nul: pas de limite.
  Base: la limite n'est appliquee que si `max_apply > 0`; une valeur nulle laisse donc la campagne sans plafond de candidatures.

## 4.2 Permissions sur campagne

- [x] **P0 CMP-016** Le createur recoit droits admin sur la campagne (`entity_permission` ou `campaign_crud`).
  Base: `CampaignsBusiness` recree/verifie les `entity_permission` du createur.

- [x] **P0 CMP-017** Partage campagne: ajouter un recruteur avec permissions `UPDATE`, `DELETE`, `EVALUATE`, `FOLLOW`, `PLANIFY`, `ADVANCE_PIPELINE`, `CORRECT_TEST` selon besoin.
  Base: les workflows produit de creation/edition/detail campagne synchronisent maintenant le partage via `entity_permission` avec les cles courtes `UPDATE`, `DELETE`, `EVALUATE`, `FOLLOW`, `PLANIFY`, `ADVANCE_PIPELINE`, `CORRECT_TEST`, plus les droits `ADMIN`/`CREATOR` quand necessaire.

- [x] **P0 CMP-018** Les actions front et back doivent verifier ces permissions.
  Base: les endpoints custom de progression candidature (`advance`/`fail`/`skip`), de decision, d'entretien (`create`/`update`/`delete`/`finishInterview`) et de correction manuelle de reponse libre exigent maintenant soit le droit global adapte, soit le droit campagne `entity_permission` correspondant (`ADVANCE_PIPELINE`, `PLANIFY`, `CORRECT_TEST`, etc.); les ecrans front candidatures, decisions, creation entretien et correction de quiz n'exposent plus ces actions sans ces droits.

- [x] **P1 CMP-019** Decider si `campaign_crud` reste utilise ou si `entity_permission` devient la source officielle.
  Base: `entity_permission` devient la source officielle dans les flux produit de partage et de consultation des acces campagne; `campaign_crud` est relegue a un role legacy de compatibilite / surface admin brute.

---

## 5. Pipeline de campagne

## 5.1 Choisir ou creer un template pipeline

- [x] **P0 PIPE-001** Si template par defaut existe (`is_default = true`, `is_active = true`): proposer par defaut.
  Base: la notion de template par defaut actif existe et est geree cote metier.

- [x] **P0 PIPE-002** Si l'utilisateur veut un pipeline personnalise: creer un `pipeline_template`.
  Base: CRUD pipeline template present.

- [x] **P0 PIPE-003** Ajouter des stages dans `pipeline_stage` avec `stage_order`.
  Base: CRUD/reorder des stages present.

- [x] **P0 PIPE-004** Associer le template a la campagne via `campaigns.pipeline_template_id`.
  Base: rattachement campagne -> template present.

- [x] **P0 PIPE-005** Template actif: utilisable sur une campagne.
  Base: `is_active` est pris en charge.

- [x] **P1 PIPE-006** Template inactif: non proposable pour nouvelle campagne.
  Base: le seul selecteur produit de choix de template campagne charge les templates avec `isActive = true` et `isDeleted = false`; le backend refuse en plus tout template inactif lors du create/update campagne.

- [x] **P1 PIPE-007** Template verrouille (`is_locked = true`): non modifiable directement, seulement duplicable.
  Base: le verrouillage et la duplication sont bien implementes.

- [x] **P1 PIPE-008** Template par defaut: un seul devrait etre actif par defaut.
  Base: la contrainte d'unicite du template par defaut est geree.

## 5.2 Stages possibles

- [x] **P0 PIPE-009** Stage `CANDIDATURE`: reception candidature.
  Base: type de stage exploite dans le pipeline.

- [x] **P0 PIPE-010** Stage `QUIZ`: passage formulaire/questionnaire.
  Base: type de stage exploite dans le pipeline.

- [x] **P0 PIPE-011** Stage `PRESELECTION`: decision humaine avant entretien.
  Base: type de stage exploite dans les decisions.

- [x] **P0 PIPE-012** Stage `INTERVIEW`: entretien planifie.
  Base: type de stage exploite dans le flux entretien.

- [x] **P1 PIPE-013** Stage `TECHNICAL_TEST`: test technique externe/interne.
  Base: le type est maintenant valide explicitement avec un `config_json` obligatoire et structure (`testMode = INTERNAL|EXTERNAL`, `externalUrl` requis pour l'externe), ce qui couvre le cas de parametrage interne/externe du test technique.

- [x] **P1 PIPE-014** Stage `EVALUATION`: evaluation recruteur.
  Base: la saisie d'evaluation alimente maintenant le score du stage `EVALUATION`, le passage en `IN_PROGRESS`, puis la validation/echec du stage est orchestree a la fin d'entretien via le moteur central avec seuil configurable (`passingScore`).

- [x] **P0 PIPE-015** Stage `DECISION`: decision finale.
  Base: type de stage exploite dans `DecisionBusiness`.

- [x] **P2 PIPE-016** Stage `CUSTOM`: etape libre configuree par `config_json`.
  Base: une etape `CUSTOM` doit maintenant porter un `config_json` valide et non vide; le moteur de progression traite ensuite cette etape comme une etape pipeline standard, avec options communes telles que `allowSkip` et `passingScore`.

- [x] **P0 PIPE-017** Si `is_required = true`: impossible de finaliser sans traiter l'etape, sauf skip autorise.
  Base: le moteur central `ApplicationProgressBusiness` bloque maintenant la finalisation d'une etape si une etape requise precedente n'est pas resolue; le skip d'une etape requise n'est autorise que si `config_json.allowSkip = true`.

- [x] **P0 PIPE-018** Si `is_eliminatory = true` et candidat echoue: pipeline peut passer en refuse/failed.
  Base: les flux de decision, entretien et evaluation passent maintenant par le moteur central `failStage(...)`, qui applique uniformement la logique eliminatoire, marque les etapes suivantes en `SKIPPED` et resynchronise `applications.application_status`.

- [x] **P1 PIPE-019** Si stage supprime d'un template deja utilise: bloquer ou creer nouvelle version/duplication du template.
  Base: le template est verrouille des qu'il est utilise, ce qui bloque les modifications directes.

- [x] **P1 PIPE-020** Si `config_json` invalide: empecher sauvegarde.
  Base: `PipelineStageBusiness` refuse maintenant tout `config_json` mal forme, non objet JSON, ou semantiquement incoherent avec le type d'etape; l'ecran d'admin pipeline-stage valide aussi localement avant envoi.

---

## 6. Formulaires, versions, questions

## 6.1 Choisir les formulaires d'une campagne

- [x] **P0 FORM-001** Une campagne peut avoir au moins un formulaire (`form.campaign_id`).
  Base: le rattachement `form.campaign_id` existe.

- [x] **P0 FORM-002** Le recruteur peut creer un formulaire pour la campagne.
  Base: CRUD formulaire present.

- [x] **P0 FORM-003** Le recruteur peut ajouter plusieurs formulaires si le metier le permet.
  Base: le modele autorise plusieurs formulaires par campagne.

- [x] **P0 FORM-004** Definir comment le candidat recoit plusieurs formulaires.
  Base: la campagne porte maintenant une strategie d'attribution (`RANDOM`, `RANDOM_NO_REPEAT`, `SOURCE_TOKEN`, `SEQUENTIAL`) et une politique d'epuisement (`BLOCK`, `RESET`, `LOOP`), exploitees par `ApplicationsBusiness` au moment de la creation de candidature puis en filet de securite a l'ouverture du quiz.

- [x] **P0 FORM-005** Option A: tirage aleatoire parmi les formulaires lies a la campagne.
  Base: le moteur d'attribution supporte maintenant le hasard pur (`RANDOM`) et le hasard sans repetition par candidat (`RANDOM_NO_REPEAT`) en s'appuyant sur les versions de formulaires deja attribuees dans la campagne.

- [x] **P1 FORM-006** Option B: un formulaire est choisi selon le `source_token` utilise par le candidat.
  Base: `source_token.form_id` permet maintenant de lier un formulaire dedie a chaque token, et l'ecran detail campagne expose cette configuration quand la strategie `SOURCE_TOKEN` est utilisee.

- [x] **P1 FORM-007** Option C: rotation sequentielle a chaque nouveau candidat.
  Base: la strategie `SEQUENTIAL` distribue maintenant les formulaires publies dans l'ordre a la creation des candidatures, y compris dans un meme batch, avant d'appliquer la politique d'epuisement configuree.

- [x] **P2 FORM-008** Si tous les formulaires de la strategie ont deja ete utilises: bloquer la participation ou redemarrer le cycle selon configuration.
  Base: les politiques `BLOCK`, `RESET` et `LOOP` sont maintenant interpretees par le moteur d'attribution pour bloquer, reinitialiser le tirage ou poursuivre la rotation selon la strategie active.

## 6.2 Versioning du formulaire

- [x] **P0 FORM-009** A la creation d'un formulaire: creer `form_version` version 1 non publiee.
  OK: la creation d'un formulaire cree maintenant automatiquement une version 1 en brouillon non publiee.

- [x] **P0 FORM-010** Le recruteur construit la version avec `form_questions`.
  Base: `form_questions` et l'edition des versions existent.

- [x] **P0 FORM-011** Publication: passer `is_published = true`.
  Base: la publication est bien prise en charge.

- [x] **P0 FORM-012** Quand une candidature utilise une version, stocker cette version dans `applications.form_version_id`.
  Base: `applications.form_version_id` existe et est exploite.

- [x] **P0 FORM-013** Quand une version est utilisee par au moins une candidature: passer ou traiter comme `is_locked = true`.
  OK: la version est verrouillee des le premier rattachement a une candidature, et pas seulement a la fin du quiz.

- [x] **P0 FORM-014** Version brouillon non publiee: modifiable.
  Base: une version non publiee non verrouillee reste modifiable.

- [x] **P0 FORM-015** Version publiee mais pas encore utilisee: modifiable ou repasser brouillon selon choix metier.
  Base: une version publiee mais non verrouillee reste modifiable.

- [x] **P0 FORM-016** Version publiee et utilisee: non modifiable; toute modification cree une nouvelle version.
  OK: une version verrouillee n'est plus modifiable directement; il faut passer par le fork de version pour la faire evoluer.

- [x] **P1 FORM-017** Si nouvelle version publiee: les nouvelles candidatures utilisent la nouvelle version, les anciennes gardent l'ancienne.
  OK: la version est fixee au moment de la candidature et verrouillee au premier usage, ce qui preserve l'historique des anciennes candidatures.

- [x] **P1 FORM-018** Si aucune version publiee: campagne non ouvrable au candidat.
  OK: l'acces public refuse maintenant les candidatures si la campagne n'a aucune version publiee disponible.

## 6.3 Questions et reponses

- [x] **P0 QST-001** Creer une question avec texte, type, score, chrono, difficulte, specialite.
  Base: ces champs sont bien portes par la question.

- [x] **P0 QST-002** Ajouter des reponses avec ordre et `is_correct`.
  Base: CRUD reponses present.

- [x] **P0 QST-003** Ajouter la question a une version de formulaire via `form_questions`.
  Base: lien `form_questions` present.

- [x] **P0 QST-004** Respecter `question_order` pour l'affichage candidat.
  Base: l'ordre des questions est bien utilise dans le quiz.

- [x] **P0 QST-005** Respecter `chrono_override` si present, sinon `question.question_chrono`.
  Base: `ApplicationsBusiness` applique bien cette priorite.

- [x] **P0 QST-006** `SINGLE_CHOICE`: une seule reponse selectionnee.
  Base: c'est le mode reellement supporte aujourd'hui par le front quiz.

- [x] **P0 QST-007** Choix multiple: plusieurs `candidate_answer.is_selected = true` possibles.
  Base: le quiz public, l'API `saveQuizAnswer` et le recalcul du score gerent maintenant plusieurs selections pour une meme question, avec evaluation exacte de l'ensemble des bonnes reponses.

- [x] **P1 QST-008** Texte libre: utiliser `candidate_answer.free_text_response` et evaluation manuelle si necessaire.
  Base: les questions `TEXT` initialisent maintenant une ligne `candidate_answer`, le quiz candidat persiste `free_text_response`, et la correction manuelle met a jour `candidate_answer.manual_*` ainsi que `applications.quiz_manual_correction_status` (`NOT_REQUIRED`, `PENDING`, `COMPLETED`).

- [x] **P1 QST-009** Si question sans bonne reponse: pas de scoring automatique, ou bloquer publication selon choix metier.
  Base: la publication d'une version de formulaire est maintenant bloquee si une question auto-corrigee ne definit pas les bonnes reponses minimales attendues; les questions `TEXT` restent corrigees manuellement hors scoring automatique.

---

## 7. Candidature publique

## 7.1 Candidat ouvre un lien de campagne

- [x] **P0 CAND-001** Verifier que la campagne existe, est ouverte, dans les dates, non supprimee.
  Base: `CampaignPublicAccessService` refuse maintenant les campagnes absentes/supprimees, non `ACTIVE`, pas encore ouvertes ou deja fermees; `SourceTokenController.validate/info` et `ApplicationsBusiness.create(...)` reutilisent cette meme garde.

- [x] **P0 CAND-002** Verifier que la limite `max_apply` n'est pas atteinte.
  Base: `CampaignPublicAccessService` bloque maintenant l'acces public si `campaign.max_apply` est atteint, a la fois lors de `sourceToken/validate|info` et lors de `ApplicationsBusiness.create(...)` avec prise en compte des candidatures en cours du batch.

- [x] **P0 CAND-003** Charger le consentement `legal_text.candidate_consent`.
  Base: la page publique charge les textes legaux actifs.

- [x] **P0 CAND-004** Si lien contient un `source_token`, verifier `source_token.expiration_date` et `campaign_id`.
  Base: `SourceTokenController.validate/info` filtre bien les tokens valides/non expires/campagne active.

- [x] **P1 CAND-005** Token valide: rattacher `applications.source_token_id`.
  Base: `source_token_id` est bien persiste sur la candidature.

- [x] **P1 CAND-006** Token expire: refuser ou laisser postuler sans source selon choix metier.
  Base: le choix metier actuellement implemente est le refus explicite du lien expire; `CampaignPublicAccessService` remonte une erreur claire et le guard public redirige avec message sans autoriser de candidature hors source.

- [x] **P1 CAND-007** Token inconnu: afficher erreur ou rediriger vers candidature classique.
  Base: le guard public bloque/redirige sur token invalide.

## 7.2 Candidat depose sa candidature

- [x] **P0 CAND-008** Sauvegarder identite candidat.
  Base: les champs identite sont bien persistes.

- [x] **P0 CAND-009** Uploader CV et stocker `candidate_cv_path`.
  Base: le flux upload CV du front est present.

- [x] **P0 CAND-010** Sauvegarder lettre de motivation si fournie.
  Base: le champ est bien transporte/persiste.

- [x] **P0 CAND-011** Exiger consentement legal avant creation.
  Base: le front public impose le consentement.

- [x] **P0 CAND-012** Choisir la bonne `form_version_id` au moment de la candidature.
  Base: `ApplicationsBusiness.create(...)` affecte maintenant la version de formulaire des la creation publique, soit depuis `dto.formVersionId`, soit via `selectFormVersionForCandidate(...)` a partir du `source_token` et de la strategie d'attribution de la campagne.

- [x] **P0 CAND-013** Generer le code de suivi candidat et `quiz_token`.
  Base: le flux public genere maintenant un `candidate_token` comme code de suivi candidat a la creation, et `quiz_token` a la verification email; `visit_token` a ete retire du schema actif.

- [x] **P0 CAND-014** Initialiser `email_verified = false`.
  Base: fait explicitement a la creation.

- [~] **P0 CAND-015** Initialiser `quiz_status` et `application_status`.
  Manque: `quiz_status` est bien initialise a `PENDING`; `application_status` est renseigne par le front public puis potentiellement resynchronise par `ApplicationProgressBusiness`, mais le backend ne fixe pas seul une valeur par defaut uniforme hors pipeline.

- [x] **P0 CAND-016** Creer un token dans `email_verification_tokens`.
  Base: token de verification cree et envoye apres creation.

- [ ] **P0 CAND-017** Email deja candidat sur meme campagne: bloquer doublon ou proposer reprise.
  Manque: aucun controle de doublon email + campagne n'a ete trouve.

- [~] **P1 CAND-018** CV absent si obligatoire: bloquer.
  Manque: le front le bloque, mais le backend considere encore le CV comme optionnel.

- [x] **P1 CAND-019** Formulaire publie absent: bloquer candidature et alerter admin.
  Base: `CampaignPublicAccessService.ensureFormAccessIsAvailable(...)` est appele avant creation publique et bloque desormais la candidature si aucune version publiee n'est disponible pour la campagne ou pour le formulaire dedie du `source_token`.

- [~] **P1 CAND-020** Upload CV echoue: ne pas creer candidature incomplete ou marquer comme incomplete.
  Manque: le front evite de creer si l'upload echoue, mais aucune logique back transactionnelle/compensatoire n'a ete trouvee.

## 7.3 Verification email candidat

- [x] **P0 MAIL-001** Envoyer email de verification apres candidature.
  Base: l'email de verification est bien envoye apres creation candidature.

- [x] **P0 MAIL-002** Si token valide et non expire: marquer `email_verification_tokens.is_used = true`, `used_at`, et `applications.email_verified = true`.
  Base: `ApplicationsBusiness.verifyEmail(...)` marque le token utilise, renseigne `used_at`, bascule `applications.email_verified = true` et genere le `quiz_token` retourne au frontend.

- [~] **P0 MAIL-003** Si token expire: afficher erreur et proposer renvoi.
  Manque: l'erreur d'expiration est bien remontee cote backend et affichee sur la page publique, mais aucun renvoi/retry candidat n'est prevu.

- [x] **P1 MAIL-004** Si token deja utilise: afficher deja verifie ou rediriger.
  Base: le token deja utilise est bien detecte.

- [x] **P1 MAIL-005** Si token inconnu: afficher erreur.
  Base: le token inconnu est bien refuse.

---

## 8. Passage du quiz / formulaire candidat

## 8.1 Acces au quiz

- [x] **P0 QUIZ-001** Candidat accede via `applications.quiz_token`.
  Base: le quiz s'ouvre bien via `applicationId + quizToken`.

- [x] **P0 QUIZ-002** Refuser acces si `email_verified = false`, sauf mode demo decide.
  Base: l'acces quiz refuse maintenant explicitement toute candidature non verifiee, meme si un token etait rejoue.

- [x] **P0 QUIZ-003** Charger exactement `applications.form_version_id`.
  Base: le quiz charge strictement la version deja rattachee a la candidature et refuse l'acces si `form_version_id` est absent.

- [x] **P0 QUIZ-004** Charger questions par `form_questions.question_order`.
  Base: ordre bien respecte.

- [x] **P0 QUIZ-005** Token quiz invalide: refuser.
  Base: le token quiz est bien verifie.

- [x] **P0 QUIZ-006** Quiz deja soumis: afficher resultat ou interdire reprise.
  Base: un quiz `COMPLETED` est refuse.

- [x] **P1 QUIZ-007** Candidature abandonnee: refuser ou proposer reprise selon `application_abandoned`.
  Base: l'acces quiz refuse explicitement les candidatures marquees `application_abandoned = true`; une politique d'inactivite dediee met maintenant ce flag a `true` depuis `quiz_last_activity_at`, un ping frontend et une tache planifiee backend.

## 8.2 Reponses et scoring

- [x] **P0 QUIZ-008** Enregistrer chaque reponse dans `candidate_answer`.
  Base: les reponses sont bien persistees dans `candidate_answer`.

- [x] **P0 QUIZ-009** Pour choix fixe: remplir `answer_id` et `is_selected`.
  Base: c'est le flux supporte aujourd'hui.

- [x] **P1 QUIZ-010** Pour texte libre: remplir `free_text_response`.
  Base: le quiz public persiste desormais `candidate_answer.free_text_response` et recharge cette valeur lors d'une reprise du questionnaire.

- [x] **P0 QUIZ-011** Calculer `applications.quiz_score` et `quiz_score_percent`.
  Base: le score et le pourcentage sont recalcules a la soumission sur une logique par question, avec match exact pour les questions a choix multiple et statut conservateur tant qu'une correction manuelle de question `TEXT` est en attente.

- [x] **P0 QUIZ-012** Mettre a jour `time_elapsed`, `total_questions`, `quiz_status`.
  Base: `quiz_status` passe de `PENDING` a `STARTED` puis `COMPLETED`, `total_questions` est recalcule, et `time_elapsed` est maintenant derive du demarrage reel du stage `QUIZ`.

- [x] **P0 QUIZ-013** Mettre a jour le stage `application_progress` de type `QUIZ`.
  Base: le premier acces au quiz cloture `CANDIDATURE`, active `QUIZ`, met a jour son score puis le resolut en fin de quiz quand la correction manuelle est terminee.

- [x] **P0 QUIZ-014** Score suffisant: stage QUIZ passe en `PASSED`.
  Base: en fin de quiz, le stage `QUIZ` passe a `PASSED` si `quiz_score_percent` atteint le seuil configure (`passingScore`, sinon 50).

- [x] **P0 QUIZ-015** Score insuffisant sur stage eliminatoire: stage `FAILED` et candidature refusee ou bloquee.
  Base: en dessous du seuil, le stage `QUIZ` passe a `FAILED`; si l'etape est eliminatoire, le moteur pipeline bloque la suite et rejette la candidature.

- [x] **P1 QUIZ-016** Quiz partiellement rempli: statut `IN_PROGRESS` ou abandon selon delai.
  Base: les reponses deja enregistrees sont rechargees a la reprise, le stage pipeline `QUIZ` reste en `IN_PROGRESS`, et une inactivite prolongee marque maintenant la candidature comme abandonnee tout en figeant le stage `QUIZ` en `FAILED` sans reactivation implicite.

- [x] **P1 QUIZ-017** Temps depasse: soumission automatique ou echec selon choix metier.
  Base: si le temps alloue est epuise, le quiz est soumis automatiquement cote backend et le frontend declenche aussi la soumission a l'expiration du compte a rebours.

---

## 9. Initialisation et avancement pipeline candidat

## 9.1 Initialisation a la candidature

- [x] **P0 PROG-001** A creation candidature, creer une ligne `application_progress` pour chaque `pipeline_stage` du template campagne.
  Base: `ApplicationsBusiness.create(...)` appelle bien `initProgressForApplication(...)`.

- [x] **P0 PROG-002** Premier stage passe en `IN_PROGRESS` ou `PASSED` selon logique candidature.
  Base: apres init, le premier stage est avance a `IN_PROGRESS`.

- [x] **P0 PROG-003** Les autres stages restent `PENDING`.
  Base: c'est bien le comportement de l'initialisation.

- [x] **P0 PROG-004** Respecter l'ordre `pipeline_stage.stage_order`.
  Base: ordre respecte partout dans `ApplicationProgressBusiness`.

- [x] **P0 PROG-005** Si campagne sans pipeline template: utiliser template par defaut ou bloquer ouverture campagne.
  Base: creation avec template par defaut, normalisation/blocage a l'activation d'une campagne, et blocage d'acces public si aucun pipeline n'est configure.

- [x] **P1 PROG-006** Si pipeline modifie apres candidature: ne pas casser les progress existants; migrer seulement avec action explicite.
  Base: les progress existants ne sont pas reecrits lors d'un changement de template campagne; la migration reste explicite via `migratableCandidates` et `migrateMultiple`.

## 9.2 Action recruteur sur une etape

- [x] **P0 PROG-007** Recruteur doit avoir `ADVANCE_PIPELINE` ou permission entite.
  Base: `advance/fail/skip` passent tous par `ensureCampaignMutationAllowed(...)`, qui verifie les permissions globales ou entite campagne.

- [x] **P0 PROG-008** Passer une etape de `PENDING` a `IN_PROGRESS`.
  Base: `advanceToNextStage(...)` le fait.

- [x] **P0 PROG-009** Passer une etape a `PASSED`, `FAILED` ou `SKIPPED`.
  Base: `advanceToNextStage(...)`, `failStage(...)` et `skipStage(...)` existent.

- [x] **P0 PROG-010** Renseigner `decided_by`, `completed_at`, `notes` si decision humaine.
  Base: les chemins humains `pass/fail/skip` renseignent maintenant uniformement `completed_at`, `notes` et `decided_by`.

- [x] **P0 PROG-011** Etape requise non terminee: impossible d'aller a la decision finale, sauf override admin.
  Base: `ensureStageCanBeCompleted(...)` bloque la finalisation d'une etape tant qu'une etape precedente requise n'est pas resolue.

- [x] **P0 PROG-012** Etape eliminatoire echouee: candidature passe en echec/refus selon regle.
  Base: `failStage(...)` gere bien le cas eliminatoire et synchronise le statut candidature.

- [x] **P1 PROG-013** Etape optionnelle: peut passer en `SKIPPED`.
  Base: `skipStage(...)` existe.

- [x] **P1 PROG-014** Retour en arriere: autorise seulement admin ou permission speciale.
  Base: endpoint/metier `rollback` limite a `ADMIN` sur la campagne ou a la permission globale `MIGRATE_CANDIDATE_PIPELINE`, avec reouverture controlee de l'etape cible.

---

## 10. Preselection et decisions

## 10.1 Decision sur une etape

- [x] **P0 DEC-001** Creer une decision pour accepter/refuser/mettre en attente un candidat.
  Base: `DecisionBusiness.create(...)` existe.

- [x] **P0 DEC-002** Lier la decision a `application_id`.
  Base: lien bien gere.

- [x] **P0 DEC-003** Lier la decision a `pipeline_stage_id` si elle concerne une etape precise.
  Base: la decision peut etre reliee a une etape et le service la retro-renseigne si besoin.

- [x] **P0 DEC-004** Mettre `user_id` ou `created_by` pour tracer le recruteur.
  Base: la tracabilite est bien presente.

- [x] **P0 DEC-005** Synchroniser `application_progress` et `applications.application_status`.
  Base: le statut candidature et le stage PRESELECTION/DECISION sont bien synchronises.

- [x] **P0 DEC-006** Decision positive: stage passe `PASSED`, ouvrir stage suivant.
  Base: `DecisionBusiness` delegue au moteur central `passStage(...)`, qui ouvre l'etape suivante quand applicable.

- [x] **P0 DEC-007** Decision negative: stage passe `FAILED`, candidature refusee si eliminatoire.
  Base: `DecisionBusiness` delegue au moteur central `failStage(...)`, qui applique les regles eliminatoires et resynchronise le statut candidature.

- [x] **P1 DEC-008** Decision annulee: creer ou marquer `is_cancel = true`, ne pas supprimer l'historique.
  Base: `is_cancel` est supporte et le rollback de statut existe.

- [x] **P1 DEC-009** Decision finale: envoyer email final si template actif et `final_decision_mail_sent = false`.
  Base: `DecisionBusiness` envoie maintenant un email final optionnel via template actif `FINAL_DECISION`/`final_decision`, puis pose le flag apres succes.

- [x] **P1 DEC-010** Decision preselection: envoyer email si `pre_screen_decision_mail_sent = false`.
  Base: `DecisionBusiness` envoie maintenant un email de preselection optionnel via template actif `PRE_SCREEN_DECISION`/`pre_screen_decision`, puis pose le flag apres succes.

---

## 11. Entretien

## 11.1 Planification entretien

 - [x] **P0 INT-001** Depuis une candidature/stage INTERVIEW, recruteur planifie entretien.
  Base: l'action de planification depuis les candidatures pointe maintenant vers la vraie route `/dashboard/interviews/create`, la garde de route accepte les recruteurs ayant le droit global ou un acces campagne `PLANIFY`/`ADMIN`, et le formulaire preselectionne la campagne et la candidature ciblees.

- [x] **P0 INT-002** Creer `interviews` avec date, type, lieu ou lien, campagne, application.
  Base: l'entite et le CRUD couvrent bien ce besoin.

- [x] **P0 INT-003** Creer ou lier `candidate_interview` pour le candidat.
  Base: `InterviewsBusiness` cree ou resynchronise maintenant automatiquement le lien `candidate_interview` a la creation et a la mise a jour de l'entretien.

 - [x] **P1 INT-004** Ajouter participants/evaluateurs via `interview_participant`.
  Base: la creation d'entretien cree deja les participants, et la modale d'edition resynchronise maintenant `interview_participant` avec la selection d'evaluateurs (ajout/retrait) pour garder le flux coherent bout en bout.

 - [x] **P1 INT-005** Donner permissions d'evaluation via `entity_permission` ou logique participant.
  Base: la creation copie deja les droits campagne sur l'entretien, et l'edition resynchronise maintenant les permissions d'entite de l'entretien avec les evaluateurs choisis (grant/revoke des droits d'evaluation et des droits copies depuis la campagne).

- [x] **P0 INT-006** Envoyer email convocation et mettre `interview_mail_sent = true`.
  Base: `InterviewsBusiness` traite maintenant la convocation comme un effet metier; l'entretien est garde et `interview_mail_sent` ne passe a `true` qu'apres succes d'envoi.

- [x] **P0 INT-007** Entretien presentiel: utiliser `interview_location`.
  Base: supporte.

- [x] **P0 INT-008** Entretien visio: utiliser `meet_link`.
  Base: supporte.

- [x] **P1 INT-009** Entretien sans evaluateur: autoriser creation mais afficher alerte.
  Base: la creation reste autorisee sans evaluateur, mais le flux de creation affiche maintenant un warning explicite dans l'etape Evaluateurs puis dans le recapitulatif final avant confirmation.

- [x] **P1 INT-010** Email non envoye: garder entretien mais indiquer erreur/retry.
  Base: la reponse backend reflète maintenant l'etat final de `interview_mail_sent` apres tentative d'envoi, la replanification et la creation affichent un warning explicite si la convocation echoue, et le renvoi est pre-active depuis la liste quand l'email n'a pas ete envoye.

## 11.2 Reponse candidat a l'entretien

- [x] **P1 INT-011** Candidat accepte: entretien reste planifie.
  Base: la page publique de suivi permet maintenant de confirmer un entretien via `trackingCode + email`; le back garde l'entretien en `SCHEDULED` et purge une ancienne demande en attente.

- [x] **P1 INT-012** Candidat decline: remplir `decline_reason`.
  Base: la reponse publique candidat ecrit maintenant `candidate_interview.decline_reason` avec motif obligatoire.

- [x] **P1 INT-013** Candidat demande autre date: remplir `alternative_date_requested`.
  Base: la reponse publique candidat ecrit maintenant `candidate_interview.alternative_date_requested` et bascule l'entretien en `POSTPONED`.

- [x] **P1 INT-014** Recruteur voit la demande et peut replanifier.
  Base: la vue recruteur des entretiens remonte maintenant la reponse candidat (`decline_reason`, `alternative_date_requested`) et expose une action locale de replanification sur le bon entretien.

- [x] **P1 INT-015** Replanification acceptee: modifier date/lien et renvoyer convocation.
  Base: la modale recruteur permet maintenant de modifier date/lieu-lien et de renvoyer explicitement la convocation; le backend autorise ce renvoi sur vraie replanification et purge la reponse candidat precedente.

- [x] **P1 INT-016** Replanification refusee: garder statut refuse/annule selon choix metier.
  Base: le choix metier retenu est maintenant l'archivage (`ARCHIVED`) de l'entretien reporte; la demande de replanification est purgee et le candidat ne peut plus repondre sur ce creaneau.

## 11.3 Evaluation entretien

- [x] **P0 EVAL-001** Evaluateur autorise saisit `candidate_mark` et `recruiter_comment`.
  Base: la saisie d'evaluation existe.

- [x] **P0 EVAL-002** Rattacher evaluation a `candidate_interview_id`.
  Base: rattachement present.

- [x] **P0 EVAL-003** Recalculer `interviews.evaluation_score`, `evaluation_number`, `evaluation_percentage`.
  Base: `finishInterview(...)` le fait.

- [x] **P0 EVAL-004** Recalculer `applications.total_evaluation_score`, `total_evaluation_number`, `total_evaluation_percentage`.
  Base: `finishInterview(...)` le fait aussi.

- [x] **P0 EVAL-005** Mettre a jour stage `EVALUATION` ou `INTERVIEW` dans `application_progress`.
  Base: la synchronisation du pipeline entretien/evaluation est maintenant centralisee dans `ApplicationProgressBusiness.syncInterviewEvaluationStages(...)`, appelee a la fin d'entretien et apres chaque recalcul d'evaluations; elle met a jour le score du bon stage, cloture `INTERVIEW` si besoin, puis resout `EVALUATION` ou `INTERVIEW` selon le seuil configure.

- [x] **P1 EVAL-006** Plusieurs evaluateurs: moyenne ou somme selon regle choisie.
  Base: la moyenne est calculee a partir du nombre d'evaluations.

- [x] **P1 EVAL-007** Evaluation modifiee: recalculer agregats.
  Base: `EvaluationsBusiness` recalcule maintenant les agregats interview/candidature et le score pipeline EVALUATION sur create, update et delete.

- [x] **P1 EVAL-008** Evaluateur non autorise: refuser cote back.
  Base: le back refuse maintenant la saisie/modification/suppression sans permission globale, permission entite (campagne/entretien) ou appartenance `interview_participant`.

---

## 12. Candidat apres candidature

## 12.1 Demande de correction candidat

- [x] **P1 ASK-001** Candidat demande changement email/telephone/nom via `candidate_ask`.
  Base: l'espace public de suivi permet maintenant de deposer une demande `candidate_ask` via `trackingCode + email`, pour email, telephone, ou identite; la fonctionnalite `candidate_account` reste optionnelle et reservee a une activation future.

- [x] **P1 ASK-002** Recruteur/admin valide ou refuse la demande.
  Base: l'espace interne `candidate_ask` permet maintenant de valider ou refuser une demande via une action metier dediee, avec gestion du motif de refus.

- [x] **P1 ASK-003** Si valide: appliquer `new_email`, `new_phone`, `first_name`, `last_name` sur `applications`.
  Base: la validation applique maintenant la correction sur `applications` avant de cloturer la demande.

- [x] **P2 ASK-004** Notifier candidat du resultat.
  Base: la revue interne envoie maintenant un email `candidate_ask_result` au candidat apres validation ou refus, via le moteur de templates email existant.

- [x] **P1 ASK-005** Si changement email: refaire verification email.
  Base: la validation d'une demande de changement email remet `email_verified` a `false` et relance le flux existant de verification email.

- [x] **P1 ASK-006** Si demande invalide: refuser avec motif.
  Base: le refus interne impose maintenant un motif conserve sur `candidate_ask` et visible dans les suivis.

## 12.2 Reprise de parcours candidat

- [x] **P1 TOK-001** Clarifier usage de `candidate_token` vs `visit_token` vs `quiz_token`.
  Base: `candidate_token` est maintenant la source active du code de suivi public, `quiz_token` reste reserve au quiz, et `visit_token` a ete retire du schema/code actifs.

- [x] **P1 TOK-002** Candidat peut reprendre via token valide.
  Base: un code de suivi `candidate_token` est maintenant cree a la candidature, remonte dans le front public, disponible comme variable `tracking_code` dans l'email de verification, et la page de suivi accepte un lien pre-rempli `code + email`.

- [x] **P1 TOK-003** Token expire/invalide: refuser et proposer contact recruteur.
  Base: le suivi public refuse maintenant explicitement la reprise invalide avec un message metier clair et un CTA de contact vers l'equipe recrutement.

---

## 13. Notifications et emails metier

## 13.1 Notifications internes

- [x] **P1 NOTIF-001** Nouvelle candidature: notifier recruteurs autorises.
  Base: `ApplicationsBusiness.create(...)` cree des notifications internes `APPLICATION_RECEIVED` pour les recruteurs de campagne autorises.

- [x] **P1 NOTIF-002** Demande de groupe: notifier moderateurs/admins.
  Base: le flux de demande de groupe cree bien des notifications.

- [x] **P1 NOTIF-003** Entretien decline: notifier recruteur.
  Base: `ApplicationsBusiness.respondToTrackedInterview(...)` notifie les recruteurs de campagne sur refus et demande de replanification candidat.

- [x] **P1 NOTIF-004** Evaluation terminee: notifier responsable campagne si utile.
  Base: `InterviewsBusiness.finishInterview(...)` cree des notifications `EVALUATION_COMPLETED` pour les responsables de campagne concernes.

- [x] **P2 NOTIF-005** Marquer lu/non lu via `notifications.is_read`.
  Base: lu/non lu est bien supporte.

## 13.2 Emails externes

- [x] **P0 EMAIL-001** Invitation utilisateur.
  Base: implemente.

- [x] **P0 EMAIL-002** Verification candidature.
  Base: implemente.

- [x] **P0 EMAIL-003** Convocation entretien.
  Base: l'envoi existe, et le backend traite maintenant `interview_mail_sent` comme un etat derive de la convocation courante: tout changement de contenu (candidat/campagne/date/type/lieu-lien/note) invalide le flag tant qu'un nouvel envoi n'a pas reussi, et un entretien sans cible email exploitable ne peut plus etre marque a tort comme envoye.

- [x] **P1 EMAIL-004** Decision preselection.
  Base: `DecisionBusiness.sendDecisionEmailIfNeeded(...)` envoie l'email de preselection avec template et met a jour `pre_screen_decision_mail_sent`.

- [x] **P0 EMAIL-005** Decision finale.
  Base: `DecisionBusiness.sendDecisionEmailIfNeeded(...)` envoie l'email de decision finale avec template et met a jour `final_decision_mail_sent`.

- [x] **P1 EMAIL-006** Reset password.
  Base: le flux de mot de passe oublie/reset existe.

- [x] **P0 EMAIL-007** Si template actif existe: envoyer avec variables.
  Base: `EmailTemplateBusiness` rend bien sujet/corps avec variables.

- [x] **P0 EMAIL-008** Si SMTP actif absent: afficher erreur et garder action retry possible.
  Base: `HostingUtils.sendEmail(...)` retourne une erreur metier coherente si SMTP est absent, cree une alerte admin dedupliquee (`EMAIL_SMTP_CONFIG_MISSING` / `EMAIL_DELIVERY_FAILED`), et les flux gardent l'etat non-envoye pour permettre la relance.

- [x] **P1 EMAIL-009** Si variable manquante: ne pas envoyer email casse; logguer et alerter admin.
  Base: `EmailTemplateBusiness.renderSubjectTemplate(...)` / `renderBodyTemplate(...)` bloquent tout placeholder `{{...}}` non resolu et notifient les admins via `EMAIL_TEMPLATE_VARIABLE_MISSING`.

- [x] **P1 EMAIL-010** Si email deja envoye: utiliser flags `*_mail_sent` pour eviter doublon.
  Base: le flag d'entretien n'est plus pilotable librement par le client; il reste `true` tant que la convocation courante est valide, repasse a `false` si son contenu change sans renvoi, et n'autorise un renvoi que quand aucun email valide n'est encore parti ou qu'une nouvelle convocation est necessaire.

---

## 14. Administration et configuration

## 14.1 Branding et configuration globale

- [x] **P1 ADMIN-001** Admin peut modifier `app_config.company_name`, `primary_color`, `color_scheme`.
  Base: implemente dans l'administration.

- [x] **P1 ADMIN-002** Admin peut choisir une seule config active.
  Base: la contrainte d'une seule config active est geree.

- [x] **P2 ADMIN-003** Nettoyer/sanitizer `logo_html` avant affichage.
  Base: `logoHtml` est maintenant sanitize explicitement cote front avant sauvegarde, avant mise en cache theme et dans l'aperçu Settings; un champ vide est renvoye en `null` sur AppConfig.

## 14.2 SMTP

- [x] **P0 ADMIN-004** Admin peut configurer SMTP sans exposer `password_encrypted` au front.
  Base: le secret SMTP est desormais write-only cote API/front (`password`), n'est plus retourne aux ecrans admin et n'alimente plus `search_string`.

- [x] **P1 ADMIN-005** Admin peut tester SMTP.
  Base: l'ecran Settings expose maintenant un test de la configuration SMTP active qui envoie un email de verification au compte admin courant via `/smtpConfig/test`.

- [x] **P1 ADMIN-006** Une seule config SMTP active.
  Base: implemente cote metier.

## 14.3 Textes legaux

- [x] **P1 ADMIN-007** Admin peut editer consentement candidat, politique de confidentialite, conditions d'utilisation.
  Base: CRUD legal texts present.

- [x] **P1 ADMIN-008** Le front public lit les textes actifs depuis la BD.
  Base: implemente.

## 14.4 Templates email

- [x] **P1 ADMIN-009** Admin peut editer sujet/corps/variables.
  Base: l'editeur email couvre bien sujet, layout HTML et variables editables.

- [x] **P1 ADMIN-010** Admin peut choisir un preset.
  Base: implemente.

- [x] **P1 ADMIN-011** Admin peut preview un email avec donnees exemples.
  Base: preview et variables exemples presents.

- [x] **P1 ADMIN-012** SUPER seul peut activer/desactiver la fonctionnalite de comptes candidats.
  Base: flag `candidate_accounts_enabled` ajoute dans `app_config`, expose dans Settings/CRUD app config reserves au SUPER, et garde-fou backend sur connexion/inscription pour tout role `candidate` quand le flag est desactive.

---

## 15. Parcours de demo memoire de bout en bout

## 15.1 Scenario principal heureux

- [?] **P0 DEMO-001** SUPER se connecte.
  A verifier: le flux de login fonctionne, mais il faut verifier qu'un compte SUPER exploitable existe dans l'environnement.

- [?] **P0 DEMO-002** SUPER configure SMTP/templates minimum si necessaire.
  A verifier: l'UI de configuration existe; il faut verifier les donnees reelles et les templates actifs.

- [x] **P0 DEMO-003** SUPER invite un ADMIN ou recruteur.
  Base: faisable avec le flux invitation.

- [x] **P0 DEMO-004** L'invite accepte dans les temps et cree son compte.
  Base: faisable.

- [x] **P0 DEMO-005** ADMIN cree une specialite si necessaire.
  Base: faisable.

- [x] **P0 DEMO-006** ADMIN cree un pipeline template simple: CANDIDATURE -> QUIZ -> PRESELECTION -> INTERVIEW -> DECISION.
  Base: faisable.

- [x] **P0 DEMO-007** ADMIN cree une campagne ouverte avec ce pipeline.
  Base: l'ouverture publique est maintenant fiabilisee par `CampaignPublicAccessService` (statut `ACTIVE`, fenetre `campaign_start`/`campaign_end`, quota `max_apply`, token/source/formulaire disponibles).

- [x] **P0 DEMO-008** ADMIN cree un formulaire, une version, des questions, des reponses.
  Base: `FormBusiness.create(...)` cree automatiquement une version brouillon initiale `v1`, puis l'edition questions/reponses reste disponible.

- [x] **P0 DEMO-009** ADMIN publie la version du formulaire.
  Base: faisable.

- [x] **P0 DEMO-010** Candidat postule avec CV et consentement.
  Base: le parcours public impose CV + consentement cote UI, le backend exige un texte legal actif, verrouille l'acces campagne/source, et rattache `form_version_id` a la creation.

- [x] **P0 DEMO-011** Candidat verifie son email.
  Base: faisable.

- [x] **P0 DEMO-012** Candidat passe le quiz.
  Base: le quiz gere single-choice, multi-choice et texte libre, calcule `time_elapsed`/temps restant, verrouille l'acces si email non verifie, et synchronise desormais l'etape pipeline `QUIZ`.

- [x] **P0 DEMO-013** Recruteur consulte candidature, CV, score, reponses.
  Base: les pages de consultation candidature/reponses existent.

- [x] **P0 DEMO-014** Recruteur avance le pipeline en preselection.
  Base: `DecisionBusiness` fait passer/echouer l'etape, ouvre la suite via le moteur `application_progress`, et envoie l'email de preselection si un template actif existe.

- [x] **P0 DEMO-015** Recruteur planifie un entretien.
  Base: `InterviewsBusiness` synchronise le lien `candidate_interview`, les participants/evaluateurs et le flag `interview_mail_sent` sur la convocation valide, avec retry possible en cas d'echec email.

- [x] **P0 DEMO-016** Evaluateur saisit une evaluation.
  Base: faisable.

- [x] **P0 DEMO-017** Recruteur prend une decision finale.
  Base: la decision finale resynchronise `application_progress` + `applications.application_status`, applique les regles terminales, et peut envoyer un email final via template actif.

- [x] **P0 DEMO-018** Candidat recoit l'email de decision.
  Base: `DecisionBusiness.sendDecisionEmailIfNeeded(...)` envoie les emails `PRE_SCREEN_DECISION` / `FINAL_DECISION` et pose les flags anti-double-envoi apres succes.

## 15.2 Scenarios KO a montrer ou tester

- [x] **P0 KO-001** Invitation expiree: inscription refusee + relance possible.
  Base: `validateCode(...)` refuse les codes expires et `resendInvitation(...)` regenere un nouveau code quand l'invitation precedente a expire.

- [x] **P0 KO-002** Candidature sur campagne fermee: refusee proprement.
  Base: `CampaignPublicAccessService` bloque explicitement les candidatures hors statut, hors fenetre, ou apres atteinte de `max_apply`.

- [x] **P0 KO-003** Candidat non verifie: quiz inaccessible.
  Base: `validateQuizSessionAccess(...)` refuse explicitement l'acces quiz si `email_verified != true`.

- [x] **P0 KO-004** Utilisateur sans permission: modification campagne refusee.
  Base: `campaign.service.ts` envoie maintenant l'utilisateur courant, et `updateAll(...)` / `updateDeleted(...)` appliquent aussi le controle `entity_permission` sur la campagne.

- [x] **P1 KO-005** Version formulaire verrouillee: modification cree nouvelle version.
  Base: `FormVersionBusiness.update(...)` fork automatiquement une version verrouillee avant d'appliquer la modification, et le front `form-versions` pre-remplit le modal comme une nouvelle version brouillon.

- [x] **P1 KO-006** Stage eliminatoire echoue: pipeline bloque/refuse.
  Base: `ApplicationProgressBusiness.failStage(...)` marque l'etape en `FAILED`, passe les suivantes en `SKIPPED` si `isEliminatory = true`, puis resynchronise `applications.application_status`; `DecisionBusiness` reutilise ce moteur.

- [x] **P1 KO-007** Entretien decline avec date alternative: recruteur peut replanifier.
  Base: la page `interviews` exposait deja la demande et le modal de replanification; `InterviewService` et `CandidateInterviewEntityService` envoient maintenant l'utilisateur connecte, ce qui permet au recruteur autorise de replanifier puis de reinitialiser correctement la reponse candidat.

---

## 16. Decisions metier a trancher avant implementation massive

- [x] **P0 DECIDE-001** Plusieurs formulaires par campagne: strategie configurable entre tirage aleatoire, choix par `source_token`, ou rotation sequentielle.
  Decision: la campagne peut lier plusieurs formulaires et choisir une strategie d'attribution anti-triche; chaque strategie doit aussi definir sa politique d'epuisement (blocage, reinitialisation du tirage, ou boucle sequentielle).

- [x] **P0 DECIDE-002** Source officielle des permissions campagne: `entity_permission` ou `campaign_crud` ?
  Decision: `entity_permission` est la source officielle des droits campagne; `campaign_crud` reste un relicat legacy de compatibilite/migration et ne doit plus porter la verite metier.

- [x] **P1 DECIDE-003** Source officielle des droits entretien: `entity_permission`, `interview_participant`, ou `interview_crud` ?
  Decision: `entity_permission` porte l'ACL officielle des entretiens; `interview_participant` ne garde que l'affectation/session des evaluateurs; `interview_crud` est obsolete et migre.

- [x] **P1 DECIDE-004** Source officielle du statut candidat: `applications.application_status` ou agregation `application_progress` ?
  Decision: `application_progress` est le moteur source de verite; `applications.application_status` est un snapshot denormalise, resynchronise automatiquement pour les lectures, filtres et emails.

- [x] **P1 DECIDE-005** Acces candidat: conserver un acces leger via `candidate_token`/code de suivi + email, avec `quiz_token` et `email_verification_tokens` gardes comme tokens techniques dedies; ajouter un `candidate_account` optionnel pour une reprise persistante.
  Decision: la fonctionnalite `candidate_account` doit etre activable/desactivable uniquement par SUPER; si elle est desactivee, le parcours candidat continue de reposer sur l'acces leger sans compte interne.

- [x] **P1 DECIDE-006** Score final: quelle ponderation entre quiz, entretien, evaluation humaine ?
  Decision: pas de score final pondere automatique pour l'instant; `quizScorePercent`, les scores d'entretien/evaluation et la decision recruteur restent des signaux distincts, la decision finale demeurant explicite et humaine.

- [x] **P2 DECIDE-007** Pipeline template utilise: verrouillage simple ou vrai versioning des templates ?
  Decision: conserver un verrouillage simple avec duplication explicite du template et de ses stages quand un pipeline deja utilise doit evoluer; pas de vrai versioning multi-revisions pour l'instant.

---

## 17. Ordre conseille pour implementation progressive

## Lot 1 - Auth, invitations, permissions minimales

- [x] **P0 LOT1-001** Invitation utilisateur complete.
  Base: creation/validation d'invitation ok, relance avec regeneration de code si l'ancien a expire, retry email expose, et forçage de changement de mot de passe gere par l'auth guard quand `isDefaultPassword=true`.

- [~] **P0 LOT1-002** Connexion + role + menus selon permissions.
  Base: chargement des permissions effectives apres login, menus filtres par permissions, guards campagne/entretien critiques en place; reste a aligner certains ecrans/routes encore gardes trop grossierement (ex. `MANAGE_APP_CONFIG`) ou sans garde fine dediee.

- [x] **P0 LOT1-003** Permissions campagne minimum.
  Base: les acces campagne utilisent maintenant `entity_permission` comme source officielle, avec guards front et verifications metier alignees sur les droits globaux ou campaign-scoped.

## Lot 2 - Campagne + formulaire versionne

- [x] **P0 LOT2-001** Creation campagne avec pipeline.
  Base: creation campagne + pipeline ok, avec controles publics sur `campaign_status`, fenetre de dates et `max_apply`.

- [x] **P0 LOT2-002** Creation formulaire + version + questions/reponses.
  Base: `FormBusiness.create()` cree automatiquement une V1 brouillon, les CRUD questions/reponses sont exploites, et l'edition de version verrouillee passe par fork sans casser la version publiee.

- [x] **P0 LOT2-003** Publication/verrouillage version.
  Base: publication ok, et une version verrouillee est maintenant dupliquee automatiquement avant edition.

## Lot 3 - Candidature + quiz

- [x] **P0 LOT3-001** Page candidature publique.
  Base: candidature publique verrouillee par `campaign_status`, fenetre dates, `max_apply` et `formVersion` assigne des la creation.

- [x] **P0 LOT3-002** Verification email.
  Base: implemente.

- [x] **P0 LOT3-003** Passage quiz + sauvegarde reponses + score.
  Base: chrono, `time_elapsed`, auto-submit au timeout, correction manuelle et synchronisation du stage `QUIZ` sont couverts.

## Lot 4 - Pipeline + decisions

- [x] **P0 LOT4-001** Initialisation `application_progress`.
  Base: implemente.

- [x] **P0 LOT4-002** Avancement pipeline recruteur.
  Base: avancement recruteur centralise via `ApplicationProgressBusiness`, avec required stages, permissions fines campagne et rollback controle.

- [x] **P0 LOT4-003** Decisions liees aux stages.
  Base: decisions synchronisent maintenant statut/pipeline et emails de preselection/finale avec flags `*_mail_sent`.

## Lot 5 - Entretiens + evaluations

- [x] **P0 LOT5-001** Planification entretien.
  Base: planification, reponse candidat/replanification et gestion fiable du flag `interview_mail_sent` sont couvertes.

- [x] **P1 LOT5-002** Participants/evaluateurs.
  Base: affectation evaluateurs et enforcement des droits via `entity_permission` / `interview_participant` sont couverts.

- [x] **P0 LOT5-003** Evaluation + agregats.
  Base: agregats, orchestration du stage `EVALUATION` et controle d'autorisation sont couverts.

## Lot 6 - Admin et polish memoire

- [x] **P1 LOT6-001** Emails configurables.
  Base: l'editeur et le rendu de templates sont bien presents.

- [x] **P1 LOT6-002** Groupes metiers + demandes.
  Base: administration groupes/demandes en place avec garde "deja membre", prevention des doublons de demande `PENDING`, approbation/rejet et notification du demandeur.

- [x] **P1 LOT6-003** Notifications.
  Base: notifications metier principales en place (nouvelle candidature, demandes de groupe, refus/replanification entretien, evaluation, candidate ask, alertes admin email), avec chargement utilisateur, `notif_link` et lecture/marquage lu frontend/backend alignes.

- [x] **P2 LOT6-004** Branding et textes legaux administrables.
  Base: administration ok, `logo_html` est sanitize et les textes legaux actifs sont lus par le front public.

---

## Priorites recommandees

- [x] Priorite 1: les flux critiques bloquent deja sans SMTP/template actif, et la candidature publique bloque sans texte legal actif `candidate_consent`; on n'est plus dans un mode demo implicite.
- [x] Priorite 2: candidature publique fiabilisee avec controles `campaign_status`, dates, `max_apply` et `form_version_id` assigne des la candidature.
- [x] Priorite 3: quiz metier termine avec `time_elapsed`, timeout pilote par chrono et synchronisation du stage `QUIZ`.
- [x] Priorite 4: decisions metier completes avec emails de preselection/finale et consommation reelle des flags `*_mail_sent`.
- [x] Priorite 5: reponse candidat a l'entretien et replanification implementees.
- [x] Priorite 6: test SMTP et sanitization de `logo_html` implementes.
