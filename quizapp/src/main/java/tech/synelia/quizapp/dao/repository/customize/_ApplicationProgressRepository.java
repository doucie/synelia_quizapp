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
public interface _ApplicationProgressRepository {

    default String getWhereExpression(Request<ApplicationProgressDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        ApplicationProgressDto dto = request.getData() != null ? request.getData() : new ApplicationProgressDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (ApplicationProgressDto elt : request.getDatas()) {
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

    default String generateCriteria(ApplicationProgressDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getProgressStatus())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("progressStatus", dto.getProgressStatus(), "e.progressStatus", "String", dto.getProgressStatusParam(), param, index, locale));
            }
            if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("applicationId", dto.getApplicationId(), "e.applications.id", "Integer", dto.getApplicationIdParam(), param, index, locale));
            }
            if (dto.getPipelineStageId() != null && dto.getPipelineStageId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("pipelineStageId", dto.getPipelineStageId(), "e.pipelineStage.id", "Integer", dto.getPipelineStageIdParam(), param, index, locale));
            }
            if (dto.getDecidedById() != null && dto.getDecidedById() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("decidedById", dto.getDecidedById(), "e.decidedBy.id", "Integer", dto.getDecidedByIdParam(), param, index, locale));
            }
            if (dto.getMailSent() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("mailSent", dto.getMailSent(), "e.mailSent", "Boolean", dto.getMailSentParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSearchString())) {
                String sv = "%" + dto.getSearchString().toLowerCase() + "%";
                String sp = "searchAll_" + index;
                param.put(sp, sv);
                listOfQuery.add("(LOWER(e.progressStatus) LIKE :" + sp + " OR LOWER(e.notes) LIKE :" + sp + ")");
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
