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
import tech.synelia.quizapp.dao.repository.customize._PipelineStageRepository;

@Repository
public interface PipelineStageRepository extends JpaRepository<PipelineStage, Integer>, _PipelineStageRepository {

    @Query("select e from PipelineStage e where e.id = :id and e.isDeleted = :isDeleted")
    PipelineStage findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from PipelineStage e where e.pipelineTemplate.id = :templateId and e.isDeleted = false order by e.stageOrder")
    List<PipelineStage> findByPipelineTemplateIdOrderByStageOrder(@Param("templateId") Integer templateId);

    @Query("select count(e) from PipelineStage e where e.pipelineTemplate.id = :templateId and e.isDeleted = false")
    Long countByPipelineTemplateId(@Param("templateId") Integer templateId);

    @Query("select e from PipelineStage e where e.pipelineTemplate.id = :templateId and e.stageType = :stageType and e.isDeleted = false")
    PipelineStage findByTemplateIdAndStageType(@Param("templateId") Integer templateId, @Param("stageType") String stageType);

    default List<PipelineStage> getByCriteria(Request<PipelineStageDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from PipelineStage e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        req += " order by e.stageOrder asc";
        TypedQuery<PipelineStage> query = em.createQuery(req, PipelineStage.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default Long count(Request<PipelineStageDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select count(e.id) from PipelineStage e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getWhereExpression(request, param, locale);
        jakarta.persistence.Query query = em.createQuery(req);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return (Long) query.getResultList().get(0);
    }
}
