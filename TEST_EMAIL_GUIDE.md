# 🔧 Guide de test rapide - Envoi d'email de vérification

## ✅ Corrections appliquées

1. **ApplicationsBusiness.java** : Ajout de la logique de création de token + envoi email
2. **HostingUtils.java** : Ajout des `@Autowired` pour injection des dépendances
3. **application-local.properties** : Ajout des paramètres SMTP manquants

## 🧪 Comment tester

### Étape 1: Redémarrer le backend

```bash
# Dans le terminal
cd quizapp
mvn spring-boot:run
```

Ou utilisez le bouton de redémarrage dans VS Code.

### Étape 2: Soumettre une candidature

1. Allez sur http://localhost:4200
2. Naviguez vers la page de candidature avec un token source valide
3. Remplissez le formulaire avec **une vraie adresse email** que vous pouvez consulter
4. Soumettez le formulaire

### Étape 3: Vérifier les logs backend

Cherchez dans la console/logs les messages suivants :

```
✅ Token de vérification créé avec succès pour l'email: [email]
✅ ----begin sendEmail-----
✅ From: backend.test.k0u4@gmail.com, To: [[email]], Subject: Vérification...
✅ SMTP Server: smtp.gmail.com, Port: 587
✅ Email envoyé avec succès à: [[email]]
✅ ----end sendEmail-----
```

### Étape 4: Vérifier la base de données

```sql
-- Voir le token créé
SELECT 
    id, 
    email, 
    token_type, 
    is_used, 
    created_at, 
    expires_at,
    LEFT(token, 20) as token_preview
FROM email_verification_token 
ORDER BY created_at DESC 
LIMIT 5;
```

Vous devriez voir :
- ✅ Un nouveau token avec le bon email
- ✅ `token_type` = 'APPLICATION_VERIFICATION'
- ✅ `is_used` = 0 (false)
- ✅ `expires_at` = 48h dans le futur

### Étape 5: Vérifier l'email reçu

1. Ouvrez la boîte mail du candidat
2. Cherchez l'email avec le sujet : **"Vérification de votre adresse email - Synelia"**
3. Vérifiez le contenu :
   - Nom du candidat personnalisé
   - Lien de vérification cliquable
   - Lien en texte brut
   - Message de 48h de validité

⚠️ **Note**: Si vous utilisez Gmail, l'email peut arriver dans les spams la première fois.

## 🐛 Problèmes courants

### ❌ Erreur: "SMTP Server est null"
**Solution**: Les propriétés SMTP ne sont pas chargées
```properties
# Vérifiez dans application-local.properties :
smtp.mail.host=smtp.gmail.com
smtp.mail.port=587
smtp.mail.adresse=backend.test.k0u4@gmail.com
smtp.mail.password=VOTRE_MOT_DE_PASSE
```

### ❌ Erreur: "Authentication failed"
**Solution**: Gmail bloque l'accès
1. Créez un "Mot de passe d'application" Gmail
2. Remplacez `smtp.mail.password` par ce mot de passe

### ❌ Email non reçu mais logs OK
**Solutions possibles**:
- Vérifiez les spams
- Vérifiez que l'email du candidat est valide
- Attendez quelques minutes (délai SMTP)
- Vérifiez les limites d'envoi Gmail

### ❌ Token créé mais pas d'email
**Solution**: Vérifiez les logs pour voir l'erreur d'envoi
```
# Cherchez dans les logs :
"Échec de l'envoi de l'email de vérification"
"Erreur MessagingException"
```

## 📊 Exemple de résultat attendu

### Logs backend
```
INFO  --- [nio-8081-exec-3] t.s.q.business.ApplicationsBusiness     : Token de vérification créé avec succès pour l'email: candidat@test.com
INFO  --- [nio-8081-exec-3] t.synelia.quizapp.utils.HostingUtils   : ----begin sendEmail-----
INFO  --- [nio-8081-exec-3] t.synelia.quizapp.utils.HostingUtils   : From: backend.test.k0u4@gmail.com, To: [candidat@test.com], Subject: Vérification de votre adresse email - Synelia
INFO  --- [nio-8081-exec-3] t.synelia.quizapp.utils.HostingUtils   : SMTP Server: smtp.gmail.com, Port: 587
DEBUG --- [nio-8081-exec-3] org.springframework.mail                : JavaMail version: 2.0.1
...
INFO  --- [nio-8081-exec-3] t.synelia.quizapp.utils.HostingUtils   : Email envoyé avec succès à: [candidat@test.com]
INFO  --- [nio-8081-exec-3] t.synelia.quizapp.utils.HostingUtils   : ----end sendEmail-----
```

### Email reçu
```
Bonjour Jean Dupont,

Merci d'avoir soumis votre candidature chez Synelia !

Pour continuer le processus de recrutement, veuillez vérifier votre 
adresse email en cliquant sur le bouton ci-dessous :

[Vérifier mon email]

Ou copiez ce lien dans votre navigateur :
http://localhost:4200/verify-email/a1b2c3d4e5f6...

Ce lien est valide pendant 48 heures.

Cordialement,
L'équipe Synelia
```

## ✨ Prochaines étapes

Une fois que l'envoi d'email fonctionne :

1. [ ] Créer la page frontend `/verify-email/:token`
2. [ ] Créer l'endpoint backend `/applications/verify-email`
3. [ ] Mettre à jour `emailVerified` à `true` après vérification
4. [ ] Rediriger vers une page de succès
5. [ ] Gérer les cas d'erreur (token expiré, invalide, déjà utilisé)

## 📝 Configuration Gmail recommandée

### Pour les tests de développement :

1. **Créer un compte Gmail de test dédié**
   - Ne pas utiliser votre compte principal
   - Exemple : `votre-app-test@gmail.com`

2. **Activer la validation en 2 étapes**
   - https://myaccount.google.com/security

3. **Générer un mot de passe d'application**
   - https://myaccount.google.com/apppasswords
   - Application : "Mail"
   - Appareil : "Autre (nom personnalisé)"
   - Copiez le mot de passe généré

4. **Mettre à jour application-local.properties**
   ```properties
   smtp.mail.adresse=votre-app-test@gmail.com
   smtp.mail.password=VOTRE_MOT_DE_PASSE_APPLICATION
   ```

---

**Besoin d'aide ?** Consultez les fichiers suivants :
- `FIX_EMAIL_VERIFICATION.md` - Documentation complète
- `FIX_HOSTINGUTILS_INJECTION.md` - Détails de la correction
