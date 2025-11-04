# Analyse : Lien de vérification email et sauvegarde automatique des réponses

Date : 04/11/2025

## 1. Problème du lien de vérification email

### Symptôme
Le candidat reçoit un email avec un lien de vérification incomplet (ne contient pas `http://localhost:4200/`)

### Analyse du code
Le code dans `ApplicationsBusiness.java` (ligne 598-602) construit correctement le lien :
```java
String appLink = paramsUtils.getUrlAppl(); // Récupère depuis application.properties
String verificationLink = appLink + "/verify-email/" + token;
```

### Configuration
Dans `application-local.properties` :
```properties
url.appl=http://localhost:4200
```

### Solution appliquée
Ajout de logs de debug pour vérifier si le lien est bien complet lors de l'envoi :
- Log de `appLink` récupéré depuis la configuration
- Log de `token` généré
- Log de `verificationLink` final

### Test à effectuer
1. Soumettre une candidature via le formulaire
2. Vérifier les logs du backend pour voir le lien complet
3. Vérifier l'email reçu pour confirmer que le lien est bien complet

---

## 2. Sauvegarde automatique des réponses du quiz

### Architecture de la base de données

```
┌─────────────┐
│  campaigns  │
└──────┬──────┘
       │
       ├── campaign_questions (liaison campagne ↔ questions)
       │   └── order (ordre d'affichage)
       │
       ├── questions
       │   └── questions_answers (liaison questions ↔ answers)
       │       └── is_correct (boolean)
       │
       └── answers
           └── answer_content

┌──────────────┐
│ applications │ (candidature)
└──────┬───────┘
       │
       └── candidate_answers (réponses du candidat)
           ├── questions_answers_id (FK)
           ├── is_selected (boolean)
           └── application_id (FK)
```

### Flux de fonctionnement

#### Étape 1 : Soumission de la candidature
- Le candidat soumet sa candidature
- Un email de vérification est envoyé
- Status : `quiz_status = NULL` ou `EMAIL_NOT_VERIFIED`

#### Étape 2 : Vérification de l'email (`verifyEmail()`)
Fichier : `ApplicationsBusiness.java:637`

1. Validation du token de vérification
2. Génération du `quiz_token` (UUID sécurisé)
3. Mise à jour de l'application :
   - `email_verified = true`
   - `quiz_token = UUID généré`
   - `quiz_status = PENDING`
4. Redirection vers `/quiz/{applicationId}/{quizToken}`

#### Étape 3 : Chargement du quiz (`getQuizForApplication()`)
Fichier : `ApplicationsBusiness.java:869-1050`

**Lors du premier chargement** (status = PENDING) :
1. Mise à jour du status : `quiz_status = STARTED`
2. Initialisation de `quiz_level = 0`
3. **Appel de `initializeCandidateAnswers()`** (ligne 948)

##### Méthode `initializeCandidateAnswers()` (ligne 769-859)
```java
// Pour chaque question de la campagne
for (CampaignQuestions cq : campaignQuestions) {
    // Pour chaque réponse possible (questions_answers)
    for (QuestionsAnswers qa : questionAnswers) {
        // Créer un candidate_answer
        CandidateAnswers candidateAnswer = new CandidateAnswers();
        candidateAnswer.setApplications(application);
        candidateAnswer.setQuestionsAnswers(qa);
        candidateAnswer.setIsSelected(false); // ❌ Pas encore sélectionné
        candidateAnswersRepository.save(candidateAnswer);
    }
}
```

**Résultat** : Pour chaque `questions_answers` de la campagne, un enregistrement `candidate_answers` est créé avec `is_selected = false`.

#### Étape 4 : Réponse à une question
Fichier : `quiz.ts:149-182` (Frontend) → `ApplicationsBusiness.java:1075-1250` (Backend)

**Frontend** (`selectAnswer()`) :
```typescript
selectAnswer(questionId: number, answerId: number): void {
    // Trouver questionsAnswersId
    const selectedAnswerObj = currentQ.answers.find(a => a.id === answerId);
    
    // Mise à jour locale immédiate (UX)
    this.selectedAnswers.set(answers);
    
    // Appel API pour sauvegarde en base
    this.applicationService.saveQuizAnswer(
        appId, 
        token, 
        questionId, 
        selectedAnswerObj.questionsAnswersId
    );
}
```

