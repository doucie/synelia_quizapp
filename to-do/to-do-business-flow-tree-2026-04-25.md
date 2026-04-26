# Arbre metier complet - Recrutement QuizApp

Date: 2026-04-25  
Objectif: suivre l'implementation du projet comme un parcours metier, pas comme une liste technique de tables.

Ce fichier complete `to-do-db-implementation-checklist-2026-04-25.md`.
L'ancien fichier reste utile pour retrouver les tables/champs. Celui-ci sert a choisir quoi developper, dans quel ordre, et quoi tester en demo.

## Legende

- [ ] **P0** Bloquant pour la demo memoire.
- [ ] **P1** Important pour une version coherente.
- [ ] **P2** Confort, admin avance, robustesse.
- [ ] **P3** Plus tard.

Acteurs principaux:

- **SUPER**: utilisateur racine, bypass total des permissions.
- **ADMIN**: gere les utilisateurs, campagnes, groupes, permissions selon droits.
- **RECRUTEUR / UTILISATEUR**: travaille sur les campagnes si ses permissions le permettent.
- **CANDIDAT**: postule, verifie son email, repond, suit ou accepte/refuse un entretien.

Tables les plus importantes par parcours:

- Utilisateurs: `user`, `invitation_code`, `system_role_permission`, `business_group`, `business_group_permission`, `user_business_group`, `user_permission_override`, `entity_permission`, `group_change_request`.
- Campagnes et formulaires: `campaigns`, `form`, `form_version`, `form_questions`, `question`, `answer`, `source_token`.
- Candidatures: `applications`, `candidate_answer`, `candidate_token`, `candidate_ask`, `email_verification_tokens`.
- Pipeline: `pipeline_template`, `pipeline_stage`, `application_progress`, `decisions`.
- Entretiens: `interviews`, `candidate_interview`, `interview_participant`, `evaluations`.
- Configuration: `email_template`, `email_template_preset`, `smtp_config`, `legal_text`, `app_config`, `notifications`.

---

# 0. Preparation de la plateforme

Avant tout parcours reel, il faut que la plateforme puisse envoyer des emails, afficher ses textes legaux, et avoir au moins un super utilisateur.

## 0.1 Initialisation systeme

- [x] **P0 SYS-001** Verifier qu'un utilisateur SUPER existe dans `user` avec un role qui bypass toutes les permissions.
- [x] **P0 SYS-002** Verifier qu'au moins une configuration SMTP active existe dans `smtp_config.is_active = true`.
- [x] **P0 SYS-003** Verifier que les templates email essentiels existent dans `email_template`: invitation, verification candidature, convocation entretien, decision, reset password.
- [x] **P0 SYS-004** Verifier que le texte de consentement candidat existe dans `legal_text` avec `text_key = candidate_consent` et `is_active = true`.
- [x] **P1 SYS-005** Verifier qu'une configuration active existe dans `app_config` pour nom entreprise, logo/couleur et rendu emails.
- [x] **P1 SYS-006** Verifier que les permissions systeme de base sont seed dans `system_role_permission`.

Branches possibles:

- [ ] **P0 SYS-007** Si SMTP absent ou inactif: bloquer les parcours qui necessitent email ou afficher un mode demo clair.
- [ ] **P0 SYS-008** Si template email absent: empecher l'action metier ou utiliser un template fallback.
- [ ] **P1 SYS-009** Si texte legal absent: bloquer la candidature publique, car le consentement candidat devient fragile.

---

# 1. Creation utilisateur par invitation

Le parcours commence souvent par SUPER ou ADMIN qui invite quelqu'un.

## 1.1 SUPER ou ADMIN cree une invitation

Table principale: `invitation_code`  
Champs decisionnels: `email`, `role`, `code`, `is_used`, `expired_at`, `created_by`, `is_deleted`.

- [ ] **P0 USR-001** SUPER peut creer une invitation pour un email donne.
- [ ] **P0 USR-002** ADMIN peut creer une invitation seulement si ses permissions effectives l'autorisent.
- [ ] **P0 USR-003** Le role cible est stocke dans `invitation_code.role`.
- [ ] **P0 USR-004** Le code est unique (`invitation_code.code`) et a une date d'expiration (`expired_at`).
- [ ] **P0 USR-005** Un email d'invitation est envoye via `email_template` + `smtp_config`.

Branches apres creation:

- [ ] **P0 USR-006** Cas A: l'invite accepte avant `expired_at`, avec `is_used = false` et `is_deleted = false`.
  - Creer `user` avec `email`, role cible, mot de passe choisi ou temporaire.
  - Marquer `invitation_code.is_used = true`.
  - Option: mettre `user.is_default_password = true` si mot de passe temporaire.
  - Rediriger vers connexion ou dashboard.
- [ ] **P0 USR-007** Cas B: l'invite accepte apres `expired_at`.
  - Refuser l'inscription.
  - Afficher message: code expire.
  - Proposer cote admin une relance qui cree un nouveau code.
