# Note — Versioning invisible : l'utilisateur édite, les versions se créent en arrière-plan

**Date :** 2026-08-17
**Statut :** Implémenté — en attente recette manuelle
**Périmètre :** `FormVersionBusiness`, `FormQuestionsBusiness`, `PipelineTemplateBusiness`, `PipelineStageBusiness`, `FormVersionDto`, `PipelineTemplateDto`, `entities-form-versions`, `questions`, `campaign-form`, `pipeline-templates`, `pipeline-stages`, routing Angular

> Cette note complète la 440 (pipeline personnalisable) et la 430 (grilles) : elle rend le **système de versioning transparent** pour l'utilisateur admin. L'utilisateur édite librement ; les versions se créent, se publient et se dupliquent en arrière-plan sans interaction visible.

---

## 1. Problématique

L'application possède 3 mécanismes de versioning qui exposent leur logique interne à l'utilisateur admin :

| # | Mécanisme | Table | Verrou auto | Interaction utilisateur actuelle |
|---|---|---|---|---|
| 1 | **Form versions** | `form_version` | 1ère candidature → `is_locked=1` | Page "Gestion des Versions" avec boutons Fork/Publier, labels "Brouillon de version #N", blocage CRUD |
| 2 | **Pipeline templates** | `pipeline_template` | 1ère application → `is_locked=1` | Bouton "Dupliquer" + colonne Verrouillé + filtre, édition/suppression bloquée |
| 3 | **Pipeline stages** | `pipeline_stage` | Dérivé (`ApplicationProgress`) | Champs disabled + texte "l'enregistrement créera une nouvelle révision" |

**Conséquence** : l'utilisateur admin doit comprendre les concepts de version/fork/publication pour travailler.

---

## 2. Décisions retenues

