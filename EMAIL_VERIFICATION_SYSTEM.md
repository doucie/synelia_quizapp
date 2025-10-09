# ✅ Système de vérification d'email par lien - Implémenté

## 🎯 Objectif

Permettre aux candidats de vérifier leur adresse email en cliquant sur le lien reçu par email après avoir soumis leur candidature.

## 🔄 Flux complet

```
1. Candidat soumet le formulaire de candidature
   ↓
2. Backend crée l'application + token de vérification
   ↓
3. Email envoyé avec lien : /verify-email/{token}
   ↓
4. Candidat clique sur le lien dans l'email
   ↓
5. Frontend : VerifyEmailComponent charge et affiche l'état
   ↓
6. Appel API : POST /applications/verify-email
   ↓
7. Backend vérifie le token et met à jour la DB :
   - email_verification_token.is_used = true
   - applications.email_verified = true
   ↓
8. Redirection automatique vers le QCM (après 3 secondes)
```

## 📁 Fichiers créés/modifiés

### Frontend

#### 1. **app.routes.ts** - Nouvelle route
```typescript
{
  path: 'verify-email/:token',
  loadComponent: () => import('./pages/verify-email').then(m => m.VerifyEmailComponent)
}
```

#### 2. **pages/verify-email/** - Nouveau composant
- `verify-email.ts` - Logique du composant
- `verify-email.html` - Template avec 3 états (loading, success, error)
- `verify-email.scss` - Styles avec animations
- `index.ts` - Export du composant

**Fonctionnalités** :
- ✅ Récupère le token depuis l'URL
- ✅ Appelle l'API backend
- ✅ Affiche un loader pendant la vérification
- ✅ Affiche le succès avec animation
- ✅ Affiche les erreurs (token invalide, expiré, déjà utilisé)
- ✅ Redirection automatique vers le QCM après 3 secondes

#### 3. **core/services/application.service.ts** - Nouvelle méthode
```typescript
verifyEmail(token: string): Observable<ApplicationResponse>
```

### Backend

#### 1. **ApplicationsController.java** - Nouveau endpoint
```java
@RequestMapping(value="/verify-email", method=RequestMethod.POST)
public Response<ApplicationsDto> verifyEmail(@RequestBody Request<ApplicationsDto> request)
```

#### 2. **ApplicationsBusiness.java** - Nouvelle méthode
```java
public Response<ApplicationsDto> verifyEmail(Request<ApplicationsDto> request, Locale locale)
```

**Logique de vérification** :
1. ✅ Récupère le token depuis la requête
2. ✅ Cherche le token dans `email_verification_token`
3. ✅ Vérifie que le token existe
4. ✅ Vérifie que le token n'est pas déjà utilisé
5. ✅ Vérifie que le token n'est pas expiré (48h)
6. ✅ Vérifie que le type est `APPLICATION_VERIFICATION`
7. ✅ Marque le token comme utilisé (`is_used = true`, `used_at = now`)
8. ✅ Met à jour l'application (`email_verified = true`)
9. ✅ Retourne l'application mise à jour

## 🧪 Comment tester

### 1. Soumettre une candidature
```
1. Aller sur http://localhost:4200/postuler/:sourceToken
2. Remplir le formulaire
3. Soumettre
```

### 2. Vérifier l'email reçu
```
- Sujet : "Vérification de votre adresse email - Synelia"
- Lien : http://localhost:4200/verify-email/df3a60e8e3b04645...
```

### 3. Cliquer sur le lien
Le candidat sera redirigé vers la page de vérification qui affichera :
- **Pendant 1-2 secondes** : Loader avec message "Vérification en cours..."
- **En cas de succès** : ✅ Icône verte, message de succès, redirection automatique vers le QCM
- **En cas d'erreur** : ❌ Icône rouge, message d'erreur, bouton retour à l'accueil

### 4. Vérifier la base de données

#### Token vérifié
```sql
SELECT * FROM email_verification_token 
WHERE token = 'df3a60e8e3b04645b4704112770274117df97d3aadb14680b0ac17211c37f567';

-- Résultat attendu :
-- is_used = 1 (true)
-- used_at = 2025-10-09 ...
```

