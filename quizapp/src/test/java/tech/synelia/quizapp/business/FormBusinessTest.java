package tech.synelia.quizapp.business;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.Answer;
import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormQuestions;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Question;
import tech.synelia.quizapp.dao.repository.AnswerRepository;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.FormQuestionsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.dao.repository.QuestionRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.FormDto;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class FormBusinessTest {

	@Mock
	private FormRepository formRepository;
	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private FormVersionRepository formVersionRepository;
	@Mock
	private FormQuestionsRepository formQuestionsRepository;
	@Mock
	private QuestionRepository questionRepository;
	@Mock
	private AnswerRepository answerRepository;
	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private FormBusiness formBusiness;

	@BeforeEach
	void setUpProjectionService() throws Exception {
		FormCampaignProjectionService projectionService = new FormCampaignProjectionService();
		injectField(projectionService, "campaignFormRepository", campaignFormRepository);
		injectField(projectionService, "formRepository", formRepository);
		injectField(formBusiness, "formCampaignProjectionService", projectionService);
	}

	@Test
	void create_allowsFormWithoutCampaignAndDoesNotCreateCampaignLink() throws Exception {
		Form savedForm = buildForm(7, false, null);

		when(formRepository.saveAll(any())).thenReturn(List.of(savedForm));
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of());
		when(formVersionRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		FormDto dto = new FormDto();
		dto.setFormName("Formulaire autonome");
		dto.setFormDesc("Sans campagne initiale");

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.create(request, Locale.FRENCH);

		ArgumentCaptor<Iterable<Form>> savedFormsCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(formRepository).saveAll(savedFormsCaptor.capture());
		List<Form> savedForms = toFormList(savedFormsCaptor.getValue());
		assertThat(savedForms).hasSize(1);
		assertThat(savedForms.getFirst().getCampaigns()).isNull();
		assertThat(savedForms.getFirst().getIsTimed()).isFalse();

		verify(campaignsRepository, never()).findOne(any(), any());
		verify(campaignFormRepository, never()).saveAll(any());
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
	}

	@Test
	void create_ignoresLegacyCampaignIdAndDoesNotCreateCampaignLink() throws Exception {
		Form savedForm = buildForm(7, false, null);

		when(formRepository.saveAll(any())).thenReturn(List.of(savedForm));
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of());
		when(formVersionRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

		FormDto dto = new FormDto();
		dto.setFormName("Formulaire partage");
		dto.setCampaignId(11);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.create(request, Locale.FRENCH);

		ArgumentCaptor<Iterable<Form>> savedFormsCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(formRepository).saveAll(savedFormsCaptor.capture());
		List<Form> savedForms = toFormList(savedFormsCaptor.getValue());
		assertThat(savedForms).hasSize(1);
		assertThat(savedForms.getFirst().getCampaigns()).isNull();
		assertThat(savedForms.getFirst().getIsTimed()).isFalse();

		verify(campaignsRepository, never()).findOne(any(), any());
		verify(campaignFormRepository, never()).saveAll(any());
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
	}

	@Test
	void update_rejectsEffectiveTimingChangeWhenLockedVersionExists() {
		Form existingForm = buildForm(7, false, null);
		FormVersion lockedVersion = buildFormVersion(existingForm, 1, true);

		when(formRepository.findOne(7, false)).thenReturn(existingForm);
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of(lockedVersion));

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_REQUEST_FAIL");
		failureStatus.setMessage("Le chronometrage effectif d'un formulaire deja verrouille ne peut pas etre modifie en place.");
		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenReturn(failureStatus);

		FormDto dto = new FormDto();
		dto.setId(7);
		dto.setIsTimed(true);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> formBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(formRepository, never()).saveAll(any());
	}

	@Test
	void update_allowsTimingMutationWhenOnlyUnlockedVersionsExist() throws Exception {
		Form existingForm = buildForm(7, false, null);
		FormVersion draftVersion = buildFormVersion(existingForm, 1, false);

		when(formRepository.findOne(7, false)).thenReturn(existingForm);
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of(draftVersion));
		when(formRepository.saveAll(any())).thenAnswer(invocation -> toFormList(invocation.getArgument(0)));

		FormDto dto = new FormDto();
		dto.setId(7);
		dto.setIsTimed(true);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.update(request, Locale.FRENCH);

		assertThat(existingForm.getIsTimed()).isTrue();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
	}

	@Test
	void update_ignoresLegacyCampaignIdThatWouldOtherwiseChangeEffectiveTiming() throws Exception {
		Campaigns currentCampaign = buildCampaign(1, false);
		Campaigns timedCampaign = buildCampaign(2, true);
		Form existingForm = buildForm(7, false, currentCampaign);
		FormVersion lockedVersion = buildFormVersion(existingForm, 1, true);

		when(formRepository.findOne(7, false)).thenReturn(existingForm);
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of(lockedVersion));
		when(formRepository.saveAll(any())).thenAnswer(invocation -> toFormList(invocation.getArgument(0)));

		FormDto dto = new FormDto();
		dto.setId(7);
		dto.setCampaignId(2);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.update(request, Locale.FRENCH);

		assertThat(existingForm.getCampaigns()).isSameAs(currentCampaign);
		assertThat(existingForm.getIsTimed()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
		verify(campaignsRepository, never()).findOne(any(), any());
		verify(campaignFormRepository, never()).saveAll(any());
	}

	@Test
	void update_ignoresLegacyCampaignIdWhenFormIsUnlocked() throws Exception {
		Campaigns currentCampaign = buildCampaign(1, false);
		Campaigns otherCampaign = buildCampaign(2, false);
		Form existingForm = buildForm(7, false, currentCampaign);
		FormVersion draftVersion = buildFormVersion(existingForm, 1, false);

		when(formRepository.findOne(7, false)).thenReturn(existingForm);
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of(draftVersion));
		when(formRepository.saveAll(any())).thenAnswer(invocation -> toFormList(invocation.getArgument(0)));

		FormDto dto = new FormDto();
		dto.setId(7);
		dto.setCampaignId(2);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.update(request, Locale.FRENCH);

		assertThat(existingForm.getCampaigns()).isSameAs(currentCampaign);
		assertThat(existingForm.getIsTimed()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
		verify(campaignsRepository, never()).findOne(any(), any());
		verify(campaignFormRepository, never()).saveAll(any());
	}

	@Test
	void update_sharedFormMetadataChangeDoesNotMutateCampaignLinks() throws Exception {
		Form sharedForm = buildForm(7, false, null);
		sharedForm.setFormDesc("Description partagee");
		FormVersion draftVersion = buildFormVersion(sharedForm, 1, false);

		when(formRepository.findOne(7, false)).thenReturn(sharedForm);
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of(draftVersion));
		when(formRepository.saveAll(any())).thenAnswer(invocation -> toFormList(invocation.getArgument(0)));

		FormDto dto = new FormDto();
		dto.setId(7);
		dto.setFormDesc("Description partagee mise a jour");

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.update(request, Locale.FRENCH);

		assertThat(sharedForm.getCampaigns()).isNull();
		assertThat(sharedForm.getFormDesc()).isEqualTo("Description partagee mise a jour");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
		verify(campaignFormRepository, never()).findByFormId(any());
		verify(campaignFormRepository, never()).saveAll(any());
	}

	@Test
	void custom_syncCampaignLinks_updatesCampaignFormLinksAndReprojectsLegacyCampaignField() throws Exception {
		Campaigns targetCampaign = buildCampaign(11, false);
		targetCampaign.setCampaignTitle("Campagne partagee");
		Campaigns legacyCampaign = buildCampaign(2, false);
		Form sharedForm = buildForm(7, false, legacyCampaign);
		Form newSharedForm = buildForm(8, false, legacyCampaign);
		Form removedForm = buildForm(9, false, targetCampaign);

		CampaignForm deletedLinkToReactivate = buildCampaignForm(31, sharedForm, targetCampaign, true);
		CampaignForm activeLinkToDetach = buildCampaignForm(32, removedForm, targetCampaign, false);

		when(campaignsRepository.findOne(11, false)).thenReturn(targetCampaign);
		when(formRepository.findOne(7, false)).thenReturn(sharedForm);
		when(formRepository.findOne(8, false)).thenReturn(newSharedForm);
		when(formRepository.saveAll(any())).thenAnswer(invocation -> toFormList(invocation.getArgument(0)));
		when(campaignFormRepository.findAllByCampaignId(11)).thenReturn(List.of(deletedLinkToReactivate, activeLinkToDetach));
		when(campaignFormRepository.saveAll(any())).thenAnswer(invocation -> toCampaignFormList(invocation.getArgument(0)));
		when(campaignFormRepository.findByFormId(7)).thenReturn(List.of(
				buildCampaignForm(41, sharedForm, legacyCampaign, false),
				deletedLinkToReactivate));
		when(campaignFormRepository.findByFormId(8)).thenReturn(List.of(
				buildCampaignForm(42, newSharedForm, targetCampaign, false)));
		when(campaignFormRepository.findByFormId(9)).thenReturn(List.of(activeLinkToDetach));

		FormDto dto = new FormDto();
		dto.setAction("syncCampaignLinks");
		dto.setCampaignId(11);
		dto.setFormIds(List.of(7, 8, 7));

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.custom(request, Locale.FRENCH);

		ArgumentCaptor<Iterable<CampaignForm>> savedLinksCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(campaignFormRepository).saveAll(savedLinksCaptor.capture());

		List<CampaignForm> savedLinks = toCampaignFormList(savedLinksCaptor.getValue());
		assertThat(savedLinks).hasSize(3);
		assertThat(savedLinks)
				.anySatisfy(link -> {
					assertThat(link.getId()).isEqualTo(31);
					assertThat(link.getCampaigns()).isSameAs(targetCampaign);
					assertThat(link.getForm()).isSameAs(sharedForm);
					assertThat(link.getIsDeleted()).isFalse();
					assertThat(link.getAssignmentOrder()).isEqualTo(1);
				})
				.anySatisfy(link -> {
					assertThat(link.getId()).isNull();
					assertThat(link.getCampaigns()).isSameAs(targetCampaign);
					assertThat(link.getForm()).isSameAs(newSharedForm);
					assertThat(link.getIsDeleted()).isFalse();
					assertThat(link.getAssignmentOrder()).isEqualTo(2);
				})
				.anySatisfy(link -> {
					assertThat(link.getId()).isEqualTo(32);
					assertThat(link.getForm()).isSameAs(removedForm);
					assertThat(link.getIsDeleted()).isTrue();
				});

		ArgumentCaptor<Iterable<Form>> savedFormsCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(formRepository).saveAll(savedFormsCaptor.capture());
		List<Form> savedForms = toFormList(savedFormsCaptor.getValue());
		assertThat(savedForms)
				.extracting(Form::getId)
				.containsExactlyInAnyOrder(7, 8, 9);
		assertThat(sharedForm.getCampaigns()).isNull();
		assertThat(newSharedForm.getCampaigns()).isSameAs(targetCampaign);
		assertThat(removedForm.getCampaigns()).isNull();
		assertThat(response.getItems()).extracting(FormDto::getId).containsExactly(7, 8);
	}

	@Test
	void custom_duplicateForCampaign_createsIndependentDraftCopyFromPublishedVersion() throws Exception {
		Campaigns sourceCampaign = buildCampaign(2, false);
		Campaigns targetCampaign = buildCampaign(11, false);
		targetCampaign.setCampaignTitle("Campagne cible");

		Form sourceForm = buildForm(7, true, sourceCampaign);
		sourceForm.setFormDesc("Description source");

		FormVersion publishedVersion = buildFormVersion(sourceForm, 3, true);
		publishedVersion.setId(301);
		publishedVersion.setIsPublished(true);
		publishedVersion.setRandomQuestions(true);

		Question sourceQuestion = buildQuestion(101);
		Answer sourceAnswer = buildAnswer(201, sourceQuestion);
		FormQuestions sourceLink = buildFormQuestion(401, publishedVersion, sourceQuestion, 1, 45);

		when(formRepository.findOne(7, false)).thenReturn(sourceForm);
		when(campaignsRepository.findOne(11, false)).thenReturn(targetCampaign);
		when(formVersionRepository.findByFormIdAndIsPublished(7, true, false)).thenReturn(List.of(publishedVersion));
		when(formRepository.save(any(Form.class))).thenAnswer(invocation -> {
			Form savedForm = invocation.getArgument(0);
			savedForm.setId(80);
			return savedForm;
		});
		when(formVersionRepository.save(any(FormVersion.class))).thenAnswer(invocation -> {
			FormVersion savedVersion = invocation.getArgument(0);
			savedVersion.setId(800);
			return savedVersion;
		});
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(301, false)).thenReturn(List.of(sourceLink));
		when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
			Question savedQuestion = invocation.getArgument(0);
			savedQuestion.setId(900);
			return savedQuestion;
		});
		when(answerRepository.findByQuestionId(101, false)).thenReturn(List.of(sourceAnswer));
		when(answerRepository.saveAll(any())).thenAnswer(invocation -> toAnswerList(invocation.getArgument(0)));
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionList(invocation.getArgument(0)));
		when(campaignFormRepository.findByFormId(80)).thenReturn(
				List.of(),
				List.of(buildCampaignForm(801, buildForm(80, true, targetCampaign), targetCampaign, false)));
		when(campaignFormRepository.saveAll(any())).thenAnswer(invocation -> toCampaignFormList(invocation.getArgument(0)));

		FormDto dto = new FormDto();
		dto.setAction("duplicateForCampaign");
		dto.setId(7);
		dto.setCampaignId(11);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.custom(request, Locale.FRENCH);

		ArgumentCaptor<FormVersion> savedVersionCaptor = ArgumentCaptor.forClass(FormVersion.class);
		verify(formVersionRepository).save(savedVersionCaptor.capture());
		FormVersion savedVersion = savedVersionCaptor.getValue();
		assertThat(savedVersion.getVersionNumber()).isEqualTo(1);
		assertThat(savedVersion.getIsPublished()).isFalse();
		assertThat(savedVersion.getIsLocked()).isFalse();
		assertThat(savedVersion.getRandomQuestions()).isTrue();
		assertThat(savedVersion.getForm()).isNotNull();
		assertThat(savedVersion.getForm().getId()).isEqualTo(80);

		ArgumentCaptor<Form> savedFormCaptor = ArgumentCaptor.forClass(Form.class);
		verify(formRepository).save(savedFormCaptor.capture());
		Form duplicatedForm = savedFormCaptor.getValue();
		assertThat(duplicatedForm.getCampaigns()).isSameAs(targetCampaign);
		assertThat(duplicatedForm.getFormDesc()).isEqualTo("Description source");
		assertThat(duplicatedForm.getFormName()).contains("copie");
		assertThat(duplicatedForm.getIsTimed()).isTrue();

		ArgumentCaptor<Iterable<FormQuestions>> savedLinksCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(formQuestionsRepository).saveAll(savedLinksCaptor.capture());
		List<FormQuestions> duplicatedLinks = toFormQuestionList(savedLinksCaptor.getValue());
		assertThat(duplicatedLinks).hasSize(1);
		assertThat(duplicatedLinks.getFirst().getQuestionOrder()).isEqualTo(1);
		assertThat(duplicatedLinks.getFirst().getChronoOverride()).isEqualTo(45);
		assertThat(duplicatedLinks.getFirst().getFormVersion().getId()).isEqualTo(800);
		assertThat(duplicatedLinks.getFirst().getQuestion().getId()).isEqualTo(900);

		ArgumentCaptor<Iterable<Answer>> savedAnswersCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(answerRepository).saveAll(savedAnswersCaptor.capture());
		List<Answer> duplicatedAnswers = toAnswerList(savedAnswersCaptor.getValue());
		assertThat(duplicatedAnswers).hasSize(1);
		assertThat(duplicatedAnswers.getFirst().getQuestion().getId()).isEqualTo(900);
		assertThat(duplicatedAnswers.getFirst().getAnswerText()).isEqualTo(sourceAnswer.getAnswerText());

		ArgumentCaptor<Iterable<CampaignForm>> savedCampaignLinksCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(campaignFormRepository).saveAll(savedCampaignLinksCaptor.capture());
		List<CampaignForm> duplicatedCampaignLinks = toCampaignFormList(savedCampaignLinksCaptor.getValue());
		assertThat(duplicatedCampaignLinks).hasSize(1);
		assertThat(duplicatedCampaignLinks.getFirst().getCampaigns()).isSameAs(targetCampaign);
		assertThat(duplicatedCampaignLinks.getFirst().getForm().getId()).isEqualTo(80);
		assertThat(duplicatedCampaignLinks.getFirst().getIsDeleted()).isFalse();

		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(80);
		verify(formVersionRepository, never()).findByFormId(7, false);
	}

	@Test
	void update_allowsNonVersionedFormMetadataChangeInPlaceWhenLockedVersionExists() throws Exception {
		Campaigns currentCampaign = buildCampaign(1, false);
		Form existingForm = buildForm(7, false, currentCampaign);
		existingForm.setFormDesc("Description initiale");
		existingForm.setIsActive(true);
		FormVersion lockedVersion = buildFormVersion(existingForm, 1, true);

		when(formRepository.findOne(7, false)).thenReturn(existingForm);
		when(formVersionRepository.findByFormId(7, false)).thenReturn(List.of(lockedVersion));
		when(formRepository.saveAll(any())).thenAnswer(invocation -> toFormList(invocation.getArgument(0)));

		FormDto dto = new FormDto();
		dto.setId(7);
		dto.setFormName("Formulaire Java mis a jour");
		dto.setFormDesc("Description mise a jour");
		dto.setIsActive(false);

		Request<FormDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormDto> response = formBusiness.update(request, Locale.FRENCH);

		assertThat(existingForm.getFormName()).isEqualTo("Formulaire Java mis a jour");
		assertThat(existingForm.getFormDesc()).isEqualTo("Description mise a jour");
		assertThat(existingForm.getIsActive()).isFalse();
		assertThat(existingForm.getCampaigns()).isSameAs(currentCampaign);
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
	}

	private Form buildForm(Integer id, Boolean isTimed, Campaigns campaign) {
		Form form = new Form();
		form.setId(id);
		form.setFormName("Formulaire Java");
		form.setIsTimed(isTimed);
		form.setCampaigns(campaign);
		form.setIsDeleted(false);
		return form;
	}

	private Campaigns buildCampaign(Integer id, Boolean timeAllForms) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		campaign.setTimeAllForms(timeAllForms);
		return campaign;
	}

	private Question buildQuestion(Integer id) {
		Question question = new Question();
		question.setId(id);
		question.setQuestionRef("Q-" + id);
		question.setQuestionText("Question " + id);
		question.setQuestionChrono(60);
		question.setQuestionType("QCM");
		question.setScore(5);
		question.setDifficultyLevel("MEDIUM");
		question.setIsDeleted(false);
		return question;
	}

	private Answer buildAnswer(Integer id, Question question) {
		Answer answer = new Answer();
		answer.setId(id);
		answer.setQuestion(question);
		answer.setAnswerText("Reponse " + id);
		answer.setAnswerType("TEXT");
		answer.setAllowAdditionalComment(false);
		answer.setAdditionalCommentRequired(false);
		answer.setAnswerOrder(1);
		answer.setIsCorrect(true);
		answer.setIsDeleted(false);
		return answer;
	}

	private FormQuestions buildFormQuestion(Integer id, FormVersion formVersion, Question question, Integer questionOrder, Integer chronoOverride) {
		FormQuestions formQuestion = new FormQuestions();
		formQuestion.setId(id);
		formQuestion.setFormVersion(formVersion);
		formQuestion.setQuestion(question);
		formQuestion.setQuestionOrder(questionOrder);
		formQuestion.setChronoOverride(chronoOverride);
		formQuestion.setIsDeleted(false);
		return formQuestion;
	}

	private FormVersion buildFormVersion(Form form, Integer versionNumber, Boolean isLocked) {
		FormVersion formVersion = new FormVersion();
		formVersion.setId(versionNumber);
		formVersion.setForm(form);
		formVersion.setVersionNumber(versionNumber);
		formVersion.setIsLocked(isLocked);
		formVersion.setIsDeleted(false);
		return formVersion;
	}

	private CampaignForm buildCampaignForm(Integer id, Form form, Campaigns campaign, Boolean isDeleted) {
		CampaignForm campaignForm = new CampaignForm();
		campaignForm.setId(id);
		campaignForm.setForm(form);
		campaignForm.setCampaigns(campaign);
		campaignForm.setIsDeleted(isDeleted);
		return campaignForm;
	}

	private List<Form> toFormList(Iterable<Form> iterable) {
		List<Form> forms = new ArrayList<>();
		for (Form form : iterable) {
			forms.add(form);
		}
		return forms;
	}

	private List<CampaignForm> toCampaignFormList(Iterable<CampaignForm> iterable) {
		List<CampaignForm> campaignForms = new ArrayList<>();
		for (CampaignForm campaignForm : iterable) {
			campaignForms.add(campaignForm);
		}
		return campaignForms;
	}

	private List<FormQuestions> toFormQuestionList(Iterable<FormQuestions> iterable) {
		List<FormQuestions> formQuestions = new ArrayList<>();
		for (FormQuestions formQuestion : iterable) {
			formQuestions.add(formQuestion);
		}
		return formQuestions;
	}

	private List<Answer> toAnswerList(Iterable<Answer> iterable) {
		List<Answer> answers = new ArrayList<>();
		for (Answer answer : iterable) {
			answers.add(answer);
		}
		return answers;
	}

	private void injectField(Object target, String fieldName, Object value) throws Exception {
		Field field = target.getClass().getDeclaredField(fieldName);
		field.setAccessible(true);
		field.set(target, value);
	}
}