- [ ] **P1 USR-008** Cas C: l'admin annule avant acceptation (`is_deleted = true`).
  - Refuser l'inscription.
  - Afficher message: invitation annulee ou invalide.
  - Garder l'ancien code inutilisable.
- [ ] **P1 USR-009** Cas D: le code est deja utilise (`is_used = true`).
  - Refuser une seconde inscription.
  - Proposer connexion si l'utilisateur existe deja.
- [ ] **P1 USR-010** Cas E: l'email saisi ne correspond pas a `invitation_code.email`.
  - Refuser ou demander confirmation selon choix metier.

## 1.2 Apres inscription: role de l'utilisateur

Table principale: `user`  
Champs decisionnels: `user_role`, `is_locked`, `is_default_password`, `admin_mode`, `is_deleted`.

- [ ] **P0 USR-011** Si `user.is_deleted = true`: connexion impossible.
- [ ] **P0 USR-012** Si `user.is_locked = true`: connexion impossible avec message clair.
- [ ] **P1 USR-013** Si `is_default_password = true`: forcer changement mot de passe avant dashboard.

Branches par role:

- [ ] **P0 USR-014** Si role SUPER:
  - Acces complet.
  - Peut gerer roles systeme, groupes, utilisateurs, campagnes, templates, pipeline.
  - Ne depend pas de `system_role_permission`.
- [ ] **P0 USR-015** Si role ADMIN:
  - Charger permissions de base depuis `system_role_permission`.
  - Ajouter permissions de groupes via `user_business_group`.
  - Appliquer overrides via `user_permission_override`.
  - Afficher seulement les menus autorises.
- [ ] **P0 USR-016** Si role UTILISATEUR / RECRUTEUR:
  - Charger permissions effectives.
  - Afficher uniquement les campagnes/entretiens/entites autorises.
  - Autoriser demande de groupe si fonctionnalite active.

---

# 2. Permissions et groupes metiers

But: savoir qui peut voir, creer, modifier, evaluer, avancer un candidat ou administrer.

## 2.1 Calcul des permissions effectives

Tables: `system_role_permission`, `business_group_permission`, `user_business_group`, `user_permission_override`, `entity_permission`.

Ordre recommande:

- [ ] **P0 PERM-001** Si utilisateur SUPER: autoriser tout.
- [ ] **P0 PERM-002** Sinon, charger permissions du role systeme (`system_role_permission.system_role`).
- [ ] **P0 PERM-003** Ajouter permissions de chaque groupe actif de l'utilisateur (`user_business_group` -> `business_group_permission`).
- [ ] **P0 PERM-004** Appliquer `user_permission_override.is_allowed = true` comme GRANT individuel.
- [ ] **P0 PERM-005** Appliquer `user_permission_override.is_allowed = false` comme DENY individuel, sauf regle contraire documentee pour ADMIN.
- [ ] **P0 PERM-006** Pour une campagne/entretien/template precis, verifier aussi `entity_permission`.

Branches importantes:

- [ ] **P0 PERM-007** Si permission globale absente mais `entity_permission` presente sur une campagne: autoriser uniquement cette campagne.
- [ ] **P0 PERM-008** Si permission globale presente mais `entity_permission` absente: autoriser selon regle globale.
- [ ] **P1 PERM-009** Si DENY individuel existe: afficher clairement dans l'admin pourquoi l'utilisateur ne peut pas agir.
- [ ] **P1 PERM-010** Si conflit groupe A donne droit et groupe B ne donne rien: le droit existe.
- [ ] **P1 PERM-011** Si conflit groupe donne droit et override individuel DENY: le DENY gagne, sauf SUPER.

## 2.2 Demande pour rejoindre un groupe

Tables: `group_change_request`, `user_business_group`, `business_group`.

- [ ] **P1 GRP-001** Un utilisateur peut demander a rejoindre un groupe: creer `group_change_request.status = PENDING`.
- [ ] **P1 GRP-002** L'utilisateur doit renseigner `reason` si obligatoire.
- [ ] **P1 GRP-003** Un moderateur (`user_business_group.is_moderator = true`) ou ADMIN peut traiter la demande.

Branches:

- [ ] **P1 GRP-004** Cas A: demande approuvee.
  - Passer `status = APPROVED`.
  - Remplir `processed_by`, `processed_at`.
  - Creer `user_business_group(user_id, target_group_id)` si absent.
  - Notifier l'utilisateur.
- [ ] **P1 GRP-005** Cas B: demande rejetee.
  - Passer `status = REJECTED`.
  - Remplir `processed_by`, `processed_at`.
  - Notifier l'utilisateur.
- [ ] **P2 GRP-006** Cas C: demande deja en attente pour le meme groupe.
  - Bloquer doublon ou afficher la demande existante.
- [ ] **P2 GRP-007** Cas D: utilisateur deja membre du groupe.
  - Ne pas creer de demande.

---

# 3. Referentiels avant campagne

Avant de creer une campagne propre, il faut des departements/specialites.

## 3.1 Departements et specialites

Tables: `departments`, `specialities`.

