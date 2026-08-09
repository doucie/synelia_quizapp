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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.ApplicationProgress;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.EvaluationItem;
import tech.synelia.quizapp.dao.entity.Evaluations;
import tech.synelia.quizapp.dao.entity.InterviewParticipant;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineStageEvaluationCriterion;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CandidateInterviewRepository;
import tech.synelia.quizapp.dao.repository.EvaluationItemRepository;
import tech.synelia.quizapp.dao.repository.EvaluationsRepository;
import tech.synelia.quizapp.dao.repository.InterviewParticipantRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageEvaluationCriterionRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EvaluationItemDto;
import tech.synelia.quizapp.utils.dto.EvaluationsDto;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class EvaluationsBusinessTest {

	@Mock
	private EvaluationsRepository evaluationsRepository;
	@Mock
	private CandidateInterviewRepository candidateInterviewRepository;
	@Mock
	private ApplicationProgressRepository applicationProgressRepository;
	@Mock
	private InterviewParticipantRepository interviewParticipantRepository;
	@Mock
	private EvaluationItemRepository evaluationItemRepository;
	@Mock
	private PipelineStageEvaluationCriterionRepository pipelineStageEvaluationCriterionRepository;
	@Mock
	private InterviewsRepository interviewsRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Mock
	private PermissionService permissionService;
	@Mock
	private AuditEventService auditEventService;
	@Mock
	private FunctionalError functionalError;

	@InjectMocks
	private EvaluationsBusiness evaluationsBusiness;

	@Test
	void create_attachesActorInterviewParticipantAndSyncsParticipantTracking() throws Exception {
		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews interview = candidateInterview.getInterviews();
		Applications application = interview.getApplicationProgress() != null ? interview.getApplicationProgress().getApplications() : null;

		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(interview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(interviewParticipantRepository.findOne(41, false)).thenReturn(interviewParticipant);
		when(interviewParticipantRepository.save(any(InterviewParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationsRepository.saveAll(any())).thenAnswer(invocation -> assignEvaluationIds(invocation.getArgument(0), 900));
		when(evaluationsRepository.sumMarksByInterviewId(17)).thenReturn(82d);
		when(evaluationsRepository.countByInterviewId(17)).thenReturn(1L);
		when(evaluationsRepository.sumMarksByApplicationId(9)).thenReturn(82d);
		when(evaluationsRepository.countByApplicationId(9)).thenReturn(1L);
		when(evaluationsRepository.countByInterviewParticipantId(41)).thenReturn(1L);
		when(evaluationsRepository.findLatestSubmittedAtByInterviewParticipantId(41)).thenReturn(null);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(true);

		EvaluationsDto dto = new EvaluationsDto();
		dto.setCandidateInterviewId(31);
		dto.setGlobalScore(82d);
		dto.setGlobalComment("Bon niveau");

		Response<EvaluationsDto> response = evaluationsBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<Evaluations>> savedCaptor = ArgumentCaptor.forClass(List.class);
		verify(evaluationsRepository).saveAll(savedCaptor.capture());
		Evaluations savedEvaluation = savedCaptor.getValue().get(0);
		assertThat(savedEvaluation.getInterviewParticipant()).isSameAs(interviewParticipant);
		assertThat(savedEvaluation.getEvaluationStatus()).isEqualTo("SUBMITTED");
		assertThat(savedEvaluation.getSubmittedAt()).isNotNull();
		assertThat(savedEvaluation.getGlobalScore()).isEqualTo(82d);
		assertThat(savedEvaluation.getGlobalComment()).isEqualTo("Bon niveau");

		assertThat(interviewParticipant.getEvaluationStatus()).isEqualTo("SUBMITTED");
		assertThat(interviewParticipant.getEvaluationSubmittedAt()).isNotNull();
		verify(interviewParticipantRepository).save(interviewParticipant);
		verify(auditEventService).recordEvent(eq(9), eq(45), eq("EVALUATION"), eq("900"), eq("EVALUATION_CREATED"), eq(77), isNull(), isNull(), anyString());
	}

	@Test
	void create_rejectsGlobalScoreOutsideZeroToHundred() throws Exception {
		Status failureStatus = new Status();
		failureStatus.setCode("902");
		failureStatus.setMessage("globalScore must be between 0 and 100");
		when(functionalError.DATA_NOT_EXIST(anyString(), any(Locale.class))).thenReturn(failureStatus);

		EvaluationsDto dto = new EvaluationsDto();
		dto.setCandidateInterviewId(31);
		dto.setGlobalScore(82d);
		dto.setGlobalComment("Bon niveau");
		dto.setGlobalScore(150d);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> evaluationsBusiness.create(buildRequest(77, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("globalScore must be between 0 and 100");
		verifyNoInteractions(evaluationsRepository);
	}

	@Test
	void update_rejectsGlobalScoreOutsideZeroToHundred() throws Exception {
		Status failureStatus = new Status();
		failureStatus.setCode("902");
		failureStatus.setMessage("globalScore must be between 0 and 100");
		when(functionalError.DATA_NOT_EXIST(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews interview = candidateInterview.getInterviews();

		Evaluations existingEvaluation = new Evaluations();
		existingEvaluation.setId(701);
		existingEvaluation.setCandidateInterview(candidateInterview);
		existingEvaluation.setGlobalScore(82d);
		existingEvaluation.setGlobalComment("Commentaire initial");
		existingEvaluation.setIsDeleted(false);

		when(evaluationsRepository.findOne(701, false)).thenReturn(existingEvaluation);
		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(interview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(false);

		EvaluationsDto dto = new EvaluationsDto();
		dto.setId(701);
		dto.setGlobalScore(150d);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> evaluationsBusiness.update(buildRequest(77, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("globalScore must be between 0 and 100");
		verify(evaluationsRepository, never()).saveAll(any());
	}

	@Test
	void create_resyncsApplicationCurrentInterviewMirrorFromCurrentOccurrence() throws Exception {
		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews evaluatedInterview = candidateInterview.getInterviews();
		Applications application = evaluatedInterview.getApplicationProgress() != null ? evaluatedInterview.getApplicationProgress().getApplications() : null;

		Interviews currentInterview = new Interviews();
		currentInterview.setId(18);
		currentInterview.setInterviewStatus("SCHEDULED");
		currentInterview.setInterviewDate(new Date(evaluatedInterview.getInterviewDate().getTime() + 3_600_000L));

		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(evaluatedInterview);
		when(applicationProgressBusiness.resolveCurrentInterviewByApplicationId(9)).thenReturn(currentInterview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(interviewParticipantRepository.findOne(41, false)).thenReturn(interviewParticipant);
		when(interviewParticipantRepository.save(any(InterviewParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationsRepository.saveAll(any())).thenAnswer(invocation -> assignEvaluationIds(invocation.getArgument(0), 990));
		when(evaluationsRepository.sumMarksByInterviewId(17)).thenReturn(82d);
		when(evaluationsRepository.countByInterviewId(17)).thenReturn(1L);
		when(evaluationsRepository.sumMarksByInterviewId(18)).thenReturn(91d);
		when(evaluationsRepository.countByInterviewId(18)).thenReturn(1L);
		when(evaluationsRepository.sumMarksByApplicationId(9)).thenReturn(173d);
		when(evaluationsRepository.countByApplicationId(9)).thenReturn(2L);
		when(evaluationsRepository.countByInterviewParticipantId(41)).thenReturn(1L);
		when(evaluationsRepository.findLatestSubmittedAtByInterviewParticipantId(41)).thenReturn(null);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(true);

		EvaluationsDto dto = new EvaluationsDto();
		dto.setCandidateInterviewId(31);
		dto.setGlobalScore(82d);
		dto.setGlobalComment("Bon niveau");

		evaluationsBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		ArgumentCaptor<Applications> applicationCaptor = ArgumentCaptor.forClass(Applications.class);
		verify(applicationsRepository).save(applicationCaptor.capture());
		Applications savedApplication = applicationCaptor.getValue();
		assertThat(savedApplication.getAggregatedEvaluationScore()).isEqualTo(173d);
		assertThat(savedApplication.getAggregatedEvaluationScorePercent()).isEqualTo(86.5d);
		assertThat(savedApplication.getCurrentInterviewEvaluationScore()).isEqualTo(91);
		assertThat(savedApplication.getCurrentInterviewEvaluationNumber()).isEqualTo(1);
		assertThat(savedApplication.getCurrentInterviewEvaluationPercentage()).isEqualTo(91d);
	}

	@Test
	void create_persistsEvaluationItemsWithCriterionSnapshots() throws Exception {
		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews interview = candidateInterview.getInterviews();
		Applications application = interview.getApplicationProgress() != null ? interview.getApplicationProgress().getApplications() : null;
		PipelineStageEvaluationCriterion criterion = buildCriterion(501, 300, 1, "Communication", "SCORE", 5d, 2d);

		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(interview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(interviewParticipantRepository.findOne(41, false)).thenReturn(interviewParticipant);
		when(interviewParticipantRepository.save(any(InterviewParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationsRepository.saveAll(any())).thenAnswer(invocation -> assignEvaluationIds(invocation.getArgument(0), 950));
		when(evaluationItemRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(pipelineStageEvaluationCriterionRepository.findOne(501, false)).thenReturn(criterion);
		when(evaluationsRepository.sumMarksByInterviewId(17)).thenReturn(82d);
		when(evaluationsRepository.countByInterviewId(17)).thenReturn(1L);
		when(evaluationsRepository.sumMarksByApplicationId(9)).thenReturn(82d);
		when(evaluationsRepository.countByApplicationId(9)).thenReturn(1L);
		when(evaluationsRepository.countByInterviewParticipantId(41)).thenReturn(1L);
		when(evaluationsRepository.findLatestSubmittedAtByInterviewParticipantId(41)).thenReturn(null);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(false);

		EvaluationItemDto itemDto = new EvaluationItemDto();
		itemDto.setPipelineStageEvaluationCriterionId(501);
		itemDto.setScoreValue(4.5d);
		itemDto.setTextValue("Bonne communication");

		EvaluationsDto dto = new EvaluationsDto();
		dto.setCandidateInterviewId(31);
		dto.setGlobalScore(82d);
		dto.setGlobalComment("Bon niveau");
		dto.setEvaluationItems(List.of(itemDto));

		evaluationsBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<EvaluationItem>> savedItemsCaptor = ArgumentCaptor.forClass(List.class);
		verify(evaluationItemRepository).saveAll(savedItemsCaptor.capture());
		EvaluationItem savedItem = savedItemsCaptor.getValue().get(0);
		assertThat(savedItem.getEvaluation()).isNotNull();
		assertThat(savedItem.getPipelineStageEvaluationCriterion()).isSameAs(criterion);
		assertThat(savedItem.getScoreValue()).isEqualTo(4.5d);
		assertThat(savedItem.getTextValue()).isEqualTo("Bonne communication");
		assertThat(savedItem.getWeightSnapshot()).isEqualTo(2d);
		assertThat(savedItem.getMaxScoreSnapshot()).isEqualTo(5d);

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<Evaluations>> savedCaptor = ArgumentCaptor.forClass(List.class);
		verify(evaluationsRepository).saveAll(savedCaptor.capture());
		assertThat(savedCaptor.getValue().get(0).getGlobalScore()).isEqualTo(90d);
	}

	@Test
	void getFullInfos_loadsEvaluationItemsEvenWhenMultipleEvaluationsAreReturned() throws Exception {
		PipelineStageEvaluationCriterion criterion = buildCriterion(501, 300, 1, "Communication", "SCORE", 5d, 2d);
		EvaluationItem item = new EvaluationItem();
		item.setId(801);
		item.setPipelineStageEvaluationCriterion(criterion);
		item.setScoreValue(4.5d);
		item.setTextValue("Bonne communication");
		item.setWeightSnapshot(2d);
		item.setMaxScoreSnapshot(5d);

		when(evaluationItemRepository.findByEvaluationId(950, false)).thenReturn(List.of(item));

		EvaluationsDto dto = new EvaluationsDto();
		dto.setId(950);

		EvaluationsDto fullDto = evaluationsBusiness.getFullInfos(dto, 2, false, Locale.FRENCH);

		assertThat(fullDto.getEvaluationItems()).hasSize(1);
		assertThat(fullDto.getEvaluationItems().get(0).getId()).isEqualTo(801);
		assertThat(fullDto.getEvaluationItems().get(0).getPipelineStageEvaluationCriterionId()).isEqualTo(501);
		assertThat(fullDto.getEvaluationItems().get(0).getCriterionOrder()).isEqualTo(1);
		assertThat(fullDto.getEvaluationItems().get(0).getLabel()).isEqualTo("Communication");
		assertThat(fullDto.getEvaluationItems().get(0).getCriterionType()).isEqualTo("SCORE");
		assertThat(fullDto.getEvaluationItems().get(0).getScoreValue()).isEqualTo(4.5d);
		assertThat(fullDto.getEvaluationItems().get(0).getTextValue()).isEqualTo("Bonne communication");
		assertThat(fullDto.getEvaluationItems().get(0).getWeightSnapshot()).isEqualTo(2d);
		assertThat(fullDto.getEvaluationItems().get(0).getMaxScoreSnapshot()).isEqualTo(5d);
		verify(evaluationItemRepository, times(1)).findByEvaluationId(950, false);
	}

	@Test
	void getCriteria_returnsStageCriteriaForCandidateInterview() throws Exception {
		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews interview = candidateInterview.getInterviews();
		Applications application = interview.getApplicationProgress() != null ? interview.getApplicationProgress().getApplications() : null;
		PipelineStageEvaluationCriterion firstCriterion = buildCriterion(501, 300, 1, "Communication", "SCORE", 5d, 2d);
		PipelineStageEvaluationCriterion secondCriterion = buildCriterion(502, 300, 2, "Technique", "TEXT", null, 1d);

		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(interview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(false);
		when(pipelineStageEvaluationCriterionRepository.findByPipelineStageId(300, false)).thenReturn(List.of(firstCriterion, secondCriterion));

		Request<EvaluationsDto> request = new Request<>();
		request.setUser(77);
		EvaluationsDto dto = new EvaluationsDto();
		dto.setCandidateInterviewId(31);
		request.setData(dto);

		Response<EvaluationsDto> response = evaluationsBusiness.getCriteria(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().get(0).getCandidateInterviewId()).isEqualTo(31);
		assertThat(response.getItems().get(0).getEvaluationItems()).hasSize(2);
		assertThat(response.getItems().get(0).getEvaluationItems().get(0).getPipelineStageEvaluationCriterionId()).isEqualTo(501);
		assertThat(response.getItems().get(0).getEvaluationItems().get(0).getCriterionOrder()).isEqualTo(1);
		assertThat(response.getItems().get(0).getEvaluationItems().get(0).getLabel()).isEqualTo("Communication");
		assertThat(response.getItems().get(0).getEvaluationItems().get(0).getMaxScoreSnapshot()).isEqualTo(5d);
		assertThat(response.getItems().get(0).getEvaluationItems().get(1).getPipelineStageEvaluationCriterionId()).isEqualTo(502);
		assertThat(response.getItems().get(0).getEvaluationItems().get(1).getCriterionType()).isEqualTo("TEXT");
	}

	@Test
	void update_softDeletesEvaluationItemsMissingFromPayload() throws Exception {
		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews interview = candidateInterview.getInterviews();
		Applications application = interview.getApplicationProgress() != null ? interview.getApplicationProgress().getApplications() : null;
		PipelineStageEvaluationCriterion criterion = buildCriterion(501, 300, 1, "Communication", "SCORE", 5d, 2d);

		Evaluations existingEvaluation = new Evaluations();
		existingEvaluation.setId(701);
		existingEvaluation.setCandidateInterview(candidateInterview);
		existingEvaluation.setGlobalScore(82d);
		existingEvaluation.setGlobalComment("Commentaire initial");
		existingEvaluation.setIsDeleted(false);

		EvaluationItem existingItem = new EvaluationItem();
		existingItem.setId(801);
		existingItem.setEvaluation(existingEvaluation);
		existingItem.setPipelineStageEvaluationCriterion(criterion);
		existingItem.setScoreValue(4.5d);
		existingItem.setTextValue("Bonne communication");
		existingItem.setIsDeleted(false);

		when(evaluationsRepository.findOne(701, false)).thenReturn(existingEvaluation);
		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(interview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(evaluationItemRepository.findByEvaluationId(701, false)).thenReturn(List.of(existingItem));
		when(evaluationsRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationItemRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationsRepository.sumMarksByInterviewId(17)).thenReturn(82d);
		when(evaluationsRepository.countByInterviewId(17)).thenReturn(1L);
		when(evaluationsRepository.sumMarksByApplicationId(9)).thenReturn(82d);
		when(evaluationsRepository.countByApplicationId(9)).thenReturn(1L);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(false);

		EvaluationsDto dto = new EvaluationsDto();
		dto.setId(701);
		dto.setEvaluationItems(List.of());

		Response<EvaluationsDto> response = evaluationsBusiness.update(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<EvaluationItem>> savedItemsCaptor = ArgumentCaptor.forClass(List.class);
		verify(evaluationItemRepository).saveAll(savedItemsCaptor.capture());
		assertThat(savedItemsCaptor.getValue()).hasSize(1);
		assertThat(savedItemsCaptor.getValue().get(0).getId()).isEqualTo(801);
		assertThat(savedItemsCaptor.getValue().get(0).getIsDeleted()).isTrue();
	}

	@Test
	void update_derivesCandidateMarkFromWeightedScoreCriteria() throws Exception {
		CandidateInterview candidateInterview = buildCandidateInterview(31, 17, 9, 45, 300);
		InterviewParticipant interviewParticipant = buildInterviewParticipant(41, 17, 77);
		Interviews interview = candidateInterview.getInterviews();
		Applications application = interview.getApplicationProgress() != null ? interview.getApplicationProgress().getApplications() : null;
		PipelineStageEvaluationCriterion firstCriterion = buildCriterion(501, 300, 1, "Communication", "SCORE", 5d, 2d);
		PipelineStageEvaluationCriterion secondCriterion = buildCriterion(502, 300, 2, "Technique", "TEXT_AND_SCORE", 10d, 1d);

		Evaluations existingEvaluation = new Evaluations();
		existingEvaluation.setId(701);
		existingEvaluation.setCandidateInterview(candidateInterview);
		existingEvaluation.setGlobalScore(20d);
		existingEvaluation.setGlobalComment("Commentaire initial");
		existingEvaluation.setIsDeleted(false);

		when(evaluationsRepository.findOne(701, false)).thenReturn(existingEvaluation);
		when(candidateInterviewRepository.findOne(31, false)).thenReturn(candidateInterview);
		when(interviewsRepository.findOne(17, false)).thenReturn(interview);
		when(interviewParticipantRepository.findByInterviewId(17, false)).thenReturn(List.of(interviewParticipant));
		when(pipelineStageEvaluationCriterionRepository.findOne(501, false)).thenReturn(firstCriterion);
		when(pipelineStageEvaluationCriterionRepository.findOne(502, false)).thenReturn(secondCriterion);
		when(evaluationItemRepository.findByEvaluationId(701, false)).thenReturn(List.of());
		when(evaluationsRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationItemRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
		when(evaluationsRepository.sumMarksByInterviewId(17)).thenReturn(70d);
		when(evaluationsRepository.countByInterviewId(17)).thenReturn(1L);
		when(evaluationsRepository.sumMarksByApplicationId(9)).thenReturn(70d);
		when(evaluationsRepository.countByApplicationId(9)).thenReturn(1L);
		when(applicationsRepository.save(any(Applications.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(permissionService.hasAnyEntityPermission(eq(77), eq("INTERVIEW"), eq(17), eq("ADMIN"), eq("EVALUATE")))
				.thenReturn(false);

		EvaluationItemDto firstItem = new EvaluationItemDto();
		firstItem.setPipelineStageEvaluationCriterionId(501);
		firstItem.setCriterionType("SCORE");
		firstItem.setScoreValue(4d);
		firstItem.setMaxScoreSnapshot(5d);
		firstItem.setWeightSnapshot(2d);

		EvaluationItemDto secondItem = new EvaluationItemDto();
		secondItem.setPipelineStageEvaluationCriterionId(502);
		secondItem.setCriterionType("TEXT_AND_SCORE");
		secondItem.setScoreValue(5d);
		secondItem.setMaxScoreSnapshot(10d);
		secondItem.setWeightSnapshot(1d);

		EvaluationsDto dto = new EvaluationsDto();
		dto.setId(701);
		dto.setGlobalComment("Commentaire mis a jour");
		dto.setEvaluationItems(List.of(firstItem, secondItem));

		evaluationsBusiness.update(buildRequest(77, dto), Locale.FRENCH);

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<Evaluations>> savedCaptor = ArgumentCaptor.forClass(List.class);
		verify(evaluationsRepository).saveAll(savedCaptor.capture());
		assertThat(savedCaptor.getValue()).hasSize(1);
		assertThat(savedCaptor.getValue().get(0).getGlobalScore()).isEqualTo(70d);
		assertThat(savedCaptor.getValue().get(0).getGlobalComment()).isEqualTo("Commentaire mis a jour");

		ArgumentCaptor<String> beforeStateCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<String> afterStateCaptor = ArgumentCaptor.forClass(String.class);
		verify(auditEventService).recordEvent(eq(9), eq(45), eq("EVALUATION"), eq("701"), eq("EVALUATION_UPDATED"), eq(77), isNull(), beforeStateCaptor.capture(), afterStateCaptor.capture());
		assertThat(beforeStateCaptor.getValue()).contains("Commentaire initial");
		assertThat(afterStateCaptor.getValue()).contains("Commentaire mis a jour");
		assertThat(afterStateCaptor.getValue()).contains("\"globalScore\":70.0");
	}

	private Request<EvaluationsDto> buildRequest(Integer userId, EvaluationsDto dto) {
		Request<EvaluationsDto> request = new Request<>();
		request.setUser(userId);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));
		return request;
	}

	private CandidateInterview buildCandidateInterview(Integer id, Integer interviewId, Integer applicationId) {
		return buildCandidateInterview(id, interviewId, applicationId, null, null);
	}

	private CandidateInterview buildCandidateInterview(Integer id, Integer interviewId, Integer applicationId, Integer applicationProgressId, Integer pipelineStageId) {
		Interviews interview = new Interviews();
		interview.setId(interviewId);
		interview.setInterviewStatus("CLOSED");
		interview.setInterviewDate(new Date());
		Applications application = new Applications();
		application.setId(applicationId);
		application.setIsDeleted(false);
		if (applicationProgressId != null && pipelineStageId != null) {
			ApplicationProgress applicationProgress = new ApplicationProgress();
			applicationProgress.setId(applicationProgressId);
			applicationProgress.setPipelineStage(buildPipelineStage(pipelineStageId));
			applicationProgress.setApplications(application);
			interview.setApplicationProgress(applicationProgress);
		}

		CandidateInterview candidateInterview = new CandidateInterview();
		candidateInterview.setId(id);
		candidateInterview.setInterviews(interview);
		candidateInterview.setIsDeleted(false);
		return candidateInterview;
	}

	private InterviewParticipant buildInterviewParticipant(Integer id, Integer interviewId, Integer userId) {
		Interviews interview = new Interviews();
		interview.setId(interviewId);

		User user = new User();
		user.setId(userId);

		InterviewParticipant participant = new InterviewParticipant();
		participant.setId(id);
		participant.setInterviews(interview);
		participant.setUser(user);
		participant.setIsDeleted(false);
		return participant;
	}

	private PipelineStage buildPipelineStage(Integer id) {
		PipelineStage pipelineStage = new PipelineStage();
		pipelineStage.setId(id);
		return pipelineStage;
	}

	private PipelineStageEvaluationCriterion buildCriterion(Integer id, Integer pipelineStageId, Integer criterionOrder, String label, String criterionType, Double maxScore, Double weight) {
		PipelineStageEvaluationCriterion criterion = new PipelineStageEvaluationCriterion();
		criterion.setId(id);
		criterion.setPipelineStage(buildPipelineStage(pipelineStageId));
		criterion.setCriterionOrder(criterionOrder);
		criterion.setLabel(label);
		criterion.setCriterionType(criterionType);
		criterion.setMaxScore(maxScore);
		criterion.setWeight(weight);
		criterion.setIsDeleted(false);
		criterion.setIsRequired(true);
		return criterion;
	}

	private List<Evaluations> assignEvaluationIds(List<Evaluations> evaluations, int firstId) {
		int currentId = firstId;
		for (Evaluations evaluation : evaluations) {
			if (evaluation.getId() == null) {
				evaluation.setId(currentId++);
			}
		}
		return evaluations;
	}
}