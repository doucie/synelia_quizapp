# Migration : Ajout de total_questions et suppression de marked_out_of

## Date : 20 octobre 2025

## Objectif

Remplacer le système de notation arbitraire (`marked_out_of`) par un système basé sur le nombre réel de questions dans une campagne (`total_questions`).

## Changements en base de données

### Migration V1_020 : Modification de la table `campaigns`
- ✅ **Ajout** : Colonne `total_questions` (INT, DEFAULT 0)
- ✅ **Suppression** : Colonne `marked_out_of`
- ✅ **Migration automatique** : Calcul du nombre de questions existantes pour chaque campagne

Fichier : `V1_020__add_total_questions_to_campaigns.sql`

### Migration V1_021 : Modification de la table `applications`
- ✅ **Ajout** : Colonne `total_questions` (INT, DEFAULT 0)
- Permet de conserver l'historique du nombre de questions au moment où le candidat a passé le quiz

Fichier : `V1_021__add_total_questions_to_applications.sql`

## Changements Backend (Java/Spring Boot)

### Entités modifiées

#### 1. `Campaigns.java`
```java
// ❌ SUPPRIMÉ
@Column(name="marked_out_of")
private Integer    markedOutOf;

// ✅ AJOUTÉ
@Column(name="total_questions")
private Integer    totalQuestions;
```

#### 2. `Applications.java`
```java
// ✅ AJOUTÉ
@Column(name="total_questions")
private Integer    totalQuestions;
```

### DTOs modifiés

#### 1. `CampaignsDto.java`
- ❌ Supprimé : `markedOutOf`, `markedOutOfParam`
- ✅ Ajouté : `totalQuestions`, `totalQuestionsParam`

#### 2. `ApplicationsDto.java`
- ✅ Ajouté : `totalQuestions`, `totalQuestionsParam`

### Business Logic modifiée

#### 1. `ApplicationsBusiness.completeQuiz()`
**Nouvelle logique lors de la soumission du quiz :**

```java
// 1. Récupérer le nombre de questions dans la campagne
Integer totalQuestions = campaignQuestions.size();

// 2. Calculer le nombre de bonnes réponses
Integer correctAnswersCount = 0;
for (CandidateAnswers candidateAnswer : candidateAnswers) {
    if (candidateAnswer.getIsSelected() && 
        candidateAnswer.getQuestionsAnswers().getAnswers().getIsCorrect()) {
        correctAnswersCount++;
    }
}

// 3. Mettre à jour l'application
application.setQuizScore(correctAnswersCount);      // Nombre de bonnes réponses
application.setTotalQuestions(totalQuestions);       // Nombre total de questions
application.setQuizStatus(QuizStatus.COMPLETED);
```

**Exemple :**
- Campagne avec 15 questions
- Candidat répond correctement à 12 questions
- `quiz_score = 12`
- `total_questions = 15`
- Score en pourcentage = (12/15) × 100 = 80%

#### 2. `CampaignQuestionsBusiness`
**Mise à jour automatique de `total_questions` :**

```java
// Méthode ajoutée
private void updateCampaignTotalQuestions(Integer campaignId) {
    Campaigns campaign = campaignsRepository.findOne(campaignId, false);
    List<CampaignQuestions> questions = campaignQuestionsRepository
        .findByCampaignIdOrdered(campaignId, false);
    
    campaign.setTotalQuestions(questions.size());
    campaignsRepository.save(campaign);
}
```

**Appels automatiques :**
- ✅ Dans `create()` : après ajout de questions
- ✅ Dans `delete()` : après suppression de questions

## Changements Frontend (Angular)

### À FAIRE : Fichiers à modifier

#### 1. `/src/app/pages/dashboard/campaign-form/campaign-form.ts`
**Supprimer :**
```typescript
// Ligne 56 - Options de notation
markedOutOfOptions = [
  { label: 'Sur 10', value: 10 },
  { label: 'Sur 20', value: 20 },
  { label: 'Sur 50', value: 50 },
  { label: 'Sur 100', value: 100 },
  { label: 'Personnalisé', value: -1 }
];

// Lignes 103-105 - Champs du formulaire
markedOutOf: [10, [Validators.required, Validators.min(1)]],
markedOutOfPreset: [10],
customMarkedOutOf: [{ value: '', disabled: true }],

// Lignes 110-133 - Logique de gestion des champs markedOutOf
this.campaignForm.get('markedOutOfPreset')?.valueChanges.subscribe(...)
this.campaignForm.get('customMarkedOutOf')?.valueChanges.subscribe(...)

// Lignes 383-396 - Patch du formulaire en édition
markedOutOf: campaign.markedOutOf
const markedOutOf = campaign.markedOutOf || 10;
...
```

