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
public interface _SmtpConfigRepository {

    default List<SmtpConfig> getAllByCriteria(Request<SmtpConfigDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from SmtpConfig e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getAllWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<SmtpConfig> query = em.createQuery(req, SmtpConfig.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default String getWhereExpression(Request<SmtpConfigDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        SmtpConfigDto dto = request.getData() != null ? request.getData() : new SmtpConfigDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (SmtpConfigDto elt : request.getDatas()) {
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

    default String getAllWhereExpression(Request<SmtpConfigDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        SmtpConfigDto dto = request.getData() != null ? request.getData() : new SmtpConfigDto();
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (SmtpConfigDto elt : request.getDatas()) {
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

    default String generateCriteria(SmtpConfigDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getHost())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("host", dto.getHost(), "e.host", "String", dto.getHostParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSenderName())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("senderName", dto.getSenderName(), "e.senderName", "String", dto.getSenderNameParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getSenderEmail())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("senderEmail", dto.getSenderEmail(), "e.senderEmail", "String", dto.getSenderEmailParam(), param, index, locale));
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
            if (Utilities.notBlank(dto.getSearchString())) {
                listOfQuery.add("(e.searchString IS NOT NULL AND LOWER(e.searchString) LIKE LOWER(CONCAT('%', :searchString" + index + ", '%')))");
                param.put("searchString" + index, dto.getSearchString());
            }
        }
        return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
    }
}
