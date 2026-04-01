package tech.synelia.quizapp.dao.repository.customize;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;

@Repository
public interface _AppConfigRepository {

    default String getWhereExpression(Request<AppConfigDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        AppConfigDto dto = request.getData() != null ? request.getData() : new AppConfigDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (AppConfigDto elt : request.getDatas()) {
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

    default String generateCriteria(AppConfigDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getConfigName())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("configName", dto.getConfigName(), "e.configName", "String", dto.getConfigNameParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getCompanyName())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("companyName", dto.getCompanyName(), "e.companyName", "String", dto.getCompanyNameParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getPrimaryColor())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("primaryColor", dto.getPrimaryColor(), "e.primaryColor", "String", dto.getPrimaryColorParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getColorScheme())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("colorScheme", dto.getColorScheme(), "e.colorScheme", "String", dto.getColorSchemeParam(), param, index, locale));
            }
            if (dto.getIsActive() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isActive", dto.getIsActive(), "e.isActive", "Boolean", dto.getIsActiveParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
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
