# Correction: Envoi d'email de vérification après candidature

## Problème identifié
Après l'envoi d'un formulaire valide via `apply-position` dans le frontend :
- ✅ Les informations du candidat sont enregistrées dans la table `applications`
- ❌ Aucun enregistrement n'est créé dans `email_verification_token`
- ❌ Aucun email de vérification n'est envoyé au candidat

## Solution implémentée

### Modifications dans `ApplicationsBusiness.java`

#### 1. Ajout des dépendances nécessaires
```java
@Autowired
private EmailVerificationTokenRepository emailVerificationTokenRepository;
@Autowired
private HostingUtils hostingUtils;
@Autowired
private ParamsUtils paramsUtils;
```

#### 2. Nouvelle méthode `generateVerificationToken()`
Génère un token unique et sécurisé de 64 caractères basé sur UUID.

#### 3. Nouvelle méthode `createVerificationTokenAndSendEmail()`
Cette méthode :
- Génère un token unique
- Crée un enregistrement `EmailVerificationToken` avec :
  - Email du candidat
  - Token généré
  - Type: `APPLICATION_VERIFICATION`
  - Date d'expiration: 48 heures
  - Lien vers l'application créée
- Envoie un email de vérification au candidat avec :
  - Un lien de vérification cliquable
  - Instructions claires
  - Design professionnel

#### 4. Intégration dans la méthode `create()`
Après l'enregistrement réussi des applications, la méthode appelle `createVerificationTokenAndSendEmail()` pour chaque application créée.

**Important**: Si l'envoi de l'email échoue, le processus continue (l'échec de l'email ne bloque pas la création de la candidature).

## Flux du processus

1. Le candidat soumet le formulaire via `/apply-position/:sourceToken`
2. Le frontend appelle `/applications/create`
3. Le backend crée l'application dans la table `applications`
4. **NOUVEAU**: Le backend crée un token dans `email_verification_token`
5. **NOUVEAU**: Le backend envoie un email avec le lien de vérification
6. Le candidat reçoit l'email et clique sur le lien
7. Le lien redirige vers `/verify-email/:token` (à implémenter côté frontend)

## Structure de l'email

```
Sujet: Vérification de votre adresse email - Synelia

Bonjour [Prénom] [Nom],

Merci d'avoir soumis votre candidature chez Synelia !

Pour continuer le processus de recrutement, veuillez vérifier votre adresse 
email en cliquant sur le bouton ci-dessous :

[Bouton: Vérifier mon email]

Ou copiez ce lien dans votre navigateur :
http://localhost:4200/verify-email/[TOKEN]

Ce lien est valide pendant 48 heures.

Si vous n'avez pas soumis de candidature chez Synelia, veuillez ignorer cet email.

Cordialement,
L'équipe Synelia
```

## Tests à effectuer

### 1. Test de création de candidature
```bash
# Soumettre une candidature via le frontend
# Vérifier dans la table applications
SELECT * FROM applications ORDER BY created_at DESC LIMIT 1;

# Vérifier dans la table email_verification_token
SELECT * FROM email_verification_token ORDER BY created_at DESC LIMIT 1;
```

### 2. Vérifier les logs backend
```bash
# Rechercher les logs suivants :
# - "Token de vérification créé avec succès pour l'email: [email]"
# - "Email de vérification envoyé avec succès à: [email]"
```

### 3. Vérifier la réception de l'email
- Vérifier la boîte mail du candidat
- Cliquer sur le lien de vérification (nécessite l'implémentation de la page de vérification)

## Configuration SMTP requise

Assurez-vous que les paramètres SMTP sont correctement configurés dans `application.properties` :

```properties
smtp.mail.host=smtp.gmail.com
smtp.mail.port=587
smtp.mail.adresse=votre-email@domain.com
smtp.mail.password=votre-mot-de-passe
url.appl=http://localhost:4200
```

## Prochaines étapes (TODO)

### Frontend
1. ✅ Formulaire de candidature fonctionnel
2. ❌ Page de vérification d'email `/verify-email/:token`
3. ❌ Affichage du message de succès après vérification
4. ❌ Gestion des erreurs (token invalide/expiré)

### Backend
1. ✅ Création du token de vérification
2. ✅ Envoi de l'email
3. ❌ Endpoint pour vérifier le token (POST `/applications/verify-email`)
4. ❌ Mise à jour du statut `emailVerified` après vérification

## Dépannage

### Si aucun token n'est créé
- Vérifier les logs backend pour les erreurs
- Vérifier que `EmailVerificationTokenRepository` est bien injecté
- Vérifier que la table `email_verification_token` existe en base de données

### Si aucun email n'est envoyé
- Vérifier la configuration SMTP
- Vérifier les logs pour "Échec de l'envoi de l'email"
- Tester la connexion SMTP manuellement
- Vérifier que `HostingUtils` et `ParamsUtils` sont bien configurés

### Si l'email est envoyé mais non reçu
- Vérifier le dossier spam
- Vérifier que l'adresse email est valide
- Vérifier les limites d'envoi du serveur SMTP
