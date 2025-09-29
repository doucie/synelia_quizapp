package tech.synelia.quizapp.dao.repository;

import java.util.Date;
import java.util.List;
// import java.text.ParseException;
// import java.text.SimpleDateFormat;
import java.util.HashMap;
// import java.util.List;
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
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
// import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._SpecialitiesRepository;

/**
 * Repository : Specialities.
 */
@Repository
public interface SpecialitiesRepository extends JpaRepository<Specialities, Integer>, _SpecialitiesRepository {
	/**
	 * Finds Specialities by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Specialities whose id is equals to the given id. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.id = :id and e.isDeleted = :isDeleted")
	Specialities findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Specialities by using specialityName as a search criteria.
	 * 
	 * @param specialityName
	 * @return An Object Specialities whose specialityName is equals to the given specialityName. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.specialityName = :specialityName and e.isDeleted = :isDeleted")
	List<Specialities> findBySpecialityName(@Param("specialityName")String specialityName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using specialityDesc as a search criteria.
	 * 
	 * @param specialityDesc
	 * @return An Object Specialities whose specialityDesc is equals to the given specialityDesc. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.specialityDesc = :specialityDesc and e.isDeleted = :isDeleted")
	List<Specialities> findBySpecialityDesc(@Param("specialityDesc")String specialityDesc, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Specialities whose createdAt is equals to the given createdAt. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Specialities> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Specialities whose createdBy is equals to the given createdBy. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Specialities> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Specialities whose updatedAt is equals to the given updatedAt. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Specialities> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Specialities whose updatedBy is equals to the given updatedBy. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Specialities> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Specialities whose isDeleted is equals to the given isDeleted. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.isDeleted = :isDeleted")
	List<Specialities> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Specialities by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Specialities whose searchString is equals to the given searchString. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Specialities> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Specialities by using departmentId as a search criteria.
	 * 
	 * @param departmentId
	 * @return An Object Specialities whose departmentId is equals to the given departmentId. If
	 *         no Specialities is found, this method returns null.
	 */
	@Query("select e from Specialities e where e.departments.id = :departmentId and e.isDeleted = :isDeleted")
	List<Specialities> findByDepartmentId(@Param("departmentId")Integer departmentId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Specialities by using specialitiesDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Specialities
	 * @throws DataAccessException,ParseException
	 */
	default List<Specialities> getByCriteria(Request<SpecialitiesDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Specialities e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
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
	 * Finds count of Specialities by using specialitiesDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Specialities
	 * 
	 */
	default Long count(Request<SpecialitiesDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Specialities e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
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
	default String getWhereExpression(Request<SpecialitiesDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		SpecialitiesDto dto = request.getData() != null ? request.getData() : new SpecialitiesDto();
		System.out.println("DEBUG getWhereExpression: Before setIsDeleted, dto.isDeleted = '" + dto.getIsDeleted() + "'");
		dto.setIsDeleted(false);
		System.out.println("DEBUG getWhereExpression: After setIsDeleted, dto.isDeleted = '" + dto.getIsDeleted() + "'");
		String mainReq = generateCriteria(dto, param, 0, locale);
		System.out.println("DEBUG getWhereExpression: mainReq = '" + mainReq + "'");
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (SpecialitiesDto elt : request.getDatas()) {
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
		System.out.println("DEBUG getWhereExpression: Final req = '" + req + "'");
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
	default String generateCriteria(SpecialitiesDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
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
			if (Utilities.notBlank(dto.getCreatedAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			if (dto.getCreatedBy()!= null && dto.getCreatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("createdBy", dto.getCreatedBy(), "e.createdBy", "Integer", dto.getCreatedByParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUpdatedAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}
			if (dto.getUpdatedBy()!= null && dto.getUpdatedBy() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedBy", dto.getUpdatedBy(), "e.updatedBy", "Integer", dto.getUpdatedByParam(), param, index, locale));
			}
			System.out.println("DEBUG generateCriteria: dto.getIsDeleted() = '" + dto.getIsDeleted() + "'");
			if (dto.getIsDeleted()!= null) {
				System.out.println("DEBUG generateCriteria: Adding isDeleted criteria with value: " + dto.getIsDeleted());
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSearchString())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("searchString", dto.getSearchString(), "e.searchString", "String", dto.getSearchStringParam(), param, index, locale));
			}
			if (dto.getDepartmentId()!= null && dto.getDepartmentId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentId", dto.getDepartmentId(), "e.departments.id", "Integer", dto.getDepartmentIdParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		String result = CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
		System.out.println("DEBUG generateCriteria: Final criteria result: '" + result + "'");
		return result;
	}

	/**
	 * Get all Specialities by criteria including deleted ones
	 */
	default List<Specialities> getAllByCriteriaIncludingDeleted(Request<SpecialitiesDto> request, EntityManager em, Locale locale) throws Exception {
		String req = "select e from Specialities e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpressionIncludingDeleted(request, param, locale);
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
	 * Count all Specialities by criteria including deleted ones
	 */
	default Long countAllByCriteriaIncludingDeleted(Request<SpecialitiesDto> request, EntityManager em, Locale locale) throws Exception {
		String req = "select count(e.id) from Specialities e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpressionIncludingDeleted(request, param, locale);

		TypedQuery<Long> query = em.createQuery(req, Long.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return query.getSingleResult();
	}

	/**
	 * Expression WHERE without automatic filtering of deleted items
	 */
	default String getWhereExpressionIncludingDeleted(Request<SpecialitiesDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		System.out.println("DEBUG: getWhereExpressionIncludingDeleted called");
		// main query
		SpecialitiesDto dto = request.getData() != null ? request.getData() : new SpecialitiesDto();
		System.out.println("DEBUG: Main dto: " + dto);
		// Do not force isDeleted = false here!
		String mainReq = generateCriteriaIncludingDeleted(dto, param, 0, locale);
		System.out.println("DEBUG: mainReq: '" + mainReq + "'");
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			System.out.println("DEBUG: Processing additional datas: " + request.getDatas().size() + " items");
			Integer index = 1;
			for (SpecialitiesDto elt : request.getDatas()) {
				// Do not force isDeleted = false here!
				String eltReq = generateCriteriaIncludingDeleted(elt, param, index, locale);
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
		System.out.println("DEBUG: Final where expression: '" + req + "'");
		return req;
	}

	/**
	 * Generate criteria without automatic filtering of deleted items
	 */
	default String generateCriteriaIncludingDeleted(SpecialitiesDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		System.out.println("DEBUG: generateCriteriaIncludingDeleted called with dto: " + dto);
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			System.out.println("DEBUG: dto.id = '" + dto.getId() + "' (type: " + (dto.getId() != null ? dto.getId().getClass().getSimpleName() : "null") + ")");
			if (dto.getId() != null && dto.getId() > 0) {
				System.out.println("DEBUG: Adding id criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.specialityName = '" + dto.getSpecialityName() + "'");
			if (Utilities.notBlank(dto.getSpecialityName())) {
				System.out.println("DEBUG: Adding specialityName criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("specialityName", dto.getSpecialityName(), "e.specialityName", "String", dto.getSpecialityNameParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.specialityDesc = '" + dto.getSpecialityDesc() + "'");
			if (Utilities.notBlank(dto.getSpecialityDesc())) {
				System.out.println("DEBUG: Adding specialityDesc criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("specialityDesc", dto.getSpecialityDesc(), "e.specialityDesc", "String", dto.getSpecialityDescParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.isDeleted = '" + dto.getIsDeleted() + "'");
			if (dto.getIsDeleted() != null) {
				System.out.println("DEBUG: Adding isDeleted criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.createdAt = '" + dto.getCreatedAt() + "'");
			if (Utilities.notBlank(dto.getCreatedAt())) {
				System.out.println("DEBUG: Adding createdAt criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("createdAt", dto.getCreatedAt(), "e.createdAt", "Date", dto.getCreatedAtParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.updatedAt = '" + dto.getUpdatedAt() + "'");
			if (Utilities.notBlank(dto.getUpdatedAt())) {
				System.out.println("DEBUG: Adding updatedAt criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("updatedAt", dto.getUpdatedAt(), "e.updatedAt", "Date", dto.getUpdatedAtParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.departmentId = '" + dto.getDepartmentId() + "' (type: " + (dto.getDepartmentId() != null ? dto.getDepartmentId().getClass().getSimpleName() : "null") + ")");
			if (dto.getDepartmentId() != null && dto.getDepartmentId() > 0) {
				System.out.println("DEBUG: Adding departmentId criteria");
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentId", dto.getDepartmentId(), "e.departmentId", "Integer", dto.getDepartmentIdParam(), param, index, locale));
			}
			System.out.println("DEBUG: dto.searchString = '" + dto.getSearchString() + "'");
			if (Utilities.notBlank(dto.getSearchString())) {
				System.out.println("DEBUG: Adding searchString criteria - searching in specialityName, specialityDesc, and searchString");
				// Pour la recherche rapide, rechercher dans les champs principaux
				String searchValue = dto.getSearchString();
				listOfQuery.add(" (e.specialityName LIKE :searchString_" + index + " OR e.specialityDesc LIKE :searchString_" + index + " OR e.searchString LIKE :searchString_" + index + ") ");
				param.put("searchString_" + index, "%" + searchValue + "%");
			}

			System.out.println("DEBUG: Calling _generateCriteria");
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				System.out.println("DEBUG: Adding custom criteria: " + listOfCustomQuery);
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		String result = CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
		System.out.println("DEBUG: Final criteria result: '" + result + "'");
		return result;
	}
}
