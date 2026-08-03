                                                                                																			
/*
 * Java business for entity table applications 
 * Created on 2025-08-22 ( Time 11:38:24 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.business;

import tech.synelia.quizapp.business.MailLogService.MailLogContext;
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
import java.util.logging.Level;

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
	private ApplicationQuizAttemptRepository applicationQuizAttemptRepository;
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
		private final Integer quizScore;
		private final Integer totalQuestions;
		private final Integer totalPossibleScore;
		private final Integer quizScorePercent;
		private final String manualCorrectionStatus;

		private QuizScoringSummary(Integer quizScore, Integer totalQuestions, Integer totalPossibleScore, Integer quizScorePercent, String manualCorrectionStatus) {
			this.quizScore = quizScore;
			this.totalQuestions = totalQuestions;
			this.totalPossibleScore = totalPossibleScore;
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
	private static final String TRACKED_APPLICATION_WITHDRAWN_MESSAGE = "Cette candidature a été retirée. Les actions publiques ne sont plus disponibles.";
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
		List<Campaigns> effectiveCampaigns = new ArrayList<Campaigns>();

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
			Campaigns existingCampaign = null;
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
			} else if (dto.getCampaignId() != null && dto.getCampaignId() > 0) {
				existingCampaign = campaignPublicAccessService.requirePublicCampaign(dto.getCampaignId(), locale);
				int pendingApplicationsForCampaign = pendingApplicationsByCampaign.getOrDefault(existingCampaign.getId(), 0);
				campaignPublicAccessService.ensureCampaignAllowsDirectApplications(
						existingCampaign,
						pendingApplicationsForCampaign,
						locale);
				pendingApplicationsByCampaign.merge(existingCampaign.getId(), 1, Integer::sum);
				// Trouver ou créer le token public pour cette campagne
				existingSourceToken = findOrCreatePublicSourceToken(existingCampaign, request.getUser());
			}
			// Verify if formVersion exist
			FormVersion existingFormVersion = null;
			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0){
				existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
				if (existingSourceToken != null) {
					validateFormVersionMatchesCampaign(existingFormVersion, existingSourceToken, locale);
				} else {
					validateFormVersionMatchesCampaign(existingFormVersion, existingCampaign, locale);
				}
			} else if (existingSourceToken != null || existingCampaign != null) {
				existingFormVersion = selectFormVersionForCandidate(
						existingSourceToken,
						existingCampaign,
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
			// Initialiser les champs obligatoires
			entityToSave.setEmailVerified(false);
			entityToSave.setApplicationAbandoned(false); // Initialiser à false
			registerPendingFormAssignment(existingSourceToken, existingCampaign, dto.getCandidateEmail(), existingFormVersion,
					pendingAssignedFormsByCampaign, pendingCandidateFormHistory);
			effectiveCampaigns.add(existingSourceToken != null && existingSourceToken.getCampaigns() != null
					? existingSourceToken.getCampaigns() : existingCampaign);
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

			// Initialiser le progrès pipeline pour chaque application créée (sourceToken ET campagne publique)
			for (int appIdx = 0; appIdx < itemsSaved.size(); appIdx++) {
				Applications savedApp = itemsSaved.get(appIdx);
				Campaigns campaign = appIdx < effectiveCampaigns.size() ? effectiveCampaigns.get(appIdx) : null;
				if (campaign == null && savedApp.getSourceToken() != null) {
					campaign = savedApp.getSourceToken().getCampaigns();
				}
				if (campaign == null || campaign.getPipelineTemplate() == null) {
					continue;
				}
				try {
					Integer templateId = campaign.getPipelineTemplate().getId();
					applicationProgressBusiness.initProgressForApplication(savedApp.getId(), templateId, request.getUser());
					applicationProgressBusiness.advanceToNextStage(savedApp.getId(), request.getUser(), locale);
				} catch (Exception e) {
					log.warning("Erreur lors de l'initialisation du pipeline pour application ID " + savedApp.getId() + ": " + e.getMessage());
					e.printStackTrace();
				}
			}

			// Générer quizToken si l'étape suivant CANDIDATURE est QUIZ
			Map<Integer, String> quizTokensByAppId = new HashMap<Integer, String>();
			for (int appIdx = 0; appIdx < itemsSaved.size(); appIdx++) {
				Applications savedApp = itemsSaved.get(appIdx);
				Campaigns campaign = appIdx < effectiveCampaigns.size() ? effectiveCampaigns.get(appIdx) : null;
				if (campaign == null && savedApp.getSourceToken() != null) {
					campaign = savedApp.getSourceToken().getCampaigns();
				}
				if (campaign == null || campaign.getPipelineTemplate() == null) {
					continue;
				}
				try {
					List<PipelineStage> stages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(campaign.getPipelineTemplate().getId());
					if (stages != null && stages.size() >= 2) {
						PipelineStage secondStage = stages.get(1);
						if ("QUIZ".equals(secondStage.getStageType()) || "TECHNICAL_TEST".equals(secondStage.getStageType())) {
							String quizToken = java.util.UUID.randomUUID().toString().replace("-", "");
							ApplicationQuizAttempt quizAttempt = createQuizAttemptForVerifiedApplication(savedApp, quizToken, request.getUser());
							if (quizAttempt == null || quizAttempt.getId() == null) {
								log.severe("Quiz token NON émis pour l'application " + savedApp.getId() + ": aucune tentative quiz créée");
							} else {
								savedApp.setUpdatedAt(Utilities.getCurrentDate());
								savedApp.setUpdatedBy(request.getUser());
								applicationsRepository.save(savedApp);
								syncApplicationQuizSummaryFromAttempt(savedApp, quizAttempt, request.getUser());
								quizTokensByAppId.put(savedApp.getId(), quizToken);
								log.info("Quiz token généré automatiquement pour application ID " + savedApp.getId());
							}
						}
					}
				} catch (Exception e) {
					log.warning("Erreur lors de la génération du quiz token pour application ID " + savedApp.getId() + ": " + e.getMessage());
					e.printStackTrace();
				}
			}

			List<ApplicationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? ApplicationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : ApplicationsTransformer.INSTANCE.toDtos(itemsSaved);
			for (ApplicationsDto dto : itemsDto) {
				dto.setTrackingCode(trackingCodesByApplicationId.get(dto.getId()));
				String qt = quizTokensByAppId.get(dto.getId());
				if (qt != null) {
					dto.setSearchString(qt);
				}
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
			
			// Créer le token de vérification et envoyer l'email pour chaque application créée
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
			// Quiz/evaluation aggregates and status are derived runtime mirrors.
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
			List<CandidateAnswer> listOfCandidateAnswer = candidateAnswerRepository.findByApplicationQuizAttemptApplicationsId(existingEntity.getId(), false);
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
		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (dto == null || dto.getId() == null) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		dto.setQuizAttempts(buildApplicationQuizAttemptSummaries(dto.getId()));

		return dto;
	}

	private List<ApplicationQuizAttemptSummaryDto> buildApplicationQuizAttemptSummaries(Integer applicationId) {
		if (applicationId == null || applicationId <= 0) {
			return Collections.emptyList();
		}

		List<ApplicationQuizAttempt> quizAttempts = applicationQuizAttemptRepository.findByApplicationIdOrderByIdDesc(applicationId, false);
		if (quizAttempts == null || quizAttempts.isEmpty()) {
			return Collections.emptyList();
		}

		List<ApplicationQuizAttemptSummaryDto> items = new ArrayList<>();
		for (ApplicationQuizAttempt quizAttempt : quizAttempts) {
			if (quizAttempt == null || quizAttempt.getId() == null) {
				continue;
			}

			ApplicationQuizAttemptSummaryDto item = new ApplicationQuizAttemptSummaryDto();
			item.setId(quizAttempt.getId());
			item.setQuizToken(quizAttempt.getQuizToken());
			item.setQuizStatus(quizAttempt.getQuizStatus());
			item.setManualCorrectionStatus(quizAttempt.getManualCorrectionStatus());
			item.setScore(quizAttempt.getScore());
			item.setScorePercent(quizAttempt.getScorePercent());
			item.setTotalQuestions(quizAttempt.getTotalQuestions());
			item.setTimeElapsed(quizAttempt.getTimeElapsed());
			item.setTimedSnapshot(quizAttempt.getTimedSnapshot());
			item.setTotalTimeAllowedSnapshot(quizAttempt.getTotalTimeAllowedSnapshot());
			item.setLastActivityAt(formatDateTime(quizAttempt.getLastActivityAt()));
			item.setStartedAt(formatDateTime(quizAttempt.getStartedAt()));
			item.setCompletedAt(formatDateTime(quizAttempt.getCompletedAt()));
			item.setCreatedAt(formatDateTime(quizAttempt.getCreatedAt()));
			item.setUpdatedAt(formatDateTime(quizAttempt.getUpdatedAt()));
			items.add(item);
		}

		return items;
	}

	private String formatDateTime(Date value) {
		return value == null ? null : dateTimeFormat.format(value);
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
		Response<?> responseEmail = hostingUtils.sendEmail(
				from,
				toRecipients,
				subject,
				body,
				null,
				context,
				template,
				locale,
				buildApplicationVerificationMailLogContext(application));
		
		if (responseEmail.isHasError()) {
			log.warning("Échec de l'envoi de l'email de vérification pour: " + application.getCandidateEmail());
			// Ne pas bloquer le processus si l'email échoue, mais logger l'erreur
		} else {
			log.info("Email de vérification envoyé avec succès à: " + application.getCandidateEmail());
		}
		
		log.info("----end createVerificationTokenAndSendEmail-----");
	}

	private MailLogContext buildApplicationVerificationMailLogContext(Applications application) {
		ApplicationProgress currentProgress = resolveApplicationVerificationProgress(application);
		return MailLogContext.builder()
				.applicationId(application != null ? application.getId() : null)
				.applicationProgressId(currentProgress != null ? currentProgress.getId() : null)
				.eventCode("APPLICATION_VERIFICATION_EMAIL")
				.requiresConfirmation(Boolean.FALSE)
				.build();
	}

	private ApplicationProgress resolveApplicationVerificationProgress(Applications application) {
		if (application == null || application.getId() == null) {
			return null;
		}

		ApplicationProgress inProgress = applicationProgressRepository.findCurrentStage(application.getId());
		if (inProgress != null) {
			return inProgress;
		}

		List<ApplicationProgress> pendingStages = applicationProgressRepository.findPendingByApplicationId(application.getId());
		if (pendingStages != null && !pendingStages.isEmpty()) {
			return pendingStages.get(0);
		}

		return null;
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
			
			// Créer la tentative quiz AVANT de poser applications.quiz_token (invariant: token émis => attempt existe)
			ApplicationQuizAttempt quizAttempt = createQuizAttemptForVerifiedApplication(application, quizToken, request.getUser());
			if (quizAttempt == null || quizAttempt.getId() == null) {
				log.severe("Quiz token NON émis pour l'application " + application.getId() + ": aucune tentative quiz créée (étape QUIZ absente)");
				application.setEmailVerified(true);
				application.setUpdatedAt(Utilities.getCurrentDate());
				application.setUpdatedBy(request.getUser());
				applicationsRepository.save(application);

				Status status = new Status();
				status.setCode(StatusCode.FUNC_REQUEST_FAIL);
				status.setMessage("Email vérifié, mais aucune étape quiz exploitable pour cette candidature.");
				response.setHttpCode(HttpStatus.OK.value());
				response.setStatus(status);
				response.setHasError(true);
				return response;
			}

			// Mettre à jour l'application: email vérifié
			application.setEmailVerified(true);
			application.setUpdatedAt(Utilities.getCurrentDate());
			application.setUpdatedBy(request.getUser());
			applicationsRepository.save(application);
			syncApplicationQuizSummaryFromAttempt(application, quizAttempt, request.getUser());
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
		initializeCandidateAnswers(application, null, userId);
	}

	private void initializeCandidateAnswers(Applications application, ApplicationQuizAttempt quizAttempt, Integer userId) {
		log.info("----begin initializeCandidateAnswers for application ID: " + application.getId()
				+ (quizAttempt != null && quizAttempt.getId() != null ? " and attempt ID: " + quizAttempt.getId() : "") + "-----");
		
		try {
			// 1. Récupérer la formVersion depuis l'application
			FormVersion formVersion = resolveQuizFormVersion(application, quizAttempt);
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
					List<CandidateAnswer> existingQuestionAnswers = findCandidateAnswersForQuestionContext(quizAttempt, questionId);
					if (existingQuestionAnswers == null || existingQuestionAnswers.isEmpty()) {
						CandidateAnswer candidateAnswer = buildCandidateAnswer(quizAttempt, question, null, userId);
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
					CandidateAnswer existing = findCandidateAnswerForAnswerContext(quizAttempt, answer.getId());
					
					if (existing == null) {
						// Créer un nouveau candidate_answer
						CandidateAnswer candidateAnswer = buildCandidateAnswer(quizAttempt, question, answer, userId);
						
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
			ApplicationQuizAttempt quizAttempt = resolveQuizAttempt(application, quizToken);
			Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, quizToken, true);
			if (accessError != null) {
				return accessError;
			}

			Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, quizAttempt, request.getUser(), locale);
			if (inactivityError != null) {
				return inactivityError;
			}
			
		log.info("=== QUIZ START DEBUG ===");
		log.info("Application ID: " + applicationId);
		log.info("Quiz attempt status BEFORE: " + (quizAttempt != null ? quizAttempt.getQuizStatus() : null));
		log.info("PENDING value: " + tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue());
		log.info("STARTED value: " + tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
		log.info("Attempt status equals PENDING? " + (quizAttempt != null && tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(quizAttempt.getQuizStatus())));
		
		// Vérifier si des candidate_answers existent déjà pour cette application
		List<CandidateAnswer> existingAnswers = findCandidateAnswersForQuiz(quizAttempt);
		boolean needsInitialization = (existingAnswers == null || existingAnswers.isEmpty());
		boolean quizResumable = isQuizResumable(application);
		
		log.info("Existing candidate_answers count: " + (existingAnswers != null ? existingAnswers.size() : 0));
		log.info("Needs initialization: " + needsInitialization);
		log.info("Quiz resumable: " + quizResumable);

		Response<ApplicationsDto> resumePolicyError = rejectRandomizedQuizResume(application, quizAttempt, !needsInitialization);
		if (resumePolicyError != null) {
			return resumePolicyError;
		}
		
		// Si le quiz est en statut PENDING, le mettre en STARTED (sur l'attempt uniquement)
		if (quizAttempt != null && tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(quizAttempt.getQuizStatus())) {
			log.info(">>> Updating status from PENDING to STARTED...");
			quizAttempt.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
			if (quizAttempt.getStartedAt() == null) {
				quizAttempt.setStartedAt(Utilities.getCurrentDate());
			}
			quizAttempt.setUpdatedAt(Utilities.getCurrentDate());
			quizAttempt.setUpdatedBy(request.getUser());
			quizAttempt = applicationQuizAttemptRepository.save(quizAttempt);
			syncApplicationQuizSummaryFromAttempt(application, quizAttempt, request.getUser());
		}
			ensureQuizStageReady(application, request.getUser(), locale);
			QuizTimingState timingState = resolveQuizTimingState(application, quizAttempt, request.getUser());
			if (timingState.expired) {
				completeQuizInternal(application, quizAttempt, request.getUser(), locale);
				return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, "Temps limite dépassé. Le quiz a été soumis automatiquement.");
			}
			touchQuizLastActivity(application, quizAttempt, request.getUser());
		log.info("========================");
		
		// Initialiser les candidate_answers si nécessaire (que le quiz soit PENDING ou STARTED)
		if (needsInitialization) {
			log.info("Initializing candidate_answers for application " + applicationId);
			initializeCandidateAnswers(application, quizAttempt, request.getUser());
		} else {
			log.info("Candidate_answers already initialized, skipping initialization");
		}

			List<CandidateAnswer> candidateAnswersForApplication = findCandidateAnswersForQuiz(quizAttempt);
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
			FormVersion formVersion = resolveQuizFormVersion(application, quizAttempt);
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
					questionData.put("freeTextResponsePlaceholder", question.getFreeTextResponsePlaceholder());

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
			if (quizAttempt != null && quizAttempt.getId() != null) {
				quizData.put("applicationQuizAttemptId", quizAttempt.getId());
				if (quizAttempt.getApplicationProgress() != null && quizAttempt.getApplicationProgress().getId() != null) {
					quizData.put("applicationProgressId", quizAttempt.getApplicationProgress().getId());
				}
			}
			quizData.put("campaignId", campaign.getId());
			quizData.put("campaignTitle", campaign.getCampaignTitle());
			quizData.put("isTimed", timingState.timed);
			quizData.put("resumable", quizResumable);
			if (totalTimeAllowed != null) {
				quizData.put("totalTimeAllowed", totalTimeAllowed);
			}
			quizData.put("timeElapsed", timingState.timeElapsed);
			quizData.put("remainingTime", timingState.remainingTime);
			quizData.put("quizStatus", resolveQuizStatus(application, quizAttempt));
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
		validateFormVersionMatchesCampaign(
				formVersion,
				sourceToken != null ? sourceToken.getCampaigns() : null,
				locale,
				"La version de formulaire selectionnee n'appartient pas a la campagne du source token");
	}

	private void validateFormVersionMatchesCampaign(FormVersion formVersion, Campaigns campaign, Locale locale) {
		validateFormVersionMatchesCampaign(
				formVersion,
				campaign,
				locale,
				"La version de formulaire selectionnee n'appartient pas a la campagne");
	}

	private void validateFormVersionMatchesCampaign(FormVersion formVersion, Campaigns campaign, Locale locale, String errorMessage) {
		if (formVersion == null || campaign == null || campaign.getId() == null) {
			return;
		}

		if (!Boolean.TRUE.equals(formVersion.getIsPublished())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La version de formulaire selectionnee n'est pas publiee.", locale));
		}

		Integer campaignId = campaign.getId();
		Integer formId = formVersion.getForm() != null ? formVersion.getForm().getId() : null;
		if (!hasActiveCampaignFormLink(campaignId, formId)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(errorMessage, locale));
		}
	}

	/**
	 * Trouve ou crée un token source public pour une campagne.
	 * Un seul token public est autorisé par campagne (is_public = true, nom = "Quiz App").
	 */
	private SourceToken findOrCreatePublicSourceToken(Campaigns campaign, Integer userId) {
		if (campaign == null || campaign.getId() == null) {
			return null;
		}

		// Chercher un token public existant pour cette campagne
		List<SourceToken> tokens = sourceTokenRepository.findByCampaignId(campaign.getId(), false);
		if (tokens != null) {
			for (SourceToken token : tokens) {
				if (Boolean.TRUE.equals(token.getIsPublic())) {
					return token;
				}
			}
		}

		// Créer un nouveau token public
		SourceToken publicToken = new SourceToken();
		publicToken.setTokenString(generateUniqueTokenString());
		publicToken.setSourceTokenName("Quiz App");
		publicToken.setCampaigns(campaign);
		publicToken.setIsPublic(true);
		publicToken.setIsDeleted(false);
		publicToken.setCreatedAt(Utilities.getCurrentDate());
		publicToken.setCreatedBy(userId);
		publicToken.setSearchString("Quiz App " + campaign.getCampaignTitle());

		return sourceTokenRepository.save(publicToken);
	}

	/**
	 * Génère une chaîne de token unique à 6 caractères.
	 */
	private String generateUniqueTokenString() {
		String token;
		do {
			token = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
		} while (sourceTokenRepository.findByTokenString(token.toLowerCase(java.util.Locale.ROOT), false) != null);
		return token;
	}

	private FormVersion selectFormVersionForCandidate(
			SourceToken sourceToken,
			Campaigns directCampaign,
			String candidateEmail,
			Integer applicationId,
			Map<Integer, Integer> pendingAssignedFormsByCampaign,
			Map<String, Set<Integer>> pendingCandidateFormHistory,
			Locale locale) {
		Campaigns campaign = requireCampaignForFormSelection(sourceToken, directCampaign, locale);
		List<FormVersion> publishedVersions = getPublishedFormVersionsForCampaign(campaign.getId());
		if (publishedVersions.isEmpty()) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Aucun formulaire publie trouve pour cette campagne", locale));
		}

		FormAssignmentStrategy strategy = FormAssignmentStrategy.fromValue(resolveCampaignFormAssignmentStrategy(campaign));
		FormAssignmentExhaustionPolicy exhaustionPolicy = FormAssignmentExhaustionPolicy.fromValue(resolveCampaignFormAssignmentExhaustionPolicy(campaign));

		switch (strategy) {
			case SOURCE_TOKEN:
				if (sourceToken == null) {
					throw new InvalidEntityException(functionalError.REQUEST_FAIL(
							"Cette campagne necessite un code transmis par le recruteur.", locale));
				}
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

	private Campaigns requireCampaignForFormSelection(SourceToken sourceToken, Campaigns directCampaign, Locale locale) {
		if (sourceToken != null && sourceToken.getCampaigns() != null && sourceToken.getCampaigns().getId() != null) {
			return sourceToken.getCampaigns();
		}

		if (directCampaign != null && directCampaign.getId() != null) {
			return directCampaign;
		}

			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Impossible de determiner la campagne pour attribuer un formulaire", locale));
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

	private Response<ApplicationsDto> rejectRandomizedQuizResume(Applications application, ApplicationQuizAttempt quizAttempt, boolean hasExistingAnswers) {
		if (application == null || !hasExistingAnswers || isQuizResumable(application)) {
			return null;
		}

		if (quizAttempt == null || !tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue().equals(quizAttempt.getQuizStatus())) {
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
			Campaigns directCampaign,
			String candidateEmail,
			FormVersion formVersion,
			Map<Integer, Integer> pendingAssignedFormsByCampaign,
			Map<String, Set<Integer>> pendingCandidateFormHistory) {
		if (formVersion == null) {
			return;
		}

		Integer campaignId = sourceToken != null && sourceToken.getCampaigns() != null
				? sourceToken.getCampaigns().getId()
				: directCampaign != null ? directCampaign.getId() : null;
		if (campaignId == null) {
			return;
		}

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
			ApplicationQuizAttempt quizAttempt = resolveQuizAttempt(application, quizToken);
			Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, quizToken, true);
			if (accessError != null) {
				return accessError;
			}

			Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, quizAttempt, request.getUser(), locale);
			if (inactivityError != null) {
				return inactivityError;
			}

			ensureQuizStageReady(application, request.getUser(), locale);
			QuizTimingState timingState = resolveQuizTimingState(application, quizAttempt, request.getUser());
			if (timingState.expired) {
				completeQuizInternal(application, quizAttempt, request.getUser(), locale);
				return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, "Temps limite dépassé. Le quiz a été soumis automatiquement.");
			}
			
			// 3. Récupérer toutes les candidate_answers pour cette application et cette question
			List<CandidateAnswer> candidateAnswers = findCandidateAnswersForQuestionContext(quizAttempt, questionId);
			if (quizAttempt != null && candidateAnswers.isEmpty()) {
				initializeCandidateAnswers(application, quizAttempt, request.getUser());
				candidateAnswers = findCandidateAnswersForQuestionContext(quizAttempt, questionId);
			}
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
					freeTextCandidateAnswer = buildCandidateAnswer(quizAttempt, question, null, request.getUser());
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
			
			// 6. Préparer la réponse
			touchQuizLastActivity(application, quizAttempt, request.getUser());
			resolveQuizTimingState(application, quizAttempt, request.getUser());
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			
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
			ApplicationQuizAttempt quizAttempt = resolveQuizAttempt(application, quizToken);
			Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, quizToken, true);
			if (accessError != null) {
				return accessError;
			}
			
			// 3. Calculer le score et le nombre total de questions avant de compléter le quiz
			FormVersion formVersion = resolveQuizFormVersion(application, quizAttempt);
			if (formVersion == null) {
				return buildErrorResponse(HttpStatus.NOT_FOUND, StatusCode.FUNC_DATA_NOT_EXIST, "Aucun formulaire associé à cette application");
			}

			Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, quizAttempt, request.getUser(), locale);
			if (inactivityError != null) {
				return inactivityError;
			}

			ensureQuizStageReady(application, request.getUser(), locale);
			QuizTimingState timingState = resolveQuizTimingState(application, quizAttempt, request.getUser());
			
			application = completeQuizInternal(application, quizAttempt, request.getUser(), locale);
			
			log.info("Quiz complété pour l'application " + applicationId + " - Score pondéré: " + (quizAttempt != null ? quizAttempt.getScore() : null) + " point(s), soit " + (quizAttempt != null ? quizAttempt.getScorePercent() : null) + "%");
			
			// 5. Préparer la réponse
			ApplicationsDto resultDto = new ApplicationsDto();
			resultDto.setId(applicationId);
			resultDto = getFullInfos(resultDto, 1, false, locale);
			
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
		Integer actorUserId = request != null ? request.getUser() : null;
		if (dto == null || dto.getId() == null) {
			return buildErrorResponse(HttpStatus.BAD_REQUEST, StatusCode.FUNC_FIELD_EMPTY, "ID de l'application manquant");
		}
		if (Utilities.isBlank(dto.getSearchString())) {
			return buildErrorResponse(HttpStatus.BAD_REQUEST, StatusCode.FUNC_FIELD_EMPTY, "Token de quiz manquant");
		}

		Applications application = applicationsRepository.findOne(dto.getId(), false);
		ApplicationQuizAttempt quizAttempt = resolveQuizAttempt(application, dto.getSearchString());
		Response<ApplicationsDto> accessError = validateQuizSessionAccess(application, dto.getSearchString(), true);
		if (accessError != null) {
			return accessError;
		}

		Response<ApplicationsDto> inactivityError = enforceQuizInactivityPolicy(application, quizAttempt, actorUserId, locale);
		if (inactivityError != null) {
			return inactivityError;
		}

		ensureQuizStageReady(application, actorUserId, locale);
		QuizTimingState timingState = resolveQuizTimingState(application, quizAttempt, actorUserId);
		if (timingState.expired) {
			completeQuizInternal(application, quizAttempt, actorUserId, locale);
			return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, "Temps limite dépassé. Le quiz a été soumis automatiquement.");
		}

		touchQuizLastActivity(application, quizAttempt, actorUserId);

		ApplicationsDto resultDto = new ApplicationsDto();
		resultDto.setId(application.getId());

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
		List<ApplicationQuizAttempt> startedAttempts = applicationQuizAttemptRepository.findByQuizStatusAndApplicationNotAbandoned(
				tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue(),
				false);
		if (startedAttempts == null || startedAttempts.isEmpty()) {
			return;
		}

		for (ApplicationQuizAttempt quizAttempt : startedAttempts) {
			try {
				Applications application = quizAttempt != null ? quizAttempt.getApplications() : null;
				markApplicationAbandonedIfQuizInactive(application, quizAttempt, SYSTEM_ACTOR_USER_ID, Locale.FRENCH);
			} catch (Exception exception) {
				log.warning("Politique d'abandon inactive ignorée pour l'application "
						+ (quizAttempt != null && quizAttempt.getApplications() != null ? quizAttempt.getApplications().getId() : null)
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
		return refreshQuizScoringState(application, null, actorUserId, locale);
	}

	public Applications refreshQuizScoringState(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId, Locale locale) {
		if (application == null) {
			return null;
		}

		QuizScoringSummary summary = evaluateQuiz(application, quizAttempt);
		application.setAggregatedQuizScore(summary.quizScore != null ? summary.quizScore.doubleValue() : null);
		application.setAggregatedQuizScorePercent(summary.quizScorePercent != null ? summary.quizScorePercent.doubleValue() : null);
		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(actorUserId);
		Applications savedApplication = applicationsRepository.save(application);
		if (quizAttempt != null && quizAttempt.getId() != null) {
			quizAttempt.setScore(summary.quizScore != null ? summary.quizScore.doubleValue() : null);
			quizAttempt.setTotalQuestions(summary.totalQuestions);
			quizAttempt.setScorePercent(summary.quizScorePercent != null ? summary.quizScorePercent.doubleValue() : null);
			quizAttempt.setManualCorrectionStatus(summary.manualCorrectionStatus);
			quizAttempt.setUpdatedAt(Utilities.getCurrentDate());
			quizAttempt.setUpdatedBy(actorUserId);
			ApplicationQuizAttempt savedAttempt = applicationQuizAttemptRepository.save(quizAttempt);
			syncApplicationQuizSummaryFromAttempt(savedApplication, savedAttempt, actorUserId);
		}
		syncQuizProgressAfterScoring(savedApplication, quizAttempt, actorUserId, locale);
		return applicationsRepository.findOne(savedApplication.getId(), false);
	}

	private QuizScoringSummary evaluateQuiz(Applications application) {
		return evaluateQuiz(application, null);
	}

	private QuizScoringSummary evaluateQuiz(Applications application, ApplicationQuizAttempt quizAttempt) {
		List<FormQuestions> activeFormQuestions = getActiveFormQuestions(application != null ? application.getFormVersion() : null);
		int totalQuestions = activeFormQuestions.size();
		int quizScore = 0;
		int totalPossibleScore = 0;
		boolean hasManualQuestion = false;
		boolean hasPendingManualCorrection = false;

		FormVersion resolvedFormVersion = resolveQuizFormVersion(application, quizAttempt);
		activeFormQuestions = getActiveFormQuestions(resolvedFormVersion);
		totalQuestions = activeFormQuestions.size();

		List<CandidateAnswer> candidateAnswers = findCandidateAnswersForQuiz(quizAttempt);
		Map<Integer, List<CandidateAnswer>> candidateAnswersByQuestion = groupCandidateAnswersByQuestion(candidateAnswers);

		for (FormQuestions formQuestion : activeFormQuestions) {
			Question question = formQuestion.getQuestion();
			if (question == null || question.getId() == null) {
				continue;
			}

			String questionType = StringUtils.trimToEmpty(question.getQuestionType());
			int questionMaxScore = Math.max(question.getScore() != null ? question.getScore() : 0, 0);
			totalPossibleScore += questionMaxScore;
			boolean manualCorrectionRequired = Boolean.TRUE.equals(question.getManualCorrectionRequired());
			List<CandidateAnswer> questionCandidateAnswers = candidateAnswersByQuestion.getOrDefault(question.getId(), Collections.emptyList());

			if (manualCorrectionRequired) {
				hasManualQuestion = true;
				CandidateAnswer manualCorrectionCarrier = resolveManualQuestionCarrier(questionType, questionCandidateAnswers);
				if (manualCorrectionCarrier != null && manualCorrectionCarrier.getManualCorrectionScore() != null) {
					quizScore += Math.min(Math.max(manualCorrectionCarrier.getManualCorrectionScore(), 0), questionMaxScore);
				} else {
					hasPendingManualCorrection = true;
				}
				continue;
			}

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
						quizScore += questionMaxScore;
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
					quizScore += questionMaxScore;
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
						quizScore += questionMaxScore;
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

		int quizScorePercent = totalPossibleScore > 0 ? (quizScore * 100) / totalPossibleScore : 0;
		return new QuizScoringSummary(quizScore, totalQuestions, totalPossibleScore, quizScorePercent, manualCorrectionStatus);
	}

	private CandidateAnswer resolveManualQuestionCarrier(String questionType, List<CandidateAnswer> questionCandidateAnswers) {
		if (questionCandidateAnswers == null || questionCandidateAnswers.isEmpty()) {
			return null;
		}

		boolean textQuestion = QuestionType.TEXT.getValue().equalsIgnoreCase(StringUtils.trimToEmpty(questionType));
		CandidateAnswer scoredCarrier = null;
		CandidateAnswer fallbackCarrier = null;

		for (CandidateAnswer candidateAnswer : questionCandidateAnswers) {
			if (candidateAnswer == null || Boolean.TRUE.equals(candidateAnswer.getIsDeleted())) {
				continue;
			}
			if (candidateAnswer.getManualCorrectionScore() != null
					&& (scoredCarrier == null || isPreferredManualQuestionCarrier(candidateAnswer, scoredCarrier, textQuestion))) {
				scoredCarrier = candidateAnswer;
			}
			if (fallbackCarrier == null || isPreferredManualQuestionCarrier(candidateAnswer, fallbackCarrier, textQuestion)) {
				fallbackCarrier = candidateAnswer;
			}
		}

		return scoredCarrier != null ? scoredCarrier : fallbackCarrier;
	}

	private boolean isPreferredManualQuestionCarrier(CandidateAnswer candidate, CandidateAnswer current, boolean textQuestion) {
		if (candidate == null) {
			return false;
		}
		if (current == null) {
			return true;
		}

		if (textQuestion) {
			if (candidate.getAnswer() == null && current.getAnswer() != null) {
				return true;
			}
			if (candidate.getAnswer() != null && current.getAnswer() == null) {
				return false;
			}
		}

		Integer candidateOrder = candidate.getAnswer() != null ? candidate.getAnswer().getAnswerOrder() : null;
		Integer currentOrder = current.getAnswer() != null ? current.getAnswer().getAnswerOrder() : null;
		if (candidateOrder != null && currentOrder != null && !candidateOrder.equals(currentOrder)) {
			return candidateOrder < currentOrder;
		}
		if (candidateOrder != null && currentOrder == null) {
			return true;
		}
		if (candidateOrder == null && currentOrder != null) {
			return false;
		}

		Integer candidateAnswerId = candidate.getAnswer() != null ? candidate.getAnswer().getId() : null;
		Integer currentAnswerId = current.getAnswer() != null ? current.getAnswer().getId() : null;
		if (candidateAnswerId != null && currentAnswerId != null && !candidateAnswerId.equals(currentAnswerId)) {
			return candidateAnswerId < currentAnswerId;
		}
		if (candidateAnswerId != null && currentAnswerId == null) {
			return true;
		}
		if (candidateAnswerId == null && currentAnswerId != null) {
			return false;
		}

		Integer candidateId = candidate.getId();
		Integer currentId = current.getId();
		if (candidateId != null && currentId != null && !candidateId.equals(currentId)) {
			return candidateId < currentId;
		}

		return false;
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

	private ApplicationQuizAttempt resolveQuizAttempt(Applications application, String quizToken) {
		if (application == null || application.getId() == null || StringUtils.isBlank(quizToken)) {
			return null;
		}

		return applicationQuizAttemptRepository.findByApplicationIdAndQuizToken(application.getId(), quizToken, false);
	}

	private ApplicationQuizAttempt resolveLatestQuizAttempt(Integer applicationId) {
		if (applicationId == null) {
			return null;
		}
		List<ApplicationQuizAttempt> quizAttempts = applicationQuizAttemptRepository.findByApplicationIdOrderByIdDesc(applicationId, false);
		if (quizAttempts == null || quizAttempts.isEmpty()) {
			return null;
		}
		return quizAttempts.get(0);
	}

	private FormVersion resolveQuizFormVersion(Applications application, ApplicationQuizAttempt quizAttempt) {
		if (quizAttempt != null && quizAttempt.getFormVersion() != null) {
			return quizAttempt.getFormVersion();
		}
		return application != null ? application.getFormVersion() : null;
	}

	private List<CandidateAnswer> findCandidateAnswersForQuizContext(ApplicationQuizAttempt quizAttempt) {
		if (quizAttempt == null || quizAttempt.getId() == null) {
			return Collections.emptyList();
		}

		List<CandidateAnswer> attemptAnswers = candidateAnswerRepository.findByApplicationQuizAttemptId(quizAttempt.getId(), false);
		return attemptAnswers != null ? attemptAnswers : Collections.emptyList();
	}

	private List<CandidateAnswer> findCandidateAnswersForQuestionContext(ApplicationQuizAttempt quizAttempt, Integer questionId) {
		if (quizAttempt == null || quizAttempt.getId() == null || questionId == null) {
			return Collections.emptyList();
		}

		List<CandidateAnswer> attemptAnswers = candidateAnswerRepository.findByApplicationQuizAttemptIdAndQuestionId(quizAttempt.getId(), questionId, false);
		return attemptAnswers != null ? attemptAnswers : Collections.emptyList();
	}

	private CandidateAnswer findCandidateAnswerForAnswerContext(ApplicationQuizAttempt quizAttempt, Integer answerId) {
		if (quizAttempt == null || quizAttempt.getId() == null || answerId == null) {
			return null;
		}

		return candidateAnswerRepository.findByApplicationQuizAttemptIdAndAnswerId(quizAttempt.getId(), answerId, false);
	}

	private CandidateAnswer buildCandidateAnswer(ApplicationQuizAttempt quizAttempt, Question question, Answer answer, Integer userId) {
		CandidateAnswer candidateAnswer = new CandidateAnswer();
		candidateAnswer.setApplicationQuizAttempt(quizAttempt);
		candidateAnswer.setQuestion(question);
		candidateAnswer.setAnswer(answer);
		candidateAnswer.setIsSelected(false);
		candidateAnswer.setCreatedAt(Utilities.getCurrentDate());
		candidateAnswer.setCreatedBy(userId);
		candidateAnswer.setIsDeleted(false);
		return candidateAnswer;
	}

	private List<CandidateAnswer> findCandidateAnswersForQuiz(ApplicationQuizAttempt quizAttempt) {
		return findCandidateAnswersForQuizContext(quizAttempt);
	}

	private String resolveQuizStatus(Applications application, ApplicationQuizAttempt quizAttempt) {
		if (quizAttempt != null && Utilities.notBlank(quizAttempt.getQuizStatus())) {
			return quizAttempt.getQuizStatus();
		}
		return null;
	}

	private Response<ApplicationsDto> validateQuizSessionAccess(Applications application, String quizToken, boolean rejectCompleted) {
		if (application == null) {
			return buildErrorResponse(HttpStatus.NOT_FOUND, StatusCode.FUNC_DATA_NOT_EXIST, "Application non trouvée");
		}

		ApplicationQuizAttempt quizAttempt = resolveQuizAttempt(application, quizToken);
		String expectedQuizToken = quizAttempt != null ? quizAttempt.getQuizToken() : null;

		if (!StringUtils.equals(quizToken, expectedQuizToken)) {
			return buildErrorResponse(HttpStatus.FORBIDDEN, StatusCode.FUNC_AUTH_FAIL, "Token de quiz invalide. Veuillez utiliser le lien reçu par email.");
		}

		if (!Boolean.TRUE.equals(application.getEmailVerified())) {
			return buildErrorResponse(HttpStatus.FORBIDDEN, StatusCode.FUNC_AUTH_FAIL, "Veuillez vérifier votre adresse email avant d'accéder au quiz.");
		}

		if (Boolean.TRUE.equals(application.getApplicationAbandoned())) {
			return buildErrorResponse(HttpStatus.FORBIDDEN, StatusCode.FUNC_AUTH_FAIL, "Cette candidature a été marquée comme abandonnée.");
		}

		if (resolveQuizFormVersion(application, quizAttempt) == null) {
			return buildErrorResponse(HttpStatus.NOT_FOUND, StatusCode.FUNC_DATA_NOT_EXIST, "Aucun formulaire associé à cette application");
		}

		if (rejectCompleted && tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(resolveQuizStatus(application, quizAttempt))) {
			return buildErrorResponse(HttpStatus.BAD_REQUEST, StatusCode.FUNC_DATA_EXIST, "Ce quiz a déjà été complété");
		}

		return null;
	}

	private Response<ApplicationsDto> enforceQuizInactivityPolicy(Applications application, Integer actorUserId, Locale locale) {
		return enforceQuizInactivityPolicy(application, null, actorUserId, locale);
	}

	private Response<ApplicationsDto> enforceQuizInactivityPolicy(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId, Locale locale) {
		if (markApplicationAbandonedIfQuizInactive(application, actorUserId, locale)) {
			return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, StatusCode.FUNC_REQUEST_FAIL, QUIZ_INACTIVITY_MESSAGE);
		}
		if (markApplicationAbandonedIfQuizInactive(application, quizAttempt, actorUserId, locale)) {
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

	private void applyQuizTimingSnapshot(Applications application, ApplicationQuizAttempt quizAttempt) {
		if (application == null || quizAttempt == null) {
			return;
		}

		Campaigns campaign = application.getSourceToken() != null ? application.getSourceToken().getCampaigns() : null;
		FormVersion formVersion = resolveQuizFormVersion(application, quizAttempt);
		List<FormQuestions> activeFormQuestions = getActiveFormQuestions(formVersion);
		Integer totalTimeAllowed = calculateTotalTimeAllowed(campaign, formVersion, activeFormQuestions);
		boolean timed = totalTimeAllowed != null;

		quizAttempt.setTimedSnapshot(timed);
		quizAttempt.setTotalTimeAllowedSnapshot(timed ? totalTimeAllowed : null);
	}

	private void ensureQuizTimingSnapshot(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId) {
		if (quizAttempt == null || quizAttempt.getId() == null) {
			return;
		}

		boolean missingTimedSnapshot = quizAttempt.getTimedSnapshot() == null;
		boolean missingTotalTimeSnapshot = Boolean.TRUE.equals(quizAttempt.getTimedSnapshot())
				&& quizAttempt.getTotalTimeAllowedSnapshot() == null;
		if (!missingTimedSnapshot && !missingTotalTimeSnapshot) {
			return;
		}

		applyQuizTimingSnapshot(application, quizAttempt);
		quizAttempt.setUpdatedAt(Utilities.getCurrentDate());
		quizAttempt.setUpdatedBy(actorUserId);
		ApplicationQuizAttempt savedAttempt = applicationQuizAttemptRepository.save(quizAttempt);
		syncApplicationQuizSummaryFromAttempt(application, savedAttempt, actorUserId);
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

	private ApplicationProgress resolveQuizProgress(Applications application, ApplicationQuizAttempt quizAttempt) {
		if (quizAttempt != null && quizAttempt.getApplicationProgress() != null) {
			return quizAttempt.getApplicationProgress();
		}
		return application != null && application.getId() != null
				? findProgressByStageType(application.getId(), StageType.QUIZ.getValue())
				: null;
	}

	private Date resolveQuizLastActivityReference(Applications application, ApplicationProgress quizProgress) {
		return resolveQuizLastActivityReference(application, null, quizProgress);
	}

	private Date resolveQuizLastActivityReference(Applications application, ApplicationQuizAttempt quizAttempt, ApplicationProgress quizProgress) {
		if (quizAttempt != null && quizAttempt.getLastActivityAt() != null) {
			return quizAttempt.getLastActivityAt();
		}
		if (quizAttempt != null && quizAttempt.getStartedAt() != null) {
			return quizAttempt.getStartedAt();
		}
		if (quizProgress != null && quizProgress.getStartedAt() != null) {
			return quizProgress.getStartedAt();
		}
		return application != null ? application.getUpdatedAt() : null;
	}

	private void touchQuizLastActivity(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId) {
		if (quizAttempt == null || quizAttempt.getId() == null) {
			return;
		}

		Date now = Utilities.getCurrentDate();
		if (quizAttempt.getStartedAt() == null) {
			quizAttempt.setStartedAt(now);
		}
		if (tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue().equals(quizAttempt.getQuizStatus())) {
			quizAttempt.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue());
		}
		quizAttempt.setLastActivityAt(now);
		quizAttempt.setUpdatedAt(now);
		quizAttempt.setUpdatedBy(actorUserId);
		ApplicationQuizAttempt savedAttempt = applicationQuizAttemptRepository.save(quizAttempt);
		syncApplicationQuizSummaryFromAttempt(application, savedAttempt, actorUserId);
	}

	private boolean markApplicationAbandonedIfQuizInactive(Applications application, Integer actorUserId, Locale locale) {
		return markApplicationAbandonedIfQuizInactive(application, null, actorUserId, locale);
	}

	private boolean markApplicationAbandonedIfQuizInactive(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId, Locale locale) {
		if (application == null || application.getId() == null) {
			return false;
		}
		if (Boolean.TRUE.equals(application.getApplicationAbandoned())) {
			return false;
		}
		if (!tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue().equals(resolveQuizStatus(application, quizAttempt))) {
			return false;
		}

		Integer inactivityTimeoutMinutes = resolveQuizInactivityTimeoutMinutes(application);
		if (inactivityTimeoutMinutes == null || inactivityTimeoutMinutes <= 0) {
			return false;
		}

		ApplicationProgress quizProgress = resolveQuizProgress(application, quizAttempt);
		Date lastActivityReference = resolveQuizLastActivityReference(application, quizAttempt, quizProgress);
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
		markQuizProgressAsAbandoned(application, quizAttempt, quizProgress, actorUserId, locale, now);
		return true;
	}

	private void markQuizProgressAsAbandoned(
			Applications application,
			ApplicationQuizAttempt quizAttempt,
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
			if (quizProgress.getScore() == null && quizAttempt != null && quizAttempt.getScorePercent() != null) {
				quizProgress.setScore(quizAttempt.getScorePercent().doubleValue());
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
		return applicationProgressBusiness.resolveProgressByStageType(applicationId, stageType);
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

	private Integer syncQuizTimeElapsed(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId) {
		if (quizAttempt != null && quizAttempt.getId() != null) {
			int storedElapsed = quizAttempt.getTimeElapsed() != null ? quizAttempt.getTimeElapsed() : 0;
			ApplicationProgress quizProgress = resolveQuizProgress(application, quizAttempt);
			Date startedAt = quizAttempt.getStartedAt() != null
					? quizAttempt.getStartedAt()
					: (quizProgress != null ? quizProgress.getStartedAt() : null);
			if (startedAt == null) {
				if (quizAttempt.getTimeElapsed() == null) {
					quizAttempt.setTimeElapsed(storedElapsed);
					quizAttempt.setUpdatedAt(Utilities.getCurrentDate());
					quizAttempt.setUpdatedBy(actorUserId);
					ApplicationQuizAttempt savedAttempt = applicationQuizAttemptRepository.save(quizAttempt);
					syncApplicationQuizSummaryFromAttempt(application, savedAttempt, actorUserId);
				}
				return storedElapsed;
			}

			Date endedAt = quizAttempt.getCompletedAt() != null ? quizAttempt.getCompletedAt() : Utilities.getCurrentDate();
			int computedElapsed = Math.max(storedElapsed, computeElapsedSeconds(startedAt, endedAt));
			if (quizAttempt.getTimeElapsed() == null || computedElapsed != storedElapsed) {
				quizAttempt.setTimeElapsed(computedElapsed);
				quizAttempt.setUpdatedAt(Utilities.getCurrentDate());
				quizAttempt.setUpdatedBy(actorUserId);
				ApplicationQuizAttempt savedAttempt = applicationQuizAttemptRepository.save(quizAttempt);
				syncApplicationQuizSummaryFromAttempt(application, savedAttempt, actorUserId);
			}
			return computedElapsed;
		}

		return 0;
	}

	private QuizTimingState resolveQuizTimingState(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId) {
		if (quizAttempt == null || quizAttempt.getId() == null) {
			return new QuizTimingState(false, null, 0, null, false);
		}

		ensureQuizTimingSnapshot(application, quizAttempt, actorUserId);
		Integer totalTimeAllowed = Boolean.TRUE.equals(quizAttempt.getTimedSnapshot())
				? quizAttempt.getTotalTimeAllowedSnapshot()
				: null;
		Integer timeElapsed = syncQuizTimeElapsed(application, quizAttempt, actorUserId);
		if (totalTimeAllowed == null) {
			return new QuizTimingState(false, null, timeElapsed, null, false);
		}

		int clampedElapsed = Math.min(timeElapsed, totalTimeAllowed);
		if (!Integer.valueOf(clampedElapsed).equals(quizAttempt.getTimeElapsed())) {
			quizAttempt.setTimeElapsed(clampedElapsed);
			quizAttempt.setUpdatedAt(Utilities.getCurrentDate());
			quizAttempt.setUpdatedBy(actorUserId);
			ApplicationQuizAttempt savedAttempt = applicationQuizAttemptRepository.save(quizAttempt);
			syncApplicationQuizSummaryFromAttempt(application, savedAttempt, actorUserId);
		}
		return new QuizTimingState(true, totalTimeAllowed, clampedElapsed, Math.max(0, totalTimeAllowed - clampedElapsed), clampedElapsed >= totalTimeAllowed);
	}

	private Applications completeQuizInternal(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId, Locale locale) {
		if (application == null) {
			return null;
		}

		Date now = Utilities.getCurrentDate();
		if (quizAttempt != null && quizAttempt.getId() != null) {
			if (quizAttempt.getStartedAt() == null) {
				quizAttempt.setStartedAt(now);
			}
			quizAttempt.setLastActivityAt(now);
			quizAttempt.setCompletedAt(now);
			quizAttempt.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
			quizAttempt.setUpdatedAt(now);
			quizAttempt.setUpdatedBy(actorUserId);
			quizAttempt = applicationQuizAttemptRepository.save(quizAttempt);
			syncApplicationQuizSummaryFromAttempt(application, quizAttempt, actorUserId);
		}

		application.setUpdatedAt(now);
		application.setUpdatedBy(actorUserId);
		Applications updatedApplication = refreshQuizScoringState(application, quizAttempt, actorUserId, locale != null ? locale : Locale.FRENCH);
		lockFormVersionIfNeeded(resolveQuizFormVersion(updatedApplication != null ? updatedApplication : application, quizAttempt), actorUserId);
		return updatedApplication != null ? updatedApplication : applicationsRepository.findOne(application.getId(), false);
	}

	private void syncApplicationQuizSummaryFromAttempt(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId) {
		if (application == null || quizAttempt == null) {
			return;
		}

		application.setAggregatedQuizScore(quizAttempt.getScore());
		application.setAggregatedQuizScorePercent(quizAttempt.getScorePercent());
		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(actorUserId);
		applicationsRepository.save(application);
		if (application.getId() != null) {
			applicationProgressBusiness.syncApplicationStatus(application.getId());
		}
	}

	private void syncApplicationInterviewSummary(Applications application, Integer actorUserId) {
		if (application == null || application.getId() == null) {
			return;
		}

		Interviews currentInterview = selectCurrentInterview(interviewsRepository.findByApplicationId(application.getId(), false));
		if (currentInterview == null) {
			application.setInterviewDate(null);
			application.setInterviewStatus(null);
			application.setCurrentInterviewEvaluationScore(null);
			application.setCurrentInterviewEvaluationNumber(null);
			application.setCurrentInterviewEvaluationPercentage(null);
		} else {
			application.setInterviewDate(currentInterview.getInterviewDate());
			application.setInterviewStatus(currentInterview.getInterviewStatus());
			application.setCurrentInterviewEvaluationScore(currentInterview.getEvaluationScore());
			application.setCurrentInterviewEvaluationNumber(currentInterview.getEvaluationNumber());
			application.setCurrentInterviewEvaluationPercentage(currentInterview.getEvaluationPercentage());
		}

		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(actorUserId != null ? actorUserId : 0);
		applicationsRepository.save(application);
	}

	private Interviews selectCurrentInterview(List<Interviews> interviews) {
		if (interviews == null || interviews.isEmpty()) {
			return null;
		}

		return interviews.stream()
				.filter(Objects::nonNull)
				.sorted((left, right) -> {
					int priorityComparison = Integer.compare(getInterviewSummaryPriority(left.getInterviewStatus()), getInterviewSummaryPriority(right.getInterviewStatus()));
					if (priorityComparison != 0) {
						return priorityComparison;
					}

					long rightDate = right.getInterviewDate() != null ? right.getInterviewDate().getTime() : 0L;
					long leftDate = left.getInterviewDate() != null ? left.getInterviewDate().getTime() : 0L;
					if (leftDate != rightDate) {
						return Long.compare(rightDate, leftDate);
					}

					return Integer.compare(
						right.getId() != null ? right.getId() : 0,
						left.getId() != null ? left.getId() : 0);
				})
				.findFirst()
				.orElse(null);
	}

	private int getInterviewSummaryPriority(String interviewStatus) {
		if (StringUtils.isBlank(interviewStatus)) {
			return 99;
		}

		switch (interviewStatus.trim().toUpperCase(Locale.ROOT)) {
			case "STARTED":
				return 0;
			case "SCHEDULED":
				return 1;
			case "POSTPONED":
				return 2;
			case "PENDING":
				return 3;
			case "OVER":
				return 4;
			case "PASSED":
				return 5;
			case "FAILED":
				return 6;
			case "ARCHIVED":
				return 7;
			default:
				return 99;
		}
	}

	private ApplicationQuizAttempt createQuizAttemptForVerifiedApplication(Applications application, String quizToken, Integer actorUserId) {
		if (application == null || application.getId() == null || StringUtils.isBlank(quizToken)) {
			return null;
		}

		ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
		if (quizProgress == null || quizProgress.getId() == null) {
			log.warning("Impossible de créer une tentative quiz explicite pour l'application " + application.getId()
					+ ": aucun application_progress QUIZ trouvé");
			return null;
		}

		Date now = Utilities.getCurrentDate();
		ApplicationQuizAttempt quizAttempt = new ApplicationQuizAttempt();
		quizAttempt.setApplications(application);
		quizAttempt.setApplicationProgress(quizProgress);
		quizAttempt.setFormVersion(application.getFormVersion());
		quizAttempt.setQuizToken(quizToken);
		quizAttempt.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.PENDING.getValue());
		quizAttempt.setScreeningMode("NONE");
		quizAttempt.setManualCorrectionStatus(ManualCorrectionStatus.NOT_REQUIRED.getValue());
		quizAttempt.setTimeElapsed(0);
		quizAttempt.setCreatedAt(now);
		quizAttempt.setCreatedBy(actorUserId);
		quizAttempt.setUpdatedAt(now);
		quizAttempt.setUpdatedBy(actorUserId);
		quizAttempt.setIsDeleted(false);
		applyQuizTimingSnapshot(application, quizAttempt);
		return applicationQuizAttemptRepository.save(quizAttempt);
	}

	private void syncQuizProgressAfterScoring(Applications application, ApplicationQuizAttempt quizAttempt, Integer actorUserId, Locale locale) {
		if (application == null || application.getId() == null) {
			return;
		}

		ApplicationQuizAttempt scoringAttempt = quizAttempt != null ? quizAttempt : resolveLatestQuizAttempt(application.getId());
		if (scoringAttempt == null) {
			return;
		}

		try {
			if (tech.synelia.quizapp.utils.enums.QuizStatus.STARTED.getValue().equals(scoringAttempt.getQuizStatus())
					|| tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(scoringAttempt.getQuizStatus())) {
				ensurePreviousCandidatureStagePassed(application, actorUserId, locale);
			}

			if (scoringAttempt.getScorePercent() != null) {
				applicationProgressBusiness.updateStageScore(
						application.getId(),
						StageType.QUIZ.getValue(),
						scoringAttempt.getScorePercent().doubleValue(),
						actorUserId);
			}

			if (!tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue().equals(scoringAttempt.getQuizStatus())) {
				return;
			}

			if (ManualCorrectionStatus.PENDING.getValue().equals(scoringAttempt.getManualCorrectionStatus())) {
				return;
			}

			ApplicationProgress quizProgress = findProgressByStageType(application.getId(), StageType.QUIZ.getValue());
			if (quizProgress == null || quizProgress.getPipelineStage() == null || isResolvedProgressStatus(quizProgress.getProgressStatus())) {
				return;
			}

			double quizScorePercent = scoringAttempt.getScorePercent() != null ? scoringAttempt.getScorePercent().doubleValue() : 0.0d;
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

	public Response<ApplicationsDto> custom(Request<ApplicationsDto> request, Locale locale) throws Exception {
		log.info("----begin custom ApplicationsDto-----");
		ApplicationsDto dto = request.getData();
		if (dto == null && request.getDatas() != null && !request.getDatas().isEmpty()) {
			dto = request.getDatas().get(0);
		}
		if (dto == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("applications custom payload", locale));
		}

		String action = StringUtils.trimToEmpty(dto.getAction());
		if (StringUtils.isBlank(action)) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("action", locale));
		}

		Response<ApplicationsDto> response;
		switch (action.trim().toUpperCase(Locale.ROOT)) {
			case "CREATE_QUIZ_ATTEMPT":
				response = createAdditionalQuizAttempt(dto, request.getUser(), locale);
				break;
			default:
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Action custom applications non supportee: " + action, locale));
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom ApplicationsDto-----");
		return response;
	}

	private Response<ApplicationsDto> createAdditionalQuizAttempt(ApplicationsDto dto, Integer actorUserId, Locale locale) throws Exception {
		if (dto.getId() == null || dto.getId() <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}
		if (actorUserId == null || actorUserId <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}

		Applications application = applicationsRepository.findOne(dto.getId(), false);
		if (application == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications id -> " + dto.getId(), locale));
		}
		if (!Boolean.TRUE.equals(application.getEmailVerified())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"L'email doit etre verifie avant de creer une nouvelle tentative de quiz.", locale));
		}

		String quizToken = UUID.randomUUID().toString().replace("-", "");

		ApplicationQuizAttempt quizAttempt = createQuizAttemptForVerifiedApplication(application, quizToken, actorUserId);
		if (quizAttempt == null || quizAttempt.getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Impossible de creer une tentative quiz: aucune etape QUIZ exploitable n'a ete trouvee pour cette candidature.", locale));
		}
		syncApplicationQuizSummaryFromAttempt(application, quizAttempt, actorUserId);

		Applications refreshedApplication = applicationsRepository.findOne(application.getId(), false);
		Applications source = refreshedApplication != null ? refreshedApplication : application;
		ApplicationsDto resultDto = ApplicationsTransformer.INSTANCE.toDto(source);
		resultDto.setSearchString(quizToken);
		resultDto.setTrackingCode(ensureCandidateTrackingCode(source, actorUserId));
		resultDto = getFullInfos(resultDto, 1, false, locale);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage("Nouvelle tentative quiz creee avec succes");

		Response<ApplicationsDto> response = new Response<ApplicationsDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setStatus(status);
		response.setItems(Arrays.asList(resultDto));
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
		appData.put("trackedStatus", resolveTrackedApplicationStatus(application));
		ApplicationQuizAttempt trackedQuizAttempt = resolveLatestQuizAttempt(application.getId());
		appData.put("quizStatus", trackedQuizAttempt != null ? trackedQuizAttempt.getQuizStatus() : null);
		appData.put("applicationAbandoned", Boolean.TRUE.equals(application.getApplicationAbandoned()));
		appData.put("publicActionsLocked", isTrackedPublicActionsLocked(application));
		appData.put("publicLockReason", resolveTrackedPublicLockReason(application));
		appData.put("canWithdraw", canWithdrawTrackedApplication(application));
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
		result.put("quiz", buildTrackedQuiz(application));
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

		String finalDecisionType = normalizeStatus(application.getCurrentFinalDecisionType());
		if ("FINAL_ACCEPTED".equals(finalDecisionType)) {
			return "ACCEPTED";
		}
		if ("FINAL_REJECTED".equals(finalDecisionType)) {
			return "REJECTED";
		}

		String preselectionDecisionType = normalizeStatus(application.getCurrentPreselectionDecisionType());
		if ("PRE_SCREEN_REJECTED".equals(preselectionDecisionType)) {
			return "REJECTED";
		}

		String progressStatus = normalizeStatus(application.getCurrentPipelineProgressStatus());
		if (StringUtils.isBlank(progressStatus) || "PENDING".equals(progressStatus)) {
			return "NEW";
		}

		return "IN_PROGRESS";
	}

	private String normalizeStatus(String status) {
		String normalized = StringUtils.upperCase(StringUtils.trimToEmpty(status));
		if (StringUtils.endsWith(normalized, "_ARCHIVED")) {
			normalized = StringUtils.removeEnd(normalized, "_ARCHIVED");
		}
		return normalized;
	}

	@Transactional
	public Map<String, Object> withdrawTrackedApplication(String trackingCode, String email, Locale locale) throws ParseException {
		log.info("----begin withdrawTrackedApplication-----");
		Map<String, Object> result = new HashMap<>();

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
		if (isTrackedPublicActionsLocked(application)) {
			result.put("hasError", true);
			result.put("message", resolveTrackedPublicLockReason(application));
			return result;
		}
		if (!canWithdrawTrackedApplication(application)) {
			result.put("hasError", true);
			result.put("message", "Cette candidature ne peut plus être retirée depuis l'espace public.");
			return result;
		}

		Date now = Utilities.getCurrentDate();
		application.setApplicationAbandoned(true);
		application.setUpdatedAt(now);
		application.setUpdatedBy(SYSTEM_ACTOR_USER_ID);
		applicationsRepository.save(application);

		try {
			notifyRecruitersOfTrackedApplicationWithdrawal(application);
		} catch (Exception e) {
			log.log(Level.WARNING,
					"Erreur lors de la notification interne de retrait candidature pour application {0}: {1}",
					new Object[] { application.getId(), e.getMessage() });
		}

		result = trackApplication(trackingCode, email, locale);
		result.put("message", "Votre candidature a bien été retirée.");
		log.info("----end withdrawTrackedApplication-----");
		return result;
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
		if (isTrackedPublicActionsLocked(application)) {
			result.put("hasError", true);
			result.put("message", resolveTrackedPublicLockReason(application));
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
		if (isTrackedPublicActionsLocked(application)) {
			result.put("hasError", true);
			result.put("message", resolveTrackedPublicLockReason(application));
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
		if (!"PENDING".equals(resolveCandidateInterviewResponseState(candidateInterview))) {
			result.put("hasError", true);
			result.put("message", "Une réponse a déjà été enregistrée pour cet entretien.");
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
				candidateInterview.setCandidateResponseStatus("ACCEPTED");
				candidateInterview.setRespondedAt(now);
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
				candidateInterview.setCandidateResponseStatus("DECLINED");
				candidateInterview.setRespondedAt(now);
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
				candidateInterview.setCandidateResponseStatus("RESCHEDULE_REQUESTED");
				candidateInterview.setRespondedAt(now);
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
		syncApplicationInterviewSummary(application, SYSTEM_ACTOR_USER_ID);

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

	private boolean isTrackedPublicActionsLocked(Applications application) {
		return application != null && Boolean.TRUE.equals(application.getApplicationAbandoned());
	}

	private String resolveTrackedPublicLockReason(Applications application) {
		return isTrackedPublicActionsLocked(application) ? TRACKED_APPLICATION_WITHDRAWN_MESSAGE : null;
	}

	private boolean canWithdrawTrackedApplication(Applications application) {
		if (application == null || isTrackedPublicActionsLocked(application)) {
			return false;
		}

		String trackedStatus = resolveTrackedApplicationStatus(application);
		return "NEW".equals(trackedStatus) || "IN_PROGRESS".equals(trackedStatus);
	}

	private Map<String, Object> buildTrackedQuiz(Applications application) {
		if (application == null || application.getId() == null) {
			return null;
		}

		List<ApplicationQuizAttempt> quizAttempts = applicationQuizAttemptRepository.findByApplicationIdOrderByIdDesc(application.getId(), false);
		ApplicationQuizAttempt selectedAttempt = selectTrackedQuizAttempt(quizAttempts);
		if (selectedAttempt == null) {
			return null;
		}

		ApplicationProgress quizProgress = resolveQuizProgress(application, selectedAttempt);
		PipelineStage pipelineStage = quizProgress != null ? quizProgress.getPipelineStage() : null;
		String quizToken = selectedAttempt.getQuizToken();
		String quizStatus = resolveQuizStatus(application, selectedAttempt);

		Map<String, Object> quizData = new HashMap<>();
		quizData.put("applicationId", application.getId());
		quizData.put("applicationQuizAttemptId", selectedAttempt != null ? selectedAttempt.getId() : null);
		quizData.put("applicationProgressId", quizProgress != null ? quizProgress.getId() : null);
		quizData.put("pipelineStageId", pipelineStage != null ? pipelineStage.getId() : null);
		quizData.put("pipelineStageType", pipelineStage != null ? pipelineStage.getStageType() : null);
		quizData.put("pipelineStageLabel", pipelineStage != null ? pipelineStage.getStageLabel() : null);
		quizData.put("pipelineStageOrder", pipelineStage != null ? pipelineStage.getStageOrder() : null);
		quizData.put("quizToken", quizToken);
		quizData.put("quizStatus", quizStatus);
		quizData.put("startedAt", selectedAttempt != null ? selectedAttempt.getStartedAt() : null);
		quizData.put("completedAt", selectedAttempt != null ? selectedAttempt.getCompletedAt() : null);
		quizData.put("lastActivityAt", selectedAttempt.getLastActivityAt());
		quizData.put("canResume", canResumeTrackedQuiz(application, quizToken, quizStatus));
		return quizData;
	}

	private ApplicationQuizAttempt selectTrackedQuizAttempt(List<ApplicationQuizAttempt> quizAttempts) {
		if (quizAttempts == null || quizAttempts.isEmpty()) {
			return null;
		}

		ApplicationQuizAttempt latestAttempt = null;
		for (ApplicationQuizAttempt quizAttempt : quizAttempts) {
			if (quizAttempt == null) {
				continue;
			}
			if (latestAttempt == null) {
				latestAttempt = quizAttempt;
			}
			if (isTrackedQuizResumableStatus(quizAttempt.getQuizStatus())) {
				return quizAttempt;
			}
		}

		return latestAttempt;
	}

	private boolean canResumeTrackedQuiz(Applications application, String quizToken, String quizStatus) {
		if (application == null || Boolean.TRUE.equals(application.getApplicationAbandoned())) {
			return false;
		}
		if (StringUtils.isBlank(quizToken)) {
			return false;
		}
		return isTrackedQuizResumableStatus(quizStatus);
	}

	private boolean isTrackedQuizResumableStatus(String quizStatus) {
		String normalizedStatus = StringUtils.upperCase(StringUtils.trimToEmpty(quizStatus), Locale.ROOT);
		return "PENDING".equals(normalizedStatus) || "STARTED".equals(normalizedStatus);
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

		List<CandidateInterview> sortedLinks = new ArrayList<CandidateInterview>(links);
		sortedLinks.sort(Comparator.comparing(CandidateInterview::getInterviewStart, Comparator.nullsLast(Date::compareTo)));
		for (CandidateInterview link : sortedLinks) {
			Interviews interview = link.getInterviews() != null && link.getInterviews().getId() != null
					? interviewsRepository.findOne(link.getInterviews().getId(), false)
					: null;
			if (interview == null) {
				continue;
			}
			interviews.add(buildTrackedInterview(link, interview));
		}
		interviews.sort((left, right) -> {
			int stageOrderComparison = Integer.compare(resolveTrackedInterviewStageOrder(left), resolveTrackedInterviewStageOrder(right));
			if (stageOrderComparison != 0) {
				return stageOrderComparison;
			}

			Date leftStart = resolveTrackedInterviewStart(left);
			Date rightStart = resolveTrackedInterviewStart(right);
			if (leftStart != null || rightStart != null) {
				if (leftStart == null) {
					return 1;
				}
				if (rightStart == null) {
					return -1;
				}
				int startComparison = leftStart.compareTo(rightStart);
				if (startComparison != 0) {
					return startComparison;
				}
			}

			return Integer.compare(resolveTrackedInterviewId(left), resolveTrackedInterviewId(right));
		});
		return interviews;
	}

	private Map<String, Object> buildTrackedInterview(CandidateInterview candidateInterview, Interviews interview) {
		Map<String, Object> interviewData = new HashMap<>();
		ApplicationProgress interviewProgress = interview != null ? interview.getApplicationProgress() : null;
		PipelineStage pipelineStage = interviewProgress != null ? interviewProgress.getPipelineStage() : null;
		String responseState = resolveCandidateInterviewResponseState(candidateInterview);
		boolean publicActionsLocked = candidateInterview.getApplications() != null && isTrackedPublicActionsLocked(candidateInterview.getApplications());
		interviewData.put("id", candidateInterview.getId());
		interviewData.put("candidateInterviewId", candidateInterview.getId());
		interviewData.put("interviewId", interview.getId());
		interviewData.put("applicationProgressId", interviewProgress != null ? interviewProgress.getId() : null);
		interviewData.put("pipelineStageId", pipelineStage != null ? pipelineStage.getId() : null);
		interviewData.put("pipelineStageType", pipelineStage != null ? pipelineStage.getStageType() : null);
		interviewData.put("pipelineStageLabel", pipelineStage != null ? pipelineStage.getStageLabel() : null);
		interviewData.put("pipelineStageOrder", pipelineStage != null ? pipelineStage.getStageOrder() : null);
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
		interviewData.put("respondedAt", candidateInterview.getRespondedAt());
		interviewData.put("responseState", responseState);
		interviewData.put("canRespond", !publicActionsLocked && canRespondToTrackedInterview(responseState, interview));
		return interviewData;
	}

	private int resolveTrackedInterviewStageOrder(Map<String, Object> interviewData) {
		if (interviewData == null) {
			return Integer.MAX_VALUE;
		}

		Object stageOrder = interviewData.get("pipelineStageOrder");
		return stageOrder instanceof Number ? ((Number) stageOrder).intValue() : Integer.MAX_VALUE;
	}

	private Date resolveTrackedInterviewStart(Map<String, Object> interviewData) {
		if (interviewData == null) {
			return null;
		}

		Object interviewStart = interviewData.get("interviewStart");
		return interviewStart instanceof Date ? (Date) interviewStart : null;
	}

	private int resolveTrackedInterviewId(Map<String, Object> interviewData) {
		if (interviewData == null) {
			return Integer.MAX_VALUE;
		}

		Object interviewId = interviewData.get("id");
		return interviewId instanceof Number ? ((Number) interviewId).intValue() : Integer.MAX_VALUE;
	}

	private String resolveCandidateInterviewResponseState(CandidateInterview candidateInterview) {
		if (candidateInterview == null) {
			return "PENDING";
		}

		String persistedResponseState = StringUtils.upperCase(StringUtils.trimToNull(candidateInterview.getCandidateResponseStatus()), Locale.ROOT);
		if (persistedResponseState != null) {
			switch (persistedResponseState) {
				case "PENDING":
				case "ACCEPTED":
				case "DECLINED":
				case "RESCHEDULE_REQUESTED":
					return persistedResponseState;
				case "REQUEST_RESCHEDULE":
					return "RESCHEDULE_REQUESTED";
				default:
					break;
			}
		}
		if (candidateInterview.getAlternativeDateRequested() != null) {
			return "RESCHEDULE_REQUESTED";
		}
		if (StringUtils.isNotBlank(candidateInterview.getDeclineReason())) {
			return "DECLINED";
		}
		return "PENDING";
	}

	private boolean canRespondToTrackedInterview(String responseState, Interviews interview) {
		if (interview == null) {
			return false;
		}
		if ("OVER".equalsIgnoreCase(interview.getInterviewStatus()) || "ARCHIVED".equalsIgnoreCase(interview.getInterviewStatus())) {
			return false;
		}
		return "PENDING".equalsIgnoreCase(StringUtils.defaultString(responseState, "PENDING"));
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

	private void notifyRecruitersOfTrackedApplicationWithdrawal(Applications application) {
		Campaigns campaign = resolveCampaignForApplicationNotification(application);
		if (campaign == null || campaign.getId() == null) {
			return;
		}

		Map<Integer, User> recipients = resolveCampaignNotificationRecipients(campaign, NEW_APPLICATION_NOTIFICATION_PERMISSION_KEYS);
		if (recipients.isEmpty()) {
			return;
		}

		String notifLink = "/dashboard/campaigns/" + campaign.getId();
		for (User recipient : recipients.values()) {
			if (recipient == null || recipient.getId() == null) {
				continue;
			}
			createInternalNotification(
					recipient,
					"APPLICATION_WITHDRAWN",
					null,
					notifLink,
					SYSTEM_ACTOR_USER_ID,
					"applications",
					application.getId());
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
