                                            										
/*
 * Java business for entity table campaign_questions 
 * Created on 2025-08-22 ( Time 11:38:25 )
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
import tech.synelia.quizapp.dao.entity.CampaignQuestions;
import tech.synelia.quizapp.dao.entity.Questions;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "campaign_questions"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CampaignQuestionsBusiness implements IBasicBusiness<Request<CampaignQuestionsDto>, Response<CampaignQuestionsDto>> {

	private Response<CampaignQuestionsDto> response;
	@Autowired
	private CampaignQuestionsRepository campaignQuestionsRepository;
	@Autowired
	private QuestionsRepository questionsRepository;
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

	public CampaignQuestionsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create CampaignQuestions by using CampaignQuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignQuestionsDto> create(Request<CampaignQuestionsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create CampaignQuestions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignQuestionsDto> response = new Response<CampaignQuestionsDto>();
		List<CampaignQuestions>        items    = new ArrayList<CampaignQuestions>();
			
		for (CampaignQuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("campaignId", dto.getCampaignId());
			fieldsToVerify.put("questionId", dto.getQuestionId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if campaignQuestions to insert do not exist
			CampaignQuestions existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("campaignQuestions id -> " + dto.getId(), locale));
			}

			// Verify if questions exist
			Questions existingQuestions = null;
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0){
				existingQuestions = questionsRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestions == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questions questionId -> " + dto.getQuestionId(), locale));
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

			CampaignQuestions entityToSave = null;
			entityToSave = CampaignQuestionsTransformer.INSTANCE.toEntity(dto, existingQuestions, existingCampaigns);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignQuestions> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = campaignQuestionsRepository.saveAll((Iterable<CampaignQuestions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignQuestions", locale));
			}
			List<CampaignQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignQuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignQuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CampaignQuestions-----");
		return response;
	}

	/**
	 * update CampaignQuestions by using CampaignQuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignQuestionsDto> update(Request<CampaignQuestionsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update CampaignQuestions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignQuestionsDto> response = new Response<CampaignQuestionsDto>();
		List<CampaignQuestions>        items    = new ArrayList<CampaignQuestions>();
			
		for (CampaignQuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaignQuestions existe
			CampaignQuestions entityToSave = null;
			entityToSave = campaignQuestionsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignQuestions id -> " + dto.getId(), locale));
			}

			// Verify if questions exist
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0){
				Questions existingQuestions = questionsRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestions == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questions questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestions(existingQuestions);
			}
			// Verify if campaigns exist
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
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
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignQuestions> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignQuestionsRepository.saveAll((Iterable<CampaignQuestions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignQuestions", locale));
			}
			List<CampaignQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignQuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignQuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CampaignQuestions-----");
		return response;
	}

	/**
	 * delete CampaignQuestions by using CampaignQuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignQuestionsDto> delete(Request<CampaignQuestionsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CampaignQuestions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignQuestionsDto> response = new Response<CampaignQuestionsDto>();
		List<CampaignQuestions>        items    = new ArrayList<CampaignQuestions>();
			
		for (CampaignQuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaignQuestions existe
			CampaignQuestions existingEntity = null;
			existingEntity = campaignQuestionsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignQuestions -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			campaignQuestionsRepository.saveAll((Iterable<CampaignQuestions>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete CampaignQuestions-----");
		return response;
	}

	/**
	 * get CampaignQuestions by using CampaignQuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignQuestionsDto> getByCriteria(Request<CampaignQuestionsDto> request, Locale locale)  throws Exception {
		log.info("----begin get CampaignQuestions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignQuestionsDto> response = new Response<CampaignQuestionsDto>();
		List<CampaignQuestions> items 			 = campaignQuestionsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignQuestionsTransformer.INSTANCE.toLiteDtos(items) : CampaignQuestionsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(campaignQuestionsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaignQuestions", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get CampaignQuestions-----");
		return response;
	}

	/**
	 * get full CampaignQuestionsDto by using CampaignQuestions as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CampaignQuestionsDto getFullInfos(CampaignQuestionsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CampaignQuestionsDto> custom(Request<CampaignQuestionsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CampaignQuestionsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignQuestionsDto> response = new Response<CampaignQuestionsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CampaignQuestionsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CampaignQuestionsDto-----");
		return response;
	}
}
