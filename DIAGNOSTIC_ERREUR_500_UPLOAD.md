# 🔧 Guide de Diagnostic - Erreur 500 Upload CV

## 🚨 Symptôme

```
POST http://localhost:8081/files/upload/cv
Status: 500 Internal Server Error
```

---

## ✅ Checklist de diagnostic

### 1. Vérifier que le serveur Spring Boot est démarré

**Dans le terminal backend :**
```bash
cd quizapp
mvnw spring-boot:run
```

**Ou utiliser le script :**
```bash
start_backend.bat
```

**Vérifier dans les logs :**
```
✅ Started QuizappApplication in X.XXX seconds
✅ Tomcat started on port(s): 8081
```

---

### 2. Vérifier que le dossier uploads existe

**Windows :**
```cmd
cd quizapp
dir uploads\cv
```

**Si le dossier n'existe pas :**
```cmd
mkdir uploads\cv
```

**Linux/Mac :**
```bash
cd quizapp
ls -la uploads/cv
```

**Si le dossier n'existe pas :**
```bash
mkdir -p uploads/cv
chmod 755 uploads/cv
```

---

### 3. Vérifier la configuration multipart

**Fichier :** `quizapp/src/main/resources/application.properties`

Doit contenir :
```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
spring.servlet.multipart.file-size-threshold=2KB
app.upload.dir=uploads/cv
```

---

### 4. Vérifier les logs du serveur

**Chercher dans les logs :**

#### Erreur : "FileNotFoundException"
```
java.io.FileNotFoundException: uploads\cv (Access is denied)
```

**Solution :** Le dossier n'a pas les bonnes permissions
```bash
# Windows - Exécuter en tant qu'administrateur
icacls uploads\cv /grant Users:F

# Linux/Mac
chmod 755 uploads/cv
```

#### Erreur : "NoSuchFileException"
```
java.nio.file.NoSuchFileException: uploads/cv
```

**Solution :** Le dossier n'existe pas
```bash
mkdir uploads/cv
```

#### Erreur : "MissingServletRequestParameterException"
```
Required request parameter 'file' for method parameter type MultipartFile is not present
```

**Solution :** Le frontend n'envoie pas correctement le FormData

Vérifier dans `file.service.ts` :
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('candidateEmail', candidateEmail);
formData.append('fileType', 'cv');
```

#### Erreur : "MaxUploadSizeExceededException"
```
org.springframework.web.multipart.MaxUploadSizeExceededException
```

**Solution :** Augmenter la taille max dans `application.properties`

---

### 5. Tester avec cURL

**Test simple d'upload :**
```bash
curl -v -X POST http://localhost:8081/files/upload/cv \
  -F "file=@test.pdf" \
  -F "candidateEmail=test@example.com" \
  -F "fileType=cv"
```

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "filePath": "uploads/cv/test_at_example_com_1729432156789.pdf",
  "fileName": "test.pdf",
  "fileSize": 12345,
  "message": "Fichier uploadé avec succès"
}
```

**Si erreur 500, regarder les logs du serveur immédiatement après la requête**

---

### 6. Vérifier le endpoint dans les logs au démarrage

**Au démarrage, Spring Boot doit afficher :**
```
Mapped "{[/files/upload/cv],methods=[POST]}" onto public org.springframework.http.ResponseEntity...
Mapped "{[/files/download/{filename:.+}],methods=[GET]}" onto public org.springframework.http.ResponseEntity...
Mapped "{[/files/config],methods=[GET]}" onto public org.springframework.http.ResponseEntity...
```

**Si ces lignes n'apparaissent pas :**
- Le FileController n'est pas chargé
- Vérifier que le package est bien scanné par Spring Boot
- Vérifier qu'il n'y a pas d'erreur de compilation

---

### 7. Vérifier les dépendances Maven

**Fichier :** `quizapp/pom.xml`

Doit contenir :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**Nettoyer et recompiler :**
```bash
mvnw clean install
mvnw spring-boot:run
```

---

### 8. Activer les logs détaillés

**Ajouter dans `application.properties` :**
```properties
# Logs détaillés
logging.level.tech.synelia.quizapp=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.web.multipart=DEBUG
```

**Redémarrer le serveur et observer les logs lors de l'upload**

---

### 9. Vérifier CORS

**Si erreur CORS dans la console :**
```
Access to XMLHttpRequest at 'http://localhost:8081/files/upload/cv' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution :** Vérifier que `@CrossOrigin("*")` est présent dans `FileController`

---

### 10. Vérifier le chemin du fichier frontend

**Dans la console du navigateur, vérifier :**
```javascript
console.log('File to upload:', file);
console.log('File name:', file.name);
console.log('File size:', file.size);
console.log('File type:', file.type);
```

**Le fichier doit avoir :**
- `name` : nom avec extension (.pdf, .doc, .docx)
- `size` : > 0 bytes et < 5MB
- `type` : application/pdf, application/msword, ou application/vnd.openxmlformats-officedocument.wordprocessingml.document

---

## 🔍 Diagnostic rapide

### Cas 1 : Serveur non démarré
**Symptôme :** `ERR_CONNECTION_REFUSED` ou `net::ERR_CONNECTION_RESET`

**Solution :**
```bash
cd quizapp
mvnw spring-boot:run
```

### Cas 2 : Endpoint non trouvé
**Symptôme :** Status 404

**Solution :** Vérifier l'URL : `http://localhost:8081/files/upload/cv` (pas `/api/files/upload/cv`)

### Cas 3 : Dossier manquant
**Symptôme :** FileNotFoundException dans les logs

**Solution :**
```bash
mkdir uploads/cv
```

### Cas 4 : Permissions insuffisantes
**Symptôme :** Access Denied dans les logs

**Solution (Windows Admin) :**
```cmd
icacls uploads\cv /grant Everyone:F
```

### Cas 5 : Configuration multipart manquante
**Symptôme :** MissingServletRequestParameterException

**Solution :** Ajouter dans `application.properties` :
```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

---

## 📋 Procédure de test complète

1. **Arrêter le serveur** (Ctrl+C)
2. **Créer le dossier uploads**
   ```bash
   mkdir -p uploads/cv
   ```
3. **Vérifier application.properties**
4. **Nettoyer et recompiler**
   ```bash
   mvnw clean compile
   ```
5. **Démarrer le serveur**
   ```bash
   mvnw spring-boot:run
   ```
6. **Vérifier les logs de démarrage**
   - ✅ Mappings des endpoints `/files/**`
   - ✅ Server started on port 8081
7. **Tester avec cURL**
   ```bash
   curl -X POST http://localhost:8081/files/upload/cv \
     -F "file=@test.pdf" \
     -F "candidateEmail=test@example.com"
   ```
8. **Si succès, tester via le frontend**

---

## ⚡ Solution rapide (Quick Fix)

```bash
# 1. Créer le dossier
cd quizapp
mkdir uploads\cv

# 2. Redémarrer le serveur
mvnw spring-boot:run
```

---

## 📞 Si le problème persiste

1. **Copier les logs complets** du serveur Spring Boot
2. **Copier l'erreur exacte** de la console frontend
3. **Vérifier la stacktrace** pour identifier la ligne exacte de l'erreur
4. **Partager** :
   - Version de Java (`java -version`)
   - Version de Spring Boot (dans `pom.xml`)
   - Système d'exploitation
   - Logs complets du serveur

---

**Auteur** : GitHub Copilot  
**Date** : 20 octobre 2025  
**Projet** : Synelia Quiz Application
