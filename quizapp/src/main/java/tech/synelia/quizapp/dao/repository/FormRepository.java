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
import tech.synelia.quizapp.dao.repository.customize._FormRepository;

/**
 * Repository : Form.
 */
@Repository
public interface FormRepository extends JpaRepository<Form, Integer>, _FormRepository {

	@Query("select e from Form e where e.id = :id and e.isDeleted = :isDeleted")
	Form findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.formName = :formName and e.isDeleted = :isDeleted")
	List<Form> findByFormName(@Param("formName")String formName, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.isActive = :isActive and e.isDeleted = :isDeleted")
	List<Form> findByIsActive(@Param("isActive")Boolean isActive, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Form> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Form> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Form> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Form> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.isDeleted = :isDeleted")
	List<Form> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);

	@Query("select e from Form e where e.campaigns.id = :campaignId and e.isDeleted = :isDeleted")
	List<Form> findByCampaignId(@Param("campaignId")Integer campaignId, @Param("isDeleted")Boolean isDeleted);

	default List<Form> getByCriteria(Request<FormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Form e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Form> query = em.createQuery(req, Form.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<FormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from Form e where e IS NOT NULL";
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

	default List<Form> getAllByCriteria(Request<FormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Form e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Form> query = em.createQuery(req, Form.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<FormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from Form e where e IS NOT NULL";
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

	default String getAllWhereExpression(Request<FormDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		FormDto dto = request.getData() != null ? request.getData() : new FormDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (FormDto elt : request.getDatas()) {
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

	default String getWhereExpression(Request<FormDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		FormDto dto = request.getData() != null ? request.getData() : new FormDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (FormDto elt : request.getDatas()) {
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

	default String generateCriteria(FormDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getFormName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("formName", dto.getFormName(), "e.formName", "String", dto.getFormNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getFormDesc())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("formDesc", dto.getFormDesc(), "e.formDesc", "String", dto.getFormDescParam(), param, index, locale));
			}
			if (dto.getIsActive() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isActive", dto.getIsActive(), "e.isActive", "Boolean", dto.getIsActiveParam(), param, index, locale));
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
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0) {
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
