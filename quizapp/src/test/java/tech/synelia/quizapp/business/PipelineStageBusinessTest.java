package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
	void create_rejectsNewEvaluationTopLevelStage() {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		when(functionalError.DISALLOWED_OPERATION(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED", invocation.getArgument(0)));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setPipelineTemplateId(11);
		dto.setStageType(StageType.EVALUATION.getValue());
		dto.setStageLabel("Evaluation legacy");
		dto.setStageOrder(3);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.create(buildRequest(77, dto, false), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("EVALUATION");
		verify(pipelineStageRepository, never()).saveAll(any());
	}

	@Test
	void update_rejectsChangingAnotherStageToEvaluation() {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.INTERVIEW.getValue(), "Entretien");

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);
		when(functionalError.DISALLOWED_OPERATION(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED", invocation.getArgument(0)));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageType(StageType.EVALUATION.getValue());

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.update(buildRequest(77, dto, false), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("EVALUATION");
		verify(pipelineStageRepository, never()).saveAll(any());
	}

	@Test
	void update_allowsLegacyEvaluationStageToKeepItsType() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.EVALUATION.getValue(), "Evaluation historique");

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);
		when(pipelineStageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageLabel("Evaluation archivee");

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, true), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(existingStage.getStageType()).isEqualTo(StageType.EVALUATION.getValue());
		assertThat(existingStage.getStageLabel()).isEqualTo("Evaluation archivee");
		verify(pipelineStageRepository).saveAll(any());
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