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
import tech.synelia.quizapp.dao.repository.customize._FormVersionRepository;

/**
 * Repository : FormVersion.
 */
@Repository
public interface FormVersionRepository extends JpaRepository<FormVersion, Integer>, _FormVersionRepository {

	@Query("select e from FormVersion e where e.id = :id and e.isDeleted = :isDeleted")
	FormVersion findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.versionNumber = :versionNumber and e.isDeleted = :isDeleted")
	List<FormVersion> findByVersionNumber(@Param("versionNumber")Integer versionNumber, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.isPublished = :isPublished and e.isDeleted = :isDeleted")
	List<FormVersion> findByIsPublished(@Param("isPublished")Boolean isPublished, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.isLocked = :isLocked and e.isDeleted = :isDeleted")
	List<FormVersion> findByIsLocked(@Param("isLocked")Boolean isLocked, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<FormVersion> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<FormVersion> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<FormVersion> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<FormVersion> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.isDeleted = :isDeleted")
	List<FormVersion> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.form.id = :formId and e.isDeleted = :isDeleted")
	List<FormVersion> findByFormId(@Param("formId")Integer formId, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from FormVersion e where e.form.id = :formId")
	List<FormVersion> findAllByFormId(@Param("formId")Integer formId);

	@Query("select e from FormVersion e where e.form.id = :formId and e.versionNumber = :versionNumber")
	List<FormVersion> findByFormIdAndVersionNumber(@Param("formId")Integer formId, @Param("versionNumber")Integer versionNumber);

	@Query("select e from FormVersion e where e.form.id = :formId and e.isPublished = :isPublished and e.isDeleted = :isDeleted")
	List<FormVersion> findByFormIdAndIsPublished(@Param("formId")Integer formId, @Param("isPublished")Boolean isPublished, @Param("isDeleted")Boolean isDeleted);

	default List<FormVersion> getByCriteria(Request<FormVersionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from FormVersion e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<FormVersion> query = em.createQuery(req, FormVersion.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<FormVersionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from FormVersion e where e IS NOT NULL";
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

	default List<FormVersion> getAllByCriteria(Request<FormVersionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from FormVersion e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<FormVersion> query = em.createQuery(req, FormVersion.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<FormVersionDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from FormVersion e where e IS NOT NULL";
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

	default String getAllWhereExpression(Request<FormVersionDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		FormVersionDto dto = request.getData() != null ? request.getData() : new FormVersionDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (FormVersionDto elt : request.getDatas()) {
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

	default String getWhereExpression(Request<FormVersionDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		FormVersionDto dto = request.getData() != null ? request.getData() : new FormVersionDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (FormVersionDto elt : request.getDatas()) {
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

	default String generateCriteria(FormVersionDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (dto.getVersionNumber() != null && dto.getVersionNumber() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("versionNumber", dto.getVersionNumber(), "e.versionNumber", "Integer", dto.getVersionNumberParam(), param, index, locale));
			}
			if (dto.getIsPublished() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isPublished", dto.getIsPublished(), "e.isPublished", "Boolean", dto.getIsPublishedParam(), param, index, locale));
			}
			if (dto.getIsLocked() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isLocked", dto.getIsLocked(), "e.isLocked", "Boolean", dto.getIsLockedParam(), param, index, locale));
			}
			if (dto.getRandomQuestions() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("randomQuestions", dto.getRandomQuestions(), "e.randomQuestions", "Boolean", dto.getRandomQuestionsParam(), param, index, locale));
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
			if (dto.getFormId() != null && dto.getFormId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("formId", dto.getFormId(), "e.form.id", "Integer", dto.getFormIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
