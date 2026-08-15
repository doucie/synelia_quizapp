package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.ApplicationQuizAttempt;

@Repository
public interface ApplicationQuizAttemptRepository extends JpaRepository<ApplicationQuizAttempt, Integer> {

	@Query("select e from ApplicationQuizAttempt e where e.id = :id and e.isDeleted = :isDeleted")
	ApplicationQuizAttempt findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from ApplicationQuizAttempt e where e.applications.id = :applicationId and e.quizToken = :quizToken and e.isDeleted = :isDeleted")
	ApplicationQuizAttempt findByApplicationIdAndQuizToken(
			@Param("applicationId") Integer applicationId,
			@Param("quizToken") String quizToken,
			@Param("isDeleted") Boolean isDeleted);

	@Query("select e from ApplicationQuizAttempt e where e.applications.id = :applicationId and e.isDeleted = :isDeleted order by e.id desc")
	List<ApplicationQuizAttempt> findByApplicationIdOrderByIdDesc(
			@Param("applicationId") Integer applicationId,
			@Param("isDeleted") Boolean isDeleted);

	@Query("select e from ApplicationQuizAttempt e where e.quizStatus = :quizStatus and e.isDeleted = :isDeleted and e.applications is not null and (e.applications.applicationAbandoned = false or e.applications.applicationAbandoned is null)")
	List<ApplicationQuizAttempt> findByQuizStatusAndApplicationNotAbandoned(
			@Param("quizStatus") String quizStatus,
			@Param("isDeleted") Boolean isDeleted);

	@Query("select count(e) from ApplicationQuizAttempt e where e.applications.id = :applicationId and e.isDeleted = :isDeleted")
	long countByApplicationId(
			@Param("applicationId") Integer applicationId,
			@Param("isDeleted") Boolean isDeleted);
}