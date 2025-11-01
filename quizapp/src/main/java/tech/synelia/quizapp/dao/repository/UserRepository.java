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
import tech.synelia.quizapp.dao.repository.customize._UserRepository;

/**
 * Repository : User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer>, _UserRepository {
	/**
	 * Finds User by using id as a search criteria.
	 * 
	 * @param id
	 * @return An Object User whose id is equals to the given id. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.id = :id and e.isDeleted = :isDeleted")
	User findOne(@Param("id")Integer id, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds User by using firstName as a search criteria.
	 * 
	 * @param firstName
	 * @return An Object User whose firstName is equals to the given firstName. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.firstName = :firstName and e.isDeleted = :isDeleted")
	List<User> findByFirstName(@Param("firstName")String firstName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using lastName as a search criteria.
	 * 
	 * @param lastName
	 * @return An Object User whose lastName is equals to the given lastName. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.lastName = :lastName and e.isDeleted = :isDeleted")
	List<User> findByLastName(@Param("lastName")String lastName, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using username as a search criteria.
	 * 
	 * @param username
	 * @return An Object User whose username is equals to the given username. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.username = :username and e.isDeleted = :isDeleted")
	List<User> findByUsername(@Param("username")String username, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using email as a search criteria.
	 * 
	 * @param email
	 * @return An Object User whose email is equals to the given email. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.email = :email and e.isDeleted = :isDeleted")
	User findByEmail(@Param("email")String email, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using phone as a search criteria.
	 * 
	 * @param phone
	 * @return An Object User whose phone is equals to the given phone. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.phone = :phone and e.isDeleted = :isDeleted")
	List<User> findByPhone(@Param("phone")String phone, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using password as a search criteria.
	 * 
	 * @param password
	 * @return An Object User whose password is equals to the given password. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.password = :password and e.isDeleted = :isDeleted")
	List<User> findByPassword(@Param("password")String password, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using isDefaultPassword as a search criteria.
	 * 
	 * @param isDefaultPassword
	 * @return An Object User whose isDefaultPassword is equals to the given isDefaultPassword. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.isDefaultPassword = :isDefaultPassword and e.isDeleted = :isDeleted")
	List<User> findByIsDefaultPassword(@Param("isDefaultPassword")Boolean isDefaultPassword, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using userRole as a search criteria.
	 * 
	 * @param userRole
	 * @return An Object User whose userRole is equals to the given userRole. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.userRole = :userRole and e.isDeleted = :isDeleted")
	List<User> findByUserRole(@Param("userRole")String userRole, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using isOnline as a search criteria.
	 * 
	 * @param isOnline
	 * @return An Object User whose isOnline is equals to the given isOnline. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.isOnline = :isOnline and e.isDeleted = :isDeleted")
	List<User> findByIsOnline(@Param("isOnline")Boolean isOnline, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using isLocked as a search criteria.
	 * 
	 * @param isLocked
	 * @return An Object User whose isLocked is equals to the given isLocked. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.isLocked = :isLocked and e.isDeleted = :isDeleted")
	List<User> findByIsLocked(@Param("isLocked")Boolean isLocked, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using lastConnectionDate as a search criteria.
	 * 
	 * @param lastConnectionDate
	 * @return An Object User whose lastConnectionDate is equals to the given lastConnectionDate. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.lastConnectionDate = :lastConnectionDate and e.isDeleted = :isDeleted")
	List<User> findByLastConnectionDate(@Param("lastConnectionDate")Date lastConnectionDate, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using createdAt as a search criteria.
	 * 
	 * @param createdAt
	 * @return An Object User whose createdAt is equals to the given createdAt. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.createdAt = :createdAt and e.isDeleted = :isDeleted")
	List<User> findByCreatedAt(@Param("createdAt")Date createdAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using createdBy as a search criteria.
	 * 
	 * @param createdBy
	 * @return An Object User whose createdBy is equals to the given createdBy. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.createdBy = :createdBy and e.isDeleted = :isDeleted")
	List<User> findByCreatedBy(@Param("createdBy")Integer createdBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using updatedAt as a search criteria.
	 * 
	 * @param updatedAt
	 * @return An Object User whose updatedAt is equals to the given updatedAt. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.updatedAt = :updatedAt and e.isDeleted = :isDeleted")
	List<User> findByUpdatedAt(@Param("updatedAt")Date updatedAt, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using updatedBy as a search criteria.
	 * 
	 * @param updatedBy
	 * @return An Object User whose updatedBy is equals to the given updatedBy. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.updatedBy = :updatedBy and e.isDeleted = :isDeleted")
	List<User> findByUpdatedBy(@Param("updatedBy")Integer updatedBy, @Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using isDeleted as a search criteria.
	 * 
	 * @param isDeleted
	 * @return An Object User whose isDeleted is equals to the given isDeleted. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.isDeleted = :isDeleted")
	List<User> findByIsDeleted(@Param("isDeleted")Boolean isDeleted);
	/**
	 * Finds User by using searchString as a search criteria.
	 * 
	 * @param searchString
	 * @return An Object User whose searchString is equals to the given searchString. If
	 *         no User is found, this method returns null.
	 */
	@Query("select e from User e where e.searchString = :searchString and e.isDeleted = :isDeleted")
	List<User> findBySearchString(@Param("searchString")String searchString, @Param("isDeleted")Boolean isDeleted);

	/**
	 * Finds List of User by using userDto as a search criteria.
	 * 
	 * @param request, em
	 * @return A List of User
	 * @throws DataAccessException,ParseException
	 */
	default List<User> getByCriteria(Request<UserDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception {
		String req = "select e from User e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by e.id desc";
		TypedQuery<User> query = em.createQuery(req, User.class);
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
	 * Finds count of User by using userDto as a search criteria.
	 * 
	 * @param request, em
	 * @return Number of User
	 * 
	 */
	default Long count(Request<UserDto> request, EntityManager em, Locale locale) throws DataAccessException, Exception  {
		String req = "select count(e.id) from User e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpression(request, param, locale);
		req += " order by  e.id desc";
		jakarta.persistence.Query query = em.createQuery(req);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		Long count = (Long) query.getSingleResult();
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
	default String getWhereExpression(Request<UserDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		UserDto dto = request.getData() != null ? request.getData() : new UserDto();
		dto.setIsDeleted(false);
		String mainReq = generateCriteria(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (UserDto elt : request.getDatas()) {
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
	default String generateCriteria(UserDto dto, HashMap<String, java.lang.Object> param, Integer index,  Locale locale) throws Exception{
		List<String> listOfQuery = new ArrayList<String>();
		if (dto != null) {
			if (dto.getId()!= null && dto.getId() > 0) {
				listOfQuery.add(CriteriaUtils.generateCriteria("id", dto.getId(), "e.id", "Integer", dto.getIdParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getFirstName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("firstName", dto.getFirstName(), "e.firstName", "String", dto.getFirstNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getLastName())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("lastName", dto.getLastName(), "e.lastName", "String", dto.getLastNameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUsername())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("username", dto.getUsername(), "e.username", "String", dto.getUsernameParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getEmail())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("email", dto.getEmail(), "e.email", "String", dto.getEmailParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getPhone())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("phone", dto.getPhone(), "e.phone", "String", dto.getPhoneParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getPassword())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("password", dto.getPassword(), "e.password", "String", dto.getPasswordParam(), param, index, locale));
			}
			if (dto.getIsDefaultPassword()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isDefaultPassword", dto.getIsDefaultPassword(), "e.isDefaultPassword", "Boolean", dto.getIsDefaultPasswordParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getUserRole())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("userRole", dto.getUserRole(), "e.userRole", "String", dto.getUserRoleParam(), param, index, locale));
			}
			if (dto.getIsOnline()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isOnline", dto.getIsOnline(), "e.isOnline", "Boolean", dto.getIsOnlineParam(), param, index, locale));
			}
			if (dto.getIsLocked()!= null) {
				listOfQuery.add(CriteriaUtils.generateCriteria("isLocked", dto.getIsLocked(), "e.isLocked", "Boolean", dto.getIsLockedParam(), param, index, locale));
			}
			if (Utilities.notBlank(dto.getLastConnectionDate())) {
				listOfQuery.add(CriteriaUtils.generateCriteria("lastConnectionDate", dto.getLastConnectionDate(), "e.lastConnectionDate", "Date", dto.getLastConnectionDateParam(), param, index, locale));
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

	/**
	 * Requête pour récupérer tous les utilisateurs (y compris les supprimés)
	 */
	default List<User> getAllByCriteriaIncludingDeleted(Request<UserDto> request, EntityManager em, Locale locale) throws Exception {
		String req = "select e from User e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpressionIncludingDeleted(request, param, locale);
		req += " order by e.id desc";
		
		TypedQuery<User> query = em.createQuery(req, User.class);
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
	 * Compte le nombre total d'utilisateurs correspondant aux critères (y compris les supprimés)
	 */
	default Long countAllByCriteriaIncludingDeleted(Request<UserDto> request, EntityManager em, Locale locale) throws Exception {
		String req = "select count(e.id) from User e where e IS NOT NULL";
		HashMap<String, java.lang.Object> param = new HashMap<String, java.lang.Object>();
		req += getWhereExpressionIncludingDeleted(request, param, locale);
		
		TypedQuery<Long> query = em.createQuery(req, Long.class);
		for (Map.Entry<String, java.lang.Object> entry : param.entrySet()) {
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return query.getSingleResult();
	}

	/**
	 * Expression WHERE sans filtrage automatique des supprimés
	 */
	default String getWhereExpressionIncludingDeleted(Request<UserDto> request, HashMap<String, java.lang.Object> param, Locale locale) throws Exception {
		// main query
		UserDto dto = request.getData() != null ? request.getData() : new UserDto();
		// Ne pas forcer isDeleted = false ici !
		String mainReq = generateCriteriaIncludingDeleted(dto, param, 0, locale);
		// others query
		String othersReq = "";
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Integer index = 1;
			for (UserDto elt : request.getDatas()) {
				// Ne pas forcer isDeleted = false ici !
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
		return req;
	}

	/**
	 * Génération des critères sans forcer isDeleted = false
	 */
	default String generateCriteriaIncludingDeleted(UserDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception{
		// Utiliser la méthode generateCriteria existante, elle n'altère pas isDeleted
		return generateCriteria(dto, param, index, locale);
	}

	// ==================== MÉTHODES POUR STATISTIQUES QEEL ====================

	/**
	 * Compte le nombre total d'utilisateurs actifs
	 * @return Le nombre total d'utilisateurs non supprimés
	 */
	@Query("select count(e) from User e where e.isDeleted = false")
	Long countTotalUsers();

	/**
	 * Compte le nombre d'utilisateurs en ligne
	 * @return Le nombre d'utilisateurs connectés actuellement
	 */
	@Query("select count(e) from User e where e.isDeleted = false and e.isOnline = true")
	Long countOnlineUsers();

	/**
	 * Compte le nombre total d'utilisateurs par rôle
	 * @param userRole Le rôle à compter (admin, recruiter, etc.)
	 * @return Le nombre total d'utilisateurs de ce rôle
	 */
	@Query("select count(e) from User e where e.isDeleted = false and e.userRole = :userRole")
	Long countUsersByRole(@Param("userRole") String userRole);

	/**
	 * Compte le nombre d'utilisateurs en ligne par rôle
	 * @param userRole Le rôle à compter (admin, recruiter, etc.)
	 * @return Le nombre d'utilisateurs connectés de ce rôle
	 */
	@Query("select count(e) from User e where e.isDeleted = false and e.isOnline = true and e.userRole = :userRole")
	Long countOnlineUsersByRole(@Param("userRole") String userRole);

	/**
	 * Trouve les utilisateurs marqués comme en ligne mais inactifs (sans heartbeat récent)
	 * @param timeoutThreshold La date limite - les utilisateurs sans activité depuis cette date sont considérés inactifs
	 * @return Liste des utilisateurs inactifs à marquer comme hors ligne
	 */
	@Query("select e from User e where e.isDeleted = false and e.isOnline = true and (e.lastConnectionDate is null or e.lastConnectionDate < :timeoutThreshold)")
	List<User> findInactiveOnlineUsers(@Param("timeoutThreshold") Date timeoutThreshold);
}
