package tech.synelia.quizapp.dao.repository.customize;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;

@Repository
public interface _InvitationCodeRepository {

    default List<InvitationCode> getAllByCriteria(Request<InvitationCodeDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from InvitationCode e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getAllWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<InvitationCode> query = em.createQuery(req, InvitationCode.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default String getWhereExpression(Request<InvitationCodeDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        InvitationCodeDto dto = request.getData() != null ? request.getData() : new InvitationCodeDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (InvitationCodeDto elt : request.getDatas()) {
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

    default String getAllWhereExpression(Request<InvitationCodeDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        InvitationCodeDto dto = request.getData() != null ? request.getData() : new InvitationCodeDto();
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (InvitationCodeDto elt : request.getDatas()) {
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

    default String generateCriteria(InvitationCodeDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Long", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getEmail())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("email", dto.getEmail(), "e.email", "String", dto.getEmailParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getRole())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("role", dto.getRole(), "e.role", "String", dto.getRoleParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getCode())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("code", dto.getCode(), "e.code", "String", dto.getCodeParam(), param, index, locale));
            }
            if (dto.getIsUsed() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isUsed", dto.getIsUsed(), "e.isUsed", "Boolean", dto.getIsUsedParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (dto.getExpiredAt() != null && !dto.getExpiredAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("expiredAt", dto.getExpiredAt(), "e.expiredAt", "Date", dto.getExpiredAtParam(), param, index, locale));
            }
            if (dto.getCreatedAt() != null && !dto.getCreatedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
            }
            if (dto.getUpdatedAt() != null && !dto.getUpdatedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSearchString())) {
                listOfQuery.add("(e.searchString IS NOT NULL AND LOWER(e.searchString) LIKE LOWER(CONCAT('%', :searchString" + index + ", '%')))");
                param.put("searchString" + index, dto.getSearchString());
            }
        }
        return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
    }
}