#### Application vérifiée
```sql
SELECT id, candidate_email, email_verified, created_at 
FROM applications 
ORDER BY created_at DESC 
LIMIT 1;

-- Résultat attendu :
-- email_verified = 1 (true)
```

### 5. Vérifier les logs backend
```
INFO  --- Token de vérification créé avec succès pour l'email: [...]
INFO  --- ----begin verifyEmail-----
INFO  --- Vérification du token: df3a60e8e3b04645...
INFO  --- Token marqué comme utilisé
INFO  --- Email vérifié pour l'application ID: 123
INFO  --- Email vérifié avec succès pour: candidat@test.com
INFO  --- ----end verifyEmail-----
```

## ⚠️ Gestion des erreurs

### Token invalide ou inexistant
```
HTTP 404
Message : "Token de vérification invalide ou expiré"
```

### Token déjà utilisé
```
HTTP 400
Message : "Ce lien de vérification a déjà été utilisé"
```

### Token expiré (> 48h)
```
HTTP 400
Message : "Ce lien de vérification a expiré"
```

### Type de token incorrect
```
HTTP 400
Message : "Type de token invalide"
```

## 🎨 Interface utilisateur

### État de chargement
- Spinner animé
- Message : "Vérification en cours..."

### État de succès
- Icône verte avec animation de scale
- Message : "Email vérifié avec succès !"
- Sous-message : "Vous allez être redirigé vers le questionnaire..."
- **Redirection automatique après 3 secondes**

### État d'erreur
- Icône rouge avec animation
- Message d'erreur contextuel
- Bouton "Retour à l'accueil"

## 📊 Base de données

### Table `email_verification_token`
```sql
-- Avant vérification
is_used = 0
used_at = NULL

-- Après vérification
is_used = 1
used_at = '2025-10-09 14:23:45'
```

### Table `applications`
```sql
-- Avant vérification
email_verified = 0

-- Après vérification
email_verified = 1
updated_at = '2025-10-09 14:23:45'
```

## 🔜 Prochaines étapes

### Redirection vers le QCM
Actuellement, le code redirige vers `/quiz/:applicationId`, mais cette route doit être créée :

```typescript
// Dans verify-email.ts, ligne 53-56
setTimeout(() => {
  const application = response.items[0];
  // TODO: Créer la route /quiz/:applicationId
  this.router.navigate(['/quiz', application.id]);
}, 3000);
```

**À faire** :
1. [ ] Créer la route `/quiz/:applicationId` dans `app.routes.ts`
2. [ ] Créer le composant `QuizComponent`
3. [ ] Charger les questions du QCM pour la campagne
4. [ ] Permettre au candidat de répondre au QCM
5. [ ] Enregistrer les réponses et calculer le score

## 🐛 Débogage

### Le lien ne fonctionne pas
- Vérifiez que le frontend est démarré sur le bon port (4200)
- Vérifiez que le backend est démarré
- Vérifiez que le token est correct dans l'URL

### Erreur 404 sur l'API
- Vérifiez que le backend est bien démarré
- Vérifiez l'URL de l'API dans `environment.ts`

### Token toujours invalide
- Vérifiez que le token dans l'URL correspond exactement à celui en base
- Vérifiez que le token n'a pas expiré (< 48h)
- Vérifiez les logs backend pour voir l'erreur exacte

## ✅ Checklist de test

- [ ] Soumettre une candidature
- [ ] Recevoir l'email de vérification
- [ ] Cliquer sur le lien dans l'email
- [ ] Voir la page de vérification s'afficher
- [ ] Voir le message de succès
- [ ] Vérifier `is_used = true` en base de données
- [ ] Vérifier `email_verified = true` en base de données
- [ ] Tester de cliquer à nouveau sur le même lien (doit afficher "déjà utilisé")
- [ ] Attendre 3 secondes et voir la redirection (vers /quiz)

---

**Système de vérification d'email opérationnel ! 🎉**

Le lien `/verify-email/df3a60e8e3b04645b4704112770274117df97d3aadb14680b0ac17211c37f567` devrait maintenant fonctionner correctement !
