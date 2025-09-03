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
import tech.synelia.quizapp.dao.repository.customize._DepartmentsRepository;

/**
 * Repository : Departments.
 */
@Repository
public interface DepartmentsRepository extends JpaRepository<Departments, Integer>, _DepartmentsRepository {
	/**
	 * Finds Departments by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Departments whose id is equals to the given id. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.id = :id and e.isDeleted = :isDeleted")
	Departments findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Departments by using departmentName as a search criteria.
	 * 
	 * @param departmentName
	 * @return An Object Departments whose departmentName is equals to the given departmentName. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.departmentName = :departmentName and e.isDeleted = :isDeleted")
	List<Departments> findByDepartmentName(@Param("departmentName")String departmentName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using departmentDesc as a search criteria.
	 * 
	 * @param departmentDesc
	 * @return An Object Departments whose departmentDesc is equals to the given departmentDesc. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.departmentDesc = :departmentDesc and e.isDeleted = :isDeleted")
	List<Departments> findByDepartmentDesc(@Param("departmentDesc")String departmentDesc, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Departments whose createdAt is equals to the given createdAt. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Departments> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Departments whose createdBy is equals to the given createdBy. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Departments> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Departments whose updatedAt is equals to the given updatedAt. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Departments> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Departments whose updatedBy is equals to the given updatedBy. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Departments> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Departments whose isDeleted is equals to the given isDeleted. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.isDeleted = :isDeleted")
	List<Departments> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Departments by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Departments whose searchString is equals to the given searchString. If
	 *         no Departments is found, this method returns null.
	 */
	@Query("select e from Departments e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Departments> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Departments by using departmentsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Departments
	 * @throws DataAccessException,ParseException
	 */
	default List<Departments> getByCriteria(Request<DepartmentsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Departments e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
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
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getDepartmentName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentName", dto.getDepartmentName(), "e.departmentName", "String", dto.getDepartmentNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getDepartmentDesc())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("departmentDesc", dto.getDepartmentDesc(), "e.departmentDesc", "String", dto.getDepartmentDescParam(), param, index, locale));
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
			if (dto.getIsDeleted()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDeleted", dto.getIsDeleted(), "e.isDeleted", "Boolean", dto.getIsDeletedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getSearchString())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("searchString", dto.getSearchString(), "e.searchString", "String", dto.getSearchStringParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