- [ ] **P1 REF-001** ADMIN/SUPER peut creer un departement.
- [ ] **P1 REF-002** ADMIN/SUPER peut creer une specialite rattachee a `department_id`.
- [ ] **P0 REF-003** Une campagne doit pouvoir choisir une specialite (`campaigns.speciality_id`).

Branches:

- [ ] **P1 REF-004** Si suppression d'un departement avec specialites: bloquer ou soft-delete coherent.
- [ ] **P1 REF-005** Si suppression d'une specialite utilisee par campagne/question: bloquer ou archiver.
- [ ] **P2 REF-006** Si aucune specialite existe: afficher appel a action dans creation campagne.

---

# 4. Creation d'une campagne

La campagne est le conteneur principal du recrutement.

Table principale: `campaigns`  
Champs decisionnels: `campaign_title`, `campaign_desc`, `campaign_status`, `campaign_start`, `campaign_end`, `max_apply`, `all_can_evaluate`, `total_questions`, `is_timed`, `pipeline_template_id`, `creator_id`, `speciality_id`.

## 4.1 Creation campagne par recruteur/admin

- [ ] **P0 CMP-001** L'utilisateur doit avoir `CREATE_CAMPAIGNS` ou permission equivalent.
- [ ] **P0 CMP-002** Renseigner titre, description, dates, specialite, statut.
- [ ] **P0 CMP-003** Renseigner ou choisir `pipeline_template_id`.
- [ ] **P0 CMP-004** Definir `max_apply` si limite de candidats.
- [ ] **P1 CMP-005** Definir `all_can_evaluate` pour savoir qui peut evaluer.
- [ ] **P1 CMP-006** Definir `is_timed` et coherence avec chronos questions.

Branches de statut campagne:

- [ ] **P0 CMP-007** Brouillon: visible admin/recruteur, non visible candidat.
- [ ] **P0 CMP-008** Ouverte: candidat peut postuler si dates valides et limite non atteinte.
- [ ] **P0 CMP-009** Fermee: nouvelle candidature bloquee, historique consultable.
- [ ] **P1 CMP-010** Archivee/supprimee: masquee des listes actives, historique garde.

Branches de dates:

- [ ] **P1 CMP-011** Si `campaign_start` futur: candidature bloquee jusqu'a ouverture.
- [ ] **P1 CMP-012** Si `campaign_end` depassee: candidature bloquee ou statut auto ferme.
- [ ] **P1 CMP-013** Si pas de date: campagne controlee uniquement par statut.

Branches de limite:

- [ ] **P0 CMP-014** Si nombre candidatures >= `max_apply`: bloquer nouvelle candidature.
- [ ] **P1 CMP-015** Si `max_apply` nul: pas de limite.

## 4.2 Permissions sur campagne

Tables: `entity_permission`, eventuellement `campaign_crud` legacy.

- [ ] **P0 CMP-016** Le createur recoit droits admin sur la campagne (`entity_permission` ou `campaign_crud`).
- [ ] **P0 CMP-017** Partage campagne: ajouter un recruteur avec permissions `UPDATE`, `DELETE`, `EVALUATE`, `FOLLOW`, `PLANIFY`, `ADVANCE_PIPELINE` selon besoin.
- [ ] **P0 CMP-018** Les actions front et back doivent verifier ces permissions.
- [ ] **P1 CMP-019** Decider si `campaign_crud` reste utilise ou si `entity_permission` devient la source officielle.

---

# 5. Pipeline de campagne

Le pipeline definit les etapes par lesquelles passe une candidature.

Tables: `pipeline_template`, `pipeline_stage`, `campaigns.pipeline_template_id`.

## 5.1 Choisir ou creer un template pipeline

- [ ] **P0 PIPE-001** Si template par defaut existe (`is_default = true`, `is_active = true`): proposer par defaut.
- [ ] **P0 PIPE-002** Si l'utilisateur veut un pipeline personnalise: creer un `pipeline_template`.
- [ ] **P0 PIPE-003** Ajouter des stages dans `pipeline_stage` avec `stage_order`.
- [ ] **P0 PIPE-004** Associer le template a la campagne via `campaigns.pipeline_template_id`.

Branches template:

- [ ] **P0 PIPE-005** Template actif: utilisable sur une campagne.
- [ ] **P1 PIPE-006** Template inactif: non proposable pour nouvelle campagne.
- [ ] **P1 PIPE-007** Template verrouille (`is_locked = true`): non modifiable directement, seulement duplicable.
- [ ] **P1 PIPE-008** Template par defaut: un seul devrait etre actif par defaut.

## 5.2 Stages possibles

Champs: `stage_type`, `stage_label`, `stage_order`, `is_required`, `is_eliminatory`, `config_json`.

