package tech.synelia.quizapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import tech.synelia.quizapp.utils.enums.UserRole;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtService.isTokenValid(token)) {
                    Integer userId = jwtService.extractUserId(token);
                    String systemRole = jwtService.extractSystemRole(token);
                    UserRole normalizedRole = UserRole.fromValue(systemRole);

                    // Map systemRole to Spring Security authorities
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    Set<String> authorityNames = new LinkedHashSet<>();
                    if (normalizedRole != null) {
                        authorityNames.add("ROLE_" + normalizedRole.getSystemRole());
                        if (UserRole.SUPER.equals(normalizedRole)) {
                            authorityNames.add("ROLE_ADMIN");
                            authorityNames.add("ROLE_RECRUITER");
                        } else if (UserRole.ADMIN.equals(normalizedRole)) {
                            authorityNames.add("ROLE_RECRUITER");
                        }
                    } else if (systemRole != null && !systemRole.isBlank()) {
                        authorityNames.add("ROLE_" + systemRole.trim().toUpperCase());
                    }

                    for (String authorityName : authorityNames) {
                        authorities.add(new SimpleGrantedAuthority(authorityName));
                    }

                    var authToken = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                logger.debug("JWT validation failed: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
