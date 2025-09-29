                                                											
/*
 * Java business for entity table questions 
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
import tech.synelia.quizapp.dao.entity.Questions;
import tech.synelia.quizapp.dao.entity.Specialities;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "questions"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class QuestionsBusiness implements IBasicBusiness<Request<QuestionsDto>, Response<QuestionsDto>> {

	private Response<QuestionsDto> response;
	@Autowired
	private QuestionsRepository questionsRepository;
	@Autowired
	private QuestionsAnswersRepository questionsAnswersRepository;
	@Autowired
	private CampaignQuestionsRepository campaignQuestionsRepository;
	@Autowired
	private SpecialitiesRepository specialitiesRepository;
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

	public QuestionsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Questions by using QuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsDto> create(Request<QuestionsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Questions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		List<Questions>        items    = new ArrayList<Questions>();
			
		for (QuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("questionContent", dto.getQuestionContent());
			fieldsToVerify.put("questionChrono", dto.getQuestionChrono());
			// fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("specialityId", dto.getSpecialityId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if questions to insert do not exist
			Questions existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("questions id -> " + dto.getId(), locale));
			}

			// Verify if specialities exist
			Specialities existingSpecialities = null;
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Questions entityToSave = null;
			entityToSave = QuestionsTransformer.INSTANCE.toEntity(dto, existingSpecialities);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Questions> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = questionsRepository.saveAll((Iterable<Questions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("questions", locale));
			}
			List<QuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Questions-----");
		return response;
	}

	/**
	 * update Questions by using QuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsDto> update(Request<QuestionsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Questions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		List<Questions>        items    = new ArrayList<Questions>();
			
		for (QuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la questions existe
			Questions entityToSave = null;
			entityToSave = questionsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questions id -> " + dto.getId(), locale));
			}

			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.notBlank(dto.getQuestionContent())) {
				entityToSave.setQuestionContent(dto.getQuestionContent());
			}
			if (dto.getQuestionChrono() != null && dto.getQuestionChrono() > 0) {
				entityToSave.setQuestionChrono(dto.getQuestionChrono());
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
			List<Questions> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = questionsRepository.saveAll((Iterable<Questions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("questions", locale));
			}
			List<QuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Questions-----");
		return response;
	}

	/**
	 * delete Questions by using QuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsDto> delete(Request<QuestionsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Questions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		List<Questions>        items    = new ArrayList<Questions>();
			
		for (QuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la questions existe
			Questions existingEntity = null;
			existingEntity = questionsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("questions -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// questionsAnswers
			List<QuestionsAnswers> listOfQuestionsAnswers = questionsAnswersRepository.findByQuestionId(existingEntity.getId(), false);
			if (listOfQuestionsAnswers != null && !listOfQuestionsAnswers.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfQuestionsAnswers.size() + ")", locale));
			}
			// campaignQuestions
			List<CampaignQuestions> listOfCampaignQuestions = campaignQuestionsRepository.findByQuestionId(existingEntity.getId(), false);
			if (listOfCampaignQuestions != null && !listOfCampaignQuestions.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCampaignQuestions.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			questionsRepository.saveAll((Iterable<Questions>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Questions-----");
		return response;
	}

	/**
	 * get Questions by using QuestionsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<QuestionsDto> getByCriteria(Request<QuestionsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Questions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		List<Questions> items 			 = questionsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<QuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsTransformer.INSTANCE.toLiteDtos(items) : QuestionsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(questionsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("questions", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Questions-----");
		return response;
	}

	/**
	 * get ALL Questions by using QuestionsDto as object (including deleted).
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	public Response<QuestionsDto> getAllByCriteria(Request<QuestionsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Questions (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		List<Questions> items 			 = questionsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<QuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsTransformer.INSTANCE.toLiteDtos(items) : QuestionsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(questionsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("questions", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Questions (including deleted)-----");
		return response;
	}

	/**
	 * get full QuestionsDto by using Questions as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public QuestionsDto getFullInfos(QuestionsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	/**
	 * updateAll Questions by using QuestionsDto as object (including deleted questions).
	 * 
	 * @param request
	 * @return response
	 */
	public Response<QuestionsDto> updateAll(Request<QuestionsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Questions-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		List<Questions>        items    = new ArrayList<Questions>();
			
		for (QuestionsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la donnee existe
			Questions existingEntity = null;
			// Pour updateAll, chercher d'abord les questions actives, puis les supprimées
			existingEntity = questionsRepository.findOne(dto.getId(), false); // Chercher d'abord les actives
			if (existingEntity == null) {
				existingEntity = questionsRepository.findOne(dto.getId(), true); // Puis les supprimées si pas trouvé
			}
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// -----------------------------------------------------------------------
			// ----------- GENERATION KEY
			// -----------------------------------------------------------------------

			// -----------------------------------------------------------------------
			// ----------- PREPARATION DE L'OBJET
			// -----------------------------------------------------------------------
			// Garder les données existantes de base
			Questions entityToSave = existingEntity;
			
			// Mise à jour conditionnelle des champs
			if (Utilities.notBlank(dto.getQuestionContent())) {
				entityToSave.setQuestionContent(dto.getQuestionContent());
			}
			if (dto.getQuestionChrono() != null) {
				entityToSave.setQuestionChrono(dto.getQuestionChrono());
			}
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0) {
				Specialities speciality = new Specialities();
				speciality.setId(dto.getSpecialityId());
				entityToSave.setSpecialities(speciality);
			}
			// IMPORTANT: Gestion du champ isDeleted pour updateAll
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
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
			List<Questions> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = questionsRepository.saveAll((Iterable<Questions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("question", locale));
			}
			List<QuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end updateAll Questions-----");
		return response;
	}

	public Response<QuestionsDto> custom(Request<QuestionsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom QuestionsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<QuestionsDto> response = new Response<QuestionsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new QuestionsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom QuestionsDto-----");
		return response;
	}
}
