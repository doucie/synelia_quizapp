# 🧪 Guide de test - Vérification d'email

## ✅ Ce qui a été implémenté

1. ✅ Route frontend `/verify-email/:token`
2. ✅ Composant `VerifyEmailComponent` avec 3 états (loading, success, error)
3. ✅ Service `ApplicationService.verifyEmail(token)`
4. ✅ Endpoint backend `POST /applications/verify-email`
5. ✅ Logique métier dans `ApplicationsBusiness.verifyEmail()`
6. ✅ Mise à jour de `is_used` et `email_verified` en base de données

## 🚀 Comment tester maintenant

### Étape 1: Redémarrer le backend (IMPORTANT)

```bash
# Arrêter le serveur actuel (Ctrl+C)
cd quizapp
mvn spring-boot:run
```

**Pourquoi ?** Les nouvelles modifications (endpoint `/verify-email`) doivent être compilées et chargées.

### Étape 2: Le frontend devrait se recompiler automatiquement

Si ce n'est pas le cas :
```bash
# Dans un autre terminal
cd quizapp_front
npm start
```

### Étape 3: Tester le flux complet

#### 3.1. Soumettre une nouvelle candidature
```
1. Aller sur : http://localhost:4200/postuler/[votre-source-token]
2. Remplir le formulaire
3. Soumettre
```

#### 3.2. Vérifier l'email reçu
Vous devriez recevoir un email avec un lien comme :
```
http://localhost:4200/verify-email/df3a60e8e3b04645b4704112770274117df97d3aadb14680b0ac17211c37f567
```

#### 3.3. Cliquer sur le lien

**Ce qui devrait se passer** :

**Immédiatement (1-2 secondes)** :
- Page affichée avec un spinner
- Message : "Vérification en cours..."

**Après l'appel API (succès)** :
- ✅ Icône verte animée
- Message : "Email vérifié avec succès !"
- Sous-message : "Vous allez être redirigé vers le questionnaire..."
- **Redirection automatique après 3 secondes** vers `/quiz/:applicationId`

**En cas d'erreur** :
- ❌ Icône rouge
- Message d'erreur explicite
- Bouton "Retour à l'accueil"

### Étape 4: Vérifier la base de données

#### Token marqué comme utilisé
```sql
SELECT 
    id,
    email,
    token_type,
    is_used,
    created_at,
    used_at,
    LEFT(token, 20) as token_preview
FROM email_verification_token 
ORDER BY created_at DESC 
LIMIT 5;
```

**Résultat attendu** :
```
is_used = 1 (true)
used_at = 2025-10-09 15:30:45 (heure actuelle)
```

#### Email vérifié dans applications
```sql
SELECT 
    id,
    candidate_first_name,
    candidate_last_name,
    candidate_email,
    email_verified,
    created_at,
    updated_at
FROM applications 
ORDER BY created_at DESC 
LIMIT 5;
```

**Résultat attendu** :
```
email_verified = 1 (true)
updated_at = 2025-10-09 15:30:45 (heure actuelle)
```

### Étape 5: Vérifier les logs backend

Cherchez dans les logs :

```
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : ----begin verifyEmail-----
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : Vérification du token: df3a60e8e3b04645...
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : Token marqué comme utilisé
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : Email vérifié pour l'application ID: 123
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : Email vérifié avec succès pour: candidat@test.com
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : ----end verifyEmail-----
```

### Étape 6: Tester les cas d'erreur

#### 6.1. Cliquer à nouveau sur le même lien (token déjà utilisé)
**Résultat attendu** :
- ❌ Message : "Ce lien de vérification a déjà été utilisé"
- Bouton "Retour à l'accueil"

#### 6.2. Modifier le token dans l'URL (token invalide)
```
http://localhost:4200/verify-email/INVALID_TOKEN_123
```
**Résultat attendu** :
- ❌ Message : "Token de vérification invalide ou expiré"

#### 6.3. Accéder à la route sans token
```
http://localhost:4200/verify-email/
```
**Résultat attendu** :
- Redirection vers la page d'accueil (route non trouvée)

## 📊 Checklist de validation

- [ ] Le backend redémarre sans erreur
- [ ] Le frontend se recompile sans erreur
- [ ] La route `/verify-email/:token` est accessible
- [ ] Le composant s'affiche avec le loader
- [ ] L'appel API `/applications/verify-email` fonctionne
- [ ] Le token est marqué comme utilisé en base (`is_used = 1`)
- [ ] L'email est vérifié en base (`email_verified = 1`)
- [ ] Le message de succès s'affiche
- [ ] La redirection vers `/quiz/:id` se fait (même si la page n'existe pas encore)
- [ ] Cliquer à nouveau affiche "déjà utilisé"
- [ ] Un token invalide affiche une erreur

## 🐛 Dépannage

### Le lien ne charge rien
- ✅ Vérifiez que le frontend est démarré
- ✅ Ouvrez la console navigateur (F12) pour voir les erreurs
- ✅ Vérifiez que l'URL est correcte : `http://localhost:4200/verify-email/[token]`

### Erreur 404 sur l'API
- ✅ Vérifiez que le backend est bien redémarré
- ✅ Vérifiez l'URL dans `environment.ts` : `http://localhost:8081/api`
- ✅ Testez l'endpoint avec Postman :
```json
POST http://localhost:8081/api/applications/verify-email
{
  "user": 1,
  "data": {
    "searchString": "votre-token-ici",
    "candidateFirstName": "",
    "candidateLastName": "",
    "candidateEmail": "",
    "candidatePhone": "",
    "candidateBirthDate": ""
  }
}
```

### La page reste en "Vérification en cours..."
- ✅ Ouvrez la console navigateur (F12) → onglet Network
- ✅ Vérifiez si l'appel API `/verify-email` est fait
- ✅ Vérifiez la réponse de l'API
- ✅ Vérifiez les logs backend pour voir l'erreur

### Le token n'est pas trouvé
- ✅ Vérifiez que le token en base correspond exactement à celui de l'URL
- ✅ Vérifiez que le token n'a pas expiré (< 48h)
- ✅ Utilisez cette requête SQL :
```sql
SELECT * FROM email_verification_token 
WHERE token = 'votre-token-ici';
```

### Erreur "Token déjà utilisé" mais c'est la première fois
- ✅ Vérifiez en base que `is_used = 0` :
```sql
SELECT is_used, used_at FROM email_verification_token 
WHERE token = 'votre-token-ici';
```
- ✅ Si `is_used = 1`, générez une nouvelle candidature pour avoir un nouveau token

## 🎯 Prochaine étape : Page du QCM

Actuellement, après vérification, le système redirige vers `/quiz/:applicationId`, mais cette page n'existe pas encore.

**À créer** :
1. Route `/quiz/:applicationId` dans `app.routes.ts`
2. Composant `QuizComponent`
3. Logique pour charger les questions de la campagne
4. Interface pour répondre aux questions
5. Enregistrement des réponses et calcul du score

---

**Le système de vérification d'email est maintenant opérationnel ! 🎉**

Testez le en suivant les étapes ci-dessus et vérifiez que tout fonctionne comme prévu.
