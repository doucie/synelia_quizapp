# Phase 7 — Implémentation détaillée : Réorganisation des diagrammes

> Objectif : aligner les diagrammes Merise sur la BD réelle (`quizapp_db_described_20260818.md`),
> en respectant les conventions Merise (MCD/MLD en français, MPD en anglais).
> Les anciens diagrammes sont préservés dans `archive/`.

---

## Étape 0 — Fix build

**Fichier** : `tsconfig.json`

Ajouter `"ignoreDeprecations": "6.0"` dans `compilerOptions` pour corriger l'erreur TypeScript 6.0 sur `baseUrl`.

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    ...
  }
}
```

**Validation** : `npm run build` passe

---

## Étape 1 — Ajouter la catégorie `archive`

### `src/types/index.ts`

```diff
- export type Category = 'mcd' | 'mld' | 'mpd' | 'traitements' | 'reference' | 'palette' | 'mot'
+ export type Category = 'mcd' | 'mld' | 'mpd' | 'traitements' | 'archive' | 'mot' | 'palette'
```

### `src/components/Sidebar.tsx`

```diff
  const categories: { label: string; key: Category }[] = [
-   { label: 'MCD — Conceptuel', key: 'mcd' },
-   { label: 'MLD — Logique', key: 'mld' },
-   { label: 'MPD — Physique', key: 'mpd' },
+   { label: 'MCD — Conceptuel', key: 'mcd' },       // nouveaux
+   { label: 'MLD — Logique', key: 'mld' },           // nouveaux
+   { label: 'MPD — Physique', key: 'mpd' },          // nouveaux
    { label: 'Traitements', key: 'traitements' },
    { label: 'MOT', key: 'mot' },
-   { label: 'Anciennes figures', key: 'reference' },
+   { label: 'Anciennes figures', key: 'archive' },
    { label: 'Palette', key: 'palette' },
  ]

  const categoryIcons: Record<Category, string> = {
    ...
+   archive: '◀',
  }
