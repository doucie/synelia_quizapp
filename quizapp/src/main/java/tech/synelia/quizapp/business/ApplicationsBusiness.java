                                                                                																			
/*
 * Java business for entity table applications 
 * Created on 2025-08-22 ( Time 11:38:24 )
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
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "applications"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class ApplicationsBusiness implements IBasicBusiness<Request<ApplicationsDto>, Response<ApplicationsDto>> {

	private Response<ApplicationsDto> response;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private CandidateAnswerRepository candidateAnswerRepository;
	@Autowired
	private CandidateAskRepository candidateAskRepository;
	@Autowired
	private SourceTokenRepository sourceTokenRepository;
	@Autowired
	private CandidateInterviewRepository candidateInterviewRepository;
	@Autowired
	private CandidateTokenRepository candidateTokenRepository;
	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
	@Autowired
	private FormVersionRepository formVersionRepository;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private AnswerRepository answerRepository;
	@Autowired
	private HostingUtils hostingUtils;
	@Autowired
	private ParamsUtils paramsUtils;
	@Autowired
	private EmailTemplateBusiness emailTemplateBusiness;
	@Autowired
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private PipelineStageRepository pipelineStageRepository;
	@Autowired
	private ApplicationProgressRepository applicationProgressRepository;
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
	private Context context;

	public ApplicationsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Applications by using ApplicationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<ApplicationsDto> create(Request<ApplicationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Applications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		List<Applications>        items    = new ArrayList<Applications>();
			
		for (ApplicationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("candidateFirstName", dto.getCandidateFirstName());
			fieldsToVerify.put("candidateLastName", dto.getCandidateLastName());
			fieldsToVerify.put("candidateEmail", dto.getCandidateEmail());
			fieldsToVerify.put("candidatePhone", dto.getCandidatePhone());
			// fieldsToVerify.put("candidateCvPath", dto.getCandidateCvPath()); // CV optionnel pour le moment
			// fieldsToVerify.put("emailVerified", dto.getEmailVerified());
			// fieldsToVerify.put("quizScore", dto.getQuizScore());
			// fieldsToVerify.put("evaluationScore", dto.getEvaluationScore());
			// fieldsToVerify.put("applicationStatus", dto.getApplicationStatus());
			// fieldsToVerify.put("visitToken", dto.getVisitToken());
			// fieldsToVerify.put("searchString", dto.getSearchString());
			// fieldsToVerify.put("sourceTokenId", dto.getSourceTokenId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if applications to insert do not exist
			Applications existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("applications id -> " + dto.getId(), locale));
			}

			// Verify if sourceToken exist
			SourceToken existingSourceToken = null;
			if (dto.getSourceTokenId() != null && dto.getSourceTokenId() > 0){
				existingSourceToken = sourceTokenRepository.findOne(dto.getSourceTokenId(), false);
				if (existingSourceToken == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken sourceTokenId -> " + dto.getSourceTokenId(), locale));
				}
			}
			// Verify if formVersion exist
			FormVersion existingFormVersion = null;
			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0){
				existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Applications entityToSave = null;
			entityToSave = ApplicationsTransformer.INSTANCE.toEntity(dto, existingSourceToken, existingFormVersion);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			// Initialiser les champs obligatoires pour le quiz
			entityToSave.setEmailVerified(false);
			entityToSave.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue());
			entityToSave.setQuizToken(null); // Sera généré après vérification email
			entityToSave.setQuizLevel(null); // Sera initialisé au démarrage du quiz
			entityToSave.setApplicationAbandoned(false); // Initialiser à false
			entityToSave.setPreScreenDecisionMailSent(false); // Initialiser à false
			entityToSave.setFinalDecisionMailSent(false); // Initialiser à false
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Applications> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = applicationsRepository.saveAll((Iterable<Applications>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("applications", locale));
			}
			List<ApplicationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? ApplicationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : ApplicationsTransformer.INSTANCE.toDtos(itemsSaved);

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
			
			// Créer le token de vérification et envoyer l'email pour chaque application créée
			for (Applications savedApp : itemsSaved) {
				try {
					createVerificationTokenAndSendEmail(savedApp, locale);
				} catch (Exception e) {
					log.warning("Erreur lors de la création du token/envoi email pour application ID " + savedApp.getId() + ": " + e.getMessage());
					// Ne pas bloquer le processus même si l'email échoue
					e.printStackTrace();
				}
			}
			
			// Initialiser le progrès pipeline pour chaque application créée
			for (Applications savedApp : itemsSaved) {
				try {
					// Récupérer le pipelineTemplateId via SourceToken → Campaign
					if (savedApp.getSourceToken() != null && savedApp.getSourceToken().getCampaigns() != null) {
						Campaigns campaign = savedApp.getSourceToken().getCampaigns();
						if (campaign.getPipelineTemplate() != null) {
							Integer templateId = campaign.getPipelineTemplate().getId();
							// Créer toutes les lignes PENDING + verrouiller le template
							applicationProgressBusiness.initProgressForApplication(savedApp.getId(), templateId, request.getUser());
							// Avancer la 1ère étape (CANDIDATURE) à IN_PROGRESS
							applicationProgressBusiness.advanceToNextStage(savedApp.getId(), request.getUser(), locale);
						}
					}
				} catch (Exception e) {
					log.warning("Erreur lors de l'initialisation du pipeline pour application ID " + savedApp.getId() + ": " + e.getMessage());
					e.printStackTrace();
				}
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
		log.info("----end create Applications-----");
		return response;
	}

	/**
	 * update Applications by using ApplicationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<ApplicationsDto> update(Request<ApplicationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Applications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		List<Applications>        items    = new ArrayList<Applications>();
			
		for (ApplicationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la applications existe
			Applications entityToSave = null;
			entityToSave = applicationsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications id -> " + dto.getId(), locale));
			}

			// Verify if sourceToken exist
			if (dto.getSourceTokenId() != null && dto.getSourceTokenId() > 0){
				SourceToken existingSourceToken = sourceTokenRepository.findOne(dto.getSourceTokenId(), false);
				if (existingSourceToken == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken sourceTokenId -> " + dto.getSourceTokenId(), locale));
				}
				entityToSave.setSourceToken(existingSourceToken);
			}
			if (Utilities.shouldUpdate(dto.getCandidateFirstName())) {
				entityToSave.setCandidateFirstName(dto.getCandidateFirstName());
			}
			if (Utilities.shouldUpdate(dto.getCandidateLastName())) {
				entityToSave.setCandidateLastName(dto.getCandidateLastName());
			}
			if (Utilities.shouldUpdate(dto.getCandidateEmail())) {
				entityToSave.setCandidateEmail(dto.getCandidateEmail());
			}
			if (Utilities.shouldUpdate(dto.getCandidatePhone())) {
				entityToSave.setCandidatePhone(dto.getCandidatePhone());
			}
			if (Utilities.shouldUpdate(dto.getCandidateCvPath())) {
				entityToSave.setCandidateCvPath(dto.getCandidateCvPath());
			}
			if (dto.getEmailVerified() != null) {
				entityToSave.setEmailVerified(dto.getEmailVerified());
			}
			if (dto.getQuizScore() != null && dto.getQuizScore() > 0) {
				entityToSave.setQuizScore(dto.getQuizScore());
			}
			if (dto.getTotalEvaluationScore() != null && dto.getTotalEvaluationScore() > 0) {
				entityToSave.setTotalEvaluationScore(dto.getTotalEvaluationScore());
			}
			if (dto.getTotalEvaluationNumber() != null && dto.getTotalEvaluationNumber() > 0) {
				entityToSave.setTotalEvaluationNumber(dto.getTotalEvaluationNumber());
			}
			if (dto.getTotalEvaluationPercentage() != null && dto.getTotalEvaluationPercentage() > 0) {
				entityToSave.setTotalEvaluationPercentage(dto.getTotalEvaluationPercentage());
			}
			if (Utilities.shouldUpdate(dto.getApplicationStatus())) {
				entityToSave.setApplicationStatus(dto.getApplicationStatus());
			}
			if (Utilities.shouldUpdate(dto.getVisitToken())) {
				entityToSave.setVisitToken(dto.getVisitToken());
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
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
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
			List<Applications> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = applicationsRepository.saveAll((Iterable<Applications>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("applications", locale));
			}
			List<ApplicationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? ApplicationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : ApplicationsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Applications-----");
		return response;
	}

	/**
	 * delete Applications by using ApplicationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<ApplicationsDto> delete(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Applications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		List<Applications>        items    = new ArrayList<Applications>();
			
		for (ApplicationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la applications existe
			Applications existingEntity = null;
			existingEntity = applicationsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// candidateAnswer
			List<CandidateAnswer> listOfCandidateAnswer = candidateAnswerRepository.findByApplicationId(existingEntity.getId(), false);
			if (listOfCandidateAnswer != null && !listOfCandidateAnswer.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateAnswer.size() + ")", locale));
			}
			// candidateAsk
			List<CandidateAsk> listOfCandidateAsk = candidateAskRepository.findByApplicationId(existingEntity.getId(), false);
			if (listOfCandidateAsk != null && !listOfCandidateAsk.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateAsk.size() + ")", locale));
			}
			// candidateInterview
			List<CandidateInterview> listOfCandidateInterview = candidateInterviewRepository.findByApplicationId(existingEntity.getId(), false);
			if (listOfCandidateInterview != null && !listOfCandidateInterview.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateInterview.size() + ")", locale));
			}
			// candidateToken
			List<CandidateToken> listOfCandidateToken = candidateTokenRepository.findByApplicationId(existingEntity.getId(), false);
			if (listOfCandidateToken != null && !listOfCandidateToken.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateToken.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			applicationsRepository.saveAll((Iterable<Applications>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Applications-----");
		return response;
	}

	/**
	 * get Applications by using ApplicationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<ApplicationsDto> getByCriteria(Request<ApplicationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Applications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		List<Applications> items 			 = applicationsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<ApplicationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? ApplicationsTransformer.INSTANCE.toLiteDtos(items) : ApplicationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(applicationsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("applications", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Applications-----");
		return response;
	}

	/**
	 * get ALL Applications by using ApplicationsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<ApplicationsDto> getAllByCriteria(Request<ApplicationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Applications (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		List<Applications> items 			 = applicationsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<ApplicationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? ApplicationsTransformer.INSTANCE.toLiteDtos(items) : ApplicationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(applicationsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("applications", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Applications-----");
		return response;
	}

	/**
	 * get full ApplicationsDto by using Applications as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public ApplicationsDto getFullInfos(ApplicationsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
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
	 * Génère un token de vérification unique et sécurisé
	 * @return token généré
	 */
	private String generateVerificationToken() {
		return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
	}

	/**
	 * Crée un token de vérification et envoie un email au candidat
	 * @param application l'application créée
	 * @param locale locale pour l'email
	 * @throws Exception en cas d'erreur
	 */
	private void createVerificationTokenAndSendEmail(Applications application, Locale locale) throws Exception {
		log.info("----begin createVerificationTokenAndSendEmail-----");
		
		// Générer le token
		String token = generateVerificationToken();
		
		// Calculer la date d'expiration (48 heures)
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.HOUR, 48);
		Date expiresAt = calendar.getTime();
		
		// Créer l'entité EmailVerificationToken
		EmailVerificationToken verificationToken = new EmailVerificationToken();
		verificationToken.setEmail(application.getCandidateEmail());
		verificationToken.setToken(token);
		verificationToken.setTokenType(EmailVerificationToken.TokenType.APPLICATION_VERIFICATION);
		verificationToken.setExpiresAt(expiresAt);
		verificationToken.setIsUsed(false);
		verificationToken.setCreatedAt(new Date());
		verificationToken.setApplication(application);
		
		// Sauvegarder le token en base de données
		EmailVerificationToken savedToken = emailVerificationTokenRepository.save(verificationToken);
		
		if (savedToken == null) {
			log.warning("Échec de la sauvegarde du token de vérification pour l'email: " + application.getCandidateEmail());
			throw new InternalErrorException(functionalError.SAVE_FAIL("email_verification_token", locale));
		}
		
		log.info("Token de vérification créé avec succès pour l'email: " + application.getCandidateEmail());
		
		// Préparer et envoyer l'email
		Map<String, String> from = new HashMap<>();
		from.put("email", paramsUtils.getSmtpLogin());
		from.put("user", "Synelia Recrutement");
		
		List<Map<String, String>> toRecipients = new ArrayList<>();
		Map<String, String> recipient = new HashMap<>();
		recipient.put("email", application.getCandidateEmail());
		recipient.put("user", application.getCandidateFirstName() + " " + application.getCandidateLastName());
		toRecipients.add(recipient);
		
		// URL de vérification
		String appLink = paramsUtils.getUrlAppl();
		String verificationLink = appLink + "/verify-email/" + token;
		
		log.info("=== EMAIL VERIFICATION LINK DEBUG ===");
		log.info("appLink from config: " + appLink);
		log.info("token: " + token);
		log.info("verificationLink: " + verificationLink);
		log.info("=====================================");
		
		String subject;
		String contenu;

		// Charger le template depuis la base de données
		EmailTemplate emailTemplate = emailTemplateBusiness.findDefaultByActionTypeOrKey("APPLICATION_VERIFICATION", "application_verification");
		if (emailTemplate != null) {
			Map<String, String> vars = new HashMap<>();
			vars.put("first_name", application.getCandidateFirstName());
			vars.put("last_name", application.getCandidateLastName());
			vars.put("verification_link", verificationLink);
			vars.put("campaign_title", "");
			subject = emailTemplateBusiness.renderTemplate(emailTemplate.getSubjectTemplate(), vars);
			contenu = emailTemplateBusiness.renderTemplate(emailTemplate.getBodyTemplate(), vars);
		} else {
			subject = "Vérification de votre adresse email - Synelia";
			contenu = "Bonjour " + application.getCandidateFirstName() + " " + application.getCandidateLastName() + ",<br/><br/>";
			contenu += "Merci d'avoir soumis votre candidature chez Synelia !<br/><br/>";
			contenu += "Pour continuer le processus de recrutement, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.<br/><br/>";
			contenu += "Ce lien est valide pendant 48 heures.<br/><br/>";
			contenu += "Si vous n'avez pas soumis de candidature chez Synelia, veuillez ignorer cet email.<br/><br/>";
			contenu += "Cordialement,<br/>";
			contenu += "L'équipe Synelia";
		}
		
		context = new Context();
		String template = "blank";
		context.setVariable("contenu", contenu);
		context.setVariable("entete", "Vérification Email");
		context.setVariable("titre", "Vérification de votre adresse email");
		context.setVariable("appLink", verificationLink);
		
		String body = "";
		Response<?> responseEmail = hostingUtils.sendEmail(from, toRecipients, subject, body, null, context, template, locale);
		
		if (responseEmail.isHasError()) {
			log.warning("Échec de l'envoi de l'email de vérification pour: " + application.getCandidateEmail());
			// Ne pas bloquer le processus si l'email échoue, mais logger l'erreur
		} else {
			log.info("Email de vérification envoyé avec succès à: " + application.getCandidateEmail());
		}
		
		log.info("----end createVerificationTokenAndSendEmail-----");
	}

	/**
	 * Vérifie l'email d'un candidat avec le token reçu par email
	 * @param request Request contenant le token
	 * @param locale locale
	 * @return response
	 * @throws JsonProcessingException
	 */
	public Response<ApplicationsDto> verifyEmail(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin verifyEmail-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		
		try {
			// Récupérer le token depuis la requête
			ApplicationsDto dto = request.getData();
			log.info("DTO reçu: " + (dto != null ? "OK" : "NULL"));
			
			if (dto == null || Utilities.isBlank(dto.getSearchString())) {
				log.warning("DTO null ou searchString vide - DTO: " + dto);
				if (dto != null) {
					log.warning("SearchString: [" + dto.getSearchString() + "]");
				}
				response.setStatus(functionalError.FIELD_EMPTY("token", locale));
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			String token = dto.getSearchString(); // Le token est passé dans searchString
			log.info("Token reçu (longueur " + token.length() + "): " + token.substring(0, Math.min(20, token.length())) + "...");
			log.info("Token complet: " + token);
			
			// Chercher le token dans la base de données
			Optional<EmailVerificationToken> optionalToken = emailVerificationTokenRepository.findByToken(token);
			
			if (!optionalToken.isPresent()) {
				log.warning("Token non trouvé dans la base de données");
				log.warning("Token recherché: [" + token + "]");
				response.setStatus(functionalError.DATA_NOT_EXIST("token de vérification", locale));
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			EmailVerificationToken verificationToken = optionalToken.get();
			
			// Vérifier si le token a déjà été utilisé
			if (verificationToken.getIsUsed()) {
				log.warning("Token déjà utilisé: " + token);
				response.setStatus(functionalError.DATA_EXIST("Ce lien de vérification a déjà été utilisé", locale));
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			// Vérifier si le token est expiré
			if (verificationToken.getExpiresAt().before(new Date())) {
				log.warning("Token expiré: " + token);
				response.setStatus(functionalError.DATA_NOT_EXIST("Ce lien de vérification a expiré", locale));
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			// Vérifier que c'est bien un token de type APPLICATION_VERIFICATION
			if (verificationToken.getTokenType() != EmailVerificationToken.TokenType.APPLICATION_VERIFICATION) {
				log.warning("Type de token incorrect: " + verificationToken.getTokenType());
				response.setStatus(functionalError.DATA_NOT_EXIST("Type de token invalide", locale));
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			// Récupérer l'application associée
			Applications application = verificationToken.getApplication();
			if (application == null) {
				log.warning("Aucune application associée au token");
				response.setStatus(functionalError.DATA_NOT_EXIST("Application non trouvée", locale));
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// Mettre à jour le token: marquer comme utilisé
			verificationToken.setIsUsed(true);
			verificationToken.setUsedAt(new Date());
			emailVerificationTokenRepository.save(verificationToken);
			log.info("Token marqué comme utilisé");
			
			// Générer le quiz_token sécurisé (UUID sans tirets)
			String quizToken = UUID.randomUUID().toString().replace("-", "");
			log.info("Quiz token généré: " + quizToken);
			
			// Mettre à jour l'application: email vérifié + quiz_token + status pending
			application.setEmailVerified(true);
			application.setQuizToken(quizToken);
			application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue());
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			applicationsRepository.save(application);
			log.info("Email vérifié et quiz token généré pour l'application ID: " + application.getId());
			
			// Préparer la réponse avec le quiz_token dans searchString
			ApplicationsDto resultDto = ApplicationsTransformer.INSTANCE.toDto(application);
			resultDto.setSearchString(quizToken); // Retourner le quiz_token au frontend
			resultDto = getFullInfos(resultDto, 1, false, locale);
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage("Email vérifié avec succès");
			
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setItems(Arrays.asList(resultDto));
			response.setHasError(false);
			
			log.info("Email vérifié avec succès pour: " + application.getCandidateEmail());
			
		} catch (Exception e) {
			log.severe("Erreur lors de la vérification de l'email: " + e.getMessage());
			e.printStackTrace();
			response.setStatus(functionalError.SAVE_FAIL("vérification email", locale));
			response.setHasError(true);
			response.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end verifyEmail-----");
		return response;
	}

	/**
	 * Initialise les réponses candidates pour toutes les questions du formulaire (formVersion)
	 * Crée un enregistrement dans candidate_answer pour chaque answer de chaque question
	 * Tous les enregistrements sont initialisés avec is_selected = false
	 * 
	 * @param application L'application du candidat
	 * @param userId L'utilisateur qui effectue l'action
	 */
	private void initializeCandidateAnswers(Applications application, Integer userId) {
		log.info("----begin initializeCandidateAnswers for application ID: " + application.getId() + "-----");
		
		try {
			// 1. Récupérer la formVersion depuis l'application
			FormVersion formVersion = application.getFormVersion();
			if (formVersion == null) {
				log.severe("ERREUR CRITIQUE: Cannot initialize candidate answers - no formVersion found for application " + application.getId());
				return;
			}
			
			Integer formVersionId = formVersion.getId();
			log.info("Initializing answers for formVersion ID: " + formVersionId);
			
			// 2. Récupérer toutes les questions du formulaire (ordonnées)
			List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersionId, false);
			
			if (formQuestions == null || formQuestions.isEmpty()) {
				log.severe("ERREUR CRITIQUE: No questions found for formVersion " + formVersionId);
				return;
			}
			
			log.info("Found " + formQuestions.size() + " questions in formVersion");
			
			int totalAnswersCreated = 0;
			int totalAnswersSkipped = 0;
			
			// 3. Pour chaque question, récupérer toutes les réponses possibles
			for (FormQuestions fq : formQuestions) {
				Question question = fq.getQuestion();
				if (question == null || question.getIsDeleted()) {
					log.info("Skipping deleted or null question");
					continue;
				}
				
				Integer questionId = question.getId();
				log.info("Processing question ID: " + questionId + " - " + question.getQuestionText());
				
				// Récupérer tous les answers pour cette question
				List<Answer> questionAnswers = answerRepository.findByQuestionId(questionId, false);
				
				log.info("Question ID " + questionId + " has " + questionAnswers.size() + " possible answers");
				
				if (questionAnswers.isEmpty()) {
					log.warning("No answers found for question " + questionId + ", skipping");
					continue;
				}
				
				// 4. Pour chaque answer, créer un candidate_answer avec is_selected = false
				for (Answer answer : questionAnswers) {
					if (answer == null || answer.getIsDeleted()) {
						log.info("Skipping deleted or null answer");
						continue;
					}
					
					log.info("Processing answer ID: " + answer.getId() + " for question " + questionId);
					
					// Vérifier si l'enregistrement existe déjà
					CandidateAnswer existing = candidateAnswerRepository.findByApplicationIdAndAnswerId(
						application.getId(), 
						answer.getId(), 
						false
					);
					
					if (existing == null) {
						// Créer un nouveau candidate_answer
						CandidateAnswer candidateAnswer = new CandidateAnswer();
						candidateAnswer.setApplications(application);
						candidateAnswer.setQuestion(question);
						candidateAnswer.setAnswer(answer);
						candidateAnswer.setIsSelected(false);
						candidateAnswer.setCreatedAt(Utilities.getCurrentDate());
						candidateAnswer.setCreatedBy(userId);
						candidateAnswer.setIsDeleted(false);
						
						CandidateAnswer saved = candidateAnswerRepository.save(candidateAnswer);
						if (saved != null) {
							totalAnswersCreated++;
							log.info("Created candidate_answer ID " + saved.getId() + " for answer ID: " + answer.getId());
						} else {
							log.severe("FAILED to create candidate_answer for answer ID: " + answer.getId());
						}
					} else {
						totalAnswersSkipped++;
						log.info("candidate_answer already exists (ID: " + existing.getId() + ") for answer ID: " + answer.getId());
					}
				}
			}
			
			log.info("=== INITIALIZATION COMPLETE ===");
			log.info("Total candidate_answers created: " + totalAnswersCreated);
			log.info("Total candidate_answers skipped (already exist): " + totalAnswersSkipped);
			log.info("================================");
			
		} catch (Exception e) {
			log.severe("ERREUR CRITIQUE lors de l'initialisation des candidate_answers: " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("Échec de l'initialisation des réponses candidates", e);
		}
		
		log.info("----end initializeCandidateAnswers-----");
	}

	/**
	 * Récupère le quiz (questions + réponses) pour une application donnée
	 * Nécessite un quiz_token valide pour des raisons de sécurité
	 * @param request Request contenant l'ID de l'application et le quiz_token
	 * @param locale locale
	 * @return Response contenant les questions et réponses
	 * @throws JsonProcessingException
	 */
	@Transactional
	public Response<ApplicationsDto> getQuizForApplication(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin getQuizForApplication-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<>();
		
		try {
			// Récupérer l'ID de l'application et le quiz_token depuis la requête
			ApplicationsDto dto = request.getData();
			if (dto == null || dto.getId() == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("ID de l'application manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			if (Utilities.isBlank(dto.getSearchString())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("Token de quiz manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			Integer applicationId = dto.getId();
			String quizToken = dto.getSearchString();
			log.info("Récupération du quiz pour l'application ID: " + applicationId + " avec token");
			
			// 1. Récupérer l'application et valider le quiz_token
			Applications application = applicationsRepository.findOne(applicationId, false);
			if (application == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Application non trouvée");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// Validation du quiz_token (sécurité)
			if (!quizToken.equals(application.getQuizToken())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_AUTH_FAIL);
				status.setMessage("Token de quiz invalide. Veuillez utiliser le lien reçu par email.");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.FORBIDDEN.value());
				return response;
			}
			
			// Vérifier que le quiz n'a pas déjà été complété
			if (tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(application.getQuizStatus())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_EXIST);
				status.setMessage("Ce quiz a déjà été complété");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
		log.info("=== QUIZ START DEBUG ===");
		log.info("Application ID: " + applicationId);
		log.info("Application status BEFORE: " + application.getQuizStatus());
		log.info("Application quiz_level BEFORE: " + application.getQuizLevel());
		log.info("PENDING value: " + tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue());
		log.info("STARTED value: " + tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
		log.info("Status equals PENDING? " + tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(application.getQuizStatus()));
		
		// Vérifier si des candidate_answers existent déjà pour cette application
		List<CandidateAnswer> existingAnswers = candidateAnswerRepository.findByApplicationId(applicationId, false);
		boolean needsInitialization = (existingAnswers == null || existingAnswers.isEmpty());
		
		log.info("Existing candidate_answers count: " + (existingAnswers != null ? existingAnswers.size() : 0));
		log.info("Needs initialization: " + needsInitialization);
		
		// Si le quiz est en statut PENDING, le mettre en STARTED et affecter la formVersion publiée
		if (tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(application.getQuizStatus())) {
			log.info(">>> Updating status from PENDING to STARTED...");
			
			// Affecter la formVersion publiée si pas encore assignée
			if (application.getFormVersion() == null) {
				SourceToken sourceToken = application.getSourceToken();
				if (sourceToken != null && sourceToken.getCampaigns() != null) {
					Integer campaignId = sourceToken.getCampaigns().getId();
					List<Form> forms = formRepository.findByCampaignId(campaignId, false);
					FormVersion publishedVersion = null;
					for (Form form : forms) {
						List<FormVersion> published = formVersionRepository.findByFormIdAndIsPublished(form.getId(), true, false);
						if (published != null && !published.isEmpty()) {
							publishedVersion = published.get(0);
							break;
						}
					}
					if (publishedVersion == null) {
						Status status = new Status();
						status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
						status.setMessage("Aucun formulaire publié trouvé pour cette campagne");
						response.setStatus(status);
						response.setHasError(true);
						response.setHttpCode(HttpStatus.NOT_FOUND.value());
						return response;
					}
					application.setFormVersion(publishedVersion);
					log.info(">>> FormVersion assignée: id=" + publishedVersion.getId() + ", version=" + publishedVersion.getVersionNumber());
				}
			}
			
			application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
			application.setQuizLevel(1);
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			Applications savedApp = applicationsRepository.save(application);
			log.info(">>> Quiz status mis à jour: STARTED, quiz_level initialisé à 1");
			
			// Vérifier immédiatement en base de données
			Applications verifyApp = applicationsRepository.findOne(applicationId, false);
			application = verifyApp;
		} else {
			log.info(">>> Quiz already started or completed (status: " + application.getQuizStatus() + ")");
		}
		log.info("========================");
		
		// Initialiser les candidate_answers si nécessaire (que le quiz soit PENDING ou STARTED)
		if (needsInitialization) {
			log.info("Initializing candidate_answers for application " + applicationId);
			initializeCandidateAnswers(application, request.getUser());
		} else {
			log.info("Candidate_answers already initialized, skipping initialization");
		}			// 2. Récupérer le source token et la campagne
			SourceToken sourceToken = application.getSourceToken();
			if (sourceToken == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Source token non trouvé");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			Campaigns campaign = sourceToken.getCampaigns();
			if (campaign == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Campagne non trouvée");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			log.info("Campagne trouvée: " + campaign.getCampaignTitle());
			
			// 3. Récupérer la formVersion depuis l'application
			FormVersion formVersion = application.getFormVersion();
			if (formVersion == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Aucun formulaire associé à cette application");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// 4. Récupérer les questions du formulaire TRIÉES par questionOrder (ASC)
			List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
			
			if (formQuestions == null || formQuestions.isEmpty()) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_EMPTY);
				status.setMessage("Aucune question trouvée pour ce formulaire");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			log.info("Nombre de questions trouvées: " + formQuestions.size());
			
			// 5. Calculer le temps total alloué si la campagne est chronométrée
			Integer totalTimeAllowed = null;
			if (campaign.getIsTimed() != null && campaign.getIsTimed()) {
				totalTimeAllowed = 0;
				for (FormQuestions fq : formQuestions) {
					Integer chrono = fq.getChronoOverride() != null ? fq.getChronoOverride() : (fq.getQuestion() != null ? fq.getQuestion().getQuestionChrono() : null);
					if (chrono != null) {
						totalTimeAllowed += chrono;
					}
				}
				log.info("Campagne chronométrée - Temps total alloué: " + totalTimeAllowed + " secondes");
			} else {
				log.info("Campagne non chronométrée");
			}
			
			// 6. Pour chaque question, récupérer les réponses
			List<Map<String, Object>> questionsWithAnswers = new ArrayList<>();
			
			for (FormQuestions fq : formQuestions) {
				Question question = fq.getQuestion();
				if (question != null && !question.getIsDeleted()) {
					Map<String, Object> questionData = new HashMap<>();
					questionData.put("id", question.getId());
					questionData.put("questionContent", question.getQuestionText());
					questionData.put("order", fq.getQuestionOrder());
					Integer chrono = fq.getChronoOverride() != null ? fq.getChronoOverride() : (question.getQuestionChrono() != null ? question.getQuestionChrono() : 10);
					questionData.put("chrono", chrono);
					
					// Récupérer les réponses pour cette question
					List<Answer> questionAnswers = answerRepository.findByQuestionId(question.getId(), false);
					List<Map<String, Object>> answersData = new ArrayList<>();
					
					for (Answer answer : questionAnswers) {
						if (answer != null && !answer.getIsDeleted()) {
							Map<String, Object> answerData = new HashMap<>();
							answerData.put("id", answer.getId());
							answerData.put("answerId", answer.getId());
							answerData.put("answerContent", answer.getAnswerText());
							// Ne pas envoyer isCorrect au frontend pour des raisons de sécurité
							answersData.add(answerData);
						}
					}
					
					questionData.put("answers", answersData);
					questionsWithAnswers.add(questionData);
				}
			}
			
			// 7. Préparer la réponse avec un DTO qui contient les données du quiz
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			
			// Stocker les données du quiz dans searchString (format JSON)
			Map<String, Object> quizData = new HashMap<>();
			quizData.put("applicationId", applicationId);
			quizData.put("campaignId", campaign.getId());
			quizData.put("campaignTitle", campaign.getCampaignTitle());
			quizData.put("isTimed", campaign.getIsTimed() != null ? campaign.getIsTimed() : false);
			if (totalTimeAllowed != null) {
				quizData.put("totalTimeAllowed", totalTimeAllowed);
			}
			quizData.put("questions", questionsWithAnswers);
			resultDto.setSearchString(Utilities.convertObjectToJson(quizData));
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage("Quiz récupéré avec succès");
			
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setItems(Arrays.asList(resultDto));
			response.setHasError(false);
			
			log.info("Quiz récupéré avec succès: " + questionsWithAnswers.size() + " questions");
			
		} catch (Exception e) {
			log.severe("Erreur lors de la récupération du quiz: " + e.getMessage());
			e.printStackTrace();
			Status status = new Status();
			status.setCode(StatusCode.TECH_INTERN_ERROR);
			status.setMessage("Erreur lors de la récupération du quiz");
			response.setStatus(status);
			response.setHasError(true);
			response.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end getQuizForApplication-----");
		return response;
	}

	/**
	 * Sauvegarde la sélection d'une réponse par le candidat
	 * Met à jour is_selected pour la réponse sélectionnée (true) et toutes les autres réponses de la même question (false)
	 * Met à jour quiz_level avec l'ordre de la question répondue
	 * 
	 * @param request Request contenant:
	 *   - id: applicationId
	 *   - searchString: quiz_token pour validation
	 *   - candidateCvPath: answerId sélectionné (utilisation temporaire de ce champ)
	 *   - candidatePhone: questionId (utilisation temporaire de ce champ)
	 * @param locale locale
	 * @return Response indiquant le succès ou l'échec de la sauvegarde
	 * @throws JsonProcessingException
	 */
	public Response<ApplicationsDto> saveQuizAnswer(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin saveQuizAnswer-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<>();
		
		try {
			// 1. Récupérer et valider les paramètres
			ApplicationsDto dto = request.getData();
			if (dto == null || dto.getId() == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("ID de l'application manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			if (Utilities.isBlank(dto.getSearchString())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("Token de quiz manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			if (Utilities.isBlank(dto.getCandidateCvPath()) || Utilities.isBlank(dto.getCandidatePhone())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("Question ID ou Answer ID manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			Integer applicationId = dto.getId();
			String quizToken = dto.getSearchString();
			Integer answerId = Integer.parseInt(dto.getCandidateCvPath());
			Integer questionId = Integer.parseInt(dto.getCandidatePhone());
			
			log.info("Saving answer for application " + applicationId + ", question " + questionId + ", answer " + answerId);
			
			// 2. Valider l'application et le quiz_token
			Applications application = applicationsRepository.findOne(applicationId, false);
			if (application == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Application non trouvée");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// Validation du quiz_token (sécurité)
			if (!quizToken.equals(application.getQuizToken())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_AUTH_FAIL);
				status.setMessage("Token de quiz invalide");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.FORBIDDEN.value());
				return response;
			}
			
			// Vérifier que le quiz n'est pas déjà complété
			if (tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(application.getQuizStatus())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_EXIST);
				status.setMessage("Ce quiz a déjà été complété");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			// 3. Récupérer toutes les candidate_answers pour cette application et cette question
			List<CandidateAnswer> candidateAnswers = candidateAnswerRepository.findByApplicationIdAndQuestionId(
				applicationId, 
				questionId, 
				false
			);
			
			if (candidateAnswers == null || candidateAnswers.isEmpty()) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Aucune réponse candidate trouvée pour cette question");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			log.info("Found " + candidateAnswers.size() + " candidate answers for question " + questionId);
			
			// 4. Mettre à jour is_selected pour toutes les réponses de cette question
			int updatedCount = 0;
			for (CandidateAnswer ca : candidateAnswers) {
				boolean shouldBeSelected = ca.getAnswer().getId().equals(answerId);
				
				// Mettre à jour seulement si la valeur change
				if (ca.getIsSelected() != shouldBeSelected) {
					ca.setIsSelected(shouldBeSelected);
					ca.setUpdatedAt(Utilities.getCurrentDate());
					ca.setUpdatedBy(request.getUser());
					candidateAnswerRepository.save(ca);
					updatedCount++;
					
					log.info("Updated candidate_answer ID " + ca.getId() + ": is_selected=" + shouldBeSelected);
				}
			}
			
			log.info("Updated " + updatedCount + " candidate_answers");
			
			// 5. Mettre à jour quiz_level avec l'ordre de la question répondue
			FormVersion formVersion = application.getFormVersion();
			if (formVersion != null) {
				// Trouver l'ordre de cette question dans le formulaire
				FormQuestions fq = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false)
					.stream()
					.filter(f -> f.getQuestion() != null && f.getQuestion().getId().equals(questionId))
					.findFirst()
					.orElse(null);
				
				if (fq != null && fq.getQuestionOrder() != null) {
					application.setQuizLevel(fq.getQuestionOrder());
					application.setUpdatedAt(Utilities.getCurrentDate());
					application.setUpdatedBy(request.getUser());
					applicationsRepository.save(application);
					
					log.info("Updated quiz_level to " + fq.getQuestionOrder() + " for application " + applicationId);
				}
			}
			
			// 6. Préparer la réponse
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			resultDto.setQuizLevel(application.getQuizLevel());
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage("Réponse sauvegardée avec succès");
			
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setItems(Arrays.asList(resultDto));
			response.setHasError(false);
			
			log.info("Answer saved successfully");
			
		} catch (NumberFormatException e) {
			log.severe("Invalid number format: " + e.getMessage());
			Status status = new Status();
			status.setCode(StatusCode.FUNC_FIELD_EMPTY);
			status.setMessage("Format de nombre invalide");
			response.setStatus(status);
			response.setHasError(true);
			response.setHttpCode(HttpStatus.BAD_REQUEST.value());
		} catch (Exception e) {
			log.severe("Error saving quiz answer: " + e.getMessage());
			e.printStackTrace();
			Status status = new Status();
			status.setCode(StatusCode.TECH_INTERN_ERROR);
			status.setMessage("Erreur lors de la sauvegarde de la réponse");
			response.setStatus(status);
			response.setHasError(true);
			response.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end saveQuizAnswer-----");
		return response;
	}

	/**
	 * Marque le quiz comme complété (quiz_status = COMPLETED)
	 * Met à jour le statut du quiz pour indiquer que le candidat a terminé et soumis toutes ses réponses
	 * 
	 * @param request Request contenant:
	 *   - id: applicationId
	 *   - searchString: quiz_token pour validation
	 * @param locale locale
	 * @return Response indiquant le succès ou l'échec de la mise à jour
	 * @throws JsonProcessingException
	 */
	public Response<ApplicationsDto> completeQuiz(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin completeQuiz-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<>();
		
		try {
			// 1. Récupérer et valider les paramètres
			ApplicationsDto dto = request.getData();
			if (dto == null || dto.getId() == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("ID de l'application manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			if (Utilities.isBlank(dto.getSearchString())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("Token de quiz manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			Integer applicationId = dto.getId();
			String quizToken = dto.getSearchString();
			
			log.info("Completion du quiz pour l'application " + applicationId);
			
			// 2. Récupérer l'application et valider le quiz_token
			Applications application = applicationsRepository.findOne(applicationId, false);
			if (application == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Application non trouvée");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// Validation du quiz_token (sécurité)
			if (!quizToken.equals(application.getQuizToken())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_AUTH_FAIL);
				status.setMessage("Token de quiz invalide");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.FORBIDDEN.value());
				return response;
			}
			
			// Vérifier que le quiz n'est pas déjà complété
			if (tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(application.getQuizStatus())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_EXIST);
				status.setMessage("Ce quiz a déjà été complété");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			// 3. Calculer le score et le nombre total de questions avant de compléter le quiz
			FormVersion formVersion = application.getFormVersion();
			if (formVersion == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Aucun formulaire associé à cette application");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// Récupérer les questions du formulaire (ordonnées)
			List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
			Integer totalQuestions = formQuestions.size();
			
			log.info("Nombre total de questions dans le formulaire: " + totalQuestions);
			
			// Récupérer toutes les réponses du candidat pour cette application
			List<CandidateAnswer> candidateAnswers = candidateAnswerRepository.findByApplicationId(applicationId, false);
			
			// Calculer le nombre de bonnes réponses
			Integer correctAnswersCount = 0;
			
			for (CandidateAnswer candidateAnswer : candidateAnswers) {
				if (candidateAnswer.getIsSelected()) {
					// Récupérer la Answer pour vérifier si c'est la bonne réponse
					Answer answer = candidateAnswer.getAnswer();
					if (answer != null && answer.getIsCorrect() != null && answer.getIsCorrect()) {
						correctAnswersCount++;
					}
				}
			}
			
			log.info("Nombre de bonnes réponses: " + correctAnswersCount + " / " + totalQuestions);
			
			// Calculer le pourcentage du score
			Integer quizScorePercent = (correctAnswersCount * 100) / totalQuestions;
			
			// 4. Mettre à jour l'application avec le score, total_questions, quiz_score_percent, statut COMPLETED et application_status SUBMITTED
			application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
			application.setApplicationStatus("SUBMITTED");
			application.setQuizScore(correctAnswersCount);
			application.setTotalQuestions(totalQuestions);
			application.setQuizScorePercent(quizScorePercent);
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			applicationsRepository.save(application);
			
			// 5. Verrouiller la formVersion (empêche toute modification des questions/réponses)
			if (formVersion.getIsLocked() == null || !formVersion.getIsLocked()) {
				formVersion.setIsLocked(true);
				formVersion.setUpdatedAt(Utilities.getCurrentDate());
				formVersion.setUpdatedBy(request.getUser());
				formVersionRepository.save(formVersion);
				log.info("FormVersion " + formVersion.getId() + " verrouillée");
			}
			
			log.info("Quiz complété pour l'application " + applicationId + " - Score: " + correctAnswersCount + "/" + totalQuestions);
			log.info("Application status mis à jour: SUBMITTED");
			
			// 5. Préparer la réponse
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			resultDto.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
			resultDto.setApplicationStatus("SUBMITTED");
			resultDto.setQuizScore(correctAnswersCount);
			resultDto.setTotalQuestions(totalQuestions);
			resultDto.setQuizScorePercent(quizScorePercent);
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage("Quiz complété avec succès");
			
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setItems(Arrays.asList(resultDto));
			response.setHasError(false);
			
			log.info("Quiz completion successful");
			
		} catch (Exception e) {
			log.severe("Error completing quiz: " + e.getMessage());
			e.printStackTrace();
			Status status = new Status();
			status.setCode(StatusCode.TECH_INTERN_ERROR);
			status.setMessage("Erreur lors de la completion du quiz");
			response.setStatus(status);
			response.setHasError(true);
			response.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end completeQuiz-----");
		return response;
	}

	public Response<ApplicationsDto> custom(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom ApplicationsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new ApplicationsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom ApplicationsDto-----");
		return response;
	}

	/**
	 * Suivi public de candidature par code de suivi + email.
	 * Retourne l'application + les étapes du pipeline + le progrès du candidat.
	 */
	@Transactional(readOnly = true)
	public Map<String, Object> trackApplication(String trackingCode, String email, Locale locale) throws ParseException {
		log.info("----begin trackApplication-----");
		Map<String, Object> result = new HashMap<>();

		if (StringUtils.isBlank(trackingCode) || StringUtils.isBlank(email)) {
			result.put("hasError", true);
			result.put("message", "Le code de suivi et l'email sont requis.");
			return result;
		}

		// 1. Chercher le token candidat
		List<CandidateToken> tokens = candidateTokenRepository.findByTokenString(trackingCode.trim(), false);
		if (tokens == null || tokens.isEmpty()) {
			result.put("hasError", true);
			result.put("message", "Code de suivi invalide.");
			return result;
		}

		// 2. Trouver l'application liée au token dont l'email correspond
		Applications application = null;
		for (CandidateToken token : tokens) {
			if (token.getApplications() != null
					&& token.getApplications().getCandidateEmail() != null
					&& token.getApplications().getCandidateEmail().equalsIgnoreCase(email.trim())) {
				application = token.getApplications();
				break;
			}
		}

		if (application == null) {
			result.put("hasError", true);
			result.put("message", "Aucune candidature trouvée pour ce code et cet email.");
			return result;
		}

		// 3. Données de base de la candidature
		Map<String, Object> appData = new HashMap<>();
		appData.put("id", application.getId());
		appData.put("candidateFirstName", application.getCandidateFirstName());
		appData.put("candidateLastName", application.getCandidateLastName());
		appData.put("candidateEmail", application.getCandidateEmail());
		appData.put("applicationStatus", application.getApplicationStatus());
		appData.put("quizStatus", application.getQuizStatus());
		appData.put("createdAt", application.getCreatedAt());
		appData.put("emailVerified", application.getEmailVerified());

		// 4. Campagne et pipeline template
		String campaignTitle = null;
		Integer pipelineTemplateId = null;
		if (application.getSourceToken() != null && application.getSourceToken().getCampaigns() != null) {
			Campaigns campaign = application.getSourceToken().getCampaigns();
			campaignTitle = campaign.getCampaignTitle();
			if (campaign.getPipelineTemplate() != null) {
				pipelineTemplateId = campaign.getPipelineTemplate().getId();
			}
		}
		appData.put("campaignTitle", campaignTitle);

		// 5. Étapes du pipeline
		List<Map<String, Object>> stages = new ArrayList<>();
		if (pipelineTemplateId != null) {
			List<PipelineStage> pipelineStages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(pipelineTemplateId);
			if (pipelineStages != null) {
				for (PipelineStage stage : pipelineStages) {
					Map<String, Object> stageData = new HashMap<>();
					stageData.put("id", stage.getId());
					stageData.put("stageLabel", stage.getStageLabel());
					stageData.put("stageType", stage.getStageType());
					stageData.put("stageOrder", stage.getStageOrder());
					stageData.put("isRequired", stage.getIsRequired());
					stageData.put("isEliminatory", stage.getIsEliminatory());
					stages.add(stageData);
				}
			}
		}

		// 6. Progrès du candidat
		List<Map<String, Object>> progressList = new ArrayList<>();
		List<ApplicationProgress> progressItems = applicationProgressRepository
				.findByApplicationIdOrderByStageOrder(application.getId());
		if (progressItems != null) {
			for (ApplicationProgress p : progressItems) {
				Map<String, Object> progressData = new HashMap<>();
				progressData.put("id", p.getId());
				progressData.put("pipelineStageId", p.getPipelineStage() != null ? p.getPipelineStage().getId() : null);
				progressData.put("progressStatus", p.getProgressStatus());
				progressData.put("startedAt", p.getStartedAt());
				progressData.put("completedAt", p.getCompletedAt());
				progressData.put("score", p.getScore());
				progressList.add(progressData);
			}
		}

		result.put("hasError", false);
		result.put("application", appData);
		result.put("stages", stages);
		result.put("progress", progressList);

		log.info("----end trackApplication-----");
		return result;
	}
}
