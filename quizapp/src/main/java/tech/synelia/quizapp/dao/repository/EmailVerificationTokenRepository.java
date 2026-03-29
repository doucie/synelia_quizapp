package tech.synelia.quizapp.dao.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.EmailVerificationToken;
import tech.synelia.quizapp.dao.entity.EmailVerificationToken.TokenType;

/**
 * Repository : EmailVerificationToken.
 */
@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Integer> {

    /**
     * Trouver un token par sa valeur
     */
    Optional<EmailVerificationToken> findByToken(String token);

    /**
     * Trouver un token par email et type
     */
    Optional<EmailVerificationToken> findByEmailAndTokenType(String email, TokenType tokenType);

    /**
     * Trouver tous les tokens non utilisés pour un email
     */
    List<EmailVerificationToken> findByEmailAndIsUsedFalse(String email);

    /**
     * Trouver tous les tokens expirés et non utilisés
     */
    @Query("SELECT t FROM EmailVerificationToken t WHERE t.expiresAt < :now AND t.isUsed = false")
    List<EmailVerificationToken> findExpiredTokens(@Param("now") Date now);

    /**
     * Supprimer tous les tokens expirés et non utilisés
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now AND t.isUsed = false")
    int deleteExpiredTokens(@Param("now") Date now);

    /**
     * Marquer un token comme utilisé
     */
    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.isUsed = true, t.usedAt = :usedAt WHERE t.token = :token")
    int markTokenAsUsed(@Param("token") String token, @Param("usedAt") Date usedAt);

    /**
     * Compter les tokens valides pour un email et un type
     */
    long countByEmailAndTokenTypeAndIsUsedFalseAndExpiresAtGreaterThan(String email, TokenType tokenType, Date expiresAt);
}