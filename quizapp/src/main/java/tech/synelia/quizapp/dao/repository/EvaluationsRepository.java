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
import tech.synelia.quizapp.dao.repository.customize._EvaluationsRepository;

/**
 * Repository : Evaluations.
 */
@Repository
public interface EvaluationsRepository extends JpaRepository<Evaluations, Integer>, _EvaluationsRepository {
	/**
	 * Finds Evaluations by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Evaluations whose id is equals to the given id. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.id = :id and e.isDeleted = :isDeleted")
	Evaluations findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Evaluations by using candidateMark as a search criteria.
	 * 
	 * @param candidateMark
	 * @return An Object Evaluations whose candidateMark is equals to the given candidateMark. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.candidateMark = :candidateMark and e.isDeleted = :isDeleted")
	List<Evaluations> findByCandidateMark(@Param("candidateMark")Integer candidateMark, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using recruiterComment as a search criteria.
	 * 
	 * @param recruiterComment
	 * @return An Object Evaluations whose recruiterComment is equals to the given recruiterComment. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.recruiterComment = :recruiterComment and e.isDeleted = :isDeleted")
	List<Evaluations> findByRecruiterComment(@Param("recruiterComment")String recruiterComment, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Evaluations whose createdAt is equals to the given createdAt. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Evaluations> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Evaluations whose createdBy is equals to the given createdBy. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Evaluations> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Evaluations whose updatedAt is equals to the given updatedAt. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Evaluations> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Evaluations whose updatedBy is equals to the given updatedBy. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Evaluations> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Evaluations whose isDeleted is equals to the given isDeleted. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.isDeleted = :isDeleted")
	List<Evaluations> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Evaluations by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Evaluations whose searchString is equals to the given searchString. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Evaluations> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Evaluations by using candidateInterviewId as a search criteria.
	 * 
	 * @param candidateInterviewId
	 * @return An Object Evaluations whose candidateInterviewId is equals to the given candidateInterviewId. If
	 *         no Evaluations is found, this method returns null.
	 */
	@Query("select e from Evaluations e where e.candidateInterview.id = :candidateInterviewId and e.isDeleted = :isDeleted")
	List<Evaluations> findByCandidateInterviewId(@Param("candidateInterviewId")Integer candidateInterviewId, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Evaluations e where e.interviewParticipant.id = :interviewParticipantId and e.isDeleted = :isDeleted")
	List<Evaluations> findByInterviewParticipantId(@Param("interviewParticipantId")Integer interviewParticipantId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Calcule la somme des marks pour un interview donné
	 */
	@Query("SELECT COALESCE(SUM(e.candidateMark), 0) FROM Evaluations e " +
	       "WHERE e.candidateInterview.interviews.id = :interviewId AND e.isDeleted = false")
	Integer sumMarksByInterviewId(@Param("interviewId") Integer interviewId);

	/**
	 * Compte le nombre d'évaluations pour un interview donné
	 */
	@Query("SELECT COUNT(e) FROM Evaluations e " +
	       "WHERE e.candidateInterview.interviews.id = :interviewId AND e.isDeleted = false")
	Long countByInterviewId(@Param("interviewId") Integer interviewId);

	/**
	 * Calcule la somme des marks pour tous les interviews d'une application donnée
	 */
	@Query("SELECT COALESCE(SUM(e.candidateMark), 0) FROM Evaluations e " +
	       "WHERE e.candidateInterview.applications.id = :applicationId AND e.isDeleted = false")
	Integer sumMarksByApplicationId(@Param("applicationId") Integer applicationId);

	/**
	 * Compte le nombre d'évaluations pour tous les interviews d'une application donnée
	 */
	@Query("SELECT COUNT(e) FROM Evaluations e " +
	       "WHERE e.candidateInterview.applications.id = :applicationId AND e.isDeleted = false")
	Long countByApplicationId(@Param("applicationId") Integer applicationId);

	@Query("SELECT COUNT(e) FROM Evaluations e " +
	       "WHERE e.interviewParticipant.id = :interviewParticipantId AND e.isDeleted = false")
	Long countByInterviewParticipantId(@Param("interviewParticipantId") Integer interviewParticipantId);

	@Query("SELECT MAX(e.submittedAt) FROM Evaluations e " +
	       "WHERE e.interviewParticipant.id = :interviewParticipantId AND e.isDeleted = false")
	Date findLatestSubmittedAtByInterviewParticipantId(@Param("interviewParticipantId") Integer interviewParticipantId);

	/**
	 * Finds List of Evaluations by using evaluationsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Evaluations
	 * @throws DataAccessException,ParseException
	 */
	default List<Evaluations> getByCriteria(Request<EvaluationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Evaluations e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Evaluations> query = em.createQuery(req, Evaluations.class);
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
	 * Finds count of Evaluations by using evaluationsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Evaluations
	 * 
	 */
	default Long count(Request<EvaluationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Evaluations e where e IS NOT NULL";
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
	default String getWhereExpression(Request<EvaluationsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		EvaluationsDto dto = request.getData() != null ? request.getData() : new EvaluationsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (EvaluationsDto elt : request.getDatas()) {
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
	default String generateCriteria(EvaluationsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (dto.getCandidateMark()!= null && dto.getCandidateMark() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidateMark", dto.getCandidateMark(), "e.candidateMark", "Integer", dto.getCandidateMarkParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getRecruiterComment())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("recruiterComment", dto.getRecruiterComment(), "e.recruiterComment", "String", dto.getRecruiterCommentParam(), param, index, locale));
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
			if (dto.getCandidateInterviewId()!= null && dto.getCandidateInterviewId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidateInterviewId", dto.getCandidateInterviewId(), "e.candidateInterview.id", "Integer", dto.getCandidateInterviewIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}

	/**
	 * Finds Evaluations by using evaluationsDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of Evaluations (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<Evaluations> getAllByCriteria(Request<EvaluationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Evaluations e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Evaluations> query = em.createQuery(req, Evaluations.class);
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
	 * Finds count of ALL Evaluations by using evaluationsDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of Evaluations (including deleted)
	 * 
	 */
	default Long countAll(Request<EvaluationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Evaluations e where e IS NOT NULL";
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
	default String getAllWhereExpression(Request<EvaluationsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		EvaluationsDto dto = request.getData() != null ? request.getData() : new EvaluationsDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (EvaluationsDto elt : request.getDatas()) {
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
