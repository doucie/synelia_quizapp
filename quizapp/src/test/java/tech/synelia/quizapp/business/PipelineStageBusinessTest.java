package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
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
@MockitoSettings(strictness = Strictness.LENIENT)
class PipelineStageBusinessTest {

	@Mock
	private PipelineStageRepository pipelineStageRepository;
	@Mock
	private PipelineTemplateRepository pipelineTemplateRepository;
	@Mock
	private ApplicationProgressRepository applicationProgressRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private PipelineStageBusiness pipelineStageBusiness;

	// Simule une base en mémoire : les requêtes actives/inactives et les saveAll
	// partagent le même état, comme en base réelle.
	private List<PipelineStage> dbStages;

	@BeforeEach
	void setUp() {
		dbStages = new ArrayList<>();
		when(functionalError.DISALLOWED_OPERATION(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DISALLOWED_OPERATION", invocation.getArgument(0)));
		when(functionalError.REQUEST_FAIL(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_REQUEST_FAIL", invocation.getArgument(0)));
		when(functionalError.FIELD_EMPTY(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_FIELD_EMPTY", invocation.getArgument(0)));
		when(functionalError.DATA_NOT_EXIST(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DATA_NOT_EXIST", invocation.getArgument(0)));

		when(pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(11))
				.thenAnswer(invocation -> dbStages.stream()
						.filter(s -> Boolean.TRUE.equals(s.getIsActive()) && !Boolean.TRUE.equals(s.getIsDeleted()))
						.sorted(Comparator.comparing(PipelineStage::getStageOrder))
						.collect(Collectors.toList()));
		when(pipelineStageRepository.findInactiveRevisions(11))
				.thenAnswer(invocation -> dbStages.stream()
						.filter(s -> !Boolean.TRUE.equals(s.getIsActive()) && !Boolean.TRUE.equals(s.getIsDeleted()))
						.collect(Collectors.toList()));
		when(pipelineStageRepository.saveAll(any())).thenAnswer(invocation -> {
			List<PipelineStage> saved = new ArrayList<>((List<PipelineStage>) invocation.getArgument(0));
			dbStages.clear();
			dbStages.addAll(saved);
			return saved;
		});
		when(applicationProgressRepository.findUsedStageIds(any())).thenReturn(new ArrayList<>());
	}

	@Test
	void create_rejectsUnknownStageType() {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);

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
	void create_insertsIntermediateStageBetweenBoundaries() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		dbStages.addAll(List.of(
				buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1),
				buildStage(22, template, StageType.DECISION.getValue(), "Decision", 2)));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setPipelineTemplateId(11);
		dto.setStageType(StageType.QUIZ.getValue());
		dto.setStageLabel("Quiz round 1");
		dto.setStageOrder(2);

		Response<PipelineStageDto> response = pipelineStageBusiness.create(buildRequest(77, dto, false), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(3);
		assertThat(response.getItems().get(1).getStageLabel()).isEqualTo("Quiz round 1");
		assertThat(response.getItems().get(1).getStageOrder()).isEqualTo(2);
		verify(pipelineStageRepository, atLeastOnce()).saveAll(any());
	}

	@Test
	void create_allowsMultipleOccurrencesOfIntermediateStageTypes() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		dbStages.addAll(List.of(
				buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1),
				buildStage(22, template, StageType.DECISION.getValue(), "Decision", 2)));

		Request<PipelineStageDto> request = new Request<>();
		request.setUser(77);
		request.setIsSimpleLoading(true);

		List<PipelineStageDto> dtos = new ArrayList<>();
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
			dto.setStageOrder(2);
			dtos.add(dto);
		}
		request.setDatas(dtos);

		Response<PipelineStageDto> response = pipelineStageBusiness.create(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(8);
		assertThat(response.getItems().get(0).getStageType()).isEqualTo(StageType.CANDIDATURE.getValue());
		assertThat(response.getItems().get(7).getStageType()).isEqualTo(StageType.DECISION.getValue());
		long quizCount = response.getItems().stream()
				.filter(dto -> StageType.QUIZ.getValue().equals(dto.getStageType()))
				.count();
		assertThat(quizCount).isEqualTo(2);
		verify(pipelineStageRepository, atLeastOnce()).saveAll(any());
	}

	@Test
	void update_rejectsChangingAnotherStageToUnknownType() {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.INTERVIEW.getValue(), "Entretien", 3);

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);

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
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage existingStage = buildStage(21, template, StageType.INTERVIEW.getValue(), "Entretien", 2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 3);
		dbStages.addAll(List.of(candidature, existingStage, decision));

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageLabel("Entretien archive");

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, true), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(3);
		assertThat(existingStage.getStageType()).isEqualTo(StageType.INTERVIEW.getValue());
		assertThat(existingStage.getStageLabel()).isEqualTo("Entretien archive");
		verify(pipelineStageRepository, atLeastOnce()).saveAll(any());
	}

	@Test
	void update_rejectsRetypingBoundaryStage() {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage existingStage = buildStage(21, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);

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
		PipelineStage candidature = buildStage(21, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage quiz = buildStage(23, template, StageType.QUIZ.getValue(), "Quiz", 2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 3);
		dbStages.addAll(List.of(candidature, quiz, decision));

		when(pipelineStageRepository.findOne(21, false)).thenReturn(candidature);
		when(pipelineStageRepository.findOne(22, false)).thenReturn(decision);

		PipelineStageDto candidatureDto = new PipelineStageDto();
		candidatureDto.setId(21);
		candidatureDto.setStageOrder(3);

		InvalidEntityException headException = assertThrows(
				InvalidEntityException.class,
				() -> pipelineStageBusiness.update(buildRequest(77, candidatureDto, false), Locale.FRENCH));
		assertThat(headException.getStatus().getMessage()).contains("tete");

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
	void update_allowsRetypingStageToAnAlreadyUsedIntermediateType() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage existingStage = buildStage(21, template, StageType.PRESELECTION.getValue(), "Présélection", 2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 3);
		dbStages.addAll(List.of(candidature, existingStage, decision));

		when(pipelineStageRepository.findOne(21, false)).thenReturn(existingStage);

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageType(StageType.QUIZ.getValue());
		dto.setStageLabel("Nouveau quiz");

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, true), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existingStage.getStageType()).isEqualTo(StageType.QUIZ.getValue());
		assertThat(existingStage.getStageLabel()).isEqualTo("Nouveau quiz");
		assertThat(existingStage.getIsActive()).isTrue();
	}

	@Test
	void update_lockedStageModifiedBecomesNewRevision() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage quiz = buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 3);
		dbStages.addAll(List.of(candidature, quiz, decision));

