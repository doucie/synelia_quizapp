package tech.synelia.quizapp.dao.repository;

import java.util.Date;
// import java.text.ParseException;
// import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
// import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._CandidateTokenRepository;

/**
 * Repository : CandidateToken.
 */
@Repository
public interface CandidateTokenRepository extends JpaRepository<CandidateToken, Integer>, _CandidateTokenRepository {
	/**
	 * Finds CandidateToken by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object CandidateToken whose id is equals to the given id. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.id = :id and e.isDeleted = :isDeleted")
	CandidateToken findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateToken by using tokenString as a search criteria.
	 * 
	 * @param tokenString
	 * @return An Object CandidateToken whose tokenString is equals to the given tokenString. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.tokenString = :tokenString and e.isDeleted = :isDeleted")
	List<CandidateToken> findByTokenString(@Param("tokenString")String tokenString, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from CandidateToken e where lower(e.tokenString) = lower(:tokenString) and e.isDeleted = :isDeleted")
	List<CandidateToken> findByTokenStringIgnoreCase(@Param("tokenString")String tokenString, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateToken by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object CandidateToken whose createdAt is equals to the given createdAt. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<CandidateToken> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateToken by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object CandidateToken whose createdBy is equals to the given createdBy. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<CandidateToken> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateToken by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object CandidateToken whose updatedAt is equals to the given updatedAt. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<CandidateToken> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateToken by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object CandidateToken whose updatedBy is equals to the given updatedBy. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<CandidateToken> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateToken by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object CandidateToken whose isDeleted is equals to the given isDeleted. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.isDeleted = :isDeleted")
	List<CandidateToken> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateToken by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object CandidateToken whose searchString is equals to the given searchString. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<CandidateToken> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateToken by using applicationId as a search criteria.
	 * 
	 * @param applicationId
	 * @return An Object CandidateToken whose applicationId is equals to the given applicationId. If
	 *         no CandidateToken is found, this method returns null.
	 */
	@Query("select e from CandidateToken e where e.applications.id = :applicationId and e.isDeleted = :isDeleted")
	List<CandidateToken> findByApplicationId(@Param("applicationId")Integer applicationId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of CandidateToken by using candidateTokenDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of CandidateToken
	 * @throws DataAccessException,ParseException
	 */
	default List<CandidateToken> getByCriteria(Request<CandidateTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CandidateToken e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CandidateToken> query = em.createQuery(req, CandidateToken.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	/**
	 * Finds count of CandidateToken by using candidateTokenDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of CandidateToken
	 * 
	 */
	default Long count(Request<CandidateTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CandidateToken e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getResultList().get(0);
		return count;
	}

	/**
	 * get where expression
	 * @param request
	 * @param param
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String getWhereExpression(Request<CandidateTokenDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CandidateTokenDto dto = request.getData() != null ? request.getData() : new CandidateTokenDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CandidateTokenDto elt : request.getDatas()) {
				elt.setIsDeleted(false);
				String eltReq = generateCriteria(elt, param, index, locale);
				if (request.getIsAnd() != null && request.getIsAnd()) {
					othersReq += "and (" + eltReq + ") ";
				} else {
					othersReq += "or (" + eltReq + ") ";
				}
				index++;
			}
		}
		String req = "";
		if (!mainReq.isEmpty()) {
			req += " and (" + mainReq + ") ";
		}
		req += othersReq;
		return req;
	}

	/**
	 * generate sql query for dto
	 * @param dto
	 * @param param
	 * @param index
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String generateCriteria(CandidateTokenDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getTokenString())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("tokenString", dto.getTokenString(), "e.tokenString", "String", dto.getTokenStringParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCreatedAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			if (dto.getCreatedBy()!= null && dto.getCreatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdBy", dto.getCreatedBy(), "e.createdBy", "Integer", dto.getCreatedByParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUpdatedAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}
			if (dto.getUpdatedBy()!= null && dto.getUpdatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedBy", dto.getUpdatedBy(), "e.updatedBy", "Integer", dto.getUpdatedByParam(), param, index, locale));
			}
			if (dto.getIsDeleted()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSearchString())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("searchString", dto.getSearchString(), "e.searchString", "String", dto.getSearchStringParam(), param, index, locale));
			}
			if (dto.getApplicationId()!= null && dto.getApplicationId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("applicationId", dto.getApplicationId(), "e.applications.id", "Integer", dto.getApplicationIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}

	/**
	 * Finds CandidateToken by using candidateTokenDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of CandidateToken (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<CandidateToken> getAllByCriteria(Request<CandidateTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CandidateToken e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CandidateToken> query = em.createQuery(req, CandidateToken.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	/**
	 * Finds count of ALL CandidateToken by using candidateTokenDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of CandidateToken (including deleted)
	 * 
	 */
	default Long countAll(Request<CandidateTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CandidateToken e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getResultList().get(0);
		return count;
	}

	/**
	 * get where expression for ALL (including deleted)
	 * @param request
	 * @param param
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String getAllWhereExpression(Request<CandidateTokenDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CandidateTokenDto dto = request.getData() != null ? request.getData() : new CandidateTokenDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CandidateTokenDto elt : request.getDatas()) {
				// NOTE: We DON'T force isDeleted = false here either
				String eltReq = generateCriteria(elt, param, index, locale);
				if (request.getIsAnd() != null && request.getIsAnd()) {
					othersReq += "and (" + eltReq + ") ";
				} else {
					othersReq += "or (" + eltReq + ") ";
				}
				index++;
			}
		}
		String req = "";
		if (!mainReq.isEmpty()) {
			req += " and (" + mainReq + ") ";
		}
		req += othersReq;
		return req;
	}
}
