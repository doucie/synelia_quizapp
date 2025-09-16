package tech.synelia.quizapp.dao.repository.customize;

import java.util.Date;
import java.util.List;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;

/**
 * Repository customize : Departments.
 */
@Repository
public interface _DepartmentsRepository {
	/**
	 * Finds all Departments by using criteria (including deleted ones).
	 *
	 * @param request, em
	 * @return A List of all Departments
	 * @throws DataAccessException,Exception
	 */
	default List<Departments> getAllByCriteria(Request<DepartmentsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Departments e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Departments> query = em.createQuery(req, Departments.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	/**
	 * get where expression for all items (including deleted)
	 * @param request
	 * @param param
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String getAllWhereExpression(Request<DepartmentsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		DepartmentsDto dto = request.getData() != null ? request.getData() : new DepartmentsDto();
		// NOTE: We don't set isDeleted=false here to include deleted items
		String mainReq = generateAllCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (DepartmentsDto elt : request.getDatas()) {
				// NOTE: We don't set isDeleted=false here to include deleted items
				String eltReq = generateAllCriteria(elt, param, index, locale);
				if (request.getIsAnd() != null && request.getIsAnd()) {
					othersReq += "and (" + eltReq + ") ";
				} else {
					othersReq += "or (" + eltReq + ") ";
				}
				index++;
			}
		}
		String req = "";
		if (!mainReq.isEmpty()) {
			req += " and (" + mainReq + ") ";
		}
		req += othersReq;
		return req;
	}

	/**
	 * generate sql query for dto (including deleted items)
	 * @param dto
	 * @param param
	 * @param index
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String generateAllCriteria(DepartmentsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId() != null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getDepartmentName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentName", dto.getDepartmentName(), "e.departmentName", "String", dto.getDepartmentNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getDepartmentDesc())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentDesc", dto.getDepartmentDesc(), "e.departmentDesc", "String", dto.getDepartmentDescParam(), param, index, locale));
			}
			if (dto.getIsDeleted() != null && !(dto.getIsDeleted().toString().trim().isEmpty())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (dto.getCreatedAt() != null && !dto.getCreatedAt().toString().trim().isEmpty()) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			if (dto.getUpdatedAt() != null && !dto.getUpdatedAt().toString().trim().isEmpty()) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}

			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}

	default List<String> _generateCriteria(DepartmentsDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();

		// Vérifications pour createdBy et updatedBy
		if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
			listOfQuery.add(CriteriaUtils.generateCriteria("createdBy", dto.getCreatedBy(), "e.createdBy", "Integer", dto.getCreatedByParam(), param, index, locale));
		}
		if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
			listOfQuery.add(CriteriaUtils.generateCriteria("updatedBy", dto.getUpdatedBy(), "e.updatedBy", "Integer", dto.getUpdatedByParam(), param, index, locale));
		}

		// PUT YOUR RIGHT CUSTOM CRITERIA HERE

		return listOfQuery;
	}
}
