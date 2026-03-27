package tech.synelia.quizapp.rest.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tech.synelia.quizapp.business.OnlineStatsBusiness;
import tech.synelia.quizapp.utils.dto.OnlineStatsDto;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

/**
 * Contrôleur REST dédié aux statistiques QEEL (Qui Est En Ligne)
 * Fournit les statistiques en temps réel des utilisateurs connectés
 */
@RestController
@RequestMapping("/api/qeel")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class QeelController {

    private static final Logger logger = LoggerFactory.getLogger(QeelController.class);

    @Autowired
    private OnlineStatsBusiness onlineStatsBusiness;

    /**
     * Récupère les statistiques QEEL actuelles
     * 
     * @param request Requête HTTP
     * @param locale Locale de l'utilisateur
     * @return ResponseEntity avec les statistiques ou erreur
     */
    @GetMapping("/stats")
    public ResponseEntity<OnlineStatsDto> getQeelStats(HttpServletRequest request, Locale locale) {
        logger.debug("🔄 Récupération des statistiques QEEL");
        
        try {
            OnlineStatsDto stats = onlineStatsBusiness.getOnlineStats();
            logger.debug("Statistiques QEEL récupérées: {} utilisateurs total, {} en ligne", 
                       stats.getTotalUsers(), stats.getOnlineUsers());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la récupération des statistiques QEEL", e);
            
            OnlineStatsDto fallbackStats = new OnlineStatsDto(0L, 0L, 0.0, 0L, 0L, 0.0, 0L, 0L, 0.0);
            return ResponseEntity.status(500).body(fallbackStats);
        }
    }

    /**
     * Endpoint de santé pour vérifier le service QEEL
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("QEEL service is running");
    }
}
