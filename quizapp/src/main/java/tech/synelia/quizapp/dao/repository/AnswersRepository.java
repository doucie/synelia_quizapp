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
import tech.synelia.quizapp.dao.repository.customize._AnswersRepository;

/**
 * Repository : Answers.
 */
@Repository
public interface AnswersRepository extends JpaRepository<Answers, Integer>, _AnswersRepository {
	/**
	 * Finds Answers by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Answers whose id is equals to the given id. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.id = :id and e.isDeleted = :isDeleted")
	Answers findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Answers by using answerContent as a search criteria.
	 * 
	 * @param answerContent
	 * @return An Object Answers whose answerContent is equals to the given answerContent. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.answerContent = :answerContent and e.isDeleted = :isDeleted")
	List<Answers> findByAnswerContent(@Param("answerContent")String answerContent, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Answers by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Answers whose createdAt is equals to the given createdAt. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Answers> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Answers by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Answers whose createdBy is equals to the given createdBy. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Answers> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Answers by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Answers whose updatedAt is equals to the given updatedAt. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Answers> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Answers by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Answers whose updatedBy is equals to the given updatedBy. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Answers> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Answers by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Answers whose isDeleted is equals to the given isDeleted. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.isDeleted = :isDeleted")
	List<Answers> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Answers by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Answers whose searchString is equals to the given searchString. If
	 *         no Answers is found, this method returns null.
	 */
	@Query("select e from Answers e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Answers> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Answers by using answersDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Answers
	 * @throws DataAccessException,ParseException
	 */
	default List<Answers> getByCriteria(Request<AnswersDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Answers e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Answers> query = em.createQuery(req, Answers.class);
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
	 * Finds count of Answers by using answersDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Answers
	 * 
	 */
	default Long count(Request<AnswersDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Answers e where e IS NOT NULL";
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
	 * Finds Answers by using answersDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of Answers (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<Answers> getAllByCriteria(Request<AnswersDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Answers e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Answers> query = em.createQuery(req, Answers.class);
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
	 * Finds count of ALL Answers by using answersDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of Answers (including deleted)
	 * 
	 */
	default Long countAll(Request<AnswersDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Answers e where e IS NOT NULL";
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
	default String getAllWhereExpression(Request<AnswersDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		AnswersDto dto = request.getData() != null ? request.getData() : new AnswersDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (AnswersDto elt : request.getDatas()) {
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
	default String getWhereExpression(Request<AnswersDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		AnswersDto dto = request.getData() != null ? request.getData() : new AnswersDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (AnswersDto elt : request.getDatas()) {
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
	default String generateCriteria(AnswersDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getAnswerContent())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("answerContent", dto.getAnswerContent(), "e.answerContent", "String", dto.getAnswerContentParam(), param, index, locale));
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
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