- [ ] **P0 PIPE-009** Stage `CANDIDATURE`: reception candidature.
- [ ] **P0 PIPE-010** Stage `QUIZ`: passage formulaire/questionnaire.
- [ ] **P0 PIPE-011** Stage `PRESELECTION`: decision humaine avant entretien.
- [ ] **P0 PIPE-012** Stage `INTERVIEW`: entretien planifie.
- [ ] **P1 PIPE-013** Stage `TECHNICAL_TEST`: test technique externe/interne.
- [ ] **P1 PIPE-014** Stage `EVALUATION`: evaluation recruteur.
- [ ] **P0 PIPE-015** Stage `DECISION`: decision finale.
- [ ] **P2 PIPE-016** Stage `CUSTOM`: etape libre configuree par `config_json`.

Branches stage:

- [ ] **P0 PIPE-017** Si `is_required = true`: impossible de finaliser sans traiter l'etape, sauf skip autorise.
- [ ] **P0 PIPE-018** Si `is_eliminatory = true` et candidat echoue: pipeline peut passer en refuse/failed.
- [ ] **P1 PIPE-019** Si stage supprime d'un template deja utilise: bloquer ou creer nouvelle version/duplication du template.
- [ ] **P1 PIPE-020** Si `config_json` invalide: empecher sauvegarde.

---

# 6. Formulaires, versions, questions

Tables: `form`, `form_version`, `form_questions`, `question`, `answer`.

## 6.1 Choisir les formulaires d'une campagne

- [ ] **P0 FORM-001** Une campagne peut avoir au moins un formulaire (`form.campaign_id`).
- [ ] **P0 FORM-002** Le recruteur peut creer un formulaire pour la campagne.
- [ ] **P0 FORM-003** Le recruteur peut ajouter plusieurs formulaires si le metier le permet.
- [ ] **P0 FORM-004** Definir comment le candidat recoit plusieurs formulaires.

Branches multi-formulaires a trancher:

- [ ] **P0 FORM-005** Option A: tous les formulaires actifs sont obligatoires.
- [ ] **P1 FORM-006** Option B: un formulaire est choisi selon `source_token` ou profil candidat.
- [ ] **P1 FORM-007** Option C: le recruteur choisit manuellement le formulaire a envoyer.
- [ ] **P2 FORM-008** Option D: formulaire principal + formulaires complementaires plus tard.

## 6.2 Versioning du formulaire

Champs: `form_version.version_number`, `is_published`, `is_locked`.

- [ ] **P0 FORM-009** A la creation d'un formulaire: creer `form_version` version 1 non publiee.
- [ ] **P0 FORM-010** Le recruteur construit la version avec `form_questions`.
- [ ] **P0 FORM-011** Publication: passer `is_published = true`.
- [ ] **P0 FORM-012** Quand une candidature utilise une version, stocker cette version dans `applications.form_version_id`.
- [ ] **P0 FORM-013** Quand une version est utilisee par au moins une candidature: passer ou traiter comme `is_locked = true`.

Branches version:

- [ ] **P0 FORM-014** Version brouillon non publiee: modifiable.
- [ ] **P0 FORM-015** Version publiee mais pas encore utilisee: modifiable ou repasser brouillon selon choix metier.
- [ ] **P0 FORM-016** Version publiee et utilisee: non modifiable; toute modification cree une nouvelle version.
- [ ] **P1 FORM-017** Si nouvelle version publiee: les nouvelles candidatures utilisent la nouvelle version, les anciennes gardent l'ancienne.
- [ ] **P1 FORM-018** Si aucune version publiee: campagne non ouvrable au candidat.

## 6.3 Questions et reponses

Tables: `question`, `answer`, `form_questions`.

- [ ] **P0 QST-001** Creer une question avec texte, type, score, chrono, difficulte, specialite.
- [ ] **P0 QST-002** Ajouter des reponses avec ordre et `is_correct`.
- [ ] **P0 QST-003** Ajouter la question a une version de formulaire via `form_questions`.
- [ ] **P0 QST-004** Respecter `question_order` pour l'affichage candidat.
- [ ] **P0 QST-005** Respecter `chrono_override` si present, sinon `question.question_chrono`.

Branches type question:

- [ ] **P0 QST-006** `SINGLE_CHOICE`: une seule reponse selectionnee.
- [ ] **P0 QST-007** Choix multiple: plusieurs `candidate_answer.is_selected = true` possibles.
- [ ] **P1 QST-008** Texte libre: utiliser `candidate_answer.free_text_response` et evaluation manuelle si necessaire.
- [ ] **P1 QST-009** Si question sans bonne reponse: pas de scoring automatique, ou bloquer publication selon choix metier.

---

# 7. Candidature publique

Tables: `source_token`, `applications`, `email_verification_tokens`, `legal_text`.

## 7.1 Candidat ouvre un lien de campagne

- [ ] **P0 CAND-001** Verifier que la campagne existe, est ouverte, dans les dates, non supprimee.
- [ ] **P0 CAND-002** Verifier que la limite `max_apply` n'est pas atteinte.
- [ ] **P0 CAND-003** Charger le consentement `legal_text.candidate_consent`.
- [ ] **P0 CAND-004** Si lien contient un `source_token`, verifier `source_token.expiration_date` et `campaign_id`.

