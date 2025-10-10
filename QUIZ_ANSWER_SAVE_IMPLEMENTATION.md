# Implémentation de la sauvegarde automatique des réponses du quiz

## 📋 Vue d'ensemble

Ce document décrit l'implémentation complète du système de sauvegarde automatique des réponses du quiz, permettant aux candidats de ne jamais perdre leurs réponses en cas d'interruption.

## 🗄️ Modifications de la base de données

### Migration V1_012: Ordre des questions dans les campagnes

**Fichier**: `V1_012__add_order_to_campaign_questions.sql`

```sql
ALTER TABLE campaign_questions 
ADD COLUMN `order` INT NOT NULL DEFAULT 0;

ALTER TABLE campaign_questions 
ADD CONSTRAINT uk_campaign_questions_campaign_order 
UNIQUE KEY (campaign_id, `order`);

CREATE INDEX idx_campaign_questions_campaign_order 
ON campaign_questions(campaign_id, `order`);
```

**Objectif**: 
- Définir l'ordre d'apparition des questions dans une campagne
- Garantir qu'une campagne n'a pas deux questions avec le même ordre
- Faciliter la pagination et la navigation dans le quiz

### Migration V1_013: Flag de sélection des réponses

**Fichier**: `V1_013__add_is_selected_to_candidate_answers.sql`

```sql
ALTER TABLE candidate_answers 
ADD COLUMN is_selected BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_candidate_answers_is_selected 
ON candidate_answers(is_selected);

CREATE INDEX idx_candidate_answers_app_qa_selected 
ON candidate_answers(application_id, questions_answers_id, is_selected);
```

**Objectif**:
- Tracker si le candidat a sélectionné ou non chaque réponse
- Permettre la mise à jour en temps réel des sélections
- Optimiser les requêtes de récupération des réponses sélectionnées

### Migration V1_014: Niveau de progression dans le quiz

**Fichier**: `V1_014__add_quiz_level_to_applications.sql`

```sql
ALTER TABLE applications 
ADD COLUMN quiz_level INT NULL DEFAULT NULL;

CREATE INDEX idx_applications_quiz_level 
ON applications(quiz_level);

CREATE INDEX idx_applications_id_quiz_level 
ON applications(id, quiz_level);
```

**Objectif**:
- Mémoriser la dernière question à laquelle le candidat a répondu
- Permettre de reprendre le quiz là où il s'est arrêté
- Faciliter le suivi de la progression du candidat

## 🔧 Modifications du code backend

### 1. Mise à jour des entités JPA

#### CampaignQuestions.java
```java
@Column(name="order", nullable=false)
private Integer order;
```

#### CandidateAnswers.java
```java
@Column(name="is_selected", nullable=false)
private Boolean isSelected;
```

#### Applications.java
```java
@Column(name="quiz_level")
private Integer quizLevel;
```

### 2. Nouveaux repositories

#### CampaignQuestionsRepository.java

Nouvelles méthodes ajoutées:

```java
// Récupérer les questions d'une campagne triées par ordre
List<CampaignQuestions> findByCampaignIdOrderByOrder(
    Integer campaignId, 
    Boolean isDeleted
);

// Récupérer une question spécifique par campagne et ordre
CampaignQuestions findByCampaignIdAndOrder(
    Integer campaignId, 
    Integer order, 
    Boolean isDeleted
);
```

#### CandidateAnswersRepository.java

Nouvelles méthodes ajoutées:

```java
// Récupérer un candidate_answer spécifique
CandidateAnswers findByApplicationIdAndQuestionsAnswersId(
    Integer applicationId, 
    Integer questionsAnswersId, 
    Boolean isDeleted
);

// Récupérer toutes les réponses d'une question pour un candidat
List<CandidateAnswers> findByApplicationIdAndQuestionId(
    Integer applicationId, 
    Integer questionId, 
    Boolean isDeleted
);
```

### 3. Logique métier - ApplicationsBusiness.java

#### Méthode: `initializeCandidateAnswers()`

**Appelée lors du premier chargement du quiz (statut PENDING → STARTED)**

```java
private void initializeCandidateAnswers(Applications application, Integer userId)
```

**Flux d'exécution**:

