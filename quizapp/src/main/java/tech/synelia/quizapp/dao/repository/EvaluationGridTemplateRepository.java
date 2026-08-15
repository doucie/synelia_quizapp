package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.EvaluationGridTemplate;

@Repository
public interface EvaluationGridTemplateRepository extends JpaRepository<EvaluationGridTemplate, Integer> {

	@Query("select e from EvaluationGridTemplate e where e.id = :id and e.isDeleted = :isDeleted")
	EvaluationGridTemplate findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from EvaluationGridTemplate e where e.isDeleted = :isDeleted order by e.templateName asc")
	List<EvaluationGridTemplate> findByIsDeleted(@Param("isDeleted") Boolean isDeleted);
}
