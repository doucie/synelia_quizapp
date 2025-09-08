package tech.synelia.quizapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Autowired;

import tech.synelia.quizapp.websocket.QeelWebSocketHandler;

/**
 * Configuration WebSocket pour le QEEL (statistiques en temps réel)
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private QeelWebSocketHandler qeelWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Endpoint WebSocket pour les statistiques QEEL
        registry.addHandler(qeelWebSocketHandler, "/ws/qeel")
                .setAllowedOrigins("*"); // En production, spécifier les domaines autorisés
    }
}
