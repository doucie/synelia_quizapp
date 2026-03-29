package tech.synelia.quizapp.dao.repository;

import java.util.Date;
import java.util.List;
import java.util.HashMap;
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
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._AnswerRepository;

/**
 * Repository : Answer.
 */
@Repository
public interface AnswerRepository extends JpaRepository<Answer, Integer>, _AnswerRepository {

	@Query("select e from Answer e where e.id = :id and e.isDeleted = :isDeleted")
	Answer findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.answerType = :answerType and e.isDeleted = :isDeleted")
	List<Answer> findByAnswerType(@Param("answerType")String answerType, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.answerOrder = :answerOrder and e.isDeleted = :isDeleted")
	List<Answer> findByAnswerOrder(@Param("answerOrder")Integer answerOrder, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.isCorrect = :isCorrect and e.isDeleted = :isDeleted")
	List<Answer> findByIsCorrect(@Param("isCorrect")Boolean isCorrect, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Answer> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Answer> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Answer> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Answer> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.isDeleted = :isDeleted")
	List<Answer> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);

	@Query("select e from Answer e where e.question.id = :questionId and e.isDeleted = :isDeleted")
	List<Answer> findByQuestionId(@Param("questionId")Integer questionId, @Param("isDeleted")Boolean isDeleted);

	default List<Answer> getByCriteria(Request<AnswerDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Answer e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Answer> query = em.createQuery(req, Answer.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<AnswerDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from Answer e where e IS NOT NULL";
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

	default List<Answer> getAllByCriteria(Request<AnswerDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Answer e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Answer> query = em.createQuery(req, Answer.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<AnswerDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from Answer e where e IS NOT NULL";
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

	default String getAllWhereExpression(Request<AnswerDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		AnswerDto dto = request.getData() != null ? request.getData() : new AnswerDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (AnswerDto elt : request.getDatas()) {
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

	default String getWhereExpression(Request<AnswerDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		AnswerDto dto = request.getData() != null ? request.getData() : new AnswerDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (AnswerDto elt : request.getDatas()) {
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

	default String generateCriteria(AnswerDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getAnswerText())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("answerText", dto.getAnswerText(), "e.answerText", "String", dto.getAnswerTextParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getAnswerType())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("answerType", dto.getAnswerType(), "e.answerType", "String", dto.getAnswerTypeParam(), param, index, locale));
			}
			if (dto.getAnswerOrder() != null && dto.getAnswerOrder() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("answerOrder", dto.getAnswerOrder(), "e.answerOrder", "Integer", dto.getAnswerOrderParam(), param, index, locale));
			}
			if (dto.getIsCorrect() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isCorrect", dto.getIsCorrect(), "e.isCorrect", "Boolean", dto.getIsCorrectParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getCreatedAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdBy", dto.getCreatedBy(), "e.createdBy", "Integer", dto.getCreatedByParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUpdatedAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedBy", dto.getUpdatedBy(), "e.updatedBy", "Integer", dto.getUpdatedByParam(), param, index, locale));
			}
			if (dto.getIsDeleted() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSearchString())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("searchString", dto.getSearchString(), "e.searchString", "String", dto.getSearchStringParam(), param, index, locale));
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionId", dto.getQuestionId(), "e.question.id", "Integer", dto.getQuestionIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
