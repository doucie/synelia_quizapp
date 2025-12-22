                                                                                																			
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
	private CandidateAnswersRepository candidateAnswersRepository;
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
	private CampaignQuestionsRepository campaignQuestionsRepository;
	@Autowired
	private QuestionsAnswersRepository questionsAnswersRepository;
	@Autowired
	private HostingUtils hostingUtils;
	@Autowired
	private ParamsUtils paramsUtils;
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
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Applications entityToSave = null;
			entityToSave = ApplicationsTransformer.INSTANCE.toEntity(dto, existingSourceToken);
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
			if (Utilities.notBlank(dto.getCandidateFirstName())) {
				entityToSave.setCandidateFirstName(dto.getCandidateFirstName());
			}
			if (Utilities.notBlank(dto.getCandidateLastName())) {
				entityToSave.setCandidateLastName(dto.getCandidateLastName());
			}
			if (Utilities.notBlank(dto.getCandidateEmail())) {
				entityToSave.setCandidateEmail(dto.getCandidateEmail());
			}
			if (Utilities.notBlank(dto.getCandidatePhone())) {
				entityToSave.setCandidatePhone(dto.getCandidatePhone());
			}
			if (Utilities.notBlank(dto.getCandidateCvPath())) {
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
			if (Utilities.notBlank(dto.getApplicationStatus())) {
				entityToSave.setApplicationStatus(dto.getApplicationStatus());
			}
			if (Utilities.notBlank(dto.getVisitToken())) {
				entityToSave.setVisitToken(dto.getVisitToken());
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

			// candidateAnswers
			List<CandidateAnswers> listOfCandidateAnswers = candidateAnswersRepository.findByApplicationId(existingEntity.getId(), false);
			if (listOfCandidateAnswers != null && !listOfCandidateAnswers.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateAnswers.size() + ")", locale));
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
		
		String subject = "Vérification de votre adresse email - Synelia";
		
		String contenu = "Bonjour " + application.getCandidateFirstName() + " " + application.getCandidateLastName() + ",<br/><br/>";
		contenu += "Merci d'avoir soumis votre candidature chez Synelia !<br/><br/>";
		contenu += "Pour continuer le processus de recrutement, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.<br/><br/>";
		contenu += "Ce lien est valide pendant 48 heures.<br/><br/>";
		contenu += "Si vous n'avez pas soumis de candidature chez Synelia, veuillez ignorer cet email.<br/><br/>";
		contenu += "Cordialement,<br/>";
		contenu += "L'équipe Synelia";
		
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
	 * Initialise les réponses candidates pour toutes les questions de la campagne
	 * Crée un enregistrement dans candidate_answers pour chaque questions_answers de la campagne
	 * Tous les enregistrements sont initialisés avec is_selected = false
	 * 
	 * @param application L'application du candidat
	 * @param userId L'utilisateur qui effectue l'action
	 */
	private void initializeCandidateAnswers(Applications application, Integer userId) {
		log.info("----begin initializeCandidateAnswers for application ID: " + application.getId() + "-----");
		
		try {
			// 1. Récupérer la campagne depuis l'application
			SourceToken sourceToken = application.getSourceToken();
			if (sourceToken == null || sourceToken.getCampaigns() == null) {
				log.severe("ERREUR CRITIQUE: Cannot initialize candidate answers - no campaign found for application " + application.getId());
				return;
			}
			
			Campaigns campaign = sourceToken.getCampaigns();
			Integer campaignId = campaign.getId();
			log.info("Initializing answers for campaign ID: " + campaignId);
			
			// 2. Récupérer toutes les questions de la campagne (ordonnées)
			List<CampaignQuestions> campaignQuestions = campaignQuestionsRepository.findByCampaignIdOrderByOrder(campaignId, false);
			
			if (campaignQuestions == null || campaignQuestions.isEmpty()) {
				log.severe("ERREUR CRITIQUE: No questions found for campaign " + campaignId);
				return;
			}
			
			log.info("Found " + campaignQuestions.size() + " questions in campaign");
			
			int totalAnswersCreated = 0;
			int totalAnswersSkipped = 0;
			
        // 3. Pour chaque question, récupérer toutes les réponses possibles (questions_answers)
        for (CampaignQuestions cq : campaignQuestions) {
            Questions question = cq.getQuestions();
            if (question == null || question.getIsDeleted()) {
                log.info("Skipping deleted or null question");
                continue;
            }
            
            Integer questionId = question.getId();
            log.info("Processing question ID: " + questionId + " - " + question.getQuestionContent());
            
            // Récupérer tous les questions_answers pour cette question
            List<QuestionsAnswers> questionAnswers = questionsAnswersRepository.findByQuestionId(questionId, false);
            
            log.info("Question ID " + questionId + " has " + questionAnswers.size() + " possible answers");
            
            if (questionAnswers.isEmpty()) {
                log.warning("No answers found for question " + questionId + ", skipping");
                continue;
            }
            
            // 4. Pour chaque questions_answers, créer un candidate_answers avec is_selected = false
            for (QuestionsAnswers qa : questionAnswers) {
                if (qa == null || qa.getIsDeleted()) {
                    log.info("Skipping deleted or null questions_answers");
                    continue;
                }
                
                log.info("Processing questions_answers ID: " + qa.getId() + " for question " + questionId);
                
                // Vérifier si l'enregistrement existe déjà
                CandidateAnswers existing = candidateAnswersRepository.findByApplicationIdAndQuestionsAnswersId(
                    application.getId(), 
                    qa.getId(), 
                    false
                );
                
                if (existing == null) {
                    // Créer un nouveau candidate_answer
                    CandidateAnswers candidateAnswer = new CandidateAnswers();
                    candidateAnswer.setApplications(application);
                    candidateAnswer.setQuestionsAnswers(qa);
                    candidateAnswer.setIsSelected(false); // Pas encore sélectionné
                    candidateAnswer.setCreatedAt(Utilities.getCurrentDate());
                    candidateAnswer.setCreatedBy(userId);
                    candidateAnswer.setIsDeleted(false);
                    
                    CandidateAnswers saved = candidateAnswersRepository.save(candidateAnswer);
                    if (saved != null) {
                        totalAnswersCreated++;
                        log.info("✓ Created candidate_answer ID " + saved.getId() + " for questions_answers ID: " + qa.getId());
                    } else {
                        log.severe("✗ FAILED to create candidate_answer for questions_answers ID: " + qa.getId());
                    }
                } else {
                    totalAnswersSkipped++;
                    log.info("⊘ candidate_answer already exists (ID: " + existing.getId() + ") for questions_answers ID: " + qa.getId());
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
			// Propager l'exception pour alerter qu'il y a un problème critique
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
		List<CandidateAnswers> existingAnswers = candidateAnswersRepository.findByApplicationId(applicationId, false);
		boolean needsInitialization = (existingAnswers == null || existingAnswers.isEmpty());
		
		log.info("Existing candidate_answers count: " + (existingAnswers != null ? existingAnswers.size() : 0));
		log.info("Needs initialization: " + needsInitialization);
		
		// Si le quiz est en statut PENDING, le mettre en STARTED
		if (tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(application.getQuizStatus())) {
			log.info(">>> Updating status from PENDING to STARTED...");
			application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
			application.setQuizLevel(1); // Initialiser à 1 (commence à la première question avec order=1)
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			Applications savedApp = applicationsRepository.save(application);
			log.info(">>> Quiz status mis à jour: STARTED, quiz_level initialisé à 1");
			log.info(">>> Saved application status: " + savedApp.getQuizStatus());
			log.info(">>> Saved application quiz_level: " + savedApp.getQuizLevel());
			
			// Vérifier immédiatement en base de données
			Applications verifyApp = applicationsRepository.findOne(applicationId, false);
			log.info(">>> VERIFICATION - Status in DB: " + verifyApp.getQuizStatus());
			log.info(">>> VERIFICATION - quiz_level in DB: " + verifyApp.getQuizLevel());
			
			// Utiliser l'application vérifiée pour la suite
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
		}			// 2. Récupérer le source token
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
			
			// 3. Récupérer la campagne depuis le source token
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
			
			// 4. Récupérer les questions de la campagne TRIÉES par order (ASC)
			List<CampaignQuestions> campaignQuestions = campaignQuestionsRepository.findByCampaignIdOrderByOrder(campaign.getId(), false);
			
			if (campaignQuestions == null || campaignQuestions.isEmpty()) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_EMPTY);
				status.setMessage("Aucune question trouvée pour cette campagne");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			log.info("Nombre de questions trouvées: " + campaignQuestions.size());
			
			// 5. Calculer le temps total alloué si la campagne est chronométrée
			Integer totalTimeAllowed = null;
			if (campaign.getIsTimed() != null && campaign.getIsTimed()) {
				totalTimeAllowed = 0;
				for (CampaignQuestions cq : campaignQuestions) {
					if (cq.getChrono() != null) {
						totalTimeAllowed += cq.getChrono();
					}
				}
				log.info("Campagne chronométrée - Temps total alloué: " + totalTimeAllowed + " secondes");
			} else {
				log.info("Campagne non chronométrée");
			}
			
			// 6. Pour chaque question, récupérer les réponses
			List<Map<String, Object>> questionsWithAnswers = new ArrayList<>();
			
			for (CampaignQuestions cq : campaignQuestions) {
				Questions question = cq.getQuestions();
				if (question != null && !question.getIsDeleted()) {
					Map<String, Object> questionData = new HashMap<>();
					questionData.put("id", question.getId());
					questionData.put("questionContent", question.getQuestionContent());
					questionData.put("order", cq.getOrder()); // Ordre de la question dans la campagne
					questionData.put("chrono", cq.getChrono() != null ? cq.getChrono() : 10); // Temps alloué pour cette question (défaut 10s)
					
					// Récupérer les réponses pour cette question
					List<QuestionsAnswers> questionAnswers = questionsAnswersRepository.findByQuestionId(question.getId(), false);
					List<Map<String, Object>> answersData = new ArrayList<>();
					
					for (QuestionsAnswers qa : questionAnswers) {
						Answers answer = qa.getAnswers();
						if (answer != null && !answer.getIsDeleted()) {
							Map<String, Object> answerData = new HashMap<>();
							answerData.put("id", answer.getId()); // ID de la table answers
							answerData.put("questionsAnswersId", qa.getId()); // ID de la table questions_answers (nécessaire pour saveQuizAnswer)
							answerData.put("answerContent", answer.getAnswerContent());
							// Ne pas envoyer isCorrect au frontend pour des raisons de sécurité
							answersData.add(answerData);
						}
					}
					
					questionData.put("answers", answersData);
					questionsWithAnswers.add(questionData);
				}
			}
			
			// 6. Préparer la réponse avec un DTO qui contient les données du quiz
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
	 *   - candidateCvPath: questionsAnswersId sélectionné (utilisation temporaire de ce champ)
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
				status.setMessage("Question ID ou Questions-Answers ID manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			Integer applicationId = dto.getId();
			String quizToken = dto.getSearchString();
			Integer questionsAnswersId = Integer.parseInt(dto.getCandidateCvPath());
			Integer questionId = Integer.parseInt(dto.getCandidatePhone());
			
			log.info("Saving answer for application " + applicationId + ", question " + questionId + ", answer " + questionsAnswersId);
			
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
			List<CandidateAnswers> candidateAnswers = candidateAnswersRepository.findByApplicationIdAndQuestionId(
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
			for (CandidateAnswers ca : candidateAnswers) {
				boolean shouldBeSelected = ca.getQuestionsAnswers().getId().equals(questionsAnswersId);
				
				// Mettre à jour seulement si la valeur change
				if (ca.getIsSelected() != shouldBeSelected) {
					ca.setIsSelected(shouldBeSelected);
					ca.setUpdatedAt(Utilities.getCurrentDate());
					ca.setUpdatedBy(request.getUser());
					candidateAnswersRepository.save(ca);
					updatedCount++;
					
					log.info("Updated candidate_answer ID " + ca.getId() + ": is_selected=" + shouldBeSelected);
				}
			}
			
			log.info("Updated " + updatedCount + " candidate_answers");
			
			// 5. Mettre à jour quiz_level avec l'ordre de la question répondue
			SourceToken sourceToken = application.getSourceToken();
			if (sourceToken != null && sourceToken.getCampaigns() != null) {
				Integer campaignId = sourceToken.getCampaigns().getId();
				
				// Trouver l'ordre de cette question dans la campagne
				CampaignQuestions cq = campaignQuestionsRepository.findByCampaignIdOrderByOrder(campaignId, false)
					.stream()
					.filter(c -> c.getQuestions() != null && c.getQuestions().getId().equals(questionId))
					.findFirst()
					.orElse(null);
				
				if (cq != null && cq.getOrder() != null) {
					application.setQuizLevel(cq.getOrder());
					application.setUpdatedAt(Utilities.getCurrentDate());
					application.setUpdatedBy(request.getUser());
					applicationsRepository.save(application);
					
					log.info("Updated quiz_level to " + cq.getOrder() + " for application " + applicationId);
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
			SourceToken sourceToken = application.getSourceToken();
			if (sourceToken == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Token source non trouvé");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			// Récupérer la campagne
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
			
			// Récupérer les questions de la campagne (ordonnées)
			List<CampaignQuestions> campaignQuestions = campaignQuestionsRepository.findByCampaignIdOrderByOrder(campaign.getId(), false);
			Integer totalQuestions = campaignQuestions.size();
			
			log.info("Nombre total de questions dans la campagne: " + totalQuestions);
			
			// Récupérer toutes les réponses du candidat pour cette application
			List<CandidateAnswers> candidateAnswers = candidateAnswersRepository.findByApplicationId(applicationId, false);
			
			// Calculer le nombre de bonnes réponses
			Integer correctAnswersCount = 0;
			
			for (CandidateAnswers candidateAnswer : candidateAnswers) {
				if (candidateAnswer.getIsSelected()) {
					// Récupérer la QuestionsAnswers pour vérifier si c'est la bonne réponse
					QuestionsAnswers qa = candidateAnswer.getQuestionsAnswers();
					if (qa != null && qa.getIsCorrect() != null && qa.getIsCorrect()) {
						correctAnswersCount++;
					}
				}
			}
			
			log.info("Nombre de bonnes réponses: " + correctAnswersCount + " / " + totalQuestions);
			
			// Calculer le pourcentage du score
			Integer quizScorePercent = (correctAnswersCount * 100) / totalQuestions;
			
			// 4. Mettre à jour l'application avec le score, total_questions, quiz_score_percent, statut COMPLETED et application_status SUBMITTED
			application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
			application.setApplicationStatus("SUBMITTED"); // Le candidat a soumis sa candidature en complétant le quiz
			application.setQuizScore(correctAnswersCount);
			application.setTotalQuestions(totalQuestions);
			application.setQuizScorePercent(quizScorePercent);
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			applicationsRepository.save(application);
			
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
}