```

**Validation** : `npm run build` passe

---

## Étape 2 — Déplacer les anciens diagrammes

### 2.1 Créer `src/diagrams/archive/`

### 2.2 Déplacer les fichiers MCD/MLD/MPD

| Source | Destination |
|--------|-------------|
| `mcd/identite_permissions.ts` | `archive/mcd_identite_permissions.ts` |
| `mcd/identite_permissions_moderne.ts` | `archive/mcd_identite_permissions_moderne.ts` |
| `mcd/campagnes_pipeline.ts` | `archive/mcd_campagnes_pipeline.ts` |
| `mcd/candidature_quiz.ts` | `archive/mcd_candidature_quiz.ts` |
| `mcd/entretien_evaluation.ts` | `archive/mcd_entretien_evaluation.ts` |
| `mcd/audit_notifications.ts` | `archive/mcd_audit_notifications.ts` |
| `mld/identite_permissions.ts` | `archive/mld_identite_permissions.ts` |
| `mld/campagnes_pipeline.ts` | `archive/mld_campagnes_pipeline.ts` |
| `mld/candidature_quiz.ts` | `archive/mld_candidature_quiz.ts` |
| `mld/entretien_evaluation.ts` | `archive/mld_entretien_evaluation.ts` |
| `mld/audit_notifications.ts` | `archive/mld_audit_notifications.ts` |
| `mpd/identite_permissions.ts` | `archive/mpd_identite_permissions.ts` |
| `mpd/campagnes_pipeline.ts` | `archive/mpd_campagnes_pipeline.ts` |
| `mpd/candidature_quiz.ts` | `archive/mpd_candidature_quiz.ts` |
| `mpd/entretien_evaluation.ts` | `archive/mpd_entretien_evaluation.ts` |
| `mpd/audit_notifications.ts` | `archive/mpd_audit_notifications.ts` |

### 2.3 Déplacer les traitements v1

| Source | Destination |
|--------|-------------|
| `traitements/mct_0b_creation_campagne.ts` | `archive/mct_0b_creation_campagne.ts` |
| `traitements/mct_1_candidature_quiz.ts` | `archive/mct_1_candidature_quiz.ts` |
| `traitements/mct_1a_candidature.ts` | `archive/mct_1a_candidature.ts` |
| `traitements/mct_1b_quiz.ts` | `archive/mct_1b_quiz.ts` |
| `traitements/mct_2_entretien_evaluation.ts` | `archive/mct_2_entretien_evaluation.ts` |
| `traitements/mct_3_decision_audit.ts` | `archive/mct_3_decision_audit.ts` |
| `traitements/mct_3a_decision.ts` | `archive/mct_3a_decision.ts` |
| `traitements/mct_3b_rollback.ts` | `archive/mct_3b_rollback.ts` |
| `traitements/mct_3c_audit.ts` | `archive/mct_3c_audit.ts` |
| `traitements/sat_1_setup_preselection.ts` | `archive/sat_1_setup_preselection.ts` |
| `traitements/sat_2_entretien_audit.ts` | `archive/sat_2_entretien_audit.ts` |
| `traitements/mpt_1_candidature_quiz.ts` | `archive/mpt_1_candidature_quiz.ts` |
| `traitements/mpt_2_entretien_decision.ts` | `archive/mpt_2_entretien_decision.ts` |

### 2.4 Déplacer le MOT et la palette

| Source | Destination |
|--------|-------------|
| `mot/mot_organisationnel_v2.ts` | `archive/mot_v2.ts` |
| `palette/color_palette.ts` | `archive/color_palette.ts` |
| `mot/mot_organisationnel.ts` | **SUPPRIMÉ** (MOT v1 inutile) |

### 2.5 Fichiers restant en place (pas déplacés)

- `traitements/v2/mct_0_creation_campagne.ts`
- `traitements/v2/mct_1_candidature.ts`
- `traitements/v2/mct_2_quiz.ts`
- `traitements/v2/mct_3_entretien.ts`
- `traitements/v2/mct_4_decision.ts`
- `traitements/v2/mct_5_annulation.ts`
- `traitements/v2/mct_6_audit.ts`

### 2.6 Mettre à jour `src/diagrams/index.ts`

Réécrire le fichier avec :
- Imports des fichiers `archive/` (category `'archive'`)
- Imports des MCT v2 (category `'traitements'`)
- Imports du MOT v2 (category `'mot'`)
- Les anciens dossiers `mcd/`, `mld/`, `mpd/` vides → supprimés

**Validation** : `npm run build` passe, sidebar affiche "Anciennes figures" avec tous les anciens diagrammes

---

## Étape 3 — Créer les 24 nouveaux diagrammes

### Structure

```
src/diagrams/nouveau/
├── mcd/
│   ├── utilisateurs_droits.ts
│   ├── campagnes_pipeline.ts
│   ├── candidatures_suivi.ts
│   ├── contenu_quiz.ts
│   ├── passation_quiz.ts
│   ├── entretiens_evaluation.ts
│   ├── communication.ts
│   └── config_systeme.ts
├── mld/
│   ├── utilisateurs_droits.ts
│   ├── campagnes_pipeline.ts
│   ├── candidatures_suivi.ts
│   ├── contenu_quiz.ts
│   ├── passation_quiz.ts
│   ├── entretiens_evaluation.ts
│   ├── communication.ts
│   └── config_systeme.ts
└── mpd/
    ├── utilisateurs_droits.ts
    ├── campagnes_pipeline.ts
    ├── candidatures_suivi.ts
    ├── contenu_quiz.ts
    ├── passation_quiz.ts
    ├── entretiens_evaluation.ts
    ├── communication.ts
    └── config_systeme.ts
```

### Conventions de nommage

| Niveau | Entités | Attributs | Exemple |
|--------|---------|-----------|---------|
| MCD | MAJUSCULES, français | snake_case, français | `CANDIDAT.prenom_candidat` |
| MLD | MAJUSCULES, français | snake_case, français | `CANDIDAT.prenom_candidat` |
| MPD | snake_case, anglais | snake_case, anglais | `applications.candidate_first_name` |

### Pattern de fichier

```typescript
import type { DiagramDefinition } from '../../../types'

