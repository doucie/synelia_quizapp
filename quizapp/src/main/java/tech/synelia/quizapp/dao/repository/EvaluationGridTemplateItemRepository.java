package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tech.synelia.quizapp.dao.entity.EvaluationGridTemplateItem;

public interface EvaluationGridTemplateItemRepository extends JpaRepository<EvaluationGridTemplateItem, Integer> {

	@Query("select e from EvaluationGridTemplateItem e where e.id = :id and e.isDeleted = :isDeleted")
	EvaluationGridTemplateItem findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from EvaluationGridTemplateItem e where e.evaluationGridTemplateVersionId = :evaluationGridTemplateVersionId and e.isDeleted = :isDeleted order by e.criterionOrder asc")
	List<EvaluationGridTemplateItem> findByEvaluationGridTemplateVersionId(@Param("evaluationGridTemplateVersionId") Integer evaluationGridTemplateVersionId, @Param("isDeleted") Boolean isDeleted);
}
