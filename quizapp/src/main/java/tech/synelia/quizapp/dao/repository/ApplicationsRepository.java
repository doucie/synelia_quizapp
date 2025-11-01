package tech.synelia.quizapp.dao.repository;

import java.util.Date;
import java.util.List;
import java.text.ParseException;
import java.text.SimpleDateFormat;
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
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._ApplicationsRepository;

/**
 * Repository : Applications.
 */
@Repository
public interface ApplicationsRepository extends JpaRepository<Applications, Integer>, _ApplicationsRepository {
	/**
	 * Finds Applications by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Applications whose id is equals to the given id. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.id = :id and e.isDeleted = :isDeleted")
	Applications findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Applications by using candidateFirstName as a search criteria.
	 * 
	 * @param candidateFirstName
	 * @return An Object Applications whose candidateFirstName is equals to the given candidateFirstName. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.candidateFirstName = :candidateFirstName and e.isDeleted = :isDeleted")
	List<Applications> findByCandidateFirstName(@Param("candidateFirstName")String candidateFirstName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using candidateLastName as a search criteria.
	 * 
	 * @param candidateLastName
	 * @return An Object Applications whose candidateLastName is equals to the given candidateLastName. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.candidateLastName = :candidateLastName and e.isDeleted = :isDeleted")
	List<Applications> findByCandidateLastName(@Param("candidateLastName")String candidateLastName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using candidateEmail as a search criteria.
	 * 
	 * @param candidateEmail
	 * @return An Object Applications whose candidateEmail is equals to the given candidateEmail. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.candidateEmail = :candidateEmail and e.isDeleted = :isDeleted")
	List<Applications> findByCandidateEmail(@Param("candidateEmail")String candidateEmail, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using candidatePhone as a search criteria.
	 * 
	 * @param candidatePhone
	 * @return An Object Applications whose candidatePhone is equals to the given candidatePhone. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.candidatePhone = :candidatePhone and e.isDeleted = :isDeleted")
	List<Applications> findByCandidatePhone(@Param("candidatePhone")String candidatePhone, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using candidateCvPath as a search criteria.
	 * 
	 * @param candidateCvPath
	 * @return An Object Applications whose candidateCvPath is equals to the given candidateCvPath. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.candidateCvPath = :candidateCvPath and e.isDeleted = :isDeleted")
	List<Applications> findByCandidateCvPath(@Param("candidateCvPath")String candidateCvPath, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using emailVerified as a search criteria.
	 * 
	 * @param emailVerified
	 * @return An Object Applications whose emailVerified is equals to the given emailVerified. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.emailVerified = :emailVerified and e.isDeleted = :isDeleted")
	List<Applications> findByEmailVerified(@Param("emailVerified")Boolean emailVerified, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using quizScore as a search criteria.
	 * 
	 * @param quizScore
	 * @return An Object Applications whose quizScore is equals to the given quizScore. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.quizScore = :quizScore and e.isDeleted = :isDeleted")
	List<Applications> findByQuizScore(@Param("quizScore")Integer quizScore, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using evaluationScore as a search criteria.
	 * 
	 * @param evaluationScore
	 * @return An Object Applications whose evaluationScore is equals to the given evaluationScore. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.evaluationScore = :evaluationScore and e.isDeleted = :isDeleted")
	List<Applications> findByEvaluationScore(@Param("evaluationScore")Float evaluationScore, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using applicationStatus as a search criteria.
	 * 
	 * @param applicationStatus
	 * @return An Object Applications whose applicationStatus is equals to the given applicationStatus. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.applicationStatus = :applicationStatus and e.isDeleted = :isDeleted")
	List<Applications> findByApplicationStatus(@Param("applicationStatus")String applicationStatus, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using visitToken as a search criteria.
	 * 
	 * @param visitToken
	 * @return An Object Applications whose visitToken is equals to the given visitToken. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.visitToken = :visitToken and e.isDeleted = :isDeleted")
	List<Applications> findByVisitToken(@Param("visitToken")String visitToken, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Applications whose createdAt is equals to the given createdAt. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Applications> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Applications whose createdBy is equals to the given createdBy. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Applications> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Applications whose updatedAt is equals to the given updatedAt. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Applications> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Applications whose updatedBy is equals to the given updatedBy. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Applications> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Applications whose isDeleted is equals to the given isDeleted. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.isDeleted = :isDeleted")
	List<Applications> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Applications by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Applications whose searchString is equals to the given searchString. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Applications> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Applications by using sourceTokenId as a search criteria.
	 * 
	 * @param sourceTokenId
	 * @return An Object Applications whose sourceTokenId is equals to the given sourceTokenId. If
	 *         no Applications is found, this method returns null.
	 */
	@Query("select e from Applications e where e.sourceToken.id = :sourceTokenId and e.isDeleted = :isDeleted")
	List<Applications> findBySourceTokenId(@Param("sourceTokenId")Integer sourceTokenId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Applications by using applicationsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Applications
	 * @throws DataAccessException,ParseException
	 */
	default List<Applications> getByCriteria(Request<ApplicationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Applications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Applications> query = em.createQuery(req, Applications.class);
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
	 * Finds count of Applications by using applicationsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Applications
	 * 
	 */
	default Long count(Request<ApplicationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Applications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getSingleResult();
		return count;
	}

	/**
	 * Finds Applications by using applicationsDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of Applications (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<Applications> getAllByCriteria(Request<ApplicationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Applications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Applications> query = em.createQuery(req, Applications.class);
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
	 * Finds count of ALL Applications by using applicationsDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of Applications (including deleted)
	 * 
	 */
	default Long countAll(Request<ApplicationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Applications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getSingleResult();
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
	default String getAllWhereExpression(Request<ApplicationsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		ApplicationsDto dto = request.getData() != null ? request.getData() : new ApplicationsDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (ApplicationsDto elt : request.getDatas()) {
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
	default String getWhereExpression(Request<ApplicationsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		ApplicationsDto dto = request.getData() != null ? request.getData() : new ApplicationsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (ApplicationsDto elt : request.getDatas()) {
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
	default String generateCriteria(ApplicationsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCandidateFirstName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidateFirstName", dto.getCandidateFirstName(), "e.candidateFirstName", "String", dto.getCandidateFirstNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCandidateLastName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidateLastName", dto.getCandidateLastName(), "e.candidateLastName", "String", dto.getCandidateLastNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCandidateEmail())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidateEmail", dto.getCandidateEmail(), "e.candidateEmail", "String", dto.getCandidateEmailParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCandidatePhone())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidatePhone", dto.getCandidatePhone(), "e.candidatePhone", "String", dto.getCandidatePhoneParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCandidateCvPath())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("candidateCvPath", dto.getCandidateCvPath(), "e.candidateCvPath", "String", dto.getCandidateCvPathParam(), param, index, locale));
			}
			if (dto.getEmailVerified()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("emailVerified", dto.getEmailVerified(), "e.emailVerified", "Boolean", dto.getEmailVerifiedParam(), param, index, locale));
			}
			if (dto.getQuizScore()!= null && dto.getQuizScore() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("quizScore", dto.getQuizScore(), "e.quizScore", "Integer", dto.getQuizScoreParam(), param, index, locale));
			}
			if (dto.getEvaluationScore()!= null && dto.getEvaluationScore() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("evaluationScore", dto.getEvaluationScore(), "e.evaluationScore", "Float", dto.getEvaluationScoreParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getApplicationStatus())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("applicationStatus", dto.getApplicationStatus(), "e.applicationStatus", "String", dto.getApplicationStatusParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getVisitToken())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("visitToken", dto.getVisitToken(), "e.visitToken", "String", dto.getVisitTokenParam(), param, index, locale));
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
			if (dto.getSourceTokenId()!= null && dto.getSourceTokenId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("sourceTokenId", dto.getSourceTokenId(), "e.sourceToken.id", "Integer", dto.getSourceTokenIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
