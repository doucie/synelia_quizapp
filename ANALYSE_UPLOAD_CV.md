# 📋 Analyse : Enregistrement des CVs lors de la candidature

**Date d'analyse** : 20 octobre 2025  
**Statut actuel** : ⚠️ **CVs NON enregistrés physiquement sur le serveur**

---

## 🔍 Situation Actuelle

### ✅ Ce qui fonctionne

1. **Validation côté Frontend**
   - Validation du type de fichier (PDF, DOC, DOCX) ✅
   - Validation de la taille maximale (5 Mo) ✅
   - Messages d'erreur appropriés ✅

2. **Structure de la base de données**
   - Colonne `candidate_cv_path` existe dans la table `applications` ✅
   - Type : `VARCHAR(1000)` ✅
   - Peut stocker le chemin du fichier ✅

3. **Enregistrement du chemin dans la BDD**
   - Le chemin du CV est bien enregistré dans `applications.candidate_cv_path` ✅
   - Les recruteurs peuvent voir qu'un CV existe ✅

### ❌ Ce qui NE fonctionne PAS

1. **Upload physique du fichier**
   - Le fichier CV n'est **PAS uploadé** sur le serveur ❌
   - Actuellement, seule une **simulation d'upload** est utilisée ❌
   - Le fichier reste uniquement dans le navigateur du candidat ❌

2. **Backend manquant**
   - **Aucun endpoint d'upload** de fichiers côté Spring Boot ❌
   - **Aucun FileController** n'existe ❌
   - **Aucune gestion de MultipartFile** ❌

---

## 🛠️ Code Actuel (Frontend)

### Dans `apply-position.ts` (ligne 152-159)

```typescript
// Étape 1 : Upload du CV
this.isUploadingCv.set(true);

// ⚠️ SIMULATION UNIQUEMENT - Le fichier n'est PAS uploadé !
const uploadResult = await this.fileService.simulateUpload(data.cvFile, data.email);

this.isUploadingCv.set(false);

if (!uploadResult.success) {
  throw new Error(uploadResult.error || 'Erreur lors de l\'upload du CV');
}

this.cvFilePath.set(uploadResult.filePath || '');
```

### Dans `file.service.ts` - Méthode `simulateUpload()` (ligne 105-124)

```typescript
simulateUpload(file: File, candidateEmail: string): Promise<FileUploadResponse> {
  return new Promise((resolve, reject) => {
    // Validation du fichier
    const validation = this.validateCvFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.errorMessage));
      return;
    }

    // ⚠️ Simuler un délai d'upload - AUCUN UPLOAD RÉEL !
    setTimeout(() => {
      // Générer un chemin de fichier SIMULÉ (n'existe pas sur le serveur)
      const timestamp = new Date().getTime();
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const simulatedPath = `uploads/cv/${candidateEmail.replace('@', '_at_').replace('.', '_')}_${timestamp}${fileExtension}`;

      resolve({
        success: true,
        filePath: simulatedPath,  // ⚠️ Chemin fictif !
        fileName: file.name,
        message: 'Fichier uploadé avec succès (simulation)'
      });
    }, 1500);
  });
}
```

### Méthode `uploadCvFile()` existe mais n'est PAS utilisée (ligne 73-93)

```typescript
uploadCvFile(file: File, candidateEmail: string): Observable<FileUploadResponse> {
  // Cette méthode existe mais n'est jamais appelée car l'endpoint backend n'existe pas
  const formData = new FormData();
  formData.append('file', file);
  formData.append('candidateEmail', candidateEmail);
  formData.append('fileType', 'cv');

  return this.http.post<FileUploadResponse>(`${this.uploadUrl}/cv`, formData, { headers });
}
```

**Endpoint attendu** : `POST /files/upload/cv` ❌ **N'EXISTE PAS**

---

## 📊 Conséquences

### Pour les candidats
- ✅ Peuvent soumettre leur candidature
- ✅ Reçoivent une confirmation
- ❌ Leur CV n'est **PAS sauvegardé** sur le serveur

### Pour les recruteurs
- ✅ Voient la liste des candidatures dans `/dashboard/applications`
- ✅ Voient qu'un CV existe (champ `candidateCvPath` rempli)
- ❌ **NE PEUVENT PAS télécharger** ou **visualiser** les CVs
- ❌ Chemin stocké : `uploads/cv/john_at_example_com_1729432156789.pdf` (fichier inexistant)

---

## 🔧 Solution Requise

### 1️⃣ Backend : Créer un FileController

**Fichier** : `quizapp/src/main/java/tech/synelia/quizapp/rest/api/FileController.java`

