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
import tech.synelia.quizapp.dao.repository.customize._QuestionRepository;

/**
 * Repository : Question.
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer>, _QuestionRepository {

	@Query("select e from Question e where e.id = :id and e.isDeleted = :isDeleted")
	Question findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.questionRef = :questionRef and e.isDeleted = :isDeleted")
	List<Question> findByQuestionRef(@Param("questionRef")String questionRef, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.questionType = :questionType and e.isDeleted = :isDeleted")
	List<Question> findByQuestionType(@Param("questionType")String questionType, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.difficultyLevel = :difficultyLevel and e.isDeleted = :isDeleted")
	List<Question> findByDifficultyLevel(@Param("difficultyLevel")String difficultyLevel, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.score = :score and e.isDeleted = :isDeleted")
	List<Question> findByScore(@Param("score")Integer score, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Question> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Question> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Question> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Question> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.isDeleted = :isDeleted")
	List<Question> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);

	@Query("select e from Question e where e.specialities.id = :specialityId and e.isDeleted = :isDeleted")
	List<Question> findBySpecialityId(@Param("specialityId")Integer specialityId, @Param("isDeleted")Boolean isDeleted);

	default List<Question> getByCriteria(Request<QuestionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Question e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Question> query = em.createQuery(req, Question.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<QuestionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from Question e where e IS NOT NULL";
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

	default List<Question> getAllByCriteria(Request<QuestionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Question e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Question> query = em.createQuery(req, Question.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<QuestionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from Question e where e IS NOT NULL";
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

	default String getAllWhereExpression(Request<QuestionDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		QuestionDto dto = request.getData() != null ? request.getData() : new QuestionDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (QuestionDto elt : request.getDatas()) {
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

	default String getWhereExpression(Request<QuestionDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		QuestionDto dto = request.getData() != null ? request.getData() : new QuestionDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (QuestionDto elt : request.getDatas()) {
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

	default String generateCriteria(QuestionDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getQuestionRef())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionRef", dto.getQuestionRef(), "e.questionRef", "String", dto.getQuestionRefParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getQuestionText())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionText", dto.getQuestionText(), "e.questionText", "String", dto.getQuestionTextParam(), param, index, locale));
			}
			if (dto.getQuestionChrono() != null && dto.getQuestionChrono() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionChrono", dto.getQuestionChrono(), "e.questionChrono", "Integer", dto.getQuestionChronoParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getQuestionType())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("questionType", dto.getQuestionType(), "e.questionType", "String", dto.getQuestionTypeParam(), param, index, locale));
			}
			if (dto.getScore() != null && dto.getScore() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("score", dto.getScore(), "e.score", "Integer", dto.getScoreParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getDifficultyLevel())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("difficultyLevel", dto.getDifficultyLevel(), "e.difficultyLevel", "String", dto.getDifficultyLevelParam(), param, index, locale));
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
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("specialityId", dto.getSpecialityId(), "e.specialities.id", "Integer", dto.getSpecialityIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
