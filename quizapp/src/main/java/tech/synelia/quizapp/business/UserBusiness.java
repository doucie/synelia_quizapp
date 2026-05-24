                                                                                																			
/*
 * Java business for entity table user 
 * Created on 2025-08-22 ( Time 11:38:28 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.utils.enums.UserRole;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "user"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class UserBusiness implements IBasicBusiness<Request<UserDto>, Response<UserDto>> {

	private Response<UserDto> response;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private NotificationsRepository notificationsRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private InterviewParticipantRepository interviewParticipantRepository;
	@Autowired
	private EntityPermissionRepository entityPermissionRepository;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
	@PersistenceContext
	private EntityManager em;

	private static final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy");
	private static final DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

	public UserBusiness() {
	}

	private static Date parseDate(String dateStr) {
		return Date.from(LocalDate.parse(dateStr, dateFormat)
				.atStartOfDay(ZoneId.systemDefault()).toInstant());
	}
	
	/**
	 * create User by using UserDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<UserDto> create(Request<UserDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create User-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();
		List<User>        items    = new ArrayList<User>();
			
		for (UserDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("firstName", dto.getFirstName());
			fieldsToVerify.put("lastName", dto.getLastName());
			fieldsToVerify.put("username", dto.getUsername());
			fieldsToVerify.put("email", dto.getEmail());
			// fieldsToVerify.put("phone", dto.getPhone());
			fieldsToVerify.put("password", dto.getPassword());
			// fieldsToVerify.put("isDefaultPassword", dto.getIsDefaultPassword());
			// fieldsToVerify.put("userRole", dto.getUserRole());
			// fieldsToVerify.put("isOnline", dto.getIsOnline());
			// fieldsToVerify.put("isLocked", dto.getIsLocked());
			// fieldsToVerify.put("lastConnectionDate", dto.getLastConnectionDate());
			// fieldsToVerify.put("searchString", dto.getSearchString());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if user to insert do not exist
			User existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("user id -> " + dto.getId(), locale));
			}

			// verif unique email in db
			existingEntity = userRepository.findByEmail(dto.getEmail(), false);
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("user email -> " + dto.getEmail(), locale));
			}
			// verif unique email in items to save
			if (items.stream().anyMatch(a -> a.getEmail().equalsIgnoreCase(dto.getEmail()))) {
				throw new InternalErrorException(functionalError.DATA_DUPLICATE(" email ", locale));
			}

			if (Utilities.shouldUpdate(dto.getUserRole())) {
				dto.setUserRole(normalizeUserRoleOrThrow(dto.getUserRole(), locale));
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			User entityToSave = null;
			entityToSave = UserTransformer.INSTANCE.toEntity(dto);
			
			// Hasher le mot de passe avec BCrypt avant la sauvegarde
			try {
				entityToSave.setPassword(Utilities.encryptWithBCrypt(dto.getPassword()));
			} catch (Exception e) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("password encryption", locale));
			}
			
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<User> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = userRepository.saveAll((Iterable<User>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("user", locale));
			}
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? UserTransformer.INSTANCE.toLiteDtos(itemsSaved) : UserTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.stream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end create User-----");
		return response;
	}

	/**
	 * update User by using UserDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<UserDto> update(Request<UserDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update User-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();
		List<User>        items    = new ArrayList<User>();
			
		for (UserDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la user existe
			User entityToSave = null;
			entityToSave = userRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getId(), locale));
			}

			if (shouldPatchString(dto.getFirstName())) {
				entityToSave.setFirstName(dto.getFirstName());
			}
			if (shouldPatchString(dto.getLastName())) {
				entityToSave.setLastName(dto.getLastName());
			}
			if (shouldPatchString(dto.getUsername())) {
				entityToSave.setUsername(dto.getUsername());
			}
			if (shouldPatchString(dto.getEmail())) {
				entityToSave.setEmail(dto.getEmail());
			}
			if (shouldPatchString(dto.getPhone())) {
				entityToSave.setPhone(dto.getPhone());
			}
			if (Utilities.notBlank(dto.getPassword())) {
				// Hasher le nouveau mot de passe avec BCrypt avant la sauvegarde
				try {
					entityToSave.setPassword(Utilities.encryptWithBCrypt(dto.getPassword()));
				} catch (Exception e) {
					throw new InternalErrorException(functionalError.SAVE_FAIL("password encryption", locale));
				}
			}
			if (dto.getIsDefaultPassword() != null) {
				entityToSave.setIsDefaultPassword(dto.getIsDefaultPassword());
			}
			if (shouldPatchString(dto.getUserRole())) {
				entityToSave.setUserRole(normalizeUserRoleOrThrow(dto.getUserRole(), locale));
			}
			if (dto.getIsOnline() != null) {
				entityToSave.setIsOnline(dto.getIsOnline());
			}
			if (dto.getIsLocked() != null) {
				entityToSave.setIsLocked(dto.getIsLocked());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getAdminMode() != null) {
				entityToSave.setAdminMode(dto.getAdminMode());
			}
			if (shouldPatchString(dto.getLastConnectionDate())) {
				entityToSave.setLastConnectionDate(parseDate(dto.getLastConnectionDate()));
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (shouldPatchString(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}
			/*
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			items.add(entityToSave);
			*/
			// Après toutes les mises à jour conditionnelles...
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			// Générer le searchString à partir de l'entité finale
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<User> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = userRepository.saveAll((Iterable<User>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("user", locale));
			}
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? UserTransformer.INSTANCE.toLiteDtos(itemsSaved) : UserTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.stream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end update User-----");
		return response;
	}

	/**
	 * updateAll User by using UserDto as object (including deleted users).
	 * 
	 * @param request
	 * @return response
	 */
	public Response<UserDto> updateAll(Request<UserDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateAll User-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();
		List<User>        items    = new ArrayList<User>();
			
		for (UserDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la donnee existe
			User existingEntity = null;
			// Pour updateAll, chercher d'abord les utilisateurs actifs, puis les supprimés
			existingEntity = userRepository.findOne(dto.getId(), false); // Chercher d'abord les actifs
			if (existingEntity == null) {
				existingEntity = userRepository.findOne(dto.getId(), true); // Puis les supprimés si pas trouvé
			}
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// -----------------------------------------------------------------------
			// ----------- GENERATION KEY
			// -----------------------------------------------------------------------
			//String userKey = existingEntity.getFirstName() + dto.getFirstName(); // Business key

			// -----------------------------------------------------------------------
			// ----------- PREPARATION DE L'OBJET
			// -----------------------------------------------------------------------
			// Garder les données existantes de base
			User entityToSave = existingEntity;
			
			// Mise à jour conditionnelle des champs
			if (shouldPatchString(dto.getFirstName())) {
				entityToSave.setFirstName(dto.getFirstName());
			}
			if (shouldPatchString(dto.getLastName())) {
				entityToSave.setLastName(dto.getLastName());
			}
			if (shouldPatchString(dto.getUsername())) {
				entityToSave.setUsername(dto.getUsername());
			}
			if (shouldPatchString(dto.getEmail())) {
				entityToSave.setEmail(dto.getEmail());
			}
			if (shouldPatchString(dto.getPhone())) {
				entityToSave.setPhone(dto.getPhone());
			}
			if (Utilities.notBlank(dto.getPassword())) {
				try {
					entityToSave.setPassword(Utilities.encryptWithBCrypt(dto.getPassword()));
				} catch (Exception e) {
					throw new InternalErrorException(functionalError.SAVE_FAIL("password encryption", locale));
				}
			}
			if (dto.getIsDefaultPassword() != null) {
				entityToSave.setIsDefaultPassword(dto.getIsDefaultPassword());
			}
			if (shouldPatchString(dto.getUserRole())) {
				entityToSave.setUserRole(normalizeUserRoleOrThrow(dto.getUserRole(), locale));
			}
			if (dto.getIsOnline() != null) {
				entityToSave.setIsOnline(dto.getIsOnline());
			}
			if (dto.getIsLocked() != null) {
				entityToSave.setIsLocked(dto.getIsLocked());
			}
			// IMPORTANT: Gestion du champ isDeleted pour updateAll
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (shouldPatchString(dto.getLastConnectionDate())) {
				entityToSave.setLastConnectionDate(parseDate(dto.getLastConnectionDate()));
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (shouldPatchString(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}

			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<User> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = userRepository.saveAll((Iterable<User>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("user", locale));
			}
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? UserTransformer.INSTANCE.toLiteDtos(itemsSaved) : UserTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.stream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			response.setItems(itemsDto);
			response.setHasError(false);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updateAll User-----");
		return response;
	}

	/**
	 * delete User by using UserDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<UserDto> delete(Request<UserDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete User-----");
		Response<UserDto> response = new Response<UserDto>();

		// 1. Valider et collecter tous les IDs
		List<Integer> userIds = new ArrayList<>();
		for (UserDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}
			userIds.add(dto.getId());
		}

		// 2. Charger tous les utilisateurs en une seule requête
		List<User> items = userRepository.findByIdIn(userIds);
		if (items.size() != userIds.size()) {
			// Trouver les IDs manquants
			List<Integer> foundIds = items.stream().map(User::getId).toList();
			Integer missingId = userIds.stream().filter(id -> !foundIds.contains(id)).findFirst().orElse(null);
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user -> " + missingId, locale));
		}

		// 3. Vérifier les dépendances en batch (4 requêtes au lieu de 4*N)
		List<Integer> usersWithNotifications = notificationsRepository.findUserIdsWithNotifications(userIds);
		if (!usersWithNotifications.isEmpty()) {
			throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("notifications (" + usersWithNotifications.size() + " users)", locale));
		}
		List<Integer> usersWithCampaigns = campaignsRepository.findCreatorIdsWithCampaigns(userIds);
		if (!usersWithCampaigns.isEmpty()) {
			throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("campaigns (" + usersWithCampaigns.size() + " users)", locale));
		}
		List<Integer> usersWithInterviews = interviewParticipantRepository.findUserIdsWithInterviewParticipants(userIds);
		if (!usersWithInterviews.isEmpty()) {
			throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("interviews (" + usersWithInterviews.size() + " users)", locale));
		}
		List<Integer> usersWithEntityPermissions = entityPermissionRepository.findUserIdsWithEntityPermissions(userIds);
		if (!usersWithEntityPermissions.isEmpty()) {
			throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("entityPermissions (" + usersWithEntityPermissions.size() + " users)", locale));
		}

		// 4. Soft-delete en batch
		items.forEach(user -> user.setIsDeleted(true));
		userRepository.saveAll(items);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);

		log.info("----end delete User-----");
		return response;
	}

	/**
	 * get User by using UserDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<UserDto> getByCriteria(Request<UserDto> request, Locale locale)  throws Exception {
		log.info("----begin get User-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();
		List<User> items 			 = userRepository.getByCriteria(request, em, locale);
		
		// Compter le nombre total d'utilisateurs actifs avec les mêmes critères (pour pagination)
		Long totalCount = userRepository.count(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? UserTransformer.INSTANCE.toLiteDtos(items) : UserTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.stream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(Long.valueOf(itemsDto.size())); // Nombre d'éléments dans cette page
			response.setTotalCount(totalCount); // Nombre total d'éléments dans la base
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("user", locale));
			response.setTotalCount(totalCount); // Même si aucun résultat, renvoyer le total
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get User-----");
		return response;
	}

	/**
	 * Récupère TOUS les utilisateurs selon les critères (y compris les supprimés)
	 * 
	 * @param request
	 * @param locale
	 * @return response
	 * @throws Exception
	 */
	public Response<UserDto> getAllByCriteria(Request<UserDto> request, Locale locale) throws Exception {
		log.info("----begin getAllByCriteria User (INCLUDING DELETED)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();

		// Ajuster la taille de page selon les préférences utilisateur
		Utilities.adjustPageSizeFromUserPreference(request, userRepository);

		// Utiliser une requête directe sans filtrage automatique des supprimés
		List<User> items = userRepository.getAllByCriteriaIncludingDeleted(request, em, locale);

		// Compter le nombre total d'utilisateurs avec les mêmes critères (pour pagination)
		Long totalCount = userRepository.countAllByCriteriaIncludingDeleted(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? UserTransformer.INSTANCE.toLiteDtos(items) : UserTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.stream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setCount(Long.valueOf(itemsDto.size())); // Nombre d'éléments dans cette page
			response.setTotalCount(totalCount); // Nombre total d'éléments dans la base
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("users", locale));
			response.setTotalCount(totalCount); // Même si aucun résultat, renvoyer le total
			response.setHasError(false);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end getAllByCriteria User-----");
		return response;
	}

	/**
	 * get full UserDto by using User as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public UserDto getFullInfos(UserDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<UserDto> custom(Request<UserDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom UserDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new UserDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom UserDto-----");
		return response;
	}

	public Response<UserDto> updateAdminMode(Request<UserDto> request, Locale locale) throws Exception {
		log.info("----begin updateAdminMode-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();

		for (UserDto dto : request.getDatas()) {
			if (dto.getId() == null) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY("user id", locale));
			}
			if (dto.getAdminMode() == null) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY("adminMode", locale));
			}

			User existingUser = userRepository.findOne(dto.getId(), false);
			if (existingUser == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getId(), locale));
			}

			existingUser.setAdminMode(dto.getAdminMode());
			existingUser.setUpdatedAt(Utilities.getCurrentDate());
			existingUser.setUpdatedBy(request.getUser());

			User savedUser = userRepository.save(existingUser);
			if (savedUser == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("user adminMode", locale));
			}

			UserDto updatedDto = UserTransformer.INSTANCE.toDto(savedUser);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(Arrays.asList(updatedDto));
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updateAdminMode-----");
		return response;
	}

	/**
	 * Met à jour uniquement la préférence de taille de page pour un utilisateur
	 *
	 * @param request
	 * @param locale
	 * @return response
	 * @throws Exception
	 */
	public Response<UserDto> updatePageSizePreference(Request<UserDto> request, Locale locale) throws Exception {
		log.info("----begin updatePageSizePreference-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<UserDto> response = new Response<UserDto>();

		for (UserDto dto : request.getDatas()) {
			// Vérifier que l'ID utilisateur est fourni
			if (dto.getId() == null) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY("user id", locale));
			}

			// Vérifier que la pageSizePreference est fournie
			if (dto.getPageSizePreference() == null) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY("pageSizePreference", locale));
			}

			// Récupérer l'utilisateur
			User existingUser = userRepository.findOne(dto.getId(), false);
			if (existingUser == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getId(), locale));
			}

			// Mettre à jour uniquement la préférence de taille de page
			existingUser.setPageSizePreference(dto.getPageSizePreference());
			existingUser.setUpdatedAt(Utilities.getCurrentDate());
			existingUser.setUpdatedBy(request.getUser());

			// Sauvegarder
			User savedUser = userRepository.save(existingUser);
			if (savedUser == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("user pageSizePreference", locale));
			}

			// Retourner le DTO mis à jour
			UserDto updatedDto = UserTransformer.INSTANCE.toDto(savedUser);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(Arrays.asList(updatedDto));
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updatePageSizePreference-----");
		return response;
	}

	/**
	 * Met à jour le statut en ligne d'un utilisateur
	 */
	public void updateOnlineStatus(Integer userId, Boolean isOnline) {
		userRepository.findById(userId).ifPresent(user -> {
			user.setIsOnline(isOnline);
			if (Boolean.TRUE.equals(isOnline)) {
				user.setLastConnectionDate(new Date());
			}
			user.setUpdatedAt(new Date());
			userRepository.save(user);
		});
	}

	private String normalizeUserRoleOrThrow(String rawUserRole, Locale locale) {
		UserRole normalizedRole = UserRole.fromValue(rawUserRole);
		if (normalizedRole == null) {
			throw new InvalidEntityException(functionalError.INVALID_FORMAT(
					"userRole -> " + rawUserRole + " (autorisé: super, admin, recruiter, candidate)", locale));
		}
		return normalizedRole.getValue();
	}

	private boolean shouldPatchString(String value) {
		return value != null && Utilities.shouldUpdate(value);
	}
}
