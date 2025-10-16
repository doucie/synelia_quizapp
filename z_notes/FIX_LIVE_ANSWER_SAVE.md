# Fix: Enregistrement en live des réponses du candidat

## Problème identifié
Lorsque le candidat sélectionne une réponse dans le quiz, la valeur `is_selected` n'était pas mise à jour en base de données. Les réponses restaient uniquement en mémoire dans le frontend Angular.

## Cause racine
Le frontend n'appelait pas l'endpoint `/applications/save-quiz-answer` lors de la sélection d'une réponse. La méthode `selectAnswer()` du composant Quiz mettait seulement à jour l'état local (signal `selectedAnswers`).

De plus, le backend ne renvoyait pas le champ `questionsAnswersId` nécessaire pour identifier la réponse dans la table `questions_answers`.

## Solution implémentée

### 1. Backend - ApplicationsBusiness.java
**Modification de `getQuizForApplication()`** (ligne ~1000)

Ajout du champ `questionsAnswersId` dans les données des réponses envoyées au frontend :

```java
for (QuestionsAnswers qa : questionAnswers) {
    Answers answer = qa.getAnswers();
    if (answer != null && !answer.getIsDeleted()) {
        Map<String, Object> answerData = new HashMap<>();
        answerData.put("id", answer.getId()); // ID de la table answers
        answerData.put("questionsAnswersId", qa.getId()); // ID de la table questions_answers ✨ NOUVEAU
        answerData.put("answerContent", answer.getAnswerContent());
        answersData.add(answerData);
    }
}
```

**Raison** : Le champ `questionsAnswersId` est nécessaire pour appeler l'API `saveQuizAnswer()` qui utilise ce paramètre pour identifier quelle ligne de `candidate_answers` mettre à jour.

### 2. Frontend - application.service.ts

**Ajout de la méthode `saveQuizAnswer()`**

```typescript
saveQuizAnswer(
  applicationId: number, 
  quizToken: string, 
  questionId: number, 
  questionsAnswersId: number
): Observable<ApplicationResponse> {
  const request = {
    user: 1,
    data: {
      id: applicationId,
      searchString: quizToken, // Validation sécurité
      candidatePhone: questionId.toString(), // Utilisation temporaire
      candidateCvPath: questionsAnswersId.toString(), // Utilisation temporaire
      candidateFirstName: '',
      candidateLastName: '',
      candidateEmail: '',
      candidateBirthDate: ''
    }
  };

  return this.http.post<ApplicationResponse>(
    `${this.applicationsUrl}/save-quiz-answer`, 
    request, 
    { headers }
  );
}
```

**Mise à jour de l'interface `Application`**

Ajout des champs liés au quiz :
- `quizToken?: string;`
- `quizStatus?: string;`
- `quizLevel?: number;`

### 3. Frontend - quiz.ts (Composant)

**Mise à jour de l'interface `Answer`**

```typescript
interface Answer {
  id: number;
  answerContent: string;
  questionsAnswersId?: number; // ✨ NOUVEAU - ID dans questions_answers
}
```

**Ajout de signaux pour le tracking**

```typescript
applicationId = signal<number | null>(null);
quizToken = signal<string | null>(null);
isSaving = signal(false); // Indicateur de sauvegarde en cours
```

**Modification de `selectAnswer()`**

La méthode appelle maintenant l'API backend après avoir mis à jour l'état local :

```typescript
selectAnswer(questionId: number, answerId: number): void {
  const currentQ = this.currentQuestion();
  if (!currentQ) return;

  // Récupérer questionsAnswersId depuis l'objet Answer
  const selectedAnswerObj = currentQ.answers.find(a => a.id === answerId);
  if (!selectedAnswerObj?.questionsAnswersId) {
    console.error('questionsAnswersId not found');
    return;
  }

  // Mise à jour locale immédiate (UX)
  const answers = new Map(this.selectedAnswers());
  answers.set(questionId, answerId);
  this.selectedAnswers.set(answers);

  // Sauvegarde en base de données 🔥
  const appId = this.applicationId();
  const token = this.quizToken();
  
  if (appId && token) {
    this.isSaving.set(true);
    
    this.applicationService.saveQuizAnswer(
      appId, 
      token, 
      questionId, 
      selectedAnswerObj.questionsAnswersId
    ).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (!response.hasError) {
          console.log('✅ Réponse sauvegardée avec succès');
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('❌ Erreur lors de la sauvegarde:', error);
        // On garde la sélection locale même en cas d'erreur
      }
    });
  }
}
```

**Stockage des paramètres dans `ngOnInit()`**

```typescript
this.applicationId.set(parseInt(applicationId, 10));
this.quizToken.set(quizToken);
```

### 4. Frontend - quiz.html

**Ajout d'un indicateur visuel de sauvegarde**

```html
@if (isSaving()) {
  <div class="saving-indicator">
    <div class="spinner-small"></div>
    <span>Sauvegarde en cours...</span>
  </div>
}
```

