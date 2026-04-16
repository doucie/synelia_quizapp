package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.UserBusinessGroup;

@Repository
public interface UserBusinessGroupRepository extends JpaRepository<UserBusinessGroup, Integer> {

	@Query("select e from UserBusinessGroup e where e.user.id = :userId")
	List<UserBusinessGroup> findByUserId(@Param("userId") Integer userId);

	@Query("select e from UserBusinessGroup e where e.businessGroup.id = :businessGroupId")
	List<UserBusinessGroup> findByBusinessGroupId(@Param("businessGroupId") Integer businessGroupId);
}
