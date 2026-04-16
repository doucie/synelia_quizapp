package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.BusinessGroupPermission;

@Repository
public interface BusinessGroupPermissionRepository extends JpaRepository<BusinessGroupPermission, Integer> {

	@Query("select e from BusinessGroupPermission e where e.businessGroup.id = :businessGroupId")
	List<BusinessGroupPermission> findByBusinessGroupId(@Param("businessGroupId") Integer businessGroupId);

	@Query("select case when count(e) > 0 then true else false end from BusinessGroupPermission e where e.businessGroup.id = :businessGroupId and e.functionality = :functionality")
	boolean existsByBusinessGroupIdAndFunctionality(@Param("businessGroupId") Integer businessGroupId, @Param("functionality") String functionality);
}
