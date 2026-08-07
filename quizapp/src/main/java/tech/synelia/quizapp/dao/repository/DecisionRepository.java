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
import tech.synelia.quizapp.dao.repository.customize._DecisionRepository;

/**
 * Repository : Decision.
 */
@Repository
public interface DecisionRepository extends JpaRepository<Decision, Integer>, _DecisionRepository {

    @Query("select e from Decision e where e.id = :id and e.isDeleted = :isDeleted")
    Decision findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from Decision e where e.applicationProgress.applications.id = :applicationId and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByApplicationId(@Param("applicationId") Integer applicationId, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from Decision e where e.applicationProgress.id = :applicationProgressId and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByApplicationProgressId(@Param("applicationProgressId") Integer applicationProgressId, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from Decision e where e.user.id = :userId and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByUserId(@Param("userId") Integer userId, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from Decision e where e.decisionType = :decisionType and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByDecisionType(@Param("decisionType") String decisionType, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from Decision e where e.isDeleted = false order by e.createdAt desc")
    List<Decision> findAllActive();

    default List<Decision> getByCriteria(Request<DecisionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from Decision e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<Decision> query = em.createQuery(req, Decision.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default Long count(Request<DecisionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select count(e.id) from Decision e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        jakarta.persistence.Query query = em.createQuery(req);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return (Long) query.getResultList().get(0);
    }
}