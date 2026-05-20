package tech.synelia.quizapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import tech.synelia.quizapp.utils.enums.UserRole;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(Integer userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        UserRole normalizedRole = UserRole.fromValue(role);
        String roleClaim = normalizedRole != null ? normalizedRole.getValue() : role;
        String systemRoleClaim = normalizedRole != null ? normalizedRole.getSystemRole() : role;

        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of(
                        "email", email,
                        "role", roleClaim,
                        "systemRole", systemRoleClaim
                ))
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public Integer extractUserId(String token) {
        return Integer.parseInt(extractClaims(token).getSubject());
    }

    public String extractRole(String token) {
        String role = extractClaims(token).get("role", String.class);
        String normalizedRole = UserRole.normalizeValue(role);
        return normalizedRole != null ? normalizedRole : role;
    }

    public String extractSystemRole(String token) {
        String systemRole = extractClaims(token).get("systemRole", String.class);
        String normalizedSystemRole = UserRole.normalizeSystemRole(systemRole);
        if (normalizedSystemRole != null) {
            return normalizedSystemRole;
        }

        String fallbackRole = extractRole(token);
        String normalizedFallbackRole = UserRole.normalizeSystemRole(fallbackRole);
        return normalizedFallbackRole != null ? normalizedFallbackRole : fallbackRole;
    }
}
