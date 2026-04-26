package tech.synelia.quizapp.dao.repository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._EntityPermissionRepository;

@Repository
public interface EntityPermissionRepository extends JpaRepository<EntityPermission, Integer>, _EntityPermissionRepository {

	@Query("select e from EntityPermission e where e.user.id = :userId and e.entityType = :entityType and e.entityId = :entityId and e.permissionKey = :permissionKey")
	EntityPermission findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(@Param("userId") Integer userId, @Param("entityType") String entityType, @Param("entityId") Integer entityId, @Param("permissionKey") String permissionKey);

	@Query("select e from EntityPermission e where e.user.id = :userId and e.entityType = :entityType and e.entityId = :entityId")
	List<EntityPermission> findByUserIdAndEntityTypeAndEntityId(@Param("userId") Integer userId, @Param("entityType") String entityType, @Param("entityId") Integer entityId);

	@Query("select e from EntityPermission e where e.entityType = :entityType and e.entityId = :entityId")
	List<EntityPermission> findByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Integer entityId);

	@Query("select e from EntityPermission e where e.user.id = :userId")
	List<EntityPermission> findByUserId(@Param("userId") Integer userId);

	default List<EntityPermission> getByCriteria(Request<EntityPermissionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from EntityPermission e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<EntityPermission> query = em.createQuery(req, EntityPermission.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<EntityPermissionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from EntityPermission e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}
}
