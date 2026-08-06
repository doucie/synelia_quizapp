package tech.synelia.quizapp.business;

import java.util.Date;
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

import tech.synelia.quizapp.dao.entity.ApplicationProgress;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.CandidateInterviewRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.EvaluationsRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.InterviewsDto;
import tech.synelia.quizapp.utils.enums.InterviewStatus;
import tech.synelia.quizapp.utils.enums.InterviewType;

@ExtendWith(MockitoExtension.class)
class InterviewsBusinessTest {

	@Mock
	private InterviewsRepository interviewsRepository;
	@Mock
	private CandidateInterviewRepository candidateInterviewRepository;
	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private EvaluationsRepository evaluationsRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private EntityPermissionRepository entityPermissionRepository;
	@Mock
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Mock
	private PermissionService permissionService;
	@Mock
	private AuditEventService auditEventService;

	@InjectMocks
	private InterviewsBusiness interviewsBusiness;

	@Test
	void create_recordsInterviewAuditEventOnCreate() throws Exception {
		Campaigns campaign = buildCampaign(8);
		Applications application = buildApplication(1);
		ApplicationProgress progress = buildApplicationProgress(45, 300, 3);
		progress.setApplications(application);

		when(campaignsRepository.findOne(8, false)).thenReturn(campaign);
		when(applicationsRepository.findOne(1, false)).thenReturn(application);
		when(permissionService.hasAnyScopedPermission(eq(77), eq("CAMPAIGN"), eq(8), any(String[].class), any(String[].class))).thenReturn(true);
		when(applicationProgressBusiness.resolveProgressByStageType(1, "INTERVIEW")).thenReturn(progress);
		when(interviewsRepository.saveAll(any())).thenAnswer(invocation -> {
			@SuppressWarnings("unchecked")
			List<Interviews> interviews = invocation.getArgument(0);
			interviews.get(0).setId(800);
			return interviews;
		});
		when(candidateInterviewRepository.findByInterviewId(800, false)).thenReturn(List.of());
		when(candidateInterviewRepository.save(any(CandidateInterview.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(interviewsRepository.findByApplicationProgressId(45, false)).thenAnswer(invocation -> {
			Interviews savedInterview = new Interviews();
			savedInterview.setId(800);
			savedInterview.setApplicationProgress(progress);
			savedInterview.setInterviewStatus(InterviewStatus.SCHEDULED.getValue());
			savedInterview.setInterviewType(InterviewType.ONLINE.getValue());
			return List.of(savedInterview);
		});
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));

		InterviewsDto dto = new InterviewsDto();
		dto.setCampaignId(8);
		dto.setApplicationId(1);
		dto.setInterviewDate("31/05/2026 10:00");
		dto.setInterviewType(InterviewType.ONLINE.getValue());
		dto.setInterviewStatus(InterviewStatus.SCHEDULED.getValue());

		Response<InterviewsDto> response = interviewsBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		verify(auditEventService).recordEvent(eq(1), eq(45), eq("INTERVIEW"), eq("800"), eq("INTERVIEW_CREATED"), eq(77), isNull(), isNull(), anyString());
	}

	@Test
	void finishInterview_recordsInterviewAuditEventOnFinish() throws Exception {
		Campaigns campaign = buildCampaign(8);
		Applications application = buildApplication(1);
		ApplicationProgress progress = buildApplicationProgress(45, 300, 3);
		SourceToken sourceToken = new SourceToken();
		sourceToken.setCampaigns(campaign);
		application.setSourceToken(sourceToken);
		progress.setApplications(application);

		Interviews interview = new Interviews();
		interview.setId(55);
		interview.setApplicationProgress(progress);
		interview.setInterviewStatus(InterviewStatus.STARTED.getValue());
		interview.setInterviewType(InterviewType.ONLINE.getValue());
		interview.setInterviewDate(new Date());

		when(interviewsRepository.findOne(55, false)).thenReturn(interview);
		when(permissionService.hasAnyScopedPermission(eq(77), eq("CAMPAIGN"), eq(8), any(String[].class), any(String[].class))).thenReturn(true);
		when(evaluationsRepository.sumMarksByInterviewId(55)).thenReturn(180d);
		when(evaluationsRepository.countByInterviewId(55)).thenReturn(2L);
		when(evaluationsRepository.sumMarksByApplicationId(1)).thenReturn(180d);
		when(evaluationsRepository.countByApplicationId(1)).thenReturn(2L);
		when(interviewsRepository.save(any(Interviews.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(applicationProgressBusiness.resolveCurrentInterviewByApplicationId(1)).thenReturn(interview);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 8)).thenReturn(List.of());

		InterviewsDto dto = new InterviewsDto();
		dto.setId(55);

		Response<InterviewsDto> response = interviewsBusiness.finishInterview(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		ArgumentCaptor<String> beforeStateCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<String> afterStateCaptor = ArgumentCaptor.forClass(String.class);
		verify(auditEventService).recordEvent(eq(1), eq(45), eq("INTERVIEW"), eq("55"), eq("INTERVIEW_FINISHED"), eq(77), isNull(), beforeStateCaptor.capture(), afterStateCaptor.capture());
		assertThat(beforeStateCaptor.getValue()).contains("STARTED");
		assertThat(afterStateCaptor.getValue()).contains("OVER");
	}

	private Request<InterviewsDto> buildRequest(Integer userId, InterviewsDto dto) {
		Request<InterviewsDto> request = new Request<>();
		request.setUser(userId);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));
		return request;
	}

	private Campaigns buildCampaign(Integer id) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		campaign.setCampaignTitle("Campagne " + id);
		campaign.setIsDeleted(false);
		return campaign;
	}

	private Applications buildApplication(Integer id) {
		Applications application = new Applications();
		application.setId(id);
		application.setIsDeleted(false);
		return application;
	}

	private ApplicationProgress buildApplicationProgress(Integer id, Integer stageId, Integer stageOrder) {
		PipelineStage stage = new PipelineStage();
		stage.setId(stageId);
		stage.setStageOrder(stageOrder);

		ApplicationProgress progress = new ApplicationProgress();
		progress.setId(id);
		progress.setPipelineStage(stage);
		return progress;
	}
}