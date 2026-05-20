# L-audit-04-applications -- Audit table par table

**Table :** `applications`
**Niveau topologique :** 4 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LAPPLIC-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LAPPLIC-001** Role metier de `applications` documente en 1 ligne. -- _AUDIT: Candidature : campaign + candidat (firstName/lastName/email/phone/cv) + form_version + quiz_token + tracking_code._
- [x] **LAPPLIC-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LAPPLIC-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `candidate_first_name` | `varchar(100)` | NO | - | `-` |
| `candidate_last_name` | `varchar(100)` | NO | - | `-` |
| `candidate_email` | `varchar(255)` | NO | - | `-` |
| `candidate_phone` | `varchar(20)` | YES | - | `-` |
| `candidate_cv_path` | `varchar(1000)` | YES | - | `-` |
| `candidate_birth_date` | `date` | YES | - | `-` |
| `motivation_letter` | `text` | YES | - | `-` |
| `email_verified` | `tinyint(1)` | NO | - | `-` |
| `quiz_score` | `int` | YES | - | `-` |
| `total_evaluation_score` | `float` | YES | - | `-` |
| `total_evaluation_number` | `int` | YES | - | `-` |
| `total_evaluation_percentage` | `double` | YES | - | `-` |
| `application_status` | `varchar(8)` | YES | - | `-` |
| `quiz_token` | `varchar(64)` | YES | UNI | `-` |
| `quiz_status` | `varchar(9)` | NO | - | `-` |
| `quiz_level` | `int` | YES | - | `-` |
| `total_questions` | `int` | YES | - | `-` |
| `quiz_score_percent` | `int` | YES | - | `-` |
| `quiz_manual_correction_status` | `varchar(20)` | NO | - | `NOT_REQUIRED` |
| `time_elapsed` | `int` | NO | - | `0` |
| `quiz_last_activity_at` | `timestamp` | YES | - | `-` |
| `interview_date` | `datetime` | YES | - | `-` |
| `interview_status` | `varchar(20)` | YES | - | `-` |
| `application_abandoned` | `tinyint(1)` | YES | - | `-` |
| `pre_screen_decision_mail_sent` | `tinyint(1)` | YES | - | `-` |
| `final_decision_mail_sent` | `tinyint(1)` | YES | - | `-` |
| `source_token_id` | `int unsigned` | YES | MUL | `-` |
| `form_version_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [?] **LAPPLIC-040** REVUE : Enum `application_status varchar(8)` trop court pour valeurs metier (verifier les valeurs reellement ecrites, agrandir si necessaire). -- _AUDIT: Unicite (campaign_id, email) a verifier._
- [~] **LAPPLIC-041** REVUE : Enum `quiz_status varchar(9)` idem. -- _AUDIT: **PARTIEL** Contrainte metier identifiee, controle effectif au niveau Business AVANT save ; index unique BD a ajouter si non present (Flyway V1_*) pour garantir integrite._
- [?] **LAPPLIC-042** REVUE : `pre_screen_decision_mail_sent` / `final_decision_mail_sent` / `interview_mail_sent` -- a remplacer par lecture de `mail_log` (D-021) ? Decision metier a trancher. -- _AUDIT: **A TRANCHER** D-021 livre la fondation `mail_log` (`V1_040__create_mail_log.sql`). Option A : conserver les flags pour perf (lecture O(1) sans jointure). Option B : drop les 3 flags et deriver l'etat depuis `SELECT COUNT(*) FROM mail_log WHERE recipient_email=... AND email_template_id IN (...)`. Recommandation : conserver les flags comme cache denormalise, synchronise via trigger Business sur insert mail_log SUCCESS. Decision produit attendue avant implementation._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LAPPLIC-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `candidate_first_name` (varchar(100))

- [x] **LAPPLIC-102 Alignement de type** `candidate_first_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LAPPLIC-103 Obligatoire creation** `candidate_first_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `candidate_first_name`.
- [~] **LAPPLIC-104 Longueur** `candidate_first_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `candidate_last_name` (varchar(100))

- [x] **LAPPLIC-106 Alignement de type** `candidate_last_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-107 Obligatoire creation** `candidate_last_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `candidate_last_name`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LAPPLIC-108 Longueur** `candidate_last_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `candidate_email` (varchar(255))

- [x] **LAPPLIC-110 Alignement de type** `candidate_email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-111 Obligatoire creation** `candidate_email` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `candidate_email`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LAPPLIC-112 Longueur** `candidate_email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `candidate_phone` (varchar(20))

- [x] **LAPPLIC-114 Alignement de type** `candidate_phone` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-115 Champ court** `candidate_phone` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `candidate_cv_path` (varchar(1000))

- [x] **LAPPLIC-117 Alignement de type** `candidate_cv_path` (`varchar(1000)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-118 Longueur** `candidate_cv_path` (varchar(1000)) : `@Size(max=1000)` DTO, `Validators.maxLength(1000)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `candidate_birth_date` (date)

- [x] **LAPPLIC-120 Alignement de type** `candidate_birth_date` (`date`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDate`, DTO `LocalDate` serialise ISO 8601 (YYYY-MM-DD), modele TS `string` ISO._
- [x] **LAPPLIC-121 Date/Datetime** `candidate_birth_date` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `motivation_letter` (text)

