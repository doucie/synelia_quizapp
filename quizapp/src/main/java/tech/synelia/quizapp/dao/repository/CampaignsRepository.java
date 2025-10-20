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
import tech.synelia.quizapp.dao.repository.customize._CampaignsRepository;

/**
 * Repository : Campaigns.
 */
@Repository
public interface CampaignsRepository extends JpaRepository<Campaigns, Integer>, _CampaignsRepository {
	/**
	 * Finds Campaigns by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Campaigns whose id is equals to the given id. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.id = :id and e.isDeleted = :isDeleted")
	Campaigns findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Campaigns by using campaignTitle as a search criteria.
	 * 
	 * @param campaignTitle
	 * @return An Object Campaigns whose campaignTitle is equals to the given campaignTitle. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.campaignTitle = :campaignTitle and e.isDeleted = :isDeleted")
	List<Campaigns> findByCampaignTitle(@Param("campaignTitle")String campaignTitle, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using campaignDesc as a search criteria.
	 * 
	 * @param campaignDesc
	 * @return An Object Campaigns whose campaignDesc is equals to the given campaignDesc. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.campaignDesc = :campaignDesc and e.isDeleted = :isDeleted")
	List<Campaigns> findByCampaignDesc(@Param("campaignDesc")String campaignDesc, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using campaignStatus as a search criteria.
	 * 
	 * @param campaignStatus
	 * @return An Object Campaigns whose campaignStatus is equals to the given campaignStatus. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.campaignStatus = :campaignStatus and e.isDeleted = :isDeleted")
	List<Campaigns> findByCampaignStatus(@Param("campaignStatus")String campaignStatus, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using campaignStart as a search criteria.
	 * 
	 * @param campaignStart
	 * @return An Object Campaigns whose campaignStart is equals to the given campaignStart. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.campaignStart = :campaignStart and e.isDeleted = :isDeleted")
	List<Campaigns> findByCampaignStart(@Param("campaignStart")Date campaignStart, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using campaignEnd as a search criteria.
	 * 
	 * @param campaignEnd
	 * @return An Object Campaigns whose campaignEnd is equals to the given campaignEnd. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.campaignEnd = :campaignEnd and e.isDeleted = :isDeleted")
	List<Campaigns> findByCampaignEnd(@Param("campaignEnd")Date campaignEnd, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using maxApply as a search criteria.
	 * 
	 * @param maxApply
	 * @return An Object Campaigns whose maxApply is equals to the given maxApply. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.maxApply = :maxApply and e.isDeleted = :isDeleted")
	List<Campaigns> findByMaxApply(@Param("maxApply")Integer maxApply, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using allCanEvaluate as a search criteria.
	 * 
	 * @param allCanEvaluate
	 * @return An Object Campaigns whose allCanEvaluate is equals to the given allCanEvaluate. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.allCanEvaluate = :allCanEvaluate and e.isDeleted = :isDeleted")
	List<Campaigns> findByAllCanEvaluate(@Param("allCanEvaluate")Boolean allCanEvaluate, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using totalQuestions as a search criteria.
	 * 
	 * @param totalQuestions
	 * @return An Object Campaigns whose totalQuestions is equals to the given totalQuestions. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.totalQuestions = :totalQuestions and e.isDeleted = :isDeleted")
	List<Campaigns> findByTotalQuestions(@Param("totalQuestions")Integer totalQuestions, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Campaigns whose createdAt is equals to the given createdAt. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Campaigns> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Campaigns whose createdBy is equals to the given createdBy. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Campaigns> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Campaigns whose updatedAt is equals to the given updatedAt. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Campaigns> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Campaigns whose updatedBy is equals to the given updatedBy. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Campaigns> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Campaigns whose isDeleted is equals to the given isDeleted. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.isDeleted = :isDeleted")
	List<Campaigns> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Campaigns by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Campaigns whose searchString is equals to the given searchString. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Campaigns> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Campaigns by using creatorId as a search criteria.
	 * 
	 * @param creatorId
	 * @return An Object Campaigns whose creatorId is equals to the given creatorId. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.user.id = :creatorId and e.isDeleted = :isDeleted")
	List<Campaigns> findByCreatorId(@Param("creatorId")Integer creatorId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Campaigns by using specialityId as a search criteria.
	 * 
	 * @param specialityId
	 * @return An Object Campaigns whose specialityId is equals to the given specialityId. If
	 *         no Campaigns is found, this method returns null.
	 */
	@Query("select e from Campaigns e where e.specialities.id = :specialityId and e.isDeleted = :isDeleted")
	List<Campaigns> findBySpecialityId(@Param("specialityId")Integer specialityId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Campaigns by using campaignsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Campaigns
	 * @throws DataAccessException,ParseException
	 */
	default List<Campaigns> getByCriteria(Request<CampaignsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Campaigns e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Campaigns> query = em.createQuery(req, Campaigns.class);
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
	 * Finds count of Campaigns by using campaignsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Campaigns
	 * 
	 */
	default Long count(Request<CampaignsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Campaigns e where e IS NOT NULL";
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
	 * Finds Campaigns by using campaignsDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of Campaigns (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<Campaigns> getAllByCriteria(Request<CampaignsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Campaigns e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Campaigns> query = em.createQuery(req, Campaigns.class);
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
	 * Finds count of ALL Campaigns by using campaignsDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of Campaigns (including deleted)
	 * 
	 */
	default Long countAll(Request<CampaignsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Campaigns e where e IS NOT NULL";
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
	default String getAllWhereExpression(Request<CampaignsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CampaignsDto dto = request.getData() != null ? request.getData() : new CampaignsDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignsDto elt : request.getDatas()) {
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
	default String getWhereExpression(Request<CampaignsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CampaignsDto dto = request.getData() != null ? request.getData() : new CampaignsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignsDto elt : request.getDatas()) {
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
	default String generateCriteria(CampaignsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCampaignTitle())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignTitle", dto.getCampaignTitle(), "e.campaignTitle", "String", dto.getCampaignTitleParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCampaignDesc())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignDesc", dto.getCampaignDesc(), "e.campaignDesc", "String", dto.getCampaignDescParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCampaignStatus())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignStatus", dto.getCampaignStatus(), "e.campaignStatus", "String", dto.getCampaignStatusParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCampaignStart())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignStart", dto.getCampaignStart(), "e.campaignStart", "Date", dto.getCampaignStartParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCampaignEnd())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("campaignEnd", dto.getCampaignEnd(), "e.campaignEnd", "Date", dto.getCampaignEndParam(), param, index, locale));
			}
			if (dto.getMaxApply()!= null && dto.getMaxApply() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("maxApply", dto.getMaxApply(), "e.maxApply", "Integer", dto.getMaxApplyParam(), param, index, locale));
			}
			if (dto.getAllCanEvaluate()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("allCanEvaluate", dto.getAllCanEvaluate(), "e.allCanEvaluate", "Boolean", dto.getAllCanEvaluateParam(), param, index, locale));
			}
			if (dto.getTotalQuestions()!= null && dto.getTotalQuestions() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("totalQuestions", dto.getTotalQuestions(), "e.totalQuestions", "Integer", dto.getTotalQuestionsParam(), param, index, locale));
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
			if (dto.getCreatorId()!= null && dto.getCreatorId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("creatorId", dto.getCreatorId(), "e.user.id", "Integer", dto.getCreatorIdParam(), param, index, locale));
			}
			if (dto.getSpecialityId()!= null && dto.getSpecialityId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("specialityId", dto.getSpecialityId(), "e.specialities.id", "Integer", dto.getSpecialityIdParam(), param, index, locale));
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
