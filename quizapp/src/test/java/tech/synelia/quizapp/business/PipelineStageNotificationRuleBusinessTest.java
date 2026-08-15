package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineStageNotificationRule;
import tech.synelia.quizapp.dao.repository.EmailTemplateRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageNotificationRuleRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.PipelineStageNotificationRuleDto;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PipelineStageNotificationRuleBusinessTest {

	@Mock
	private PipelineStageNotificationRuleRepository ruleRepository;
	@Mock
	private PipelineStageRepository pipelineStageRepository;
	@Mock
	private EmailTemplateRepository emailTemplateRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private PipelineStageNotificationRuleBusiness business;

	@BeforeEach
	void setUp() {
		when(functionalError.FIELD_EMPTY(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_FIELD_EMPTY", invocation.getArgument(0)));
		when(functionalError.REQUEST_FAIL(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_REQUEST_FAIL", invocation.getArgument(0)));
		when(functionalError.DATA_NOT_EXIST(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DATA_NOT_EXIST", invocation.getArgument(0)));
		when(functionalError.DATA_EMPTY(anyString(), eq(Locale.FRENCH)))
				.thenAnswer(invocation -> buildStatus("FUNC_DATA_EMPTY", invocation.getArgument(0)));
	}

	@Test
	void create_insertsRuleWithDefaultTriggerAndFlags() throws Exception {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));

		PipelineStageNotificationRuleDto dto = buildRuleDto(null, null, null, null, null, null);
		dto.setPipelineStageId(51);

		Response<PipelineStageNotificationRuleDto> response = business.create(buildRequest(7, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().get(0).getTriggerCode()).isEqualTo("STAGE_EMAIL");
		verify(ruleRepository, atLeastOnce()).save(any());
	}

	@Test
	void create_rejectsUnknownTrigger() {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));

		PipelineStageNotificationRuleDto dto = buildRuleDto(null, "UNKNOWN_TRIGGER", null, null, null, null);
		dto.setPipelineStageId(51);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> business.create(buildRequest(7, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("UNKNOWN_TRIGGER");
		verify(ruleRepository, never()).save(any());
	}

	@Test
	void create_rejectsUnknownOutcome() {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));

		PipelineStageNotificationRuleDto dto = buildRuleDto(null, "STAGE_EMAIL", "UNKNOWN_STAGE", null, null, null);
		dto.setPipelineStageId(51);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> business.create(buildRequest(7, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("UNKNOWN_STAGE");
		verify(ruleRepository, never()).save(any());
	}

	@Test
	void create_rejectsInexistentEmailTemplate() {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));
		when(emailTemplateRepository.findOne(999, false)).thenReturn(null);

		PipelineStageNotificationRuleDto dto = buildRuleDto(null, "STAGE_EMAIL", "INTERVIEW", 999, null, null);
		dto.setPipelineStageId(51);

		EntityNotFoundException exception = assertThrows(
				EntityNotFoundException.class,
				() -> business.create(buildRequest(7, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("999");
		verify(ruleRepository, never()).save(any());
	}

	@Test
	void create_rejectsAutomaticWithoutRequired() {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));

		PipelineStageNotificationRuleDto dto = buildRuleDto(null, "STAGE_EMAIL", "INTERVIEW", null, false, true);
		dto.setPipelineStageId(51);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> business.create(buildRequest(7, dto), Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("isAutomatic");
		verify(ruleRepository, never()).save(any());
	}

	@Test
	void update_appliesChangesToExistingRule() throws Exception {
		PipelineStageNotificationRule existing = buildRule(12, 51, "STAGE_EMAIL", "INTERVIEW", 30, true, true, false);
		when(ruleRepository.findOne(12, false)).thenReturn(existing);

		PipelineStageNotificationRuleDto dto = buildRuleDto(12, null, "DECISION", null, true, null);
		dto.setRequiresManualConfirmation(true);

		Response<PipelineStageNotificationRuleDto> response = business.update(buildRequest(7, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existing.getOutcomeCode()).isEqualTo("DECISION");
		assertThat(existing.getEmailTemplateId()).isEqualTo(30);
		assertThat(existing.getRequiresManualConfirmation()).isTrue();
	}

	@Test
	void delete_performsLogicalDelete() throws Exception {
		PipelineStageNotificationRule existing = buildRule(12, 51, "STAGE_EMAIL", "INTERVIEW", 30, true, false, false);
		when(ruleRepository.findOne(12, false)).thenReturn(existing);

		PipelineStageNotificationRuleDto dto = new PipelineStageNotificationRuleDto();
		dto.setId(12);

		Response<PipelineStageNotificationRuleDto> response = business.delete(buildRequest(7, dto), Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existing.getIsDeleted()).isTrue();
		verify(ruleRepository, atLeastOnce()).save(any());
	}

	@Test
	void getByStage_returnsRulesInInsertionOrder() throws Exception {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));
		when(ruleRepository.findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(51))
				.thenReturn(List.of(buildRule(1, 51, "STAGE_EMAIL", "QUIZ", null, false, false, false),
						buildRule(2, 51, "STAGE_EMAIL", "INTERVIEW", 30, true, true, false)));
		when(emailTemplateRepository.findByIsDeleted(false)).thenReturn(List.of(buildTemplate(30, "INTERVIEW_INVITE")));

		Response<PipelineStageNotificationRuleDto> response = business.getByStage(51, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(2);
		assertThat(response.getItems().get(0).getOutcomeCode()).isEqualTo("QUIZ");
		assertThat(response.getItems().get(1).getEmailTemplateName()).isEqualTo("INTERVIEW_INVITE");
	}

	@Test
	void getByStage_returnsEmptyWhenNoRule() throws Exception {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));
		when(ruleRepository.findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(51)).thenReturn(new ArrayList<>());

		Response<PipelineStageNotificationRuleDto> response = business.getByStage(51, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).isNullOrEmpty();
		assertThat(response.getStatus().getCode()).isEqualTo("FUNC_DATA_EMPTY");
	}

	@Test
	void saveStageRules_replacesAllRulesForStage() throws Exception {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));
		PipelineStageNotificationRule kept = buildRule(12, 51, "STAGE_EMAIL", "INTERVIEW", 30, true, true, false);
		PipelineStageNotificationRule removed = buildRule(13, 51, "STAGE_EMAIL", "QUIZ", null, false, false, false);
		when(ruleRepository.findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(51)).thenReturn(List.of(kept, removed));
		when(ruleRepository.findOne(12, false)).thenReturn(kept);
		when(emailTemplateRepository.findOne(40, false)).thenReturn(buildTemplate(40, "QUIZ_INVITE"));
		when(ruleRepository.saveAll(anyList())).thenAnswer(invocation -> new ArrayList<>((List<PipelineStageNotificationRule>) invocation.getArgument(0)));

		PipelineStageNotificationRuleDto keptDto = buildRuleDto(12, "STAGE_EMAIL", "DECISION", null, true, true);
		PipelineStageNotificationRuleDto newDto = buildRuleDto(null, "STAGE_EMAIL", "QUIZ", 40, true, false);
		newDto.setPipelineStageId(51);

		Response<PipelineStageNotificationRuleDto> response = business.saveStageRules(51, List.of(keptDto, newDto), 7, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(2);
		assertThat(kept.getOutcomeCode()).isEqualTo("DECISION");
		assertThat(removed.getIsDeleted()).isTrue();
		verify(ruleRepository, atLeastOnce()).save(any());
	}

	@Test
	void saveStageRules_withEmptyListDeactivatesAll() throws Exception {
		when(pipelineStageRepository.findOne(51, false)).thenReturn(buildStage(51));
		PipelineStageNotificationRule existing = buildRule(12, 51, "STAGE_EMAIL", "INTERVIEW", 30, true, false, false);
		when(ruleRepository.findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(51)).thenReturn(List.of(existing));

		Response<PipelineStageNotificationRuleDto> response = business.saveStageRules(51, new ArrayList<>(), 7, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existing.getIsDeleted()).isTrue();
	}

	private Request<PipelineStageNotificationRuleDto> buildRequest(Integer userId, PipelineStageNotificationRuleDto dto) {
		Request<PipelineStageNotificationRuleDto> request = new Request<>();
		request.setUser(userId);
		request.setDatas(List.of(dto));
		return request;
	}

	private PipelineStageNotificationRuleDto buildRuleDto(Integer id, String triggerCode, String outcomeCode,
			Integer emailTemplateId, Boolean isRequired, Boolean isAutomatic) {
		PipelineStageNotificationRuleDto dto = new PipelineStageNotificationRuleDto();
		dto.setId(id);
		dto.setTriggerCode(triggerCode);
		dto.setOutcomeCode(outcomeCode);
		dto.setEmailTemplateId(emailTemplateId);
		dto.setIsRequired(isRequired);
		dto.setIsAutomatic(isAutomatic);
		dto.setRequiresManualConfirmation(false);
		return dto;
	}

	private PipelineStage buildStage(Integer id) {
		PipelineStage stage = new PipelineStage();
		stage.setId(id);
		stage.setIsDeleted(false);
		return stage;
	}

	private PipelineStageNotificationRule buildRule(Integer id, Integer stageId, String triggerCode, String outcomeCode,
			Integer emailTemplateId, Boolean isRequired, Boolean isAutomatic, Boolean requiresManualConfirmation) {
		PipelineStageNotificationRule rule = new PipelineStageNotificationRule();
		rule.setId(id);
		rule.setPipelineStage(buildStage(stageId));
		rule.setTriggerCode(triggerCode);
		rule.setOutcomeCode(outcomeCode);
		rule.setEmailTemplateId(emailTemplateId);
		rule.setIsRequired(isRequired);
		rule.setIsAutomatic(isAutomatic);
		rule.setRequiresManualConfirmation(requiresManualConfirmation);
		rule.setIsDeleted(false);
		return rule;
	}

	private EmailTemplate buildTemplate(Integer id, String templateKey) {
		EmailTemplate template = new EmailTemplate();
		template.setId(id);
		template.setTemplateKey(templateKey);
		template.setIsDeleted(false);
		return template;
	}

	private Status buildStatus(String code, String message) {
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		return status;
	}
}
