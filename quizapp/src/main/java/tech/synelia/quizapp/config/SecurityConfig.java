package tech.synelia.quizapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Désactiver CSRF pour les APIs REST
            .csrf(csrf -> csrf.disable())
            
            // Configuration CORS pour permettre les requêtes cross-origin depuis Angular
            .cors(cors -> cors.disable()) // On utilise @CrossOrigin sur les contrôleurs
            
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
}
