package tech.synelia.quizapp.dao.repository;

import java.util.Date;
import java.util.List;
// import java.text.ParseException;
// import java.text.SimpleDateFormat;
import java.util.HashMap;
// import java.util.List;
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
import tech.synelia.quizapp.dao.repository.customize._SourceTokenRepository;

/**
 * Repository : SourceToken.
 */
@Repository
public interface SourceTokenRepository extends JpaRepository<SourceToken, Integer>, _SourceTokenRepository {
	/**
	 * Finds SourceToken by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object SourceToken whose id is equals to the given id. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.id = :id and e.isDeleted = :isDeleted")
	SourceToken findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds SourceToken by using tokenString as a search criteria.
	 * 
	 * @param tokenString
	 * @return An Object SourceToken whose tokenString is equals to the given tokenString. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.tokenString = :tokenString and e.isDeleted = :isDeleted")
	SourceToken findByTokenString(@Param("tokenString")String tokenString, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds SourceToken by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object SourceToken whose createdAt is equals to the given createdAt. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<SourceToken> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds SourceToken by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object SourceToken whose createdBy is equals to the given createdBy. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<SourceToken> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds SourceToken by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object SourceToken whose updatedAt is equals to the given updatedAt. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<SourceToken> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds SourceToken by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object SourceToken whose updatedBy is equals to the given updatedBy. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<SourceToken> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds SourceToken by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object SourceToken whose isDeleted is equals to the given isDeleted. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.isDeleted = :isDeleted")
	List<SourceToken> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds SourceToken by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object SourceToken whose searchString is equals to the given searchString. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<SourceToken> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds SourceToken by using campaignId as a search criteria.
	 * 
	 * @param campaignId
	 * @return An Object SourceToken whose campaignId is equals to the given campaignId. If
	 *         no SourceToken is found, this method returns null.
	 */
	@Query("select e from SourceToken e where e.campaigns.id = :campaignId and e.isDeleted = :isDeleted")
	List<SourceToken> findByCampaignId(@Param("campaignId")Integer campaignId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of SourceToken by using sourceTokenDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of SourceToken
	 * @throws DataAccessException,ParseException
	 */
	default List<SourceToken> getByCriteria(Request<SourceTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from SourceToken e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<SourceToken> query = em.createQuery(req, SourceToken.class);
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
	 * Finds count of SourceToken by using sourceTokenDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of SourceToken
	 * 
	 */
	default Long count(Request<SourceTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from SourceToken e where e IS NOT NULL";
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
	default String getWhereExpression(Request<SourceTokenDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		SourceTokenDto dto = request.getData() != null ? request.getData() : new SourceTokenDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (SourceTokenDto elt : request.getDatas()) {
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
	default String generateCriteria(SourceTokenDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
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
			if (dto.getCampaignId()!= null && dto.getCampaignId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignId", dto.getCampaignId(), "e.campaigns.id", "Integer", dto.getCampaignIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}

	/**
	 * Finds SourceToken by using sourceTokenDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of SourceToken (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<SourceToken> getAllByCriteria(Request<SourceTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from SourceToken e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<SourceToken> query = em.createQuery(req, SourceToken.class);
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
	 * Finds count of ALL SourceToken by using sourceTokenDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of SourceToken (including deleted)
	 * 
	 */
	default Long countAll(Request<SourceTokenDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from SourceToken e where e IS NOT NULL";
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
	default String getAllWhereExpression(Request<SourceTokenDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		SourceTokenDto dto = request.getData() != null ? request.getData() : new SourceTokenDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (SourceTokenDto elt : request.getDatas()) {
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
