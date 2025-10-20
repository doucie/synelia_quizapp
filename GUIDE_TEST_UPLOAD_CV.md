# 🧪 Guide de Test - Upload des CVs

## 📋 Checklist de tests

### 1️⃣ Tests Backend (Spring Boot)

#### Démarrage du serveur
```bash
cd quizapp
mvn spring-boot:run
```

Vérifier dans les logs :
```
✅ Server started on port 8081
✅ No error about multipart configuration
✅ /files/upload/cv endpoint available
```

#### Test avec Postman/cURL

**Test 1 : Upload d'un CV valide (PDF)**
```bash
curl -X POST http://localhost:8081/files/upload/cv \
  -F "file=@test_cv.pdf" \
  -F "candidateEmail=test@example.com" \
  -F "fileType=cv"
```

Réponse attendue :
```json
{
  "success": true,
  "filePath": "uploads/cv/test_at_example_com_1729432156789.pdf",
  "fileName": "test_cv.pdf",
  "fileSize": 245678,
  "message": "Fichier uploadé avec succès"
}
```

**Test 2 : Fichier trop volumineux (> 5 Mo)**
```bash
curl -X POST http://localhost:8081/files/upload/cv \
  -F "file=@large_file.pdf" \
  -F "candidateEmail=test@example.com"
```

Réponse attendue : Status 400
```json
{
  "success": false,
  "error": "Le fichier est trop volumineux. Taille maximale: 5 Mo..."
}
```

**Test 3 : Type de fichier invalide (.txt)**
```bash
curl -X POST http://localhost:8081/files/upload/cv \
  -F "file=@document.txt" \
  -F "candidateEmail=test@example.com"
```

Réponse attendue : Status 400
```json
{
  "success": false,
  "error": "Type de fichier non supporté. Formats acceptés: PDF, DOC, DOCX"
}
```

**Test 4 : Téléchargement du CV**
```bash
curl -X GET http://localhost:8081/files/download/test_at_example_com_1729432156789.pdf \
  -o downloaded_cv.pdf
```

Réponse attendue : Fichier téléchargé avec succès

**Test 5 : Vérification de l'existence**
```bash
curl -X GET http://localhost:8081/files/exists/test_at_example_com_1729432156789.pdf
```

Réponse attendue :
```json
{
  "exists": true,
  "filename": "test_at_example_com_1729432156789.pdf",
  "size": 245678
}
```

**Test 6 : Configuration d'upload**
```bash
curl -X GET http://localhost:8081/files/config
```

Réponse attendue :
```json
{
  "maxFileSize": 5242880,
  "maxFileSizeMB": 5,
  "allowedExtensions": [".pdf", ".doc", ".docx"],
  "allowedMimeTypes": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  "uploadDirectory": "uploads/cv"
}
```

---

### 2️⃣ Tests Frontend (Angular)

#### Démarrage de l'application
```bash
cd quizapp_front
npm start
```

#### Test du formulaire de candidature

**Étape 1 : Accéder au formulaire**
1. Ouvrir http://localhost:4200
2. Naviguer vers `/apply/:sourceToken` (utiliser un token valide)
3. Vérifier que le formulaire s'affiche correctement

**Étape 2 : Remplir le formulaire**
1. Remplir tous les champs obligatoires :
   - Prénom
   - Nom
   - Email
   - Téléphone
   - Date de naissance
2. Uploader un CV (PDF, DOC ou DOCX)
3. Écrire une lettre de motivation (optionnel)
4. Cocher la case de consentement

**Étape 3 : Valider les contraintes**
- ✅ Essayer d'uploader un fichier > 5 Mo → Doit afficher un message d'erreur
- ✅ Essayer d'uploader un fichier .txt → Doit afficher un message d'erreur
- ✅ Soumettre sans CV → Doit afficher "Veuillez joindre votre CV"
- ✅ Soumettre sans accepter les conditions → Doit afficher "Veuillez accepter les conditions"

**Étape 4 : Soumettre la candidature**
1. Cliquer sur "Soumettre ma candidature"
2. Observer le loader pendant l'upload
3. Vérifier le message de succès

**Étape 5 : Vérifier dans la console**
```
📤 Upload du CV en cours...
✅ CV uploadé avec succès: uploads/cv/john_at_example_com_1729432156789.pdf
Candidature créée avec succès: { id: 123, ... }
```

**Étape 6 : Vérifier sur le serveur**
```bash
ls -la quizapp/uploads/cv/
```
Doit afficher le fichier uploadé.

---

### 3️⃣ Tests côté Recruteur

#### Voir les candidatures
1. Se connecter en tant que recruteur
2. Naviguer vers `/dashboard/applications`
3. Vérifier que les candidatures s'affichent

