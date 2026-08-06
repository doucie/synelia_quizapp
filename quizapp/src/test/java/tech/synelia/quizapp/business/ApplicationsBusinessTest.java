package tech.synelia.quizapp.business;

import java.lang.reflect.Method;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.thymeleaf.context.Context;

import tech.synelia.quizapp.business.MailLogService.MailLogContext;
import tech.synelia.quizapp.dao.entity.ApplicationProgress;
import tech.synelia.quizapp.dao.entity.ApplicationQuizAttempt;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.CandidateToken;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.EmailVerificationToken;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.Notifications;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.CandidateAskRepository;
import tech.synelia.quizapp.dao.repository.CandidateInterviewRepository;
import tech.synelia.quizapp.dao.repository.ApplicationQuizAttemptRepository;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CandidateTokenRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.EmailVerificationTokenRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.dao.repository.NotificationsRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.HostingUtils;
import tech.synelia.quizapp.utils.ParamsUtils;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.ApplicationsDto;
import tech.synelia.quizapp.utils.enums.EmailActionType;

@ExtendWith(MockitoExtension.class)
class ApplicationsBusinessTest {

	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FormVersionRepository formVersionRepository;
	@Mock
	private FormBusiness formBusiness;
	@Mock
	private NotificationsRepository notificationsRepository;
	@Mock
	private EntityPermissionRepository entityPermissionRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private EmailVerificationTokenRepository emailVerificationTokenRepository;
	@Mock
	private CandidateTokenRepository candidateTokenRepository;
	@Mock
	private CandidateAskRepository candidateAskRepository;
	@Mock
	private CandidateInterviewRepository candidateInterviewRepository;
	@Mock
	private ApplicationQuizAttemptRepository applicationQuizAttemptRepository;
	@Mock
	private InterviewsRepository interviewsRepository;
	@Mock
	private ParamsUtils paramsUtils;
	@Mock
	private PlatformReadinessService platformReadinessService;
	@Mock
	private EmailTemplateBusiness emailTemplateBusiness;
	@Mock
	private HostingUtils hostingUtils;
	@Mock
	private ApplicationProgressRepository applicationProgressRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private ApplicationProgressBusiness applicationProgressBusiness;

	@InjectMocks
	private ApplicationsBusiness applicationsBusiness;

	@Test
	@SuppressWarnings("unchecked")
	void getPublishedFormVersionsForCampaign_preservesCampaignFormAssignmentOrder() throws Exception {
		Form secondAssignedForm = buildForm(20, "Formulaire B");
		Form firstAssignedForm = buildForm(10, "Formulaire A");
		FormVersion secondAssignedPublishedVersion = buildPublishedVersion(200, secondAssignedForm, 3);
		FormVersion firstAssignedPublishedVersion = buildPublishedVersion(100, firstAssignedForm, 5);

		when(campaignFormRepository.findActiveFormsByCampaignId(44)).thenReturn(List.of(secondAssignedForm, firstAssignedForm));
		when(formVersionRepository.findByFormIdAndIsPublished(20, true, false)).thenReturn(List.of(secondAssignedPublishedVersion));
		when(formVersionRepository.findByFormIdAndIsPublished(10, true, false)).thenReturn(List.of(firstAssignedPublishedVersion));

		Method method = ApplicationsBusiness.class.getDeclaredMethod("getPublishedFormVersionsForCampaign", Integer.class);
		method.setAccessible(true);

		List<FormVersion> publishedVersions = (List<FormVersion>) method.invoke(applicationsBusiness, 44);

		assertThat(publishedVersions)
				.extracting(version -> version.getForm().getId())
				.containsExactly(20, 10);
	}