1. Récupère la campagne associée à l'application
2. Récupère toutes les questions de la campagne (triées par ordre)
3. Pour chaque question:
   - Récupère tous les questions_answers possibles
   - Pour chaque questions_answers:
     - Vérifie si un candidate_answer existe déjà
     - Si non, crée un nouveau candidate_answer avec `is_selected = false`
4. Log le nombre total d'enregistrements créés

**Exemple**:

Pour une campagne avec:
- Question 1 (ID: 21) → 2 réponses (ID: 401, 402)
- Question 2 (ID: 22) → 3 réponses (ID: 451, 452, 453)
- Question 3 (ID: 26) → 2 réponses (ID: 501, 502)

**Résultat**: 7 enregistrements `candidate_answers` créés, tous avec `is_selected = false`

#### Méthode: `saveQuizAnswer()`

**Appelée chaque fois que le candidat sélectionne/désélectionne une réponse**

```java
public Response<ApplicationsDto> saveQuizAnswer(
    Request<ApplicationsDto> request, 
    Locale locale
)
```

**Paramètres d'entrée** (via ApplicationsDto):
- `id`: applicationId
- `searchString`: quiz_token (pour validation)
- `candidateCvPath`: questionsAnswersId sélectionné
- `candidatePhone`: questionId

**Flux d'exécution**:

1. **Validation**:
   - Vérifie que l'application existe
   - Valide le quiz_token
   - Vérifie que le quiz n'est pas déjà complété

2. **Récupération des réponses**:
   - Récupère tous les candidate_answers pour cette application et cette question

3. **Mise à jour des sélections**:
   - Pour chaque candidate_answer de la question:
     - `is_selected = true` si c'est la réponse sélectionnée
     - `is_selected = false` pour toutes les autres réponses
   - Ne met à jour que si la valeur change (optimisation)

4. **Mise à jour du niveau de progression**:
   - Récupère l'ordre de la question dans la campagne
   - Met à jour `application.quiz_level` avec cet ordre

5. **Retour de la réponse**:
   - Renvoie l'applicationId et le nouveau quiz_level

**Exemple**:

Le candidat sélectionne la réponse 2 de la question 1:

**État avant**:
```
candidate_answers:
- ID: 1, questions_answers_id: 401, is_selected: false
- ID: 2, questions_answers_id: 402, is_selected: false
```

**Action**: Sélectionner questions_answers_id = 402

**État après**:
```
candidate_answers:
- ID: 1, questions_answers_id: 401, is_selected: false
- ID: 2, questions_answers_id: 402, is_selected: true ← mis à jour

application.quiz_level: 1 (ordre de la question 1)
```

### 4. Nouveau endpoint REST

#### ApplicationsController.java

```java
@RequestMapping(
    value="/save-quiz-answer",
    method=RequestMethod.POST,
    consumes = {"application/json"},
    produces={"application/json"}
)
public Response<ApplicationsDto> saveQuizAnswer(
    @RequestBody Request<ApplicationsDto> request
) throws Exception
```

**URL**: `POST /applications/save-quiz-answer`

**Payload exemple**:
```json
{
  "user": 1,
  "data": {
    "id": 201,
    "searchString": "a1b2c3d4e5f6...",
    "candidatePhone": "21",
    "candidateCvPath": "402",
    "candidateFirstName": "",
    "candidateLastName": "",
    "candidateEmail": "",
    "candidateBirthDate": ""
  }
}
```

**Réponse succès**:
```json
{
  "httpCode": 200,
  "hasError": false,
  "status": {
    "code": "200",
    "message": "Réponse sauvegardée avec succès"
  },
  "items": [{
    "id": 201,
    "quizLevel": 1
  }]
}
```

## 🔄 Flux complet d'utilisation

### Scénario 1: Démarrage du quiz

**Étape 1**: Le candidat valide son email et clique sur "Commencer le quiz"

**Action backend**:
```java
// Dans getQuizForApplication()
if (QuizStatus.PENDING.equals(application.getQuizStatus())) {
    application.setQuizStatus(QuizStatus.STARTED.getValue());
    application.setQuizLevel(0);
    applicationsRepository.save(application);
    
    // Initialiser tous les candidate_answers
    initializeCandidateAnswers(application, request.getUser());
}
```

**Résultat**:
- `quiz_status` = "started"
- `quiz_level` = 0
- Tous les `candidate_answers` créés avec `is_selected = false`

