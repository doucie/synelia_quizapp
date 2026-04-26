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
public interface _GroupChangeRequestRepository {

    default String getWhereExpression(Request<GroupChangeRequestDto> request, HashMap<String, Object> param, Locale locale) throws Exception {
        GroupChangeRequestDto dto = request.getData() != null ? request.getData() : new GroupChangeRequestDto();
        String mainReq = generateCriteria(dto, param, 0, locale);
        String othersReq = "";
        if (request.getDatas() != null && !request.getDatas().isEmpty()) {
            Integer index = 1;
            for (GroupChangeRequestDto elt : request.getDatas()) {
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

    default String generateCriteria(GroupChangeRequestDto dto, HashMap<String, Object> param, Integer index, Locale locale) throws Exception {
        List<String> listOfQuery = new ArrayList<>();
        if (dto != null) {
            if (dto.getId() != null && dto.getId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
            }
            if (dto.getUserId() != null && dto.getUserId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("userId", dto.getUserId(), "e.user.id", "Integer", dto.getUserIdParam(), param, index, locale));
            }
            if (dto.getTargetGroupId() != null && dto.getTargetGroupId() > 0) {
                listOfQuery.add(CriteriaUtils.generateCriteria("targetGroupId", dto.getTargetGroupId(), "e.targetGroup.id", "Integer", dto.getTargetGroupIdParam(), param, index, locale));
            }
            if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("status", dto.getStatus(), "e.status", "String", dto.getStatusParam(), param, index, locale));
            }
            if (dto.getIsDeleted() != null) {
                listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
            }
            if (dto.getRequestedAt() != null && !dto.getRequestedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("requestedAt", dto.getRequestedAt(), "e.requestedAt", "Date", dto.getRequestedAtParam(), param, index, locale));
            }
            if (dto.getProcessedAt() != null && !dto.getProcessedAt().trim().isEmpty()) {
                listOfQuery.add(CriteriaUtils.generateCriteria("processedAt", dto.getProcessedAt(), "e.processedAt", "Date", dto.getProcessedAtParam(), param, index, locale));
            }
        }
        return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
    }
}
