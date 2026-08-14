package tech.synelia.quizapp.dao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import tech.synelia.quizapp.dao.entity.PipelineStageNotificationRule;

@Repository
public interface PipelineStageNotificationRuleRepository extends JpaRepository<PipelineStageNotificationRule, Integer> {

	@Query("select e from PipelineStageNotificationRule e where e.pipelineStage.id = :pipelineStageId and e.isDeleted = :isDeleted")
	PipelineStageNotificationRule findOneByPipelineStageId(@Param("pipelineStageId") Integer pipelineStageId, @Param("isDeleted") Boolean isDeleted);

	PipelineStageNotificationRule findFirstByPipelineStageIdAndIsDeletedFalse(Integer pipelineStageId);

	List<PipelineStageNotificationRule> findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(Integer pipelineStageId);
}
