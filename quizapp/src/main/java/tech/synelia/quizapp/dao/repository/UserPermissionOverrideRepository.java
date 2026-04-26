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
import tech.synelia.quizapp.dao.repository.customize._UserPermissionOverrideRepository;

@Repository
public interface UserPermissionOverrideRepository extends JpaRepository<UserPermissionOverride, Integer>, _UserPermissionOverrideRepository {

	@Query("select e from UserPermissionOverride e where e.user.id = :userId")
	List<UserPermissionOverride> findByUserId(@Param("userId") Integer userId);

	@Query("select e from UserPermissionOverride e where e.user.id = :userId and e.functionality = :functionality")
	UserPermissionOverride findByUserIdAndFunctionality(@Param("userId") Integer userId, @Param("functionality") String functionality);

	default List<UserPermissionOverride> getByCriteria(Request<UserPermissionOverrideDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from UserPermissionOverride e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<UserPermissionOverride> query = em.createQuery(req, UserPermissionOverride.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<UserPermissionOverrideDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from UserPermissionOverride e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}
}
