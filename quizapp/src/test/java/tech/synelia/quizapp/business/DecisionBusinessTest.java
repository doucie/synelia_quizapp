package tech.synelia.quizapp.business;

import java.util.Date;
import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.thymeleaf.context.Context;

import tech.synelia.quizapp.business.MailLogService.MailLogContext;
import tech.synelia.quizapp.dao.entity.ApplicationProgress;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Decision;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.DecisionRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.HostingUtils;
import tech.synelia.quizapp.utils.ParamsUtils;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.DecisionDto;
import tech.synelia.quizapp.utils.enums.DecisionType;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class DecisionBusinessTest {

	@Mock
	private DecisionRepository decisionRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private PipelineStageRepository pipelineStageRepository;
	@Mock
	private ApplicationProgressRepository applicationProgressRepository;
	@Mock
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Mock
	private PermissionService permissionService;
	@Mock
	private HostingUtils hostingUtils;
	@Mock
	private ParamsUtils paramsUtils;
	@Mock
	private EmailTemplateBusiness emailTemplateBusiness;
	@Mock
	private PlatformReadinessService platformReadinessService;
	@Mock
	private AuditEventService auditEventService;
	@Mock
	private FunctionalError functionalError;

	@InjectMocks
	private DecisionBusiness decisionBusiness;

	@Test
	void update_allowsPartialJustificationChangeForHistorizedCancellation() throws Exception {
		Campaigns campaign = buildCampaign(8);
		Applications application = buildApplication(1, campaign);
		PipelineStage stage = buildPipelineStage(100, "DECISION");
		ApplicationProgress progress = buildApplicationProgress(10, application, stage);
		User actor = buildUser(12);

		Decision targetDecision = buildDecision(90, application, actor, stage, progress, false, DecisionType.FINAL_ACCEPTED.getValue(), "STANDARD");
		Decision cancellationDecision = buildDecision(91, application, actor, stage, progress, true, DecisionType.FINAL_ACCEPTED.getValue(), "CANCEL");
		cancellationDecision.setCancelsDecision(targetDecision);
		cancellationDecision.setJustification("Ancienne justification");
		cancellationDecision.setCreatedBy(actor.getId());
		cancellationDecision.setUpdatedBy(actor.getId());

		when(decisionRepository.findOne(91, false)).thenReturn(cancellationDecision);
		when(decisionRepository.findOne(90, false)).thenReturn(targetDecision);
		when(decisionRepository.save(any(Decision.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(decisionRepository.findByApplicationId(1, false)).thenReturn(List.of(targetDecision, cancellationDecision));
		when(applicationsRepository.findOne(1, false)).thenReturn(application);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(applicationProgressRepository.findOne(10, false)).thenReturn(progress);
		when(permissionService.hasAnyScopedPermission(eq(77), eq("CAMPAIGN"), eq(8), any(String[].class), any(String[].class))).thenReturn(true);

		DecisionDto dto = new DecisionDto();
		dto.setId(91);
		dto.setJustification("Justification corrigée");

		Response<DecisionDto> response = decisionBusiness.update(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(cancellationDecision.getJustification()).isEqualTo("Justification corrigée");
		assertThat(cancellationDecision.getUpdatedBy()).isEqualTo(77);
		verify(decisionRepository).save(cancellationDecision);
		verify(applicationProgressBusiness).rollbackStage(1, 100, 12, "Justification corrigée", Locale.FRENCH);
	}

	@Test
	void update_rejectsApplicationProgressRetargetingForExistingDecision() {
		Campaigns campaign = buildCampaign(8);
		Applications application = buildApplication(1, campaign);
		PipelineStage stage = buildPipelineStage(100, "PRESELECTION");
		ApplicationProgress progress = buildApplicationProgress(10, application, stage);
		Decision existingDecision = buildDecision(50, application, buildUser(12), stage, progress, false, DecisionType.PRE_SCREEN_ACCEPTED.getValue(), "STANDARD");

		when(decisionRepository.findOne(50, false)).thenReturn(existingDecision);
		when(applicationsRepository.findOne(1, false)).thenReturn(application);
		when(applicationProgressRepository.findOne(10, false)).thenReturn(progress);
		when(permissionService.hasAnyScopedPermission(eq(77), eq("CAMPAIGN"), eq(8), any(String[].class), any(String[].class))).thenReturn(true);
		when(functionalError.DISALLOWED_OPERATION(any(String.class), eq(Locale.FRENCH))).thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED", invocation.getArgument(0)));

		DecisionDto dto = new DecisionDto();
		dto.setId(50);
		dto.setApplicationProgressId(99);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> decisionBusiness.update(buildRequest(77, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("applicationProgressId");
		verify(decisionRepository, never()).save(any(Decision.class));
	}

	@Test
	void create_passesRoundReferencesToDecisionEmailLogging() throws Exception {
		Campaigns campaign = buildCampaign(8);
		Applications application = buildApplication(1, campaign);
		PipelineStage stage = buildPipelineStage(100, "PRESELECTION");
		stage.setEmailRequired(true);
		stage.setEmailAutomatic(false);
		ApplicationProgress progress = buildApplicationProgress(10, application, stage);
		User decisionUser = buildUser(12);
		EmailTemplate emailTemplate = buildEmailTemplate(30);

		when(permissionService.hasAnyScopedPermission(eq(77), eq("CAMPAIGN"), eq(8), any(String[].class), any(String[].class))).thenReturn(true);
		when(applicationsRepository.findOne(1, false)).thenReturn(application);
		when(userRepository.findOne(12, false)).thenReturn(decisionUser);
		when(applicationProgressRepository.findOne(10, false)).thenReturn(progress);
		when(decisionRepository.save(any(Decision.class))).thenAnswer(invocation -> {
			Decision decision = invocation.getArgument(0);
			decision.setId(50);
			return decision;
		});
		when(decisionRepository.findByApplicationId(1, false)).thenAnswer(invocation -> List.of(buildDecision(
				50,
				application,
				decisionUser,
				stage,
				progress,
				false,
				DecisionType.PRE_SCREEN_ACCEPTED.getValue(),
				"STANDARD")));
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(emailTemplateBusiness.findDefaultByActionTypeOrKey(anyString(), anyString())).thenReturn(emailTemplate);
		when(emailTemplateBusiness.renderSubjectTemplate(eq(emailTemplate), any())).thenReturn("Decision de preselection");
		when(emailTemplateBusiness.renderBodyTemplate(eq(emailTemplate), any())).thenReturn("Contenu email");
		when(paramsUtils.getSmtpLogin()).thenReturn("noreply@synelia.test");
		when(paramsUtils.getUrlAppl()).thenReturn("https://app.synelia.test");
		Response<Object> emailResponse = new Response<>();
		emailResponse.setHasError(false);
		when(hostingUtils.sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), any(MailLogContext.class)))
				.thenReturn(emailResponse);

		DecisionDto dto = new DecisionDto();
		dto.setApplicationId(1);
		dto.setUserId(12);
		dto.setApplicationProgressId(10);
		dto.setDecisionType(DecisionType.PRE_SCREEN_ACCEPTED.getValue());
		dto.setDecisionMode("STANDARD");
		dto.setSendDecisionEmail(true);

		Response<DecisionDto> response = decisionBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		ArgumentCaptor<MailLogContext> contextCaptor = ArgumentCaptor.forClass(MailLogContext.class);
		verify(hostingUtils).sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), contextCaptor.capture());
		MailLogContext mailLogContext = contextCaptor.getValue();
		assertThat(mailLogContext.getApplicationId()).isEqualTo(1);
		assertThat(mailLogContext.getApplicationProgressId()).isEqualTo(10);
		assertThat(mailLogContext.getDecisionId()).isEqualTo(50);
		assertThat(mailLogContext.getEventCode()).isEqualTo("PRE_SCREEN_DECISION_EMAIL");
		assertThat(mailLogContext.getRequiresConfirmation()).isFalse();
		ArgumentCaptor<String> actionCaptor = ArgumentCaptor.forClass(String.class);
		verify(auditEventService).recordEvent(eq(1), eq(10), eq("DECISION"), eq("50"), actionCaptor.capture(), eq(77), isNull(), isNull(), anyString());
		assertThat(actionCaptor.getValue()).isEqualTo("DECISION_CREATED");
		verify(applicationProgressBusiness).markStageMailSent(1, 100, 12);
	}

	@Test
	void create_recordsCancellationAuditEventWithJustification() throws Exception {
		Campaigns campaign = buildCampaign(8);
		Applications application = buildApplication(1, campaign);
		PipelineStage stage = buildPipelineStage(100, "PRESELECTION");
		ApplicationProgress progress = buildApplicationProgress(10, application, stage);
		User decisionUser = buildUser(12);
		Decision targetDecision = buildDecision(90, application, decisionUser, stage, progress, false, DecisionType.PRE_SCREEN_ACCEPTED.getValue(), "STANDARD");

		when(permissionService.hasAnyScopedPermission(eq(77), eq("CAMPAIGN"), eq(8), any(String[].class), any(String[].class))).thenReturn(true);
		when(applicationsRepository.findOne(1, false)).thenReturn(application);
		when(userRepository.findOne(12, false)).thenReturn(decisionUser);
		when(applicationProgressRepository.findOne(10, false)).thenReturn(progress);
		when(decisionRepository.findOne(90, false)).thenReturn(targetDecision);
		when(decisionRepository.save(any(Decision.class))).thenAnswer(invocation -> {
			Decision decision = invocation.getArgument(0);
			decision.setId(91);
			return decision;
		});
		when(decisionRepository.findByApplicationId(1, false)).thenReturn(List.of(targetDecision));
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));

		DecisionDto dto = new DecisionDto();
		dto.setApplicationId(1);
		dto.setUserId(12);
		dto.setApplicationProgressId(10);
		dto.setDecisionType(DecisionType.PRE_SCREEN_ACCEPTED.getValue());
		dto.setDecisionMode("CANCEL");
		dto.setCancelsDecisionId(90);
		dto.setJustification("Decision candidate invalidee");

		Response<DecisionDto> response = decisionBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		verify(auditEventService).recordEvent(eq(1), eq(10), eq("DECISION"), eq("91"), eq("DECISION_CANCELLED"), eq(77), eq("Decision candidate invalidee"), isNull(), anyString());
		verify(applicationProgressBusiness).rollbackStage(1, 100, 12, "Decision candidate invalidee", Locale.FRENCH);
	}

	private Request<DecisionDto> buildRequest(Integer userId, DecisionDto dto) {
		Request<DecisionDto> request = new Request<>();
		request.setUser(userId);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));
		return request;
	}

	private Status buildStatus(String code, String message) {
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		return status;
	}

	private Campaigns buildCampaign(Integer id) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		campaign.setCampaignTitle("Campagne " + id);
		campaign.setIsDeleted(false);
		return campaign;
	}

	private Applications buildApplication(Integer id, Campaigns campaign) {
		SourceToken sourceToken = new SourceToken();
		sourceToken.setCampaigns(campaign);

		Applications application = new Applications();
		application.setId(id);
		application.setIsDeleted(false);
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");
		application.setCandidateEmail("ada.lovelace@example.test");
		application.setSourceToken(sourceToken);
		return application;
	}

	private PipelineStage buildPipelineStage(Integer id, String stageType) {
		PipelineStage stage = new PipelineStage();
		stage.setId(id);
		stage.setStageType(stageType);
		return stage;
	}

	private ApplicationProgress buildApplicationProgress(Integer id, Applications application, PipelineStage stage) {
		ApplicationProgress progress = new ApplicationProgress();
		progress.setId(id);
		progress.setApplications(application);
		progress.setPipelineStage(stage);
		progress.setMailSent(false);
		return progress;
	}

	private EmailTemplate buildEmailTemplate(Integer id) {
		EmailTemplate emailTemplate = new EmailTemplate();
		emailTemplate.setId(id);
		emailTemplate.setIsActive(true);
		emailTemplate.setIsDeleted(false);
		return emailTemplate;
	}

	private User buildUser(Integer id) {
		User user = new User();
		user.setId(id);
		return user;
	}

	private Decision buildDecision(
			Integer id,
			Applications application,
			User user,
			PipelineStage stage,
			ApplicationProgress progress,
			boolean isCancel,
			String decisionType,
			String decisionMode) {
		Decision decision = new Decision();
		decision.setId(id);
		decision.setUser(user);
		decision.setApplicationProgress(progress);
		decision.setDecisionType(decisionType);
		decision.setDecisionMode(decisionMode);
		decision.setIsDeleted(false);
		decision.setCreatedAt(new Date());
		return decision;
	}
}