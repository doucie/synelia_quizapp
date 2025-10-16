# Correction: Injection des dépendances dans HostingUtils

## Problème identifié
- ✅ Le token de vérification est bien créé dans `email_verification_token`
- ❌ Aucun email n'est envoyé

**Cause root**: Les dépendances `ParamsUtils`, `TemplateEngine` et `ExceptionUtils` dans `HostingUtils` n'étaient pas injectées avec `@Autowired`, donc `paramsUtils` était `null` et l'envoi d'email échouait silencieusement.

## Corrections appliquées

### 1. Ajout des `@Autowired` dans `HostingUtils.java`

```java
@Component
public class HostingUtils {

	@Autowired  // ✅ AJOUTÉ
	private ParamsUtils paramsUtils;

	@Autowired  // ✅ AJOUTÉ
	private TemplateEngine templateEngine;

	@Autowired  // ✅ AJOUTÉ
	private ExceptionUtils exceptionUtils;
	
	// ...
}
```

### 2. Ajout de logs détaillés dans `sendEmail()`

Pour faciliter le débogage, j'ai ajouté des logs :
- Log au début de `sendEmail()` avec les destinataires
- Log des paramètres SMTP (host, port)
- Log de succès d'envoi d'email
- Logs d'erreur détaillés en cas d'exception
- Log si SMTP server est null

```java
slf4jLogger.info("----begin sendEmail-----");
slf4jLogger.info("From: {}, To: {}, Subject: {}", from.get("email"), 
    toRecipients.stream().map(r -> r.get("email")).toList(), subject);
slf4jLogger.info("SMTP Server: {}, Port: {}", smtpServer, paramsUtils.getSmtpPort());
// ...
slf4jLogger.info("Email envoyé avec succès à: {}", 
    toRecipients.stream().map(r -> r.get("email")).toList());
```

### 3. Ajout des propriétés manquantes dans `application-local.properties`

```properties
# Custom SMTP parameters (used by HostingUtils via ParamsUtils)
smtp.mail.adresse=backend.test.k0u4@gmail.com
smtp.mail.password=T4ST%test
smtp.mail.host=smtp.gmail.com
smtp.mail.port=587

# URL Configuration
url.appl=http://localhost:4200
url.admin=http://localhost:4200/admin
```

## Test de la correction

### 1. Redémarrer le backend
```bash
# Arrêter le serveur Spring Boot
# Puis redémarrer
mvn spring-boot:run
```

### 2. Soumettre une candidature
Allez sur le frontend et soumettez une nouvelle candidature.

### 3. Vérifier les logs
Recherchez dans les logs du backend :

```
----begin sendEmail-----
From: backend.test.k0u4@gmail.com, To: [email@candidat.com], Subject: Vérification de votre adresse email - Synelia
SMTP Server: smtp.gmail.com, Port: 587
...
Email envoyé avec succès à: [email@candidat.com]
----end sendEmail-----
```

### 4. Vérifier la base de données
```sql
-- Token créé
SELECT * FROM email_verification_token ORDER BY created_at DESC LIMIT 1;
```

### 5. Vérifier la boîte mail
Le candidat devrait recevoir l'email de vérification dans sa boîte de réception (ou spam).

## Configuration Gmail pour les tests

⚠️ **Important**: Pour que Gmail fonctionne, vous devez :

### Option 1: Mot de passe d'application (Recommandé)
1. Activez la validation en 2 étapes sur votre compte Gmail
2. Générez un "Mot de passe d'application" : https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `smtp.mail.password`

### Option 2: Autoriser les applications moins sécurisées (Non recommandé)
1. Allez sur https://myaccount.google.com/lesssecureapps
2. Activez "Autoriser les applications moins sécurisées"
3. Utilisez votre mot de passe Gmail normal

## Structure du flux complet

```
1. Candidat soumet formulaire
   ↓
2. Backend: ApplicationsBusiness.create()
   - Enregistre l'application
   ↓
3. Backend: createVerificationTokenAndSendEmail()
   - Crée le token en DB
   - Appelle HostingUtils.sendEmail()
   ↓
4. Backend: HostingUtils.sendEmail()
   - ✅ ParamsUtils injecté (CORRIGÉ)
   - Récupère config SMTP
   - Configure JavaMailSender
   - Template email avec Thymeleaf
   - Envoie l'email
   ↓
5. Candidat reçoit l'email
   - Clique sur le lien de vérification
   ↓
6. Frontend: /verify-email/:token (TODO)
   ↓
7. Backend: verify token endpoint (TODO)
   - Marque token comme utilisé
   - Met à jour emailVerified = true
```

## Dépannage

### Erreur: "SMTP Server est null"
- Vérifiez que `smtp.mail.host` est bien défini dans `application-local.properties`
- Vérifiez que le profil `local` est actif

### Erreur: "Authentication failed"
- Vérifiez les credentials Gmail
- Assurez-vous d'utiliser un "Mot de passe d'application" si la 2FA est activée

### Erreur: "Could not connect to SMTP host"
- Vérifiez votre connexion internet
- Vérifiez que le port 587 n'est pas bloqué par un firewall

### L'email n'est pas reçu
- Vérifiez le dossier spam
- Vérifiez les logs pour confirmer l'envoi
- Vérifiez que l'adresse email du candidat est valide

## Fichiers modifiés

1. ✅ `HostingUtils.java` - Ajout @Autowired + logs
2. ✅ `ApplicationsBusiness.java` - Création token + envoi email
3. ✅ `application-local.properties` - Ajout config SMTP
