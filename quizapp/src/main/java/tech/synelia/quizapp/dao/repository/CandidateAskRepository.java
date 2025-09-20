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
import tech.synelia.quizapp.dao.repository.customize._CandidateAskRepository;

/**
 * Repository : CandidateAsk.
 */
@Repository
public interface CandidateAskRepository extends JpaRepository<CandidateAsk, Integer>, _CandidateAskRepository {
	/**
	 * Finds CandidateAsk by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object CandidateAsk whose id is equals to the given id. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.id = :id and e.isDeleted = :isDeleted")
	CandidateAsk findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateAsk by using requestType as a search criteria.
	 * 
	 * @param requestType
	 * @return An Object CandidateAsk whose requestType is equals to the given requestType. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.requestType = :requestType and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByRequestType(@Param("requestType")String requestType, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using isVerified as a search criteria.
	 * 
	 * @param isVerified
	 * @return An Object CandidateAsk whose isVerified is equals to the given isVerified. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.isVerified = :isVerified and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByIsVerified(@Param("isVerified")Boolean isVerified, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using firstName as a search criteria.
	 * 
	 * @param firstName
	 * @return An Object CandidateAsk whose firstName is equals to the given firstName. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.firstName = :firstName and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByFirstName(@Param("firstName")String firstName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using lastName as a search criteria.
	 * 
	 * @param lastName
	 * @return An Object CandidateAsk whose lastName is equals to the given lastName. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.lastName = :lastName and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByLastName(@Param("lastName")String lastName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using newEmail as a search criteria.
	 * 
	 * @param newEmail
	 * @return An Object CandidateAsk whose newEmail is equals to the given newEmail. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.newEmail = :newEmail and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByNewEmail(@Param("newEmail")String newEmail, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using newPhone as a search criteria.
	 * 
	 * @param newPhone
	 * @return An Object CandidateAsk whose newPhone is equals to the given newPhone. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.newPhone = :newPhone and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByNewPhone(@Param("newPhone")String newPhone, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object CandidateAsk whose createdAt is equals to the given createdAt. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object CandidateAsk whose createdBy is equals to the given createdBy. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object CandidateAsk whose updatedAt is equals to the given updatedAt. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object CandidateAsk whose updatedBy is equals to the given updatedBy. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object CandidateAsk whose isDeleted is equals to the given isDeleted. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.isDeleted = :isDeleted")
	List<CandidateAsk> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateAsk by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object CandidateAsk whose searchString is equals to the given searchString. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<CandidateAsk> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateAsk by using applicationId as a search criteria.
	 * 
	 * @param applicationId
	 * @return An Object CandidateAsk whose applicationId is equals to the given applicationId. If
	 *         no CandidateAsk is found, this method returns null.
	 */
	@Query("select e from CandidateAsk e where e.applications.id = :applicationId and e.isDeleted = :isDeleted")
	List<CandidateAsk> findByApplicationId(@Param("applicationId")Integer applicationId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of CandidateAsk by using candidateAskDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of CandidateAsk
	 * @throws DataAccessException,ParseException
	 */
	default List<CandidateAsk> getByCriteria(Request<CandidateAskDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CandidateAsk e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CandidateAsk> query = em.createQuery(req, CandidateAsk.class);
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
	 * Finds count of CandidateAsk by using candidateAskDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of CandidateAsk
	 * 
	 */
	default Long count(Request<CandidateAskDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CandidateAsk e where e IS NOT NULL";
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
	default String getWhereExpression(Request<CandidateAskDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CandidateAskDto dto = request.getData() != null ? request.getData() : new CandidateAskDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CandidateAskDto elt : request.getDatas()) {
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
	default String generateCriteria(CandidateAskDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getRequestType())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("requestType", dto.getRequestType(), "e.requestType", "String", dto.getRequestTypeParam(), param, index, locale));
			}
			if (dto.getIsVerified()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isVerified", dto.getIsVerified(), "e.isVerified", "Boolean", dto.getIsVerifiedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getFirstName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("firstName", dto.getFirstName(), "e.firstName", "String", dto.getFirstNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getLastName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("lastName", dto.getLastName(), "e.lastName", "String", dto.getLastNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getNewEmail())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("newEmail", dto.getNewEmail(), "e.newEmail", "String", dto.getNewEmailParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getNewPhone())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("newPhone", dto.getNewPhone(), "e.newPhone", "String", dto.getNewPhoneParam(), param, index, locale));
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
	 * Finds CandidateAsk by using candidateAskDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of CandidateAsk (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<CandidateAsk> getAllByCriteria(Request<CandidateAskDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CandidateAsk e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CandidateAsk> query = em.createQuery(req, CandidateAsk.class);
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
	 * Finds count of ALL CandidateAsk by using candidateAskDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of CandidateAsk (including deleted)
	 * 
	 */
	default Long countAll(Request<CandidateAskDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CandidateAsk e where e IS NOT NULL";
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
	default String getAllWhereExpression(Request<CandidateAskDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CandidateAskDto dto = request.getData() != null ? request.getData() : new CandidateAskDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CandidateAskDto elt : request.getDatas()) {
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
