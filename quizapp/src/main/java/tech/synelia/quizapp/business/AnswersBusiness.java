                                        									
/*
 * Java business for entity table answers 
 * Created on 2025-08-22 ( Time 11:38:23 )
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
import tech.synelia.quizapp.dao.entity.Answers;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "answers"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class AnswersBusiness implements IBasicBusiness<Request<AnswersDto>, Response<AnswersDto>> {

	private Response<AnswersDto> response;
	@Autowired
	private AnswersRepository answersRepository;
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

	public AnswersBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Answers by using AnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<AnswersDto> create(Request<AnswersDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Answers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<AnswersDto> response = new Response<AnswersDto>();
		List<Answers>        items    = new ArrayList<Answers>();
			
		for (AnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("answerContent", dto.getAnswerContent());
			fieldsToVerify.put("searchString", dto.getSearchString());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if answers to insert do not exist
			Answers existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("answers id -> " + dto.getId(), locale));
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Answers entityToSave = null;
			entityToSave = AnswersTransformer.INSTANCE.toEntity(dto);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Answers> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = answersRepository.saveAll((Iterable<Answers>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("answers", locale));
			}
			List<AnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswersTransformer.INSTANCE.toLiteDtos(itemsSaved) : AnswersTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Answers-----");
		return response;
	}

	/**
	 * update Answers by using AnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<AnswersDto> update(Request<AnswersDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Answers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<AnswersDto> response = new Response<AnswersDto>();
		List<Answers>        items    = new ArrayList<Answers>();
			
		for (AnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la answers existe
			Answers entityToSave = null;
			entityToSave = answersRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answers id -> " + dto.getId(), locale));
			}

			if (Utilities.notBlank(dto.getAnswerContent())) {
				entityToSave.setAnswerContent(dto.getAnswerContent());
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
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Answers> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = answersRepository.saveAll((Iterable<Answers>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("answers", locale));
			}
			List<AnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswersTransformer.INSTANCE.toLiteDtos(itemsSaved) : AnswersTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Answers-----");
		return response;
	}

	/**
	 * delete Answers by using AnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<AnswersDto> delete(Request<AnswersDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Answers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<AnswersDto> response = new Response<AnswersDto>();
		List<Answers>        items    = new ArrayList<Answers>();
			
		for (AnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la answers existe
			Answers existingEntity = null;
			existingEntity = answersRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answers -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// questionsAnswers
			List<QuestionsAnswers> listOfQuestionsAnswers = questionsAnswersRepository.findByAnswerId(existingEntity.getId(), false);
			if (listOfQuestionsAnswers != null && !listOfQuestionsAnswers.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfQuestionsAnswers.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			answersRepository.saveAll((Iterable<Answers>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Answers-----");
		return response;
	}

	/**
	 * get Answers by using AnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<AnswersDto> getByCriteria(Request<AnswersDto> request, Locale locale)  throws Exception {
		log.info("----begin get Answers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<AnswersDto> response = new Response<AnswersDto>();
		List<Answers> items 			 = answersRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<AnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswersTransformer.INSTANCE.toLiteDtos(items) : AnswersTransformer.INSTANCE.toDtos(items);

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
			response.setCount(answersRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("answers", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Answers-----");
		return response;
	}

	/**
	 * get full AnswersDto by using Answers as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public AnswersDto getFullInfos(AnswersDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<AnswersDto> custom(Request<AnswersDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom AnswersDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<AnswersDto> response = new Response<AnswersDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new AnswersDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom AnswersDto-----");
		return response;
	}
}
