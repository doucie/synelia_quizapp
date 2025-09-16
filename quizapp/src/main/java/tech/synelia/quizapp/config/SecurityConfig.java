package tech.synelia.quizapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Désactiver CSRF pour les APIs REST
            .csrf(csrf -> csrf.disable())
            
            // Configuration CORS globale
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Désactiver les sessions car nous utilisons des tokens
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configuration des autorisations
            .authorizeHttpRequests(authz -> authz
                // Permettre l'accès libre aux endpoints de connexion
                .requestMatchers("/userManager/**").permitAll()
                
                // Permettre l'accès libre à tous les endpoints pour le développement
                // TODO: Sécuriser en production
                .anyRequest().permitAll()
            );
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permettre toutes les origines (pour le développement)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Permettre toutes les méthodes HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Permettre tous les headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Permettre l'envoi des credentials
        configuration.setAllowCredentials(true);
        
        // Headers exposés au client
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Durée de cache des requêtes preflight (en secondes)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
