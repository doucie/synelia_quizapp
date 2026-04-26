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
import tech.synelia.quizapp.dao.repository.customize._UserBusinessGroupRepository;

@Repository
public interface UserBusinessGroupRepository extends JpaRepository<UserBusinessGroup, Integer>, _UserBusinessGroupRepository {

	@Query("select e from UserBusinessGroup e where e.id = :id and e.isDeleted = :isDeleted")
	UserBusinessGroup findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from UserBusinessGroup e where e.isDeleted = false")
	List<UserBusinessGroup> findAllActive();

	@Query("select e from UserBusinessGroup e where e.user.id = :userId")
	List<UserBusinessGroup> findByUserId(@Param("userId") Integer userId);

	@Query("select e from UserBusinessGroup e where e.businessGroup.id = :businessGroupId")
	List<UserBusinessGroup> findByBusinessGroupId(@Param("businessGroupId") Integer businessGroupId);

    @Query("select e from UserBusinessGroup e where e.businessGroup.id = :businessGroupId and e.isModerator = true and e.isDeleted = false")
    List<UserBusinessGroup> findModeratorsForGroup(@Param("businessGroupId") Integer businessGroupId);

	default List<UserBusinessGroup> getByCriteria(Request<UserBusinessGroupDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from UserBusinessGroup e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<UserBusinessGroup> query = em.createQuery(req, UserBusinessGroup.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<UserBusinessGroupDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from UserBusinessGroup e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getWhereExpression(request, param, locale);
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}
}
