                                                                                																			
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
			if (dto.getEvaluationScore() != null && dto.getEvaluationScore() > 0) {
				entityToSave.setEvaluationScore(dto.getEvaluationScore());
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
		
		String subject = "Vérification de votre adresse email - Synelia";
		
		String contenu = "Bonjour " + application.getCandidateFirstName() + " " + application.getCandidateLastName() + ",<br/><br/>";
		contenu += "Merci d'avoir soumis votre candidature chez Synelia !<br/><br/>";
		contenu += "Pour continuer le processus de recrutement, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :<br/><br/>";
		contenu += "<a href=\"" + verificationLink + "\" style=\"background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;\">Vérifier mon email</a><br/><br/>";
		contenu += "Ou copiez ce lien dans votre navigateur :<br/>";
		contenu += verificationLink + "<br/><br/>";
		contenu += "Ce lien est valide pendant 48 heures.<br/><br/>";
		contenu += "Si vous n'avez pas soumis de candidature chez Synelia, veuillez ignorer cet email.<br/><br/>";
		contenu += "Cordialement,<br/>";
		contenu += "L'équipe Synelia";
		
		context = new Context();
		String template = "blank";
		context.setVariable("contenu", contenu);
		context.setVariable("entete", "Vérification Email");
		context.setVariable("titre", "Vérification de votre adresse email");
		context.setVariable("appLink", appLink);
		
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
