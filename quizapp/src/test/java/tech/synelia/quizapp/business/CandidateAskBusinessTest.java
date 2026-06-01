package tech.synelia.quizapp.business;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Locale;

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
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.CandidateAsk;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CandidateAskRepository;
import tech.synelia.quizapp.utils.HostingUtils;
import tech.synelia.quizapp.utils.ParamsUtils;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.CandidateAskStatus;
import tech.synelia.quizapp.utils.enums.EmailActionType;

@ExtendWith(MockitoExtension.class)
class CandidateAskBusinessTest {

	@Mock
	private ApplicationProgressRepository applicationProgressRepository;
	@Mock
	private CandidateAskRepository candidateAskRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
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

	@InjectMocks
	private CandidateAskBusiness candidateAskBusiness;

	@Test
	void sendCandidateAskResultEmail_logsMailWithCurrentProgressContext() throws Exception {
		Applications application = new Applications();
		application.setId(12);
		application.setCandidateEmail("ada.lovelace@example.test");
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");

		CandidateAsk candidateAsk = new CandidateAsk();
		candidateAsk.setId(91);
		candidateAsk.setRequestType("EMAIL");
		candidateAsk.setAskStatus(CandidateAskStatus.APPROVED.getValue());
		candidateAsk.setDecisionReason("Validation email");

		EmailTemplate emailTemplate = new EmailTemplate();
		emailTemplate.setId(501);
		emailTemplate.setIsActive(true);
		emailTemplate.setIsDeleted(false);

		PipelineStage stage = new PipelineStage();
		stage.setId(700);
		ApplicationProgress currentProgress = new ApplicationProgress();
		currentProgress.setId(33);
		currentProgress.setPipelineStage(stage);

		Response<Object> emailResponse = new Response<>();
		emailResponse.setHasError(false);

		when(emailTemplateBusiness.findDefaultByActionTypeOrKey(
				eq(EmailActionType.CANDIDATE_ASK_RESULT.name()),
				eq(EmailActionType.CANDIDATE_ASK_RESULT.getTemplateKey())))
				.thenReturn(emailTemplate);
		when(paramsUtils.getSmtpLogin()).thenReturn("noreply@synelia.test");
		when(paramsUtils.getUrlAppl()).thenReturn("https://app.synelia.test");
		when(emailTemplateBusiness.renderSubjectTemplate(eq(emailTemplate), any())).thenReturn("Resultat demande");
		when(emailTemplateBusiness.renderBodyTemplate(eq(emailTemplate), any())).thenReturn("Contenu");
		when(applicationProgressRepository.findCurrentStage(12)).thenReturn(currentProgress);
		when(hostingUtils.sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), any(MailLogContext.class)))
				.thenReturn(emailResponse);

		Method method = CandidateAskBusiness.class.getDeclaredMethod("sendCandidateAskResultEmail", Applications.class, CandidateAsk.class, Locale.class);
		method.setAccessible(true);
		method.invoke(candidateAskBusiness, application, candidateAsk, Locale.FRENCH);

		ArgumentCaptor<MailLogContext> mailLogCaptor = ArgumentCaptor.forClass(MailLogContext.class);
		verify(hostingUtils).sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), mailLogCaptor.capture());
		MailLogContext mailLogContext = mailLogCaptor.getValue();
		assertThat(mailLogContext.getApplicationId()).isEqualTo(12);
		assertThat(mailLogContext.getApplicationProgressId()).isEqualTo(33);
		assertThat(mailLogContext.getEventCode()).isEqualTo("CANDIDATE_ASK_RESULT_EMAIL");
		assertThat(mailLogContext.getRequiresConfirmation()).isFalse();
	}

	@Test
	void custom_reject_recordsAuditEventWithDecisionReason() throws Exception {
		Applications application = new Applications();
		application.setId(12);
		application.setCandidateEmail("ada.lovelace@example.test");
		application.setCandidateFirstName("Ada");
		application.setCandidateLastName("Lovelace");

		CandidateAsk applicationLink = new CandidateAsk();
		applicationLink.setId(91);
		applicationLink.setAskStatus(CandidateAskStatus.PENDING.getValue());
		applicationLink.setRequestType("EMAIL");
		applicationLink.setApplications(application);
		applicationLink.setNewEmail("nouvelle.adresse@example.test");

		EmailTemplate emailTemplate = new EmailTemplate();
		emailTemplate.setId(501);
		emailTemplate.setIsActive(true);
		emailTemplate.setIsDeleted(false);

		PipelineStage stage = new PipelineStage();
		stage.setId(700);
		ApplicationProgress currentProgress = new ApplicationProgress();
		currentProgress.setId(33);
		currentProgress.setPipelineStage(stage);

		Response<Object> emailResponse = new Response<>();
		emailResponse.setHasError(false);

		when(candidateAskRepository.findOne(91, false)).thenReturn(applicationLink);
		when(applicationsRepository.findOne(12, false)).thenReturn(application);
		when(candidateAskRepository.save(any(CandidateAsk.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(emailTemplateBusiness.findDefaultByActionTypeOrKey(
				eq(EmailActionType.CANDIDATE_ASK_RESULT.name()),
				eq(EmailActionType.CANDIDATE_ASK_RESULT.getTemplateKey())))
				.thenReturn(emailTemplate);
		when(paramsUtils.getSmtpLogin()).thenReturn("noreply@synelia.test");
		when(paramsUtils.getUrlAppl()).thenReturn("https://app.synelia.test");
		when(emailTemplateBusiness.renderSubjectTemplate(eq(emailTemplate), any())).thenReturn("Resultat demande");
		when(emailTemplateBusiness.renderBodyTemplate(eq(emailTemplate), any())).thenReturn("Contenu");
		when(applicationProgressRepository.findCurrentStage(12)).thenReturn(currentProgress);
		when(hostingUtils.sendEmail(any(), any(), anyString(), anyString(), isNull(), any(Context.class), eq("blank"), eq(Locale.FRENCH), any(MailLogContext.class)))
				.thenReturn(emailResponse);

		Request<tech.synelia.quizapp.utils.dto.CandidateAskDto> request = new Request<>();
		request.setUser(77);
		request.setIsSimpleLoading(true);
		tech.synelia.quizapp.utils.dto.CandidateAskDto dto = new tech.synelia.quizapp.utils.dto.CandidateAskDto();
		dto.setId(91);
		dto.setAction("REJECT");
		dto.setDecisionReason("Piece insuffisante");
		request.setDatas(List.of(dto));

		Response<tech.synelia.quizapp.utils.dto.CandidateAskDto> response = candidateAskBusiness.custom(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		ArgumentCaptor<String> beforeStateCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<String> afterStateCaptor = ArgumentCaptor.forClass(String.class);
		verify(auditEventService).recordEvent(eq(12), eq(33), eq("CANDIDATE_ASK"), eq("91"), eq("CANDIDATE_ASK_REJECTED"), eq(77), eq("Piece insuffisante"), beforeStateCaptor.capture(), afterStateCaptor.capture());
		assertThat(beforeStateCaptor.getValue()).contains("PENDING");
		assertThat(afterStateCaptor.getValue()).contains("REJECTED");
		assertThat(afterStateCaptor.getValue()).contains("Piece insuffisante");
	}
}