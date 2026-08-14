package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageNotificationRuleRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.dao.repository.PipelineTemplateRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.PipelineStageDto;
import tech.synelia.quizapp.utils.dto.PipelineTemplateDto;
import tech.synelia.quizapp.utils.enums.StageType;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PipelineTemplateBusinessTest {

	@Mock
	private PipelineTemplateRepository pipelineTemplateRepository;
	@Mock
	private PipelineStageRepository pipelineStageRepository;
	@Mock
	private PipelineStageNotificationRuleRepository pipelineStageNotificationRuleRepository;
	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@Captor
	private ArgumentCaptor<List<PipelineTemplate>> itemsCaptor;

	@InjectMocks
	private PipelineTemplateBusiness pipelineTemplateBusiness;

	@BeforeEach
	void setUp() {
		when(functionalError.DISALLOWED_OPERATION(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED_OPERATION", invocation.getArgument(0)));
		when(functionalError.FIELD_EMPTY(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_FIELD_EMPTY", invocation.getArgument(0)));
		when(functionalError.DATA_NOT_EXIST(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DATA_NOT_EXIST", invocation.getArgument(0)));
		when(functionalError.DATA_EXIST(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DATA_EXIST", invocation.getArgument(0)));
	}

	@Test
	void create_forcesInactiveOnCreation() throws Exception {
		when(pipelineTemplateRepository.findByTemplateName("Mon pipeline", false)).thenReturn(new ArrayList<>());
		when(pipelineTemplateRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineTemplateDto dto = new PipelineTemplateDto();
		dto.setTemplateName("Mon pipeline");

		Response<PipelineTemplateDto> response = pipelineTemplateBusiness.create(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		verify(pipelineTemplateRepository).saveAll(itemsCaptor.capture());
		assertThat(itemsCaptor.getValue().get(0).getIsActive()).isFalse();
		verify(pipelineStageRepository, times(2)).save(any());
	}

	@Test
	void update_allowedOnLockedTemplate() throws Exception {
		PipelineTemplate template = buildTemplate(11, true);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		when(pipelineTemplateRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineTemplateDto dto = new PipelineTemplateDto();
		dto.setId(11);
		dto.setTemplateName("Nouveau nom");

		Response<PipelineTemplateDto> response = pipelineTemplateBusiness.update(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(template.getTemplateName()).isEqualTo("Nouveau nom");
	}

	@Test
	void activation_readinessEvaluatesActiveStagesOnly() {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		// Actives sans étape intermédiaire : la readiness doit échouer même si des
		// révisions inactives existent en base (le calcul ne porte que sur les actives)
		when(pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(11))
				.thenReturn(List.of(
						buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1),
						buildStage(22, template, StageType.DECISION.getValue(), "Decision", 2)));

		PipelineTemplateDto dto = new PipelineTemplateDto();
		dto.setId(11);
		dto.setIsActive(true);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> pipelineTemplateBusiness.update(buildRequest(77, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("intermediaire");
		verify(pipelineTemplateRepository, never()).saveAll(any());
	}

	@Test
	void activation_succeedsWhenActiveStagesAreReady() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		when(pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(11))
				.thenReturn(List.of(
						buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1),
						buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 2),
						buildStage(22, template, StageType.DECISION.getValue(), "Decision", 3)));
		when(pipelineTemplateRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		PipelineTemplateDto dto = new PipelineTemplateDto();
		dto.setId(11);
		dto.setIsActive(true);

		Response<PipelineTemplateDto> response = pipelineTemplateBusiness.update(buildRequest(77, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(template.getIsActive()).isTrue();
	}

	@Test
	void delete_blockedOnLockedTemplate() {
		PipelineTemplate template = buildTemplate(11, true);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);

		PipelineTemplateDto dto = new PipelineTemplateDto();
		dto.setId(11);

		assertThrows(
				InvalidEntityException.class,
				() -> pipelineTemplateBusiness.delete(buildRequest(77, dto), Locale.FRENCH));

		verify(pipelineTemplateRepository, never()).saveAll(any());
	}

	private Request<PipelineTemplateDto> buildRequest(Integer userId, PipelineTemplateDto dto) {
		Request<PipelineTemplateDto> request = new Request<>();
		request.setUser(userId);
		request.setDatas(List.of(dto));
		return request;
	}

	private PipelineTemplate buildTemplate(Integer id, boolean locked) {
		PipelineTemplate template = new PipelineTemplate();
		template.setId(id);
		template.setTemplateName("Pipeline " + id);
		template.setIsLocked(locked);
		template.setIsActive(false);
		template.setIsDeleted(false);
		return template;
	}

	private PipelineStage buildStage(Integer id, PipelineTemplate template, String stageType, String label, int order) {
		PipelineStage stage = new PipelineStage();
		stage.setId(id);
		stage.setPipelineTemplate(template);
		stage.setStageType(stageType);
		stage.setStageLabel(label);
		stage.setStageOrder(order);
		stage.setIsRequired(true);
		stage.setIsEliminatory(false);
		stage.setIsActive(true);
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