export const utilisateursDroits: DiagramDefinition = {
  id: 'mcd-utilisateurs-droits',  // mcd-*, mld-*, mpd-*
  title: 'Utilisateurs & droits',
  category: 'mcd',                // 'mcd', 'mld', ou 'mpd'
  domain: 'Utilisateurs & droits',
  nodes: [
    {
      id: 'utilisateur',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'UTILISATEUR',     // MCD/MLD: MAJUSCULES FR | MPD: snake_case EN
        variant: 'mcd',           // 'mcd', 'mld', ou 'mpd'
        attributes: [
          { name: 'id_utilisateur', isPK: true },
          { name: 'nom' },
          // ...
        ],
      },
    },
    // ...
  ],
  edges: [
    // ...
  ],
}
```

---

### Domaine 1 — Utilisateurs & droits

#### MCD (`nouveau/mcd/utilisateurs_droits.ts`)

**Entités** : 6

| Entité | Attributs | Notes |
|--------|-----------|-------|
| `UTILISATEUR` | id_utilisateur (PK), nom, prenom, email, username, role_systeme | |
| `GROUPE_METIER` | id_groupe (PK), libelle_groupe, description | |
| `PERMISSION_ENTITE` | id_permission (PK), type_entite, id_entite, cle_permission | |
| `GROUPE_PERMISSION` | (jonction GROUPE_METIER ↔ PERMISSION_ENTITE) | badge JONCTION |
| `PERMISSION_UTILISATEUR` | est_autorise (attribut de l'association) | jonction UTILISATEUR ↔ PERMISSION_ENTITE |
| `DEMANDE_CHANGEMENT_GROUPE` | id_demande (PK), raison, statut | |

**Associations** :
- UTILISATEUR `appartenir` GROUPE_METIER (0,n — 0,n)
- GROUPE_METIER `posseder` PERMISSION_ENTITE (1,1 — 0,n)
- UTILISATEUR `disposer` PERMISSION_ENTITE (0,n — 0,n)
- UTILISATEUR `soumettre` DEMANDE_CHANGEMENT_GROUPE (1,1 — 0,n)

#### MLD (`nouveau/mld/utilisateurs_droits.ts`)

**Tables** : 9

| Table | Colonnes | Notes |
|-------|----------|-------|
| `utilisateur` | id (PK), nom, prenom, email (UNI), username (UNI), role_systeme | |
| `groupe_metier` | id (PK), libelle_groupe (UNI), description | |
| `permission_entite` | id (PK), utilisateur_id (FK), groupe_id (FK), type_entite, id_entite, cle_permission | |
| `system_role_permission` | id (PK), system_role (FK), fonctionnalite | |
| `groupe_permission` | id (PK), groupe_id (FK), fonctionnalite | |
| `utilisateur_groupe` | id (PK), utilisateur_id (FK), groupe_id (FK), est_moderateur | JONCTION |
| `utilisateur_permission` | id (PK), utilisateur_id (FK), fonctionnalite, est_autorise | |
| `demande_changement_groupe` | id (PK), utilisateur_id (FK), groupe_cible_id (FK), raison, statut, date_demande, date_traitement, traite_par (FK) | |
| `code_invitation` | id (PK), email, role, code (UNI), est_utilise, date_expiration, cree_par (FK) | |

#### MPD (`nouveau/mpd/utilisateurs_droits.ts`)

**Tables** : 9 — idem MLD + types SQL

| Table | Types SQL notables |
|-------|-------------------|
| `user` | `int unsigned` PK, `varchar(100)` nom, `varchar(500)` prenom, `varchar(50)` username UNI, `varchar(255)` email UNI, `varchar(20)` phone, `varchar(255)` password, `tinyint(1)` is_default_password, `varchar(20)` user_role, `tinyint(1)` is_online, `tinyint(1)` is_locked, `datetime` last_connection_date, `tinyint(1)` admin_mode, `int` page_size_preference |
| `business_group` | `int` PK, `varchar(100)` group_name UNI, `text` group_desc |
| `entity_permission` | `int` PK, `int unsigned` user_id FK, `int` business_group_id FK, `varchar(20)` system_role FK, `varchar(50)` entity_type, `int` entity_id, `varchar(50)` permission_key |
| `system_role_permission` | `int` PK, `varchar(20)` system_role FK, `varchar(100)` fonctionnalite |
| `business_group_permission` | `int` PK, `int` business_group_id FK, `varchar(100)` fonctionnalite |
| `user_business_group` | `int` PK, `int unsigned` user_id FK, `int` business_group_id FK, `tinyint(1)` is_moderator |
| `user_permission_override` | `int` PK, `int unsigned` user_id FK, `varchar(100)` fonctionnalite, `tinyint(1)` is_allowed |
| `group_change_request` | `int` PK, `int unsigned` user_id FK, `int` target_group_id FK, `text` reason, `enum('PENDING','APPROVED','REJECTED')` status, `timestamp` requested_at, `timestamp` processed_at, `int unsigned` processed_by FK |
| `invitation_code` | `bigint` PK, `varchar(255)` email, `varchar(30)` role, `varchar(50)` code UNI, `bit(1)` is_used, `datetime` expired_at, `int unsigned` created_by FK |

---

### Domaine 2 — Campagnes & pipeline

#### MCD (`nouveau/mcd/campagnes_pipeline.ts`)

**Entités** : 8

| Entité | Attributs |
|--------|-----------|
| `CAMPAGNE` | id_campagne (PK), titre, description, statut, date_debut, date_fin, max_candidatures, chronometree, est_publiee, est_archivee, max_tentatives, toutes_repondent_evaluent |
| `MODELE_PIPELINE` | id_modele (PK), libelle_modele, est_defaut, est_actif, est_verrouille |
| `ETAPE_PIPELINE` | id_etape (PK), type_etape, libelle_etape, ordre_etape, est_requise, est_elimatoire, est_active, config |
| `REGLE_NOTIFICATION` | id_regle (PK), code_declencheur, code_resultat, est_requise, est_automatique, confirmation_manuelle |
| `FORMULAIRE` | id_formulaire (PK), nom, description, est_actif, chronometre |
| `VERSION_FORMULAIRE` | id_version (PK), numero_version, est_publiee, est_verrouillee, questions_aleatoires |
| `QUESTION` | id_question (PK), enonce, type, score, chrono, difficulte, correction_manuelle |
| `REPONSE` | id_reponse (PK), texte, est_correcte, type_reponse, ordre, commentaire_autorise |

**Associations** :
- CAMPAGNE `utiliser` MODELE_PIPELINE (0,n — 1,1)
- MODELE_PIPELINE `definir` ETAPE_PIPELINE (1,1 — 1,n) forte
- ETAPE_PIPELINE `declencher` REGLE_NOTIFICATION (1,1 — 0,n)
- CAMPAGNE `proposer` FORMULAIRE (1,n — 1,n)
- FORMULAIRE `versionner` VERSION_FORMULAIRE (1,1 — 1,n) forte
- VERSION_FORMULAIRE `contenir` QUESTION (1,n — 1,n)
- QUESTION `proposer` REPONSE (1,1 — 0,n) forte
- CAMPAGNE `generer` SOURCE_TOKEN (1,1 — 0,n)

#### MLD/MPD

**Tables** : 11 (8 entités + 3 jonctions)

| Table | Type |
|-------|------|
| `campaigns` | entite |
| `pipeline_template` | entite |
| `pipeline_stage` | entite |
| `pipeline_stage_notification_rule` | entite |
| `form` | entite |
| `form_version` | entite |
| `question` | entite |
| `answer` | entite |
| `source_token` | entite |
| `campaign_form` | JONCTION |
| `form_questions` | JONCTION |

---

### Domaine 3 — Candidatures & suivi

#### MCD (`nouveau/mcd/candidatures_suivi.ts`)

**Entités** : 5

| Entité | Attributs |
|--------|-----------|
| `CANDIDATURE` | id_candidature (PK), prenom_candidat, nom_candidat, email, telephone, cv, lettre_motivation, date_naissance, email_verifie, est_abandonnee |
| `AVANCEMENT` | id_avancement (PK), statut_progression, date_debut, date_fin, score, notes, date_validation, commentaire_validation, date_saut, raison_saut, date_reouverture, raison_reouverture |
| `TOKEN_CANDIDAT` | id_token (PK), chaine_token |
| `DEMANDE_CANDIDAT` | id_demande (PK), type_demande, statut_demande, est_verifie, prenom, nom, nouvel_email, nouveau_telephone, raison_decision |
| `DECISION` | id_decision (PK), type_decision, justification, mode_decision |

**Associations** :
- CANDIDATURE `progresser` AVANCEMENT (1,1 — 1,n) forte
- CANDIDATURE `emettre` DEMANDE_CANDIDAT (1,1 — 0,n)
- AVANCEMENT `conclure` DECISION (1,1 — 0,n) forte
- CANDIDATURE `generer` TOKEN_CANDIDAT (1,1 — 0,n)

#### MLD/MPD

**Tables** : 5

| Table | FK notables |
|-------|-------------|
| `applications` | source_token_id, form_version_id, current_application_progress_id, current_pipeline_stage_id |
| `application_progress` | application_id, pipeline_stage_id, validated_by, skipped_by, reopened_by |
| `candidate_token` | application_id |
| `candidate_ask` | application_id |
| `decisions` | application_progress_id, user_id, cancels_decision_id |

---

### Domaine 4 — Contenu du quiz

#### MCD (`nouveau/mcd/contenu_quiz.ts`)

**Entités** : 5 (FORMULAIRE et VERSION_FORMULAIRE sont dans le domaine Campagnes — on ne les duplique pas)

| Entité | Attributs |
|--------|-----------|
| `QUESTION` | id_question (PK), enonce, type, score, chrono, difficulte, place_reponse_libre, justification_requise |
| `REPONSE` | id_reponse (PK), texte, est_correcte, type_reponse, ordre, commentaire_autorise, commentaire_obligatoire, placeholder_commentaire |
| `FORMULAIRE` | (référence au domaine Campagnes) |
| `VERSION_FORMULAIRE` | (référence au domaine Campagnes) |
| `QUESTION_FORMULAIRE` | (jonction VERSION_FORMULAIRE ↔ QUESTION) |

> Note : au MCD, on montre les entités QUESTION et REPONSE avec leurs attributs conceptuels.
> FORMULAIRE/VERSION_FORMULAIRE sont déjà dans le domaine Campagnes. Au MLD/MPD,
> les mêmes tables apparaissent naturellement dans les deux diagrammes.

#### MLD/MPD

**Tables** : 5

| Table | Notes |
|-------|-------|
| `form` | identique au domaine Campagnes |
| `form_version` | identique |
| `question` | toutes les colonnes |
| `answer` | toutes les colonnes |
| `form_questions` | JONCTION |

---

### Domaine 5 — Passation du quiz

#### MCD (`nouveau/mcd/passation_quiz.ts`)

**Entités** : 3

| Entité | Attributs |
|--------|-----------|
| `TENTATIVE_QUIZ` | id_tentative (PK), token_quiz, statut_quiz, mode_screening, seuil_screening, resultat_screening, score, score_pourcent, statut_correction_manuelle, total_questions, temps_ecoule, snapshot_chronometre |
| `REPONSE_CANDIDAT` | id_reponse_candidat (PK), est_selectionnee, texte_libre, correction_manuelle, commentaire_correction, score_correction |
| `EVENEMENT_ANTI_TRICHE` | id_evenement (PK), type_evenement, date_survenance, metadonnees |

**Associations** :
- TENTATIVE_QUIZ `comprendre` REPONSE_CANDIDAT (1,1 — 0,n) forte
- TENTATIVE_QUIZ `enregistrer` EVENEMENT_ANTI_TRICHE (1,1 — 0,n)

#### MLD/MPD

**Tables** : 3

| Table | Colonnes clés |
|-------|---------------|
| `application_quiz_attempt` | application_id FK, application_progress_id FK, form_version_id FK, quiz_token, quiz_status, screening_mode/threshold/result, tab_switch_count, fullscreen_exit_count, cheat_flag_count, score, score_percent, manual_correction_status, total_questions, time_elapsed, timed_snapshot |
| `candidate_answer` | application_quiz_attempt_id FK, question_id FK, answer_id FK, is_selected, free_text_response, manual_is_correct, manual_correction_comment, manual_correction_score |
| `quiz_anti_cheat_event` | application_quiz_attempt_id FK, event_type, occurred_at, metadata |

---

### Domaine 6 — Entretiens & évaluation

#### MCD (`nouveau/mcd/entretiens_evaluation.ts`)

**Entités** : 6

| Entité | Attributs |
|--------|-----------|
| `ENTRETIEN` | id_entretien (PK), date, type, lieu, lien_visio, statut, code_salle, notes, date_debut, date_fin, date_evaluation, date_fermeture, commentaire_fermeture |
| `CANDIDAT_ENTRETIEN` | id_candidat_entretien (PK), statut_reponse, motif_refus, duree, date_reponse, date_alternative_demandee |
| `PARTICIPANT_ENTRETIEN` | id_participant (PK), peut_modifier, peut_supprimer, peut_evaluer, est_admin, suit, statut_evaluation, est_en_ligne, a_termine |
| `EVALUATION` | id_evaluation (PK), statut, date_soumission, score_global, commentaire_global, date_validation |
| `ITEM_EVALUATION` | id_item (PK), valeur_score, valeur_texte, poids_instantane, score_max_instantane |
| `GRILLE_MODELE` | id_grille (PK), libelle, description, est_active |

**Associations** :
- ENTRETIEN `convoquer` CANDIDAT_ENTRETIEN (1,1 — 1,n) forte
- ENTRETIEN `inclure` PARTICIPANT_ENTRETIEN (1,1 — 1,n)
- ENTRETIEN `recevoir` EVALUATION (1,1 — 0,n) forte
- EVALUATION `contenir` ITEM_EVALUATION (1,1 — 1,n) forte
- ITEM_EVALUATION `evaluer` CRITERE_GRILLE (n,1 — 1,1)
- CRITERE_GRILLE `appartenir` GRILLE_MODELE (0,n — 0,1)

#### MLD/MPD

**Tables** : 8

| Table | Notes |
|-------|-------|
| `interviews` | application_progress_id FK (PAS de campaign_id) |
| `candidate_interview` | interview_id FK |
| `interview_participant` | interview_id FK, user_id FK |
| `evaluations` | candidate_interview_id FK, interview_participant_id FK |
| `evaluation_item` | evaluation_id FK, evaluation_grid_template_item_id FK |
| `evaluation_grid_template` | template_name, template_desc, is_active |
| `evaluation_grid_template_version` | evaluation_grid_template_id FK, version_number, is_published, content_hash, locked_at |
| `evaluation_grid_template_item` | evaluation_grid_template_version_id FK, criterion_order, label, criterion_type, max_score, weight, is_required, config_json |

---

### Domaine 7 — Communication

#### MCD (`nouveau/mcd/communication.ts`)

**Entités** : 6

| Entité | Attributs |
|--------|-----------|
| `MODELE_EMAIL` | id_modele (PK), cle_modele, sujet_modele, corps_modele, description, type_action, est_actif |
| `PRESET_MODELE_EMAIL` | id_preset (PK), nom, categorie, structure_html, description |
| `JOURNAL_EMAIL` | id_journal (PK), destinataire, sujet, statut, code_evenement, confirmation_requise, apercu_corps, message_erreur, date_envoi |
| `NOTIFICATION` | id_notification (PK), type, acteur, lien, est_lue, type_entite, id_entite, utilisateur |
| `TOKEN_VERIFICATION_EMAIL` | id_token (PK), email, token, type_token, date_expiration, est_utilise |
| `TEXTE_JURIDIQUE` | id_texte (PK), cle_texte, titre, contenu, description, est_actif |

**Associations** :
- MODELE_EMAIL `presenter` PRESET_MODELE_EMAIL (0,n — 0,1)
- JOURNAL_EMAIL `utiliser` MODELE_EMAIL (0,n — 0,1)

#### MLD/MPD

**Tables** : 6

| Table | Colonnes clés |
|-------|---------------|
| `email_template` | template_key UNI, subject_template, body_template, action_type, preset_id, is_active |
| `email_template_preset` | name, category (enum), html_structure, description |
| `mail_log` | application_id FK, interview_id FK, decision_id FK, notification_rule_id FK, recipient_user_id FK, sender_user_id FK, email_template_id FK, event_code, status, sent_at |
| `notifications` | notif_type, notif_actor, notif_link, is_read, object_table_name, object_table_id, user_id FK |
| `email_verification_tokens` | email, token UNI, token_type, expires_at, is_used, application_id FK, user_id FK |
| `legal_text` | text_key UNI, title, content, is_active |

---

### Domaine 8 — Config système

#### MCD (`nouveau/mcd/config_systeme.ts`)

**Entités** : 3

| Entité | Attributs |
|--------|-----------|
| `CONFIGURATION` | id_config (PK), nom_entreprise, lien_app, html_logo, couleur_principale, schema_couleur, comptes_candidats_actives, anti_triche_actif, politique_screening, max_avertissements_onglet, max_actions_onglet, plein_ecran_requis, bloquer_raccourcis, bloquer_copier_coller |
| `CONFIG_SMTP` | id_smtp (PK), hote, port, nom_utilisateur, authentification, expediteur_nom, expediteur_email, est_actif |
| `EVENEMENT_AUDIT` | id_evenement (PK), type_entite, id_entite, type_action, justification, etat_avant, etat_apres |

#### MLD/MPD

**Tables** : 3

| Table | Types SQL notables |
|-------|-------------------|
| `app_config` | `bigint` PK, `varchar(100)` config_name, `varchar(255)` company_name, `varchar(500)` app_link, `text` logo_html, `varchar(7)` primary_color, `varchar(30)` color_scheme, + champs anti-triche |
| `smtp_config` | `int unsigned` PK, `varchar(255)` host, `int` port, `varchar(255)` username, `varchar(500)` password_encrypted, + timeouts |
| `audit_event` | `int unsigned` PK, `int unsigned` application_id FK, `int unsigned` application_progress_id FK, `varchar(100)` entity_type, `varchar(100)` entity_id, `varchar(100)` action_type, `int unsigned` actor_user_id FK, `text` justification, `longtext` before_state_json, `longtext` after_state_json |

---

## Étape 4 — Mettre à jour le registre

**`src/diagrams/index.ts`** :

```typescript
import type { DiagramDefinition } from '../types'

