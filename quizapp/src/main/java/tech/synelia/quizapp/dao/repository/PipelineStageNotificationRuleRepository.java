package tech.synelia.quizapp.dao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.dao.DataAccessException;

import tech.synelia.quizapp.dao.entity.PipelineStageNotificationRule;
import tech.synelia.quizapp.dao.repository.customize._PipelineStageNotificationRuleRepository;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.PipelineStageNotificationRuleDto;

@Repository
public interface PipelineStageNotificationRuleRepository extends JpaRepository<PipelineStageNotificationRule, Integer>, _PipelineStageNotificationRuleRepository {

	@Query("select e from PipelineStageNotificationRule e where e.pipelineStage.id = :pipelineStageId and e.isDeleted = :isDeleted")
	PipelineStageNotificationRule findOneByPipelineStageId(@Param("pipelineStageId") Integer pipelineStageId, @Param("isDeleted") Boolean isDeleted);

	PipelineStageNotificationRule findFirstByPipelineStageIdAndIsDeletedFalse(Integer pipelineStageId);

	List<PipelineStageNotificationRule> findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(Integer pipelineStageId);

	@Query("select e from PipelineStageNotificationRule e where e.id = :id and e.isDeleted = :isDeleted")
	PipelineStageNotificationRule findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	default List<PipelineStageNotificationRule> getByCriteria(Request<PipelineStageNotificationRuleDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from PipelineStageNotificationRule e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<PipelineStageNotificationRule> query = em.createQuery(req, PipelineStageNotificationRule.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<PipelineStageNotificationRuleDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from PipelineStageNotificationRule e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}
}
