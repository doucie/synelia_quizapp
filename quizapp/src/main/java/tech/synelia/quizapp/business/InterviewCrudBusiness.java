                                                            														
/*
 * Java business for entity table interview_crud 
 * Created on 2025-08-22 ( Time 11:38:26 )
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
import tech.synelia.quizapp.dao.entity.InterviewCrud;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "interview_crud"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class InterviewCrudBusiness implements IBasicBusiness<Request<InterviewCrudDto>, Response<InterviewCrudDto>> {

	private Response<InterviewCrudDto> response;
	@Autowired
	private InterviewCrudRepository interviewCrudRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private InterviewsRepository interviewsRepository;
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

	public InterviewCrudBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create InterviewCrud by using InterviewCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewCrudDto> create(Request<InterviewCrudDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create InterviewCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
		List<InterviewCrud>        items    = new ArrayList<InterviewCrud>();
			
		for (InterviewCrudDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("interviewId", dto.getInterviewId());
			fieldsToVerify.put("userId", dto.getUserId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if interviewCrud to insert do not exist
			InterviewCrud existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("interviewCrud id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			User existingUser = null;
			if (dto.getUserId() != null && dto.getUserId() > 0){
				existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
			}
			// Verify if interviews exist
			Interviews existingInterviews = null;
			if (dto.getInterviewId() != null && dto.getInterviewId() > 0){
				existingInterviews = interviewsRepository.findOne(dto.getInterviewId(), false);
				if (existingInterviews == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews interviewId -> " + dto.getInterviewId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			InterviewCrud entityToSave = null;
			entityToSave = InterviewCrudTransformer.INSTANCE.toEntity(dto, existingUser, existingInterviews);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<InterviewCrud> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = interviewCrudRepository.saveAll((Iterable<InterviewCrud>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviewCrud", locale));
			}
			List<InterviewCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewCrudTransformer.INSTANCE.toLiteDtos(itemsSaved) : InterviewCrudTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create InterviewCrud-----");
		return response;
	}

	/**
	 * update InterviewCrud by using InterviewCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewCrudDto> update(Request<InterviewCrudDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update InterviewCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
		List<InterviewCrud>        items    = new ArrayList<InterviewCrud>();
			
		for (InterviewCrudDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la interviewCrud existe
			InterviewCrud entityToSave = null;
			entityToSave = interviewCrudRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviewCrud id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getUserId() != null && dto.getUserId() > 0){
				User existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if interviews exist
			if (dto.getInterviewId() != null && dto.getInterviewId() > 0){
				Interviews existingInterviews = interviewsRepository.findOne(dto.getInterviewId(), false);
				if (existingInterviews == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews interviewId -> " + dto.getInterviewId(), locale));
				}
				entityToSave.setInterviews(existingInterviews);
			}
			if (dto.getCanUpdate() != null) {
				entityToSave.setCanUpdate(dto.getCanUpdate());
			}
			if (dto.getCanDelete() != null) {
				entityToSave.setCanDelete(dto.getCanDelete());
			}
			if (dto.getCanEvaluate() != null) {
				entityToSave.setCanEvaluate(dto.getCanEvaluate());
			}
			if (dto.getIsAdmin() != null) {
				entityToSave.setIsAdmin(dto.getIsAdmin());
			}
			if (dto.getFollow() != null) {
				entityToSave.setFollow(dto.getFollow());
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
		}

		if (!items.isEmpty()) {
			List<InterviewCrud> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = interviewCrudRepository.saveAll((Iterable<InterviewCrud>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviewCrud", locale));
			}
			List<InterviewCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewCrudTransformer.INSTANCE.toLiteDtos(itemsSaved) : InterviewCrudTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update InterviewCrud-----");
		return response;
	}

	/**
	 * delete InterviewCrud by using InterviewCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewCrudDto> delete(Request<InterviewCrudDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete InterviewCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
		List<InterviewCrud>        items    = new ArrayList<InterviewCrud>();
			
		for (InterviewCrudDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la interviewCrud existe
			InterviewCrud existingEntity = null;
			existingEntity = interviewCrudRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviewCrud -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			interviewCrudRepository.saveAll((Iterable<InterviewCrud>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete InterviewCrud-----");
		return response;
	}

	/**
	 * get InterviewCrud by using InterviewCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewCrudDto> getByCriteria(Request<InterviewCrudDto> request, Locale locale)  throws Exception {
		log.info("----begin get InterviewCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
		List<InterviewCrud> items 			 = interviewCrudRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewCrudTransformer.INSTANCE.toLiteDtos(items) : InterviewCrudTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewCrudRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviewCrud", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get InterviewCrud-----");
		return response;
	}

	/**
	 * get ALL InterviewCrud by using InterviewCrudDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<InterviewCrudDto> getAllByCriteria(Request<InterviewCrudDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL InterviewCrud (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
		List<InterviewCrud> items 			 = interviewCrudRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewCrudTransformer.INSTANCE.toLiteDtos(items) : InterviewCrudTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewCrudRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviewCrud", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL InterviewCrud-----");
		return response;
	}

	/**
	 * get full InterviewCrudDto by using InterviewCrud as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public InterviewCrudDto getFullInfos(InterviewCrudDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<InterviewCrudDto> custom(Request<InterviewCrudDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom InterviewCrudDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new InterviewCrudDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom InterviewCrudDto-----");
		return response;
	}
}