Branches source token:

- [ ] **P1 CAND-005** Token valide: rattacher `applications.source_token_id`.
- [ ] **P1 CAND-006** Token expire: refuser ou laisser postuler sans source selon choix metier.
- [ ] **P1 CAND-007** Token inconnu: afficher erreur ou rediriger vers candidature classique.

## 7.2 Candidat depose sa candidature

Champs `applications`: `candidate_first_name`, `candidate_last_name`, `candidate_email`, `candidate_phone`, `candidate_cv_path`, `candidate_birth_date`, `motivation_letter`, `email_verified`, `visit_token`, `quiz_token`, `quiz_status`, `application_status`, `form_version_id`.

- [ ] **P0 CAND-008** Sauvegarder identite candidat.
- [ ] **P0 CAND-009** Uploader CV et stocker `candidate_cv_path`.
- [ ] **P0 CAND-010** Sauvegarder lettre de motivation si fournie.
- [ ] **P0 CAND-011** Exiger consentement legal avant creation.
- [ ] **P0 CAND-012** Choisir la bonne `form_version_id` au moment de la candidature.
- [ ] **P0 CAND-013** Generer `visit_token` et `quiz_token`.
- [ ] **P0 CAND-014** Initialiser `email_verified = false`.
- [ ] **P0 CAND-015** Initialiser `quiz_status` et `application_status`.
- [ ] **P0 CAND-016** Creer un token dans `email_verification_tokens`.

Branches candidature:

- [ ] **P0 CAND-017** Email deja candidat sur meme campagne: bloquer doublon ou proposer reprise.
- [ ] **P1 CAND-018** CV absent si obligatoire: bloquer.
- [ ] **P1 CAND-019** Formulaire publie absent: bloquer candidature et alerter admin.
- [ ] **P1 CAND-020** Upload CV echoue: ne pas creer candidature incomplete ou marquer comme incomplete.

## 7.3 Verification email candidat

Tables: `email_verification_tokens`, `applications`.

- [ ] **P0 MAIL-001** Envoyer email de verification apres candidature.
- [ ] **P0 MAIL-002** Si token valide et non expire: marquer `email_verification_tokens.is_used = true`, `used_at`, et `applications.email_verified = true`.
- [ ] **P0 MAIL-003** Si token expire: afficher erreur et proposer renvoi.
- [ ] **P1 MAIL-004** Si token deja utilise: afficher deja verifie ou rediriger.
- [ ] **P1 MAIL-005** Si token inconnu: afficher erreur.

---

# 8. Passage du quiz / formulaire candidat

Tables: `applications`, `form_version`, `form_questions`, `question`, `answer`, `candidate_answer`.

## 8.1 Acces au quiz

- [ ] **P0 QUIZ-001** Candidat accede via `applications.quiz_token`.
- [ ] **P0 QUIZ-002** Refuser acces si `email_verified = false`, sauf mode demo decide.
- [ ] **P0 QUIZ-003** Charger exactement `applications.form_version_id`.
- [ ] **P0 QUIZ-004** Charger questions par `form_questions.question_order`.

Branches acces:

- [ ] **P0 QUIZ-005** Token quiz invalide: refuser.
- [ ] **P0 QUIZ-006** Quiz deja soumis: afficher resultat ou interdire reprise.
- [ ] **P1 QUIZ-007** Candidature abandonnee: refuser ou proposer reprise selon `application_abandoned`.

## 8.2 Reponses et scoring

- [ ] **P0 QUIZ-008** Enregistrer chaque reponse dans `candidate_answer`.
- [ ] **P0 QUIZ-009** Pour choix fixe: remplir `answer_id` et `is_selected`.
- [ ] **P1 QUIZ-010** Pour texte libre: remplir `free_text_response`.
- [ ] **P0 QUIZ-011** Calculer `applications.quiz_score` et `quiz_score_percent`.
- [ ] **P0 QUIZ-012** Mettre a jour `time_elapsed`, `total_questions`, `quiz_status`.
- [ ] **P0 QUIZ-013** Mettre a jour le stage `application_progress` de type `QUIZ`.

Branches resultat:

- [ ] **P0 QUIZ-014** Score suffisant: stage QUIZ passe en `PASSED`.
- [ ] **P0 QUIZ-015** Score insuffisant sur stage eliminatoire: stage `FAILED` et candidature refusee ou bloquee.
- [ ] **P1 QUIZ-016** Quiz partiellement rempli: statut `IN_PROGRESS` ou abandon selon delai.
- [ ] **P1 QUIZ-017** Temps depasse: soumission automatique ou echec selon choix metier.

---

# 9. Initialisation et avancement pipeline candidat

Tables: `application_progress`, `pipeline_stage`, `applications`, `decisions`.

## 9.1 Initialisation a la candidature

- [ ] **P0 PROG-001** A creation candidature, creer une ligne `application_progress` pour chaque `pipeline_stage` du template campagne.
- [ ] **P0 PROG-002** Premier stage passe en `IN_PROGRESS` ou `PASSED` selon logique candidature.
- [ ] **P0 PROG-003** Les autres stages restent `PENDING`.
- [ ] **P0 PROG-004** Respecter l'ordre `pipeline_stage.stage_order`.