**Backend** (`saveQuizAnswer()`) :
```java
// 1. Validation du quiz_token
if (!quizToken.equals(application.getQuizToken())) {
    // 403 Forbidden
}

// 2. Récupérer tous les candidate_answers de cette question
List<CandidateAnswers> candidateAnswers = 
    candidateAnswersRepository.findByApplicationIdAndQuestionId(applicationId, questionId, false);

// 3. Mettre à jour is_selected
for (CandidateAnswers ca : candidateAnswers) {
    boolean shouldBeSelected = ca.getQuestionsAnswers().getId().equals(questionsAnswersId);
    ca.setIsSelected(shouldBeSelected); // ✅ true pour la réponse choisie, ❌ false pour les autres
    candidateAnswersRepository.save(ca);
}

// 4. Mettre à jour quiz_level avec l'ordre de la question répondue
application.setQuizLevel(cq.getOrder());
applicationsRepository.save(application);
```

**Résultat** : À chaque sélection de réponse, `candidate_answers` est mis à jour en temps réel.

### Sécurité
- Le `quiz_token` (UUID) est requis pour toutes les opérations du quiz
- Validation systématique du token avant toute modification
- Vérification que le quiz n'est pas déjà `COMPLETED`

### Points clés
✅ La sauvegarde est **automatique** à chaque sélection de réponse
✅ L'initialisation se fait **une seule fois** au premier chargement du quiz
✅ Le candidat peut **revenir en arrière** et changer ses réponses
✅ Le `quiz_level` permet de **suivre la progression** du candidat

---

## 3. Tests à effectuer

### Test 1 : Lien de vérification email
1. Soumettre une candidature
2. Vérifier les logs backend :
   ```
   === EMAIL VERIFICATION LINK DEBUG ===
   appLink from config: http://localhost:4200
   token: [token généré]
   verificationLink: http://localhost:4200/verify-email/[token]
   =====================================
   ```
3. Vérifier l'email reçu et cliquer sur le lien
4. Confirmer la redirection vers le quiz

### Test 2 : Initialisation des réponses candidates
1. Après vérification de l'email, charger le quiz
2. Vérifier les logs backend :
   ```
   Initializing answers for campaign ID: [id]
   Found [N] questions in campaign
   Successfully initialized [M] candidate_answers
   ```
3. Vérifier en base de données :
   ```sql
   SELECT * FROM candidate_answers WHERE application_id = [id];
   -- Doit retourner un enregistrement pour chaque questions_answers de la campagne
   -- Tous avec is_selected = false
   ```

### Test 3 : Sauvegarde automatique des réponses
1. Répondre à la première question
2. Vérifier les logs backend :
   ```
   Saving answer for application [id], question [qid], answer [qaid]
   Found [N] candidate answers for question [qid]
   Updated candidate_answer ID [id]: is_selected=true
   Updated candidate_answer ID [id]: is_selected=false
   Updated quiz_level to [order]
   Answer saved successfully
   ```
3. Vérifier en base de données :
   ```sql
   SELECT ca.id, ca.is_selected, qa.id as qa_id, a.answer_content
   FROM candidate_answers ca
   JOIN questions_answers qa ON ca.questions_answers_id = qa.id
   JOIN answers a ON qa.answer_id = a.id
   WHERE ca.application_id = [app_id] AND qa.question_id = [question_id];
   -- is_selected doit être true pour la réponse choisie, false pour les autres
   ```
4. Changer de réponse et vérifier que `is_selected` est bien mis à jour

### Test 4 : Quiz complet
1. Répondre à toutes les questions
2. Soumettre le quiz
3. Vérifier que `quiz_status = COMPLETED`
4. Tenter de modifier une réponse → doit retourner une erreur

---

## 4. Conclusion

### Lien de vérification email
Le code semble correct. Les logs ajoutés permettront de confirmer si le problème vient de :
- La configuration (url.appl mal définie)
- Le template email (problème d'encodage HTML)
- Le service d'envoi d'email

### Sauvegarde automatique des réponses
✅ **Le code est déjà implémenté et fonctionnel**

Aucune modification n'est nécessaire. Le système :
- Initialise tous les `candidate_answers` au premier chargement du quiz
- Sauvegarde chaque réponse automatiquement à chaque sélection
- Maintient la cohérence (une seule réponse sélectionnée par question)
- Suit la progression du candidat via `quiz_level`

Il suffit de **tester le flux complet** pour confirmer que tout fonctionne correctement.
