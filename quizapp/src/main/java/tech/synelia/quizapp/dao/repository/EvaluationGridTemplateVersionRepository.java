package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tech.synelia.quizapp.dao.entity.EvaluationGridTemplateVersion;

public interface EvaluationGridTemplateVersionRepository extends JpaRepository<EvaluationGridTemplateVersion, Integer> {

	@Query("select e from EvaluationGridTemplateVersion e where e.id = :id and e.isDeleted = :isDeleted")
	EvaluationGridTemplateVersion findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from EvaluationGridTemplateVersion e where e.evaluationGridTemplateId = :evaluationGridTemplateId and e.isDeleted = :isDeleted order by e.versionNumber desc")
	List<EvaluationGridTemplateVersion> findByEvaluationGridTemplateId(@Param("evaluationGridTemplateId") Integer evaluationGridTemplateId, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from EvaluationGridTemplateVersion e where e.contentHash = :contentHash and e.isDeleted = :isDeleted")
	List<EvaluationGridTemplateVersion> findByContentHash(@Param("contentHash") String contentHash, @Param("isDeleted") Boolean isDeleted);
}
