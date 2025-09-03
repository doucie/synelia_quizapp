                                            										
/*
 * Java business for entity table candidate_answers 
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
import tech.synelia.quizapp.dao.entity.CandidateAnswers;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.QuestionsAnswers;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "candidate_answers"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CandidateAnswersBusiness implements IBasicBusiness<Request<CandidateAnswersDto>, Response<CandidateAnswersDto>> {

	private Response<CandidateAnswersDto> response;
	@Autowired
	private CandidateAnswersRepository candidateAnswersRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private QuestionsAnswersRepository questionsAnswersRepository;
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

	public CandidateAnswersBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create CandidateAnswers by using CandidateAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAnswersDto> create(Request<CandidateAnswersDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create CandidateAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAnswersDto> response = new Response<CandidateAnswersDto>();
		List<CandidateAnswers>        items    = new ArrayList<CandidateAnswers>();
			
		for (CandidateAnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("questionsAnswersId", dto.getQuestionsAnswersId());
			fieldsToVerify.put("applicationId", dto.getApplicationId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if candidateAnswers to insert do not exist
			CandidateAnswers existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("candidateAnswers id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			Applications existingApplications = null;
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
			}
			// Verify if questionsAnswers exist
			QuestionsAnswers existingQuestionsAnswers = null;
			if (dto.getQuestionsAnswersId() != null && dto.getQuestionsAnswersId() > 0){
				existingQuestionsAnswers = questionsAnswersRepository.findOne(dto.getQuestionsAnswersId(), false);
				if (existingQuestionsAnswers == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questionsAnswers questionsAnswersId -> " + dto.getQuestionsAnswersId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			CandidateAnswers entityToSave = null;
			entityToSave = CandidateAnswersTransformer.INSTANCE.toEntity(dto, existingApplications, existingQuestionsAnswers);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateAnswers> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = candidateAnswersRepository.saveAll((Iterable<CandidateAnswers>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAnswers", locale));
			}
			List<CandidateAnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswersTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAnswersTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CandidateAnswers-----");
		return response;
	}

	/**
	 * update CandidateAnswers by using CandidateAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAnswersDto> update(Request<CandidateAnswersDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update CandidateAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAnswersDto> response = new Response<CandidateAnswersDto>();
		List<CandidateAnswers>        items    = new ArrayList<CandidateAnswers>();
			
		for (CandidateAnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateAnswers existe
			CandidateAnswers entityToSave = null;
			entityToSave = candidateAnswersRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswers id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			// Verify if questionsAnswers exist
			if (dto.getQuestionsAnswersId() != null && dto.getQuestionsAnswersId() > 0){
				QuestionsAnswers existingQuestionsAnswers = questionsAnswersRepository.findOne(dto.getQuestionsAnswersId(), false);
				if (existingQuestionsAnswers == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questionsAnswers questionsAnswersId -> " + dto.getQuestionsAnswersId(), locale));
				}
				entityToSave.setQuestionsAnswers(existingQuestionsAnswers);
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
			List<CandidateAnswers> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = candidateAnswersRepository.saveAll((Iterable<CandidateAnswers>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAnswers", locale));
			}
			List<CandidateAnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswersTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAnswersTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CandidateAnswers-----");
		return response;
	}

	/**
	 * delete CandidateAnswers by using CandidateAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAnswersDto> delete(Request<CandidateAnswersDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CandidateAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAnswersDto> response = new Response<CandidateAnswersDto>();
		List<CandidateAnswers>        items    = new ArrayList<CandidateAnswers>();
			
		for (CandidateAnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateAnswers existe
			CandidateAnswers existingEntity = null;
			existingEntity = candidateAnswersRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswers -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			candidateAnswersRepository.saveAll((Iterable<CandidateAnswers>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete CandidateAnswers-----");
		return response;
	}

	/**
	 * get CandidateAnswers by using CandidateAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAnswersDto> getByCriteria(Request<CandidateAnswersDto> request, Locale locale)  throws Exception {
		log.info("----begin get CandidateAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAnswersDto> response = new Response<CandidateAnswersDto>();
		List<CandidateAnswers> items 			 = candidateAnswersRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateAnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswersTransformer.INSTANCE.toLiteDtos(items) : CandidateAnswersTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateAnswersRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateAnswers", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get CandidateAnswers-----");
		return response;
	}

	/**
	 * get full CandidateAnswersDto by using CandidateAnswers as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CandidateAnswersDto getFullInfos(CandidateAnswersDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CandidateAnswersDto> custom(Request<CandidateAnswersDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CandidateAnswersDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAnswersDto> response = new Response<CandidateAnswersDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CandidateAnswersDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CandidateAnswersDto-----");
		return response;
	}
}
