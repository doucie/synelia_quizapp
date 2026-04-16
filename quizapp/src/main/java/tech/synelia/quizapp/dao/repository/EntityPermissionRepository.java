package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.EntityPermission;

@Repository
public interface EntityPermissionRepository extends JpaRepository<EntityPermission, Integer> {

	@Query("select e from EntityPermission e where e.user.id = :userId and e.entityType = :entityType and e.entityId = :entityId and e.permissionKey = :permissionKey")
	EntityPermission findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(@Param("userId") Integer userId, @Param("entityType") String entityType, @Param("entityId") Integer entityId, @Param("permissionKey") String permissionKey);

	@Query("select e from EntityPermission e where e.user.id = :userId and e.entityType = :entityType and e.entityId = :entityId")
	List<EntityPermission> findByUserIdAndEntityTypeAndEntityId(@Param("userId") Integer userId, @Param("entityType") String entityType, @Param("entityId") Integer entityId);

	@Query("select e from EntityPermission e where e.entityType = :entityType and e.entityId = :entityId")
	List<EntityPermission> findByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Integer entityId);

	@Query("select e from EntityPermission e where e.user.id = :userId")
	List<EntityPermission> findByUserId(@Param("userId") Integer userId);
}
