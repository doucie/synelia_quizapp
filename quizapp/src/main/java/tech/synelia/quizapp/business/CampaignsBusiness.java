                                                                            																		
/*
 * Java business for entity table campaigns 
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
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "campaigns"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CampaignsBusiness implements IBasicBusiness<Request<CampaignsDto>, Response<CampaignsDto>> {

	private Response<CampaignsDto> response;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private CampaignCrudRepository campaignCrudRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private CampaignQuestionsRepository campaignQuestionsRepository;
	@Autowired
	private SpecialitiesRepository specialitiesRepository;
	@Autowired
	private InterviewsRepository interviewsRepository;
	@Autowired
	private SourceTokenRepository sourceTokenRepository;
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

	public CampaignsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> create(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
			
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("campaignTitle", dto.getCampaignTitle());
		// fieldsToVerify.put("campaignDesc", dto.getCampaignDesc());
		fieldsToVerify.put("campaignStatus", dto.getCampaignStatus());
		// fieldsToVerify.put("campaignStart", dto.getCampaignStart());
		// fieldsToVerify.put("campaignEnd", dto.getCampaignEnd());
		// fieldsToVerify.put("maxApply", dto.getMaxApply());
		fieldsToVerify.put("allCanEvaluate", dto.getAllCanEvaluate());
		fieldsToVerify.put("markedOutOf", dto.getMarkedOutOf());
		// fieldsToVerify.put("searchString", dto.getSearchString());
		fieldsToVerify.put("specialityId", dto.getSpecialityId());
		fieldsToVerify.put("creatorId", dto.getCreatorId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if campaigns to insert do not exist
			Campaigns existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			User existingUser = null;
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
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

			Campaigns entityToSave = null;
			entityToSave = CampaignsTransformer.INSTANCE.toEntity(dto, existingUser, existingSpecialities);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Campaigns> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Campaigns-----");
		return response;
	}

	/**
	 * update Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> update(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
			
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaigns existe
			Campaigns entityToSave = null;
			entityToSave = campaignsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				User existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.notBlank(dto.getCampaignTitle())) {
				entityToSave.setCampaignTitle(dto.getCampaignTitle());
			}
			if (Utilities.notBlank(dto.getCampaignDesc())) {
				entityToSave.setCampaignDesc(dto.getCampaignDesc());
			}
			if (Utilities.notBlank(dto.getCampaignStatus())) {
				entityToSave.setCampaignStatus(dto.getCampaignStatus());
			}
			if (Utilities.notBlank(dto.getCampaignStart())) {
				entityToSave.setCampaignStart(dateFormat.parse(dto.getCampaignStart()));
			}
			if (Utilities.notBlank(dto.getCampaignEnd())) {
				entityToSave.setCampaignEnd(dateFormat.parse(dto.getCampaignEnd()));
			}
			if (dto.getMaxApply() != null && dto.getMaxApply() > 0) {
				entityToSave.setMaxApply(dto.getMaxApply());
			}
			if (dto.getAllCanEvaluate() != null) {
				entityToSave.setAllCanEvaluate(dto.getAllCanEvaluate());
			}
			if (dto.getMarkedOutOf() != null && dto.getMarkedOutOf() > 0) {
				entityToSave.setMarkedOutOf(dto.getMarkedOutOf());
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
			List<Campaigns> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Campaigns-----");
		return response;
	}

	/**
	 * delete Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> delete(Request<CampaignsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
			
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaigns existe
			Campaigns existingEntity = null;
			existingEntity = campaignsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// campaignCrud
			List<CampaignCrud> listOfCampaignCrud = campaignCrudRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfCampaignCrud != null && !listOfCampaignCrud.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCampaignCrud.size() + ")", locale));
			}
			// campaignQuestions
			List<CampaignQuestions> listOfCampaignQuestions = campaignQuestionsRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfCampaignQuestions != null && !listOfCampaignQuestions.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCampaignQuestions.size() + ")", locale));
			}
			// interviews
			List<Interviews> listOfInterviews = interviewsRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfInterviews != null && !listOfInterviews.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfInterviews.size() + ")", locale));
			}
			// sourceToken
			List<SourceToken> listOfSourceToken = sourceTokenRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfSourceToken != null && !listOfSourceToken.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfSourceToken.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			campaignsRepository.saveAll((Iterable<Campaigns>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Campaigns-----");
		return response;
	}

	/**
	 * get Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> getByCriteria(Request<CampaignsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns> items 			 = campaignsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(items) : CampaignsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(campaignsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaigns", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Campaigns-----");
		return response;
	}

	/**
	 * get ALL Campaigns by using CampaignsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CampaignsDto> getAllByCriteria(Request<CampaignsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Campaigns (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();

		// Ajuster la taille de page selon les préférences utilisateur
		Utilities.adjustPageSizeFromUserPreference(request, userRepository);

		List<Campaigns> items 			 = campaignsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(items) : CampaignsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(campaignsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaigns", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Campaigns-----");
		return response;
	}



	/**
	 * update deleted Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	public Response<CampaignsDto> updateDeleted(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted Campaigns (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
        
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaigns existe (incluant les supprimés)
			Campaigns entityToSave = null;
			entityToSave = campaignsRepository.findOne(dto.getId(), true);  // true pour inclure les supprimés
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				User existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.notBlank(dto.getCampaignTitle())) {
				entityToSave.setCampaignTitle(dto.getCampaignTitle());
			}
			if (Utilities.notBlank(dto.getCampaignDesc())) {
				entityToSave.setCampaignDesc(dto.getCampaignDesc());
			}
			if (Utilities.notBlank(dto.getCampaignStatus())) {
				entityToSave.setCampaignStatus(dto.getCampaignStatus());
			}
			if (Utilities.notBlank(dto.getCampaignStart())) {
				entityToSave.setCampaignStart(dateFormat.parse(dto.getCampaignStart()));
			}
			if (Utilities.notBlank(dto.getCampaignEnd())) {
				entityToSave.setCampaignEnd(dateFormat.parse(dto.getCampaignEnd()));
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getMaxApply() != null && dto.getMaxApply() > 0) {
				entityToSave.setMaxApply(dto.getMaxApply());
			}
			if (dto.getAllCanEvaluate() != null) {
				entityToSave.setAllCanEvaluate(dto.getAllCanEvaluate());
			}
			if (dto.getMarkedOutOf() != null && dto.getMarkedOutOf() > 0) {
				entityToSave.setMarkedOutOf(dto.getMarkedOutOf());
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
			List<Campaigns> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end updateDeleted Campaigns-----");
		return response;
	}

	/**
	 * update all Campaigns (active and deleted) by using CampaignsDto as object.
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CampaignsDto> updateAll(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();

		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la campaigns existe (actifs d'abord, puis supprimés)
			Campaigns entityToSave = null;
			// Pour updateAll, chercher d'abord les campagnes actives, puis les supprimées
			entityToSave = campaignsRepository.findOne(dto.getId(), false); // Chercher d'abord les actives
			if (entityToSave == null) {
				entityToSave = campaignsRepository.findOne(dto.getId(), true); // Puis les supprimées si pas trouvé
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				User existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.notBlank(dto.getCampaignTitle())) {
				entityToSave.setCampaignTitle(dto.getCampaignTitle());
			}
			if (Utilities.notBlank(dto.getCampaignDesc())) {
				entityToSave.setCampaignDesc(dto.getCampaignDesc());
			}
			if (Utilities.notBlank(dto.getCampaignStatus())) {
				entityToSave.setCampaignStatus(dto.getCampaignStatus());
			}
			if (Utilities.notBlank(dto.getCampaignStart())) {
				entityToSave.setCampaignStart(dateFormat.parse(dto.getCampaignStart()));
			}
			if (Utilities.notBlank(dto.getCampaignEnd())) {
				entityToSave.setCampaignEnd(dateFormat.parse(dto.getCampaignEnd()));
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getMaxApply() != null && dto.getMaxApply() > 0) {
				entityToSave.setMaxApply(dto.getMaxApply());
			}
			if (dto.getAllCanEvaluate() != null) {
				entityToSave.setAllCanEvaluate(dto.getAllCanEvaluate());
			}
			if (dto.getMarkedOutOf() != null && dto.getMarkedOutOf() > 0) {
				entityToSave.setMarkedOutOf(dto.getMarkedOutOf());
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
			List<Campaigns> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end updateAll Campaigns-----");
		return response;
	}

	/**
	 * get full CampaignsDto by using Campaigns as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CampaignsDto getFullInfos(CampaignsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// Récupérer le nom du créateur
		if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
			User creator = userRepository.findOne(dto.getCreatedBy(), false);
			if (creator != null) {
				// Construire le nom complet: username (ou firstName + lastName si disponibles)
				String creatorName = creator.getUsername();
				if (Utilities.notBlank(creator.getFirstName()) && Utilities.notBlank(creator.getLastName())) {
					creatorName = creator.getFirstName() + " " + creator.getLastName();
				}
				dto.setCreatorName(creatorName);
			}
		}

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CampaignsDto> custom(Request<CampaignsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CampaignsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CampaignsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CampaignsDto-----");
		return response;
	}
}
