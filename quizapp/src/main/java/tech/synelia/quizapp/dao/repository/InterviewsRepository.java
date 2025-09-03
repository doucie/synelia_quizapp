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
import tech.synelia.quizapp.dao.repository.customize._InterviewsRepository;

/**
 * Repository : Interviews.
 */
@Repository
public interface InterviewsRepository extends JpaRepository<Interviews, Integer>, _InterviewsRepository {
	/**
	 * Finds Interviews by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Interviews whose id is equals to the given id. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.id = :id and e.isDeleted = :isDeleted")
	Interviews findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Interviews by using interviewLocation as a search criteria.
	 * 
	 * @param interviewLocation
	 * @return An Object Interviews whose interviewLocation is equals to the given interviewLocation. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.interviewLocation = :interviewLocation and e.isDeleted = :isDeleted")
	List<Interviews> findByInterviewLocation(@Param("interviewLocation")String interviewLocation, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using interviewStart as a search criteria.
	 * 
	 * @param interviewStart
	 * @return An Object Interviews whose interviewStart is equals to the given interviewStart. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.interviewStart = :interviewStart and e.isDeleted = :isDeleted")
	List<Interviews> findByInterviewStart(@Param("interviewStart")Date interviewStart, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using interviewEnd as a search criteria.
	 * 
	 * @param interviewEnd
	 * @return An Object Interviews whose interviewEnd is equals to the given interviewEnd. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.interviewEnd = :interviewEnd and e.isDeleted = :isDeleted")
	List<Interviews> findByInterviewEnd(@Param("interviewEnd")Date interviewEnd, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using interviewType as a search criteria.
	 * 
	 * @param interviewType
	 * @return An Object Interviews whose interviewType is equals to the given interviewType. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.interviewType = :interviewType and e.isDeleted = :isDeleted")
	List<Interviews> findByInterviewType(@Param("interviewType")String interviewType, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using markedOutOf as a search criteria.
	 * 
	 * @param markedOutOf
	 * @return An Object Interviews whose markedOutOf is equals to the given markedOutOf. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.markedOutOf = :markedOutOf and e.isDeleted = :isDeleted")
	List<Interviews> findByMarkedOutOf(@Param("markedOutOf")Integer markedOutOf, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Interviews whose createdAt is equals to the given createdAt. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Interviews> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Interviews whose createdBy is equals to the given createdBy. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Interviews> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Interviews whose updatedAt is equals to the given updatedAt. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Interviews> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Interviews whose updatedBy is equals to the given updatedBy. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Interviews> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Interviews whose isDeleted is equals to the given isDeleted. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.isDeleted = :isDeleted")
	List<Interviews> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Interviews by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Interviews whose searchString is equals to the given searchString. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Interviews> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Interviews by using campaignId as a search criteria.
	 * 
	 * @param campaignId
	 * @return An Object Interviews whose campaignId is equals to the given campaignId. If
	 *         no Interviews is found, this method returns null.
	 */
	@Query("select e from Interviews e where e.campaigns.id = :campaignId and e.isDeleted = :isDeleted")
	List<Interviews> findByCampaignId(@Param("campaignId")Integer campaignId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Interviews by using interviewsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Interviews
	 * @throws DataAccessException,ParseException
	 */
	default List<Interviews> getByCriteria(Request<InterviewsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Interviews e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Interviews> query = em.createQuery(req, Interviews.class);
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
	 * Finds count of Interviews by using interviewsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Interviews
	 * 
	 */
	default Long count(Request<InterviewsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Interviews e where e IS NOT NULL";
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
	default String getWhereExpression(Request<InterviewsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		InterviewsDto dto = request.getData() != null ? request.getData() : new InterviewsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (InterviewsDto elt : request.getDatas()) {
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
	default String generateCriteria(InterviewsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getInterviewLocation())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewLocation", dto.getInterviewLocation(), "e.interviewLocation", "String", dto.getInterviewLocationParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getInterviewStart())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewStart", dto.getInterviewStart(), "e.interviewStart", "Date", dto.getInterviewStartParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getInterviewEnd())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewEnd", dto.getInterviewEnd(), "e.interviewEnd", "Date", dto.getInterviewEndParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getInterviewType())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewType", dto.getInterviewType(), "e.interviewType", "String", dto.getInterviewTypeParam(), param, index, locale));
			}
			if (dto.getMarkedOutOf()!= null && dto.getMarkedOutOf() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("markedOutOf", dto.getMarkedOutOf(), "e.markedOutOf", "Integer", dto.getMarkedOutOfParam(), param, index, locale));
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
}