// === Nouveaux diagrammes ===
import { utilisateursDroits as mcdUtilDroits } from './nouveau/mcd/utilisateurs_droits'
import { campagnesPipeline as mcdCampPipeline } from './nouveau/mcd/campagnes_pipeline'
import { candidaturesSuivi as mcdCandSuivi } from './nouveau/mcd/candidatures_suivi'
import { contenuQuiz as mcdContQuiz } from './nouveau/mcd/contenu_quiz'
import { passationQuiz as mcdPassQuiz } from './nouveau/mcd/passation_quiz'
import { entretiensEvaluation as mcdEntretEval } from './nouveau/mcd/entretiens_evaluation'
import { communication as mcdComm } from './nouveau/mcd/communication'
import { configSysteme as mcdConfSys } from './nouveau/mcd/config_systeme'

// ... (idem pour mld/* et mpd/*)

// === Traitements v2 ===
import { mct0CreationCampagne } from './traitements/v2/mct_0_creation_campagne'
// ... (7 fichiers v2)

// === MOT ===
import { motOrganisationnelV2 } from './archive/mot_v2'

// === Archive ===
import { identitePermissions as archMcdIdentite } from './archive/mcd_identite_permissions'
// ... (tous les fichiers archive)

export const diagrams: DiagramDefinition[] = [
  // --- Nouveaux MCD (8) ---
  mcdUtilDroits, mcdCampPipeline, mcdCandSuivi, mcdContQuiz,
  mcdPassQuiz, mcdEntretEval, mcdComm, mcdConfSys,
  // --- Nouveaux MLD (8) ---
  // ...
  // --- Nouveaux MPD (8) ---
  // ...
  // --- Traitements v2 (7) ---
  // ...
  // --- MOT (1) ---
  // ...
  // --- Archive (36) ---
  // ...
]
```

---

## Étape 5 — Vérification finale

1. `npm run build` — pas d'erreurs TypeScript
2. `npm run dev` — sidebar affiche :
   - MCD — Conceptuel (8 diagrammes)
   - MLD — Logique (8 diagrammes)
   - MPD — Physique (8 diagrammes)
   - Traitements (7 MCT v2)
   - MOT (1 MOT v2)
   - Anciennes figures (~36 diagrammes)
   - Palette (1)
3. Cliquer sur chaque diagramme → s'affiche correctement
4. Export SVG sur 1 diagramme par domaine
5. Persistance : rechargement → positions conservées

---

## Récapitulatif

| Étape | Fichiers modifiés | Fichiers créés | Fichiers déplacés | Supprimés |
|-------|-------------------|----------------|-------------------|-----------|
| 0 | 1 | 0 | 0 | 0 |
| 1 | 2 | 0 | 0 | 0 |
| 2 | 1 | 0 | 36 | 1 |
| 3 | 0 | 24 | 0 | 0 |
| 4 | 1 | 0 | 0 | 0 |
| 5 | 0 | 0 | 0 | 0 |
| **Total** | **4 uniques** | **24** | **36** | **1** |

**Fichiers modifiés** : `tsconfig.json`, `types/index.ts`, `Sidebar.tsx`, `diagrams/index.ts`
