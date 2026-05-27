package tech.synelia.quizapp.dao.repository;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.repository.customize._CampaignFormRepository;
import tech.synelia.quizapp.utils.CriteriaUtils;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.CampaignFormDto;

@Repository
public interface CampaignFormRepository extends JpaRepository<CampaignForm, Integer>, _CampaignFormRepository {

	@Query("select e from CampaignForm e where e.id = :id and e.isDeleted = :isDeleted")
	CampaignForm findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from CampaignForm e where e.campaigns.id = :campaignId and e.isDeleted = false order by e.id asc")
	List<CampaignForm> findByCampaignId(@Param("campaignId") Integer campaignId);

	@Query("select e from CampaignForm e where e.campaigns.id = :campaignId order by e.id asc")
	List<CampaignForm> findAllByCampaignId(@Param("campaignId") Integer campaignId);

	@Query("select e from CampaignForm e where e.form.id = :formId order by e.id asc")
	List<CampaignForm> findByFormId(@Param("formId") Integer formId);

	@Query("select e.form from CampaignForm e where e.campaigns.id = :campaignId and e.isDeleted = false and e.form.isDeleted = false order by e.assignmentOrder asc, e.id asc")
	List<Form> findActiveFormsByCampaignId(@Param("campaignId") Integer campaignId);

	@Query("select count(e) from CampaignForm e where e.campaigns.id = :campaignId and e.form.id = :formId and e.isDeleted = false and e.form.isDeleted = false")
	long countActiveLinksByCampaignIdAndFormId(@Param("campaignId") Integer campaignId, @Param("formId") Integer formId);

	default List<CampaignForm> getByCriteria(Request<CampaignFormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CampaignForm e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CampaignForm> query = em.createQuery(req, CampaignForm.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<CampaignFormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from CampaignForm e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}

	default List<CampaignForm> getAllByCriteria(Request<CampaignFormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from CampaignForm e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<CampaignForm> query = em.createQuery(req, CampaignForm.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<CampaignFormDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e.id) from CampaignForm e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return (Long) query.getResultList().get(0);
	}

	default String getAllWhereExpression(Request<CampaignFormDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		CampaignFormDto dto = request.getData() != null ? request.getData() : new CampaignFormDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignFormDto elt : request.getDatas()) {
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

	default String getWhereExpression(Request<CampaignFormDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		CampaignFormDto dto = request.getData() != null ? request.getData() : new CampaignFormDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (CampaignFormDto elt : request.getDatas()) {
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

	default String generateCriteria(CampaignFormDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (dto.getAssignmentOrder() != null && dto.getAssignmentOrder() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("assignmentOrder", dto.getAssignmentOrder(), "e.assignmentOrder", "Integer", dto.getAssignmentOrderParam(), param, index, locale));
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