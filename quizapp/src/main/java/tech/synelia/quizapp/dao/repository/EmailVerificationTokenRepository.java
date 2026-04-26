package tech.synelia.quizapp.dao.repository;

import java.util.Date;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import java.util.Optional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.EmailVerificationToken;
import tech.synelia.quizapp.dao.entity.EmailVerificationToken.TokenType;
import tech.synelia.quizapp.dao.repository.customize._EmailVerificationTokenRepository;

/**
 * Repository : EmailVerificationToken.
 */
@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Integer>, _EmailVerificationTokenRepository {

    Optional<EmailVerificationToken> findByToken(String token);

    Optional<EmailVerificationToken> findByEmailAndTokenType(String email, TokenType tokenType);

    List<EmailVerificationToken> findByEmailAndIsUsedFalse(String email);

    @Query("SELECT t FROM EmailVerificationToken t WHERE t.expiresAt < :now AND t.isUsed = false")
    List<EmailVerificationToken> findExpiredTokens(@Param("now") Date now);

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now AND t.isUsed = false")
    int deleteExpiredTokens(@Param("now") Date now);

    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.isUsed = true, t.usedAt = :usedAt WHERE t.token = :token")
    int markTokenAsUsed(@Param("token") String token, @Param("usedAt") Date usedAt);

    long countByEmailAndTokenTypeAndIsUsedFalseAndExpiresAtGreaterThan(String email, TokenType tokenType, Date expiresAt);

    default List<EmailVerificationToken> getByCriteria(Request<EmailVerificationTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from EmailVerificationToken e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<EmailVerificationToken> query = em.createQuery(req, EmailVerificationToken.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default Long count(Request<EmailVerificationTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select count(e.id) from EmailVerificationToken e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        jakarta.persistence.Query query = em.createQuery(req);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return (Long) query.getResultList().get(0);
    }
}