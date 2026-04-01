package tech.synelia.quizapp.dao.repository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._AppConfigRepository;

@Repository
public interface AppConfigRepository extends JpaRepository<AppConfig, Long>, _AppConfigRepository {

    @Query("select e from AppConfig e where e.id = :id and e.isDeleted = :isDeleted")
    AppConfig findOne(@Param("id") Long id, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from AppConfig e where e.isActive = :isActive and e.isDeleted = :isDeleted")
    AppConfig findActiveConfig(@Param("isActive") Boolean isActive, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from AppConfig e where e.isDeleted = :isDeleted")
    List<AppConfig> findByIsDeleted(@Param("isDeleted") Boolean isDeleted);

    default List<AppConfig> getByCriteria(Request<AppConfigDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from AppConfig e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<AppConfig> query = em.createQuery(req, AppConfig.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default Long count(Request<AppConfigDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select count(e.id) from AppConfig e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        jakarta.persistence.Query query = em.createQuery(req);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return (Long) query.getResultList().get(0);
    }
}
