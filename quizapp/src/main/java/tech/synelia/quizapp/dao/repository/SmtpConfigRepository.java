package tech.synelia.quizapp.dao.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import tech.synelia.quizapp.dao.entity.SmtpConfig;
import tech.synelia.quizapp.dao.repository.customize._SmtpConfigRepository;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.SmtpConfigDto;

@Repository
public interface SmtpConfigRepository extends JpaRepository<SmtpConfig, Integer>, _SmtpConfigRepository {

    @Query("select e from SmtpConfig e where e.id = :id and e.isDeleted = :isDeleted")
    SmtpConfig findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from SmtpConfig e where e.isActive = :isActive and e.isDeleted = :isDeleted")
    SmtpConfig findActiveConfig(@Param("isActive") Boolean isActive, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from SmtpConfig e where e.isActive = :isActive and e.isDeleted = :isDeleted")
    List<SmtpConfig> findByIsActiveAndIsDeleted(@Param("isActive") Boolean isActive, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from SmtpConfig e where e.isDeleted = :isDeleted")
    List<SmtpConfig> findByIsDeleted(@Param("isDeleted") Boolean isDeleted);

    default List<SmtpConfig> getByCriteria(Request<SmtpConfigDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from SmtpConfig e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<SmtpConfig> query = em.createQuery(req, SmtpConfig.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default Long count(Request<SmtpConfigDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select count(e.id) from SmtpConfig e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        jakarta.persistence.Query query = em.createQuery(req);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return (Long) query.getResultList().get(0);
    }
}
