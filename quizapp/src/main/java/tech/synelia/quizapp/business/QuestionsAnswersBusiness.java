                                                											
/*
 * Java business for entity table questions_answers 
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
import tech.synelia.quizapp.dao.entity.QuestionsAnswers;
import tech.synelia.quizapp.dao.entity.Questions;
import tech.synelia.quizapp.dao.entity.Answers;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "questions_answers"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class QuestionsAnswersBusiness implements IBasicBusiness<Request<QuestionsAnswersDto>, Response<QuestionsAnswersDto>> {

	private Response<QuestionsAnswersDto> response;
	@Autowired
	private QuestionsAnswersRepository questionsAnswersRepository;
	@Autowired
	private QuestionsRepository questionsRepository;
	@Autowired
	private CandidateAnswersRepository candidateAnswersRepository;
	@Autowired
	private AnswersRepository answersRepository;
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

	public QuestionsAnswersBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create QuestionsAnswers by using QuestionsAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsAnswersDto> create(Request<QuestionsAnswersDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create QuestionsAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsAnswersDto> response = new Response<QuestionsAnswersDto>();
		List<QuestionsAnswers>        items    = new ArrayList<QuestionsAnswers>();
			
		for (QuestionsAnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("isCorrect", dto.getIsCorrect());
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("questionId", dto.getQuestionId());
			fieldsToVerify.put("answerId", dto.getAnswerId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if questionsAnswers to insert do not exist
			QuestionsAnswers existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("questionsAnswers id -> " + dto.getId(), locale));
			}

			// Verify if questions exist
			Questions existingQuestions = null;
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0){
				existingQuestions = questionsRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestions == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questions questionId -> " + dto.getQuestionId(), locale));
				}
			}
			// Verify if answers exist
			Answers existingAnswers = null;
			if (dto.getAnswerId() != null && dto.getAnswerId() > 0){
				existingAnswers = answersRepository.findOne(dto.getAnswerId(), false);
				if (existingAnswers == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answers answerId -> " + dto.getAnswerId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			QuestionsAnswers entityToSave = null;
			entityToSave = QuestionsAnswersTransformer.INSTANCE.toEntity(dto, existingQuestions, existingAnswers);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<QuestionsAnswers> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = questionsAnswersRepository.saveAll((Iterable<QuestionsAnswers>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("questionsAnswers", locale));
			}
			List<QuestionsAnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsAnswersTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionsAnswersTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create QuestionsAnswers-----");
		return response;
	}

	/**
	 * update QuestionsAnswers by using QuestionsAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsAnswersDto> update(Request<QuestionsAnswersDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update QuestionsAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsAnswersDto> response = new Response<QuestionsAnswersDto>();
		List<QuestionsAnswers>        items    = new ArrayList<QuestionsAnswers>();
			
		for (QuestionsAnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la questionsAnswers existe
			QuestionsAnswers entityToSave = null;
			entityToSave = questionsAnswersRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questionsAnswers id -> " + dto.getId(), locale));
			}

			// Verify if questions exist
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0){
				Questions existingQuestions = questionsRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestions == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questions questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestions(existingQuestions);
			}
			// Verify if answers exist
			if (dto.getAnswerId() != null && dto.getAnswerId() > 0){
				Answers existingAnswers = answersRepository.findOne(dto.getAnswerId(), false);
				if (existingAnswers == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answers answerId -> " + dto.getAnswerId(), locale));
				}
				entityToSave.setAnswers(existingAnswers);
			}
			if (dto.getIsCorrect() != null) {
				entityToSave.setIsCorrect(dto.getIsCorrect());
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
			List<QuestionsAnswers> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = questionsAnswersRepository.saveAll((Iterable<QuestionsAnswers>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("questionsAnswers", locale));
			}
			List<QuestionsAnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsAnswersTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionsAnswersTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update QuestionsAnswers-----");
		return response;
	}

	/**
	 * delete QuestionsAnswers by using QuestionsAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsAnswersDto> delete(Request<QuestionsAnswersDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete QuestionsAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsAnswersDto> response = new Response<QuestionsAnswersDto>();
		List<QuestionsAnswers>        items    = new ArrayList<QuestionsAnswers>();
			
		for (QuestionsAnswersDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la questionsAnswers existe
			QuestionsAnswers existingEntity = null;
			existingEntity = questionsAnswersRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questionsAnswers -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// candidateAnswers
			List<CandidateAnswers> listOfCandidateAnswers = candidateAnswersRepository.findByQuestionsAnswersId(existingEntity.getId(), false);
			if (listOfCandidateAnswers != null && !listOfCandidateAnswers.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateAnswers.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			questionsAnswersRepository.saveAll((Iterable<QuestionsAnswers>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete QuestionsAnswers-----");
		return response;
	}

	/**
	 * get QuestionsAnswers by using QuestionsAnswersDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsAnswersDto> getByCriteria(Request<QuestionsAnswersDto> request, Locale locale)  throws Exception {
		log.info("----begin get QuestionsAnswers-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsAnswersDto> response = new Response<QuestionsAnswersDto>();
		List<QuestionsAnswers> items 			 = questionsAnswersRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<QuestionsAnswersDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsAnswersTransformer.INSTANCE.toLiteDtos(items) : QuestionsAnswersTransformer.INSTANCE.toDtos(items);

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
			response.setCount(questionsAnswersRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("questionsAnswers", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get QuestionsAnswers-----");
		return response;
	}

	/**
	 * get full QuestionsAnswersDto by using QuestionsAnswers as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public QuestionsAnswersDto getFullInfos(QuestionsAnswersDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<QuestionsAnswersDto> custom(Request<QuestionsAnswersDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom QuestionsAnswersDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsAnswersDto> response = new Response<QuestionsAnswersDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new QuestionsAnswersDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom QuestionsAnswersDto-----");
		return response;
	}
}
