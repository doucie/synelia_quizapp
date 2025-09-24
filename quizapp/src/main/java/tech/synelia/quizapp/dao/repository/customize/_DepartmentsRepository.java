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
	 * Finds count of Departments by using departmentsDto as a search criteria.
	 *
	 * @param request, em
	 * @return Number of Departments
	 *
	 */
	default Long count(Request<DepartmentsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Departments e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale); // Use same logic as getAllByCriteria to include deleted items
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getResultList().get(0);
		return count;
	}

	/**
	 * get where expression
	 * @param request
	 * @param param
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String getWhereExpression(Request<DepartmentsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		DepartmentsDto dto = request.getData() != null ? request.getData() : new DepartmentsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (DepartmentsDto elt : request.getDatas()) {
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
		String req = "";
		if (!mainReq.isEmpty()) {
			req += " and (" + mainReq + ") ";
		}
		req += othersReq;
		return req;
	}

	/**
	 * generate sql query for dto
	 * @param dto
	 * @param param
	 * @param index
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String generateCriteria(DepartmentsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
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
		System.out.println("🔍 BACKEND: generateAllCriteria appelée avec index: " + index);
		System.out.println("🔍 BACKEND: DTO reçu: " + dto);
		if (dto != null) {
			System.out.println("🔍 BACKEND: dto.getSearchString(): '" + dto.getSearchString() + "'");
			System.out.println("🔍 BACKEND: dto.getDateCreationDe(): '" + dto.getDateCreationDe() + "'");
			System.out.println("🔍 BACKEND: dto.getDateCreationA(): '" + dto.getDateCreationA() + "'");
			System.out.println("🔍 BACKEND: dto.getDateModificationDe(): '" + dto.getDateModificationDe() + "'");
			System.out.println("🔍 BACKEND: dto.getDateModificationA(): '" + dto.getDateModificationA() + "'");
		}

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

		System.out.println("🔍 BACKEND: _generateCriteria appelée");
		System.out.println("🔍 BACKEND: DTO reçu: " + dto);
		if (dto != null) {
			System.out.println("🔍 BACKEND: dto.getSearchString(): '" + dto.getSearchString() + "'");
		}

		// Vérifications pour createdBy et updatedBy
		if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
			listOfQuery.add(CriteriaUtils.generateCriteria("createdBy", dto.getCreatedBy(), "e.createdBy", "Integer", dto.getCreatedByParam(), param, index, locale));
		}
		if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
			listOfQuery.add(CriteriaUtils.generateCriteria("updatedBy", dto.getUpdatedBy(), "e.updatedBy", "Integer", dto.getUpdatedByParam(), param, index, locale));
		}

		// Traitement de search_string pour recherche globale
		if (Utilities.notBlank(dto.getSearchString())) {
			System.out.println("🔍 BACKEND: SearchString reçu: '" + dto.getSearchString() + "'");
			String searchValue = "%" + dto.getSearchString().toLowerCase() + "%";
			String searchParam = "searchString" + (index != null ? index : "");
			param.put(searchParam, searchValue);
			listOfQuery.add("LOWER(e.departmentName) LIKE :" + searchParam + " OR LOWER(e.departmentDesc) LIKE :" + searchParam);
			System.out.println("🔍 BACKEND: Requête de recherche ajoutée: " + "LOWER(e.departmentName) LIKE :" + searchParam + " OR LOWER(e.departmentDesc) LIKE :" + searchParam);
		} else {
			System.out.println("🔍 BACKEND: SearchString est vide ou null: '" + dto.getSearchString() + "'");
		}

		// Traitement des intervalles de dates pour la recherche avancée
		if (Utilities.notBlank(dto.getDateCreationDe())) {
			System.out.println("🔍 BACKEND: DateCreationDe reçu: '" + dto.getDateCreationDe() + "'");
			try {
				Date startDate = java.sql.Date.valueOf(dto.getDateCreationDe());
				String dateParam = "dateCreationDe" + (index != null ? index : "");
				param.put(dateParam, startDate);
				listOfQuery.add("e.createdAt >= :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateCreationDe: " + e.getMessage());
			}
		}
		if (Utilities.notBlank(dto.getDateCreationA())) {
			System.out.println("🔍 BACKEND: DateCreationA reçu: '" + dto.getDateCreationA() + "'");
			try {
				// Pour la date de fin, on ajoute 1 jour et on utilise < pour inclure toute la journée
				Date endDate = java.sql.Date.valueOf(dto.getDateCreationA());
				Date nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
				String dateParam = "dateCreationA" + (index != null ? index : "");
				param.put(dateParam, nextDay);
				listOfQuery.add("e.createdAt < :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateCreationA: " + e.getMessage());
			}
		}
		if (Utilities.notBlank(dto.getDateModificationDe())) {
			System.out.println("🔍 BACKEND: DateModificationDe reçu: '" + dto.getDateModificationDe() + "'");
			try {
				Date startDate = java.sql.Date.valueOf(dto.getDateModificationDe());
				String dateParam = "dateModificationDe" + (index != null ? index : "");
				param.put(dateParam, startDate);
				listOfQuery.add("e.updatedAt >= :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateModificationDe: " + e.getMessage());
			}
		}
		if (Utilities.notBlank(dto.getDateModificationA())) {
			System.out.println("🔍 BACKEND: DateModificationA reçu: '" + dto.getDateModificationA() + "'");
			try {
				// Pour la date de fin, on ajoute 1 jour et on utilise < pour inclure toute la journée
				Date endDate = java.sql.Date.valueOf(dto.getDateModificationA());
				Date nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
				String dateParam = "dateModificationA" + (index != null ? index : "");
				param.put(dateParam, nextDay);
				listOfQuery.add("e.updatedAt < :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateModificationA: " + e.getMessage());
			}
		}

		// PUT YOUR RIGHT CUSTOM CRITERIA HERE

		return listOfQuery;
	}
}
