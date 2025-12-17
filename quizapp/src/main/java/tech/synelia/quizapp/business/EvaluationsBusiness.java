                                                											
/*
 * Java business for entity table evaluations 
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
import tech.synelia.quizapp.dao.entity.Evaluations;
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "evaluations"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class EvaluationsBusiness implements IBasicBusiness<Request<EvaluationsDto>, Response<EvaluationsDto>> {

	private Response<EvaluationsDto> response;
	@Autowired
	private EvaluationsRepository evaluationsRepository;
	@Autowired
	private CandidateInterviewRepository candidateInterviewRepository;
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

	public EvaluationsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> create(Request<EvaluationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations>        items    = new ArrayList<Evaluations>();
			
		for (EvaluationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("candidateMark", dto.getCandidateMark());
			fieldsToVerify.put("recruiterComment", dto.getRecruiterComment());
			fieldsToVerify.put("candidateInterviewId", dto.getCandidateInterviewId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if evaluations to insert do not exist
			Evaluations existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("evaluations id -> " + dto.getId(), locale));
			}

			// Verify if candidateInterview exist
			CandidateInterview existingCandidateInterview = null;
			if (dto.getCandidateInterviewId() != null && dto.getCandidateInterviewId() > 0){
				existingCandidateInterview = candidateInterviewRepository.findOne(dto.getCandidateInterviewId(), false);
				if (existingCandidateInterview == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview candidateInterviewId -> " + dto.getCandidateInterviewId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Evaluations entityToSave = null;
			entityToSave = EvaluationsTransformer.INSTANCE.toEntity(dto, existingCandidateInterview);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Evaluations> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = evaluationsRepository.saveAll((Iterable<Evaluations>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("evaluations", locale));
			}
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : EvaluationsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Evaluations-----");
		return response;
	}

	/**
	 * update Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> update(Request<EvaluationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations>        items    = new ArrayList<Evaluations>();
			
		for (EvaluationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la evaluations existe
			Evaluations entityToSave = null;
			entityToSave = evaluationsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("evaluations id -> " + dto.getId(), locale));
			}

			// Verify if candidateInterview exist
			if (dto.getCandidateInterviewId() != null && dto.getCandidateInterviewId() > 0){
				CandidateInterview existingCandidateInterview = candidateInterviewRepository.findOne(dto.getCandidateInterviewId(), false);
				if (existingCandidateInterview == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview candidateInterviewId -> " + dto.getCandidateInterviewId(), locale));
				}
				entityToSave.setCandidateInterview(existingCandidateInterview);
			}
			if (dto.getCandidateMark() != null && dto.getCandidateMark() > 0) {
				entityToSave.setCandidateMark(dto.getCandidateMark());
			}
			if (Utilities.notBlank(dto.getRecruiterComment())) {
				entityToSave.setRecruiterComment(dto.getRecruiterComment());
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
			List<Evaluations> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = evaluationsRepository.saveAll((Iterable<Evaluations>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("evaluations", locale));
			}
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : EvaluationsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Evaluations-----");
		return response;
	}

	/**
	 * delete Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> delete(Request<EvaluationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations>        items    = new ArrayList<Evaluations>();
			
		for (EvaluationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la evaluations existe
			Evaluations existingEntity = null;
			existingEntity = evaluationsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("evaluations -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			evaluationsRepository.saveAll((Iterable<Evaluations>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Evaluations-----");
		return response;
	}

	/**
	 * get Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> getByCriteria(Request<EvaluationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations> items 			 = evaluationsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(items) : EvaluationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(evaluationsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("evaluations", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Evaluations-----");
		return response;
	}

	/**
	 * get ALL Evaluations by using EvaluationsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<EvaluationsDto> getAllByCriteria(Request<EvaluationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Evaluations (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations> items 			 = evaluationsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(items) : EvaluationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(evaluationsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("evaluations", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Evaluations-----");
		return response;
	}

	/**
	 * get full EvaluationsDto by using Evaluations as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public EvaluationsDto getFullInfos(EvaluationsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<EvaluationsDto> custom(Request<EvaluationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom EvaluationsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new EvaluationsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom EvaluationsDto-----");
		return response;
	}
}
