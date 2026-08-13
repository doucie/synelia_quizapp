package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tech.synelia.quizapp.dao.entity.EvaluationItem;

public interface EvaluationItemRepository extends JpaRepository<EvaluationItem, Integer> {

	@Query("select e from EvaluationItem e where e.id = :id and e.isDeleted = :isDeleted")
	EvaluationItem findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from EvaluationItem e where e.evaluation.id = :evaluationId and e.isDeleted = :isDeleted order by e.evaluationGridTemplateItem.criterionOrder asc")
	List<EvaluationItem> findByEvaluationId(@Param("evaluationId") Integer evaluationId, @Param("isDeleted") Boolean isDeleted);
}