		when(pipelineStageRepository.findOne(21, false)).thenReturn(quiz);
		when(applicationProgressRepository.findUsedStageIds(any())).thenReturn(List.of(21));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageLabel("Quiz V2");

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, false), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		// L'ancienne révision reste en historique (inactive), une nouvelle révision active est créée
		assertThat(quiz.getIsActive()).isFalse();
		assertThat(response.getItems()).hasSize(3);
		assertThat(response.getItems().get(1).getStageLabel()).isEqualTo("Quiz V2");
		assertThat(response.getItems().get(1).getId()).isNull();
		verify(pipelineStageRepository, atLeastOnce()).saveAll(any());
	}

	@Test
	void update_lockedStageModifiedReactivatesIdenticalInactiveRevision() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage quiz = buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 2);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 3);
		PipelineStage quizV2 = buildStage(30, template, StageType.QUIZ.getValue(), "Quiz V2", 2);
		quizV2.setIsActive(false);
		dbStages.addAll(List.of(candidature, quiz, decision, quizV2));

		when(pipelineStageRepository.findOne(21, false)).thenReturn(quiz);
		when(applicationProgressRepository.findUsedStageIds(any())).thenReturn(List.of(21));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(21);
		dto.setStageLabel("Quiz V2");

		Response<PipelineStageDto> response = pipelineStageBusiness.update(buildRequest(77, dto, false), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(quiz.getIsActive()).isFalse();
		assertThat(response.getItems()).hasSize(3);
		assertThat(response.getItems().get(1).getId()).isEqualTo(30);
		assertThat(quizV2.getIsActive()).isTrue();
	}

	@Test
	void delete_unlockedStageIsSoftDeleted() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage quiz = buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 2);
		PipelineStage interview = buildStage(22, template, StageType.INTERVIEW.getValue(), "Entretien", 3);
		PipelineStage decision = buildStage(23, template, StageType.DECISION.getValue(), "Decision", 4);
		dbStages.addAll(List.of(candidature, quiz, interview, decision));

		when(pipelineStageRepository.findOne(22, false)).thenReturn(interview);

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(22);

		Response<PipelineStageDto> response = pipelineStageBusiness.delete(buildRequest(77, dto, false), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(interview.getIsDeleted()).isTrue();
		assertThat(quiz.getIsActive()).isTrue();
		assertThat(response.getItems()).hasSize(3);
	}

	@Test
	void delete_lockedStageIsDeactivatedInsteadOfDeleted() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage quiz = buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 2);
		PipelineStage interview = buildStage(22, template, StageType.INTERVIEW.getValue(), "Entretien", 3);
		PipelineStage decision = buildStage(23, template, StageType.DECISION.getValue(), "Decision", 4);
		dbStages.addAll(List.of(candidature, quiz, interview, decision));

		when(pipelineStageRepository.findOne(22, false)).thenReturn(interview);
		when(applicationProgressRepository.findUsedStageIds(any())).thenReturn(List.of(22));

		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(22);

		Response<PipelineStageDto> response = pipelineStageBusiness.delete(buildRequest(77, dto, false), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(interview.getIsActive()).isFalse();
		assertThat(interview.getIsDeleted()).isFalse();
		assertThat(quiz.getIsActive()).isTrue();
		assertThat(response.getItems()).hasSize(3);
	}

	@Test
	void reorderStages_reordersActivesThroughEngine() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage presel = buildStage(23, template, StageType.PRESELECTION.getValue(), "Présélection", 2);
		PipelineStage quiz = buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 3);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 4);
		dbStages.addAll(List.of(candidature, presel, quiz, decision));

		Response<PipelineStageDto> response = pipelineStageBusiness.reorderStages(11, List.of(20, 21, 23, 22), 77, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).extracting(PipelineStageDto::getId)
				.containsExactly(20, 21, 23, 22);
		assertThat(quiz.getStageOrder()).isEqualTo(2);
		assertThat(presel.getStageOrder()).isEqualTo(3);
	}

	@Test
	void saveTemplateStages_lockedStageRevisitsAndRemovedSlotBehavior() throws Exception {
		PipelineTemplate template = buildTemplate(11, false);
		when(pipelineTemplateRepository.findOne(11, false)).thenReturn(template);
		PipelineStage candidature = buildStage(20, template, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStage quiz = buildStage(21, template, StageType.QUIZ.getValue(), "Quiz", 2);
		PipelineStage interview = buildStage(24, template, StageType.INTERVIEW.getValue(), "Entretien", 3);
		PipelineStage decision = buildStage(22, template, StageType.DECISION.getValue(), "Decision", 4);
		dbStages.addAll(List.of(candidature, quiz, interview, decision));

		// QUIZ utilisé (verrouillé) ; l'ENTRETIEN non utilisé sera retiré
		when(applicationProgressRepository.findUsedStageIds(any())).thenReturn(List.of(21));

		PipelineStageDto candidatureDto = toTarget(20, StageType.CANDIDATURE.getValue(), "Candidature", 1);
		PipelineStageDto quizDto = toTarget(21, StageType.QUIZ.getValue(), "Quiz V2", 2);
		PipelineStageDto testDto = toTarget(null, StageType.QUIZ.getValue(), "Test", 3);
		PipelineStageDto decisionDto = toTarget(22, StageType.DECISION.getValue(), "Decision", 4);
		List<PipelineStageDto> targets = List.of(candidatureDto, quizDto, testDto, decisionDto);

		Response<PipelineStageDto> response = pipelineStageBusiness.saveTemplateStages(11, targets, 77, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		// révision verrouillée : l'ancienne reste inactive, une nouvelle est créée
		assertThat(quiz.getIsActive()).isFalse();
		// slot retiré non verrouillé : soft-delete
		assertThat(interview.getIsDeleted()).isTrue();
		assertThat(response.getItems()).hasSize(4);
		assertThat(response.getItems()).extracting(PipelineStageDto::getStageLabel)
				.containsExactly("Candidature", "Quiz V2", "Test", "Decision");
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

	private PipelineStageDto toTarget(Integer id, String stageType, String label, int order) {
		PipelineStageDto dto = new PipelineStageDto();
		dto.setId(id);
		dto.setStageType(stageType);
		dto.setStageLabel(label);
		dto.setStageOrder(order);
		dto.setIsRequired(true);
		dto.setIsEliminatory(false);
		return dto;
	}

	private Status buildStatus(String code, String message) {
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		return status;
	}
}
