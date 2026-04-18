package tech.synelia.quizapp.dao.repository;

import java.util.Date;
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
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._InterviewParticipantRepository;

/**
 * Repository : InterviewParticipant.
 */
@Repository
public interface InterviewParticipantRepository extends JpaRepository<InterviewParticipant, Integer>, _InterviewParticipantRepository {

	@Query("select e from InterviewParticipant e where e.id = :id and e.isDeleted = :isDeleted")
	InterviewParticipant findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.user.id = :userId and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByUserId(@Param("userId")Integer userId, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from InterviewParticipant e where e.interviews.id = :interviewId and e.isDeleted = :isDeleted")
	List<InterviewParticipant> findByInterviewId(@Param("interviewId")Integer interviewId, @Param("isDeleted")Boolean isDeleted);

	default List<InterviewParticipant> getByCriteria(Request<InterviewParticipantDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from InterviewParticipant e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<InterviewParticipant> query = em.createQuery(req, InterviewParticipant.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long count(Request<InterviewParticipantDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from InterviewParticipant e where e IS NOT NULL";
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

	default String getWhereExpression(Request<InterviewParticipantDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		InterviewParticipantDto dto = request.getData() != null ? request.getData() : new InterviewParticipantDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (InterviewParticipantDto elt : request.getDatas()) {
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

	default String generateCriteria(InterviewParticipantDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
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
			if (dto.getIsOnline()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isOnline", dto.getIsOnline(), "e.isOnline", "Boolean", dto.getIsOnlineParam(), param, index, locale));
			}
			if (dto.getHasFinished()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("hasFinished", dto.getHasFinished(), "e.hasFinished", "Boolean", dto.getHasFinishedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getLastPingAt())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("lastPingAt", dto.getLastPingAt(), "e.lastPingAt", "Date", dto.getLastPingAtParam(), param, index, locale));
			}
			List<String> listOfCustomQuery = _generateCriteria(dto, param, index, locale);
			if (Utilities.isNotEmpty(listOfCustomQuery)) {
				listOfQuery.addAll(listOfCustomQuery);
			}
		}
		return CriteriaUtils.getCriteriaByListOfQuery(listOfQuery);
	}

	default List<InterviewParticipant> getAllByCriteria(Request<InterviewParticipantDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from InterviewParticipant e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getAllWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<InterviewParticipant> query = em.createQuery(req, InterviewParticipant.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		if (request.getIndex() != null && request.getSize() != null) {
			query.setFirstResult(request.getIndex() * request.getSize());
			query.setMaxResults(request.getSize());
		}
		return query.getResultList();
	}

	default Long countAll(Request<InterviewParticipantDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from InterviewParticipant e where e IS NOT NULL";
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

	default String getAllWhereExpression(Request<InterviewParticipantDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		InterviewParticipantDto dto = request.getData() != null ? request.getData() : new InterviewParticipantDto();
		String mainReq = generateCriteria(dto, param, 0, locale);
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (InterviewParticipantDto elt : request.getDatas()) {
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

	@Query("select e.user.id from InterviewParticipant e where e.user.id in :userIds and e.isDeleted = false")
	List<Integer> findUserIdsWithInterviewParticipants(@Param("userIds") List<Integer> userIds);
}