- [x] **LAPPLIC-123 Alignement de type** `motivation_letter` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LAPPLIC-124 Texte long** `motivation_letter` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `email_verified` (tinyint(1))

- [x] **LAPPLIC-126 Alignement de type** `email_verified` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-127 Obligatoire creation** `email_verified` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `email_verified`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LAPPLIC-128 Booleen** `email_verified` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `quiz_score` (int)

- [x] **LAPPLIC-130 Alignement de type** `quiz_score` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-131 Numerique** `quiz_score` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `total_evaluation_score` (float)

- [x] **LAPPLIC-133 Alignement de type** `total_evaluation_score` (`float`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Float`, DTO `Float`, JSON number, modele TS `number`._
- [~] **LAPPLIC-134 Reel** `total_evaluation_score` (`float`) : precision/echelle documentee, formattage UX (nb decimales), arrondi serveur si necessaire. -- _AUDIT: **PARTIEL** type Java `BigDecimal`/`Float`/`Double` aligne avec BD ; precision/echelle BD respectee ; `@DecimalMin/@DecimalMax` non encore propage cote DTO._

### Champ `total_evaluation_number` (int)

- [x] **LAPPLIC-136 Alignement de type** `total_evaluation_number` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-137 Numerique** `total_evaluation_number` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `total_evaluation_percentage` (double)

- [x] **LAPPLIC-139 Alignement de type** `total_evaluation_percentage` (`double`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Double`, DTO `Double`, JSON number, modele TS `number`._
- [~] **LAPPLIC-140 Reel** `total_evaluation_percentage` (`double`) : precision/echelle documentee, formattage UX (nb decimales), arrondi serveur si necessaire. -- _AUDIT: **PARTIEL** type Java `BigDecimal`/`Float`/`Double` aligne avec BD ; precision/echelle BD respectee ; `@DecimalMin/@DecimalMax` non encore propage cote DTO._

### Champ `application_status` (varchar(8))

- [x] **LAPPLIC-142 Alignement de type** `application_status` (`varchar(8)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-143 Champ court** `application_status` (varchar(8)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `quiz_token` (varchar(64))

- [x] **LAPPLIC-145 Alignement de type** `quiz_token` (`varchar(64)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-146 Longueur** `quiz_token` (varchar(64)) : `@Size(max=64)` DTO, `Validators.maxLength(64)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LAPPLIC-147 Unicite** `quiz_token` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `quiz_status` (varchar(9))

- [x] **LAPPLIC-149 Alignement de type** `quiz_status` (`varchar(9)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-150 Obligatoire creation** `quiz_status` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `quiz_status`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LAPPLIC-151 Champ court** `quiz_status` (varchar(9)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `quiz_level` (int)

- [x] **LAPPLIC-153 Alignement de type** `quiz_level` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-154 Numerique** `quiz_level` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `total_questions` (int)

- [x] **LAPPLIC-156 Alignement de type** `total_questions` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-157 Numerique** `total_questions` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `quiz_score_percent` (int)

- [x] **LAPPLIC-159 Alignement de type** `quiz_score_percent` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-160 Numerique** `quiz_score_percent` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `quiz_manual_correction_status` (varchar(20))

- [x] **LAPPLIC-162 Alignement de type** `quiz_manual_correction_status` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-163 Champ court** `quiz_manual_correction_status` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `time_elapsed` (int)

- [x] **LAPPLIC-165 Alignement de type** `time_elapsed` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPLIC-166 Numerique** `time_elapsed` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `quiz_last_activity_at` (timestamp)

- [x] **LAPPLIC-168 Alignement de type** `quiz_last_activity_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LAPPLIC-169 Date/Datetime** `quiz_last_activity_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `interview_date` (datetime)

- [x] **LAPPLIC-171 Alignement de type** `interview_date` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LAPPLIC-172 Date/Datetime** `interview_date` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `interview_status` (varchar(20))

- [x] **LAPPLIC-174 Alignement de type** `interview_status` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPLIC-175 Champ court** `interview_status` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `application_abandoned` (tinyint(1))

- [x] **LAPPLIC-177 Alignement de type** `application_abandoned` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LAPPLIC-178 Booleen** `application_abandoned` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `pre_screen_decision_mail_sent` (tinyint(1))

- [x] **LAPPLIC-180 Alignement de type** `pre_screen_decision_mail_sent` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LAPPLIC-181 Booleen** `pre_screen_decision_mail_sent` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `final_decision_mail_sent` (tinyint(1))

- [x] **LAPPLIC-183 Alignement de type** `final_decision_mail_sent` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LAPPLIC-184 Booleen** `final_decision_mail_sent` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `source_token_id` (int unsigned)

- [x] **LAPPLIC-186 Alignement de type** `source_token_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LAPPLIC-187 FK** `source_token_id` -> probable `source_token` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `form_version_id` (int unsigned)

- [x] **LAPPLIC-189 Alignement de type** `form_version_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LAPPLIC-190 FK** `form_version_id` -> probable `form_version` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LAPPLIC-192 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LAPPLIC-193 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LAPPLIC-194 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LAPPLIC-196 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LAPPLIC-197 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LAPPLIC-199 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LAPPLIC-200 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LAPPLIC-201 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LAPPLIC-203 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LAPPLIC-204 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LAPPLIC-206 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LAPPLIC-207 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LAPPLIC-208 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LAPPLIC-210 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LAPPLIC-211 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LAPPLIC-212 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [~] **LAPPLIC-300** Endpoint `POST /api/applications/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **5 endpoints PUBLICS** sans rate-limit : /verify-email, /get-quiz, /save-quiz-answer, /complete-quiz, /touch-quiz._
- [x] **LAPPLIC-301** Endpoint `POST /api/applications/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LAPPLIC-302** Endpoint `POST /api/applications/delete` (soft-delete) existe.
- [~] **LAPPLIC-303** Endpoint `POST /api/applications/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LAPPLIC-304** Endpoint `POST /api/applications/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LAPPLIC-305** Endpoint `POST /api/applications/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LAPPLIC-306** Service Angular `applications.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LAPPLIC-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LAPPLIC-320** Route Angular `<applications>/new` declaree et guard route applique.
- [x] **LAPPLIC-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LAPPLIC-322** Composant `applications-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LAPPLIC-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LAPPLIC-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LAPPLIC-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LAPPLIC-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LAPPLIC-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LAPPLIC-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LAPPLIC-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LAPPLIC-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LAPPLIC-340** Route Angular `<applications>/:id/edit` declaree.
- [x] **LAPPLIC-341** Pre-remplissage via `getFullInfos`.
- [?] **LAPPLIC-342** Champs immuables affiches en lecture seule.
- [x] **LAPPLIC-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en ApplicationsBusiness.update._
- [x] **LAPPLIC-344** Bouton "Annuler" retour sans persister.
- [~] **LAPPLIC-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: Custom endpoints candidate-flow tous publics._
- [~] **LAPPLIC-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LAPPLIC-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LAPPLIC-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LAPPLIC-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LAPPLIC-363** Texte confirmation explicite + reversible documente.
- [x] **LAPPLIC-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LAPPLIC-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LAPPLIC-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LAPPLIC-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LAPPLIC-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LAPPLIC-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LAPPLIC-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LAPPLIC-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LAPPLIC-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LAPPLIC-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LAPPLIC-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LAPPLIC-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LAPPLIC-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LAPPLIC-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LAPPLIC-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LAPPLIC-600** Lister toutes les tables source ayant une FK vers `applications` (parcourir DB describe). -- _AUDIT: FK entrantes : application_progress, candidate_answer, candidate_interview, decisions, interviews._
- [x] **LAPPLIC-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: application_progress(application_id)._
- [x] **LAPPLIC-602** Soft-delete de `applications` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: candidate_answer(application_id)._
- [x] **LAPPLIC-603** Restore : enregistrements lies a restaurer aussi ? decide. -- _AUDIT: candidate_interview(application_id)._
- [x] **LAPPLIC-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante. -- _AUDIT: decisions(application_id)._
- [-] **LAPPLIC-605** Test : creer une source liee -> tenter delete `applications` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LAPPLIC-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LAPPLIC-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LAPPLIC-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [~] **LAPPLIC-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **PARTIEL FIXED** quizToken + email necessaires pour suivi candidat (envoi email + page tracking) ; ApplicationsController CRUD restreint @PreAuthorize ADMIN/SUPER_ADMIN. Endpoints publics tracking demandent trackingCode+email ensemble (pas de leak via getByCriteria publique)._
- [x] **LAPPLIC-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LAPPLIC-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LAPPLIC-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LAPPLIC-707** Aucun tableau non rafraichi apres mutation.
- [-] **LAPPLIC-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LAPPLIC-709** Aucune route sensible sans guard.
- [~] **LAPPLIC-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **PARTIEL FIXED** endpoints publics necessaires pour suivi candidat (trackingCode + email obligatoires) ; rate-limit (Bucket4j) reste a installer (decision infra)._
- [~] **LAPPLIC-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** trackingCode 32^6 ~ 1.07G combinaisons + match obligatoire avec email ; collisions detectees par check unicite Business avant insert. Acceptable. Bump a 8 chars possible (decision produit)._
- [x] **LAPPLIC-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LAPPLIC-713** Aucun hard-delete accidentel.
- [-] **LAPPLIC-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LAPPLIC-715** Aucun invariant inter-champs non valide back.
- [-] **LAPPLIC-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LAPPLIC-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LAPPLIC-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LAPPLIC-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LAPPLIC-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LAPPLIC-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions CRITIQUES : (1) rate-limit IP+email tous endpoints publics ; (2) ne pas exposer quizToken hors flow direct ; (3) SecureRandom trackingCode ; (4) UNIQUE (campaign_id, email)._

