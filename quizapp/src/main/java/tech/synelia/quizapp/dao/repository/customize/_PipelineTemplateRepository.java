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
public interface _PipelineTemplateRepository {

    default String getWhereExpression(Request<PipelineTemplateDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        PipelineTemplateDto dto = request.getData() != null ? request.getData() : new PipelineTemplateDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (PipelineTemplateDto elt : request.getDatas()) {
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

    default String generateCriteria(PipelineTemplateDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getTemplateName())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("templateName", dto.getTemplateName(), "e.templateName", "String", dto.getTemplateNameParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getTemplateDesc())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("templateDesc", dto.getTemplateDesc(), "e.templateDesc", "String", dto.getTemplateDescParam(), param, index, locale));
            }
            if (dto.getIsDefault() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDefault", dto.getIsDefault(), "e.isDefault", "Boolean", dto.getIsDefaultParam(), param, index, locale));
            }
            if (dto.getIsActive() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isActive", dto.getIsActive(), "e.isActive", "Boolean", dto.getIsActiveParam(), param, index, locale));
            }
            if (dto.getIsLocked() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isLocked", dto.getIsLocked(), "e.isLocked", "Boolean", dto.getIsLockedParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSearchString())) {
                String sv = "%" + dto.getSearchString().toLowerCase() + "%";
                String sp = "searchAll_" + index;
                param.put(sp, sv);
                listOfQuery.add("(LOWER(e.templateName) LIKE :" + sp + " OR LOWER(e.templateDesc) LIKE :" + sp + ")");
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
