                                                            														
/*
 * Java business for entity table campaign_crud 
 * Created on 2025-08-22 ( Time 11:38:24 )
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
import tech.synelia.quizapp.dao.entity.CampaignCrud;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "campaign_crud"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CampaignCrudBusiness implements IBasicBusiness<Request<CampaignCrudDto>, Response<CampaignCrudDto>> {

	private Response<CampaignCrudDto> response;
	@Autowired
	private CampaignCrudRepository campaignCrudRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
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

	public CampaignCrudBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create CampaignCrud by using CampaignCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignCrudDto> create(Request<CampaignCrudDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create CampaignCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
		List<CampaignCrud>        items    = new ArrayList<CampaignCrud>();
			
		for (CampaignCrudDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("canUpdate", dto.getCanUpdate());
			fieldsToVerify.put("canDelete", dto.getCanDelete());
			fieldsToVerify.put("canEvaluate", dto.getCanEvaluate());
			fieldsToVerify.put("follow", dto.getFollow());
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("campaignId", dto.getCampaignId());
			fieldsToVerify.put("userId", dto.getUserId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if campaignCrud to insert do not exist
			CampaignCrud existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("campaignCrud id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			User existingUser = null;
			if (dto.getUserId() != null && dto.getUserId() > 0){
				existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
			}
			// Verify if campaigns exist
			Campaigns existingCampaigns = null;
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			CampaignCrud entityToSave = null;
			entityToSave = CampaignCrudTransformer.INSTANCE.toEntity(dto, existingUser, existingCampaigns);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignCrud> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = campaignCrudRepository.saveAll((Iterable<CampaignCrud>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignCrud", locale));
			}
			List<CampaignCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignCrudTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignCrudTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CampaignCrud-----");
		return response;
	}

	/**
	 * update CampaignCrud by using CampaignCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignCrudDto> update(Request<CampaignCrudDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update CampaignCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
		List<CampaignCrud>        items    = new ArrayList<CampaignCrud>();
			
		for (CampaignCrudDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaignCrud existe
			CampaignCrud entityToSave = null;
			entityToSave = campaignCrudRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignCrud id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getUserId() != null && dto.getUserId() > 0){
				User existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if campaigns exist
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
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
			List<CampaignCrud> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignCrudRepository.saveAll((Iterable<CampaignCrud>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignCrud", locale));
			}
			List<CampaignCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignCrudTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignCrudTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CampaignCrud-----");
		return response;
	}

	/**
	 * delete CampaignCrud by using CampaignCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignCrudDto> delete(Request<CampaignCrudDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CampaignCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
		List<CampaignCrud>        items    = new ArrayList<CampaignCrud>();
			
		for (CampaignCrudDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaignCrud existe
			CampaignCrud existingEntity = null;
			existingEntity = campaignCrudRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignCrud -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			campaignCrudRepository.saveAll((Iterable<CampaignCrud>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete CampaignCrud-----");
		return response;
	}

	/**
	 * get CampaignCrud by using CampaignCrudDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignCrudDto> getByCriteria(Request<CampaignCrudDto> request, Locale locale)  throws Exception {
		log.info("----begin get CampaignCrud-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
		List<CampaignCrud> items 			 = campaignCrudRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignCrudTransformer.INSTANCE.toLiteDtos(items) : CampaignCrudTransformer.INSTANCE.toDtos(items);

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
			response.setCount(campaignCrudRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaignCrud", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get CampaignCrud-----");
		return response;
	}

	/**
	 * get ALL CampaignCrud by using CampaignCrudDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CampaignCrudDto> getAllByCriteria(Request<CampaignCrudDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL CampaignCrud (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
		List<CampaignCrud> items 			 = campaignCrudRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignCrudDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignCrudTransformer.INSTANCE.toLiteDtos(items) : CampaignCrudTransformer.INSTANCE.toDtos(items);

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
			response.setCount(campaignCrudRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaignCrud", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL CampaignCrud-----");
		return response;
	}

	/**
	 * get full CampaignCrudDto by using CampaignCrud as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CampaignCrudDto getFullInfos(CampaignCrudDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CampaignCrudDto> custom(Request<CampaignCrudDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CampaignCrudDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CampaignCrudDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CampaignCrudDto-----");
		return response;
	}
}
