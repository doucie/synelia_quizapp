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
import tech.synelia.quizapp.dao.repository.customize._NotificationsRepository;

/**
 * Repository : Notifications.
 */
@Repository
public interface NotificationsRepository extends JpaRepository<Notifications, Integer>, _NotificationsRepository {
	/**
	 * Finds Notifications by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object Notifications whose id is equals to the given id. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.id = :id and e.isDeleted = :isDeleted")
	Notifications findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Notifications by using notifType as a search criteria.
	 * 
	 * @param notifType
	 * @return An Object Notifications whose notifType is equals to the given notifType. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.notifType = :notifType and e.isDeleted = :isDeleted")
	List<Notifications> findByNotifType(@Param("notifType")String notifType, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using notifActor as a search criteria.
	 * 
	 * @param notifActor
	 * @return An Object Notifications whose notifActor is equals to the given notifActor. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.notifActor = :notifActor and e.isDeleted = :isDeleted")
	List<Notifications> findByNotifActor(@Param("notifActor")Integer notifActor, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using notifLink as a search criteria.
	 * 
	 * @param notifLink
	 * @return An Object Notifications whose notifLink is equals to the given notifLink. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.notifLink = :notifLink and e.isDeleted = :isDeleted")
	List<Notifications> findByNotifLink(@Param("notifLink")String notifLink, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using isRead as a search criteria.
	 * 
	 * @param isRead
	 * @return An Object Notifications whose isRead is equals to the given isRead. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.isRead = :isRead and e.isDeleted = :isDeleted")
	List<Notifications> findByIsRead(@Param("isRead")Boolean isRead, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object Notifications whose createdAt is equals to the given createdAt. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<Notifications> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object Notifications whose createdBy is equals to the given createdBy. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<Notifications> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object Notifications whose updatedAt is equals to the given updatedAt. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<Notifications> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object Notifications whose updatedBy is equals to the given updatedBy. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<Notifications> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object Notifications whose isDeleted is equals to the given isDeleted. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.isDeleted = :isDeleted")
	List<Notifications> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds Notifications by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object Notifications whose searchString is equals to the given searchString. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<Notifications> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds Notifications by using userId as a search criteria.
	 * 
	 * @param userId
	 * @return An Object Notifications whose userId is equals to the given userId. If
	 *         no Notifications is found, this method returns null.
	 */
	@Query("select e from Notifications e where e.user.id = :userId and e.isDeleted = :isDeleted")
	List<Notifications> findByUserId(@Param("userId")Integer userId, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of Notifications by using notificationsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of Notifications
	 * @throws DataAccessException,ParseException
	 */
	default List<Notifications> getByCriteria(Request<NotificationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Notifications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Notifications> query = em.createQuery(req, Notifications.class);
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
	 * Finds count of Notifications by using notificationsDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of Notifications
	 * 
	 */
	default Long count(Request<NotificationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Notifications e where e IS NOT NULL";
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
	default String getWhereExpression(Request<NotificationsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		NotificationsDto dto = request.getData() != null ? request.getData() : new NotificationsDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (NotificationsDto elt : request.getDatas()) {
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
	default String generateCriteria(NotificationsDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getNotifType())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("notifType", dto.getNotifType(), "e.notifType", "String", dto.getNotifTypeParam(), param, index, locale));
			}
			if (dto.getNotifActor()!= null && dto.getNotifActor() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("notifActor", dto.getNotifActor(), "e.notifActor", "Integer", dto.getNotifActorParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getNotifLink())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("notifLink", dto.getNotifLink(), "e.notifLink", "String", dto.getNotifLinkParam(), param, index, locale));
			}
			if (dto.getIsRead()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isRead", dto.getIsRead(), "e.isRead", "Boolean", dto.getIsReadParam(), param, index, locale));
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

	/**
	 * Finds Notifications by using notificationsDto as a search ALL criteria (including deleted).
	 * 
	 * @param request, em
	 * @return A List of Notifications (including deleted)
	 * @throws DataAccessException,ParseException
	 */
	default List<Notifications> getAllByCriteria(Request<NotificationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from Notifications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<Notifications> query = em.createQuery(req, Notifications.class);
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
	 * Finds count of ALL Notifications by using notificationsDto as a search criteria (including deleted).
	 * 
	 * @param request, em
	 * @return Number of Notifications (including deleted)
	 * 
	 */
	default Long countAll(Request<NotificationsDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from Notifications e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getResultList().get(0);
		return count;
	}

	/**
	 * get where expression for ALL (including deleted)
	 * @param request
	 * @param param
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	default String getAllWhereExpression(Request<NotificationsDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		NotificationsDto dto = request.getData() != null ? request.getData() : new NotificationsDto();
		// NOTE: We DON'T force isDeleted = false here, allowing to include deleted records
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (NotificationsDto elt : request.getDatas()) {
				// NOTE: We DON'T force isDeleted = false here either
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
}