- L'utilisateur admin édite **librement** tous les objets (formulaires, templates, étapes), même verrouillés.
- Le backend crée automatiquement les nouvelles versions en arrière-plan (auto-fork, auto-dupliquer).
- La publication des nouvelles versions est **automatique** (remplace l'ancienne côté candidats).
- Un **toast discret** informe l'utilisateur : "Version #N créée automatiquement".
- La page "Gestion des Versions Formulaire" est **cachée** (route + navigation supprimées).
- Les labels "verrouillé", "nouvelle révision", champs disabled sont **supprimés** de l'UI.

---

## 3. Chantier A — Form versions : auto-fork silencieux

### A.1 Analyse du code existant

**Entité** : `form_version` (id, form_id, version_number, is_published, is_locked, random_questions)

**Points de blocage actuels** :

| Fichier | Méthode | Lignes | Comportement |
|---------|---------|--------|-------------|
| `FormVersionBusiness.java` | `ensureDirectVersionMutationAllowed()` | 961-976 | Throw si `is_locked=true` OU référencée par `Applications` |
| `FormVersionBusiness.java` | `delete()` | 323 | Appelle `ensureDirectVersionMutationAllowed` → throw |
| `FormVersionBusiness.java` | `updateDeleted()` | 733 | Appelle `ensureDirectVersionMutationAllowed` → throw |
| `FormVersionBusiness.java` | `updateAll()` | 804 | Appelle `ensureDirectVersionMutationAllowed` → throw |
| `FormVersionBusiness.java` | `loadEditableFormVersionForQuestionAction()` | 590-606 | Throw si `is_locked=true` |
| `FormQuestionsBusiness.java` | `ensureFormVersionIsEditable()` | 322-329 | Throw si `is_locked=true` |

**Points déjà fonctionnels (auto-fork)** :

| Fichier | Méthode | Lignes | Comportement |
|---------|---------|--------|-------------|
| `FormVersionBusiness.java` | `update()` | 174-176 | Auto-fork via `createForkedVersion()` quand `is_locked=true` |
| `FormVersionBusiness.java` | `createForkedVersion()` | 538-572 | Copie la version + form_questions → nouvelle version N+1 |

**Dépendance circulaire identifiée** :
- `FormVersionBusiness` injecte `FormQuestionsRepository` (directement)
- `FormQuestionsBusiness` injecte `FormVersionRepository` (directement)
- Si on injecte `FormVersionBusiness` dans `FormQuestionsBusiness` → circulaire

**Solution** : extraire la logique de fork dans une nouvelle classe `FormVersionForkService`.

### A.2 Fichiers à modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `business/FormVersionForkService.java` | **Créer** | Extraire `createForkedVersion()` + `applyPublishedState()` |
| `business/FormVersionBusiness.java` | Modifier | Injecter ForkService, modifier 4 méthodes |
| `business/FormQuestionsBusiness.java` | Modifier | Injecter ForkService, modifier `ensureFormVersionIsEditable` + 8 call sites |
| `utils/dto/FormVersionDto.java` | Modifier | +2 champs : `autoVersionCreated`, `newVersionNumber` |

### A.3 Implémentation détaillée

#### A.3.1 `FormVersionForkService.java` (nouveau)

Chemin : `quizapp/src/main/java/tech/synelia/quizapp/business/FormVersionForkService.java`

Extraire de `FormVersionBusiness` :

```java
package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.text.ParseException;
import java.util.*;
import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

@Log
@Component
public class FormVersionForkService {

    @Autowired private FormVersionRepository formVersionRepository;
    @Autowired private FormQuestionsRepository formQuestionsRepository;
    @Autowired private FormBusiness formBusiness;
    @Autowired private FunctionalError functionalError;

    // ─── createForkedVersion (copié de FormVersionBusiness L538-572) ───
    public FormVersion createForkedVersion(FormVersion sourceVersion, Integer userId, Locale locale) {
        FormVersion newVersion = new FormVersion();
        newVersion.setForm(sourceVersion.getForm());
        newVersion.setVersionNumber(sourceVersion.getVersionNumber() + 1);
        validateVersionNumberUniqueness(newVersion.getForm(), newVersion.getVersionNumber(), null, locale);
        newVersion.setIsPublished(false);
        newVersion.setIsLocked(false);
        newVersion.setRandomQuestions(sourceVersion.getRandomQuestions());
        newVersion.setIsDeleted(false);
        newVersion.setCreatedAt(Utilities.getCurrentDate());
        newVersion.setCreatedBy(userId);
        newVersion = formVersionRepository.save(newVersion);

        List<FormQuestions> sourceLinks = formQuestionsRepository
            .findByFormVersionIdOrderByQuestionOrder(sourceVersion.getId(), false);
        if (sourceLinks != null && !sourceLinks.isEmpty()) {
            List<FormQuestions> newLinks = new ArrayList<>();
            for (FormQuestions srcFq : sourceLinks) {
                FormQuestions newFq = new FormQuestions();
                newFq.setFormVersion(newVersion);
                newFq.setQuestion(srcFq.getQuestion());
                newFq.setQuestionOrder(srcFq.getQuestionOrder());
                newFq.setChronoOverride(srcFq.getChronoOverride());
                newFq.setIsDeleted(false);
                newFq.setCreatedAt(Utilities.getCurrentDate());
                newFq.setCreatedBy(userId);
                newLinks.add(newFq);
            }
            formQuestionsRepository.saveAll(newLinks);
        }
        return newVersion;
    }

    // ─── autoPublish (copié de FormVersionBusiness L936-958) ───
    public void autoPublish(FormVersion formVersion, Integer userId, Locale locale) {
        if (formVersion.getForm() == null || formVersion.getForm().getId() == null) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                "La version doit etre rattachee a un formulaire avant publication.", locale));
        }
        formBusiness.validateFormVersionTiming(formVersion, locale);

        List<FormQuestions> formQuestions = formQuestionsRepository
            .findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
        if (formQuestions == null || formQuestions.isEmpty()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                "Publication impossible: la version doit contenir au moins une question active.", locale));
        }

        List<FormVersion> otherVersions = formVersionRepository
            .findByFormIdAndIsPublished(formVersion.getForm().getId(), true, false);
        for (FormVersion other : otherVersions) {
            if (!Objects.equals(other.getId(), formVersion.getId())) {
                other.setIsPublished(false);
                other.setUpdatedAt(Utilities.getCurrentDate());
                other.setUpdatedBy(userId);
                formVersionRepository.save(other);
            }
        }
        formVersion.setIsPublished(true);
    }

    // ─── validateVersionNumberUniqueness (copié de FormVersionBusiness) ───
    private void validateVersionNumberUniqueness(Form form, Integer versionNumber, Integer excludeId, Locale locale) {
        // Implémentation identique à FormVersionBusiness
    }
}
```

#### A.3.2 `FormVersionDto.java`

Ajouter après `formId` (L34) :

```java
private Boolean    autoVersionCreated   ;
private Integer    newVersionNumber     ;
```

#### A.3.3 `FormVersionBusiness.java`

**Changements** :

1. **Injecter** `FormVersionForkService` (ajouter `@Autowired private FormVersionForkService formVersionForkService;`)

2. **`update()` (L148-250)** : remplacer L176 `entityToSave = createForkedVersion(sourceVersion, request.getUser(), locale);` par `entityToSave = formVersionForkService.createForkedVersion(sourceVersion, request.getUser(), locale);`

3. **`delete()` (L306-346)** : remplacer L323 `ensureDirectVersionMutationAllowed(existingEntity, locale);` par :

```java
if (Boolean.TRUE.equals(existingEntity.getIsLocked())) {
    FormVersion newVersion = formVersionForkService.createForkedVersion(existingEntity, request.getUser(), locale);
    formVersionForkService.autoPublish(newVersion, request.getUser(), locale);
    newVersion.setUpdatedAt(Utilities.getCurrentDate());
    newVersion.setUpdatedBy(request.getUser());
    newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
    formVersionRepository.save(newVersion);
    // La suppression se fait sur l'ancienne version dépubliée
}
```

4. **`updateDeleted()` (L714-778)** : remplacer L733 par la même logique auto-fork + redirection vers la nouvelle version.

5. **`updateAll()` (L782-819)** : remplacer L804 par la même logique.

6. **`loadEditableFormVersionForQuestionAction()` (L590-606)** : auto-fork au lieu de throw :

```java
private FormVersion loadEditableFormVersionForQuestionAction(Integer formVersionId, Integer userId, Locale locale) {
    FormVersion formVersion = formVersionRepository.findOne(formVersionId, false);
    if (formVersion == null) {
        throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + formVersionId, locale));
    }
    if (Boolean.TRUE.equals(formVersion.getIsLocked())) {
        FormVersion newVersion = formVersionForkService.createForkedVersion(formVersion, userId, locale);
        formVersionForkService.autoPublish(newVersion, userId, locale);
        newVersion.setUpdatedAt(Utilities.getCurrentDate());
        newVersion.setUpdatedBy(userId);
        newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
        return formVersionRepository.save(newVersion);
    }
    return formVersion;
}
```

7. **`forkLockedVersion()` (L507-536)** : déléguer à `formVersionForkService.createForkedVersion()` (L524).

8. **Supprimer** la méthode `ensureDirectVersionMutationAllowed()` (L961-976) — plus aucun appel.

9. **Supprimer** la méthode `createForkedVersion()` (L538-572) — déplacée dans `FormVersionForkService`.

#### A.3.4 `FormQuestionsBusiness.java`

**Changements** :

1. **Injecter** `FormVersionForkService` (ajouter `@Autowired private FormVersionForkService formVersionForkService;`)

2. **Modifier `ensureFormVersionIsEditable()` (L322-329)** — signature change de `void` à `FormVersion` :

```java
private FormVersion ensureFormVersionIsEditable(FormVersion formVersion, Integer userId, Locale locale) {
    if (formVersion != null && Boolean.TRUE.equals(formVersion.getIsLocked())) {
        FormVersion newVersion = formVersionForkService.createForkedVersion(formVersion, userId, locale);
        formVersionForkService.autoPublish(newVersion, userId, locale);
        newVersion.setUpdatedAt(Utilities.getCurrentDate());
        newVersion.setUpdatedBy(userId);
        newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
        return formVersionRepository.save(newVersion);
    }
    return formVersion;
}
```

3. **Mettre à jour les 8 call sites** — chaque appel doit capturer la version retournée et rediriger l'opération :

**`create()` (L83)** :
```java
FormVersion resolved = ensureFormVersionIsEditable(existingFormVersion, request.getUser(), locale);
if (!Objects.equals(resolved.getId(), existingFormVersion.getId())) {
    // La version a été forkée — rattacher à la nouvelle version
    dto.setFormVersionId(resolved.getId());
    existingFormVersion = resolved;
}
```

**`update()` (L164, L171)** :
```java
FormVersion resolved = ensureFormVersionIsEditable(entityToSave.getFormVersion(), request.getUser(), locale);
if (!Objects.equals(resolved.getId(), entityToSave.getFormVersion().getId())) {
    // Retrouver le FormQuestions link dans la nouvelle version
    List<FormQuestions> newVersionLinks = formQuestionsRepository
        .findByFormVersionIdOrderByQuestionOrder(resolved.getId(), false);
    FormQuestions newLink = null;
    if (newVersionLinks != null) {
        for (FormQuestions fq : newVersionLinks) {
            if (fq.getQuestion() != null && Objects.equals(fq.getQuestion().getId(), entityToSave.getQuestion().getId())) {
                newLink = fq;
                break;
            }
        }
    }
    if (newLink != null) {
        entityToSave = newLink;  // rediriger vers le link de la nouvelle version
    }
    entityToSave.setFormVersion(resolved);
}
// Si un formVersionId est fourni dans le DTO (changement de version)
if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0) {
    FormVersion existingFormVersion2 = formVersionRepository.findOne(dto.getFormVersionId(), false);
    if (existingFormVersion2 == null) {
        throw new EntityNotFoundException(...);
    }
    FormVersion resolved2 = ensureFormVersionIsEditable(existingFormVersion2, request.getUser(), locale);
    entityToSave.setFormVersion(resolved2);
}
```

**`delete()` (L257)** :
```java
FormVersion resolved = ensureFormVersionIsEditable(existingEntity.getFormVersion(), request.getUser(), locale);
if (!Objects.equals(resolved.getId(), existingEntity.getFormVersion().getId())) {
    // Retrouver le link dans la nouvelle version et le supprimer
    List<FormQuestions> newVersionLinks = formQuestionsRepository
        .findByFormVersionIdOrderByQuestionOrder(resolved.getId(), false);
    if (newVersionLinks != null) {
        for (FormQuestions fq : newVersionLinks) {
            if (fq.getQuestion() != null && Objects.equals(fq.getQuestion().getId(), existingEntity.getQuestion().getId())) {
                fq.setIsDeleted(true);
                fq.setUpdatedAt(Utilities.getCurrentDate());
                fq.setUpdatedBy(request.getUser());
                fq.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(fq)));
                formQuestionsRepository.save(fq);
                em.flush();
                normalizeActiveQuestionOrders(resolved, request.getUser());
                break;
            }
        }
    }
    return;  // opération terminée sur la nouvelle version
}
```

**`updateDeleted()` (L407, L414)** et **`updateAll()` (L498, L505)** : même logique de redirection.

### A.4 Frontend

#### A.4.1 Cacher la page "Gestion des Versions"

**`app.routes.ts`** : supprimer L305-314 :
```typescript
// SUPPRIMER :
{ path: 'entities/form-versions/:page', ... },
{ path: 'entities/form-versions', ... },
```

**`dashboard.ts`** : supprimer L293 :
```typescript
// SUPPRIMER :
{ id: 'form-versions', label: 'Versions Formulaire', ... },
```

**`entities.ts`** (ou `dashboard.ts` L215-223) : supprimer la card grid :
```typescript
// SUPPRIMER l'entrée form-versions du tableau entitiesList
```

#### A.4.2 Questions : supprimer labels version

**`questions.html`** : supprimer L400-402 :
```html
<!-- SUPPRIMER :
@if (formVersionQuestionContext()) {
  <p class="question-form__context-note">Brouillon de version #{{ formVersionQuestionContext()?.formVersionId }} ...</p>
}
-->
```

#### A.4.3 Campaign-form : supprimer avertissements

| Lignes | Élément | Action |
|--------|---------|--------|
| L462-467 | Bandeau "Duplication en attente" | Supprimer |
| L469-482 | Bandeau "Publication partagée: impact multi-campagnes" | Supprimer |
| L519-521 | Badge "Publication partagée" | Supprimer |
| L573-578 | Texte "Ce formulaire est partagé et déjà publié" | Supprimer |
| L588-596 | Bouton "Dupliquer pour cette campagne" | Supprimer |

---

## 4. Chantier B — Pipeline templates : auto-dupliquer

### B.1 Analyse du code existant

| Fichier | Méthode | Lignes | Comportement |
|---------|---------|--------|-------------|
| `PipelineTemplateBusiness.java` | `update()` | 107-162 | Met à jour sans vérifier `is_locked` |
| `PipelineTemplateBusiness.java` | `delete()` | 165-207 | Throw si `is_locked=true` (L183-185) |
| `PipelineTemplateBusiness.java` | `duplicateTemplate()` | 301-384 | Copie template + étapes + notification rules |
| `PipelineStageBusiness.java` | `enrichIsLocked()` | 697-711 | Dérive `isLocked` au niveau DTO via `findUsedStageIds()` |

### B.2 Fichiers à modifier

| Fichier | Action |
|---------|--------|
| `business/PipelineTemplateBusiness.java` | Modifier `update()` — auto-duplicate si `is_locked` |
| `business/PipelineStageBusiness.java` | Neutraliser `enrichIsLocked()` |
| `utils/dto/PipelineTemplateDto.java` | +2 champs : `autoDuplicated`, `newTemplateId` |

### B.3 Implémentation détaillée

#### B.3.1 `PipelineTemplateDto.java`

Ajouter après `isDeleted` (L28) :
```java
private Boolean autoDuplicated;
private Integer newTemplateId;
```

#### B.3.2 `PipelineTemplateBusiness.java` — `update()`

Avant `pipelineTemplateRepository.saveAll()` (L146), ajouter la logique auto-duplicate :

```java
// Avant le saveAll, pour chaque item verrouillé
List<PipelineTemplate> itemsToPersist = new ArrayList<>();
Map<Integer, PipelineTemplateDto> autoDuplicateMap = new HashMap<>();

for (PipelineTemplate entityToSave : items) {
    if (Boolean.TRUE.equals(entityToSave.getIsLocked())) {
        // Auto-dupliquer silencieusement
        String autoName = entityToSave.getTemplateName() + " (copie)";
        // Vérifier unicité du nom
        int counter = 1;
        String candidateName = autoName;
        while (!pipelineTemplateRepository.findByTemplateName(candidateName, false).isEmpty()) {
            candidateName = autoName + " " + counter++;
        }
        Response<PipelineTemplateDto> dupResponse = duplicateTemplate(
            entityToSave.getId(), candidateName, request.getUser(), locale);
        PipelineTemplateDto newTpl = dupResponse.getItems().get(0);

        // Appliquer les modifications du DTO sur la copie
        PipelineTemplate copiedEntity = pipelineTemplateRepository.findOne(newTpl.getId(), false);
        applyDtoToEntity(dto, copiedEntity);
        copiedEntity.setUpdatedAt(Utilities.getCurrentDate());
        copiedEntity.setUpdatedBy(request.getUser());
        itemsToPersist.add(copiedEntity);
        autoDuplicateMap.put(newTpl.getId(), dto);
    } else {
        itemsToPersist.add(entityToSave);
    }
}
```

Dans la réponse, remplir `autoDuplicated=true` + `newTemplateId` pour les templates dupliqués.

#### B.3.3 `PipelineTemplateBusiness.java` — `delete()`

Remplacer L183-185 (throw si locked) par auto-duplicate + suppression de l'ancien :

```java
if (existingEntity.getIsLocked() != null && existingEntity.getIsLocked()) {
    // Auto-dupliquer avant suppression
    String autoName = existingEntity.getTemplateName() + " (copie)";
    duplicateTemplate(existingEntity.getId(), autoName, request.getUser(), locale);
    // Puis supprimer l'original
}
```

#### B.3.4 `PipelineStageBusiness.java` — `enrichIsLocked()`

Neutraliser (L697-711) :
```java
private List<PipelineStageDto> enrichIsLocked(List<PipelineStage> stages) throws ParseException {
    return PipelineStageTransformer.INSTANCE.toDtos(stages);
}
```

### B.4 Frontend

**`entities-pipeline-templates.html`** :

| Lignes | Élément | Action |
|--------|---------|--------|
| L155 | Colonne "Verrouillé" `<th>` | Supprimer |
| L167 | Cellule "Verrouillé" `<td>` | Supprimer |
| L76-81 | Filtre avancé "Verrouillé" | Supprimer |
| L172-174 | Bouton Dupliquer `*ngIf="canDuplicateTemplate(item)"` | Supprimer |

**`entities-pipeline-templates.ts`** : supprimer `openDuplicateModal()`, `canDuplicateTemplate()`.

---

## 5. Chantier C — Pipeline stages : masquer les labels verrouillage

### C.1 Fichiers à modifier

| Fichier | Action |
|---------|--------|
| `business/PipelineStageBusiness.java` | Neutraliser `enrichIsLocked()` |
| `entities-pipeline-stages.html` | Supprimer disabled + texte info |
| `entities-pipeline-stages.ts` | Supprimer méthodes lock |

### C.2 Implémentation détaillée

#### C.2.1 `PipelineStageBusiness.java`

`enrichIsLocked()` (L697-711) : retourner simplement la conversion sans enrichissement :

```java
private List<PipelineStageDto> enrichIsLocked(List<PipelineStage> stages) throws ParseException {
    return PipelineStageTransformer.INSTANCE.toDtos(stages);
}
```

#### C.2.2 `entities-pipeline-stages.html`

| Lignes | Élément | Action |
|--------|---------|--------|
| L282 | `[disabled]="isEditStageLocked()"` sur select template | Supprimer l'attribut |
| L288-290 | Texte "Étape déjà atteinte par des candidatures: l'enregistrement créera une nouvelle révision active." | Supprimer |
| L299 | `[disabled]="isEditStageLocked()"` sur configJson | Supprimer l'attribut |
| L303 | `[disabled]="isEditStageLocked()"` sur Obligatoire | Supprimer l'attribut |
| L304 | `[disabled]="isEditStageLocked()"` sur Éliminatoire | Supprimer l'attribut |

#### C.2.3 `entities-pipeline-stages.ts`

Supprimer :
- `isTemplateLocked()` (L69-74)
- `isCreateTargetLocked()` (L77-79)
- `isEditStageLocked()` (L81-83)
- Avertissements dans `confirmDelete()` (L348-350) et `deleteFromEdit()` (L356-358)

---

## 6. Checklist de validation

### Build
- [x] `mvnw compile` — pas d'erreur de compilation Java
- [x] `ng build` — pas d'erreur de compilation Angular

### Tests
- [x] `ApplicationsBusinessTest` — 20/20 OK (vérifier qu'aucun test ne dépend de l'ancien comportement de blocage)
- [ ] `QuestionBusinessTest` — vérifier les 3 erreurs pré-existantes hors périmètre

### Recette manuelle
- [ ] Éditer question sur version verrouillée → fork auto → toast "Version #N créée"
- [ ] Éditer template pipeline verrouillé → duplicate auto → toast
- [ ] Page "Gestion des Versions" inaccessible (route + nav cachées)
- [ ] Labels "Brouillon de version #N" supprimés dans questions
- [ ] Avertissements "Publication partagée" supprimés dans campaign-form
- [ ] Champs pipeline stages non-disabled quand étape utilisée
- [ ] Texte "l'enregistrement créera une nouvelle révision" supprimé
- [ ] Candidats voient bien la nouvelle version après modification

### Documentation
- [ ] Note 470 mise à jour avec statut "Terminée"
- [ ] Commit avec message conventionnel

---

## 7. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| **Dépendance circulaire** FormVersionBusiness ↔ FormQuestionsBusiness | Injection échoue au démarrage | Résolu via `FormVersionForkService` (classe séparée) |
| **Concurrence** : 2 admins éditent le même formulaire verrouillé | 2 drafts créés | Le 2ème fork détecte le 1er draft non publié → le réutilise |
| **Transaction** : fork dans `FormQuestionsBusiness` sans `@Transactional` | Données partiellement sauvegardées | Vérifier que l'appelant est déjà dans une transaction |
| **Performance** : auto-fork à chaque édition | Ralentissement | Fork léger (copie form_questions, pas de données candidats) |
| **Intégrité** : publication automatique remplace la version | Candidats en cours sur l'ancienne | Le snapshot quiz (`form_version_id`) fige la version utilisée |
| **Rollback** : impossible de revenir en arrière | Perte de version | Les anciennes versions restent en DB (is_deleted=false) |

---

## 8. Fichiers concernés (résumé)

### Backend (`quizapp/src/main/java/tech/synelia/quizapp/`)

| Fichier | Modification |
|---------|-------------|
| `business/FormVersionForkService.java` | **Nouveau** — fork + publish extraits de FormVersionBusiness |
| `business/FormVersionBusiness.java` | Injecter ForkService, modifier `delete/updateDeleted/updateAll/loadEditableFormVersion`, supprimer `ensureDirectVersionMutationAllowed` + `createForkedVersion` |
| `business/FormQuestionsBusiness.java` | Injecter ForkService, modifier `ensureFormVersionIsEditable` (retourne FormVersion) + 8 call sites redirigés |
| `business/PipelineTemplateBusiness.java` | Auto-duplicate dans `update()` + `delete()` quand is_locked |
| `business/PipelineStageBusiness.java` | Neutraliser `enrichIsLocked()` |
| `utils/dto/FormVersionDto.java` | +2 champs : `autoVersionCreated`, `newVersionNumber` |
| `utils/dto/PipelineTemplateDto.java` | +2 champs : `autoDuplicated`, `newTemplateId` |

### Frontend (`quizapp_front/src/app/`)

| Fichier | Modification |
|---------|-------------|
| `app.routes.ts` | Supprimer routes `entities-form-versions` (L305-314) |
| `pages/dashboard/dashboard.ts` | Supprimer nav entry (L293) + grid entry (L215-223) |
| `pages/dashboard/questions/questions.html` | Supprimer contexte brouillon (L400-402) |
| `pages/dashboard/campaign-form/campaign-form.component.html` | Supprimer 5 blocs avertissements (L462-467, L469-482, L519-521, L573-578, L588-596) |
| `pages/dashboard/entities/solo/pipeline-templates/entities-pipeline-templates.html` | Supprimer Dupliquer (L172-174), colonne Verrouillé (L155, L167), filtre (L76-81) |
| `pages/dashboard/entities/solo/pipeline-templates/entities-pipeline-templates.ts` | Supprimer `openDuplicateModal()`, `canDuplicateTemplate()` |
| `pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages.html` | Supprimer `[disabled]` (L282, L299, L303, L304), texte info (L288-290) |
| `pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages.ts` | Supprimer `isTemplateLocked()`, `isCreateTargetLocked()`, `isEditStageLocked()`, avertissements (L348-360) |
