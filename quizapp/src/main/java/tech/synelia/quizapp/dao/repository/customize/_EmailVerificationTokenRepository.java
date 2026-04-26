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
public interface _EmailVerificationTokenRepository {

    default String getWhereExpression(Request<EmailVerificationTokenDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        EmailVerificationTokenDto dto = request.getData() != null ? request.getData() : new EmailVerificationTokenDto();
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (EmailVerificationTokenDto elt : request.getDatas()) {
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

    default String generateCriteria(EmailVerificationTokenDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", null, param, index, locale));
            }
            if (Utilities.notBlank(dto.getEmail())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("email", dto.getEmail(), "e.email", "String", null, param, index, locale));
            }
            if (Utilities.notBlank(dto.getToken())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("token", dto.getToken(), "e.token", "String", null, param, index, locale));
            }
            if (dto.getIsUsed() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isUsed", dto.getIsUsed(), "e.isUsed", "Boolean", null, param, index, locale));
            }
            if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("applicationId", dto.getApplicationId(), "e.application.id", "Integer", null, param, index, locale));
            }
            if (dto.getUserId() != null && dto.getUserId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("userId", dto.getUserId(), "e.user.id", "Integer", null, param, index, locale));
            }
            if (dto.getCreatedAt() != null && !dto.getCreatedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", null, param, index, locale));
            }
        }
        return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
    }
}
