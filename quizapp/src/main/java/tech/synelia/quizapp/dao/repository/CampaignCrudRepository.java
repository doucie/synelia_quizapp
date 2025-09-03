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
import tech.synelia.quizapp.dao.repository.customize._CampaignCrudRepository;

/**
 * Repository : CampaignCrud.
 */
@Repository
public interface CampaignCrudRepository extends JpaRepository<CampaignCrud, Integer>, _CampaignCrudRepository {
	/**
	 * Finds CampaignCrud by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object CampaignCrud whose id is equals to the given id. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.id = :id and e.isDeleted = :isDeleted")
	CampaignCrud findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignCrud by using canUpdate as a search criteria.
	 * 
	 * @param canUpdate
	 * @return An Object CampaignCrud whose canUpdate is equals to the given canUpdate. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.canUpdate = :canUpdate and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByCanUpdate(@Param("canUpdate")Boolean canUpdate, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using canDelete as a search criteria.
	 * 
	 * @param canDelete
	 * @return An Object CampaignCrud whose canDelete is equals to the given canDelete. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.canDelete = :canDelete and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByCanDelete(@Param("canDelete")Boolean canDelete, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using canEvaluate as a search criteria.
	 * 
	 * @param canEvaluate
	 * @return An Object CampaignCrud whose canEvaluate is equals to the given canEvaluate. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.canEvaluate = :canEvaluate and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByCanEvaluate(@Param("canEvaluate")Boolean canEvaluate, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using follow as a search criteria.
	 * 
	 * @param follow
	 * @return An Object CampaignCrud whose follow is equals to the given follow. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.follow = :follow and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByFollow(@Param("follow")Boolean follow, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object CampaignCrud whose createdAt is equals to the given createdAt. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object CampaignCrud whose createdBy is equals to the given createdBy. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object CampaignCrud whose updatedAt is equals to the given updatedAt. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object CampaignCrud whose updatedBy is equals to the given updatedBy. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object CampaignCrud whose isDeleted is equals to the given isDeleted. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.isDeleted = :isDeleted")
	List<CampaignCrud> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CampaignCrud by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object CampaignCrud whose searchString is equals to the given searchString. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<CampaignCrud> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignCrud by using userId as a search criteria.
	 * 
	 * @param userId
	 * @return An Object CampaignCrud whose userId is equals to the given userId. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.user.id = :userId and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByUserId(@Param("userId")Integer userId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CampaignCrud by using campaignId as a search criteria.
	 * 
	 * @param campaignId
	 * @return An Object CampaignCrud whose campaignId is equals to the given campaignId. If
	 *         no CampaignCrud is found, this method returns null.
	 */
	@Query("select e from CampaignCrud e where e.campaigns.id = :campaignId and e.isDeleted = :isDeleted")
	List<CampaignCrud> findByCampaignId(@Param("campaignId")Integer campaignId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of CampaignCrud by using campaignCrudDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of CampaignCrud
	 * @throws DataAccessException,ParseException
	 */
	default List<CampaignCrud> getByCriteria(Request<CampaignCrudDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CampaignCrud e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CampaignCrud> query = em.createQuery(req, CampaignCrud.class);
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
	 * Finds count of CampaignCrud by using campaignCrudDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of CampaignCrud
	 * 
	 */
	default Long count(Request<CampaignCrudDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CampaignCrud e where e IS NOT NULL";
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
	default String getWhereExpression(Request<CampaignCrudDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CampaignCrudDto dto = request.getData() != null ? request.getData() : new CampaignCrudDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignCrudDto elt : request.getDatas()) {
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
	default String generateCriteria(CampaignCrudDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (dto.getCanUpdate()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("canUpdate", dto.getCanUpdate(), "e.canUpdate", "Boolean", dto.getCanUpdateParam(), param, index, locale));
			}
			if (dto.getCanDelete()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("canDelete", dto.getCanDelete(), "e.canDelete", "Boolean", dto.getCanDeleteParam(), param, index, locale));
			}
			if (dto.getCanEvaluate()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("canEvaluate", dto.getCanEvaluate(), "e.canEvaluate", "Boolean", dto.getCanEvaluateParam(), param, index, locale));
			}
			if (dto.getFollow()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("follow", dto.getFollow(), "e.follow", "Boolean", dto.getFollowParam(), param, index, locale));
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
			if (dto.getUserId()!= null && dto.getUserId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userId", dto.getUserId(), "e.user.id", "Integer", dto.getUserIdParam(), param, index, locale));
			}
			if (dto.getCampaignId()!= null && dto.getCampaignId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignId", dto.getCampaignId(), "e.campaigns.id", "Integer", dto.getCampaignIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUserFirstName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userFirstName", dto.getUserFirstName(), "e.user.firstName", "String", dto.getUserFirstNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUserLastName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userLastName", dto.getUserLastName(), "e.user.lastName", "String", dto.getUserLastNameParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
