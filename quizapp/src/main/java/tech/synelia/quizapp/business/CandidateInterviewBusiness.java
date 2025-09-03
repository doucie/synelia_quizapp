                                                    												
/*
 * Java business for entity table candidate_interview 
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
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "candidate_interview"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CandidateInterviewBusiness implements IBasicBusiness<Request<CandidateInterviewDto>, Response<CandidateInterviewDto>> {

	private Response<CandidateInterviewDto> response;
	@Autowired
	private CandidateInterviewRepository candidateInterviewRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private EvaluationsRepository evaluationsRepository;
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

	public CandidateInterviewBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create CandidateInterview by using CandidateInterviewDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateInterviewDto> create(Request<CandidateInterviewDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create CandidateInterview-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateInterviewDto> response = new Response<CandidateInterviewDto>();
		List<CandidateInterview>        items    = new ArrayList<CandidateInterview>();
			
		for (CandidateInterviewDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("interviewStart", dto.getInterviewStart());
			fieldsToVerify.put("interviewDuration", dto.getInterviewDuration());
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("applicationId", dto.getApplicationId());
			fieldsToVerify.put("interviewId", dto.getInterviewId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if candidateInterview to insert do not exist
			CandidateInterview existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("candidateInterview id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			Applications existingApplications = null;
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
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

			CandidateInterview entityToSave = null;
			entityToSave = CandidateInterviewTransformer.INSTANCE.toEntity(dto, existingApplications, existingInterviews);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateInterview> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = candidateInterviewRepository.saveAll((Iterable<CandidateInterview>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateInterview", locale));
			}
			List<CandidateInterviewDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateInterviewTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateInterviewTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CandidateInterview-----");
		return response;
	}

	/**
	 * update CandidateInterview by using CandidateInterviewDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateInterviewDto> update(Request<CandidateInterviewDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update CandidateInterview-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateInterviewDto> response = new Response<CandidateInterviewDto>();
		List<CandidateInterview>        items    = new ArrayList<CandidateInterview>();
			
		for (CandidateInterviewDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateInterview existe
			CandidateInterview entityToSave = null;
			entityToSave = candidateInterviewRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			// Verify if interviews exist
			if (dto.getInterviewId() != null && dto.getInterviewId() > 0){
				Interviews existingInterviews = interviewsRepository.findOne(dto.getInterviewId(), false);
				if (existingInterviews == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews interviewId -> " + dto.getInterviewId(), locale));
				}
				entityToSave.setInterviews(existingInterviews);
			}
			if (Utilities.notBlank(dto.getInterviewStart())) {
				entityToSave.setInterviewStart(dateFormat.parse(dto.getInterviewStart()));
			}
			if (dto.getInterviewDuration() != null && dto.getInterviewDuration() > 0) {
				entityToSave.setInterviewDuration(dto.getInterviewDuration());
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
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateInterview> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = candidateInterviewRepository.saveAll((Iterable<CandidateInterview>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateInterview", locale));
			}
			List<CandidateInterviewDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateInterviewTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateInterviewTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CandidateInterview-----");
		return response;
	}

	/**
	 * delete CandidateInterview by using CandidateInterviewDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateInterviewDto> delete(Request<CandidateInterviewDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CandidateInterview-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateInterviewDto> response = new Response<CandidateInterviewDto>();
		List<CandidateInterview>        items    = new ArrayList<CandidateInterview>();
			
		for (CandidateInterviewDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateInterview existe
			CandidateInterview existingEntity = null;
			existingEntity = candidateInterviewRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// evaluations
			List<Evaluations> listOfEvaluations = evaluationsRepository.findByCandidateInterviewId(existingEntity.getId(), false);
			if (listOfEvaluations != null && !listOfEvaluations.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfEvaluations.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			candidateInterviewRepository.saveAll((Iterable<CandidateInterview>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete CandidateInterview-----");
		return response;
	}

	/**
	 * get CandidateInterview by using CandidateInterviewDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateInterviewDto> getByCriteria(Request<CandidateInterviewDto> request, Locale locale)  throws Exception {
		log.info("----begin get CandidateInterview-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateInterviewDto> response = new Response<CandidateInterviewDto>();
		List<CandidateInterview> items 			 = candidateInterviewRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateInterviewDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateInterviewTransformer.INSTANCE.toLiteDtos(items) : CandidateInterviewTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateInterviewRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateInterview", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get CandidateInterview-----");
		return response;
	}

	/**
	 * get full CandidateInterviewDto by using CandidateInterview as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CandidateInterviewDto getFullInfos(CandidateInterviewDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CandidateInterviewDto> custom(Request<CandidateInterviewDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CandidateInterviewDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateInterviewDto> response = new Response<CandidateInterviewDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CandidateInterviewDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CandidateInterviewDto-----");
		return response;
	}
}
