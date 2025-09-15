                                                                                																			
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
import java.text.SimpleDateFormat;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
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
	private InterviewCrudRepository interviewCrudRepository;
	@Autowired
	private CampaignCrudRepository campaignCrudRepository;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
	@PersistenceContext
	private EntityManager em;

	private SimpleDateFormat dateFormat;
	private SimpleDateFormat dateTimeFormat;

	public UserBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
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

			// Validation de userRole si fourni
			if (Utilities.notBlank(dto.getUserRole())) {
				List<String> allowedRoles = Arrays.asList("super", "admin", "recruiter");
				if (!allowedRoles.contains(dto.getUserRole())) {
					throw new InvalidEntityException(functionalError.INVALID_FORMAT("userRole -> " + dto.getUserRole() + " (autorisé: super, admin, recruiter)", locale));
				}
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
			itemsDto.parallelStream().forEach(dto -> {
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

			if (Utilities.notBlank(dto.getFirstName())) {
				entityToSave.setFirstName(dto.getFirstName());
			}
			if (Utilities.notBlank(dto.getLastName())) {
				entityToSave.setLastName(dto.getLastName());
			}
			if (Utilities.notBlank(dto.getUsername())) {
				entityToSave.setUsername(dto.getUsername());
			}
			if (Utilities.notBlank(dto.getEmail())) {
				entityToSave.setEmail(dto.getEmail());
			}
			if (Utilities.notBlank(dto.getPhone())) {
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
			if (Utilities.notBlank(dto.getUserRole())) {
				// Validation des valeurs autorisées pour userRole
				List<String> allowedRoles = Arrays.asList("super", "admin", "recruiter");
				if (!allowedRoles.contains(dto.getUserRole())) {
					throw new InvalidEntityException(functionalError.INVALID_FORMAT("userRole -> " + dto.getUserRole() + " (autorisé: super, admin, recruiter)", locale));
				}
				entityToSave.setUserRole(dto.getUserRole());
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
			if (Utilities.notBlank(dto.getLastConnectionDate())) {
				entityToSave.setLastConnectionDate(dateFormat.parse(dto.getLastConnectionDate()));
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.notBlank(dto.getSearchString())) {
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
			itemsDto.parallelStream().forEach(dto -> {
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
			// Pour updateAll, on cherche même les utilisateurs supprimés
			existingEntity = userRepository.findOne(dto.getId(), true);
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
			if (Utilities.notBlank(dto.getFirstName())) {
				entityToSave.setFirstName(dto.getFirstName());
			}
			if (Utilities.notBlank(dto.getLastName())) {
				entityToSave.setLastName(dto.getLastName());
			}
			if (Utilities.notBlank(dto.getUsername())) {
				entityToSave.setUsername(dto.getUsername());
			}
			if (Utilities.notBlank(dto.getEmail())) {
				entityToSave.setEmail(dto.getEmail());
			}
			if (Utilities.notBlank(dto.getPhone())) {
				entityToSave.setPhone(dto.getPhone());
			}
			if (Utilities.notBlank(dto.getPassword())) {
				entityToSave.setPassword(dto.getPassword());
			}
			if (dto.getIsDefaultPassword() != null) {
				entityToSave.setIsDefaultPassword(dto.getIsDefaultPassword());
			}
			if (Utilities.notBlank(dto.getUserRole())) {
				entityToSave.setUserRole(dto.getUserRole());
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
			if (Utilities.notBlank(dto.getLastConnectionDate())) {
				entityToSave.setLastConnectionDate(dateFormat.parse(dto.getLastConnectionDate()));
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.notBlank(dto.getSearchString())) {
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
			itemsDto.parallelStream().forEach(dto -> {
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

			// Verifier si user existe
			User existingEntity = null;
			existingEntity = userRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// notifications
			List<Notifications> listOfNotifications = notificationsRepository.findByUserId(existingEntity.getId(), false);
			if (listOfNotifications != null && !listOfNotifications.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfNotifications.size() + ")", locale));
			}
			// campaigns
			List<Campaigns> listOfCampaigns = campaignsRepository.findByCreatorId(existingEntity.getId(), false);
			if (listOfCampaigns != null && !listOfCampaigns.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCampaigns.size() + ")", locale));
			}
			// interviewCrud
			List<InterviewCrud> listOfInterviewCrud = interviewCrudRepository.findByUserId(existingEntity.getId(), false);
			if (listOfInterviewCrud != null && !listOfInterviewCrud.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfInterviewCrud.size() + ")", locale));
			}
			// campaignCrud
			List<CampaignCrud> listOfCampaignCrud = campaignCrudRepository.findByUserId(existingEntity.getId(), false);
			if (listOfCampaignCrud != null && !listOfCampaignCrud.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCampaignCrud.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			userRepository.saveAll((Iterable<User>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
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
			itemsDto.parallelStream().forEach(dto -> {
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
		
		// Utiliser une requête directe sans filtrage automatique des supprimés
		List<User> items = userRepository.getAllByCriteriaIncludingDeleted(request, em, locale);

		// Compter le nombre total d'utilisateurs avec les mêmes critères (pour pagination)
		Long totalCount = userRepository.countAllByCriteriaIncludingDeleted(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? UserTransformer.INSTANCE.toLiteDtos(items) : UserTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
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
}