	@Test
	void createVerificationTokenAndSendEmail_logsMailWithCurrentProgressContext() throws Exception {
		Applications application = new Applications();
		application.setId(15);
		application.setCandidateEmail("ada.lovelace@example.test");
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");
		application.setCreatedBy(77);

		EmailVerificationToken savedToken = new EmailVerificationToken();
		savedToken.setId(300);
		savedToken.setApplication(application);
		savedToken.setCreatedAt(new Date());

		CandidateToken savedCandidateToken = new CandidateToken();
		savedCandidateToken.setId(410);
		savedCandidateToken.setTokenString("TRACK1");

		EmailTemplate emailTemplate = new EmailTemplate();
		emailTemplate.setId(501);
		emailTemplate.setIsActive(true);
		emailTemplate.setIsDeleted(false);

		PipelineStage stage = new PipelineStage();
		stage.setId(700);
		ApplicationProgress currentProgress = new ApplicationProgress();
		currentProgress.setId(25);
		currentProgress.setPipelineStage(stage);

		Response<Object> emailResponse = new Response<>();
		emailResponse.setHasError(false);

		when(emailVerificationTokenRepository.save(any(EmailVerificationToken.class))).thenReturn(savedToken);
		when(candidateTokenRepository.findByApplicationId(15, false)).thenReturn(List.of());
		when(candidateTokenRepository.findByTokenStringIgnoreCase(anyString(), eq(false))).thenReturn(List.of());
		when(candidateTokenRepository.save(any(CandidateToken.class))).thenReturn(savedCandidateToken);
		when(paramsUtils.getSmtpLogin()).thenReturn("noreply@synelia.test");
		when(paramsUtils.getUrlAppl()).thenReturn("https://app.synelia.test");
		when(platformReadinessService.requireActiveEmailTemplate(EmailActionType.APPLICATION_VERIFICATION, Locale.FRENCH)).thenReturn(emailTemplate);
		when(emailTemplateBusiness.renderSubjectTemplate(eq(emailTemplate), any())).thenReturn("Verification");
		when(emailTemplateBusiness.renderBodyTemplate(eq(emailTemplate), any())).thenReturn("Contenu");
		when(applicationProgressRepository.findCurrentStage(15)).thenReturn(currentProgress);
		when(hostingUtils.sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), any(MailLogContext.class)))
				.thenReturn(emailResponse);

		Method method = ApplicationsBusiness.class.getDeclaredMethod("createVerificationTokenAndSendEmail", Applications.class, Locale.class);
		method.setAccessible(true);
		method.invoke(applicationsBusiness, application, Locale.FRENCH);

		ArgumentCaptor<MailLogContext> mailLogCaptor = ArgumentCaptor.forClass(MailLogContext.class);
		verify(hostingUtils).sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), mailLogCaptor.capture());
		MailLogContext mailLogContext = mailLogCaptor.getValue();
		assertThat(mailLogContext.getApplicationId()).isEqualTo(15);
		assertThat(mailLogContext.getApplicationProgressId()).isEqualTo(25);
		assertThat(mailLogContext.getEventCode()).isEqualTo("APPLICATION_VERIFICATION_EMAIL");
		assertThat(mailLogContext.getRequiresConfirmation()).isFalse();
	}

	@Test
	void syncApplicationQuizSummaryFromAttempt_recomputesDerivedStatusFromProgress() throws Exception {
		Applications application = new Applications();
		application.setId(15);

		ApplicationQuizAttempt quizAttempt = new ApplicationQuizAttempt();
		quizAttempt.setId(902);
		quizAttempt.setQuizStatus(tech.synelia.quizapp.utils.enums.QuizStatus.COMPLETED.getValue());
		quizAttempt.setScore(14.0d);
		quizAttempt.setTotalQuestions(20);
		quizAttempt.setScorePercent(70.0d);
		quizAttempt.setManualCorrectionStatus("DONE");
		quizAttempt.setTimeElapsed(1800);
		quizAttempt.setTimedSnapshot(true);
		quizAttempt.setTotalTimeAllowedSnapshot(2400);
		quizAttempt.setLastActivityAt(new Date());

		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Method method = ApplicationsBusiness.class.getDeclaredMethod(
				"syncApplicationQuizSummaryFromAttempt",
				Applications.class,
				ApplicationQuizAttempt.class,
				Integer.class);
		method.setAccessible(true);

		method.invoke(applicationsBusiness, application, quizAttempt, 77);

		assertThat(application.getAggregatedQuizScore()).isEqualTo(14.0d);
		assertThat(application.getAggregatedQuizScorePercent()).isEqualTo(70.0d);
		verify(applicationProgressBusiness).syncApplicationStatus(15);
	}

	@Test
	void resolveTrackedApplicationStatus_derivesFromMirrors() throws Exception {
		Method method = ApplicationsBusiness.class.getDeclaredMethod(
				"resolveTrackedApplicationStatus",
				Applications.class);
		method.setAccessible(true);

		Applications withdrawn = new Applications();
		withdrawn.setApplicationAbandoned(true);
		withdrawn.setCurrentPipelineProgressStatus("PENDING");
		assertThat(method.invoke(applicationsBusiness, withdrawn)).isEqualTo("WITHDRAWN");

		Applications accepted = new Applications();
		accepted.setCurrentFinalDecisionType("FINAL_ACCEPTED");
		assertThat(method.invoke(applicationsBusiness, accepted)).isEqualTo("ACCEPTED");

		Applications rejectedByFinal = new Applications();
		rejectedByFinal.setCurrentFinalDecisionType("FINAL_REJECTED");
		assertThat(method.invoke(applicationsBusiness, rejectedByFinal)).isEqualTo("REJECTED");

		Applications rejectedByPreScreen = new Applications();
		rejectedByPreScreen.setCurrentPreselectionDecisionType("PRE_SCREEN_REJECTED");
		assertThat(method.invoke(applicationsBusiness, rejectedByPreScreen)).isEqualTo("REJECTED");

		Applications archivedRejection = new Applications();
		archivedRejection.setCurrentPreselectionDecisionType("PRE_SCREEN_REJECTED_ARCHIVED");
		assertThat(method.invoke(applicationsBusiness, archivedRejection)).isEqualTo("REJECTED");

		Applications newApplication = new Applications();
		assertThat(method.invoke(applicationsBusiness, newApplication)).isEqualTo("NEW");

		Applications pending = new Applications();
		pending.setCurrentPipelineProgressStatus("PENDING");
		assertThat(method.invoke(applicationsBusiness, pending)).isEqualTo("NEW");

		Applications inProgress = new Applications();
		inProgress.setCurrentPipelineProgressStatus("IN_PROGRESS");
		assertThat(method.invoke(applicationsBusiness, inProgress)).isEqualTo("IN_PROGRESS");
	}

	@Test
	void update_ignoresDerivedApplicationSummaryFields() throws Exception {
		Applications existingApplication = new Applications();
		existingApplication.setId(15);
		existingApplication.setCandidateFirstName("Grace");
		existingApplication.setAggregatedQuizScore(12.0d);
		existingApplication.setAggregatedEvaluationScore(45.0d);
		existingApplication.setAggregatedEvaluationScorePercent(23.0d);

		ApplicationsDto dto = new ApplicationsDto();
		dto.setId(15);
		dto.setCandidateFirstName("Ada");
		dto.setAggregatedQuizScore(99.0d);
		dto.setAggregatedEvaluationScore(88.0d);
		dto.setAggregatedEvaluationScorePercent(76.0d);

		Request<ApplicationsDto> request = new Request<ApplicationsDto>();
		request.setDatas(List.of(dto));
		request.setUser(77);
		request.setIsSimpleLoading(true);

		when(applicationsRepository.findOne(15, false)).thenReturn(existingApplication);
		when(applicationsRepository.saveAll(any())).thenAnswer(invocation -> {
			Iterable<Applications> items = invocation.getArgument(0);
			List<Applications> savedItems = new java.util.ArrayList<Applications>();
			for (Applications item : items) {
				savedItems.add(item);
			}
			return savedItems;
		});

		Response<ApplicationsDto> response = applicationsBusiness.update(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existingApplication.getCandidateFirstName()).isEqualTo("Ada");
		assertThat(existingApplication.getAggregatedQuizScore()).isEqualTo(12.0d);
		assertThat(existingApplication.getAggregatedEvaluationScore()).isEqualTo(45.0d);
		assertThat(existingApplication.getAggregatedEvaluationScorePercent()).isEqualTo(23.0d);
	}

	@Test
	void create_ignoresDerivedApplicationSummaryFieldsFromDto() throws Exception {
		ApplicationsDto dto = new ApplicationsDto();
		dto.setCandidateFirstName("Ada");
		dto.setCandidateLastName("Lovelace");
		dto.setCandidateEmail("ada.lovelace@example.test");
		dto.setCandidatePhone("0102030405");
		dto.setAggregatedQuizScore(99.0d);
		dto.setAggregatedEvaluationScore(88.0d);
		dto.setAggregatedEvaluationScorePercent(76.0d);

		Request<ApplicationsDto> request = new Request<ApplicationsDto>();
		request.setDatas(List.of(dto));
		request.setUser(77);
		request.setIsSimpleLoading(true);

		CandidateToken existingTrackingToken = new CandidateToken();
		existingTrackingToken.setId(410);
		existingTrackingToken.setTokenString("TRACK1");

		List<Applications> capturedSavedItems = new java.util.ArrayList<Applications>();
		when(applicationsRepository.saveAll(any())).thenAnswer(invocation -> {
			Iterable<Applications> items = invocation.getArgument(0);
			List<Applications> savedItems = new java.util.ArrayList<Applications>();
			for (Applications item : items) {
				item.setId(15);
				capturedSavedItems.add(item);
				savedItems.add(item);
			}
			return savedItems;
		});
		when(candidateTokenRepository.findByApplicationId(15, false)).thenReturn(List.of(existingTrackingToken));

		Response<ApplicationsDto> response = applicationsBusiness.create(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(capturedSavedItems).hasSize(1);
		Applications savedApplication = capturedSavedItems.get(0);
		assertThat(savedApplication.getAggregatedQuizScore()).isNull();
		assertThat(savedApplication.getAggregatedEvaluationScore()).isNull();
		assertThat(savedApplication.getAggregatedEvaluationScorePercent()).isNull();
	}

	@Test
	@SuppressWarnings("unchecked")
	void trackApplication_returnsInterviewsAnchoredOnTheirProgressOccurrence() throws Exception {
		Applications application = new Applications();
		application.setId(15);
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");
		application.setCandidateEmail("ada.lovelace@example.test");

		CandidateToken candidateToken = new CandidateToken();
		candidateToken.setApplications(application);
		candidateToken.setTokenString("TRACK1");
		candidateToken.setIsDeleted(false);

		PipelineStage firstInterviewStage = new PipelineStage();
		firstInterviewStage.setId(701);
		firstInterviewStage.setStageType("INTERVIEW");
		firstInterviewStage.setStageLabel("Entretien RH");
		firstInterviewStage.setStageOrder(3);

		ApplicationProgress firstInterviewProgress = new ApplicationProgress();
		firstInterviewProgress.setId(41);
		firstInterviewProgress.setPipelineStage(firstInterviewStage);
		firstInterviewProgress.setApplications(application);

		Interviews firstInterview = new Interviews();
		firstInterview.setId(91);
		firstInterview.setApplicationProgress(firstInterviewProgress);
		firstInterview.setInterviewDate(new Date(1_800_000L));
		firstInterview.setInterviewStatus("SCHEDULED");
		firstInterview.setInterviewType("ONLINE");
		firstInterview.setInterviewMailSent(Boolean.TRUE);

		CandidateInterview firstLink = new CandidateInterview();
		firstLink.setId(1001);
		firstLink.setInterviews(firstInterview);

		PipelineStage secondInterviewStage = new PipelineStage();
		secondInterviewStage.setId(702);
		secondInterviewStage.setStageType("INTERVIEW");
		secondInterviewStage.setStageLabel("Entretien final");
		secondInterviewStage.setStageOrder(5);

		ApplicationProgress secondInterviewProgress = new ApplicationProgress();
		secondInterviewProgress.setId(52);
		secondInterviewProgress.setPipelineStage(secondInterviewStage);
		secondInterviewProgress.setApplications(application);

		Interviews secondInterview = new Interviews();
		secondInterview.setId(92);
		secondInterview.setApplicationProgress(secondInterviewProgress);
		secondInterview.setInterviewDate(new Date(600_000L));
		secondInterview.setInterviewStatus("PENDING");
		secondInterview.setInterviewType("ONLINE");
		secondInterview.setInterviewMailSent(Boolean.TRUE);

		CandidateInterview secondLink = new CandidateInterview();
		secondLink.setId(1002);
		secondLink.setInterviews(secondInterview);

		when(candidateTokenRepository.findByTokenStringIgnoreCase("TRACK1", false)).thenReturn(List.of(candidateToken));
		when(candidateTokenRepository.findByApplicationId(15, false)).thenReturn(List.of(candidateToken));
		when(applicationProgressRepository.findByApplicationIdOrderByStageOrder(15)).thenReturn(List.of());
		when(candidateInterviewRepository.findByApplicationId(15, false)).thenReturn(List.of(secondLink, firstLink));
		when(interviewsRepository.findOne(91, false)).thenReturn(firstInterview);
		when(interviewsRepository.findOne(92, false)).thenReturn(secondInterview);
		when(candidateAskRepository.findByApplicationId(15, false)).thenReturn(List.of());

		Map<String, Object> trackingResult = applicationsBusiness.trackApplication("TRACK1", "ada.lovelace@example.test", Locale.FRENCH);

		assertThat(trackingResult.get("hasError")).isEqualTo(false);
		List<Map<String, Object>> interviews = (List<Map<String, Object>>) trackingResult.get("interviews");
		assertThat(interviews).hasSize(2);
		assertThat(interviews.get(0).get("id")).isEqualTo(1001);
		assertThat(interviews.get(0).get("candidateInterviewId")).isEqualTo(1001);
		assertThat(interviews.get(0).get("interviewId")).isEqualTo(91);
		assertThat(interviews.get(0).get("applicationProgressId")).isEqualTo(41);
		assertThat(interviews.get(0).get("pipelineStageId")).isEqualTo(701);
		assertThat(interviews.get(0).get("pipelineStageLabel")).isEqualTo("Entretien RH");
		assertThat(interviews.get(0).get("pipelineStageType")).isEqualTo("INTERVIEW");
		assertThat(interviews.get(0).get("pipelineStageOrder")).isEqualTo(3);
		assertThat(interviews.get(1).get("id")).isEqualTo(1002);
		assertThat(interviews.get(1).get("applicationProgressId")).isEqualTo(52);
	}

	@Test
	@SuppressWarnings("unchecked")
	void trackApplication_returnsCurrentQuizAttemptForPublicResume() throws Exception {
		Applications application = new Applications();
		application.setId(15);
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");
		application.setCandidateEmail("ada.lovelace@example.test");

		CandidateToken candidateToken = new CandidateToken();
		candidateToken.setApplications(application);
		candidateToken.setTokenString("TRACK1");
		candidateToken.setIsDeleted(false);

		PipelineStage quizStage = new PipelineStage();
		quizStage.setId(611);
		quizStage.setStageType("QUIZ");
		quizStage.setStageLabel("Test technique round 2");
		quizStage.setStageOrder(4);

		ApplicationProgress quizProgress = new ApplicationProgress();
		quizProgress.setId(77);
		quizProgress.setPipelineStage(quizStage);

		ApplicationQuizAttempt completedAttempt = new ApplicationQuizAttempt();
		completedAttempt.setId(901);
		completedAttempt.setQuizToken("quiz-old-token");
		completedAttempt.setQuizStatus("COMPLETED");
		completedAttempt.setApplicationProgress(quizProgress);
		completedAttempt.setCompletedAt(new Date(900_000L));

		ApplicationQuizAttempt currentAttempt = new ApplicationQuizAttempt();
		currentAttempt.setId(902);
		currentAttempt.setQuizToken("quiz-current-token");
		currentAttempt.setQuizStatus("STARTED");
		currentAttempt.setApplicationProgress(quizProgress);
		currentAttempt.setStartedAt(new Date(1_200_000L));
		currentAttempt.setLastActivityAt(new Date(1_500_000L));

		when(candidateTokenRepository.findByTokenStringIgnoreCase("TRACK1", false)).thenReturn(List.of(candidateToken));
		when(applicationProgressRepository.findByApplicationIdOrderByStageOrder(15)).thenReturn(List.of());
		when(applicationQuizAttemptRepository.findByApplicationIdOrderByIdDesc(15, false)).thenReturn(List.of(currentAttempt, completedAttempt));
		when(candidateInterviewRepository.findByApplicationId(15, false)).thenReturn(List.of());
		when(candidateAskRepository.findByApplicationId(15, false)).thenReturn(List.of());

		Map<String, Object> trackingResult = applicationsBusiness.trackApplication("TRACK1", "ada.lovelace@example.test", Locale.FRENCH);

		assertThat(trackingResult.get("hasError")).isEqualTo(false);
		Map<String, Object> quiz = (Map<String, Object>) trackingResult.get("quiz");
		assertThat(quiz).isNotNull();
		assertThat(quiz.get("applicationId")).isEqualTo(15);
		assertThat(quiz.get("applicationQuizAttemptId")).isEqualTo(902);
		assertThat(quiz.get("applicationProgressId")).isEqualTo(77);
		assertThat(quiz.get("pipelineStageId")).isEqualTo(611);
		assertThat(quiz.get("pipelineStageType")).isEqualTo("QUIZ");
		assertThat(quiz.get("pipelineStageLabel")).isEqualTo("Test technique round 2");
		assertThat(quiz.get("pipelineStageOrder")).isEqualTo(4);
		assertThat(quiz.get("quizToken")).isEqualTo("quiz-current-token");
		assertThat(quiz.get("quizStatus")).isEqualTo("STARTED");
		assertThat(quiz.get("canResume")).isEqualTo(true);
	}

	@Test
	@SuppressWarnings("unchecked")
	void respondToTrackedInterview_accept_marksOccurrenceAsResolved() throws Exception {
		Applications application = new Applications();
		application.setId(15);
		application.setCandidateEmail("ada.lovelace@example.test");

		CandidateToken candidateToken = new CandidateToken();
		candidateToken.setApplications(application);
		candidateToken.setTokenString("TRACK1");
		candidateToken.setIsDeleted(false);

		ApplicationProgress interviewProgress = new ApplicationProgress();
		interviewProgress.setId(51);
		interviewProgress.setApplications(application);

		Interviews interview = new Interviews();
		interview.setId(91);
		interview.setApplicationProgress(interviewProgress);
		interview.setInterviewDate(new Date(1_800_000L));
		interview.setInterviewStatus("PENDING");
		interview.setInterviewType("ONLINE");

		CandidateInterview candidateInterview = new CandidateInterview();
		candidateInterview.setId(1001);
		candidateInterview.setInterviews(interview);
		candidateInterview.setCandidateResponseStatus("PENDING");

		when(candidateTokenRepository.findByTokenStringIgnoreCase("TRACK1", false)).thenReturn(List.of(candidateToken));
		when(candidateInterviewRepository.findOne(1001, false)).thenReturn(candidateInterview);
		when(candidateInterviewRepository.findByApplicationId(15, false)).thenReturn(List.of(candidateInterview));
		when(interviewsRepository.findOne(91, false)).thenReturn(interview);

		Map<String, Object> response = applicationsBusiness.respondToTrackedInterview(
				"TRACK1",
				"ada.lovelace@example.test",
				1001,
				"ACCEPT",
				null,
				null,
				Locale.FRENCH);

		assertThat(response.get("hasError")).isEqualTo(false);
		Map<String, Object> interviewPayload = (Map<String, Object>) response.get("interview");
		assertThat(interviewPayload.get("responseState")).isEqualTo("ACCEPTED");
		assertThat(interviewPayload.get("canRespond")).isEqualTo(false);
		assertThat(interviewPayload.get("respondedAt")).isNotNull();
		assertThat(candidateInterview.getCandidateResponseStatus()).isEqualTo("ACCEPTED");
		assertThat(candidateInterview.getRespondedAt()).isNotNull();
		assertThat(interview.getInterviewStatus()).isEqualTo("SCHEDULED");

		Map<String, Object> secondResponse = applicationsBusiness.respondToTrackedInterview(
				"TRACK1",
				"ada.lovelace@example.test",
				1001,
				"REQUEST_RESCHEDULE",
				null,
				"2026-06-12T10:30",
				Locale.FRENCH);

		assertThat(secondResponse.get("hasError")).isEqualTo(true);
		assertThat(secondResponse.get("message")).isEqualTo("Une réponse a déjà été enregistrée pour cet entretien.");
	}

	@Test
	@SuppressWarnings("unchecked")
	void respondToTrackedInterview_requestReschedule_marksOccurrenceAsResolved() throws Exception {
		Applications application = new Applications();
		application.setId(15);
		application.setCandidateEmail("ada.lovelace@example.test");

		CandidateToken candidateToken = new CandidateToken();
		candidateToken.setApplications(application);
		candidateToken.setTokenString("TRACK1");
		candidateToken.setIsDeleted(false);

		ApplicationProgress interviewProgress = new ApplicationProgress();
		interviewProgress.setId(51);
		interviewProgress.setApplications(application);

		Interviews interview = new Interviews();
		interview.setId(91);
		interview.setApplicationProgress(interviewProgress);
		interview.setInterviewDate(new Date(1_800_000L));
		interview.setInterviewStatus("PENDING");
		interview.setInterviewType("ONLINE");

		CandidateInterview candidateInterview = new CandidateInterview();
		candidateInterview.setId(1001);
		candidateInterview.setInterviews(interview);
		candidateInterview.setCandidateResponseStatus("PENDING");

		when(candidateTokenRepository.findByTokenStringIgnoreCase("TRACK1", false)).thenReturn(List.of(candidateToken));
		when(candidateInterviewRepository.findOne(1001, false)).thenReturn(candidateInterview);
		when(candidateInterviewRepository.findByApplicationId(15, false)).thenReturn(List.of(candidateInterview));
		when(interviewsRepository.findOne(91, false)).thenReturn(interview);

		Map<String, Object> response = applicationsBusiness.respondToTrackedInterview(
				"TRACK1",
				"ada.lovelace@example.test",
				1001,
				"REQUEST_RESCHEDULE",
				null,
				"2026-06-12T10:30",
				Locale.FRENCH);

		assertThat(response.get("hasError")).isEqualTo(false);
		Map<String, Object> interviewPayload = (Map<String, Object>) response.get("interview");
		assertThat(interviewPayload.get("responseState")).isEqualTo("RESCHEDULE_REQUESTED");
		assertThat(interviewPayload.get("canRespond")).isEqualTo(false);
		assertThat(interviewPayload.get("respondedAt")).isNotNull();
		assertThat(interviewPayload.get("alternativeDateRequested")).isNotNull();
		assertThat(candidateInterview.getCandidateResponseStatus()).isEqualTo("RESCHEDULE_REQUESTED");
		assertThat(candidateInterview.getRespondedAt()).isNotNull();
		assertThat(interview.getInterviewStatus()).isEqualTo("POSTPONED");
	}

	@Test
	@SuppressWarnings("unchecked")
	void withdrawTrackedApplication_locksPublicActionsAndNotifiesRecruiters() throws Exception {
		Applications application = new Applications();
		application.setId(15);
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");
		application.setCandidateEmail("ada.lovelace@example.test");
		application.setApplicationAbandoned(false);

		Campaigns campaign = new Campaigns();
		campaign.setId(44);
		campaign.setCampaignTitle("Campagne Java");
		campaign.setCreatedBy(88);

		SourceToken sourceToken = new SourceToken();
		sourceToken.setCampaigns(campaign);
		application.setSourceToken(sourceToken);

		CandidateToken candidateToken = new CandidateToken();
		candidateToken.setApplications(application);
		candidateToken.setTokenString("TRACK1");
		candidateToken.setIsDeleted(false);

		ApplicationProgress interviewProgress = new ApplicationProgress();
		interviewProgress.setId(51);
		interviewProgress.setApplications(application);

		Interviews interview = new Interviews();
		interview.setId(91);
		interview.setApplicationProgress(interviewProgress);
		interview.setInterviewDate(new Date(1_800_000L));
		interview.setInterviewStatus("PENDING");
		interview.setInterviewType("ONLINE");

		CandidateInterview candidateInterview = new CandidateInterview();
		candidateInterview.setId(1001);
		candidateInterview.setInterviews(interview);
		candidateInterview.setCandidateResponseStatus("PENDING");

		User creator = new User();
		creator.setId(88);

		when(candidateTokenRepository.findByTokenStringIgnoreCase("TRACK1", false)).thenReturn(List.of(candidateToken));
		when(candidateTokenRepository.findByApplicationId(15, false)).thenReturn(List.of(candidateToken));
		when(applicationProgressRepository.findByApplicationIdOrderByStageOrder(15)).thenReturn(List.of());
		when(applicationQuizAttemptRepository.findByApplicationIdOrderByIdDesc(15, false)).thenReturn(List.of());
		when(candidateInterviewRepository.findByApplicationId(15, false)).thenReturn(List.of(candidateInterview));
		when(interviewsRepository.findOne(91, false)).thenReturn(interview);
		when(candidateAskRepository.findByApplicationId(15, false)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 44)).thenReturn(List.of());
		when(userRepository.findOne(88, false)).thenReturn(creator);

		Map<String, Object> response = applicationsBusiness.withdrawTrackedApplication("TRACK1", "ada.lovelace@example.test", Locale.FRENCH);

		assertThat(response.get("hasError")).isEqualTo(false);
		assertThat(response.get("message")).isEqualTo("Votre candidature a bien été retirée.");
		assertThat(application.getApplicationAbandoned()).isEqualTo(true);

		Map<String, Object> appData = (Map<String, Object>) response.get("application");
		assertThat(appData.get("trackedStatus")).isEqualTo("WITHDRAWN");
		assertThat(appData.get("applicationAbandoned")).isEqualTo(true);
		assertThat(appData.get("publicActionsLocked")).isEqualTo(true);
		assertThat(appData.get("canWithdraw")).isEqualTo(false);
		assertThat(appData.get("publicLockReason")).isEqualTo("Cette candidature a été retirée. Les actions publiques ne sont plus disponibles.");

		List<Map<String, Object>> interviews = (List<Map<String, Object>>) response.get("interviews");
		assertThat(interviews).hasSize(1);
		assertThat(interviews.get(0).get("canRespond")).isEqualTo(false);

		verify(notificationsRepository).save(any(Notifications.class));

		Map<String, Object> askResponse = applicationsBusiness.submitTrackedCandidateAsk(
				"TRACK1",
				"ada.lovelace@example.test",
				"EMAIL",
				null,
				null,
				"new.email@example.test",
				null,
				Locale.FRENCH);
		assertThat(askResponse.get("hasError")).isEqualTo(true);
		assertThat(askResponse.get("message")).isEqualTo("Cette candidature a été retirée. Les actions publiques ne sont plus disponibles.");

		Map<String, Object> interviewResponse = applicationsBusiness.respondToTrackedInterview(
				"TRACK1",
				"ada.lovelace@example.test",
				1001,
				"ACCEPT",
				null,
				null,
				Locale.FRENCH);
		assertThat(interviewResponse.get("hasError")).isEqualTo(true);
		assertThat(interviewResponse.get("message")).isEqualTo("Cette candidature a été retirée. Les actions publiques ne sont plus disponibles.");
	}

	private Form buildForm(Integer id, String formName) {
		Form form = new Form();
		form.setId(id);
		form.setFormName(formName);
		form.setIsDeleted(false);
		return form;
	}

	private FormVersion buildPublishedVersion(Integer id, Form form, Integer versionNumber) {
		FormVersion formVersion = new FormVersion();
		formVersion.setId(id);
		formVersion.setForm(form);
		formVersion.setVersionNumber(versionNumber);
		formVersion.setIsPublished(true);
		formVersion.setIsDeleted(false);
		return formVersion;
	}
}