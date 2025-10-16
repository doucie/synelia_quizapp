                                                        													
/*
 * Java business for entity table notifications 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
import tech.synelia.quizapp.dao.entity.Notifications;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "notifications"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class NotificationsBusiness implements IBasicBusiness<Request<NotificationsDto>, Response<NotificationsDto>> {

	private Response<NotificationsDto> response;
	@Autowired
	private NotificationsRepository notificationsRepository;
	@Autowired
	private UserRepository userRepository;
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

	public NotificationsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Notifications by using NotificationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<NotificationsDto> create(Request<NotificationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Notifications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<NotificationsDto> response = new Response<NotificationsDto>();
		List<Notifications>        items    = new ArrayList<Notifications>();
			
		for (NotificationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("notifType", dto.getNotifType());
			// fieldsToVerify.put("notifActor", dto.getNotifActor());
			// fieldsToVerify.put("notifLink", dto.getNotifLink());
			fieldsToVerify.put("isRead", dto.getIsRead());
			// fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("userId", dto.getUserId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if notifications to insert do not exist
			Notifications existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("notifications id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			User existingUser = null;
			if (dto.getUserId() != null && dto.getUserId() > 0){
				existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Notifications entityToSave = null;
			entityToSave = NotificationsTransformer.INSTANCE.toEntity(dto, existingUser);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Notifications> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = notificationsRepository.saveAll((Iterable<Notifications>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("notifications", locale));
			}
			List<NotificationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? NotificationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : NotificationsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Notifications-----");
		return response;
	}

	/**
	 * update Notifications by using NotificationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<NotificationsDto> update(Request<NotificationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Notifications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<NotificationsDto> response = new Response<NotificationsDto>();
		List<Notifications>        items    = new ArrayList<Notifications>();
			
		for (NotificationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la notifications existe
			Notifications entityToSave = null;
			entityToSave = notificationsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("notifications id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getUserId() != null && dto.getUserId() > 0){
				User existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			if (Utilities.notBlank(dto.getNotifType())) {
				entityToSave.setNotifType(dto.getNotifType());
			}
			if (dto.getNotifActor() != null && dto.getNotifActor() > 0) {
				entityToSave.setNotifActor(dto.getNotifActor());
			}
			if (Utilities.notBlank(dto.getNotifLink())) {
				entityToSave.setNotifLink(dto.getNotifLink());
			}
			if (dto.getIsRead() != null) {
				entityToSave.setIsRead(dto.getIsRead());
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
			// Après toutes les mises à jour conditionnelles...
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			// Générer le searchString à partir de l'entité finale
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Notifications> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = notificationsRepository.saveAll((Iterable<Notifications>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("notifications", locale));
			}
			List<NotificationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? NotificationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : NotificationsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Notifications-----");
		return response;
	}

	/**
	 * delete Notifications by using NotificationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<NotificationsDto> delete(Request<NotificationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Notifications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<NotificationsDto> response = new Response<NotificationsDto>();
		List<Notifications>        items    = new ArrayList<Notifications>();
			
		for (NotificationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la notifications existe
			Notifications existingEntity = null;
			existingEntity = notificationsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("notifications -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			notificationsRepository.saveAll((Iterable<Notifications>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Notifications-----");
		return response;
	}

	/**
	 * get Notifications by using NotificationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<NotificationsDto> getByCriteria(Request<NotificationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Notifications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<NotificationsDto> response = new Response<NotificationsDto>();
		List<Notifications> items 			 = notificationsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<NotificationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? NotificationsTransformer.INSTANCE.toLiteDtos(items) : NotificationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(notificationsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("notifications", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Notifications-----");
		return response;
	}

	/**
	 * get ALL Notifications by using NotificationsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<NotificationsDto> getAllByCriteria(Request<NotificationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Notifications (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<NotificationsDto> response = new Response<NotificationsDto>();

		// Ajuster la taille de page selon les préférences utilisateur
		Utilities.adjustPageSizeFromUserPreference(request, userRepository);

		List<Notifications> items 			 = notificationsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<NotificationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? NotificationsTransformer.INSTANCE.toLiteDtos(items) : NotificationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(notificationsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("notifications", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Notifications-----");
		return response;
	}

	/**
	 * get full NotificationsDto by using Notifications as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public NotificationsDto getFullInfos(NotificationsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<NotificationsDto> custom(Request<NotificationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom NotificationsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<NotificationsDto> response = new Response<NotificationsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new NotificationsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom NotificationsDto-----");
		return response;
	}
}
