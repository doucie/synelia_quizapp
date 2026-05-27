                                                                                																			
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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import java.util.concurrent.ThreadLocalRandom;

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
import tech.synelia.quizapp.utils.enums.EmailActionType;
import tech.synelia.quizapp.utils.enums.CandidateAskRequestType;
import tech.synelia.quizapp.utils.enums.FormAssignmentExhaustionPolicy;
import tech.synelia.quizapp.utils.enums.FormAssignmentStrategy;
import tech.synelia.quizapp.utils.enums.CandidateAskStatus;
import tech.synelia.quizapp.utils.enums.ManualCorrectionStatus;
import tech.synelia.quizapp.utils.enums.ProgressStatus;
import tech.synelia.quizapp.utils.enums.QuestionType;
import tech.synelia.quizapp.utils.enums.StageType;
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
	private InterviewsRepository interviewsRepository;
	@Autowired
	private CandidateTokenRepository candidateTokenRepository;
	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
	@Autowired
	private FormVersionRepository formVersionRepository;
	@Autowired
	private CampaignFormRepository campaignFormRepository;
	@Autowired
	private FormBusiness formBusiness;
	@Autowired
	private QuestionRepository questionRepository;
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
	private NotificationsRepository notificationsRepository;
	@Autowired
	private EntityPermissionRepository entityPermissionRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private PipelineStageRepository pipelineStageRepository;
	@Autowired
	private ApplicationProgressRepository applicationProgressRepository;
	@Autowired
	private PlatformReadinessService platformReadinessService;
	@Autowired
	private CampaignPublicAccessService campaignPublicAccessService;
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
	private static final int TRACKING_CODE_LENGTH = 6;
	private static final String TRACKING_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private static final java.security.SecureRandom TRACKING_CODE_RANDOM = new java.security.SecureRandom();

	private static final class QuizScoringSummary {
		private final Integer correctAnswersCount;
		private final Integer totalQuestions;
		private final Integer quizScorePercent;
		private final String manualCorrectionStatus;

		private QuizScoringSummary(Integer correctAnswersCount, Integer totalQuestions, Integer quizScorePercent, String manualCorrectionStatus) {
			this.correctAnswersCount = correctAnswersCount;
			this.totalQuestions = totalQuestions;
			this.quizScorePercent = quizScorePercent;
			this.manualCorrectionStatus = manualCorrectionStatus;
		}
	}

	private static final class QuizTimingState {
		private final boolean timed;
		private final Integer totalTimeAllowed;
		private final Integer timeElapsed;
		private final Integer remainingTime;
		private final boolean expired;

		private QuizTimingState(boolean timed, Integer totalTimeAllowed, Integer timeElapsed, Integer remainingTime, boolean expired) {
			this.timed = timed;
			this.totalTimeAllowed = totalTimeAllowed;
			this.timeElapsed = timeElapsed;
			this.remainingTime = remainingTime;
			this.expired = expired;
		}
	}

	private static final double DEFAULT_QUIZ_PASSING_SCORE = 50.0d;
	private static final int DEFAULT_QUIZ_INACTIVITY_TIMEOUT_MINUTES = 15;
	private static final int SYSTEM_ACTOR_USER_ID = 0;
	private static final String QUIZ_INACTIVITY_MESSAGE = "Cette candidature a été abandonnée après une période d'inactivité.";
	private static final Set<String> NEW_APPLICATION_NOTIFICATION_PERMISSION_KEYS = Collections.unmodifiableSet(
			new HashSet<String>(Arrays.asList("ADMIN", "CREATOR", "FOLLOW", "ADVANCE_PIPELINE")));
	private static final Set<String> INTERVIEW_RESPONSE_NOTIFICATION_PERMISSION_KEYS = Collections.unmodifiableSet(
			new HashSet<String>(Arrays.asList("ADMIN", "CREATOR", "FOLLOW", "PLANIFY", "ADVANCE_PIPELINE")));

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
	@Transactional
	public Response<ApplicationsDto> create(Request<ApplicationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Applications-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		List<Applications>        items    = new ArrayList<Applications>();
		Map<Integer, Integer> pendingApplicationsByCampaign = new HashMap<Integer, Integer>();
		Map<Integer, Integer> pendingAssignedFormsByCampaign = new HashMap<Integer, Integer>();
		Map<String, Set<Integer>> pendingCandidateFormHistory = new HashMap<String, Set<Integer>>();

		platformReadinessService.requireEmailDeliveryAvailable(
				EmailActionType.APPLICATION_VERIFICATION, locale);
		if (request.getUser() == null || request.getUser() <= 0) {
			platformReadinessService.requireActiveLegalText("candidate_consent", locale);
		}
			
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
				Integer campaignId = existingSourceToken.getCampaigns() != null ? existingSourceToken.getCampaigns().getId() : null;
				int pendingApplicationsForCampaign = campaignId == null
						? 0
						: pendingApplicationsByCampaign.getOrDefault(campaignId, 0);
				campaignPublicAccessService.ensureSourceTokenAllowsApplications(
						existingSourceToken,
						pendingApplicationsForCampaign,
						locale);
				if (campaignId != null) {
					pendingApplicationsByCampaign.merge(campaignId, 1, Integer::sum);
				}
			}
			// Verify if formVersion exist
			FormVersion existingFormVersion = null;
			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0){
				existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
				validateFormVersionMatchesCampaign(existingFormVersion, existingSourceToken, locale);
			} else if (existingSourceToken != null) {
				existingFormVersion = selectFormVersionForCandidate(
						existingSourceToken,
						dto.getCandidateEmail(),
						null,
						pendingAssignedFormsByCampaign,
						pendingCandidateFormHistory,
						locale);
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
			entityToSave.setQuizManualCorrectionStatus(ManualCorrectionStatus.NOT_REQUIRED.getValue());
			applyQuizTimingSnapshot(entityToSave);
			entityToSave.setApplicationAbandoned(false); // Initialiser à false
			registerPendingFormAssignment(existingSourceToken, dto.getCandidateEmail(), existingFormVersion,
					pendingAssignedFormsByCampaign, pendingCandidateFormHistory);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Applications> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = applicationsRepository.saveAll((Iterable<Applications>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("applications", locale));
			}
			Map<Integer, String> trackingCodesByApplicationId = new HashMap<Integer, String>();
			for (Applications savedApp : itemsSaved) {
				trackingCodesByApplicationId.put(savedApp.getId(), ensureCandidateTrackingCode(savedApp, request.getUser()));
			}
			for (Applications savedApp : itemsSaved) {
				lockFormVersionIfNeeded(savedApp.getFormVersion(), request.getUser());
			}
			List<ApplicationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? ApplicationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : ApplicationsTransformer.INSTANCE.toDtos(itemsSaved);
			for (ApplicationsDto dto : itemsDto) {
				dto.setTrackingCode(trackingCodesByApplicationId.get(dto.getId()));
			}

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

			for (Applications savedApp : itemsSaved) {
				try {
					notifyAuthorizedRecruitersOfNewApplication(savedApp, request.getUser());
				} catch (Exception e) {
					log.warning("Erreur lors de la notification interne de nouvelle candidature " + savedApp.getId() + ": " + e.getMessage());
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
			// visit_token is legacy and no longer drives candidate resume flows.
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
		String trackingCode = ensureCandidateTrackingCode(application, application.getCreatedBy());
		
		log.info("=== EMAIL VERIFICATION LINK DEBUG ===");
		log.info("appLink from config: " + appLink);
		log.info("token: " + token);
		log.info("verificationLink: " + verificationLink);
		log.info("=====================================");
		
		String subject;
		String contenu;

		EmailTemplate emailTemplate = platformReadinessService.requireActiveEmailTemplate(
				EmailActionType.APPLICATION_VERIFICATION, locale);
		Map<String, String> vars = new HashMap<>();
		vars.put("first_name", application.getCandidateFirstName());
		vars.put("last_name", application.getCandidateLastName());
		vars.put("verification_link", verificationLink);
		vars.put("tracking_code", trackingCode);
		vars.put("campaign_title", "");
		subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
		contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);
		
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
			resultDto.setTrackingCode(ensureCandidateTrackingCode(application, request.getUser()));
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
				String questionType = StringUtils.trimToEmpty(question.getQuestionType());
				log.info("Processing question ID: " + questionId + " - " + question.getQuestionText());

				if (QuestionType.TEXT.getValue().equals(questionType)) {
					List<CandidateAnswer> existingQuestionAnswers = candidateAnswerRepository.findByApplicationIdAndQuestionId(
						application.getId(),
						questionId,
						false
					);
					if (existingQuestionAnswers == null || existingQuestionAnswers.isEmpty()) {
						CandidateAnswer candidateAnswer = new CandidateAnswer();
						candidateAnswer.setApplications(application);
						candidateAnswer.setQuestion(question);
						candidateAnswer.setAnswer(null);
						candidateAnswer.setIsSelected(false);
						candidateAnswer.setCreatedAt(Utilities.getCurrentDate());
						candidateAnswer.setCreatedBy(userId);
						candidateAnswer.setIsDeleted(false);
						CandidateAnswer saved = candidateAnswerRepository.save(candidateAnswer);
						if (saved != null) {
							totalAnswersCreated++;
							log.info("Created free-text candidate_answer ID " + saved.getId() + " for question ID: " + questionId);
						}
					} else {
						totalAnswersSkipped += existingQuestionAnswers.size();
						log.info("Free-text candidate_answer already exists for question " + questionId);
					}
					continue;
				}
				
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
			Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, quizToken, true);
			if (accessError != null) {
				return accessError;
			}

			Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, request.getUser(), locale);
			if (inactivityError != null) {
				return inactivityError;
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
		boolean quizResumable = isQuizResumable(application);
		
		log.info("Existing candidate_answers count: " + (existingAnswers != null ? existingAnswers.size() : 0));
		log.info("Needs initialization: " + needsInitialization);
		log.info("Quiz resumable: " + quizResumable);

		Response<ApplicationsDto> resumePolicyError = rejectRandomizedQuizResume(application, !needsInitialization);
		if (resumePolicyError != null) {
			return resumePolicyError;
		}
		
			boolean applicationChanged = false;

		// Si le quiz est en statut PENDING, le mettre en STARTED
		if (tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(application.getQuizStatus())) {
			log.info(">>> Updating status from PENDING to STARTED...");
			application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
			application.setQuizLevel(quizResumable ? 1 : null);
			applicationChanged = true;
		} else {
			log.info(">>> Quiz already started or completed (status: " + application.getQuizStatus() + ")");
		}

		if (applicationChanged) {
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			applicationsRepository.save(application);
			log.info(">>> Donnees quiz mises a jour pour l'application " + applicationId);
			application = applicationsRepository.findOne(applicationId, false);
		}
			ensureQuizStageReady(application, request.getUser(), locale);
			QuizTimingState timingState = resolveQuizTimingState(application, request.getUser());
			if (timingState.expired) {
				completeQuizInternal(application, request.getUser(), locale);
				return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, "Temps limite dépassé. Le quiz a été soumis automatiquement.");
			}
			touchQuizLastActivity(application, request.getUser());
		log.info("========================");
		
		// Initialiser les candidate_answers si nécessaire (que le quiz soit PENDING ou STARTED)
		if (needsInitialization) {
			log.info("Initializing candidate_answers for application " + applicationId);
			initializeCandidateAnswers(application, request.getUser());
		} else {
			log.info("Candidate_answers already initialized, skipping initialization");
		}

			List<CandidateAnswer> candidateAnswersForApplication = candidateAnswerRepository.findByApplicationId(applicationId, false);
			Map<Integer, List<CandidateAnswer>> candidateAnswersByQuestion = groupCandidateAnswersByQuestion(candidateAnswersForApplication);

			// 2. Récupérer le source token et la campagne
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
			
			// 5. Reprendre le snapshot de temps fige sur la candidature
			Integer totalTimeAllowed = timingState.totalTimeAllowed;
			if (timingState.timed) {
				log.info("Quiz chronométré - Temps total alloué: " + totalTimeAllowed + " secondes");
			} else {
				log.info("Quiz non chronométré");
			}
			
			// 6. Pour chaque question, récupérer les réponses
			List<Map<String, Object>> questionsWithAnswers = new ArrayList<>();
			
			for (FormQuestions fq : formQuestions) {
				Question question = fq.getQuestion();
				if (question != null && !question.getIsDeleted()) {
					Map<String, Object> questionData = new HashMap<>();
					String questionType = StringUtils.trimToEmpty(question.getQuestionType());
					List<CandidateAnswer> questionCandidateAnswers = candidateAnswersByQuestion.getOrDefault(question.getId(), Collections.emptyList());
					List<Integer> selectedAnswerIds = new ArrayList<>();
					String freeTextResponse = null;
					for (CandidateAnswer candidateAnswer : questionCandidateAnswers) {
						if (candidateAnswer == null) {
							continue;
						}
						if (candidateAnswer.getAnswer() != null && Boolean.TRUE.equals(candidateAnswer.getIsSelected())) {
							selectedAnswerIds.add(candidateAnswer.getAnswer().getId());
						}
						if (candidateAnswer.getAnswer() == null) {
							freeTextResponse = candidateAnswer.getFreeTextResponse();
						}
					}
					questionData.put("id", question.getId());
					questionData.put("questionContent", question.getQuestionText());
					questionData.put("questionType", questionType);
					questionData.put("order", fq.getQuestionOrder());
					Integer chrono = fq.getChronoOverride() != null ? fq.getChronoOverride() : (question.getQuestionChrono() != null ? question.getQuestionChrono() : 10);
					questionData.put("chrono", chrono);
					questionData.put("selectedAnswerIds", selectedAnswerIds);
					questionData.put("freeTextResponse", freeTextResponse);

					if (QuestionType.TEXT.getValue().equals(questionType)) {
						questionData.put("answers", Collections.emptyList());
						questionsWithAnswers.add(questionData);
						continue;
					}
					
					// Récupérer les réponses pour cette question
					List<Answer> questionAnswers = answerRepository.findByQuestionId(question.getId(), false);
					List<Map<String, Object>> answersData = new ArrayList<>();
					
					for (Answer answer : questionAnswers) {
						if (answer != null && !answer.getIsDeleted()) {
							Map<String, Object> answerData = new HashMap<>();
							CandidateAnswer answerCandidateState = questionCandidateAnswers.stream()
								.filter(item -> item != null && item.getAnswer() != null && Objects.equals(item.getAnswer().getId(), answer.getId()))
								.findFirst()
								.orElse(null);
							answerData.put("id", answer.getId());
							answerData.put("answerId", answer.getId());
							answerData.put("answerContent", answer.getAnswerText());
							answerData.put("allowAdditionalComment", Boolean.TRUE.equals(answer.getAllowAdditionalComment()));
							answerData.put("additionalCommentRequired", Boolean.TRUE.equals(answer.getAdditionalCommentRequired()));
							answerData.put("additionalCommentPlaceholder", answer.getAdditionalCommentPlaceholder());
							answerData.put("freeTextResponse", answerCandidateState != null ? answerCandidateState.getFreeTextResponse() : null);
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
			quizData.put("isTimed", timingState.timed);
			quizData.put("resumable", quizResumable);
			if (totalTimeAllowed != null) {
				quizData.put("totalTimeAllowed", totalTimeAllowed);
			}
			quizData.put("timeElapsed", timingState.timeElapsed);
			quizData.put("remainingTime", timingState.remainingTime);
			quizData.put("quizStatus", application.getQuizStatus());
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

	private void validateFormVersionMatchesCampaign(FormVersion formVersion, SourceToken sourceToken, Locale locale) {
		if (formVersion == null || sourceToken == null || sourceToken.getCampaigns() == null) {
			return;
		}

		if (!Boolean.TRUE.equals(formVersion.getIsPublished())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La version de formulaire selectionnee n'est pas publiee.", locale));
		}

		Integer campaignId = sourceToken.getCampaigns().getId();
		Integer formId = formVersion.getForm() != null ? formVersion.getForm().getId() : null;
		if (!hasActiveCampaignFormLink(campaignId, formId)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("La version de formulaire selectionnee n'appartient pas a la campagne du source token", locale));
		}
	}

	private FormVersion selectFormVersionForCandidate(
			SourceToken sourceToken,
			String candidateEmail,
			Integer applicationId,
			Map<Integer, Integer> pendingAssignedFormsByCampaign,
			Map<String, Set<Integer>> pendingCandidateFormHistory,
			Locale locale) {
		Campaigns campaign = requireCampaignForFormSelection(sourceToken, locale);
		List<FormVersion> publishedVersions = getPublishedFormVersionsForCampaign(campaign.getId());
		if (publishedVersions.isEmpty()) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Aucun formulaire publie trouve pour cette campagne", locale));
		}

		FormAssignmentStrategy strategy = FormAssignmentStrategy.fromValue(resolveCampaignFormAssignmentStrategy(campaign));
		FormAssignmentExhaustionPolicy exhaustionPolicy = FormAssignmentExhaustionPolicy.fromValue(resolveCampaignFormAssignmentExhaustionPolicy(campaign));

		switch (strategy) {
			case SOURCE_TOKEN:
				return resolveSourceTokenFormVersion(sourceToken, campaign, locale);
			case SEQUENTIAL:
				return resolveSequentialFormVersion(campaign.getId(), publishedVersions, pendingAssignedFormsByCampaign, exhaustionPolicy, locale);
			case RANDOM_NO_REPEAT:
				return resolveRandomNoRepeatFormVersion(campaign.getId(), candidateEmail, applicationId, publishedVersions, pendingCandidateFormHistory, exhaustionPolicy, locale);
			case RANDOM:
			default:
				return pickRandomFormVersion(publishedVersions);
		}
	}

	private Campaigns requireCampaignForFormSelection(SourceToken sourceToken, Locale locale) {
		if (sourceToken == null || sourceToken.getCampaigns() == null || sourceToken.getCampaigns().getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Impossible de determiner la campagne pour attribuer un formulaire", locale));
		}
		return sourceToken.getCampaigns();
	}

	private List<FormVersion> getPublishedFormVersionsForCampaign(Integer campaignId) {
		if (campaignId == null) {
			return Collections.emptyList();
		}

		List<Form> linkedForms = campaignFormRepository.findActiveFormsByCampaignId(campaignId);
		if (linkedForms == null || linkedForms.isEmpty()) {
			return Collections.emptyList();
		}

		List<FormVersion> publishedVersions = new ArrayList<FormVersion>();
		for (Form form : linkedForms) {
			List<FormVersion> published = formVersionRepository.findByFormIdAndIsPublished(form.getId(), true, false);
			if (published == null || published.isEmpty()) {
				continue;
			}
			List<FormVersion> orderedPublishedVersions = new ArrayList<FormVersion>(published);
			orderedPublishedVersions.sort(Comparator.comparing(FormVersion::getVersionNumber, Comparator.nullsLast(Integer::compareTo)).reversed());
			publishedVersions.add(orderedPublishedVersions.get(0));
		}
		return publishedVersions;
	}

	private FormVersion resolveSourceTokenFormVersion(SourceToken sourceToken, Campaigns campaign, Locale locale) {
		Form assignedForm = sourceToken.getForm();
		if (assignedForm == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Aucun formulaire n'est configure pour ce source token", locale));
		}

		if (!hasActiveCampaignFormLink(campaign != null ? campaign.getId() : null, assignedForm.getId())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Le formulaire configure sur ce source token n'appartient pas a la campagne", locale));
		}

		List<FormVersion> published = formVersionRepository.findByFormIdAndIsPublished(assignedForm.getId(), true, false);
		if (published == null || published.isEmpty()) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Aucune version publiee n'est disponible pour le formulaire du source token", locale));
		}

		published.sort(Comparator.comparing(FormVersion::getVersionNumber, Comparator.nullsLast(Integer::compareTo)).reversed());
		return published.get(0);
	}

	private boolean hasActiveCampaignFormLink(Integer campaignId, Integer formId) {
		if (campaignId == null || formId == null) {
			return false;
		}
		return campaignFormRepository.countActiveLinksByCampaignIdAndFormId(campaignId, formId) > 0L;
	}

	private FormVersion resolveSequentialFormVersion(
			Integer campaignId,
			List<FormVersion> publishedVersions,
			Map<Integer, Integer> pendingAssignedFormsByCampaign,
			FormAssignmentExhaustionPolicy exhaustionPolicy,
			Locale locale) {
		Long assignedCount = applicationsRepository.countAssignedFormVersionByCampaignId(campaignId, false);
		int alreadyAssigned = assignedCount != null ? assignedCount.intValue() : 0;
		int pendingAssigned = pendingAssignedFormsByCampaign != null ? pendingAssignedFormsByCampaign.getOrDefault(campaignId, 0) : 0;
		int candidateIndex = alreadyAssigned + pendingAssigned;

		if (candidateIndex >= publishedVersions.size()) {
			switch (exhaustionPolicy) {
				case LOOP:
				case RESET:
					return publishedVersions.get(candidateIndex % publishedVersions.size());
				case BLOCK:
				default:
					throw new InvalidEntityException(functionalError.REQUEST_FAIL("Tous les formulaires de la campagne ont deja ete distribues", locale));
			}
		}

		return publishedVersions.get(candidateIndex);
	}

	private FormVersion resolveRandomNoRepeatFormVersion(
			Integer campaignId,
			String candidateEmail,
			Integer applicationId,
			List<FormVersion> publishedVersions,
			Map<String, Set<Integer>> pendingCandidateFormHistory,
			FormAssignmentExhaustionPolicy exhaustionPolicy,
			Locale locale) {
		Set<Integer> usedVersionIds = getCandidateUsedFormVersionIds(campaignId, candidateEmail, applicationId, pendingCandidateFormHistory);
		List<FormVersion> availableVersions = new ArrayList<FormVersion>();
		for (FormVersion formVersion : publishedVersions) {
			if (formVersion.getId() != null && !usedVersionIds.contains(formVersion.getId())) {
				availableVersions.add(formVersion);
			}
		}

		if (!availableVersions.isEmpty()) {
			return pickRandomFormVersion(availableVersions);
		}

		switch (exhaustionPolicy) {
			case LOOP:
			case RESET:
				return pickRandomFormVersion(publishedVersions);
			case BLOCK:
			default:
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Ce candidat a deja utilise tous les formulaires disponibles pour cette campagne", locale));
		}
	}

	private Set<Integer> getCandidateUsedFormVersionIds(
			Integer campaignId,
			String candidateEmail,
			Integer applicationId,
			Map<String, Set<Integer>> pendingCandidateFormHistory) {
		Set<Integer> usedVersionIds = new LinkedHashSet<Integer>();
		if (StringUtils.isBlank(candidateEmail)) {
			return usedVersionIds;
		}

		List<Applications> existingApplications = applicationsRepository.findAssignedByCampaignIdAndCandidateEmail(campaignId, candidateEmail, false);
		if (existingApplications != null) {
			for (Applications existingApplication : existingApplications) {
				if (applicationId != null && applicationId.equals(existingApplication.getId())) {
					continue;
				}
				if (existingApplication.getFormVersion() != null && existingApplication.getFormVersion().getId() != null) {
					usedVersionIds.add(existingApplication.getFormVersion().getId());
				}
			}
		}

		String candidateHistoryKey = buildCandidateHistoryKey(campaignId, candidateEmail);
		if (candidateHistoryKey != null && pendingCandidateFormHistory != null) {
			usedVersionIds.addAll(pendingCandidateFormHistory.getOrDefault(candidateHistoryKey, Collections.<Integer>emptySet()));
		}

		return usedVersionIds;
	}

	private FormVersion pickRandomFormVersion(List<FormVersion> versions) {
		return versions.get(ThreadLocalRandom.current().nextInt(versions.size()));
	}

	private void lockFormVersionIfNeeded(FormVersion formVersion, Integer actorUserId) {
		if (formVersion == null || Boolean.TRUE.equals(formVersion.getIsLocked())) {
			return;
		}

		formVersion.setIsLocked(true);
		formVersion.setUpdatedAt(Utilities.getCurrentDate());
		formVersion.setUpdatedBy(actorUserId);
		formVersionRepository.save(formVersion);
		log.info("FormVersion " + formVersion.getId() + " verrouillee des la premiere candidature rattachee");
	}

	private String resolveCampaignFormAssignmentStrategy(Campaigns campaign) {
		return StringUtils.defaultIfBlank(campaign.getFormAssignmentStrategy(), FormAssignmentStrategy.RANDOM.getValue());
	}

	private boolean isQuizResumable(Applications application) {
		return !hasQuizRandomness(application);
	}

	private boolean hasQuizRandomness(Applications application) {
		if (application == null) {
			return false;
		}

		FormVersion formVersion = application.getFormVersion();
		if (formVersion != null && Boolean.TRUE.equals(formVersion.getRandomQuestions())) {
			return true;
		}

		Campaigns campaign = application.getSourceToken() != null ? application.getSourceToken().getCampaigns() : null;
		if (campaign == null) {
			return false;
		}

		String strategy = resolveCampaignFormAssignmentStrategy(campaign);
		return FormAssignmentStrategy.RANDOM.getValue().equalsIgnoreCase(strategy)
				|| FormAssignmentStrategy.RANDOM_NO_REPEAT.getValue().equalsIgnoreCase(strategy);
	}

	private Response<ApplicationsDto> rejectRandomizedQuizResume(Applications application, boolean hasExistingAnswers) {
		if (application == null || !hasExistingAnswers || isQuizResumable(application)) {
			return null;
		}

		if (!tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue().equals(application.getQuizStatus())) {
			return null;
		}

		return buildErrorResponse(
				HttpStatus.FORBIDDEN,
				StatusCode.FUNC_REQUEST_FAIL,
				"Ce quiz contient un tirage aleatoire et ne peut pas etre repris apres fermeture. Il doit etre termine en une seule session.");
	}

	private String resolveCampaignFormAssignmentExhaustionPolicy(Campaigns campaign) {
		return StringUtils.defaultIfBlank(campaign.getFormAssignmentExhaustionPolicy(), FormAssignmentExhaustionPolicy.BLOCK.getValue());
	}

	private void registerPendingFormAssignment(
			SourceToken sourceToken,
			String candidateEmail,
			FormVersion formVersion,
			Map<Integer, Integer> pendingAssignedFormsByCampaign,
			Map<String, Set<Integer>> pendingCandidateFormHistory) {
		if (sourceToken == null || sourceToken.getCampaigns() == null || sourceToken.getCampaigns().getId() == null || formVersion == null) {
			return;
		}

		Integer campaignId = sourceToken.getCampaigns().getId();
		if (pendingAssignedFormsByCampaign != null) {
			pendingAssignedFormsByCampaign.merge(campaignId, 1, Integer::sum);
		}

		String candidateHistoryKey = buildCandidateHistoryKey(campaignId, candidateEmail);
		if (candidateHistoryKey != null && formVersion.getId() != null && pendingCandidateFormHistory != null) {
			pendingCandidateFormHistory.computeIfAbsent(candidateHistoryKey, key -> new LinkedHashSet<Integer>()).add(formVersion.getId());
		}
	}

	private String buildCandidateHistoryKey(Integer campaignId, String candidateEmail) {
		if (campaignId == null || StringUtils.isBlank(candidateEmail)) {
			return null;
		}
		return campaignId + "::" + candidateEmail.trim().toLowerCase(Locale.ROOT);
	}

	/**
	 * Sauvegarde la sélection d'une réponse par le candidat
	 * Sauvegarde l'état complet d'une réponse de quiz pour une question.
	 * - SINGLE_CHOICE / TRUE_FALSE : 0 ou 1 réponse sélectionnée
	 * - MULTIPLE_CHOICE : plusieurs réponses sélectionnées possibles
	 * - TEXT : réponse libre persistée dans free_text_response
	 * Met à jour quiz_level avec l'ordre de la question répondue.
	 * 
	 * @param request Request contenant:
	 *   - id: applicationId
	 *   - searchString: quiz_token pour validation
	 *   - questionId: question répondue
	 *   - selectedAnswerIds / answerId: réponses cochées
	 *   - selectedAnswerComments: commentaires additionnels portés par answer_id
	 *   - freeTextResponse: réponse libre éventuelle
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
			
			Integer questionId = resolveQuestionId(dto);
			Integer fallbackAnswerId = resolveAnswerId(dto);
			List<Integer> selectedAnswerIds = resolveSelectedAnswerIds(dto, fallbackAnswerId);
			Map<Integer, String> selectedAnswerComments = resolveSelectedAnswerComments(dto, selectedAnswerIds);
			String freeTextResponse = StringUtils.trimToNull(dto.getFreeTextResponse());

			if (questionId == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_FIELD_EMPTY);
				status.setMessage("Question ID manquant");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			
			Integer applicationId = dto.getId();
			String quizToken = dto.getSearchString();
			
			log.info("Saving quiz answer for application " + applicationId + ", question " + questionId + ", selected=" + selectedAnswerIds);
			
			// 2. Valider l'application et le quiz_token
			Applications application = applicationsRepository.findOne(applicationId, false);
			Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, quizToken, true);
			if (accessError != null) {
				return accessError;
			}

			Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, request.getUser(), locale);
			if (inactivityError != null) {
				return inactivityError;
			}

			ensureQuizStageReady(application, request.getUser(), locale);
			QuizTimingState timingState = resolveQuizTimingState(application, request.getUser());
			if (timingState.expired) {
				completeQuizInternal(application, request.getUser(), locale);
				return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, "Temps limite dépassé. Le quiz a été soumis automatiquement.");
			}
			
			// 3. Récupérer toutes les candidate_answers pour cette application et cette question
			List<CandidateAnswer> candidateAnswers = candidateAnswerRepository.findByApplicationIdAndQuestionId(
				applicationId, 
				questionId, 
				false
			);
			Question question = questionRepository.findOne(questionId, false);
			if (question == null) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Question non trouvée");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			String questionType = StringUtils.trimToEmpty(question.getQuestionType());
			
			if (!QuestionType.TEXT.getValue().equals(questionType) && (candidateAnswers == null || candidateAnswers.isEmpty())) {
				Status status = new Status();
				status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
				status.setMessage("Aucune réponse candidate trouvée pour cette question");
				response.setStatus(status);
				response.setHasError(true);
				response.setHttpCode(HttpStatus.NOT_FOUND.value());
				return response;
			}
			
			log.info("Found " + candidateAnswers.size() + " candidate answers for question " + questionId);

			if (QuestionType.TEXT.getValue().equals(questionType)) {
				CandidateAnswer freeTextCandidateAnswer = null;
				if (candidateAnswers != null) {
					for (CandidateAnswer candidateAnswer : candidateAnswers) {
						if (candidateAnswer != null && candidateAnswer.getAnswer() == null) {
							freeTextCandidateAnswer = candidateAnswer;
							break;
						}
					}
				}

				if (freeTextCandidateAnswer == null) {
					freeTextCandidateAnswer = new CandidateAnswer();
					freeTextCandidateAnswer.setApplications(application);
					freeTextCandidateAnswer.setQuestion(question);
					freeTextCandidateAnswer.setAnswer(null);
					freeTextCandidateAnswer.setIsDeleted(false);
					freeTextCandidateAnswer.setCreatedAt(Utilities.getCurrentDate());
					freeTextCandidateAnswer.setCreatedBy(request.getUser());
				}

				freeTextCandidateAnswer.setFreeTextResponse(freeTextResponse);
				freeTextCandidateAnswer.setIsSelected(false);
				freeTextCandidateAnswer.setUpdatedAt(Utilities.getCurrentDate());
				freeTextCandidateAnswer.setUpdatedBy(request.getUser());
				candidateAnswerRepository.save(freeTextCandidateAnswer);
			} else {
				Set<Integer> requestedAnswerIds = new LinkedHashSet<Integer>(selectedAnswerIds);
				Set<Integer> availableAnswerIds = new HashSet<Integer>();
				for (CandidateAnswer candidateAnswer : candidateAnswers) {
					if (candidateAnswer != null && candidateAnswer.getAnswer() != null && candidateAnswer.getAnswer().getId() != null) {
						availableAnswerIds.add(candidateAnswer.getAnswer().getId());
					}
				}

				if (!availableAnswerIds.containsAll(requestedAnswerIds)) {
					Status status = new Status();
					status.setCode(StatusCode.FUNC_REQUEST_FAIL);
					status.setMessage("Une ou plusieurs réponses sélectionnées ne correspondent pas à cette question");
					response.setStatus(status);
					response.setHasError(true);
					response.setHttpCode(HttpStatus.BAD_REQUEST.value());
					return response;
				}

				if ((QuestionType.SINGLE_CHOICE.getValue().equals(questionType)
						|| QuestionType.TRUE_FALSE.getValue().equals(questionType))
						&& requestedAnswerIds.size() > 1) {
					Status status = new Status();
					status.setCode(StatusCode.FUNC_REQUEST_FAIL);
					status.setMessage("Cette question n'accepte qu'une seule réponse");
					response.setStatus(status);
					response.setHasError(true);
					response.setHttpCode(HttpStatus.BAD_REQUEST.value());
					return response;
				}

				int updatedCount = 0;
				for (CandidateAnswer ca : candidateAnswers) {
					if (ca == null || ca.getAnswer() == null || ca.getAnswer().getId() == null) {
						continue;
					}
					Integer answerId = ca.getAnswer().getId();
					boolean shouldBeSelected = requestedAnswerIds.contains(answerId);
					String answerComment = shouldBeSelected ? StringUtils.trimToNull(selectedAnswerComments.get(answerId)) : null;

					if (!Boolean.TRUE.equals(ca.getAnswer().getAllowAdditionalComment())) {
						answerComment = null;
					}

					if (shouldBeSelected && Boolean.TRUE.equals(ca.getAnswer().getAdditionalCommentRequired()) && answerComment == null) {
						Status status = new Status();
						status.setCode(StatusCode.FUNC_REQUEST_FAIL);
						status.setMessage("Un commentaire est obligatoire pour la réponse sélectionnée");
						response.setStatus(status);
						response.setHasError(true);
						response.setHttpCode(HttpStatus.BAD_REQUEST.value());
						return response;
					}

					boolean selectionChanged = !Boolean.valueOf(shouldBeSelected).equals(ca.getIsSelected());
					boolean commentChanged = !Objects.equals(StringUtils.trimToNull(ca.getFreeTextResponse()), answerComment);
					if (selectionChanged || commentChanged) {
						ca.setIsSelected(shouldBeSelected);
						ca.setFreeTextResponse(answerComment);
						ca.setUpdatedAt(Utilities.getCurrentDate());
						ca.setUpdatedBy(request.getUser());
						candidateAnswerRepository.save(ca);
						updatedCount++;
						log.info("Updated candidate_answer ID " + ca.getId() + ": is_selected=" + shouldBeSelected + ", has_comment=" + (answerComment != null));
					}
				}

				log.info("Updated " + updatedCount + " candidate_answers");
			}
			
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
					if (isQuizResumable(application)) {
						application.setQuizLevel(fq.getQuestionOrder());
					} else {
						application.setQuizLevel(null);
					}
					application.setUpdatedAt(Utilities.getCurrentDate());
					application.setUpdatedBy(request.getUser());
					applicationsRepository.save(application);
					
					log.info("Updated quiz_level to " + application.getQuizLevel() + " for application " + applicationId);
				}
			}
			
			// 6. Préparer la réponse
			touchQuizLastActivity(application, request.getUser());
			QuizTimingState updatedTimingState = resolveQuizTimingState(application, request.getUser());
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			resultDto.setQuizLevel(isQuizResumable(application) ? application.getQuizLevel() : null);
			resultDto.setTimeElapsed(updatedTimingState.timeElapsed);
			
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
			Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, quizToken, true);
			if (accessError != null) {
				return accessError;
			}
			
			// 3. Calculer le score et le nombre total de questions avant de compléter le quiz
			FormVersion formVersion = application.getFormVersion();
			if (formVersion == null) {
				return buildErrorResponse(HttpStatus.NOT_FOUND, StatusCode.FUNC_DATA_NOT_EXIST, "Aucun formulaire associé à cette application");
			}

			Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, request.getUser(), locale);
			if (inactivityError != null) {
				return inactivityError;
			}

			ensureQuizStageReady(application, request.getUser(), locale);
			QuizTimingState timingState = resolveQuizTimingState(application, request.getUser());
			
			application = completeQuizInternal(application, request.getUser(), locale);
			
			log.info("Quiz complété pour l'application " + applicationId + " - Score: " + application.getQuizScore() + "/" + application.getTotalQuestions());
			log.info("Application status mis à jour: SUBMITTED");
			
			// 5. Préparer la réponse
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			resultDto.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
			resultDto.setApplicationStatus("SUBMITTED");
			resultDto.setQuizScore(application.getQuizScore());
			resultDto.setTotalQuestions(application.getTotalQuestions());
			resultDto.setQuizScorePercent(application.getQuizScorePercent());
			resultDto.setQuizManualCorrectionStatus(application.getQuizManualCorrectionStatus());
			resultDto.setTimeElapsed(application.getTimeElapsed());
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(timingState.expired
					? "Temps limite atteint. Le quiz a été soumis automatiquement"
					: "Quiz complété avec succès");
			
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

	@Transactional
	public Response<ApplicationsDto> touchQuizActivity(Request<ApplicationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin touchQuizActivity-----");
		ApplicationsDto dto = request != null ? request.getData() : null;
		if (dto == null || dto.getId() == null) {
			return buildErrorResponse(HttpStatus.BAD_REQUEST, StatusCode.FUNC_FIELD_EMPTY, "ID de l'application manquant");
		}
		if (Utilities.isBlank(dto.getSearchString())) {
			return buildErrorResponse(HttpStatus.BAD_REQUEST, StatusCode.FUNC_FIELD_EMPTY, "Token de quiz manquant");
		}

		Applications application = applicationsRepository.findOne(dto.getId(), false);
		Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, dto.getSearchString(), true);
		if (accessError != null) {
			return accessError;
		}

		Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, request.getUser(), locale);
		if (inactivityError != null) {
			return inactivityError;
		}

		ensureQuizStageReady(application, request.getUser(), locale);
		QuizTimingState timingState = resolveQuizTimingState(application, request.getUser());
		if (timingState.expired) {
			completeQuizInternal(application, request.getUser(), locale);
			return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, "Temps limite dépassé. Le quiz a été soumis automatiquement.");
		}

		touchQuizLastActivity(application, request.getUser());

		ApplicationsDto resultDto = new ApplicationsDto();
		resultDto.setId(application.getId());
		resultDto.setTimeElapsed(timingState.timeElapsed);

		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage("Activité quiz enregistrée");
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		response.setItems(Arrays.asList(resultDto));
		response.setHasError(false);
		log.info("----end touchQuizActivity-----");
		return response;
	}

	@Scheduled(fixedRate = 60000)
	@Transactional
	public void abandonInactiveQuizApplications() {
		List<Applications> startedApplications = applicationsRepository.findActiveByQuizStatus(
				tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue(),
				false);
		if (startedApplications == null || startedApplications.isEmpty()) {
			return;
		}

		for (Applications application : startedApplications) {
			try {
				markApplicationAbandonedIfQuizInactive(application, SYSTEM_ACTOR_USER_ID, Locale.FRENCH);
			} catch (Exception exception) {
				log.warning("Politique d'abandon inactive ignorée pour l'application "
						+ (application != null ? application.getId() : null)
						+ " : " + exception.getMessage());
			}
		}
	}

	public Applications refreshQuizScoringState(Integer applicationId, Integer actorUserId) {
		Applications application = applicationsRepository.findOne(applicationId, false);
		if (application == null) {
			return null;
		}
		return refreshQuizScoringState(application, actorUserId, Locale.FRENCH);
	}

	public Applications refreshQuizScoringState(Applications application, Integer actorUserId) {
		return refreshQuizScoringState(application, actorUserId, Locale.FRENCH);
	}

	public Applications refreshQuizScoringState(Applications application, Integer actorUserId, Locale locale) {
		if (application == null) {
			return null;
		}

		QuizScoringSummary summary = evaluateQuiz(application);
		application.setQuizScore(summary.correctAnswersCount);
		application.setTotalQuestions(summary.totalQuestions);
		application.setQuizScorePercent(summary.quizScorePercent);
		application.setQuizManualCorrectionStatus(summary.manualCorrectionStatus);
		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(actorUserId);
		Applications savedApplication = applicationsRepository.save(application);
		syncQuizProgressAfterScoring(savedApplication, actorUserId, locale);
		return applicationsRepository.findOne(savedApplication.getId(), false);
	}

	private QuizScoringSummary evaluateQuiz(Applications application) {
		List<FormQuestions> activeFormQuestions = getActiveFormQuestions(application != null ? application.getFormVersion() : null);
		int totalQuestions = activeFormQuestions.size();
		int correctAnswersCount = 0;
		boolean hasManualQuestion = false;
		boolean hasPendingManualCorrection = false;

		List<CandidateAnswer> candidateAnswers = application != null && application.getId() != null
				? candidateAnswerRepository.findByApplicationId(application.getId(), false)
				: Collections.emptyList();
		Map<Integer, List<CandidateAnswer>> candidateAnswersByQuestion = groupCandidateAnswersByQuestion(candidateAnswers);

		for (FormQuestions formQuestion : activeFormQuestions) {
			Question question = formQuestion.getQuestion();
			if (question == null || question.getId() == null) {
				continue;
			}

			String questionType = StringUtils.trimToEmpty(question.getQuestionType());
			List<CandidateAnswer> questionCandidateAnswers = candidateAnswersByQuestion.getOrDefault(question.getId(), Collections.emptyList());

			if (QuestionType.TEXT.getValue().equals(questionType)) {
				hasManualQuestion = true;
				CandidateAnswer freeTextCandidateAnswer = null;
				for (CandidateAnswer candidateAnswer : questionCandidateAnswers) {
					if (candidateAnswer != null && candidateAnswer.getAnswer() == null) {
						freeTextCandidateAnswer = candidateAnswer;
						break;
					}
				}
				if (freeTextCandidateAnswer != null && freeTextCandidateAnswer.getManualIsCorrect() != null) {
					if (Boolean.TRUE.equals(freeTextCandidateAnswer.getManualIsCorrect())) {
						correctAnswersCount++;
					}
				} else {
					hasPendingManualCorrection = true;
				}
				continue;
			}

			Set<Integer> selectedAnswerIds = new HashSet<Integer>();
			for (CandidateAnswer candidateAnswer : questionCandidateAnswers) {
				if (candidateAnswer != null
						&& candidateAnswer.getAnswer() != null
						&& candidateAnswer.getAnswer().getId() != null
						&& Boolean.TRUE.equals(candidateAnswer.getIsSelected())) {
					selectedAnswerIds.add(candidateAnswer.getAnswer().getId());
				}
			}

			if (QuestionType.MULTIPLE_CHOICE.getValue().equals(questionType)) {
				Set<Integer> correctAnswerIds = new HashSet<Integer>();
				List<Answer> answers = answerRepository.findByQuestionId(question.getId(), false);
				for (Answer answer : answers) {
					if (answer != null && !Boolean.TRUE.equals(answer.getIsDeleted()) && Boolean.TRUE.equals(answer.getIsCorrect())) {
						correctAnswerIds.add(answer.getId());
					}
				}
				if (!correctAnswerIds.isEmpty() && selectedAnswerIds.equals(correctAnswerIds)) {
					correctAnswersCount++;
				}
				continue;
			}

			if (selectedAnswerIds.size() == 1) {
				Integer selectedAnswerId = selectedAnswerIds.iterator().next();
				for (CandidateAnswer candidateAnswer : questionCandidateAnswers) {
					if (candidateAnswer != null
							&& candidateAnswer.getAnswer() != null
							&& selectedAnswerId.equals(candidateAnswer.getAnswer().getId())
							&& Boolean.TRUE.equals(candidateAnswer.getAnswer().getIsCorrect())) {
						correctAnswersCount++;
						break;
					}
				}
			}
		}

		String manualCorrectionStatus = ManualCorrectionStatus.NOT_REQUIRED.getValue();
		if (hasManualQuestion) {
			manualCorrectionStatus = hasPendingManualCorrection
					? ManualCorrectionStatus.PENDING.getValue()
					: ManualCorrectionStatus.COMPLETED.getValue();
		}

		int quizScorePercent = totalQuestions > 0 ? (correctAnswersCount * 100) / totalQuestions : 0;
		return new QuizScoringSummary(correctAnswersCount, totalQuestions, quizScorePercent, manualCorrectionStatus);
	}

	private List<FormQuestions> getActiveFormQuestions(FormVersion formVersion) {
		if (formVersion == null || formVersion.getId() == null) {
			return Collections.emptyList();
		}

		List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
		if (formQuestions == null || formQuestions.isEmpty()) {
			return Collections.emptyList();
		}

		List<FormQuestions> activeFormQuestions = new ArrayList<FormQuestions>();
		for (FormQuestions formQuestion : formQuestions) {
			if (formQuestion != null && formQuestion.getQuestion() != null && !Boolean.TRUE.equals(formQuestion.getQuestion().getIsDeleted())) {
				activeFormQuestions.add(formQuestion);
			}
		}
		return activeFormQuestions;
	}

	private Response<ApplicationsDto> buildErrorResponse(HttpStatus httpStatus, String code, String message) {
		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		response.setStatus(status);
		response.setHasError(true);
		response.setHttpCode(httpStatus.value());
		return response;
	}

	private Response<ApplicationsDto> validateQuizSessionAccess(Applications application, String quizToken, boolean rejectCompleted) {
		if (application == null) {
			return buildErrorResponse(HttpStatus.NOT_FOUND, StatusCode.FUNC_DATA_NOT_EXIST, "Application non trouvée");
		}

		if (!StringUtils.equals(quizToken, application.getQuizToken())) {
			return buildErrorResponse(HttpStatus.FORBIDDEN, StatusCode.FUNC_AUTH_FAIL, "Token de quiz invalide. Veuillez utiliser le lien reçu par email.");
		}

		if (!Boolean.TRUE.equals(application.getEmailVerified())) {
			return buildErrorResponse(HttpStatus.FORBIDDEN, StatusCode.FUNC_AUTH_FAIL, "Veuillez vérifier votre adresse email avant d'accéder au quiz.");
		}

		if (Boolean.TRUE.equals(application.getApplicationAbandoned())) {
			return buildErrorResponse(HttpStatus.FORBIDDEN, StatusCode.FUNC_AUTH_FAIL, "Cette candidature a été marquée comme abandonnée.");
		}

		if (application.getFormVersion() == null) {
			return buildErrorResponse(HttpStatus.NOT_FOUND, StatusCode.FUNC_DATA_NOT_EXIST, "Aucun formulaire associé à cette application");
		}

		if (rejectCompleted && tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(application.getQuizStatus())) {
			return buildErrorResponse(HttpStatus.BAD_REQUEST, StatusCode.FUNC_DATA_EXIST, "Ce quiz a déjà été complété");
		}

		return null;
	}

	private Response<ApplicationsDto> enforceQuizInactivityPolicy(Applications application, Integer actorUserId, Locale locale) {
		if (markApplicationAbandonedIfQuizInactive(application, actorUserId, locale)) {
			return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, QUIZ_INACTIVITY_MESSAGE);
		}
		return null;
	}

	private Integer calculateTotalTimeAllowed(Campaigns campaign, FormVersion formVersion, List<FormQuestions> formQuestions) {
		return formBusiness.calculateTotalTimeAllowed(
				campaign,
				formVersion != null ? formVersion.getForm() : null,
				formQuestions);
	}

	private void applyQuizTimingSnapshot(Applications application) {
		if (application == null) {
			return;
		}

		Campaigns campaign = application.getSourceToken() != null ? application.getSourceToken().getCampaigns() : null;
		List<FormQuestions> activeFormQuestions = getActiveFormQuestions(application.getFormVersion());
		Integer totalTimeAllowed = calculateTotalTimeAllowed(campaign, application.getFormVersion(), activeFormQuestions);
		boolean timed = totalTimeAllowed != null;

		application.setQuizTimedSnapshot(timed);
		application.setQuizTotalTimeAllowedSnapshot(timed ? totalTimeAllowed : null);
	}

	private void ensureQuizTimingSnapshot(Applications application, Integer actorUserId) {
		if (application == null) {
			return;
		}

		boolean missingTimedSnapshot = application.getQuizTimedSnapshot() == null;
		boolean missingTotalTimeSnapshot = Boolean.TRUE.equals(application.getQuizTimedSnapshot())
				&& application.getQuizTotalTimeAllowedSnapshot() == null;
		if (!missingTimedSnapshot && !missingTotalTimeSnapshot) {
			return;
		}

		applyQuizTimingSnapshot(application);
		if (application.getId() != null) {
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(actorUserId);
			applicationsRepository.save(application);
		}
	}

	private Integer resolveQuizInactivityTimeoutMinutes(Applications application) {
		if (application == null || application.getId() == null) {
			return DEFAULT_QUIZ_INACTIVITY_TIMEOUT_MINUTES;
		}

		ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
		if (quizProgress == null || quizProgress.getPipelineStage() == null) {
			return DEFAULT_QUIZ_INACTIVITY_TIMEOUT_MINUTES;
		}

		return applicationProgressBusiness.resolveInactivityTimeoutMinutes(
				quizProgress.getPipelineStage(),
				DEFAULT_QUIZ_INACTIVITY_TIMEOUT_MINUTES);
	}

	private Date resolveQuizLastActivityReference(Applications application, ApplicationProgress quizProgress) {
		if (application != null && application.getQuizLastActivityAt() != null) {
			return application.getQuizLastActivityAt();
		}
		if (quizProgress != null && quizProgress.getStartedAt() != null) {
			return quizProgress.getStartedAt();
		}
		return application != null ? application.getUpdatedAt() : null;
	}

	private void touchQuizLastActivity(Applications application, Integer actorUserId) {
		if (application == null || application.getId() == null) {
			return;
		}

		Date now = Utilities.getCurrentDate();
		application.setQuizLastActivityAt(now);
		application.setUpdatedAt(now);
		application.setUpdatedBy(actorUserId);
		applicationsRepository.save(application);
	}

	private boolean markApplicationAbandonedIfQuizInactive(Applications application, Integer actorUserId, Locale locale) {
		if (application == null || application.getId() == null) {
			return false;
		}
		if (Boolean.TRUE.equals(application.getApplicationAbandoned())) {
			return false;
		}
		if (!tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue().equals(application.getQuizStatus())) {
			return false;
		}

		Integer inactivityTimeoutMinutes = resolveQuizInactivityTimeoutMinutes(application);
		if (inactivityTimeoutMinutes == null || inactivityTimeoutMinutes <= 0) {
			return false;
		}

		ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
		Date lastActivityReference = resolveQuizLastActivityReference(application, quizProgress);
		if (lastActivityReference == null) {
			return false;
		}

		Date now = Utilities.getCurrentDate();
		long inactivityMillis = now.getTime() - lastActivityReference.getTime();
		if (inactivityMillis < inactivityTimeoutMinutes.longValue() * 60_000L) {
			return false;
		}

		application.setApplicationAbandoned(true);
		application.setUpdatedAt(now);
		application.setUpdatedBy(actorUserId);
		applicationsRepository.save(application);
		markQuizProgressAsAbandoned(application, quizProgress, actorUserId, locale, now);
		return true;
	}

	private void markQuizProgressAsAbandoned(
			Applications application,
			ApplicationProgress quizProgress,
			Integer actorUserId,
			Locale locale,
			Date abandonmentAt) {
		if (application == null || quizProgress == null) {
			return;
		}

		if (!isResolvedProgressStatus(quizProgress.getProgressStatus())) {
			quizProgress.setProgressStatus(ProgressStatus.FAILED.getValue());
			if (quizProgress.getStartedAt() == null) {
				quizProgress.setStartedAt(abandonmentAt);
			}
			quizProgress.setCompletedAt(abandonmentAt);
			if (quizProgress.getScore() == null && application.getQuizScorePercent() != null) {
				quizProgress.setScore(application.getQuizScorePercent().doubleValue());
			}

			String abandonmentNote = "Quiz abandonné pour inactivité";
			if (!StringUtils.containsIgnoreCase(StringUtils.defaultString(quizProgress.getNotes()), abandonmentNote)) {
				quizProgress.setNotes(StringUtils.isBlank(quizProgress.getNotes())
						? abandonmentNote
						: quizProgress.getNotes().trim() + " | " + abandonmentNote);
			}

			quizProgress.setUpdatedAt(abandonmentAt);
			quizProgress.setUpdatedBy(actorUserId);
			applicationProgressRepository.save(quizProgress);
		}

		applicationProgressBusiness.syncApplicationStatus(application.getId());
	}

	private ApplicationProgress findProgressByStageType(Integer applicationId, String stageType) {
		if (applicationId == null || StringUtils.isBlank(stageType)) {
			return null;
		}

		List<ApplicationProgress> progressList = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
		if (progressList == null || progressList.isEmpty()) {
			return null;
		}

		for (ApplicationProgress progress : progressList) {
			if (progress != null
					&& progress.getPipelineStage() != null
					&& stageType.equalsIgnoreCase(progress.getPipelineStage().getStageType())) {
				return progress;
			}
		}
		return null;
	}

	private boolean isResolvedProgressStatus(String progressStatus) {
		return hasProgressStatus(progressStatus, ProgressStatus.PASSED)
				|| hasProgressStatus(progressStatus, ProgressStatus.FAILED)
				|| hasProgressStatus(progressStatus, ProgressStatus.SKIPPED);
	}

	private boolean hasProgressStatus(String progressStatus, ProgressStatus status) {
		return progressStatus != null && status.getValue().equalsIgnoreCase(progressStatus);
	}

	private void ensurePreviousCandidatureStagePassed(Applications application, Integer actorUserId, Locale locale) {
		if (application == null || application.getId() == null) {
			return;
		}

		ApplicationProgress candidatureProgress = findProgressByStageType(application.getId(), StageType.CANDIDATURE.getValue());
		if (candidatureProgress == null || candidatureProgress.getPipelineStage() == null || isResolvedProgressStatus(candidatureProgress.getProgressStatus())) {
			return;
		}

		try {
			applicationProgressBusiness.passStage(
					application.getId(),
					candidatureProgress.getPipelineStage().getId(),
					actorUserId,
					null,
					"Candidature validée avant le quiz",
					locale != null ? locale : Locale.FRENCH);
		} catch (Exception exception) {
			log.warning("Impossible de clôturer automatiquement l'étape CANDIDATURE pour l'application "
					+ application.getId() + " : " + exception.getMessage());
		}
	}

	private void ensureQuizStageReady(Applications application, Integer actorUserId, Locale locale) {
		if (application == null || application.getId() == null) {
			return;
		}

		ensurePreviousCandidatureStagePassed(application, actorUserId, locale);
		ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
		if (quizProgress == null || quizProgress.getPipelineStage() == null || isResolvedProgressStatus(quizProgress.getProgressStatus())) {
			return;
		}

		if (!hasProgressStatus(quizProgress.getProgressStatus(), ProgressStatus.IN_PROGRESS)) {
			quizProgress.setProgressStatus(ProgressStatus.IN_PROGRESS.getValue());
		}
		if (quizProgress.getStartedAt() == null) {
			quizProgress.setStartedAt(Utilities.getCurrentDate());
		}
		quizProgress.setUpdatedAt(Utilities.getCurrentDate());
		quizProgress.setUpdatedBy(actorUserId);
		applicationProgressRepository.save(quizProgress);
	}

	private Integer computeElapsedSeconds(Date startedAt, Date endedAt) {
		if (startedAt == null) {
			return 0;
		}
		long diffMillis = Math.max(0L, endedAt.getTime() - startedAt.getTime());
		return (int) (diffMillis / 1000L);
	}

	private Integer syncQuizTimeElapsed(Applications application, Integer actorUserId) {
		if (application == null || application.getId() == null) {
			return 0;
		}

		int storedElapsed = application.getTimeElapsed() != null ? application.getTimeElapsed() : 0;
		ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
		if (quizProgress == null || quizProgress.getStartedAt() == null) {
			if (application.getTimeElapsed() == null) {
				application.setTimeElapsed(storedElapsed);
				application.setUpdatedAt(Utilities.getCurrentDate());
				application.setUpdatedBy(actorUserId);
				applicationsRepository.save(application);
			}
			return storedElapsed;
		}

		Date endedAt = quizProgress.getCompletedAt() != null ? quizProgress.getCompletedAt() : Utilities.getCurrentDate();
		int computedElapsed = Math.max(storedElapsed, computeElapsedSeconds(quizProgress.getStartedAt(), endedAt));
		if (application.getTimeElapsed() == null || computedElapsed != storedElapsed) {
			application.setTimeElapsed(computedElapsed);
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(actorUserId);
			applicationsRepository.save(application);
		}
		return computedElapsed;
	}

	private QuizTimingState resolveQuizTimingState(Applications application, Integer actorUserId) {
		if (application == null) {
			return new QuizTimingState(false, null, 0, null, false);
		}

		ensureQuizTimingSnapshot(application, actorUserId);
		Integer totalTimeAllowed = Boolean.TRUE.equals(application.getQuizTimedSnapshot())
				? application.getQuizTotalTimeAllowedSnapshot()
				: null;
		Integer timeElapsed = syncQuizTimeElapsed(application, actorUserId);
		if (totalTimeAllowed == null) {
			return new QuizTimingState(false, null, timeElapsed, null, false);
		}

		int clampedElapsed = Math.min(timeElapsed, totalTimeAllowed);
		if (!Integer.valueOf(clampedElapsed).equals(application.getTimeElapsed())) {
			application.setTimeElapsed(clampedElapsed);
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(actorUserId);
			applicationsRepository.save(application);
		}
		return new QuizTimingState(true, totalTimeAllowed, clampedElapsed, Math.max(0, totalTimeAllowed - clampedElapsed), clampedElapsed >= totalTimeAllowed);
	}

	private Applications completeQuizInternal(Applications application, Integer actorUserId, Locale locale) {
		if (application == null) {
			return null;
		}

		application.setQuizLastActivityAt(Utilities.getCurrentDate());
		application.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
		application.setApplicationStatus("SUBMITTED");
		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(actorUserId);
		Applications updatedApplication = refreshQuizScoringState(application, actorUserId, locale != null ? locale : Locale.FRENCH);
		lockFormVersionIfNeeded(updatedApplication != null ? updatedApplication.getFormVersion() : application.getFormVersion(), actorUserId);
		return updatedApplication != null ? updatedApplication : applicationsRepository.findOne(application.getId(), false);
	}

	private void syncQuizProgressAfterScoring(Applications application, Integer actorUserId, Locale locale) {
		if (application == null || application.getId() == null) {
			return;
		}

		try {
			if (tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue().equals(application.getQuizStatus())
					|| tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(application.getQuizStatus())) {
				ensurePreviousCandidatureStagePassed(application, actorUserId, locale);
			}

			if (application.getQuizScorePercent() != null) {
				applicationProgressBusiness.updateStageScore(
						application.getId(),
						StageType.QUIZ.getValue(),
						application.getQuizScorePercent().doubleValue(),
						actorUserId);
			}

			if (!tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(application.getQuizStatus())) {
				return;
			}

			if (ManualCorrectionStatus.PENDING.getValue().equals(application.getQuizManualCorrectionStatus())) {
				return;
			}

			ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
			if (quizProgress == null || quizProgress.getPipelineStage() == null || isResolvedProgressStatus(quizProgress.getProgressStatus())) {
				return;
			}

			double quizScorePercent = application.getQuizScorePercent() != null ? application.getQuizScorePercent().doubleValue() : 0.0d;
			double passingScore = applicationProgressBusiness.resolvePassingScore(quizProgress.getPipelineStage(), DEFAULT_QUIZ_PASSING_SCORE);
			if (quizScorePercent >= passingScore) {
				applicationProgressBusiness.passStage(
						application.getId(),
						quizProgress.getPipelineStage().getId(),
						actorUserId,
						quizScorePercent,
						"Quiz validé",
						locale != null ? locale : Locale.FRENCH);
			} else {
				applicationProgressBusiness.failStage(
						application.getId(),
						quizProgress.getPipelineStage().getId(),
						actorUserId,
						"Quiz insuffisant",
						locale != null ? locale : Locale.FRENCH);
			}
		} catch (Exception exception) {
			log.warning("Synchronisation du stage QUIZ ignorée pour l'application " + application.getId() + " : " + exception.getMessage());
		}
	}

	private Map<Integer, List<CandidateAnswer>> groupCandidateAnswersByQuestion(List<CandidateAnswer> candidateAnswers) {
		Map<Integer, List<CandidateAnswer>> candidateAnswersByQuestion = new HashMap<Integer, List<CandidateAnswer>>();
		if (candidateAnswers == null || candidateAnswers.isEmpty()) {
			return candidateAnswersByQuestion;
		}

		for (CandidateAnswer candidateAnswer : candidateAnswers) {
			if (candidateAnswer == null || candidateAnswer.getQuestion() == null || candidateAnswer.getQuestion().getId() == null) {
				continue;
			}
			candidateAnswersByQuestion
				.computeIfAbsent(candidateAnswer.getQuestion().getId(), key -> new ArrayList<CandidateAnswer>())
				.add(candidateAnswer);
		}
		return candidateAnswersByQuestion;
	}

	private Integer resolveQuestionId(ApplicationsDto dto) {
		if (dto == null) {
			return null;
		}
		if (dto.getQuestionId() != null) {
			return dto.getQuestionId();
		}
		return parseInteger(dto.getCandidatePhone());
	}

	private Integer resolveAnswerId(ApplicationsDto dto) {
		if (dto == null) {
			return null;
		}
		if (dto.getAnswerId() != null) {
			return dto.getAnswerId();
		}
		return parseInteger(dto.getCandidateCvPath());
	}

	private List<Integer> resolveSelectedAnswerIds(ApplicationsDto dto, Integer fallbackAnswerId) {
		List<Integer> selectedAnswerIds = new ArrayList<Integer>();
		if (dto != null && dto.getSelectedAnswerIds() != null) {
			for (Integer selectedAnswerId : dto.getSelectedAnswerIds()) {
				if (selectedAnswerId != null && !selectedAnswerIds.contains(selectedAnswerId)) {
					selectedAnswerIds.add(selectedAnswerId);
				}
			}
		}
		if (selectedAnswerIds.isEmpty() && fallbackAnswerId != null) {
			selectedAnswerIds.add(fallbackAnswerId);
		}
		return selectedAnswerIds;
	}

	private Map<Integer, String> resolveSelectedAnswerComments(ApplicationsDto dto, List<Integer> selectedAnswerIds) {
		Map<Integer, String> selectedAnswerComments = new LinkedHashMap<Integer, String>();
		if (dto == null || dto.getSelectedAnswerComments() == null || dto.getSelectedAnswerComments().isEmpty()) {
			return selectedAnswerComments;
		}

		Set<Integer> allowedAnswerIds = new HashSet<Integer>(selectedAnswerIds);
		for (Map.Entry<Integer, String> entry : dto.getSelectedAnswerComments().entrySet()) {
			if (entry == null || entry.getKey() == null || !allowedAnswerIds.contains(entry.getKey())) {
				continue;
			}

			selectedAnswerComments.put(entry.getKey(), StringUtils.trimToNull(entry.getValue()));
		}

		return selectedAnswerComments;
	}

	private Integer parseInteger(String value) {
		if (StringUtils.isBlank(value)) {
			return null;
		}
		try {
			return Integer.parseInt(value);
		} catch (NumberFormatException ex) {
			return null;
		}
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

		Applications application = findTrackedApplication(trackingCode, email);
		if (application == null) {
			result.put("hasError", true);
			result.put("message", "Aucune candidature trouvée pour ce code et cet email. Verifiez les informations saisies ou contactez le recruteur de la campagne.");
			return result;
		}

		// 3. Données de base de la candidature
		Map<String, Object> appData = new HashMap<>();
		appData.put("id", application.getId());
		appData.put("candidateFirstName", application.getCandidateFirstName());
		appData.put("candidateLastName", application.getCandidateLastName());
		appData.put("candidateEmail", application.getCandidateEmail());
		appData.put("applicationStatus", resolveTrackedApplicationStatus(application));
		appData.put("quizStatus", application.getQuizStatus());
		appData.put("applicationAbandoned", Boolean.TRUE.equals(application.getApplicationAbandoned()));
		appData.put("createdAt", application.getCreatedAt());
		appData.put("emailVerified", application.getEmailVerified());
		appData.put("trackingCode", ensureCandidateTrackingCode(application, null));

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
		result.put("interviews", buildTrackedInterviews(application));
		result.put("asks", buildTrackedCandidateAsks(application));

		log.info("----end trackApplication-----");
		return result;
	}

	private String resolveTrackedApplicationStatus(Applications application) {
		if (application == null) {
			return "NEW";
		}

		if (Boolean.TRUE.equals(application.getApplicationAbandoned())) {
			return "WITHDRAWN";
		}

		String normalizedStatus = StringUtils.upperCase(StringUtils.trimToEmpty(application.getApplicationStatus()));
		if (StringUtils.endsWith(normalizedStatus, "_ARCHIVED")) {
			normalizedStatus = StringUtils.removeEnd(normalizedStatus, "_ARCHIVED");
		}

		return switch (normalizedStatus) {
			case "", "PENDING" -> "NEW";
			case "FINAL_ACCEPTED" -> "ACCEPTED";
			case "PRE_SCREEN_REJECTED", "FINAL_REJECTED" -> "REJECTED";
			default -> "IN_PROGRESS";
		};
	}

	@Transactional
	public Map<String, Object> submitTrackedCandidateAsk(
			String trackingCode,
			String email,
			String requestType,
			String firstName,
			String lastName,
			String newEmail,
			String newPhone,
			Locale locale) {
		log.info("----begin submitTrackedCandidateAsk-----");
		Map<String, Object> result = new HashMap<String, Object>();

		if (StringUtils.isBlank(trackingCode) || StringUtils.isBlank(email)) {
			result.put("hasError", true);
			result.put("message", "Le code de suivi et l'email sont requis.");
			return result;
		}

		Applications application = findTrackedApplication(trackingCode, email);
		if (application == null) {
			result.put("hasError", true);
			result.put("message", "Aucune candidature trouvée pour ce code et cet email.");
			return result;
		}

		CandidateAskRequestType normalizedRequestType;
		try {
			normalizedRequestType = CandidateAskRequestType.fromValue(requestType);
		} catch (IllegalArgumentException exception) {
			result.put("hasError", true);
			result.put("message", "Le type de demande est invalide.");
			return result;
		}
		String normalizedRequestTypeValue = normalizedRequestType.getValue();

		if (hasPendingTrackedCandidateAsk(application.getId(), normalizedRequestTypeValue)) {
			result.put("hasError", true);
			result.put("message", "Une demande de ce type est déjà en attente de traitement.");
			return result;
		}

		String normalizedFirstName = normalizeTrackedCandidateAskText(firstName);
		String normalizedLastName = normalizeTrackedCandidateAskText(lastName);
		String normalizedNewEmail = normalizeTrackedCandidateAskEmail(newEmail);
		String normalizedNewPhone = normalizeTrackedCandidateAskText(newPhone);

		CandidateAsk candidateAsk = new CandidateAsk();
		candidateAsk.setApplications(application);
		candidateAsk.setRequestType(normalizedRequestTypeValue);
		candidateAsk.setIsVerified(false);
		candidateAsk.setIsDeleted(false);

		String successMessage;
		switch (normalizedRequestType) {
			case EMAIL:
				if (StringUtils.isBlank(normalizedNewEmail)) {
					result.put("hasError", true);
					result.put("message", "Veuillez renseigner la nouvelle adresse email.");
					return result;
				}
				if (!Utilities.isValidEmail(normalizedNewEmail)) {
					result.put("hasError", true);
					result.put("message", "Veuillez saisir une adresse email valide.");
					return result;
				}
				if (StringUtils.equalsIgnoreCase(normalizedNewEmail, application.getCandidateEmail())) {
					result.put("hasError", true);
					result.put("message", "La nouvelle adresse email doit être différente de l'adresse actuelle.");
					return result;
				}
				candidateAsk.setNewEmail(normalizedNewEmail);
				successMessage = "Votre demande de changement d'email a bien été enregistrée.";
				break;
			case PHONE:
				if (StringUtils.isBlank(normalizedNewPhone)) {
					result.put("hasError", true);
					result.put("message", "Veuillez renseigner le nouveau numéro de téléphone.");
					return result;
				}
				if (StringUtils.equals(normalizedNewPhone, normalizeTrackedCandidateAskText(application.getCandidatePhone()))) {
					result.put("hasError", true);
					result.put("message", "Le nouveau numéro doit être différent du numéro actuel.");
					return result;
				}
				candidateAsk.setNewPhone(normalizedNewPhone);
				successMessage = "Votre demande de changement de téléphone a bien été enregistrée.";
				break;
			case IDENTITY:
				String currentFirstName = normalizeTrackedCandidateAskText(application.getCandidateFirstName());
				String currentLastName = normalizeTrackedCandidateAskText(application.getCandidateLastName());
				boolean firstNameChanged = StringUtils.isNotBlank(normalizedFirstName)
						&& !StringUtils.equals(normalizedFirstName, currentFirstName);
				boolean lastNameChanged = StringUtils.isNotBlank(normalizedLastName)
						&& !StringUtils.equals(normalizedLastName, currentLastName);
				if (!firstNameChanged && !lastNameChanged) {
					result.put("hasError", true);
					result.put("message", "Veuillez renseigner au moins un nom ou un prénom différent de la candidature actuelle.");
					return result;
				}
				candidateAsk.setFirstName(firstNameChanged ? normalizedFirstName : null);
				candidateAsk.setLastName(lastNameChanged ? normalizedLastName : null);
				successMessage = "Votre demande de correction d'identité a bien été enregistrée.";
				break;
			default:
				result.put("hasError", true);
				result.put("message", "Le type de demande est invalide.");
				return result;
		}

		Date now = Utilities.getCurrentDate();
		candidateAsk.setAskStatus(CandidateAskStatus.PENDING.getValue());
		candidateAsk.setCreatedAt(now);
		candidateAsk.setCreatedBy(SYSTEM_ACTOR_USER_ID);
		candidateAsk.setUpdatedAt(now);
		candidateAsk.setUpdatedBy(SYSTEM_ACTOR_USER_ID);
		candidateAsk.setSearchString(buildCandidateAskSearchString(candidateAsk));
		candidateAskRepository.save(candidateAsk);

		result.put("hasError", false);
		result.put("message", successMessage);
		result.put("asks", buildTrackedCandidateAsks(application));
		log.info("----end submitTrackedCandidateAsk-----");
		return result;
	}

	@Transactional
	public Map<String, Object> respondToTrackedInterview(
			String trackingCode,
			String email,
			Integer candidateInterviewId,
			String action,
			String declineReason,
			String alternativeDateRequested,
			Locale locale) throws ParseException {
		log.info("----begin respondToTrackedInterview-----");
		Map<String, Object> result = new HashMap<>();

		if (StringUtils.isBlank(trackingCode) || StringUtils.isBlank(email)) {
			result.put("hasError", true);
			result.put("message", "Le code de suivi et l'email sont requis.");
			return result;
		}
		if (candidateInterviewId == null || candidateInterviewId <= 0) {
			result.put("hasError", true);
			result.put("message", "L'entretien candidat est requis.");
			return result;
		}
		if (StringUtils.isBlank(action)) {
			result.put("hasError", true);
			result.put("message", "L'action de réponse est requise.");
			return result;
		}

		Applications application = findTrackedApplication(trackingCode, email);
		if (application == null) {
			result.put("hasError", true);
			result.put("message", "Aucune candidature trouvée pour ce code et cet email.");
			return result;
		}

		CandidateInterview candidateInterview = candidateInterviewRepository.findOne(candidateInterviewId, false);
		if (candidateInterview == null
				|| candidateInterview.getApplications() == null
				|| !Objects.equals(candidateInterview.getApplications().getId(), application.getId())) {
			result.put("hasError", true);
			result.put("message", "Entretien candidat introuvable pour cette candidature.");
			return result;
		}

		Interviews interview = candidateInterview.getInterviews() != null && candidateInterview.getInterviews().getId() != null
				? interviewsRepository.findOne(candidateInterview.getInterviews().getId(), false)
				: null;
		if (interview == null) {
			result.put("hasError", true);
			result.put("message", "Entretien introuvable.");
			return result;
		}
		if ("OVER".equalsIgnoreCase(interview.getInterviewStatus()) || "ARCHIVED".equalsIgnoreCase(interview.getInterviewStatus())) {
			result.put("hasError", true);
			result.put("message", "Cet entretien ne peut plus être modifié.");
			return result;
		}

		String normalizedAction = action.trim().toUpperCase(Locale.ROOT);
		Date now = Utilities.getCurrentDate();
		String successMessage;
		String recruiterNotificationType = null;
		switch (normalizedAction) {
			case "ACCEPT":
				candidateInterview.setDeclineReason(null);
				candidateInterview.setAlternativeDateRequested(null);
				candidateInterview.setInterviewStart(interview.getInterviewDate());
				if (!"STARTED".equalsIgnoreCase(interview.getInterviewStatus())
						&& !"OVER".equalsIgnoreCase(interview.getInterviewStatus())) {
					interview.setInterviewStatus("SCHEDULED");
				}
				successMessage = "Votre entretien est confirmé.";
				break;
			case "DECLINE":
				if (StringUtils.isBlank(declineReason)) {
					result.put("hasError", true);
					result.put("message", "Veuillez préciser la raison du refus.");
					return result;
				}
				candidateInterview.setDeclineReason(declineReason.trim());
				candidateInterview.setAlternativeDateRequested(null);
				successMessage = "Votre refus a bien été transmis.";
				recruiterNotificationType = "INTERVIEW_DECLINED";
				break;
			case "REQUEST_RESCHEDULE":
				Date requestedDate = parseCandidateRequestedDate(alternativeDateRequested);
				if (requestedDate == null) {
					result.put("hasError", true);
					result.put("message", "Veuillez proposer une nouvelle date valide.");
					return result;
				}
				candidateInterview.setAlternativeDateRequested(requestedDate);
				candidateInterview.setDeclineReason(null);
				candidateInterview.setInterviewStart(interview.getInterviewDate());
				interview.setInterviewStatus("POSTPONED");
				successMessage = "Votre demande de replanification a bien été transmise.";
				recruiterNotificationType = "INTERVIEW_RESCHEDULE_REQUESTED";
				break;
			default:
				result.put("hasError", true);
				result.put("message", "Action inconnue.");
				return result;
		}

		candidateInterview.setUpdatedAt(now);
		candidateInterview.setUpdatedBy(SYSTEM_ACTOR_USER_ID);
		candidateInterview.setSearchString(buildCandidateInterviewSearchString(candidateInterview));
		candidateInterviewRepository.save(candidateInterview);

		interview.setUpdatedAt(now);
		interview.setUpdatedBy(SYSTEM_ACTOR_USER_ID);
		interviewsRepository.save(interview);

		if (recruiterNotificationType != null) {
			try {
				notifyRecruitersOfInterviewCandidateResponse(application, recruiterNotificationType, candidateInterview.getId());
			} catch (Exception e) {
				log.warning("Erreur lors de la notification interne de réponse entretien pour candidature " + application.getId() + ": " + e.getMessage());
			}
		}

		result.put("hasError", false);
		result.put("message", successMessage);
		result.put("interview", buildTrackedInterview(candidateInterview, interview));
		result.put("interviews", buildTrackedInterviews(application));
		log.info("----end respondToTrackedInterview-----");
		return result;
	}

	private Applications findTrackedApplication(String trackingCode, String email) {
		List<CandidateToken> tokens = candidateTokenRepository.findByTokenStringIgnoreCase(trackingCode.trim(), false);
		if (tokens == null || tokens.isEmpty()) {
			return null;
		}

		for (CandidateToken token : tokens) {
			if (token.getApplications() != null
					&& token.getApplications().getCandidateEmail() != null
					&& token.getApplications().getCandidateEmail().equalsIgnoreCase(email.trim())) {
				return token.getApplications();
			}
		}
		return null;
	}

	private String ensureCandidateTrackingCode(Applications application, Integer actorUserId) {
		if (application == null || application.getId() == null) {
			return null;
		}

		List<CandidateToken> existingTokens = candidateTokenRepository.findByApplicationId(application.getId(), false);
		if (existingTokens != null) {
			for (CandidateToken existingToken : existingTokens) {
				if (existingToken != null && !Boolean.TRUE.equals(existingToken.getIsDeleted()) && StringUtils.isNotBlank(existingToken.getTokenString())) {
					return StringUtils.upperCase(existingToken.getTokenString(), Locale.ROOT);
				}
			}
		}

		CandidateToken candidateToken = new CandidateToken();
		candidateToken.setApplications(application);
		candidateToken.setTokenString(generateUniqueCandidateTrackingCode());
		candidateToken.setCreatedAt(Utilities.getCurrentDate());
		candidateToken.setCreatedBy(actorUserId);
		candidateToken.setUpdatedAt(Utilities.getCurrentDate());
		candidateToken.setUpdatedBy(actorUserId);
		candidateToken.setIsDeleted(false);
		candidateToken.setSearchString(buildCandidateTrackingSearchString(application, candidateToken.getTokenString()));
		CandidateToken savedCandidateToken = candidateTokenRepository.save(candidateToken);
		return savedCandidateToken != null
				? StringUtils.upperCase(savedCandidateToken.getTokenString(), Locale.ROOT)
				: StringUtils.upperCase(candidateToken.getTokenString(), Locale.ROOT);
	}

	private String generateUniqueCandidateTrackingCode() {
		for (int attempt = 0; attempt < 50; attempt++) {
			StringBuilder tokenBuilder = new StringBuilder(TRACKING_CODE_LENGTH);
			for (int index = 0; index < TRACKING_CODE_LENGTH; index++) {
				int charIndex = TRACKING_CODE_RANDOM.nextInt(TRACKING_CODE_ALPHABET.length());
				tokenBuilder.append(TRACKING_CODE_ALPHABET.charAt(charIndex));
			}

			String candidateCode = tokenBuilder.toString();
			List<CandidateToken> existingTokens = candidateTokenRepository.findByTokenStringIgnoreCase(candidateCode, false);
			if (existingTokens == null || existingTokens.isEmpty()) {
				return candidateCode;
			}
		}

		return UUID.randomUUID().toString().replace("-", "").substring(0, TRACKING_CODE_LENGTH).toUpperCase(Locale.ROOT);
	}

	private String buildCandidateTrackingSearchString(Applications application, String trackingCode) {
		List<String> values = new ArrayList<String>();
		values.add(StringUtils.defaultString(trackingCode));
		if (application != null) {
			values.add(StringUtils.defaultString(application.getCandidateFirstName()));
			values.add(StringUtils.defaultString(application.getCandidateLastName()));
			values.add(StringUtils.defaultString(application.getCandidateEmail()));
		}
		return StringUtils.normalizeSpace(StringUtils.join(values, ' '));
	}

	private boolean hasPendingTrackedCandidateAsk(Integer applicationId, String requestType) {
		if (applicationId == null || StringUtils.isBlank(requestType)) {
			return false;
		}

		List<CandidateAsk> asks = candidateAskRepository.findByApplicationId(applicationId, false);
		if (asks == null || asks.isEmpty()) {
			return false;
		}

		for (CandidateAsk ask : asks) {
			if (ask == null || Boolean.TRUE.equals(ask.getIsDeleted())) {
				continue;
			}
			if (CandidateAskStatus.PENDING == resolveCandidateAskStatus(ask)
					&& StringUtils.equalsIgnoreCase(requestType, ask.getRequestType())) {
				return true;
			}
		}
		return false;
	}

	public void restartEmailVerification(Applications application, Locale locale) throws Exception {
		if (application == null) {
			return;
		}
		createVerificationTokenAndSendEmail(application, locale);
	}

	private CandidateAskStatus resolveCandidateAskStatus(CandidateAsk candidateAsk) {
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

	private String normalizeTrackedCandidateAskText(String value) {
		String normalizedValue = StringUtils.trimToNull(value);
		return normalizedValue != null ? normalizedValue : null;
	}

	private String normalizeTrackedCandidateAskEmail(String value) {
		String normalizedValue = normalizeTrackedCandidateAskText(value);
		return normalizedValue != null ? normalizedValue.toLowerCase(Locale.ROOT) : null;
	}

	private String buildCandidateAskSearchString(CandidateAsk candidateAsk) {
		List<String> values = new ArrayList<String>();
		if (candidateAsk != null) {
			values.add(StringUtils.defaultString(candidateAsk.getRequestType()));
			values.add(StringUtils.defaultString(candidateAsk.getFirstName()));
			values.add(StringUtils.defaultString(candidateAsk.getLastName()));
			values.add(StringUtils.defaultString(candidateAsk.getNewEmail()));
			values.add(StringUtils.defaultString(candidateAsk.getNewPhone()));
		}
		return StringUtils.normalizeSpace(StringUtils.join(values, ' '));
	}

	private List<Map<String, Object>> buildTrackedCandidateAsks(Applications application) {
		List<Map<String, Object>> asks = new ArrayList<Map<String, Object>>();
		if (application == null || application.getId() == null) {
			return asks;
		}

		List<CandidateAsk> candidateAsks = candidateAskRepository.findByApplicationId(application.getId(), false);
		if (candidateAsks == null || candidateAsks.isEmpty()) {
			return asks;
		}

		candidateAsks.sort(Comparator.comparing(CandidateAsk::getCreatedAt, Comparator.nullsLast(Date::compareTo)).reversed());
		for (CandidateAsk candidateAsk : candidateAsks) {
			if (candidateAsk == null || Boolean.TRUE.equals(candidateAsk.getIsDeleted())) {
				continue;
			}
			asks.add(buildTrackedCandidateAsk(candidateAsk));
		}
		return asks;
	}

	private Map<String, Object> buildTrackedCandidateAsk(CandidateAsk candidateAsk) {
		Map<String, Object> askData = new HashMap<String, Object>();
		CandidateAskStatus askStatus = resolveCandidateAskStatus(candidateAsk);
		askData.put("id", candidateAsk.getId());
		askData.put("requestType", candidateAsk.getRequestType());
		askData.put("askStatus", askStatus.getValue());
		askData.put("isVerified", candidateAsk.getIsVerified());
		askData.put("firstName", candidateAsk.getFirstName());
		askData.put("lastName", candidateAsk.getLastName());
		askData.put("newEmail", candidateAsk.getNewEmail());
		askData.put("newPhone", candidateAsk.getNewPhone());
		askData.put("decisionReason", candidateAsk.getDecisionReason());
		askData.put("createdAt", candidateAsk.getCreatedAt());
		askData.put("updatedAt", candidateAsk.getUpdatedAt());
		return askData;
	}

	private List<Map<String, Object>> buildTrackedInterviews(Applications application) {
		List<Map<String, Object>> interviews = new ArrayList<>();
		if (application == null || application.getId() == null) {
			return interviews;
		}

		List<CandidateInterview> links = candidateInterviewRepository.findByApplicationId(application.getId(), false);
		if (links == null || links.isEmpty()) {
			return interviews;
		}

		links.sort(Comparator.comparing(CandidateInterview::getInterviewStart, Comparator.nullsLast(Date::compareTo)));
		for (CandidateInterview link : links) {
			Interviews interview = link.getInterviews() != null && link.getInterviews().getId() != null
					? interviewsRepository.findOne(link.getInterviews().getId(), false)
					: null;
			if (interview == null) {
				continue;
			}
			interviews.add(buildTrackedInterview(link, interview));
		}
		return interviews;
	}

	private Map<String, Object> buildTrackedInterview(CandidateInterview candidateInterview, Interviews interview) {
		Map<String, Object> interviewData = new HashMap<>();
		interviewData.put("id", candidateInterview.getId());
		interviewData.put("interviewId", interview.getId());
		interviewData.put("interviewStart", candidateInterview.getInterviewStart() != null ? candidateInterview.getInterviewStart() : interview.getInterviewDate());
		interviewData.put("interviewDuration", candidateInterview.getInterviewDuration());
		interviewData.put("interviewType", interview.getInterviewType());
		interviewData.put("interviewStatus", interview.getInterviewStatus());
		interviewData.put("interviewLocation", interview.getInterviewLocation());
		interviewData.put("meetLink", interview.getMeetLink());
		interviewData.put("interviewMailSent", interview.getInterviewMailSent());
		interviewData.put("interviewNote", interview.getInterviewNote());
		interviewData.put("declineReason", candidateInterview.getDeclineReason());
		interviewData.put("alternativeDateRequested", candidateInterview.getAlternativeDateRequested());
		interviewData.put("responseState", resolveCandidateInterviewResponseState(candidateInterview));
		interviewData.put("canRespond", !"OVER".equalsIgnoreCase(interview.getInterviewStatus())
				&& !"ARCHIVED".equalsIgnoreCase(interview.getInterviewStatus()));
		return interviewData;
	}

	private String resolveCandidateInterviewResponseState(CandidateInterview candidateInterview) {
		if (candidateInterview == null) {
			return "PENDING";
		}
		if (candidateInterview.getAlternativeDateRequested() != null) {
			return "RESCHEDULE_REQUESTED";
		}
		if (StringUtils.isNotBlank(candidateInterview.getDeclineReason())) {
			return "DECLINED";
		}
		return "PENDING";
	}

	private void notifyAuthorizedRecruitersOfNewApplication(Applications application, Integer actorUserId) {
		Campaigns campaign = resolveCampaignForApplicationNotification(application);
		if (campaign == null || campaign.getId() == null) {
			return;
		}

		Map<Integer, User> recipients = resolveCampaignNotificationRecipients(campaign, NEW_APPLICATION_NOTIFICATION_PERMISSION_KEYS);
		if (recipients.isEmpty()) {
			return;
		}

		String notifLink = "/dashboard/campaigns/" + campaign.getId();
		Integer createdBy = normalizeSystemActor(actorUserId);
		Integer notifActor = normalizeInternalActor(actorUserId);
		for (User recipient : recipients.values()) {
			if (recipient == null || recipient.getId() == null) {
				continue;
			}
			if (notifActor != null && Objects.equals(recipient.getId(), notifActor)) {
				continue;
			}
			createInternalNotification(
					recipient,
					"APPLICATION_RECEIVED",
					notifActor,
					notifLink,
					createdBy,
					"applications",
					application.getId());
		}
	}

	private void notifyRecruitersOfInterviewCandidateResponse(Applications application, String notifType, Integer candidateInterviewId) {
		if (candidateInterviewId == null || !StringUtils.isNotBlank(notifType)) {
			return;
		}

		Campaigns campaign = resolveCampaignForApplicationNotification(application);
		if (campaign == null || campaign.getId() == null) {
			return;
		}

		Map<Integer, User> recipients = resolveCampaignNotificationRecipients(campaign, INTERVIEW_RESPONSE_NOTIFICATION_PERMISSION_KEYS);
		if (recipients.isEmpty()) {
			return;
		}

		for (User recipient : recipients.values()) {
			if (recipient == null || recipient.getId() == null) {
				continue;
			}
			createInternalNotification(
					recipient,
					notifType,
					null,
					"/dashboard/interviews",
					SYSTEM_ACTOR_USER_ID,
					"candidate_interview",
					candidateInterviewId);
		}
	}

	private Campaigns resolveCampaignForApplicationNotification(Applications application) {
		if (application == null || application.getSourceToken() == null) {
			return null;
		}
		if (application.getSourceToken().getCampaigns() != null && application.getSourceToken().getCampaigns().getId() != null) {
			return application.getSourceToken().getCampaigns();
		}
		return null;
	}

	private Map<Integer, User> resolveCampaignNotificationRecipients(Campaigns campaign, Set<String> permissionKeys) {
		Map<Integer, User> recipients = new LinkedHashMap<>();
		if (campaign == null || campaign.getId() == null || permissionKeys == null || permissionKeys.isEmpty()) {
			return recipients;
		}

		List<EntityPermission> permissions = entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", campaign.getId());
		if (permissions != null) {
			for (EntityPermission permission : permissions) {
				if (permission == null || Boolean.TRUE.equals(permission.getIsDeleted())) {
					continue;
				}
				if (!permissionKeys.contains(permission.getPermissionKey())) {
					continue;
				}
				User permissionUser = permission.getUser();
				if (permissionUser == null || permissionUser.getId() == null || Boolean.TRUE.equals(permissionUser.getIsDeleted())) {
					continue;
				}
				recipients.put(permissionUser.getId(), permissionUser);
			}
		}

		Integer creatorId = campaign.getCreatedBy();
		if (creatorId != null && creatorId > 0) {
			User creator = userRepository.findOne(creatorId, false);
			if (creator != null) {
				recipients.put(creator.getId(), creator);
			}
		}

		return recipients;
	}

	private void createInternalNotification(
			User recipient,
			String notifType,
			Integer notifActor,
			String notifLink,
			Integer createdBy,
			String objectTableName,
			Integer objectTableId) {
		if (recipient == null || recipient.getId() == null || StringUtils.isBlank(notifType)) {
			return;
		}

		Notifications notification = new Notifications();
		notification.setUser(recipient);
		notification.setNotifType(notifType);
		notification.setNotifActor(notifActor);
		notification.setNotifLink(notifLink);
		notification.setIsRead(false);
		notification.setCreatedAt(Utilities.getCurrentDate());
		notification.setCreatedBy(createdBy);
		notification.setIsDeleted(false);
		notification.setObjectTableName(objectTableName);
		notification.setObjectTableId(objectTableId);
		notificationsRepository.save(notification);
	}

	private Integer normalizeSystemActor(Integer actorUserId) {
		return actorUserId != null && actorUserId > 0 ? actorUserId : SYSTEM_ACTOR_USER_ID;
	}

	private Integer normalizeInternalActor(Integer actorUserId) {
		return actorUserId != null && actorUserId > 0 ? actorUserId : null;
	}

	private Date parseCandidateRequestedDate(String rawDate) {
		if (StringUtils.isBlank(rawDate)) {
			return null;
		}
		List<String> patterns = Arrays.asList("yyyy-MM-dd'T'HH:mm", "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy HH:mm");
		for (String pattern : patterns) {
			try {
				SimpleDateFormat formatter = new SimpleDateFormat(pattern);
				formatter.setLenient(false);
				return formatter.parse(rawDate.trim());
			} catch (ParseException ignored) {
				// try next format
			}
		}
		return null;
	}

	private String buildCandidateInterviewSearchString(CandidateInterview candidateInterview) {
		List<String> values = new ArrayList<>();
		if (candidateInterview.getApplications() != null && candidateInterview.getApplications().getId() != null) {
			values.add(candidateInterview.getApplications().getId().toString());
		}
		if (candidateInterview.getInterviews() != null && candidateInterview.getInterviews().getId() != null) {
			values.add(candidateInterview.getInterviews().getId().toString());
		}
		if (candidateInterview.getInterviewStart() != null) {
			values.add(dateTimeFormat.format(candidateInterview.getInterviewStart()));
		}
		if (StringUtils.isNotBlank(candidateInterview.getDeclineReason())) {
			values.add(candidateInterview.getDeclineReason().trim());
		}
		if (candidateInterview.getAlternativeDateRequested() != null) {
			values.add(dateTimeFormat.format(candidateInterview.getAlternativeDateRequested()));
		}
		return StringUtils.normalizeSpace(String.join(" ", values));
	}
}
