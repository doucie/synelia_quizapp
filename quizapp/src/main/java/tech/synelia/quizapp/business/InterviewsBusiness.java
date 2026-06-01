                                                            														
/*
 * Java business for entity table interviews 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
import org.thymeleaf.context.Context;

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
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.enums.EmailActionType;
import tech.synelia.quizapp.utils.enums.InterviewStatus;
import tech.synelia.quizapp.utils.enums.InterviewType;
import tech.synelia.quizapp.business.MailLogService.MailLogContext;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "interviews"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class InterviewsBusiness implements IBasicBusiness<Request<InterviewsDto>, Response<InterviewsDto>> {

	private static final String INTERVIEW_STATUS_ALLOWED_VALUES = String.join("/",
			Arrays.stream(InterviewStatus.values()).map(InterviewStatus::getValue).toArray(String[]::new));
	private static final String INTERVIEW_TYPE_ALLOWED_VALUES = String.join("/",
			Arrays.stream(InterviewType.values()).map(InterviewType::getValue).toArray(String[]::new));

	private Response<InterviewsDto> response;
	@Autowired
	private InterviewsRepository interviewsRepository;
	@Autowired
	private CandidateInterviewRepository candidateInterviewRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private EvaluationsRepository evaluationsRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private NotificationsRepository notificationsRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private EntityPermissionRepository entityPermissionRepository;
	@Autowired
	private PipelineStageRepository pipelineStageRepository;
	@Autowired
	private ApplicationProgressRepository applicationProgressRepository;
	@Autowired
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Autowired
	private AuditEventService auditEventService;
	@Autowired
	private HostingUtils hostingUtils;
	@Autowired
	private ParamsUtils paramsUtils;
	@Autowired
	private EmailTemplateBusiness emailTemplateBusiness;
	@Autowired
	private PlatformReadinessService platformReadinessService;
	@Autowired
	private PermissionService permissionService;
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
	private static final int SYSTEM_ACTOR_USER_ID = 0;
	private static final Set<String> EVALUATION_COMPLETED_NOTIFICATION_PERMISSION_KEYS = Collections.unmodifiableSet(
			new HashSet<String>(Arrays.asList("ADMIN", "CREATOR", "FOLLOW", "ADVANCE_PIPELINE")));

	public InterviewsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> create(Request<InterviewsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews>        items    = new ArrayList<Interviews>();
		List<Boolean> sendInvitationRequests = new ArrayList<Boolean>();
		List<Boolean> resetCandidateResponseRequests = new ArrayList<Boolean>();
			
		for (InterviewsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("interviewDate", dto.getInterviewDate());
			fieldsToVerify.put("interviewType", dto.getInterviewType());
			fieldsToVerify.put("campaignId", dto.getCampaignId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			String normalizedInterviewStatus = normalizeInterviewStatus(dto.getInterviewStatus(), locale);
			if (normalizedInterviewStatus != null) {
				dto.setInterviewStatus(normalizedInterviewStatus);
			}
			dto.setInterviewType(normalizeInterviewType(dto.getInterviewType(), locale));

			// Verify if interviews to insert do not exist
			Interviews existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("interviews id -> " + dto.getId(), locale));
			}

			// Verify if campaigns exist
			Campaigns existingCampaigns = null;
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
			}
			ensureInterviewCampaignPermission(
					request.getUser(),
					existingCampaigns,
					locale,
					"planifier cet entretien",
					new String[] {FunctionalityEnum.CREATE_INTERVIEWS.getValue(), FunctionalityEnum.PLANIFY.getValue()},
					new String[] {"ADMIN", "PLANIFY"});
			
			// Verify if applications exist
			Applications existingApplications = null;
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
			}
			
			// Vérifier qu'une étape INTERVIEW existe dans le template de la campagne
			if (existingCampaigns != null && existingCampaigns.getPipelineTemplate() != null) {
				PipelineStage interviewStage = pipelineStageRepository.findByTemplateIdAndStageType(
						existingCampaigns.getPipelineTemplate().getId(), "INTERVIEW");
				if (interviewStage == null) {
					log.warning("Aucune étape INTERVIEW dans le template de la campagne " + existingCampaigns.getId());
				}
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Interviews entityToSave = null;
			entityToSave = InterviewsTransformer.INSTANCE.toEntity(dto, existingCampaigns, existingApplications);
			ensureInterviewProgressLink(entityToSave);
			boolean shouldSendInvitation = Boolean.TRUE.equals(dto.getInterviewMailSent())
					|| shouldAutoSendInterviewInvitation(entityToSave);
			entityToSave.setInterviewMailSent(false);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
			sendInvitationRequests.add(shouldSendInvitation);
		}

		if (!items.isEmpty()) {
			List<Interviews> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = interviewsRepository.saveAll((Iterable<Interviews>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviews", locale));
			}
			int invitationAttempts = 0;
			int invitationFailures = 0;

			// Synchroniser le lien candidat-entretien puis envoyer les emails si nécessaire
			for (int i = 0; i < itemsSaved.size(); i++) {
				Interviews interview = itemsSaved.get(i);
				ensureCandidateInterviewLink(interview, request.getUser());
				syncApplicationInterviewSummary(interview.getApplications(), request.getUser());
				if (Boolean.TRUE.equals(sendInvitationRequests.get(i))) {
					invitationAttempts++;
					if (!processInterviewInvitationRequest(interview, locale)) {
						invitationFailures++;
					}
				}
				recordInterviewAuditEvent(
						interview,
						request.getUser(),
						null,
						buildInterviewAuditStateJson(interview),
						"INTERVIEW_CREATED");
			}

			List<InterviewsDto> itemsDto = buildInterviewsResponseItems(itemsSaved, request.getIsSimpleLoading(), locale);
			Status status = buildInterviewMutationStatus(invitationAttempts, invitationFailures);

			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end create Interviews-----");
		return response;
	}

	/**
	 * update Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> update(Request<InterviewsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews>        items    = new ArrayList<Interviews>();
		List<Boolean> sendInvitationRequests = new ArrayList<Boolean>();
		List<Boolean> resetCandidateResponseRequests = new ArrayList<Boolean>();
		List<Boolean> resetStageMailRequests = new ArrayList<Boolean>();
		List<Integer> originalApplicationIds = new ArrayList<Integer>();
		Map<Integer, String> beforeStateByInterviewId = new HashMap<>();
			
		for (InterviewsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la interviews existe
			Interviews entityToSave = null;
			entityToSave = interviewsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews id -> " + dto.getId(), locale));
			}
			beforeStateByInterviewId.put(entityToSave.getId(), buildInterviewAuditStateJson(entityToSave));
			Integer originalApplicationId = entityToSave.getApplications() != null ? entityToSave.getApplications().getId() : null;
			Integer originalCampaignId = entityToSave.getCampaigns() != null ? entityToSave.getCampaigns().getId() : null;
			Date originalInterviewDate = entityToSave.getInterviewDate();
			String originalInterviewType = entityToSave.getInterviewType();
			String originalInterviewLocation = entityToSave.getInterviewLocation();
			String originalMeetLink = entityToSave.getMeetLink();
			String originalInterviewNote = entityToSave.getInterviewNote();

			Campaigns permissionCampaign = entityToSave.getCampaigns();

			// Verify if campaigns exist
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
				permissionCampaign = existingCampaigns;
			}
			ensureInterviewCampaignPermission(
					request.getUser(),
					permissionCampaign,
					locale,
					"modifier cet entretien",
					new String[] {FunctionalityEnum.UPDATE_INTERVIEWS.getValue(), FunctionalityEnum.PLANIFY.getValue()},
					new String[] {"ADMIN", "PLANIFY"});
			// Verify if applications exist
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			String currentInterviewStatus = entityToSave.getInterviewStatus();
			if (Utilities.shouldUpdate(dto.getInterviewLocation())) {
				entityToSave.setInterviewLocation(dto.getInterviewLocation());
			}
			if (Utilities.shouldUpdate(dto.getInterviewDate())) {
				entityToSave.setInterviewDate(dateFormat.parse(dto.getInterviewDate()));
			}
			if (Utilities.shouldUpdate(dto.getInterviewStatus())) {
				String statusUpper = normalizeInterviewStatus(dto.getInterviewStatus(), locale);
				dto.setInterviewStatus(statusUpper);
				entityToSave.setInterviewStatus(statusUpper);
				
				// Générer automatiquement le lien d'évaluation quand le statut passe à STARTED
				if (InterviewStatus.STARTED.getValue().equals(statusUpper) && 
				    (currentInterviewStatus == null || !InterviewStatus.STARTED.getValue().equalsIgnoreCase(currentInterviewStatus)) &&
				    (entityToSave.getInterviewEvaluationsLink() == null || entityToSave.getInterviewEvaluationsLink().isEmpty())) {
					String evaluationLink = generateUniqueEvaluationLink();
					entityToSave.setInterviewEvaluationsLink(evaluationLink);
				}
			}
			if (Utilities.shouldUpdate(dto.getMeetLink())) {
				entityToSave.setMeetLink(dto.getMeetLink());
			}
			if (Utilities.shouldUpdate(dto.getInterviewNote())) {
				entityToSave.setInterviewNote(dto.getInterviewNote());
			}
			if (Utilities.shouldUpdate(dto.getInterviewType())) {
				String normalizedInterviewType = normalizeInterviewType(dto.getInterviewType(), locale);
				dto.setInterviewType(normalizedInterviewType);
				entityToSave.setInterviewType(normalizedInterviewType);
			}
			boolean shouldCloseRescheduleRequest = Utilities.shouldUpdate(dto.getInterviewStatus())
					&& InterviewStatus.ARCHIVED.getValue().equalsIgnoreCase(dto.getInterviewStatus())
					&& InterviewStatus.POSTPONED.getValue().equalsIgnoreCase(currentInterviewStatus);
			ensureInterviewProgressLink(entityToSave);
			boolean invitationContentChanged = !Objects.equals(originalApplicationId, entityToSave.getApplications() != null ? entityToSave.getApplications().getId() : null)
					|| !Objects.equals(originalCampaignId, entityToSave.getCampaigns() != null ? entityToSave.getCampaigns().getId() : null)
					|| !Objects.equals(originalInterviewDate, entityToSave.getInterviewDate())
					|| !Objects.equals(originalInterviewType, entityToSave.getInterviewType())
					|| !Objects.equals(originalInterviewLocation, entityToSave.getInterviewLocation())
					|| !Objects.equals(originalMeetLink, entityToSave.getMeetLink())
					|| !Objects.equals(originalInterviewNote, entityToSave.getInterviewNote());
			boolean interviewScheduleChanged = !Objects.equals(originalInterviewDate, entityToSave.getInterviewDate())
					|| !Objects.equals(originalMeetLink, entityToSave.getMeetLink())
					|| !Objects.equals(originalInterviewLocation, entityToSave.getInterviewLocation());
			boolean autoSendInvitation = shouldAutoSendInterviewInvitation(entityToSave);
			boolean shouldSendInvitation = (Boolean.TRUE.equals(dto.getInterviewMailSent()) || autoSendInvitation)
					&& (!Boolean.TRUE.equals(entityToSave.getInterviewMailSent()) || invitationContentChanged);
			boolean shouldResetCandidateResponse = interviewScheduleChanged || shouldSendInvitation || shouldCloseRescheduleRequest;
			if (shouldSendInvitation || invitationContentChanged) {
				entityToSave.setInterviewMailSent(false);
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
			sendInvitationRequests.add(shouldSendInvitation);
			resetCandidateResponseRequests.add(shouldResetCandidateResponse);
			resetStageMailRequests.add(shouldSendInvitation || invitationContentChanged);
			originalApplicationIds.add(originalApplicationId);
		}

		if (!items.isEmpty()) {
			List<Interviews> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = interviewsRepository.saveAll((Iterable<Interviews>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviews", locale));
			}
			int invitationAttempts = 0;
			int invitationFailures = 0;
			for (int i = 0; i < itemsSaved.size(); i++) {
				Interviews interview = itemsSaved.get(i);
				ensureCandidateInterviewLink(interview, request.getUser());
				syncApplicationInterviewSummary(interview.getApplications(), request.getUser());
				Integer originalApplicationId = originalApplicationIds.get(i);
				Integer currentApplicationId = interview.getApplications() != null ? interview.getApplications().getId() : null;
				if (!Objects.equals(originalApplicationId, currentApplicationId) && originalApplicationId != null) {
					Applications originalApplication = applicationsRepository.findOne(originalApplicationId, false);
					syncApplicationInterviewSummary(originalApplication, request.getUser());
				}
				if (Boolean.TRUE.equals(resetStageMailRequests.get(i))) {
					clearInterviewStageMailTracking(interview, request.getUser());
				}
				if (Boolean.TRUE.equals(resetCandidateResponseRequests.get(i))) {
					resetCandidateInterviewResponse(interview, request.getUser());
				}
				if (Boolean.TRUE.equals(sendInvitationRequests.get(i))) {
					invitationAttempts++;
					if (!processInterviewInvitationRequest(interview, locale)) {
						invitationFailures++;
					}
				}
				recordInterviewAuditEvent(
						interview,
						request.getUser(),
						beforeStateByInterviewId.get(interview.getId()),
						buildInterviewAuditStateJson(interview),
						"INTERVIEW_UPDATED");
			}
			List<InterviewsDto> itemsDto = buildInterviewsResponseItems(itemsSaved, request.getIsSimpleLoading(), locale);
			Status status = buildInterviewMutationStatus(invitationAttempts, invitationFailures);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end update Interviews-----");
		return response;
	}

	private List<InterviewsDto> buildInterviewsResponseItems(List<Interviews> interviews, Boolean isSimpleLoading, Locale locale) throws ParseException {
		List<InterviewsDto> itemsDto = (Utilities.isTrue(isSimpleLoading))
				? InterviewsTransformer.INSTANCE.toLiteDtos(interviews)
				: InterviewsTransformer.INSTANCE.toDtos(interviews);
		Map<Integer, Integer> interviewRounds = buildInterviewRounds(interviews);

		final int size = interviews.size();
		List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
		itemsDto.parallelStream().forEach(dto -> {
			try {
				if (dto != null && dto.getId() != null) {
					dto.setInterviewRound(interviewRounds.get(dto.getId()));
				}
				dto = getFullInfos(dto, size, isSimpleLoading, locale);
			} catch (Exception e) {
				listOfError.add(e.getMessage());
				e.printStackTrace();
			}
		});

		if (Utilities.isNotEmpty(listOfError)) {
			Object[] objArray = listOfError.stream().distinct().toArray();
			throw new RuntimeException(StringUtils.join(objArray, ", "));
		}

		return itemsDto;
	}

	private Map<Integer, Integer> buildInterviewRounds(List<Interviews> interviews) {
		Map<Integer, Integer> roundsByInterviewId = new HashMap<Integer, Integer>();
		if (interviews == null || interviews.isEmpty()) {
			return roundsByInterviewId;
		}

		Set<Integer> applicationIds = new LinkedHashSet<Integer>();
		for (Interviews interview : interviews) {
			if (interview == null || interview.getApplications() == null || interview.getApplications().getId() == null) {
				continue;
			}
			applicationIds.add(interview.getApplications().getId());
		}

		for (Integer applicationId : applicationIds) {
			List<Interviews> applicationInterviews = interviewsRepository.findByApplicationId(applicationId, false);
			List<Interviews> orderedInterviews = sortInterviewsForRound(applicationInterviews);
			for (int index = 0; index < orderedInterviews.size(); index++) {
				Interviews interview = orderedInterviews.get(index);
				if (interview != null && interview.getId() != null) {
					roundsByInterviewId.put(interview.getId(), index + 1);
				}
			}
		}

		return roundsByInterviewId;
	}

	private List<Interviews> sortInterviewsForRound(List<Interviews> interviews) {
		if (interviews == null || interviews.isEmpty()) {
			return Collections.emptyList();
		}

		List<Interviews> sortedInterviews = new ArrayList<Interviews>(interviews);
		sortedInterviews.sort((left, right) -> {
			int stageOrderDelta = Integer.compare(resolveInterviewRoundStageOrder(left), resolveInterviewRoundStageOrder(right));
			if (stageOrderDelta != 0) {
				return stageOrderDelta;
			}

			long timestampDelta = Long.compare(resolveInterviewRoundTimestamp(left), resolveInterviewRoundTimestamp(right));
			if (timestampDelta != 0) {
				return timestampDelta < 0L ? -1 : 1;
			}

			return Integer.compare(
				left != null && left.getId() != null ? left.getId() : 0,
				right != null && right.getId() != null ? right.getId() : 0);
		});
		return sortedInterviews;
	}

	private int resolveInterviewRoundStageOrder(Interviews interview) {
		if (interview != null
				&& interview.getApplicationProgress() != null
				&& interview.getApplicationProgress().getPipelineStage() != null
				&& interview.getApplicationProgress().getPipelineStage().getStageOrder() != null) {
			return interview.getApplicationProgress().getPipelineStage().getStageOrder();
		}
		return Integer.MAX_VALUE;
	}

	private long resolveInterviewRoundTimestamp(Interviews interview) {
		if (interview == null) {
			return 0L;
		}
		if (interview.getStartedAt() != null) {
			return interview.getStartedAt().getTime();
		}
		if (interview.getEndedAt() != null) {
			return interview.getEndedAt().getTime();
		}
		if (interview.getInterviewDate() != null) {
			return interview.getInterviewDate().getTime();
		}
		if (interview.getCreatedAt() != null) {
			return interview.getCreatedAt().getTime();
		}
		return 0L;
	}

	private Status buildInterviewMutationStatus(int invitationAttempts, int invitationFailures) {
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		if (invitationAttempts > 0 && invitationFailures > 0) {
			String savedMessage = invitationAttempts == 1
					? "L'entretien a bien ete enregistre, mais "
					: "Les entretiens ont bien ete enregistres, mais ";
			String failureMessage = invitationFailures == 1
					? "la convocation n'a pas pu etre envoyee."
					: invitationFailures + " convocations n'ont pas pu etre envoyees.";
			status.setMessage(savedMessage + failureMessage + " Vous pouvez reessayer depuis la liste des entretiens.");
		} else {
			status.setMessage(StatusMessage.SUCCESS);
		}
		return status;
	}

	private String normalizeInterviewStatus(String value, Locale locale) {
		String trimmedValue = StringUtils.trimToNull(value);
		if (trimmedValue == null) {
			return null;
		}
		try {
			return InterviewStatus.fromValue(trimmedValue).getValue();
		} catch (IllegalArgumentException ex) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"interviewStatus invalide (" + INTERVIEW_STATUS_ALLOWED_VALUES + ") -> " + value,
					locale));
		}
	}

	private String normalizeInterviewType(String value, Locale locale) {
		String trimmedValue = StringUtils.trimToNull(value);
		if (trimmedValue == null) {
			return null;
		}
		try {
			return InterviewType.fromValue(trimmedValue).getValue();
		} catch (IllegalArgumentException ex) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"interviewType invalide (" + INTERVIEW_TYPE_ALLOWED_VALUES + ") -> " + value,
					locale));
		}
	}

	private void normalizeInterviewCriteria(Request<InterviewsDto> request, Locale locale) {
		InterviewsDto dto = request != null ? request.getData() : null;
		if (dto == null) {
			return;
		}

		if (StringUtils.isNotBlank(dto.getInterviewStatus())) {
			dto.setInterviewStatus(normalizeInterviewStatus(dto.getInterviewStatus(), locale));
		}
		if (StringUtils.isNotBlank(dto.getInterviewType())) {
			dto.setInterviewType(normalizeInterviewType(dto.getInterviewType(), locale));
		}
	}

	private void ensureCandidateInterviewLink(Interviews interview, Integer actorUserId) {
		if (interview == null || interview.getId() == null || interview.getApplications() == null || interview.getApplications().getId() == null) {
			return;
		}

		List<CandidateInterview> links = candidateInterviewRepository.findByInterviewId(interview.getId(), false);
		CandidateInterview existingLink = null;
		if (links != null) {
			for (CandidateInterview candidateInterview : links) {
				if (candidateInterview.getApplications() != null
						&& Objects.equals(candidateInterview.getApplications().getId(), interview.getApplications().getId())) {
					existingLink = candidateInterview;
					break;
				}
			}
		}

		if (existingLink == null) {
			CandidateInterview link = new CandidateInterview();
			link.setApplications(interview.getApplications());
			link.setInterviews(interview);
			link.setInterviewStart(interview.getInterviewDate());
			link.setCandidateResponseStatus("PENDING");
			link.setRespondedAt(null);
			link.setCreatedAt(Utilities.getCurrentDate());
			link.setCreatedBy(actorUserId);
			link.setIsDeleted(false);
			link.setSearchString(buildCandidateInterviewSearchString(interview.getApplications().getId(), interview.getId()));
			candidateInterviewRepository.save(link);
			return;
		}

		boolean updated = false;
		if (!Objects.equals(existingLink.getInterviewStart(), interview.getInterviewDate())) {
			existingLink.setInterviewStart(interview.getInterviewDate());
			updated = true;
		}
		if (updated) {
			existingLink.setUpdatedAt(Utilities.getCurrentDate());
			existingLink.setUpdatedBy(actorUserId);
			existingLink.setSearchString(buildCandidateInterviewSearchString(interview.getApplications().getId(), interview.getId()));
			candidateInterviewRepository.save(existingLink);
		}
	}

	private String buildCandidateInterviewSearchString(Integer applicationId, Integer interviewId) {
		return String.join(" ",
				Objects.toString(applicationId, ""),
				Objects.toString(interviewId, "")).trim();
	}

	private void resetCandidateInterviewResponse(Interviews interview, Integer actorUserId) {
		if (interview == null || interview.getId() == null) {
			return;
		}

		List<CandidateInterview> links = candidateInterviewRepository.findByInterviewId(interview.getId(), false);
		if (links == null || links.isEmpty()) {
			return;
		}

		for (CandidateInterview link : links) {
			boolean updated = false;
			if (!Objects.equals(link.getInterviewStart(), interview.getInterviewDate())) {
				link.setInterviewStart(interview.getInterviewDate());
				updated = true;
			}
			if (link.getAlternativeDateRequested() != null) {
				link.setAlternativeDateRequested(null);
				updated = true;
			}
			if (StringUtils.isNotBlank(link.getDeclineReason())) {
				link.setDeclineReason(null);
				updated = true;
			}
			if (!"PENDING".equalsIgnoreCase(StringUtils.defaultString(link.getCandidateResponseStatus(), "PENDING"))) {
				link.setCandidateResponseStatus("PENDING");
				updated = true;
			}
			if (link.getRespondedAt() != null) {
				link.setRespondedAt(null);
				updated = true;
			}

			if (updated) {
				link.setUpdatedAt(Utilities.getCurrentDate());
				link.setUpdatedBy(actorUserId);
				link.setSearchString(buildCandidateInterviewSearchString(
						link.getApplications() != null ? link.getApplications().getId() : null,
						interview.getId()));
				candidateInterviewRepository.save(link);
			}
		}
	}

	private boolean processInterviewInvitationRequest(Interviews interview, Locale locale) {
		if (interview == null || interview.getId() == null) {
			return false;
		}
		try {
			sendInterviewEmail(interview, locale);
			interview.setInterviewMailSent(true);
			interview.setUpdatedAt(Utilities.getCurrentDate());
			interviewsRepository.save(interview);
			markInterviewStageMailSent(interview);
			log.info("Email d'entretien envoyé avec succès pour l'interview ID: " + interview.getId());
			return true;
		} catch (Exception e) {
			interview.setInterviewMailSent(false);
			interview.setUpdatedAt(Utilities.getCurrentDate());
			interviewsRepository.save(interview);
			log.warning("Échec de l'envoi de l'email pour l'interview ID: " + interview.getId() + " - " + e.getMessage());
			return false;
		}
	}

	private boolean shouldAutoSendInterviewInvitation(Interviews interview) {
		PipelineStage interviewStage = resolveInterviewPipelineStage(interview);
		return interviewStage != null
				&& Boolean.TRUE.equals(interviewStage.getEmailRequired())
				&& Boolean.TRUE.equals(interviewStage.getEmailAutomatic());
	}

	private void ensureInterviewProgressLink(Interviews interview) {
		if (interview == null || interview.getApplications() == null || interview.getApplications().getId() == null) {
			return;
		}

		if (interview.getApplicationProgress() != null
				&& interview.getApplicationProgress().getApplications() != null
				&& Objects.equals(
						interview.getApplications().getId(),
						interview.getApplicationProgress().getApplications().getId())) {
			return;
		}

		ApplicationProgress interviewProgress = applicationProgressBusiness.resolveProgressByStageType(
				interview.getApplications().getId(),
				"INTERVIEW");
		if (interviewProgress != null) {
			interview.setApplicationProgress(interviewProgress);
		}
	}

	private Integer resolveInterviewProgressId(Interviews interview) {
		return interview != null && interview.getApplicationProgress() != null
				? interview.getApplicationProgress().getId()
				: null;
	}

	private Integer resolveInterviewStageId(Interviews interview) {
		return interview != null
				&& interview.getApplicationProgress() != null
				&& interview.getApplicationProgress().getPipelineStage() != null
				? interview.getApplicationProgress().getPipelineStage().getId()
				: null;
	}

	private PipelineStage resolveInterviewPipelineStage(Interviews interview) {
		if (interview != null
				&& interview.getApplicationProgress() != null
				&& interview.getApplicationProgress().getPipelineStage() != null) {
			return interview.getApplicationProgress().getPipelineStage();
		}
		if (interview == null || interview.getCampaigns() == null || interview.getCampaigns().getPipelineTemplate() == null) {
			return null;
		}
		Integer templateId = interview.getCampaigns().getPipelineTemplate().getId();
		if (templateId == null) {
			return null;
		}
		return pipelineStageRepository.findByTemplateIdAndStageType(templateId, "INTERVIEW");
	}

	private void markInterviewStageMailSent(Interviews interview) {
		if (interview == null || interview.getApplications() == null || interview.getApplications().getId() == null) {
			return;
		}
		Integer actorUserId = interview.getUpdatedBy() != null ? interview.getUpdatedBy() : interview.getCreatedBy();
		Integer stageId = resolveInterviewStageId(interview);
		if (stageId != null) {
			applicationProgressBusiness.markStageMailSent(interview.getApplications().getId(), stageId, actorUserId);
			return;
		}
		applicationProgressBusiness.markStageMailSentByStageType(interview.getApplications().getId(), "INTERVIEW", actorUserId);
	}

	private void clearInterviewStageMailTracking(Interviews interview, Integer actorUserId) {
		if (interview == null || interview.getApplications() == null || interview.getApplications().getId() == null) {
			return;
		}
		Integer stageId = resolveInterviewStageId(interview);
		if (stageId != null) {
			applicationProgressBusiness.clearStageMailSent(interview.getApplications().getId(), stageId, actorUserId);
			return;
		}
		applicationProgressBusiness.clearStageMailSentByStageType(interview.getApplications().getId(), "INTERVIEW", actorUserId);
	}

	/**
	 * delete Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> delete(Request<InterviewsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews>        items    = new ArrayList<Interviews>();
		Map<Integer, String> beforeStateByInterviewId = new HashMap<>();
			
		for (InterviewsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la interviews existe
			Interviews existingEntity = null;
			existingEntity = interviewsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews -> " + dto.getId(), locale));
			}
			beforeStateByInterviewId.put(existingEntity.getId(), buildInterviewAuditStateJson(existingEntity));
			ensureInterviewCampaignPermission(
					request.getUser(),
					resolveCampaign(existingEntity, locale),
					locale,
					"supprimer cet entretien",
					new String[] {FunctionalityEnum.DELETE_INTERVIEWS.getValue(), FunctionalityEnum.PLANIFY.getValue()},
					new String[] {"ADMIN", "PLANIFY"});

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// candidateInterview
			List<CandidateInterview> listOfCandidateInterview = candidateInterviewRepository.findByInterviewId(existingEntity.getId(), false);
			if (listOfCandidateInterview != null && !listOfCandidateInterview.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateInterview.size() + ")", locale));
			}
			// entityPermission - soft-delete les permissions entité associées
			List<EntityPermission> listOfEntityPermission = entityPermissionRepository.findByEntityTypeAndEntityId("INTERVIEW", existingEntity.getId());
			if (listOfEntityPermission != null && !listOfEntityPermission.isEmpty()){
				for (EntityPermission ep : listOfEntityPermission) {
					ep.setIsDeleted(true);
				}
				entityPermissionRepository.saveAll(listOfEntityPermission);
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			interviewsRepository.saveAll((Iterable<Interviews>) items);
			for (Interviews interview : items) {
				syncApplicationInterviewSummary(interview.getApplications(), request.getUser());
				recordInterviewAuditEvent(
						interview,
						request.getUser(),
						beforeStateByInterviewId.get(interview.getId()),
						buildInterviewAuditStateJson(interview),
						"INTERVIEW_DELETED");
			}

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Interviews-----");
		return response;
	}

	/**
	 * get Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> getByCriteria(Request<InterviewsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		normalizeInterviewCriteria(request, locale);
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews> items 			 = interviewsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewsTransformer.INSTANCE.toLiteDtos(items) : InterviewsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviews", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Interviews-----");
		return response;
	}

	/**
	 * get ALL Interviews by using InterviewsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<InterviewsDto> getAllByCriteria(Request<InterviewsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Interviews (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		normalizeInterviewCriteria(request, locale);
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews> items 			 = interviewsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewsTransformer.INSTANCE.toLiteDtos(items) : InterviewsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviews", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Interviews-----");
		return response;
	}

	/**
	 * get full InterviewsDto by using Interviews as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public InterviewsDto getFullInfos(InterviewsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<InterviewsDto> custom(Request<InterviewsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom InterviewsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new InterviewsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom InterviewsDto-----");
		return response;
	}
	
	/**
	 * Envoie un email de convocation pour un entretien
	 * 
	 * @param interview L'entretien pour lequel envoyer l'email
	 * @param locale La locale pour les messages
	 * @throws Exception en cas d'erreur
	 */
	private void sendInterviewEmail(Interviews interview, Locale locale) throws Exception {
		log.info("----begin sendInterviewEmail-----");
		
		// Récupérer l'application associée
		Applications application = interview.getApplications();
		if (application == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application linked to interview -> " + interview.getId(), locale));
		}
		
		// Récupérer la campagne associée
		Campaigns campaign = interview.getCampaigns();
		if (campaign == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaign linked to interview -> " + interview.getId(), locale));
		}

		if (!Utilities.notBlank(application.getCandidateEmail())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("candidateEmail", locale));
		}

		if (interview.getInterviewDate() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("interviewDate", locale));
		}
		
		// Préparer l'expéditeur
		Map<String, String> from = new HashMap<>();
		from.put("email", paramsUtils.getSmtpLogin());
		from.put("user", "Synelia Recrutement");
		
		// Préparer le destinataire
		List<Map<String, String>> toRecipients = new ArrayList<>();
		Map<String, String> recipient = new HashMap<>();
		recipient.put("email", application.getCandidateEmail());
		recipient.put("user", application.getCandidateFirstName() + " " + application.getCandidateLastName());
		toRecipients.add(recipient);
		
		// Formater la date et l'heure
		String interviewDateTime = dateTimeFormat.format(interview.getInterviewDate());
		
		// Déterminer le type d'entretien
		String interviewTypeText = InterviewType.IN_PERSON.getValue().equals(interview.getInterviewType()) 
			? "qui se déroulera en présentiel" 
			: "qui se déroulera en visioconférence";
		
		// Déterminer le lieu ou le lien
		String locationOrLink = "";
		if (InterviewType.IN_PERSON.getValue().equals(interview.getInterviewType())) {
			locationOrLink = "Lieu : " + (interview.getInterviewLocation() != null ? interview.getInterviewLocation() : "À préciser");
		} else {
			locationOrLink = "Lien de connexion : " + (interview.getMeetLink() != null ? interview.getMeetLink() : "Sera communiqué ultérieurement");
		}
		
		// Note supplémentaire
		String additionalNote = interview.getInterviewNote() != null && !interview.getInterviewNote().isEmpty()
			? "<br/><br/>Note supplémentaire :<br/>" + interview.getInterviewNote()
			: "";
		
		// Sujet de l'email
		String subject;
		// Corps de l'email
		String contenu;

		EmailTemplate emailTemplate = platformReadinessService.requireActiveEmailTemplate(
				EmailActionType.INTERVIEW_INVITE, locale);
		Map<String, String> vars = new HashMap<>();
		vars.put("first_name", application.getCandidateFirstName());
		vars.put("last_name", application.getCandidateLastName());
		vars.put("campaign_title", campaign.getCampaignTitle());
		vars.put("interview_date", interviewDateTime);
		vars.put("interview_type_text", interviewTypeText);
		vars.put("location_or_link", locationOrLink);
		vars.put("additional_note", additionalNote);
		subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
		contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);
		
		// Préparer le contexte Thymeleaf
		context = new Context();
		String template = "blank";
		context.setVariable("contenu", contenu);
		context.setVariable("entete", "Convocation Entretien");
		context.setVariable("titre", "Convocation à un entretien");
		
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
				buildInterviewMailLogContext(interview));
		
		if (responseEmail.isHasError()) {
			log.warning("Échec de l'envoi de l'email de convocation pour: " + application.getCandidateEmail());
			throw new Exception("Erreur lors de l'envoi de l'email");
		} else {
			log.info("Email de convocation envoyé avec succès à: " + application.getCandidateEmail());
		}
		
		log.info("----end sendInterviewEmail-----");
	}

	private MailLogContext buildInterviewMailLogContext(Interviews interview) {
		return MailLogContext.builder()
				.applicationId(interview != null && interview.getApplications() != null ? interview.getApplications().getId() : null)
				.applicationProgressId(resolveInterviewProgressId(interview))
				.interviewId(interview != null ? interview.getId() : null)
				.eventCode("INTERVIEW_INVITATION_EMAIL")
				.requiresConfirmation(Boolean.FALSE)
				.build();
	}

	private void recordInterviewAuditEvent(Interviews interview, Integer actorUserId, String beforeStateJson, String afterStateJson, String actionType) {
		if (interview == null || !Utilities.notBlank(actionType)) {
			return;
		}

		auditEventService.recordEvent(
				resolveInterviewApplicationId(interview),
				resolveInterviewProgressId(interview),
				"INTERVIEW",
				interview.getId() != null ? String.valueOf(interview.getId()) : "UNKNOWN",
				actionType,
				actorUserId,
				null,
				beforeStateJson,
				afterStateJson);
	}

	private String buildInterviewAuditStateJson(Interviews interview) {
		if (interview == null) {
			return null;
		}

		Map<String, Object> snapshot = new LinkedHashMap<>();
		snapshot.put("id", interview.getId());
		snapshot.put("applicationId", resolveInterviewApplicationId(interview));
		snapshot.put("applicationProgressId", resolveInterviewProgressId(interview));
		snapshot.put("pipelineStageId", resolveInterviewStageId(interview));
		snapshot.put("campaignId", interview.getCampaigns() != null ? interview.getCampaigns().getId() : null);
		snapshot.put("interviewDate", interview.getInterviewDate());
		snapshot.put("interviewStatus", interview.getInterviewStatus());
		snapshot.put("interviewType", interview.getInterviewType());
		snapshot.put("interviewLocation", interview.getInterviewLocation());
		snapshot.put("meetLink", interview.getMeetLink());
		snapshot.put("interviewNote", interview.getInterviewNote());
		snapshot.put("interviewMailSent", interview.getInterviewMailSent());
		snapshot.put("interviewEvaluationsLink", interview.getInterviewEvaluationsLink());
		snapshot.put("startedAt", interview.getStartedAt());
		snapshot.put("endedAt", interview.getEndedAt());
		snapshot.put("evaluationScore", interview.getEvaluationScore());
		snapshot.put("evaluationNumber", interview.getEvaluationNumber());
		snapshot.put("evaluationPercentage", interview.getEvaluationPercentage());
		snapshot.put("isDeleted", interview.getIsDeleted());
		snapshot.put("createdAt", interview.getCreatedAt());
		snapshot.put("createdBy", interview.getCreatedBy());
		snapshot.put("updatedAt", interview.getUpdatedAt());
		snapshot.put("updatedBy", interview.getUpdatedBy());

		try {
			return Utilities.convertObjectToJson(snapshot);
		} catch (Exception exception) {
			throw new IllegalStateException("Impossible de serialiser l'etat d'audit de l'entretien", exception);
		}
	}

	private Integer resolveInterviewApplicationId(Interviews interview) {
		return interview != null && interview.getApplications() != null ? interview.getApplications().getId() : null;
	}
	
	/**
	 * Génère un lien d'évaluation unique de 8 caractères alphanumériques en lowercase
	 * Vérifie l'unicité dans la base de données
	 * 
	 * @return String - lien d'évaluation unique
	 */
	private String generateUniqueEvaluationLink() {
		int maxAttempts = 10;
		
		for (int attempts = 0; attempts < maxAttempts; attempts++) {
			// Générer un code alphanumérique de 8 caractères en lowercase
			String evaluationLink = Utilities.generateCodeOld().toLowerCase();
			
			// Vérifier l'unicité dans la base de données
			boolean linkExists = interviewsRepository.findAll().stream()
				.anyMatch(i -> i.getInterviewEvaluationsLink() != null && 
				              evaluationLink.equalsIgnoreCase(i.getInterviewEvaluationsLink()));
			
			if (!linkExists) {
				log.info("Lien d'évaluation unique généré: " + evaluationLink);
				return evaluationLink;
			}
		}
		
		log.warning("Impossible de générer un lien d'évaluation unique après " + maxAttempts + " tentatives");
		throw new RuntimeException("Erreur lors de la génération du lien d'évaluation unique");
	}

	/**
	 * Termine un entretien et calcule les scores d'évaluation
	 * Met à jour l'interview et la candidature avec les statistiques d'évaluation
	 * 
	 * @param request contient l'ID de l'interview à terminer
	 * @param locale
	 * @return response
	 */
	public Response<InterviewsDto> finishInterview(Request<InterviewsDto> request, Locale locale) throws ParseException {
		log.info("----begin finishInterview-----");
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		
		try {
			// Récupérer le premier élément de datas (comme les autres méthodes)
			if (request.getDatas() == null || request.getDatas().isEmpty()) {
				response.setStatus(functionalError.DATA_NOT_EXIST("Interview data is required", locale));
				response.setHasError(true);
				return response;
			}
			
			InterviewsDto dto = request.getDatas().get(0);
			
			if (dto == null || dto.getId() == null) {
				response.setStatus(functionalError.DATA_NOT_EXIST("Interview ID is required", locale));
				response.setHasError(true);
				return response;
			}
			
			// Récupérer l'interview
			Interviews interview = interviewsRepository.findOne(dto.getId(), false);
			if (interview == null) {
				response.setStatus(functionalError.DATA_NOT_EXIST("Interview not found with id: " + dto.getId(), locale));
				response.setHasError(true);
				return response;
			}
			String beforeStateJson = buildInterviewAuditStateJson(interview);
			ensureInterviewCampaignPermission(
					request.getUser(),
					resolveCampaign(interview, locale),
					locale,
					"finaliser cet entretien",
					new String[] {FunctionalityEnum.UPDATE_INTERVIEWS.getValue(), FunctionalityEnum.UPDATE_EVALUATIONS.getValue()},
					new String[] {"ADMIN", "PLANIFY", "EVALUATE"});
			
			// Si l'interview est déjà terminé, retourner un succès (idempotent)
			if (InterviewStatus.OVER.getValue().equals(interview.getInterviewStatus())) {
				log.info("Interview " + dto.getId() + " est déjà terminé, retour succès (idempotent)");
				InterviewsDto resultDto = InterviewsTransformer.INSTANCE.toDto(interview);
				List<InterviewsDto> resultList = new ArrayList<>();
				resultList.add(resultDto);
				response.setItems(resultList);
				response.setHasError(false);
				
				Status status = new Status();
				status.setCode(StatusCode.SUCCESS);
				status.setMessage("Interview already finished");
				response.setStatus(status);
				return response;
			}
			
			// Calculer les statistiques d'évaluation pour cet interview
			Integer evaluationScore = evaluationsRepository.sumMarksByInterviewId(dto.getId());
			Long evaluationNumberLong = evaluationsRepository.countByInterviewId(dto.getId());
			Integer evaluationNumber = evaluationNumberLong.intValue();
			Double evaluationPercentage = evaluationNumber > 0 
				? (double) evaluationScore / evaluationNumber 
				: 0.0;
			
			log.info("Interview " + dto.getId() + " - Score: " + evaluationScore + 
			        ", Number: " + evaluationNumber + ", Percentage: " + evaluationPercentage);
			
			// Mettre à jour l'interview
			interview.setInterviewStatus(InterviewStatus.OVER.getValue());
			interview.setEndedAt(new Date());
			interview.setEvaluationScore(evaluationScore);
			interview.setEvaluationNumber(evaluationNumber);
			interview.setEvaluationPercentage(evaluationPercentage);
			interview.setUpdatedAt(new Date());
			interview.setUpdatedBy(request.getUser());
			
			interviewsRepository.save(interview);
			log.info("Interview " + dto.getId() + " terminé avec succès");
			
			// Mettre à jour la candidature (application)
			if (interview.getApplications() != null) {
				Applications application = interview.getApplications();
				Integer interviewScore = evaluationsRepository.sumMarksByInterviewId(interview.getId());
				Long interviewNumberLong = evaluationsRepository.countByInterviewId(interview.getId());
				Integer interviewNumber = interviewNumberLong != null ? interviewNumberLong.intValue() : 0;
				Double interviewPercentage = interviewNumber > 0 && interviewScore != null
						? (double) interviewScore / interviewNumber
						: 0.0;

				interview.setEvaluationScore(interviewScore != null ? interviewScore : 0);
				interview.setEvaluationNumber(interviewNumber);
				interview.setEvaluationPercentage(interviewPercentage);
				interview.setUpdatedAt(new Date());
				interview.setUpdatedBy(request.getUser());
				interviewsRepository.save(interview);
				
				// Calculer les statistiques totales pour la candidature (tous les interviews)
				Integer totalScore = evaluationsRepository.sumMarksByApplicationId(application.getId());
				Long totalNumberLong = evaluationsRepository.countByApplicationId(application.getId());
				Integer totalNumber = totalNumberLong != null ? totalNumberLong.intValue() : 0;
				Double totalPercentage = totalNumber > 0 && totalScore != null
					? (double) totalScore / totalNumber 
					: 0.0;
				
				log.info("Application " + application.getId() + " - Total Score: " + totalScore + 
				        ", Total Number: " + totalNumber + ", Total Percentage: " + totalPercentage);
				
				application.setTotalEvaluationScore(totalScore != null ? totalScore.floatValue() : 0f);
				application.setTotalEvaluationNumber(totalNumber);
				application.setTotalEvaluationPercentage(totalPercentage);
				applyCurrentInterviewSummary(application);
				application.setUpdatedAt(new Date());
				application.setUpdatedBy(request.getUser());
				
				applicationsRepository.save(application);
				log.info("Application " + application.getId() + " mise à jour avec succès");
				
				// Synchroniser le pipeline via un moteur unique INTERVIEW/EVALUATION.
				try {
					applicationProgressBusiness.syncInterviewEvaluationStages(
							application.getId(),
							resolveInterviewProgressId(interview),
							interviewPercentage,
							true,
							request.getUser(),
							locale);
				} catch (Exception e) {
					log.warning("Erreur lors de la mise à jour du pipeline pour l'interview: " + e.getMessage());
				}

				try {
					notifyCampaignOfCompletedEvaluation(interview, request.getUser(), locale);
				} catch (Exception e) {
					log.warning("Erreur lors de la notification de fin d'evaluation pour l'interview " + interview.getId() + ": " + e.getMessage());
				}
			}
			recordInterviewAuditEvent(
					interview,
					request.getUser(),
					beforeStateJson,
					buildInterviewAuditStateJson(interview),
					"INTERVIEW_FINISHED");
			
			// Retourner l'interview mis à jour
			InterviewsDto resultDto = InterviewsTransformer.INSTANCE.toDto(interview);
			List<InterviewsDto> resultList = new ArrayList<>();
			resultList.add(resultDto);
			response.setItems(resultList);
			response.setHasError(false);
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setStatus(status);
			
		} catch (Exception e) {
			log.severe("Erreur lors de la terminaison de l'interview: " + e.getMessage());
			e.printStackTrace();
			response.setStatus(functionalError.SAVE_FAIL("Error finishing interview: " + e.getMessage(), locale));
			response.setHasError(true);
		}
		
		log.info("----end finishInterview-----");
		return response;
	}

	private void syncApplicationInterviewSummary(Applications application, Integer actorUserId) {
		if (application == null || application.getId() == null) {
			return;
		}

		applyCurrentInterviewSummary(application);
		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(actorUserId != null ? actorUserId : SYSTEM_ACTOR_USER_ID);
		applicationsRepository.save(application);
	}

	private void applyCurrentInterviewSummary(Applications application) {
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
			return;
		}

		application.setInterviewDate(currentInterview.getInterviewDate());
		application.setInterviewStatus(currentInterview.getInterviewStatus());
		application.setCurrentInterviewEvaluationScore(currentInterview.getEvaluationScore());
		application.setCurrentInterviewEvaluationNumber(currentInterview.getEvaluationNumber());
		application.setCurrentInterviewEvaluationPercentage(currentInterview.getEvaluationPercentage());
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

	private void notifyCampaignOfCompletedEvaluation(Interviews interview, Integer actorUserId, Locale locale) throws Exception {
		Campaigns campaign = resolveCampaign(interview, locale);
		if (campaign == null || campaign.getId() == null) {
			return;
		}

		Map<Integer, User> recipients = resolveCampaignNotificationRecipients(campaign, EVALUATION_COMPLETED_NOTIFICATION_PERMISSION_KEYS);
		if (recipients.isEmpty()) {
			return;
		}

		Integer notifActor = normalizeInternalActor(actorUserId);
		Integer createdBy = normalizeSystemActor(actorUserId);
		String notifLink = "/dashboard/campaigns/" + campaign.getId();
		for (User recipient : recipients.values()) {
			if (recipient == null || recipient.getId() == null) {
				continue;
			}
			if (notifActor != null && Objects.equals(recipient.getId(), notifActor)) {
				continue;
			}
			createInternalNotification(
					recipient,
					"EVALUATION_COMPLETED",
					notifActor,
					notifLink,
					createdBy,
					"interviews",
					interview.getId());
		}
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

	private void ensureInterviewCampaignPermission(Integer actorUserId, Campaigns campaign, Locale locale, String actionLabel, String[] globalPermissions, String[] entityPermissions) {
		if (actorUserId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}
		if (campaign == null || campaign.getId() == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaign linked to interview", locale));
		}

		boolean hasScopedRight = permissionService.hasAnyScopedPermission(actorUserId, "CAMPAIGN", campaign.getId(), globalPermissions, entityPermissions);
		if (!hasScopedRight) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Accès refusé: droits insuffisants pour " + actionLabel,
					locale));
		}
	}

	private Campaigns resolveCampaign(Interviews interview, Locale locale) {
		if (interview.getCampaigns() != null && interview.getCampaigns().getId() != null) {
			return interview.getCampaigns();
		}
		Applications application = interview.getApplications();
		if (application != null && application.getSourceToken() != null && application.getSourceToken().getCampaigns() != null) {
			return application.getSourceToken().getCampaigns();
		}
		throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaign linked to interview -> " + interview.getId(), locale));
	}
}
