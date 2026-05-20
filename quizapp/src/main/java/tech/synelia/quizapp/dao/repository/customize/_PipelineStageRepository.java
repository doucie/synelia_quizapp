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
public interface _PipelineStageRepository {

    default String getWhereExpression(Request<PipelineStageDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        PipelineStageDto dto = request.getData() != null ? request.getData() : new PipelineStageDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (PipelineStageDto elt : request.getDatas()) {
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

    default String generateCriteria(PipelineStageDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getStageType())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("stageType", dto.getStageType(), "e.stageType", "String", dto.getStageTypeParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getStageLabel())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("stageLabel", dto.getStageLabel(), "e.stageLabel", "String", dto.getStageLabelParam(), param, index, locale));
            }
            if (dto.getStageOrder() != null && dto.getStageOrder() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("stageOrder", dto.getStageOrder(), "e.stageOrder", "Integer", dto.getStageOrderParam(), param, index, locale));
            }
            if (dto.getIsRequired() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isRequired", dto.getIsRequired(), "e.isRequired", "Boolean", dto.getIsRequiredParam(), param, index, locale));
            }
            if (dto.getIsEliminatory() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isEliminatory", dto.getIsEliminatory(), "e.isEliminatory", "Boolean", dto.getIsEliminatoryParam(), param, index, locale));
            }
            if (dto.getEmailRequired() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("emailRequired", dto.getEmailRequired(), "e.emailRequired", "Boolean", dto.getEmailRequiredParam(), param, index, locale));
            }
            if (dto.getEmailAutomatic() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("emailAutomatic", dto.getEmailAutomatic(), "e.emailAutomatic", "Boolean", dto.getEmailAutomaticParam(), param, index, locale));
            }
            if (dto.getPipelineTemplateId() != null && dto.getPipelineTemplateId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("pipelineTemplateId", dto.getPipelineTemplateId(), "e.pipelineTemplate.id", "Integer", dto.getPipelineTemplateIdParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSearchString())) {
                String sv = "%" + dto.getSearchString().toLowerCase() + "%";
                String sp = "searchAll_" + index;
                param.put(sp, sv);
                listOfQuery.add("(LOWER(e.stageLabel) LIKE :" + sp + " OR LOWER(e.stageType) LIKE :" + sp + ")");
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
