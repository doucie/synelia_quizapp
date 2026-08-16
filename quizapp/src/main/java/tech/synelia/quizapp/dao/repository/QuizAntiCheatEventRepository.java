package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.QuizAntiCheatEvent;

@Repository
public interface QuizAntiCheatEventRepository extends JpaRepository<QuizAntiCheatEvent, Integer> {

	@Query("select e from QuizAntiCheatEvent e where e.id = :id and e.isDeleted = :isDeleted")
	QuizAntiCheatEvent findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from QuizAntiCheatEvent e where e.applicationQuizAttempt.id = :attemptId and e.isDeleted = :isDeleted order by e.id desc")
	List<QuizAntiCheatEvent> findByApplicationQuizAttemptIdOrderByIdDesc(
			@Param("attemptId") Integer attemptId,
			@Param("isDeleted") Boolean isDeleted);
}
