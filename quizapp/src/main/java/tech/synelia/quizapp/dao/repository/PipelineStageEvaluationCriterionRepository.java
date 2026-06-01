package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.PipelineStageEvaluationCriterion;

@Repository
public interface PipelineStageEvaluationCriterionRepository extends JpaRepository<PipelineStageEvaluationCriterion, Integer> {

	@Query("select e from PipelineStageEvaluationCriterion e where e.id = :id and e.isDeleted = :isDeleted")
	PipelineStageEvaluationCriterion findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from PipelineStageEvaluationCriterion e where e.pipelineStage.id = :pipelineStageId and e.isDeleted = :isDeleted order by e.criterionOrder asc")
	List<PipelineStageEvaluationCriterion> findByPipelineStageId(@Param("pipelineStageId") Integer pipelineStageId, @Param("isDeleted") Boolean isDeleted);
}