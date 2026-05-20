package tech.synelia.quizapp.dao.repository.customize;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import tech.synelia.quizapp.dao.entity.MailLog;
import tech.synelia.quizapp.utils.CriteriaUtils;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.MailLogDto;

@Repository
public interface _MailLogRepository {

	default List<MailLog> getAllByCriteria(Request<MailLogDto> request, EntityManager em, Locale locale)
			throws DataAccessException, Exception {
		String req = "select e from MailLog e where e IS NOT NULL";
		HashMap<String, Object> param = new HashMap<>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<MailLog> query = em.createQuery(req, MailLog.class);
		for (Map.Entry<String, Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default String getWhereExpression(Request<MailLogDto> request, HashMap<String, Object> param, Locale locale)
			throws Exception {
		MailLogDto dto = request.getData() != null ? request.getData() : new MailLogDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (MailLogDto elt : request.getDatas()) {
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
		String result = "";
		if (!mainReq.isEmpty()) {
			result += " and (" + mainReq + ") ";
		}
		result += othersReq;
		return result;
	}

	default String getAllWhereExpression(Request<MailLogDto> request, HashMap<String, Object> param, Locale locale)
			throws Exception {
		MailLogDto dto = request.getData() != null ? request.getData() : new MailLogDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (MailLogDto elt : request.getDatas()) {
				String eltReq = generateCriteria(elt, param, index, locale);
				if (request.getIsAnd() != null && request.getIsAnd()) {
					othersReq += "and (" + eltReq + ") ";
				} else {
					othersReq += "or (" + eltReq + ") ";
				}
				index++;
			}
		}
		String result = "";
		if (!mainReq.isEmpty()) {
			result += " and (" + mainReq + ") ";
		}
		result += othersReq;
		return result;
	}

	default String generateCriteria(MailLogDto dto, HashMap<String, Object> param, Integer index, Locale locale)
			throws Exception {
		List<String> listOfQuery = new ArrayList<>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getRecipientEmail())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("recipientEmail", dto.getRecipientEmail(), "e.recipientEmail", "String", dto.getRecipientEmailParam(), param, index, locale));
			}
			if (dto.getRecipientUserId() != null && dto.getRecipientUserId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("recipientUserId", dto.getRecipientUserId(), "e.recipientUserId", "Integer", dto.getRecipientUserIdParam(), param, index, locale));
			}
			if (dto.getSenderUserId() != null && dto.getSenderUserId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("senderUserId", dto.getSenderUserId(), "e.senderUserId", "Integer", dto.getSenderUserIdParam(), param, index, locale));
			}
			if (dto.getEmailTemplateId() != null && dto.getEmailTemplateId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("emailTemplateId", dto.getEmailTemplateId(), "e.emailTemplateId", "Integer", dto.getEmailTemplateIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSubject())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("subject", dto.getSubject(), "e.subject", "String", dto.getSubjectParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getBodyPreview())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("bodyPreview", dto.getBodyPreview(), "e.bodyPreview", "String", dto.getBodyPreviewParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getStatus())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("status", dto.getStatus(), "e.status", "String", dto.getStatusParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getErrorMessage())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("errorMessage", dto.getErrorMessage(), "e.errorMessage", "String", dto.getErrorMessageParam(), param, index, locale));
			}
			if (dto.getSentAt() != null && !dto.getSentAt().trim().isEmpty()) {
				listOfQuery.add(CriteriaUtils.generateCriteria("sentAt", dto.getSentAt(), "e.sentAt", "Date", dto.getSentAtParam(), param, index, locale));
			}
			if (dto.getCreatedAt() != null && !dto.getCreatedAt().trim().isEmpty()) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			if (dto.getUpdatedAt() != null && !dto.getUpdatedAt().trim().isEmpty()) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdBy", dto.getCreatedBy(), "e.createdBy", "Integer", dto.getCreatedByParam(), param, index, locale));
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedBy", dto.getUpdatedBy(), "e.updatedBy", "Integer", dto.getUpdatedByParam(), param, index, locale));
			}
			if (dto.getIsDeleted() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSearchString())) {
				listOfQuery.add("(e.searchString IS NOT NULL AND LOWER(e.searchString) LIKE LOWER(CONCAT('%', :searchString" + index + ", '%')))" );
				param.put("searchString" + index, dto.getSearchString());
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}