#### Télécharger un CV
1. Cliquer sur une candidature avec un CV
2. Cliquer sur le bouton "📄 Télécharger CV"
3. Vérifier que le fichier se télécharge correctement
4. Ouvrir le fichier et vérifier qu'il est lisible

---

### 4️⃣ Tests de sécurité

**Test 1 : Traversée de répertoire**
```bash
curl -X GET "http://localhost:8081/files/download/../../../etc/passwd"
```
Réponse attendue : Status 400 (Bad Request)

**Test 2 : Fichier inexistant**
```bash
curl -X GET "http://localhost:8081/files/download/nonexistent.pdf"
```
Réponse attendue : Status 404 (Not Found)

**Test 3 : Caractères spéciaux dans le nom**
```bash
curl -X POST http://localhost:8081/files/upload/cv \
  -F "file=@test.pdf" \
  -F "candidateEmail=test+spécial@example.com"
```
Réponse attendue : Success (nom de fichier sanitizé)

---

### 5️⃣ Tests d'intégration

**Scénario complet : Du candidat au recruteur**

1. **Candidat soumet sa candidature**
   - Accès au formulaire via source token
   - Upload d'un CV (test_cv.pdf)
   - Soumission du formulaire
   - Message de succès affiché

2. **Vérification en BDD**
   ```sql
   SELECT id, candidate_first_name, candidate_last_name, 
          candidate_email, candidate_cv_path 
   FROM applications 
   ORDER BY id DESC 
   LIMIT 1;
   ```
   Vérifier que `candidate_cv_path` contient un chemin valide

3. **Recruteur consulte la candidature**
   - Connexion en tant que recruteur
   - Navigation vers /dashboard/applications
   - Sélection de la candidature
   - Téléchargement du CV
   - Ouverture et lecture du CV

4. **Vérification du fichier physique**
   ```bash
   cd quizapp/uploads/cv
   ls -lh
   # Doit afficher le fichier avec sa taille
   ```

---

## 📊 Matrice de tests

| Test | Frontend | Backend | Fichier sur disque | BDD | Statut |
|------|----------|---------|-------------------|-----|--------|
| Upload PDF valide | ✅ | ✅ | ✅ | ✅ | ⬜ À tester |
| Upload DOC valide | ✅ | ✅ | ✅ | ✅ | ⬜ À tester |
| Upload DOCX valide | ✅ | ✅ | ✅ | ✅ | ⬜ À tester |
| Fichier > 5 Mo | ❌ | ❌ | ❌ | ❌ | ⬜ À tester |
| Type invalide (.txt) | ❌ | ❌ | ❌ | ❌ | ⬜ À tester |
| Téléchargement CV | ✅ | ✅ | ✅ | ✅ | ⬜ À tester |
| CV inexistant | ❌ | ❌ | - | - | ⬜ À tester |
| Traversée répertoire | ❌ | ❌ | - | - | ⬜ À tester |
| Email avec caractères spéciaux | ✅ | ✅ | ✅ | ✅ | ⬜ À tester |
| Upload concurrent (2 candidats) | ✅ | ✅ | ✅ | ✅ | ⬜ À tester |

---

## 🐛 Problèmes courants et solutions

### Problème : "FileNotFoundException" lors de l'upload
**Solution** : Vérifier que le dossier `uploads/cv` existe et a les bonnes permissions
```bash
mkdir -p quizapp/uploads/cv
chmod 755 quizapp/uploads/cv
```

### Problème : "MaxUploadSizeExceededException"
**Solution** : Vérifier la configuration dans `application.properties`
```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

### Problème : Le fichier ne s'affiche pas côté recruteur
**Solution** : Vérifier que :
1. Le fichier existe physiquement : `ls uploads/cv/`
2. Le chemin en BDD est correct : `SELECT candidate_cv_path FROM applications WHERE id = X`
3. L'URL de téléchargement est bien formée

### Problème : CORS error lors de l'upload
**Solution** : Vérifier que `@CrossOrigin("*")` est présent dans `FileController`

---

## ✅ Validation finale

Avant de considérer la fonctionnalité comme terminée, s'assurer que :

- [ ] Un candidat peut uploader son CV (PDF, DOC, DOCX)
- [ ] Le fichier est physiquement sauvegardé sur le serveur
- [ ] Le chemin est correctement enregistré en BDD
- [ ] Un recruteur peut télécharger le CV
- [ ] Les fichiers invalides sont rejetés avec un message d'erreur clair
- [ ] Les fichiers > 5 Mo sont rejetés
- [ ] Les tests de sécurité passent (pas de traversée de répertoire)
- [ ] Le dossier uploads/ est exclu de Git
- [ ] Les logs backend sont clairs et informatifs
- [ ] Aucune erreur dans la console frontend

---

**Auteur** : GitHub Copilot  
**Date** : 20 octobre 2025  
**Projet** : Synelia Quiz Application