Branches:

- [ ] **P0 PROG-005** Si campagne sans pipeline template: utiliser template par defaut ou bloquer ouverture campagne.
- [ ] **P1 PROG-006** Si pipeline modifie apres candidature: ne pas casser les progress existants; migrer seulement avec action explicite.

## 9.2 Action recruteur sur une etape

Champs: `progress_status`, `started_at`, `completed_at`, `score`, `notes`, `decided_by`.

- [ ] **P0 PROG-007** Recruteur doit avoir `ADVANCE_PIPELINE` ou permission entite.
- [ ] **P0 PROG-008** Passer une etape de `PENDING` a `IN_PROGRESS`.
- [ ] **P0 PROG-009** Passer une etape a `PASSED`, `FAILED` ou `SKIPPED`.
- [ ] **P0 PROG-010** Renseigner `decided_by`, `completed_at`, `notes` si decision humaine.

Branches:

- [ ] **P0 PROG-011** Etape requise non terminee: impossible d'aller a la decision finale, sauf override admin.
- [ ] **P0 PROG-012** Etape eliminatoire echouee: candidature passe en echec/refus selon regle.
- [ ] **P1 PROG-013** Etape optionnelle: peut passer en `SKIPPED`.
- [ ] **P1 PROG-014** Retour en arriere: autorise seulement admin ou permission speciale.

---

# 10. Preselection et decisions

Tables: `decisions`, `applications`, `application_progress`, `email_template`.

## 10.1 Decision sur une etape

Champs: `decision_type`, `is_cancel`, `application_id`, `user_id`, `pipeline_stage_id`.

- [ ] **P0 DEC-001** Creer une decision pour accepter/refuser/mettre en attente un candidat.
- [ ] **P0 DEC-002** Lier la decision a `application_id`.
- [ ] **P0 DEC-003** Lier la decision a `pipeline_stage_id` si elle concerne une etape precise.
- [ ] **P0 DEC-004** Mettre `user_id` ou `created_by` pour tracer le recruteur.
- [ ] **P0 DEC-005** Synchroniser `application_progress` et `applications.application_status`.

Branches:

- [ ] **P0 DEC-006** Decision positive: stage passe `PASSED`, ouvrir stage suivant.
- [ ] **P0 DEC-007** Decision negative: stage passe `FAILED`, candidature refusee si eliminatoire.
- [ ] **P1 DEC-008** Decision annulee: creer ou marquer `is_cancel = true`, ne pas supprimer l'historique.
- [ ] **P1 DEC-009** Decision finale: envoyer email final si template actif et `final_decision_mail_sent = false`.
- [ ] **P1 DEC-010** Decision preselection: envoyer email si `pre_screen_decision_mail_sent = false`.

---

# 11. Entretien

Tables: `interviews`, `candidate_interview`, `interview_participant`, `evaluations`, `entity_permission`, `notifications`.

## 11.1 Planification entretien

- [ ] **P0 INT-001** Depuis une candidature/stage INTERVIEW, recruteur planifie entretien.
- [ ] **P0 INT-002** Creer `interviews` avec date, type, lieu ou lien, campagne, application.
- [ ] **P0 INT-003** Creer ou lier `candidate_interview` pour le candidat.
- [ ] **P1 INT-004** Ajouter participants/evaluateurs via `interview_participant`.
- [ ] **P1 INT-005** Donner permissions d'evaluation via `entity_permission` ou logique participant.
- [ ] **P0 INT-006** Envoyer email convocation et mettre `interview_mail_sent = true`.

Branches entretien:

- [ ] **P0 INT-007** Entretien presentiel: utiliser `interview_location`.
- [ ] **P0 INT-008** Entretien visio: utiliser `meet_link`.
- [ ] **P1 INT-009** Entretien sans evaluateur: autoriser creation mais afficher alerte.
- [ ] **P1 INT-010** Email non envoye: garder entretien mais indiquer erreur/retry.

## 11.2 Reponse candidat a l'entretien

Champs: `candidate_interview.decline_reason`, `alternative_date_requested`.

- [ ] **P1 INT-011** Candidat accepte: entretien reste planifie.
- [ ] **P1 INT-012** Candidat decline: remplir `decline_reason`.
- [ ] **P1 INT-013** Candidat demande autre date: remplir `alternative_date_requested`.
- [ ] **P1 INT-014** Recruteur voit la demande et peut replanifier.

Branches:

- [ ] **P1 INT-015** Replanification acceptee: modifier date/lien et renvoyer convocation.
- [ ] **P1 INT-016** Replanification refusee: garder statut refuse/annule selon choix metier.

## 11.3 Evaluation entretien

Tables: `evaluations`, `interviews`, `applications`.

