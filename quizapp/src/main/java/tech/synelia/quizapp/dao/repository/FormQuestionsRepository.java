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
import tech.synelia.quizapp.dao.repository.customize._FormQuestionsRepository;

/**
 * Repository : FormQuestions.
 */
@Repository
public interface FormQuestionsRepository extends JpaRepository<FormQuestions, Integer>, _FormQuestionsRepository {

	@Query("select e from FormQuestions e where e.id = :id and e.isDeleted = :isDeleted")
	FormQuestions findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.questionOrder = :questionOrder and e.isDeleted = :isDeleted")
	List<FormQuestions> findByQuestionOrder(@Param("questionOrder")Integer questionOrder, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<FormQuestions> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<FormQuestions> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<FormQuestions> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<FormQuestions> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.isDeleted = :isDeleted")
	List<FormQuestions> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.formVersion.id = :formVersionId and e.isDeleted = :isDeleted")
	List<FormQuestions> findByFormVersionId(@Param("formVersionId")Integer formVersionId, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.question.id = :questionId and e.isDeleted = :isDeleted")
	List<FormQuestions> findByQuestionId(@Param("questionId")Integer questionId, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.formVersion.id = :formVersionId and e.isDeleted = :isDeleted order by e.questionOrder asc")
	List<FormQuestions> findByFormVersionIdOrderByQuestionOrder(@Param("formVersionId")Integer formVersionId, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormQuestions e where e.formVersion.id = :formVersionId and e.questionOrder = :questionOrder and e.isDeleted = :isDeleted")
	List<FormQuestions> findByFormVersionIdAndQuestionOrder(@Param("formVersionId")Integer formVersionId, @Param("questionOrder")Integer questionOrder, @Param("isDeleted")Boolean isDeleted);

	default List<FormQuestions> getByCriteria(Request<FormQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from FormQuestions e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<FormQuestions> query = em.createQuery(req, FormQuestions.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<FormQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from FormQuestions e where e IS NOT NULL";
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

	default List<FormQuestions> getAllByCriteria(Request<FormQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from FormQuestions e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<FormQuestions> query = em.createQuery(req, FormQuestions.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<FormQuestionsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from FormQuestions e where e IS NOT NULL";
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

	default String getAllWhereExpression(Request<FormQuestionsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		FormQuestionsDto dto = request.getData() != null ? request.getData() : new FormQuestionsDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (FormQuestionsDto elt : request.getDatas()) {
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

	default String getWhereExpression(Request<FormQuestionsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		FormQuestionsDto dto = request.getData() != null ? request.getData() : new FormQuestionsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (FormQuestionsDto elt : request.getDatas()) {
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

	default String generateCriteria(FormQuestionsDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (dto.getQuestionOrder() != null && dto.getQuestionOrder() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionOrder", dto.getQuestionOrder(), "e.questionOrder", "Integer", dto.getQuestionOrderParam(), param, index, locale));
			}
			if (dto.getChronoOverride() != null && dto.getChronoOverride() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("chronoOverride", dto.getChronoOverride(), "e.chronoOverride", "Integer", dto.getChronoOverrideParam(), param, index, locale));
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
			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("formVersionId", dto.getFormVersionId(), "e.formVersion.id", "Integer", dto.getFormVersionIdParam(), param, index, locale));
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
