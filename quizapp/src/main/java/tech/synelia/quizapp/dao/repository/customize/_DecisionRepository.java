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
public interface _DecisionRepository {

    default String getWhereExpression(Request<DecisionDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        DecisionDto dto = request.getData() != null ? request.getData() : new DecisionDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (DecisionDto elt : request.getDatas()) {
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

    default String generateCriteria(DecisionDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (Utilities.notBlank(dto.getDecisionType())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("decisionType", dto.getDecisionType(), "e.decisionType", "String", dto.getDecisionTypeParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getDecisionMode())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("decisionMode", dto.getDecisionMode(), "e.decisionMode", "String", dto.getDecisionModeParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getJustification())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("justification", dto.getJustification(), "e.justification", "String", dto.getJustificationParam(), param, index, locale));
            }
            if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("applicationId", dto.getApplicationId(), "e.applicationProgress.applications.id", "Integer", dto.getApplicationIdParam(), param, index, locale));
            }
            if (dto.getUserId() != null && dto.getUserId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("userId", dto.getUserId(), "e.user.id", "Integer", dto.getUserIdParam(), param, index, locale));
            }
            if (dto.getApplicationProgressId() != null && dto.getApplicationProgressId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("applicationProgressId", dto.getApplicationProgressId(), "e.applicationProgress.id", "Integer", dto.getApplicationProgressIdParam(), param, index, locale));
            }
            if (dto.getCancelsDecisionId() != null && dto.getCancelsDecisionId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("cancelsDecisionId", dto.getCancelsDecisionId(), "e.cancelsDecision.id", "Integer", dto.getCancelsDecisionIdParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSearchString())) {
                String sv = "%" + dto.getSearchString().toLowerCase() + "%";
                String sp = "searchAll_" + index;
                param.put(sp, sv);
                listOfQuery.add("(" 
                        + "LOWER(COALESCE(e.decisionType, '')) LIKE :" + sp
                        + " or LOWER(COALESCE(e.decisionMode, '')) LIKE :" + sp
                        + " or LOWER(COALESCE(e.justification, '')) LIKE :" + sp
                        + ")");
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
