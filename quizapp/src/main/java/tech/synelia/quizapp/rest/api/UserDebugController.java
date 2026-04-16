package tech.synelia.quizapp.rest.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tech.synelia.quizapp.dao.repository.UserRepository;

import java.util.stream.Collectors;

/**
 * Endpoints de debug pour les utilisateurs - disponibles uniquement en profil "local"
 */
@Profile("local")
@RestController
@RequestMapping(value = "/user")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class UserDebugController {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/set-users-online", method = RequestMethod.POST, produces = {"application/json"})
    public ResponseEntity<String> setUsersOnline() {
        logger.info("DEBUG - Mise en ligne de quelques utilisateurs pour test");

        userRepository.findAll().stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                .limit(3)
                .forEach(user -> {
                    user.setIsOnline(true);
                    userRepository.save(user);
                    logger.info("Utilisateur {} ({}) mis en ligne", user.getId(), user.getUsername());
                });

        return ResponseEntity.ok("{\"status\":\"success\",\"message\":\"3 utilisateurs mis en ligne pour test\"}");
    }

    @RequestMapping(value = "/roles-debug", method = RequestMethod.GET, produces = {"application/json"})
    public ResponseEntity<String> debugRoles() {
        logger.info("Debug des rôles utilisateurs");

        StringBuilder debug = new StringBuilder();
        debug.append("=== ANALYSE DES ROLES UTILISATEURS ===\n");

        userRepository.findAll().stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                .forEach(user -> {
                    debug.append("User ").append(user.getId())
                            .append(" - ").append(user.getUsername())
                            .append(" - Role: '").append(user.getUserRole()).append("'")
                            .append(" - Online: ").append(user.getIsOnline())
                            .append("\n");
                });

        debug.append("\n=== COMPTAGE PAR ROLE EXACT ===\n");
        userRepository.findAll().stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                .collect(Collectors.groupingBy(
                        user -> user.getUserRole(),
                        Collectors.counting()
                ))
                .forEach((role, count) -> {
                    debug.append("Role '").append(role).append("': ").append(count).append(" utilisateurs\n");
                });

        logger.info("Debug des rôles:\n{}", debug);
        return ResponseEntity.ok(debug.toString());
    }
}
