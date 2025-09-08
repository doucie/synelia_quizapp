package tech.synelia.quizapp.websocket;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import tech.synelia.quizapp.business.OnlineStatsBusiness;
import tech.synelia.quizapp.utils.dto.OnlineStatsDto;

import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket Handler pour les statistiques QEEL en temps réel
 */
@Component
public class QeelWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(QeelWebSocketHandler.class);
    
    // Ensemble thread-safe des sessions connectées
    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    
    @Autowired
    private OnlineStatsBusiness onlineStatsBusiness;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        logger.info("🔌 Nouvelle connexion WebSocket QEEL: {}", session.getId());
        
        // Envoyer immédiatement les statistiques actuelles au nouveau client
        sendStatsToSession(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        logger.info("🔌 Connexion WebSocket QEEL fermée: {} - Status: {}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("❌ Erreur WebSocket QEEL pour session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session);
    }

    /**
     * Envoie les statistiques actuelles à toutes les sessions connectées
     * Appelé automatiquement toutes les 10 secondes
     */
    @Scheduled(fixedRate = 10000) // 10 secondes
    public void broadcastStats() {
        if (sessions.isEmpty()) {
            return; // Pas de clients connectés
        }

        try {
            OnlineStatsDto stats = onlineStatsBusiness.getOnlineStats();
            String message = objectMapper.writeValueAsString(stats);
            
            logger.debug("📊 Diffusion des statistiques QEEL à {} session(s)", sessions.size());
            
            // Envoyer à toutes les sessions
            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(message));
                    } else {
                        sessions.remove(session);
                    }
                } catch (Exception e) {
                    logger.warn("⚠️ Erreur envoi message à session {}: {}", session.getId(), e.getMessage());
                    sessions.remove(session);
                }
            });
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la diffusion des statistiques QEEL", e);
        }
    }

    /**
     * Envoie les statistiques actuelles à une session spécifique
     */
    private void sendStatsToSession(WebSocketSession session) {
        try {
            OnlineStatsDto stats = onlineStatsBusiness.getOnlineStats();
            String message = objectMapper.writeValueAsString(stats);
            session.sendMessage(new TextMessage(message));
            logger.debug("📊 Statistiques envoyées à la session {}", session.getId());
        } catch (Exception e) {
            logger.error("❌ Erreur envoi statistiques à session {}: {}", session.getId(), e.getMessage());
        }
    }

    /**
     * Méthode pour déclencher manuellement une diffusion des statistiques
     * (utile quand les données changent en dehors du cycle automatique)
     */
    public void triggerStatsUpdate() {
        broadcastStats();
    }
}
