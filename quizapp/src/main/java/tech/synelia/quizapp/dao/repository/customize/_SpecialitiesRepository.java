package tech.synelia.quizapp.dao.repository.customize;

import java.util.Date;
import java.util.List;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
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
 * Repository customize : Specialities.
 */
@Repository
public interface _SpecialitiesRepository {
	default List<String> _generateCriteria(SpecialitiesDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();

		// Recherche globale (searchString)
		if (Utilities.notBlank(dto.getSearchString())) {
			String sv = "%" + dto.getSearchString().toLowerCase() + "%";
			String sp = "searchAll_" + (index != null ? index : "");
			param.put(sp, sv);
			listOfQuery.add("(" + "LOWER(e.specialityName) LIKE :" + sp + " OR LOWER(e.specialityDesc) LIKE :" + sp + ")");
		}

		// Intervalles de dates
		if (Utilities.notBlank(dto.getDateCreationDe())) {
			try {
				Date d = java.sql.Date.valueOf(dto.getDateCreationDe());
				String p = "dateCreDe_" + (index != null ? index : "");
				param.put(p, d);
				listOfQuery.add("e.createdAt >= :" + p);
			} catch (Exception ignored) {}
		}
		if (Utilities.notBlank(dto.getDateCreationA())) {
			try {
				Date d = java.sql.Date.valueOf(dto.getDateCreationA());
				Date n = new Date(d.getTime() + 86400000L);
				String p = "dateCreA_" + (index != null ? index : "");
				param.put(p, n);
				listOfQuery.add("e.createdAt < :" + p);
			} catch (Exception ignored) {}
		}
		if (Utilities.notBlank(dto.getDateModificationDe())) {
			try {
				Date d = java.sql.Date.valueOf(dto.getDateModificationDe());
				String p = "dateModDe_" + (index != null ? index : "");
				param.put(p, d);
				listOfQuery.add("e.updatedAt >= :" + p);
			} catch (Exception ignored) {}
		}
		if (Utilities.notBlank(dto.getDateModificationA())) {
			try {
				Date d = java.sql.Date.valueOf(dto.getDateModificationA());
				Date n = new Date(d.getTime() + 86400000L);
				String p = "dateModA_" + (index != null ? index : "");
				param.put(p, n);
				listOfQuery.add("e.updatedAt < :" + p);
			} catch (Exception ignored) {}
		}

		return listOfQuery;
	}

	/**
	 * Counts all Specialities by using criteria (including deleted ones).
	 *
	 * @param request, em
	 * @return The count of all Specialities matching the criteria
	 * @throws DataAccessException,Exception
	 */
	default Long countAllByCriteria(Request<SpecialitiesDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select count(e) from Specialities e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		TypedQuery<Long> query = em.createQuery(req, Long.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return query.getSingleResult();
	}

	/**
	 * Get all Specialities by using criteria (including deleted ones).
	 *
	 * @param request, em
	 * @return List of Specialities matching the criteria
	 * @throws DataAccessException,Exception
	 */
	default List<Specialities> getAllByCriteria(Request<SpecialitiesDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Specialities e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Specialities> query = em.createQuery(req, Specialities.class);
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
	default String getAllWhereExpression(Request<SpecialitiesDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		SpecialitiesDto dto = request.getData() != null ? request.getData() : new SpecialitiesDto();
		// NOTE: We don't set isDeleted=false here to include deleted items
		String mainReq = generateAllCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (SpecialitiesDto elt : request.getDatas()) {
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
	default String generateAllCriteria(SpecialitiesDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSpecialityName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("specialityName", dto.getSpecialityName(), "e.specialityName", "String", dto.getSpecialityNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSpecialityDesc())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("specialityDesc", dto.getSpecialityDesc(), "e.specialityDesc", "String", dto.getSpecialityDescParam(), param, index, locale));
			}
			if (dto.getIsDeleted() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (dto.getCreatedAt() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			if (dto.getUpdatedAt() != null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}
			if (dto.getDepartmentId() != null && dto.getDepartmentId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentId", dto.getDepartmentId(), "e.departmentId", "Integer", dto.getDepartmentIdParam(), param, index, locale));
			}

			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
