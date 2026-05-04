                                                                															
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
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

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
import tech.synelia.quizapp.utils.enums.CandidateAskStatus;
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
	private ApplicationsBusiness applicationsBusiness;
	@Autowired
	private HostingUtils hostingUtils;
	@Autowired
	private ParamsUtils paramsUtils;
	@Autowired
	private EmailTemplateBusiness emailTemplateBusiness;
	@Autowired
	private PlatformReadinessService platformReadinessService;
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

	private static final String CANDIDATE_ASK_RESULT_ACTION = "CANDIDATE_ASK_RESULT";
	private static final String CANDIDATE_ASK_RESULT_TEMPLATE_KEY = "candidate_ask_result";
	private static final String MAIL_SENDER_NAME = "Synelia Recrutement";

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
			entityToSave.setAskStatus(StringUtils.defaultIfBlank(dto.getAskStatus(), CandidateAskStatus.PENDING.getValue()));
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
			if (Utilities.shouldUpdate(dto.getRequestType())) {
				entityToSave.setRequestType(dto.getRequestType());
			}
			if (Utilities.shouldUpdate(dto.getAskStatus())) {
				entityToSave.setAskStatus(dto.getAskStatus());
			}
			if (dto.getIsVerified() != null) {
				entityToSave.setIsVerified(dto.getIsVerified());
			}
			if (Utilities.shouldUpdate(dto.getFirstName())) {
				entityToSave.setFirstName(dto.getFirstName());
			}
			if (Utilities.shouldUpdate(dto.getLastName())) {
				entityToSave.setLastName(dto.getLastName());
			}
			if (Utilities.shouldUpdate(dto.getNewEmail())) {
				entityToSave.setNewEmail(dto.getNewEmail());
			}
			if (Utilities.shouldUpdate(dto.getNewPhone())) {
				entityToSave.setNewPhone(dto.getNewPhone());
			}
			if (Utilities.shouldUpdate(dto.getDecisionReason())) {
				entityToSave.setDecisionReason(dto.getDecisionReason());
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
	 * get ALL CandidateAsk by using CandidateAskDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CandidateAskDto> getAllByCriteria(Request<CandidateAskDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL CandidateAsk (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		List<CandidateAsk> items 			 = candidateAskRepository.getAllByCriteria(request, em, locale);

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
			response.setCount(candidateAskRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateAsk", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL CandidateAsk-----");
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
		if (StringUtils.isBlank(dto.getAskStatus())) {
			dto.setAskStatus(Boolean.TRUE.equals(dto.getIsVerified())
					? CandidateAskStatus.APPROVED.getValue()
					: CandidateAskStatus.PENDING.getValue());
		}

		return dto;
	}

	@Transactional
	public Response<CandidateAskDto> custom(Request<CandidateAskDto> request, Locale locale) throws Exception {
		log.info("----begin custom CandidateAskDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CandidateAskDto> response = new Response<CandidateAskDto>();
		List<CandidateAskDto> itemsDto = new ArrayList<CandidateAskDto>();

		for (CandidateAskDto dto : request.getDatas()) {
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			fieldsToVerify.put("action", dto.getAction());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CandidateAsk candidateAsk = candidateAskRepository.findOne(dto.getId(), false);
			if (candidateAsk == null || Boolean.TRUE.equals(candidateAsk.getIsDeleted())) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAsk id -> " + dto.getId(), locale));
			}

			CandidateAskStatus currentStatus = resolveAskStatus(candidateAsk);
			if (currentStatus != CandidateAskStatus.PENDING) {
				throw invalidCandidateAskRequest("Cette demande a deja ete traitee.", locale);
			}

			Applications application = candidateAsk.getApplications() != null && candidateAsk.getApplications().getId() != null
					? applicationsRepository.findOne(candidateAsk.getApplications().getId(), false)
					: null;
			if (application == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
			}

			platformReadinessService.requireEmailDeliveryAvailable(
					CANDIDATE_ASK_RESULT_ACTION,
					CANDIDATE_ASK_RESULT_TEMPLATE_KEY,
					locale);

			String action = StringUtils.trimToEmpty(dto.getAction()).toUpperCase(Locale.ROOT);
			Date now = Utilities.getCurrentDate();
			switch (action) {
				case "APPROVE":
					applyCandidateAskToApplication(candidateAsk, application, request.getUser(), locale);
					candidateAsk.setAskStatus(CandidateAskStatus.APPROVED.getValue());
					candidateAsk.setIsVerified(true);
					candidateAsk.setDecisionReason(null);
					break;
				case "REJECT":
					if (StringUtils.isBlank(dto.getDecisionReason())) {
						throw invalidCandidateAskRequest("Le motif de refus est obligatoire.", locale);
					}
					candidateAsk.setAskStatus(CandidateAskStatus.REJECTED.getValue());
					candidateAsk.setIsVerified(false);
					candidateAsk.setDecisionReason(dto.getDecisionReason().trim());
					break;
				default:
					throw invalidCandidateAskRequest("Action candidate ask inconnue.", locale);
			}

			candidateAsk.setUpdatedAt(now);
			candidateAsk.setUpdatedBy(request.getUser());
			candidateAsk.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(candidateAsk)));
			CandidateAsk savedCandidateAsk = candidateAskRepository.save(candidateAsk);
			sendCandidateAskResultEmail(application, savedCandidateAsk, locale);
			itemsDto.add(getFullInfos(CandidateAskTransformer.INSTANCE.toDto(savedCandidateAsk), 1, request.getIsSimpleLoading(), locale));
		}

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		response.setHttpCode(HttpStatus.OK.value());
		response.setHasError(false);
		response.setCount((long) itemsDto.size());
		response.setItems(itemsDto);
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CandidateAskDto-----");
		return response;
	}

	private CandidateAskStatus resolveAskStatus(CandidateAsk candidateAsk) {
		if (candidateAsk == null) {
			return CandidateAskStatus.PENDING;
		}

		String askStatus = StringUtils.trimToNull(candidateAsk.getAskStatus());
		if (askStatus != null) {
			return CandidateAskStatus.fromValue(askStatus);
		}

		return Boolean.TRUE.equals(candidateAsk.getIsVerified())
				? CandidateAskStatus.APPROVED
				: CandidateAskStatus.PENDING;
	}

	private void applyCandidateAskToApplication(CandidateAsk candidateAsk, Applications application, Integer userId, Locale locale) throws JsonProcessingException {
		if (candidateAsk == null || application == null) {
			throw invalidCandidateAskRequest("Demande ou candidature introuvable.", locale);
		}

		String requestType = StringUtils.trimToEmpty(candidateAsk.getRequestType()).toUpperCase(Locale.ROOT);
		boolean applicationChanged = false;

		switch (requestType) {
			case "EMAIL":
				String newEmail = normalizeEmail(candidateAsk.getNewEmail());
				if (StringUtils.isBlank(newEmail)) {
					throw invalidCandidateAskRequest("Aucune nouvelle adresse email n'est disponible pour cette demande.", locale);
				}
				if (!Utilities.isValidEmail(newEmail)) {
					throw invalidCandidateAskRequest("La nouvelle adresse email est invalide.", locale);
				}
				if (StringUtils.equalsIgnoreCase(newEmail, application.getCandidateEmail())) {
					throw invalidCandidateAskRequest("La nouvelle adresse email est identique a l'adresse actuelle.", locale);
				}
				application.setCandidateEmail(newEmail);
				application.setEmailVerified(false);
				applicationChanged = true;
				break;
			case "PHONE":
				String newPhone = normalizeText(candidateAsk.getNewPhone());
				if (StringUtils.isBlank(newPhone)) {
					throw invalidCandidateAskRequest("Aucun nouveau numero de telephone n'est disponible pour cette demande.", locale);
				}
				if (StringUtils.equals(newPhone, normalizeText(application.getCandidatePhone()))) {
					throw invalidCandidateAskRequest("Le nouveau numero de telephone est identique au numero actuel.", locale);
				}
				application.setCandidatePhone(newPhone);
				applicationChanged = true;
				break;
			case "IDENTITY":
				String firstName = normalizeText(candidateAsk.getFirstName());
				String lastName = normalizeText(candidateAsk.getLastName());
				if (StringUtils.isNotBlank(firstName) && !StringUtils.equals(firstName, normalizeText(application.getCandidateFirstName()))) {
					application.setCandidateFirstName(firstName);
					applicationChanged = true;
				}
				if (StringUtils.isNotBlank(lastName) && !StringUtils.equals(lastName, normalizeText(application.getCandidateLastName()))) {
					application.setCandidateLastName(lastName);
					applicationChanged = true;
				}
				if (!applicationChanged) {
					throw invalidCandidateAskRequest("Aucune correction d'identite applicable n'a ete trouvee.", locale);
				}
				break;
			default:
				throw invalidCandidateAskRequest("Le type de demande candidat est invalide.", locale);
		}

		if (!applicationChanged) {
			throw invalidCandidateAskRequest("Aucune modification n'a ete appliquee a la candidature.", locale);
		}

		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(userId);
		application.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(application)));
		Applications savedApplication = applicationsRepository.save(application);

		if ("EMAIL".equals(requestType)) {
			try {
				applicationsBusiness.restartEmailVerification(savedApplication, locale);
			} catch (Exception exception) {
				throw new InternalErrorException(technicalError.INTERN_ERROR(exception.getMessage(), locale));
			}
		}
	}

	private InvalidEntityException invalidCandidateAskRequest(String message, Locale locale) {
		return new InvalidEntityException(functionalError.INVALID_FORMAT(message, locale));
	}

	private void sendCandidateAskResultEmail(Applications application, CandidateAsk candidateAsk, Locale locale) {
		if (application == null || candidateAsk == null || StringUtils.isBlank(application.getCandidateEmail())) {
			return;
		}

		EmailTemplate emailTemplate = emailTemplateBusiness.findDefaultByActionTypeOrKey(
				CANDIDATE_ASK_RESULT_ACTION,
				CANDIDATE_ASK_RESULT_TEMPLATE_KEY);
		if (emailTemplate == null || Boolean.TRUE.equals(emailTemplate.getIsDeleted()) || !Boolean.TRUE.equals(emailTemplate.getIsActive())) {
			log.warning("Aucun template actif pour la notification de candidate ask " + candidateAsk.getId());
			return;
		}

		try {
			Map<String, String> from = new HashMap<>();
			from.put("email", paramsUtils.getSmtpLogin());
			from.put("user", MAIL_SENDER_NAME);

			List<Map<String, String>> toRecipients = new ArrayList<>();
			Map<String, String> recipient = new HashMap<>();
			recipient.put("email", application.getCandidateEmail());
			recipient.put("user", buildCandidateFullName(application));
			toRecipients.add(recipient);

			CandidateAskStatus askStatus = resolveAskStatus(candidateAsk);
			Map<String, String> vars = new HashMap<>();
			vars.put("first_name", StringUtils.defaultString(application.getCandidateFirstName()));
			vars.put("last_name", StringUtils.defaultString(application.getCandidateLastName()));
			vars.put("candidate_ask_type_label", getCandidateAskTypeLabel(candidateAsk.getRequestType()));
			vars.put("ask_status_label", getCandidateAskStatusLabel(askStatus));
			vars.put("ask_summary_block", buildCandidateAskSummaryBlock(candidateAsk));
			vars.put("decision_reason_block", buildCandidateAskDecisionReasonBlock(candidateAsk));
			vars.put("verification_notice_block", buildCandidateAskVerificationNoticeBlock(candidateAsk, askStatus));
			vars.put("app_link", paramsUtils.getUrlAppl());

			String subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
			String contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);

			Context context = new Context();
			context.setVariable("contenu", contenu);
			context.setVariable("entete", "Demande de correction candidat");
			context.setVariable("titre", askStatus == CandidateAskStatus.APPROVED
					? "Votre demande de correction a ete validee"
					: "Votre demande de correction a ete refusee");
			context.setVariable("appLink", paramsUtils.getUrlAppl());

			Response<?> responseEmail = hostingUtils.sendEmail(from, toRecipients, subject, "", null, context, "blank", locale);
			if (responseEmail.isHasError()) {
				log.warning("Echec de l'envoi de l'email candidate ask pour la candidature " + application.getId());
			}
		} catch (Exception exception) {
			log.warning("Envoi email candidate ask ignore pour la candidature " + application.getId() + ": " + exception.getMessage());
		}
	}

	private String buildCandidateFullName(Applications application) {
		return StringUtils.trim(StringUtils.defaultString(application.getCandidateFirstName())
				+ " "
				+ StringUtils.defaultString(application.getCandidateLastName()));
	}

	private String getCandidateAskTypeLabel(String requestType) {
		String normalizedType = StringUtils.trimToEmpty(requestType).toUpperCase(Locale.ROOT);
		switch (normalizedType) {
			case "EMAIL":
				return "l'adresse email";
			case "PHONE":
				return "le telephone";
			case "IDENTITY":
				return "l'identite";
			default:
				return "vos informations";
		}
	}

	private String getCandidateAskStatusLabel(CandidateAskStatus askStatus) {
		return askStatus == CandidateAskStatus.APPROVED ? "validee" : "refusee";
	}

	private String buildCandidateAskSummaryBlock(CandidateAsk candidateAsk) {
		String requestType = StringUtils.trimToEmpty(candidateAsk.getRequestType()).toUpperCase(Locale.ROOT);
		String summary;
		switch (requestType) {
			case "EMAIL":
				summary = StringUtils.isNotBlank(candidateAsk.getNewEmail())
						? "Nouvelle adresse email demandee : <strong>" + candidateAsk.getNewEmail() + "</strong>."
						: "";
				break;
			case "PHONE":
				summary = StringUtils.isNotBlank(candidateAsk.getNewPhone())
						? "Nouveau numero demande : <strong>" + candidateAsk.getNewPhone() + "</strong>."
						: "";
				break;
			case "IDENTITY":
				List<String> identityParts = new ArrayList<>();
				if (StringUtils.isNotBlank(candidateAsk.getFirstName())) {
					identityParts.add(candidateAsk.getFirstName());
				}
				if (StringUtils.isNotBlank(candidateAsk.getLastName())) {
					identityParts.add(candidateAsk.getLastName());
				}
				summary = identityParts.isEmpty()
						? ""
						: "Identite demandee : <strong>" + StringUtils.join(identityParts, ' ') + "</strong>.";
				break;
			default:
				summary = "";
		}

		return StringUtils.isNotBlank(summary) ? "<p>" + summary + "</p>" : "";
	}

	private String buildCandidateAskDecisionReasonBlock(CandidateAsk candidateAsk) {
		if (StringUtils.isBlank(candidateAsk.getDecisionReason())) {
			return "";
		}
		return "<p><strong>Motif :</strong> " + candidateAsk.getDecisionReason() + "</p>";
	}

	private String buildCandidateAskVerificationNoticeBlock(CandidateAsk candidateAsk, CandidateAskStatus askStatus) {
		if (askStatus != CandidateAskStatus.APPROVED || !"EMAIL".equalsIgnoreCase(candidateAsk.getRequestType())) {
			return "";
		}
		return "<p>Un nouvel email de verification vient de vous etre envoye a votre nouvelle adresse afin de confirmer ce changement.</p>";
	}

	private String normalizeText(String value) {
		return StringUtils.trimToNull(value);
	}

	private String normalizeEmail(String value) {
		String normalizedValue = normalizeText(value);
		return normalizedValue != null ? normalizedValue.toLowerCase(Locale.ROOT) : null;
	}
}
