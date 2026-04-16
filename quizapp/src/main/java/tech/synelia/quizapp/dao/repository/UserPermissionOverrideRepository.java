package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.UserPermissionOverride;

@Repository
public interface UserPermissionOverrideRepository extends JpaRepository<UserPermissionOverride, Integer> {

	@Query("select e from UserPermissionOverride e where e.user.id = :userId")
	List<UserPermissionOverride> findByUserId(@Param("userId") Integer userId);

	@Query("select e from UserPermissionOverride e where e.user.id = :userId and e.functionality = :functionality")
	UserPermissionOverride findByUserIdAndFunctionality(@Param("userId") Integer userId, @Param("functionality") String functionality);
}
