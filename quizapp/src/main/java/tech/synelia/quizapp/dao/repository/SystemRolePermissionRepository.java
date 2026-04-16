package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.SystemRolePermission;

@Repository
public interface SystemRolePermissionRepository extends JpaRepository<SystemRolePermission, Integer> {

	@Query("select e from SystemRolePermission e where e.systemRole = :systemRole")
	List<SystemRolePermission> findBySystemRole(@Param("systemRole") String systemRole);

	@Query("select case when count(e) > 0 then true else false end from SystemRolePermission e where e.systemRole = :systemRole and e.functionality = :functionality")
	boolean existsBySystemRoleAndFunctionality(@Param("systemRole") String systemRole, @Param("functionality") String functionality);
}
