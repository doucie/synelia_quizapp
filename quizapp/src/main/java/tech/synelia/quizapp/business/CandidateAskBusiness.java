                                                                															
/*
 * Java business for entity table candidate_ask 
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
import tech.synelia.quizapp.dao.entity.CandidateAsk;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "candidate_ask"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CandidateAskBusiness implements IBasicBusiness<Request<CandidateAskDto>, Response<CandidateAskDto>> {

	private Response<CandidateAskDto> response;
	@Autowired
	private CandidateAskRepository candidateAskRepository;
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

	public CandidateAskBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create CandidateAsk by using CandidateAskDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAskDto> create(Request<CandidateAskDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create CandidateAsk-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		List<CandidateAsk>        items    = new ArrayList<CandidateAsk>();
			
		for (CandidateAskDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("requestType", dto.getRequestType());
			fieldsToVerify.put("isVerified", dto.getIsVerified());
			fieldsToVerify.put("firstName", dto.getFirstName());
			fieldsToVerify.put("lastName", dto.getLastName());
			fieldsToVerify.put("newEmail", dto.getNewEmail());
			fieldsToVerify.put("newPhone", dto.getNewPhone());
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("applicationId", dto.getApplicationId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if candidateAsk to insert do not exist
			CandidateAsk existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("candidateAsk id -> " + dto.getId(), locale));
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

			CandidateAsk entityToSave = null;
			entityToSave = CandidateAskTransformer.INSTANCE.toEntity(dto, existingApplications);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateAsk> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = candidateAskRepository.saveAll((Iterable<CandidateAsk>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAsk", locale));
			}
			List<CandidateAskDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAskTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAskTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CandidateAsk-----");
		return response;
	}

	/**
	 * update CandidateAsk by using CandidateAskDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAskDto> update(Request<CandidateAskDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update CandidateAsk-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		List<CandidateAsk>        items    = new ArrayList<CandidateAsk>();
			
		for (CandidateAskDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateAsk existe
			CandidateAsk entityToSave = null;
			entityToSave = candidateAskRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAsk id -> " + dto.getId(), locale));
			}

			// Verify if applications exist
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			if (Utilities.notBlank(dto.getRequestType())) {
				entityToSave.setRequestType(dto.getRequestType());
			}
			if (dto.getIsVerified() != null) {
				entityToSave.setIsVerified(dto.getIsVerified());
			}
			if (Utilities.notBlank(dto.getFirstName())) {
				entityToSave.setFirstName(dto.getFirstName());
			}
			if (Utilities.notBlank(dto.getLastName())) {
				entityToSave.setLastName(dto.getLastName());
			}
			if (Utilities.notBlank(dto.getNewEmail())) {
				entityToSave.setNewEmail(dto.getNewEmail());
			}
			if (Utilities.notBlank(dto.getNewPhone())) {
				entityToSave.setNewPhone(dto.getNewPhone());
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
			List<CandidateAsk> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = candidateAskRepository.saveAll((Iterable<CandidateAsk>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAsk", locale));
			}
			List<CandidateAskDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAskTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAskTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CandidateAsk-----");
		return response;
	}

	/**
	 * delete CandidateAsk by using CandidateAskDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAskDto> delete(Request<CandidateAskDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CandidateAsk-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		List<CandidateAsk>        items    = new ArrayList<CandidateAsk>();
			
		for (CandidateAskDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la candidateAsk existe
			CandidateAsk existingEntity = null;
			existingEntity = candidateAskRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAsk -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			candidateAskRepository.saveAll((Iterable<CandidateAsk>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete CandidateAsk-----");
		return response;
	}

	/**
	 * get CandidateAsk by using CandidateAskDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CandidateAskDto> getByCriteria(Request<CandidateAskDto> request, Locale locale)  throws Exception {
		log.info("----begin get CandidateAsk-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		List<CandidateAsk> items 			 = candidateAskRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateAskDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAskTransformer.INSTANCE.toLiteDtos(items) : CandidateAskTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateAskRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateAsk", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get CandidateAsk-----");
		return response;
	}

	/**
	 * get full CandidateAskDto by using CandidateAsk as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CandidateAskDto getFullInfos(CandidateAskDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CandidateAskDto> custom(Request<CandidateAskDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CandidateAskDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CandidateAskDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CandidateAskDto-----");
		return response;
	}
}
