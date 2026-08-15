package tech.synelia.quizapp.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import tech.synelia.quizapp.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Endpoints publics du parcours candidat (sans authentification JWT).
     * Source de vérité exposée pour les tests de couverture (A.1).
     */
    public static final String[] PUBLIC_APPLICATION_ENDPOINTS = {
        "/applications/create",
        "/applications/verify-email",
        "/applications/get-quiz",
        "/applications/save-quiz-answer",
        "/applications/complete-quiz",
        "/applications/touch-quiz",
        "/applications/withdraw",
        "/applications/track",
        "/applications/respond-interview",
        "/applications/submit-ask"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Endpoints publics (connexion, candidature, QEEL, Swagger)
                .requestMatchers("/userManager/connexion").permitAll()
                .requestMatchers("/api/qeel/**", "/ws/**").permitAll()
                    .requestMatchers(PUBLIC_APPLICATION_ENDPOINTS).permitAll()
                .requestMatchers("/campaigns/public/**").permitAll()
                .requestMatchers("/sourceToken/validate/**", "/sourceToken/info/**").permitAll()
                .requestMatchers("/candidateanswer/**").permitAll()
                .requestMatchers("/legalText/getByCriteria").permitAll()
                .requestMatchers("/invitationCode/validate").permitAll()
                .requestMatchers("/userManager/registerWithCode").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Endpoints ADMIN uniquement
                .requestMatchers("/user/set-users-online").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // Tous les autres endpoints nécessitent une authentification
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origines autorisées (dev + prod)
        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://localhost:8085"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
