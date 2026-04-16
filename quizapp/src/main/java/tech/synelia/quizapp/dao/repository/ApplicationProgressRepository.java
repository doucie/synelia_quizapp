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
import tech.synelia.quizapp.dao.repository.customize._ApplicationProgressRepository;

@Repository
public interface ApplicationProgressRepository extends JpaRepository<ApplicationProgress, Integer>, _ApplicationProgressRepository {

    @Query("select e from ApplicationProgress e where e.id = :id and e.isDeleted = :isDeleted")
    ApplicationProgress findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from ApplicationProgress e where e.applications.id = :applicationId and e.isDeleted = false order by e.pipelineStage.stageOrder")
    List<ApplicationProgress> findByApplicationIdOrderByStageOrder(@Param("applicationId") Integer applicationId);

    @Query("select e from ApplicationProgress e where e.applications.id = :applicationId and e.pipelineStage.id = :stageId and e.isDeleted = false")
    ApplicationProgress findByApplicationIdAndPipelineStageId(@Param("applicationId") Integer applicationId, @Param("stageId") Integer stageId);

    @Query("select e from ApplicationProgress e where e.pipelineStage.id = :stageId and e.progressStatus = :status and e.isDeleted = false")
    List<ApplicationProgress> findByPipelineStageIdAndProgressStatus(@Param("stageId") Integer stageId, @Param("status") String status);

    @Query("select e from ApplicationProgress e where e.applications.id = :applicationId and e.progressStatus = 'IN_PROGRESS' and e.isDeleted = false")
    ApplicationProgress findCurrentStage(@Param("applicationId") Integer applicationId);

    @Query("select e from ApplicationProgress e where e.applications.id = :applicationId and e.progressStatus = 'PENDING' and e.isDeleted = false order by e.pipelineStage.stageOrder asc")
    List<ApplicationProgress> findPendingByApplicationId(@Param("applicationId") Integer applicationId);

    default List<ApplicationProgress> getByCriteria(Request<ApplicationProgressDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from ApplicationProgress e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        req += " order by e.pipelineStage.stageOrder asc";
        TypedQuery<ApplicationProgress> query = em.createQuery(req, ApplicationProgress.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default Long count(Request<ApplicationProgressDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select count(e.id) from ApplicationProgress e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        jakarta.persistence.Query query = em.createQuery(req);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return (Long) query.getResultList().get(0);
    }
}
