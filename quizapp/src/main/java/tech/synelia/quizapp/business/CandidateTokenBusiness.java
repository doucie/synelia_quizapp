                                            										
/*
 * Java business for entity table candidate_token 
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
import tech.synelia.quizapp.dao.entity.CandidateToken;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "candidate_token"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CandidateTokenBusiness implements IBasicBusiness<Request<CandidateTokenDto>, Response<CandidateTokenDto>> {

	private Response<CandidateTokenDto> response;
	@Autowired
	private CandidateTokenRepository candidateTokenRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
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

	public CandidateTokenBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create CandidateToken by using CandidateTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateTokenDto> create(Request<CandidateTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create CandidateToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
		List<CandidateToken>        items    = new ArrayList<CandidateToken>();
			
		for (CandidateTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("tokenString", dto.getTokenString());
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("applicationId", dto.getApplicationId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if candidateToken to insert do not exist
			CandidateToken existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("candidateToken id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			Applications existingApplications = null;
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			CandidateToken entityToSave = null;
			entityToSave = CandidateTokenTransformer.INSTANCE.toEntity(dto, existingApplications);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateToken> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = candidateTokenRepository.saveAll((Iterable<CandidateToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateToken", locale));
			}
			List<CandidateTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateTokenTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CandidateToken-----");
		return response;
	}

	/**
	 * update CandidateToken by using CandidateTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateTokenDto> update(Request<CandidateTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update CandidateToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
		List<CandidateToken>        items    = new ArrayList<CandidateToken>();
			
		for (CandidateTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateToken existe
			CandidateToken entityToSave = null;
			entityToSave = candidateTokenRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateToken id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			if (Utilities.shouldUpdate(dto.getTokenString())) {
				entityToSave.setTokenString(dto.getTokenString());
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.shouldUpdate(dto.getSearchString())) {
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
			List<CandidateToken> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = candidateTokenRepository.saveAll((Iterable<CandidateToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateToken", locale));
			}
			List<CandidateTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateTokenTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CandidateToken-----");
		return response;
	}

	/**
	 * delete CandidateToken by using CandidateTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateTokenDto> delete(Request<CandidateTokenDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CandidateToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
		List<CandidateToken>        items    = new ArrayList<CandidateToken>();
			
		for (CandidateTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateToken existe
			CandidateToken existingEntity = null;
			existingEntity = candidateTokenRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateToken -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			candidateTokenRepository.saveAll((Iterable<CandidateToken>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete CandidateToken-----");
		return response;
	}

	/**
	 * get CandidateToken by using CandidateTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateTokenDto> getByCriteria(Request<CandidateTokenDto> request, Locale locale)  throws Exception {
		log.info("----begin get CandidateToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
		List<CandidateToken> items 			 = candidateTokenRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateTokenTransformer.INSTANCE.toLiteDtos(items) : CandidateTokenTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateTokenRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateToken", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get CandidateToken-----");
		return response;
	}

	/**
	 * get ALL CandidateToken by using CandidateTokenDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CandidateTokenDto> getAllByCriteria(Request<CandidateTokenDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL CandidateToken (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
		List<CandidateToken> items 			 = candidateTokenRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateTokenTransformer.INSTANCE.toLiteDtos(items) : CandidateTokenTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateTokenRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateToken", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL CandidateToken-----");
		return response;
	}

	/**
	 * get full CandidateTokenDto by using CandidateToken as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CandidateTokenDto getFullInfos(CandidateTokenDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CandidateTokenDto> custom(Request<CandidateTokenDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CandidateTokenDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CandidateTokenDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CandidateTokenDto-----");
		return response;
	}
}