```java
package tech.synelia.quizapp.rest.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@CrossOrigin("*")
@RestController
@RequestMapping("/files")
public class FileController {

    @Value("${app.upload.dir:uploads/cv}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/upload/cv")
    public ResponseEntity<Map<String, Object>> uploadCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("candidateEmail") String candidateEmail,
            @RequestParam(value = "fileType", defaultValue = "cv") String fileType) {
        
        Map<String, Object> response = new HashMap<>();

        try {
            // Validation
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("error", "Le fichier est vide");
                return ResponseEntity.badRequest().body(response);
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                response.put("success", false);
                response.put("error", "Le fichier est trop volumineux (max 5 Mo)");
                return ResponseEntity.badRequest().body(response);
            }

            // Créer le répertoire s'il n'existe pas
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String sanitizedEmail = candidateEmail.replaceAll("[^a-zA-Z0-9]", "_");
            String uniqueFilename = sanitizedEmail + "_" + System.currentTimeMillis() + fileExtension;

            // Sauvegarder le fichier
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Chemin relatif à stocker en BDD
            String relativePath = uploadDir + "/" + uniqueFilename;

            response.put("success", true);
            response.put("filePath", relativePath);
            response.put("fileName", originalFilename);
            response.put("message", "Fichier uploadé avec succès");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "Erreur lors de l'upload : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                               "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### 2️⃣ Configuration Spring Boot

**Fichier** : `quizapp/src/main/resources/application.properties`

```properties
# Configuration upload de fichiers
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
app.upload.dir=uploads/cv
```

### 3️⃣ Frontend : Remplacer la simulation par l'upload réel

**Fichier** : `quizapp_front/src/app/pages/apply-position/apply-position.ts`

**Ligne 152** - Remplacer :
```typescript
// ❌ AVANT (simulation)
const uploadResult = await this.fileService.simulateUpload(data.cvFile, data.email);
```

Par :
```typescript
// ✅ APRÈS (upload réel)
const uploadResult = await this.fileService.uploadCvFile(data.cvFile, data.email).toPromise();
```

**OU mieux, utiliser firstValueFrom :**
```typescript
import { firstValueFrom } from 'rxjs';

// Dans onSubmit()
const uploadResult = await firstValueFrom(
  this.fileService.uploadCvFile(data.cvFile, data.email)
);
```

### 4️⃣ Ajouter un endpoint de téléchargement pour les recruteurs

**Frontend** - Dans `application.service.ts` :

```typescript
/**
 * Récupère l'URL de téléchargement d'un CV
 * @param cvPath Chemin du CV stocké en BDD
 * @returns URL complète de téléchargement
 */
getCvDownloadUrl(cvPath: string): string {
  const filename = cvPath.split('/').pop();
  return `${this.baseUrl}/files/download/${filename}`;
}
```

**Frontend** - Dans le template des applications :

```html
<a *ngIf="application.candidateCvPath" 
   [href]="getCvDownloadUrl(application.candidateCvPath)"
   download
   class="btn-download-cv">
  📄 Télécharger CV
</a>
```

---

## ✅ Checklist d'implémentation

### Backend (Spring Boot)
- [ ] Créer `FileController.java`
- [ ] Ajouter la configuration dans `application.properties`
- [ ] Créer le dossier `uploads/cv/` à la racine du projet
- [ ] Ajouter `.gitignore` pour `uploads/`
- [ ] Tester l'endpoint avec Postman
- [ ] Vérifier les permissions du dossier uploads

### Frontend (Angular)
- [ ] Modifier `apply-position.ts` pour utiliser `uploadCvFile()` au lieu de `simulateUpload()`
- [ ] Ajouter `getCvDownloadUrl()` dans `application.service.ts`
- [ ] Ajouter le bouton de téléchargement dans `applications.html`
- [ ] Gérer les erreurs d'upload (message utilisateur)
- [ ] Ajouter un loader pendant l'upload
- [ ] Tester le flow complet

### Tests
- [ ] Tester upload avec PDF
- [ ] Tester upload avec DOC/DOCX
- [ ] Tester fichier > 5 Mo (doit échouer)
- [ ] Tester fichier avec type non supporté (doit échouer)
- [ ] Tester téléchargement du CV par le recruteur
- [ ] Vérifier que le fichier est bien présent sur le serveur

---

## 🎯 Priorité

**🔴 CRITIQUE** - Les CVs ne sont actuellement pas sauvegardés, ce qui rend l'application inutilisable en production.

**Impact** :
- Les recruteurs ne peuvent pas consulter les CVs
- Perte de données importantes pour le processus de recrutement
- Mauvaise expérience utilisateur (candidats pensent avoir envoyé leur CV)

---

## 📝 Notes supplémentaires

1. **Sécurité** : Ajouter une authentification pour le téléchargement (seuls les recruteurs autorisés)
2. **Stockage** : Considérer un stockage cloud (AWS S3, Azure Blob) pour la production
3. **Nettoyage** : Prévoir une procédure de suppression des CVs des candidatures rejetées (RGPD)
4. **Virus scan** : Implémenter un scan antivirus avant l'enregistrement
5. **Compression** : Compresser les fichiers pour économiser de l'espace
6. **Audit** : Logger tous les accès aux CVs

---

**Auteur** : GitHub Copilot  
**Pour** : Synelia Quiz Application
