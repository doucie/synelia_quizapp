package tech.synelia.quizapp.dao.repository.customize;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;

@Repository
public interface _PipelineStageNotificationRuleRepository {

    default String getWhereExpression(Request<PipelineStageNotificationRuleDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        PipelineStageNotificationRuleDto dto = request.getData() != null ? request.getData() : new PipelineStageNotificationRuleDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (PipelineStageNotificationRuleDto elt : request.getDatas()) {
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

    default String generateCriteria(PipelineStageNotificationRuleDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getTriggerCode())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("triggerCode", dto.getTriggerCode(), "e.triggerCode", "String", dto.getTriggerCodeParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getOutcomeCode())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("outcomeCode", dto.getOutcomeCode(), "e.outcomeCode", "String", dto.getOutcomeCodeParam(), param, index, locale));
            }
            if (dto.getEmailTemplateId() != null && dto.getEmailTemplateId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("emailTemplateId", dto.getEmailTemplateId(), "e.emailTemplateId", "Integer", dto.getEmailTemplateIdParam(), param, index, locale));
            }
            if (dto.getIsRequired() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isRequired", dto.getIsRequired(), "e.isRequired", "Boolean", dto.getIsRequiredParam(), param, index, locale));
            }
            if (dto.getIsAutomatic() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isAutomatic", dto.getIsAutomatic(), "e.isAutomatic", "Boolean", dto.getIsAutomaticParam(), param, index, locale));
            }
            if (dto.getRequiresManualConfirmation() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("requiresManualConfirmation", dto.getRequiresManualConfirmation(), "e.requiresManualConfirmation", "Boolean", dto.getRequiresManualConfirmationParam(), param, index, locale));
            }
            if (dto.getPipelineStageId() != null && dto.getPipelineStageId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("pipelineStageId", dto.getPipelineStageId(), "e.pipelineStage.id", "Integer", dto.getPipelineStageIdParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSearchString())) {
                String sv = "%" + dto.getSearchString().toLowerCase() + "%";
                String sp = "searchAll_" + index;
                param.put(sp, sv);
                listOfQuery.add("(LOWER(e.triggerCode) LIKE :" + sp + " OR LOWER(e.outcomeCode) LIKE :" + sp + ")");
            }
            if (dto.getCreatedAt() != null && !dto.getCreatedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
            }
            if (dto.getUpdatedAt() != null && !dto.getUpdatedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
            }
        }
        return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
    }
}