#### 2. `/src/app/pages/dashboard/campaign-form/campaign-form.html`
**Supprimer le bloc HTML :**
```html
<!-- Section "Barème de notation" -->
<div class="form-group">
  <label for="markedOutOfPreset">Barème de notation *</label>
  <select id="markedOutOfPreset" formControlName="markedOutOfPreset" ...>
    <option *ngFor="let option of markedOutOfOptions" [value]="option.value">
      {{ option.label }}
    </option>
  </select>
</div>

<!-- Champ personnalisé -->
<div *ngIf="campaignForm.get('markedOutOfPreset')?.value === -1" ...>
  <input type="number" id="customMarkedOutOf" formControlName="customMarkedOutOf" ...>
</div>
```

#### 3. `/src/app/core/models/campaign.model.ts`
**Modifier l'interface :**
```typescript
export interface Campaign {
  id?: number;
  // ... autres champs ...
  
  // ❌ SUPPRIMER
  markedOutOf?: number;
  
  // ✅ AJOUTER
  totalQuestions?: number;
}
```

#### 4. `/src/app/pages/dashboard/campaigns/campaigns.ts`
**Si affichage du total_questions dans la liste :**
```typescript
// Remplacer markedOutOf par totalQuestions dans les colonnes
columns = [
  { header: 'Titre', field: 'campaignTitle' },
  { header: 'Spécialité', field: 'specialityName' },
  { header: 'Questions', field: 'totalQuestions' }, // ✅ NOUVEAU
  { header: 'Statut', field: 'campaignStatus' }
];
```

## Avantages du nouveau système

### 1. **Cohérence avec le nombre réel de questions**
- Avant : Un recruteur pouvait définir "noté sur 20" même si la campagne a 15 questions
- Après : Le score est basé sur le nombre réel de questions (ex: 12/15)

### 2. **Historique préservé**
- `applications.total_questions` garde le nombre de questions au moment du passage du quiz
- Si on ajoute des questions après, les anciens résultats restent cohérents

### 3. **Flexibilité**
- Plus besoin de choisir un barème arbitraire
- Le système s'adapte automatiquement au nombre de questions

### 4. **Clarté pour les candidats**
- Affichage type "12/15 bonnes réponses" plus parlant que "12/20"

## Exemple de calcul de score

### Avant (avec marked_out_of)
```
Campagne : 15 questions
Barème : noté sur 20
Candidat : 12 bonnes réponses

Calcul : (12/15) × 20 = 16/20
```

### Après (avec total_questions)
```
Campagne : 15 questions
Candidat : 12 bonnes réponses

Résultat :
- quiz_score = 12
- total_questions = 15
- Affichage : "12/15 (80%)"
```

## Actions à effectuer

### Backend ✅
- [x] Migration SQL V1_020 créée
- [x] Migration SQL V1_021 créée
- [x] Entité `Campaigns` modifiée
- [x] Entité `Applications` modifiée
- [x] DTOs modifiés
- [x] Logique `completeQuiz()` implémentée
- [x] Mise à jour automatique de `total_questions` dans `CampaignQuestionsBusiness`

### Frontend ⏳
- [ ] Supprimer les champs `markedOutOf` du formulaire TypeScript
- [ ] Supprimer la section "Barème de notation" du HTML
- [ ] Mettre à jour l'interface `Campaign`
- [ ] Adapter l'affichage des scores (12/15 au lieu de 12/20)

### Base de données ⏳
- [ ] Exécuter les migrations SQL

## Notes importantes

⚠️ **Migration des données existantes :**
- La migration V1_020 calcule automatiquement `total_questions` pour les campagnes existantes
- Les applications existantes auront `total_questions = 0` (à recalculer manuellement si nécessaire)

⚠️ **Compatibilité ascendante :**
- Les anciennes applications sans `total_questions` afficheront 0
- Prévoir un script de migration si besoin

## Commandes SQL utiles

### Vérifier les campagnes
```sql
SELECT 
    id,
    campaign_title,
    total_questions,
    (SELECT COUNT(*) FROM campaign_questions 
     WHERE campaign_id = campaigns.id AND is_deleted = FALSE) as actual_count
FROM campaigns
WHERE is_deleted = FALSE;
```

### Vérifier les scores des candidats
```sql
SELECT 
    a.id,
    a.candidate_email,
    a.quiz_score,
    a.total_questions,
    ROUND((a.quiz_score / a.total_questions) * 100, 2) as percentage
FROM applications a
WHERE a.quiz_status = 'COMPLETED'
  AND a.total_questions > 0;
```
