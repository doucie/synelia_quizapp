package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.dao.repository.PipelineTemplateRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.PipelineStageDto;
import tech.synelia.quizapp.utils.enums.StageType;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class PipelineStageBusinessTest {

	@Mock
	private PipelineStageRepository pipelineStageRepository;
	@Mock
	private PipelineTemplateRepository pipelineTemplateRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private PipelineStageBusiness pipelineStageBusiness;

	@Test
	void create_rejectsUnknownStageType() {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		when(functionalError.REQUEST_FAIL(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_REQUEST_FAIL", invocation.getArgument(0)));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setPipelineTemplateId(11);
		dto.setStageType("EVALUATION");
		dto.setStageLabel("Evaluation legacy");
		dto.setStageOrder(3);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.create(buildRequest(77, dto, false), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("EVALUATION");
		verify(pipelineStageRepository, never()).saveAll(any());
	}

	@Test
	void update_rejectsChangingAnotherStageToUnknownType() {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.INTERVIEW.getValue(), "Entretien");

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);
		when(functionalError.REQUEST_FAIL(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_REQUEST_FAIL", invocation.getArgument(0)));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageType("EVALUATION");

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.update(buildRequest(77, dto, false), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("EVALUATION");
		verify(pipelineStageRepository, never()).saveAll(any());
	}

	@Test
	void update_preservesStageTypeWhenOnlyLabelChanges() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.INTERVIEW.getValue(), "Entretien");

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);
		when(pipelineStageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageLabel("Entretien archive");

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, true), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(existingStage.getStageType()).isEqualTo(StageType.INTERVIEW.getValue());
		assertThat(existingStage.getStageLabel()).isEqualTo("Entretien archive");
		verify(pipelineStageRepository).saveAll(any());
	}

	@Test
	void update_rejectsRetypingBoundaryStage() {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.CANDIDATURE.getValue(), "Candidature");

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);
		when(functionalError.DISALLOWED_OPERATION(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED_OPERATION", invocation.getArgument(0)));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageType(StageType.INTERVIEW.getValue());

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.update(buildRequest(77, dto, false), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("bornes fixes");
		verify(pipelineStageRepository, never()).saveAll(any());
	}

	@Test
	void update_rejectsMovingBoundaryStageFromHeadOrTail() {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(21, template, StageType.CANDIDATURE.getValue(), "Candidature");
		candidature.setStageOrder(1);
		PipelineStage quiz = buildStage(23, template, StageType.QUIZ.getValue(), "Quiz");
		quiz.setStageOrder(2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision");
		decision.setStageOrder(3);

		when(pipelineStageRepository.findOne(21, false)).thenReturn(candidature);
		when(pipelineStageRepository.findOne(22, false)).thenReturn(decision);
		when(pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(11))
				.thenReturn(List.of(candidature, quiz, decision));
		when(functionalError.DISALLOWED_OPERATION(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED_OPERATION", invocation.getArgument(0)));

		PipelineStageDto candidatureDto = new PipelineStageDto();
		candidatureDto.setId(21);
		candidatureDto.setStageOrder(3);

		InvalidEntityException headException = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.update(buildRequest(77, candidatureDto, false), Locale.FRENCH));
		assertThat(headException.getStatus().getMessage()).contains("tête");

		PipelineStageDto decisionDto = new PipelineStageDto();
		decisionDto.setId(22);
		decisionDto.setStageOrder(2);

		InvalidEntityException tailException = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.update(buildRequest(77, decisionDto, false), Locale.FRENCH));
		assertThat(tailException.getStatus().getMessage()).contains("queue");

		verify(pipelineStageRepository, never()).saveAll(any());
	}

	@Test
	void update_allowsBoundaryStageToMoveToTailWhenStagesAreCreatedInParallel() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(21, template, StageType.CANDIDATURE.getValue(), "Candidature");
		candidature.setStageOrder(1);
		PipelineStage quiz = buildStage(23, template, StageType.QUIZ.getValue(), "Quiz");
		quiz.setStageOrder(2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision");
		decision.setStageOrder(3);

		when(pipelineStageRepository.findOne(22, false)).thenReturn(decision);
		when(pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(11))
				.thenReturn(List.of(candidature, quiz, decision));
		when(pipelineStageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineStageDto decisionDto = new PipelineStageDto();
		decisionDto.setId(22);
		decisionDto.setStageOrder(4);

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, decisionDto, true), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(decision.getStageOrder()).isEqualTo(4);
		verify(pipelineStageRepository).saveAll(any());
	}

	@Test
	void create_allowsMultipleOccurrencesOfIntermediateStageTypes() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		when(pipelineStageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		Request<PipelineStageDto> request = new Request<>();
		request.setUser(77);
		request.setIsSimpleLoading(true);

		List<PipelineStageDto> dtos = new ArrayList<>();
		int order = 1;
		for (String[] spec : new String[][] {
				{StageType.QUIZ.getValue(), "Quiz round 1"},
				{StageType.QUIZ.getValue(), "Quiz round 2"},
				{StageType.PRESELECTION.getValue(), "Présélection round 1"},
				{StageType.PRESELECTION.getValue(), "Présélection round 2"},
				{StageType.INTERVIEW.getValue(), "Entretien round 1"},
				{StageType.INTERVIEW.getValue(), "Entretien round 2"}
		}) {
			PipelineStageDto dto = new PipelineStageDto();
			dto.setPipelineTemplateId(11);
			dto.setStageType(spec[0]);
			dto.setStageLabel(spec[1]);
			dto.setStageOrder(order++);
			dtos.add(dto);
		}
		request.setDatas(dtos);

		Response<PipelineStageDto> response = pipelineStageBusiness.create(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(6);
		verify(pipelineStageRepository).saveAll(any());
	}

	@Test
	void update_allowsRetypingStageToAnAlreadyUsedIntermediateType() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.PRESELECTION.getValue(), "Présélection");

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);
		when(pipelineStageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageType(StageType.QUIZ.getValue());

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, true), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existingStage.getStageType()).isEqualTo(StageType.QUIZ.getValue());
		verify(pipelineStageRepository, never()).findByPipelineTemplateIdOrderByStageOrder(any());
	}

	private Request<PipelineStageDto> buildRequest(Integer userId, PipelineStageDto dto, boolean simpleLoading) {
		Request<PipelineStageDto> request = new Request<>();
		request.setUser(userId);
		request.setIsSimpleLoading(simpleLoading);
		request.setDatas(List.of(dto));
		return request;
	}

	private PipelineTemplate buildTemplate(Integer id, boolean locked) {
		PipelineTemplate template = new PipelineTemplate();
		template.setId(id);
		template.setIsLocked(locked);
		template.setIsDeleted(false);
		return template;
	}

	private PipelineStage buildStage(Integer id, PipelineTemplate template, String stageType, String label) {
		PipelineStage stage = new PipelineStage();
		stage.setId(id);
		stage.setPipelineTemplate(template);
		stage.setStageType(stageType);
		stage.setStageLabel(label);
		stage.setStageOrder(3);
		stage.setIsRequired(true);
		stage.setIsEliminatory(false);
		stage.setIsDeleted(false);
		return stage;
	}

	private Status buildStatus(String code, String message) {
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		return status;
	}
}