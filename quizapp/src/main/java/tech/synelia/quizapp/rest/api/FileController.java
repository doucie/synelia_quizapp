package tech.synelia.quizapp.rest.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller pour la gestion des fichiers uploadés (CVs, documents, etc.)
 * 
 * @author Synelia Development Team
 */
@CrossOrigin("*")
@RestController
@RequestMapping("/files")
public class FileController {

    private final Logger slf4jLogger = LoggerFactory.getLogger(getClass());

    @Value("${app.upload.dir:uploads/cv}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".pdf", ".doc", ".docx");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    /**
     * Upload un fichier CV
     * 
     * @param file Fichier multipart à uploader
     * @param candidateEmail Email du candidat (pour nommer le fichier)
     * @param fileType Type de fichier (par défaut: "cv")
     * @return ResponseEntity avec le résultat de l'upload
     */
    @PostMapping("/upload/cv")
    public ResponseEntity<Map<String, Object>> uploadCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("candidateEmail") String candidateEmail,
            @RequestParam(value = "fileType", defaultValue = "cv") String fileType) {
        
        slf4jLogger.info("📤 Début upload CV - Email: {}, Taille: {} bytes", 
                        candidateEmail, file.getSize());
        
        Map<String, Object> response = new HashMap<>();

        try {
            // Validation 1: Fichier vide
            if (file.isEmpty()) {
                slf4jLogger.warn("⚠️ Fichier vide reçu");
                response.put("success", false);
                response.put("error", "Le fichier est vide");
                return ResponseEntity.badRequest().body(response);
            }

            // Validation 2: Taille du fichier
            if (file.getSize() > MAX_FILE_SIZE) {
                slf4jLogger.warn("⚠️ Fichier trop volumineux: {} bytes (max: {} bytes)", 
                               file.getSize(), MAX_FILE_SIZE);
                response.put("success", false);
                response.put("error", String.format(
                    "Le fichier est trop volumineux. Taille maximale: 5 Mo. Taille actuelle: %.2f Mo",
                    file.getSize() / (1024.0 * 1024.0)
                ));
                return ResponseEntity.badRequest().body(response);
            }

            // Validation 3: Extension du fichier
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.contains(".")) {
                slf4jLogger.warn("⚠️ Nom de fichier invalide: {}", originalFilename);
                response.put("success", false);
                response.put("error", "Nom de fichier invalide");
                return ResponseEntity.badRequest().body(response);
            }

            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                slf4jLogger.warn("⚠️ Extension non autorisée: {}", fileExtension);
                response.put("success", false);
                response.put("error", "Type de fichier non supporté. Formats acceptés: PDF, DOC, DOCX");
                return ResponseEntity.badRequest().body(response);
            }

            // Validation 4: Type MIME
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
                slf4jLogger.warn("⚠️ Type MIME non autorisé: {}", contentType);
                response.put("success", false);
                response.put("error", "Type de fichier non supporté");
                return ResponseEntity.badRequest().body(response);
            }

            // Créer le répertoire d'upload s'il n'existe pas
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                slf4jLogger.info("📁 Création du répertoire d'upload: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }

            // Générer un nom de fichier unique et sécurisé
            String sanitizedEmail = candidateEmail
                .replaceAll("[^a-zA-Z0-9@._-]", "_")  // Remplacer caractères spéciaux
                .replace("@", "_at_")                   // Remplacer @
                .replace(".", "_");                     // Remplacer points
            
            long timestamp = System.currentTimeMillis();
            String uniqueFilename = String.format("%s_%d%s", sanitizedEmail, timestamp, fileExtension);

            // Sauvegarder le fichier physiquement
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Chemin relatif à stocker en BDD (format Unix pour compatibilité)
            String relativePath = uploadDir + "/" + uniqueFilename;

            slf4jLogger.info("✅ CV uploadé avec succès: {}", uniqueFilename);
            slf4jLogger.info("📍 Chemin: {}", filePath.toAbsolutePath());

            response.put("success", true);
            response.put("filePath", relativePath);
            response.put("fileName", originalFilename);
            response.put("fileSize", file.getSize());
            response.put("message", "Fichier uploadé avec succès");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            slf4jLogger.error("❌ Erreur lors de l'upload du CV", e);
            response.put("success", false);
            response.put("error", "Erreur lors de l'upload du fichier. Veuillez réessayer.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            slf4jLogger.error("❌ Erreur inattendue lors de l'upload", e);
            response.put("success", false);
            response.put("error", "Une erreur inattendue s'est produite");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Télécharge un fichier uploadé
     * 
     * @param filename Nom du fichier à télécharger
     * @return ResponseEntity avec le fichier en Resource
     */
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        slf4jLogger.info("📥 Demande de téléchargement: {}", filename);
        
        try {
            // Sécurité: Empêcher la traversée de répertoires
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                slf4jLogger.warn("⚠️ Tentative de traversée de répertoire détectée: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                slf4jLogger.info("✅ Fichier trouvé et téléchargement en cours: {}", filename);
                
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                               "attachment; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                        .body(resource);
            } else {
                slf4jLogger.warn("⚠️ Fichier non trouvé ou non lisible: {}", filename);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            slf4jLogger.error("❌ Erreur lors du téléchargement du fichier: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Vérifie si un fichier existe
     * 
     * @param filename Nom du fichier à vérifier
     * @return ResponseEntity avec le résultat de la vérification
     */
    @GetMapping("/exists/{filename:.+}")
    public ResponseEntity<Map<String, Object>> checkFileExists(@PathVariable String filename) {
        slf4jLogger.info("🔍 Vérification de l'existence du fichier: {}", filename);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Sécurité: Empêcher la traversée de répertoires
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                response.put("exists", false);
                response.put("error", "Nom de fichier invalide");
                return ResponseEntity.badRequest().body(response);
            }

            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            boolean exists = Files.exists(filePath) && Files.isReadable(filePath);
            
            response.put("exists", exists);
            response.put("filename", filename);
            
            if (exists) {
                response.put("size", Files.size(filePath));
                slf4jLogger.info("✅ Fichier existe: {}", filename);
            } else {
                slf4jLogger.info("❌ Fichier n'existe pas: {}", filename);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            slf4jLogger.error("❌ Erreur lors de la vérification du fichier: {}", filename, e);
            response.put("exists", false);
            response.put("error", "Erreur lors de la vérification");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtient les informations sur la configuration d'upload
     * 
     * @return ResponseEntity avec les informations de configuration
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getUploadConfig() {
        slf4jLogger.info("📋 Demande des informations de configuration d'upload");
        
        Map<String, Object> config = new HashMap<>();
        config.put("maxFileSize", MAX_FILE_SIZE);
        config.put("maxFileSizeMB", MAX_FILE_SIZE / (1024 * 1024));
        config.put("allowedExtensions", ALLOWED_EXTENSIONS);
        config.put("allowedMimeTypes", ALLOWED_MIME_TYPES);
        config.put("uploadDirectory", uploadDir);
        
        return ResponseEntity.ok(config);
    }
}
