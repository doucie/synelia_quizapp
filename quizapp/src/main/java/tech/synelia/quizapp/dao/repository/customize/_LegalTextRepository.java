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
public interface _LegalTextRepository {

    default List<LegalText> getAllByCriteria(Request<LegalTextDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
        String req = "select e from LegalText e where e IS NOT NULL";
        HashMap<String, Object> param = new HashMap<>();
        req += getAllWhereExpression(request, param, locale);
        req += " order by e.id desc";
        TypedQuery<LegalText> query = em.createQuery(req, LegalText.class);
        for (Map.Entry<String, Object> entry : param.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        if (request.getIndex() != null && request.getSize() != null) {
            query.setFirstResult(request.getIndex() * request.getSize());
            query.setMaxResults(request.getSize());
        }
        return query.getResultList();
    }

    default String getWhereExpression(Request<LegalTextDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        LegalTextDto dto = request.getData() != null ? request.getData() : new LegalTextDto();
        dto.setIsDeleted(false);
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (LegalTextDto elt : request.getDatas()) {
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

    default String getAllWhereExpression(Request<LegalTextDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        LegalTextDto dto = request.getData() != null ? request.getData() : new LegalTextDto();
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (LegalTextDto elt : request.getDatas()) {
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

    default String generateCriteria(LegalTextDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getTextKey())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("textKey", dto.getTextKey(), "e.textKey", "String", dto.getTextKeyParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getTitle())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("title", dto.getTitle(), "e.title", "String", dto.getTitleParam(), param, index, locale));
            }
            if (Utilities.notBlank(dto.getDescription())) {
                listOfQuery.add(CriteriaUtils.generateCriteria("description", dto.getDescription(), "e.description", "String", dto.getDescriptionParam(), param, index, locale));
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