- [ ] **P0 EVAL-001** Evaluateur autorise saisit `candidate_mark` et `recruiter_comment`.
- [ ] **P0 EVAL-002** Rattacher evaluation a `candidate_interview_id`.
- [ ] **P0 EVAL-003** Recalculer `interviews.evaluation_score`, `evaluation_number`, `evaluation_percentage`.
- [ ] **P0 EVAL-004** Recalculer `applications.total_evaluation_score`, `total_evaluation_number`, `total_evaluation_percentage`.
- [ ] **P0 EVAL-005** Mettre a jour stage `EVALUATION` ou `INTERVIEW` dans `application_progress`.

Branches:

- [ ] **P1 EVAL-006** Plusieurs evaluateurs: moyenne ou somme selon regle choisie.
- [ ] **P1 EVAL-007** Evaluation modifiee: recalculer agregats.
- [ ] **P1 EVAL-008** Evaluateur non autorise: refuser cote back.

---

# 12. Candidat apres candidature

Tables: `candidate_ask`, `applications`, `notifications`, `candidate_token`.

## 12.1 Demande de correction candidat

- [ ] **P1 ASK-001** Candidat demande changement email/telephone/nom via `candidate_ask`.
- [ ] **P1 ASK-002** Recruteur/admin valide ou refuse la demande.
- [ ] **P1 ASK-003** Si valide: appliquer `new_email`, `new_phone`, `first_name`, `last_name` sur `applications`.
- [ ] **P2 ASK-004** Notifier candidat du resultat.

Branches:

- [ ] **P1 ASK-005** Si changement email: refaire verification email.
- [ ] **P2 ASK-006** Si demande invalide: refuser avec motif.

## 12.2 Reprise de parcours candidat

- [ ] **P1 TOK-001** Clarifier usage de `candidate_token` vs `visit_token` vs `quiz_token`.
- [ ] **P1 TOK-002** Candidat peut reprendre via token valide.
- [ ] **P1 TOK-003** Token expire/invalide: refuser et proposer contact recruteur.

---

# 13. Notifications et emails metier

Tables: `notifications`, `email_template`, `smtp_config`, `email_template_preset`.

## 13.1 Notifications internes

- [ ] **P1 NOTIF-001** Nouvelle candidature: notifier recruteurs autorises.
- [ ] **P1 NOTIF-002** Demande de groupe: notifier moderateurs/admins.
- [ ] **P1 NOTIF-003** Entretien decline: notifier recruteur.
- [ ] **P1 NOTIF-004** Evaluation terminee: notifier responsable campagne si utile.
- [ ] **P2 NOTIF-005** Marquer lu/non lu via `notifications.is_read`.

## 13.2 Emails externes

- [ ] **P0 EMAIL-001** Invitation utilisateur.
- [ ] **P0 EMAIL-002** Verification candidature.
- [ ] **P0 EMAIL-003** Convocation entretien.
- [ ] **P1 EMAIL-004** Decision preselection.
- [ ] **P0 EMAIL-005** Decision finale.
- [ ] **P1 EMAIL-006** Reset password.

Branches email:

- [ ] **P0 EMAIL-007** Si template actif existe: envoyer avec variables.
- [ ] **P0 EMAIL-008** Si SMTP actif absent: afficher erreur et garder action retry possible.
- [ ] **P1 EMAIL-009** Si variable manquante: ne pas envoyer email casse; logguer et alerter admin.
- [ ] **P1 EMAIL-010** Si email deja envoye: utiliser flags `*_mail_sent` pour eviter doublon.

---

# 14. Administration et configuration

Tables: `app_config`, `smtp_config`, `legal_text`, `email_template`, `email_template_preset`.

## 14.1 Branding et configuration globale

- [ ] **P1 ADMIN-001** Admin peut modifier `app_config.company_name`, `primary_color`, `color_scheme`.
- [ ] **P1 ADMIN-002** Admin peut choisir une seule config active.
- [ ] **P2 ADMIN-003** Nettoyer/sanitizer `logo_html` avant affichage.

## 14.2 SMTP

- [ ] **P0 ADMIN-004** Admin peut configurer SMTP sans exposer `password_encrypted` au front.
- [ ] **P1 ADMIN-005** Admin peut tester SMTP.
- [ ] **P1 ADMIN-006** Une seule config SMTP active.

## 14.3 Textes legaux

- [ ] **P1 ADMIN-007** Admin peut editer consentement candidat, politique de confidentialite, conditions d'utilisation.
- [ ] **P1 ADMIN-008** Le front public lit les textes actifs depuis la BD.

## 14.4 Templates email

- [ ] **P1 ADMIN-009** Admin peut editer sujet/corps/variables.
- [ ] **P1 ADMIN-010** Admin peut choisir un preset.
- [ ] **P1 ADMIN-011** Admin peut preview un email avec donnees exemples.

---

# 15. Parcours de demo memoire de bout en bout

Ce parcours doit fonctionner sans manipulation SQL.

## 15.1 Scenario principal heureux

