                                            										
/*
 * Java business for entity table source_token 
 * Created on 2025-08-22 ( Time 11:38:28 )
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
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "source_token"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class SourceTokenBusiness implements IBasicBusiness<Request<SourceTokenDto>, Response<SourceTokenDto>> {

	private Response<SourceTokenDto> response;
	@Autowired
	private SourceTokenRepository sourceTokenRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
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

	public SourceTokenBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> create(Request<SourceTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("tokenString", dto.getTokenString());
			fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("campaignId", dto.getCampaignId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if sourceToken to insert do not exist
			SourceToken existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken id -> " + dto.getId(), locale));
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

			SourceToken entityToSave = null;
			entityToSave = SourceTokenTransformer.INSTANCE.toEntity(dto, existingCampaigns);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<SourceToken> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = sourceTokenRepository.saveAll((Iterable<SourceToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("sourceToken", locale));
			}
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : SourceTokenTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create SourceToken-----");
		return response;
	}

	/**
	 * update SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> update(Request<SourceTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la sourceToken existe
			SourceToken entityToSave = null;
			entityToSave = sourceTokenRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken id -> " + dto.getId(), locale));
			}

			// Verify if campaigns exist
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
			}
			if (Utilities.notBlank(dto.getTokenString())) {
				entityToSave.setTokenString(dto.getTokenString());
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
			List<SourceToken> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = sourceTokenRepository.saveAll((Iterable<SourceToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("sourceToken", locale));
			}
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : SourceTokenTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update SourceToken-----");
		return response;
	}

	/**
	 * delete SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> delete(Request<SourceTokenDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la sourceToken existe
			SourceToken existingEntity = null;
			existingEntity = sourceTokenRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// applications
			List<Applications> listOfApplications = applicationsRepository.findBySourceTokenId(existingEntity.getId(), false);
			if (listOfApplications != null && !listOfApplications.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfApplications.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			sourceTokenRepository.saveAll((Iterable<SourceToken>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete SourceToken-----");
		return response;
	}

	/**
	 * get SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> getByCriteria(Request<SourceTokenDto> request, Locale locale)  throws Exception {
		log.info("----begin get SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken> items 			 = sourceTokenRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(items) : SourceTokenTransformer.INSTANCE.toDtos(items);

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
			response.setCount(sourceTokenRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("sourceToken", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get SourceToken-----");
		return response;
	}

	/**
	 * get full SourceTokenDto by using SourceToken as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public SourceTokenDto getFullInfos(SourceTokenDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<SourceTokenDto> custom(Request<SourceTokenDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom SourceTokenDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new SourceTokenDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom SourceTokenDto-----");
		return response;
	}
}
