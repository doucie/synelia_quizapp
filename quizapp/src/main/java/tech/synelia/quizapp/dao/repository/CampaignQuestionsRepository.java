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
import tech.synelia.quizapp.dao.repository.customize._CampaignQuestionsRepository;

/**
 * Repository : CampaignQuestions.
 */
@Repository
public interface CampaignQuestionsRepository extends JpaRepository<CampaignQuestions, Integer>, _CampaignQuestionsRepository {
	/**
	 * Finds CampaignQuestions by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object CampaignQuestions whose id is equals to the given id. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.id = :id and e.isDeleted = :isDeleted")
	CampaignQuestions findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignQuestions by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object CampaignQuestions whose createdAt is equals to the given createdAt. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignQuestions by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object CampaignQuestions whose createdBy is equals to the given createdBy. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignQuestions by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object CampaignQuestions whose updatedAt is equals to the given updatedAt. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignQuestions by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object CampaignQuestions whose updatedBy is equals to the given updatedBy. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignQuestions by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object CampaignQuestions whose isDeleted is equals to the given isDeleted. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignQuestions by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object CampaignQuestions whose searchString is equals to the given searchString. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignQuestions by using questionId as a search criteria.
	 * 
	 * @param questionId
	 * @return An Object CampaignQuestions whose questionId is equals to the given questionId. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.questions.id = :questionId and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByQuestionId(@Param("questionId")Integer questionId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignQuestions by using campaignId as a search criteria.
	 * 
	 * @param campaignId
	 * @return An Object CampaignQuestions whose campaignId is equals to the given campaignId. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.campaigns.id = :campaignId and e.isDeleted = :isDeleted")
	List<CampaignQuestions> findByCampaignId(@Param("campaignId")Integer campaignId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignQuestions by using campaignId as a search criteria, ordered by order column.
	 * 
	 * @param campaignId
	 * @return A List of CampaignQuestions whose campaignId is equals to the given campaignId, ordered by order. If
	 *         no CampaignQuestions is found, this method returns an empty list.
	 */
	@Query("select e from CampaignQuestions e where e.campaigns.id = :campaignId and e.isDeleted = :isDeleted order by e.order asc")
	List<CampaignQuestions> findByCampaignIdOrderByOrder(@Param("campaignId")Integer campaignId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignQuestions by using campaignId and order as search criteria.
	 * 
	 * @param campaignId
	 * @param order
	 * @return An Object CampaignQuestions whose campaignId and order match the given values. If
	 *         no CampaignQuestions is found, this method returns null.
	 */
	@Query("select e from CampaignQuestions e where e.campaigns.id = :campaignId and e.order = :order and e.isDeleted = :isDeleted")
	CampaignQuestions findByCampaignIdAndOrder(@Param("campaignId")Integer campaignId, @Param("order")Integer order, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of CampaignQuestions by using campaignQuestionsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of CampaignQuestions
	 * @throws DataAccessException,ParseException
	 */
	default List<CampaignQuestions> getByCriteria(Request<CampaignQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CampaignQuestions e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CampaignQuestions> query = em.createQuery(req, CampaignQuestions.class);
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
	 * Finds count of CampaignQuestions by using campaignQuestionsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of CampaignQuestions
	 * 
	 */
	default Long count(Request<CampaignQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CampaignQuestions e where e IS NOT NULL";
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
	 * Finds CampaignQuestions by using campaignQuestionsDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of CampaignQuestions (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<CampaignQuestions> getAllByCriteria(Request<CampaignQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CampaignQuestions e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CampaignQuestions> query = em.createQuery(req, CampaignQuestions.class);
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
	 * Finds count of ALL CampaignQuestions by using campaignQuestionsDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of CampaignQuestions (including deleted)
	 * 
	 */
	default Long countAll(Request<CampaignQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CampaignQuestions e where e IS NOT NULL";
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
	default String getAllWhereExpression(Request<CampaignQuestionsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CampaignQuestionsDto dto = request.getData() != null ? request.getData() : new CampaignQuestionsDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignQuestionsDto elt : request.getDatas()) {
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

	/**
	 * get where expression
	 * @param request
	 * @param param
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String getWhereExpression(Request<CampaignQuestionsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CampaignQuestionsDto dto = request.getData() != null ? request.getData() : new CampaignQuestionsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignQuestionsDto elt : request.getDatas()) {
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
	default String generateCriteria(CampaignQuestionsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
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
			if (dto.getQuestionId()!= null && dto.getQuestionId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionId", dto.getQuestionId(), "e.questions.id", "Integer", dto.getQuestionIdParam(), param, index, locale));
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
}