### Scénario 2: Répondre à une question

**Étape 2**: Le candidat visualise la question 1 (order=1) et sélectionne une réponse

**Action frontend**:
```javascript
// Appel à l'API save-quiz-answer
const response = await applicationService.saveQuizAnswer({
  applicationId: 201,
  quizToken: 'a1b2c3d4...',
  questionId: 21,
  questionsAnswersId: 402
});
```

**Action backend**:
```java
// Dans saveQuizAnswer()
1. Récupère tous les candidate_answers pour question_id = 21
2. Met is_selected = true pour questions_answers_id = 402
3. Met is_selected = false pour tous les autres
4. Met quiz_level = 1 (order de la question 1)
```

**Résultat**:
- Réponse sauvegardée immédiatement en base
- `application.quiz_level` = 1
- Candidat peut fermer son navigateur sans perdre sa réponse

### Scénario 3: Changement de réponse

**Étape 3**: Le candidat change d'avis et sélectionne une autre réponse pour la même question

**Action**:
```javascript
// Nouvelle sélection
const response = await applicationService.saveQuizAnswer({
  applicationId: 201,
  quizToken: 'a1b2c3d4...',
  questionId: 21,
  questionsAnswersId: 401  // Différente réponse
});
```

**Résultat**:
- `is_selected = true` pour questions_answers_id = 401
- `is_selected = false` pour questions_answers_id = 402 (ancienne sélection)
- `quiz_level` reste à 1

### Scénario 4: Reprise après interruption

**Étape 4**: Le candidat ferme son navigateur et revient plus tard

**Action au retour**:
```java
// Le frontend peut récupérer:
// - application.quiz_level pour savoir où reprendre
// - Les candidate_answers avec is_selected = true pour restaurer les sélections
```

## 🔒 Sécurité

Toutes les opérations de sauvegarde nécessitent:

1. **quiz_token valide**: Empêche les accès non autorisés
2. **Vérification du statut**: Impossible de modifier un quiz complété
3. **Validation des données**: Tous les paramètres sont vérifiés

## 📊 Performance

**Optimisations mises en place**:

1. **Index composites**:
   - `(campaign_id, order)` pour le tri des questions
   - `(application_id, questions_answers_id, is_selected)` pour les requêtes de sélection

2. **Mise à jour conditionnelle**:
   - Ne met à jour que si `is_selected` change réellement

3. **Logs détaillés**:
   - Permet de tracer les performances et identifier les problèmes

## 🧪 Tests à effectuer

### Test 1: Initialisation
```
1. Créer une application (statut: pending)
2. Appeler get-quiz
3. Vérifier que tous les candidate_answers sont créés
4. Vérifier que quiz_status = started et quiz_level = 0
```

### Test 2: Sauvegarde
```
1. Sélectionner une réponse
2. Vérifier que is_selected = true pour cette réponse
3. Vérifier que is_selected = false pour les autres réponses de la question
4. Vérifier que quiz_level est mis à jour
```

### Test 3: Changement de sélection
```
1. Sélectionner réponse A
2. Sélectionner réponse B
3. Vérifier que seule B a is_selected = true
```

### Test 4: Sécurité
```
1. Tenter de sauvegarder sans quiz_token → 403 Forbidden
2. Tenter de sauvegarder avec mauvais token → 403 Forbidden
3. Tenter de sauvegarder sur quiz complété → 400 Bad Request
```

## 📝 Notes importantes

1. **Ordre des questions**: Doit être défini lors de la création de la campagne
2. **Questions multiples**: Le système supporte les questions à choix multiples (plusieurs is_selected = true)
3. **Progression**: quiz_level est mis à jour même si le candidat revient sur une question précédente
4. **Sauvegarde**: Chaque action de sélection est immédiatement persistée en base

## 🚀 Prochaines étapes suggérées

1. **Frontend**: Implémenter l'appel à l'API save-quiz-answer lors de la sélection d'une réponse
2. **Frontend**: Utiliser quiz_level pour reprendre le quiz à la bonne question
3. **Backend**: Ajouter une méthode pour marquer le quiz comme complété
4. **Backend**: Calculer le score final basé sur les is_selected et is_correct
5. **Frontend**: Afficher un indicateur de sauvegarde automatique ("Sauvegardé automatiquement")
