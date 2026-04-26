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
import tech.synelia.quizapp.dao.repository.customize._SystemRolePermissionRepository;

@Repository
public interface SystemRolePermissionRepository extends JpaRepository<SystemRolePermission, Integer>, _SystemRolePermissionRepository {

	@Query("select e from SystemRolePermission e where e.systemRole = :systemRole")
	List<SystemRolePermission> findBySystemRole(@Param("systemRole") String systemRole);

	@Query("select case when count(e) > 0 then true else false end from SystemRolePermission e where e.systemRole = :systemRole and e.functionality = :functionality")
	boolean existsBySystemRoleAndFunctionality(@Param("systemRole") String systemRole, @Param("functionality") String functionality);

	default List<SystemRolePermission> getByCriteria(Request<SystemRolePermissionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from SystemRolePermission e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<SystemRolePermission> query = em.createQuery(req, SystemRolePermission.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<SystemRolePermissionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from SystemRolePermission e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}
}