### 5. Frontend - quiz.scss

**Styles pour l'indicateur de sauvegarde**

```scss
.saving-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
  padding: 0.5rem;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;

  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid var(--surface-variant);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}
```

## Flux de données complet

### Quand le candidat clique sur une réponse :

1. **Frontend (quiz.ts)** : `selectAnswer()` est appelé
2. **État local mis à jour** : La réponse est marquée comme sélectionnée dans le signal `selectedAnswers`
3. **Appel API** : `applicationService.saveQuizAnswer()` envoie une requête HTTP POST
4. **Backend (ApplicationsController)** : `/save-quiz-answer` reçoit la requête
5. **Business Logic (ApplicationsBusiness)** : `saveQuizAnswer()` traite la requête :
   - ✅ Valide `applicationId` et `quizToken`
   - ✅ Récupère toutes les `candidate_answers` pour la question
   - ✅ Met `is_selected = true` pour la réponse sélectionnée
   - ✅ Met `is_selected = false` pour toutes les autres réponses de cette question
   - ✅ Met à jour `quiz_level` avec l'ordre de la question
   - ✅ Sauvegarde dans la BD via `candidateAnswersRepository.save()`
6. **Réponse au frontend** : Statut de succès ou erreur
7. **Frontend** : Affiche/masque l'indicateur de sauvegarde

## Vérification en base de données

Pour vérifier que les réponses sont sauvegardées :

```sql
-- Voir les réponses sélectionnées pour une application
SELECT 
    ca.id,
    ca.application_id,
    q.question_content,
    a.answer_content,
    ca.is_selected,
    ca.updated_at
FROM candidate_answers ca
JOIN applications app ON ca.application_id = app.id
JOIN questions_answers qa ON ca.questions_answers_id = qa.id
JOIN questions q ON qa.question_id = q.id
JOIN answers a ON qa.answer_id = a.id
WHERE app.id = ? -- Remplacer par l'ID de l'application
ORDER BY q.id, a.id;

-- Voir le quiz_level (progression du candidat)
SELECT 
    id, 
    candidate_email, 
    quiz_level, 
    quiz_status, 
    updated_at
FROM applications
WHERE id = ?;
```

## Points importants

### Sécurité
- Le `quizToken` est validé à chaque appel à `saveQuizAnswer()`
- Empêche un utilisateur malveillant de modifier les réponses d'une autre application

### Performance
- La mise à jour locale est immédiate (meilleure UX)
- La sauvegarde en BD se fait en arrière-plan
- En cas d'erreur réseau, l'utilisateur peut continuer le quiz

### Atomicité
- Chaque sélection de réponse déclenche un appel API individuel
- Pas de perte de données si le navigateur crash
- Pas besoin de "bouton sauvegarder"

### Traçabilité
- Le champ `updated_at` de `candidate_answers` est mis à jour à chaque modification
- Permet de savoir quand le candidat a répondu à chaque question

## Tests à effectuer

1. **Test nominal** : Sélectionner une réponse et vérifier dans la BD que `is_selected = 1`
2. **Test de changement** : Sélectionner une autre réponse à la même question → l'ancienne doit passer à `is_selected = 0`
3. **Test de progression** : Vérifier que `quiz_level` augmente au fur et à mesure
4. **Test de sécurité** : Essayer d'appeler l'API avec un mauvais `quizToken` → doit retourner HTTP 403
5. **Test de résilience** : Couper le réseau pendant la sélection → la sélection locale reste affichée

## Prochaines étapes

- [ ] Tester le flux complet end-to-end
- [ ] Ajouter des tests unitaires pour `saveQuizAnswer()` (backend)
- [ ] Ajouter des tests unitaires pour `selectAnswer()` (frontend)
- [ ] Implémenter la fonctionnalité de reprise du quiz (charger les réponses déjà sélectionnées)
- [ ] Ajouter un mécanisme de retry en cas d'échec de sauvegarde

## Fichiers modifiés

### Backend
- ✅ `quizapp/src/main/java/tech/synelia/quizapp/business/ApplicationsBusiness.java` (ligne ~1000)

### Frontend
- ✅ `quizapp_front/src/app/core/services/application.service.ts`
- ✅ `quizapp_front/src/app/pages/quiz/quiz.ts`
- ✅ `quizapp_front/src/app/pages/quiz/quiz.html`
- ✅ `quizapp_front/src/app/pages/quiz/quiz.scss`

## Compilation et redémarrage

### Backend
```bash
cd quizapp
mvn clean compile -DskipTests
mvn spring-boot:run
```

### Frontend
```bash
cd quizapp_front
npm run start
# Ou si le serveur est déjà lancé, les changements seront détectés automatiquement (hot reload)
```

---

**Date de création** : 10 octobre 2025  
**Auteur** : GitHub Copilot  
**Statut** : ✅ Implémentation terminée - Tests en attente
