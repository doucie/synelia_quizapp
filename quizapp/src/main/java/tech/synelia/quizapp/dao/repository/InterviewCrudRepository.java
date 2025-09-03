package tech.synelia.quizapp.dao.repository;

import java.util.Date;
// import java.text.ParseException;
// import java.text.SimpleDateFormat;
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
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
// import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._InterviewCrudRepository;

/**
 * Repository : InterviewCrud.
 */
@Repository
public interface InterviewCrudRepository extends JpaRepository<InterviewCrud, Integer>, _InterviewCrudRepository {
	/**
	 * Finds InterviewCrud by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object InterviewCrud whose id is equals to the given id. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.id = :id and e.isDeleted = :isDeleted")
	InterviewCrud findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds InterviewCrud by using canCreate as a search criteria.
	 * 
	 * @param canCreate
	 * @return An Object InterviewCrud whose canCreate is equals to the given canCreate. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.canCreate = :canCreate and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByCanCreate(@Param("canCreate")Boolean canCreate, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using canUpdate as a search criteria.
	 * 
	 * @param canUpdate
	 * @return An Object InterviewCrud whose canUpdate is equals to the given canUpdate. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.canUpdate = :canUpdate and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByCanUpdate(@Param("canUpdate")Boolean canUpdate, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using canDelete as a search criteria.
	 * 
	 * @param canDelete
	 * @return An Object InterviewCrud whose canDelete is equals to the given canDelete. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.canDelete = :canDelete and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByCanDelete(@Param("canDelete")Boolean canDelete, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using follow as a search criteria.
	 * 
	 * @param follow
	 * @return An Object InterviewCrud whose follow is equals to the given follow. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.follow = :follow and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByFollow(@Param("follow")Boolean follow, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object InterviewCrud whose createdAt is equals to the given createdAt. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object InterviewCrud whose createdBy is equals to the given createdBy. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object InterviewCrud whose updatedAt is equals to the given updatedAt. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object InterviewCrud whose updatedBy is equals to the given updatedBy. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object InterviewCrud whose isDeleted is equals to the given isDeleted. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.isDeleted = :isDeleted")
	List<InterviewCrud> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds InterviewCrud by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object InterviewCrud whose searchString is equals to the given searchString. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<InterviewCrud> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds InterviewCrud by using userId as a search criteria.
	 * 
	 * @param userId
	 * @return An Object InterviewCrud whose userId is equals to the given userId. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.user.id = :userId and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByUserId(@Param("userId")Integer userId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds InterviewCrud by using interviewId as a search criteria.
	 * 
	 * @param interviewId
	 * @return An Object InterviewCrud whose interviewId is equals to the given interviewId. If
	 *         no InterviewCrud is found, this method returns null.
	 */
	@Query("select e from InterviewCrud e where e.interviews.id = :interviewId and e.isDeleted = :isDeleted")
	List<InterviewCrud> findByInterviewId(@Param("interviewId")Integer interviewId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of InterviewCrud by using interviewCrudDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of InterviewCrud
	 * @throws DataAccessException,ParseException
	 */
	default List<InterviewCrud> getByCriteria(Request<InterviewCrudDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from InterviewCrud e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<InterviewCrud> query = em.createQuery(req, InterviewCrud.class);
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
	 * Finds count of InterviewCrud by using interviewCrudDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of InterviewCrud
	 * 
	 */
	default Long count(Request<InterviewCrudDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from InterviewCrud e where e IS NOT NULL";
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
	default String getWhereExpression(Request<InterviewCrudDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		InterviewCrudDto dto = request.getData() != null ? request.getData() : new InterviewCrudDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (InterviewCrudDto elt : request.getDatas()) {
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
	default String generateCriteria(InterviewCrudDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (dto.getCanCreate()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("canCreate", dto.getCanCreate(), "e.canCreate", "Boolean", dto.getCanCreateParam(), param, index, locale));
			}
			if (dto.getCanUpdate()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("canUpdate", dto.getCanUpdate(), "e.canUpdate", "Boolean", dto.getCanUpdateParam(), param, index, locale));
			}
			if (dto.getCanDelete()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("canDelete", dto.getCanDelete(), "e.canDelete", "Boolean", dto.getCanDeleteParam(), param, index, locale));
			}
			if (dto.getFollow()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("follow", dto.getFollow(), "e.follow", "Boolean", dto.getFollowParam(), param, index, locale));
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
			if (dto.getUserId()!= null && dto.getUserId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userId", dto.getUserId(), "e.user.id", "Integer", dto.getUserIdParam(), param, index, locale));
			}
			if (dto.getInterviewId()!= null && dto.getInterviewId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("interviewId", dto.getInterviewId(), "e.interviews.id", "Integer", dto.getInterviewIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUserFirstName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userFirstName", dto.getUserFirstName(), "e.user.firstName", "String", dto.getUserFirstNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUserLastName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userLastName", dto.getUserLastName(), "e.user.lastName", "String", dto.getUserLastNameParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}
}