- [ ] **P0 DEMO-001** SUPER se connecte.
- [ ] **P0 DEMO-002** SUPER configure SMTP/templates minimum si necessaire.
- [ ] **P0 DEMO-003** SUPER invite un ADMIN ou recruteur.
- [ ] **P0 DEMO-004** L'invite accepte dans les temps et cree son compte.
- [ ] **P0 DEMO-005** ADMIN cree une specialite si necessaire.
- [ ] **P0 DEMO-006** ADMIN cree un pipeline template simple: CANDIDATURE -> QUIZ -> PRESELECTION -> INTERVIEW -> DECISION.
- [ ] **P0 DEMO-007** ADMIN cree une campagne ouverte avec ce pipeline.
- [ ] **P0 DEMO-008** ADMIN cree un formulaire, une version, des questions, des reponses.
- [ ] **P0 DEMO-009** ADMIN publie la version du formulaire.
- [ ] **P0 DEMO-010** Candidat postule avec CV et consentement.
- [ ] **P0 DEMO-011** Candidat verifie son email.
- [ ] **P0 DEMO-012** Candidat passe le quiz.
- [ ] **P0 DEMO-013** Recruteur consulte candidature, CV, score, reponses.
- [ ] **P0 DEMO-014** Recruteur avance le pipeline en preselection.
- [ ] **P0 DEMO-015** Recruteur planifie un entretien.
- [ ] **P0 DEMO-016** Evaluateur saisit une evaluation.
- [ ] **P0 DEMO-017** Recruteur prend une decision finale.
- [ ] **P0 DEMO-018** Candidat recoit l'email de decision.

## 15.2 Scenarios KO a montrer ou tester

- [ ] **P0 KO-001** Invitation expiree: inscription refusee + relance possible.
- [ ] **P0 KO-002** Candidature sur campagne fermee: refusee proprement.
- [ ] **P0 KO-003** Candidat non verifie: quiz inaccessible.
- [ ] **P0 KO-004** Utilisateur sans permission: modification campagne refusee.
- [ ] **P1 KO-005** Version formulaire verrouillee: modification cree nouvelle version.
- [ ] **P1 KO-006** Stage eliminatoire echoue: pipeline bloque/refuse.
- [ ] **P1 KO-007** Entretien decline avec date alternative: recruteur peut replanifier.

---

# 16. Decisions metier a trancher avant implementation massive

Ces points peuvent bloquer plusieurs ecrans si on ne choisit pas rapidement.

- [ ] **P0 DECIDE-001** Plusieurs formulaires par campagne: tous obligatoires, choix par source, choix recruteur, ou formulaire principal + secondaires ?
- [ ] **P0 DECIDE-002** Source officielle des permissions campagne: `entity_permission` ou `campaign_crud` ?
- [ ] **P1 DECIDE-003** Source officielle des droits entretien: `entity_permission`, `interview_participant`, ou `interview_crud` ?
- [ ] **P1 DECIDE-004** Source officielle du statut candidat: `applications.application_status` ou agregation `application_progress` ?
- [ ] **P1 DECIDE-005** Tokens candidat: garder `candidate_token`, `visit_token`, `quiz_token`, `email_verification_tokens` avec roles separes ou simplifier ?
- [ ] **P1 DECIDE-006** Score final: quelle ponderation entre quiz, entretien, evaluation humaine ?
- [ ] **P2 DECIDE-007** Pipeline template utilise: verrouillage simple ou vrai versioning des templates ?

---

# 17. Ordre conseille pour implementation progressive

## Lot 1 - Auth, invitations, permissions minimales

- [ ] **P0 LOT1-001** Invitation utilisateur complete.
- [ ] **P0 LOT1-002** Connexion + role + menus selon permissions.
- [ ] **P0 LOT1-003** Permissions campagne minimum.

## Lot 2 - Campagne + formulaire versionne

- [ ] **P0 LOT2-001** Creation campagne avec pipeline.
- [ ] **P0 LOT2-002** Creation formulaire + version + questions/reponses.
- [ ] **P0 LOT2-003** Publication/verrouillage version.

## Lot 3 - Candidature + quiz

- [ ] **P0 LOT3-001** Page candidature publique.
- [ ] **P0 LOT3-002** Verification email.
- [ ] **P0 LOT3-003** Passage quiz + sauvegarde reponses + score.

## Lot 4 - Pipeline + decisions

- [ ] **P0 LOT4-001** Initialisation `application_progress`.
- [ ] **P0 LOT4-002** Avancement pipeline recruteur.
- [ ] **P0 LOT4-003** Decisions liees aux stages.

## Lot 5 - Entretiens + evaluations

- [ ] **P0 LOT5-001** Planification entretien.
- [ ] **P1 LOT5-002** Participants/evaluateurs.
- [ ] **P0 LOT5-003** Evaluation + agregats.

## Lot 6 - Admin et polish memoire

- [ ] **P1 LOT6-001** Emails configurables.
- [ ] **P1 LOT6-002** Groupes metiers + demandes.
- [ ] **P1 LOT6-003** Notifications.
- [ ] **P2 LOT6-004** Branding et textes legaux administrables.
