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
import tech.synelia.quizapp.dao.repository.customize._BusinessGroupPermissionRepository;

@Repository
public interface BusinessGroupPermissionRepository extends JpaRepository<BusinessGroupPermission, Integer>, _BusinessGroupPermissionRepository {

	@Query("select e from BusinessGroupPermission e where e.id = :id and e.isDeleted = :isDeleted")
	BusinessGroupPermission findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from BusinessGroupPermission e where e.isDeleted = false")
	List<BusinessGroupPermission> findAllActive();

	@Query("select e from BusinessGroupPermission e where e.businessGroup.id = :businessGroupId")
	List<BusinessGroupPermission> findByBusinessGroupId(@Param("businessGroupId") Integer businessGroupId);

	@Query("select case when count(e) > 0 then true else false end from BusinessGroupPermission e where e.businessGroup.id = :businessGroupId and e.functionality = :functionality")
	boolean existsByBusinessGroupIdAndFunctionality(@Param("businessGroupId") Integer businessGroupId, @Param("functionality") String functionality);

	default List<BusinessGroupPermission> getByCriteria(Request<BusinessGroupPermissionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from BusinessGroupPermission e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<BusinessGroupPermission> query = em.createQuery(req, BusinessGroupPermission.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<BusinessGroupPermissionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from BusinessGroupPermission e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}
}
