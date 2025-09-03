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
import tech.synelia.quizapp.dao.repository.customize._CandidateInterviewRepository;

/**
 * Repository : CandidateInterview.
 */
@Repository
public interface CandidateInterviewRepository extends JpaRepository<CandidateInterview, Integer>, _CandidateInterviewRepository {
	/**
	 * Finds CandidateInterview by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object CandidateInterview whose id is equals to the given id. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.id = :id and e.isDeleted = :isDeleted")
	CandidateInterview findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateInterview by using interviewStart as a search criteria.
	 * 
	 * @param interviewStart
	 * @return An Object CandidateInterview whose interviewStart is equals to the given interviewStart. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.interviewStart = :interviewStart and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByInterviewStart(@Param("interviewStart")Date interviewStart, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using interviewDuration as a search criteria.
	 * 
	 * @param interviewDuration
	 * @return An Object CandidateInterview whose interviewDuration is equals to the given interviewDuration. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.interviewDuration = :interviewDuration and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByInterviewDuration(@Param("interviewDuration")Integer interviewDuration, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object CandidateInterview whose createdAt is equals to the given createdAt. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object CandidateInterview whose createdBy is equals to the given createdBy. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object CandidateInterview whose updatedAt is equals to the given updatedAt. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object CandidateInterview whose updatedBy is equals to the given updatedBy. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object CandidateInterview whose isDeleted is equals to the given isDeleted. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.isDeleted = :isDeleted")
	List<CandidateInterview> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds CandidateInterview by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object CandidateInterview whose searchString is equals to the given searchString. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<CandidateInterview> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateInterview by using applicationId as a search criteria.
	 * 
	 * @param applicationId
	 * @return An Object CandidateInterview whose applicationId is equals to the given applicationId. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.applications.id = :applicationId and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByApplicationId(@Param("applicationId")Integer applicationId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds CandidateInterview by using interviewId as a search criteria.
	 * 
	 * @param interviewId
	 * @return An Object CandidateInterview whose interviewId is equals to the given interviewId. If
	 *         no CandidateInterview is found, this method returns null.
	 */
	@Query("select e from CandidateInterview e where e.interviews.id = :interviewId and e.isDeleted = :isDeleted")
	List<CandidateInterview> findByInterviewId(@Param("interviewId")Integer interviewId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of CandidateInterview by using candidateInterviewDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of CandidateInterview
	 * @throws DataAccessException,ParseException
	 */
	default List<CandidateInterview> getByCriteria(Request<CandidateInterviewDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CandidateInterview e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CandidateInterview> query = em.createQuery(req, CandidateInterview.class);
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
	 * Finds count of CandidateInterview by using candidateInterviewDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of CandidateInterview
	 * 
	 */
	default Long count(Request<CandidateInterviewDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from CandidateInterview e where e IS NOT NULL";
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
	default String getWhereExpression(Request<CandidateInterviewDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		CandidateInterviewDto dto = request.getData() != null ? request.getData() : new CandidateInterviewDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CandidateInterviewDto elt : request.getDatas()) {
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
	default String generateCriteria(CandidateInterviewDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getInterviewStart())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewStart", dto.getInterviewStart(), "e.interviewStart", "Date", dto.getInterviewStartParam(), param, index, locale));
			}
			if (dto.getInterviewDuration()!= null && dto.getInterviewDuration() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewDuration", dto.getInterviewDuration(), "e.interviewDuration", "Integer", dto.getInterviewDurationParam(), param, index, locale));
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
			if (dto.getInterviewId()!= null && dto.getInterviewId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewId", dto.getInterviewId(), "e.interviews.id", "Integer", dto.getInterviewIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
