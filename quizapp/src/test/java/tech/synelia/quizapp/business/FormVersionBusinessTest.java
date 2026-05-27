package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.Answer;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormQuestions;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Question;
import tech.synelia.quizapp.dao.repository.AnswerRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
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
import tech.synelia.quizapp.utils.dto.FormVersionDto;
import tech.synelia.quizapp.utils.enums.QuestionType;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class FormVersionBusinessTest {

	@Mock
	private FormVersionRepository formVersionRepository;
	@Mock
	private FormRepository formRepository;
	@Mock
	private FormQuestionsRepository formQuestionsRepository;
	@Mock
	private QuestionRepository questionRepository;
	@Mock
	private AnswerRepository answerRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private FormBusiness formBusiness;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private FormVersionBusiness formVersionBusiness;

	@Test
	void update_doesNotForkLockedVersionWhenNothingMeaningfulChanged() throws Exception {
		FormVersion sourceVersion = buildFormVersion(10, 5, 3, true, true, false);
		when(formVersionRepository.findOne(10, false)).thenReturn(sourceVersion);

		FormVersionDto dto = new FormVersionDto();
		dto.setId(10);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormVersionDto> response = formVersionBusiness.update(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(10);
		verify(formVersionRepository, never()).save(any(FormVersion.class));
		verify(formVersionRepository, never()).saveAll(any());
		verify(formQuestionsRepository, never()).saveAll(any());
	}

	@Test
	void update_rejectsDirectPublishedStateMutation() {
		FormVersion sourceVersion = buildFormVersion(10, 5, 1, true, true, false);

		when(formVersionRepository.findOne(10, false)).thenReturn(sourceVersion);

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_REQUEST_FAIL");
		failureStatus.setMessage("La publication d'une version doit passer par l'action metier dediee.");
		when(functionalError.REQUEST_FAIL(any(), eq(Locale.FRENCH))).thenReturn(failureStatus);

		FormVersionDto dto = new FormVersionDto();
		dto.setId(10);
		dto.setIsPublished(true);
		dto.setRandomQuestions(true);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> formVersionBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(formVersionRepository, never()).save(any(FormVersion.class));
		verify(formVersionRepository, never()).saveAll(any());
	}

	@Test
	void custom_ensureEditableQuestion_returnsCurrentQuestionWhenNoIsolationIsNeeded() throws Exception {
		FormVersion draftVersion = buildFormVersion(10, 5, 2, false, false, true);
		Question originalQuestion = buildTextQuestion(100, "QREF-DRAFT");
		FormQuestions targetLink = buildFormQuestion(draftVersion, originalQuestion, 1);

		when(formVersionRepository.findOne(10, false)).thenReturn(draftVersion);
		when(questionRepository.findOne(100, false)).thenReturn(originalQuestion);
		when(formQuestionsRepository.findByFormVersionId(10, false)).thenReturn(List.of(targetLink));
		when(formQuestionsRepository.findByQuestionId(100, false)).thenReturn(List.of(targetLink));

		FormVersionDto dto = new FormVersionDto();
		dto.setAction("ensureEditableQuestion");
		dto.setId(10);
		dto.setQuestionId(100);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		Response<FormVersionDto> response = formVersionBusiness.custom(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getQuestionId()).isEqualTo(100);
		verify(questionRepository, never()).save(any(Question.class));
		verify(answerRepository, never()).saveAll(any());
		verify(formQuestionsRepository, never()).save(any(FormQuestions.class));
	}

	@Test
	void custom_ensureEditableQuestion_duplicatesQuestionWhenLockedHistoryStillReferencesIt() throws Exception {
		FormVersion draftVersion = buildFormVersion(10, 5, 2, false, false, true);
		Question originalQuestion = buildTextQuestion(100, "QREF-DRAFT");
		FormQuestions targetLink = buildFormQuestion(draftVersion, originalQuestion, 1);

		FormVersion lockedVersion = buildFormVersion(9, 5, 1, true, true, false);
		FormQuestions lockedLink = buildFormQuestion(lockedVersion, originalQuestion, 1);

		Answer originalAnswer = buildAnswer(originalQuestion, "Bonne reponse", 1, true);
		AtomicReference<Question> isolatedQuestion = new AtomicReference<>();

		when(formVersionRepository.findOne(10, false)).thenReturn(draftVersion);
		when(questionRepository.findOne(100, false)).thenReturn(originalQuestion);
		when(formQuestionsRepository.findByFormVersionId(10, false)).thenReturn(List.of(targetLink));
		when(formQuestionsRepository.findByQuestionId(100, false)).thenReturn(List.of(targetLink, lockedLink));
		when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
			Question savedQuestion = invocation.getArgument(0);
			savedQuestion.setId(101);
			isolatedQuestion.set(savedQuestion);
			return savedQuestion;
		});
		when(answerRepository.findByQuestionId(100, false)).thenReturn(List.of(originalAnswer));
		when(answerRepository.saveAll(any())).thenAnswer(invocation -> toAnswerList(invocation.getArgument(0)));
		when(formQuestionsRepository.save(any(FormQuestions.class))).thenAnswer(invocation -> invocation.getArgument(0));

		FormVersionDto dto = new FormVersionDto();
		dto.setAction("ensureEditableQuestion");
		dto.setId(10);
		dto.setQuestionId(100);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		Response<FormVersionDto> response = formVersionBusiness.custom(request, Locale.FRENCH);

		assertThat(isolatedQuestion.get()).isNotNull();
		assertThat(isolatedQuestion.get().getId()).isEqualTo(101);
		assertThat(targetLink.getQuestion()).isSameAs(isolatedQuestion.get());
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getQuestionId()).isEqualTo(101);
	}

	@Test
	void custom_publish_publishesTargetVersionAndDepublishesPreviousVersion() throws Exception {
		FormVersion currentPublishedVersion = buildFormVersion(10, 5, 1, true, true, false);
		FormVersion draftVersion = buildFormVersion(11, 5, 2, false, false, true);
		Question question = buildTextQuestion(100, "QREF-JAVA");
		FormQuestions draftLink = buildFormQuestion(draftVersion, question, 1);

		AtomicReference<FormVersion> savedPublishedVersion = new AtomicReference<>();

		when(formVersionRepository.findOne(11, false)).thenReturn(draftVersion);
		when(formVersionRepository.findByFormIdAndIsPublished(5, true, false)).thenReturn(List.of(currentPublishedVersion));
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(11, false)).thenReturn(List.of(draftLink));
		when(formVersionRepository.save(any(FormVersion.class))).thenAnswer(invocation -> {
			FormVersion version = invocation.getArgument(0);
			if (version.getId() != null && version.getId().equals(11)) {
				savedPublishedVersion.set(version);
			}
			return version;
		});

		FormVersionDto dto = new FormVersionDto();
		dto.setAction("publish");
		dto.setId(11);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		Response<FormVersionDto> response = formVersionBusiness.custom(request, Locale.FRENCH);

		assertThat(savedPublishedVersion.get()).isSameAs(draftVersion);
		assertThat(draftVersion.getIsPublished()).isTrue();
		assertThat(currentPublishedVersion.getIsPublished()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(11);
	}

	@Test
	void updateDeleted_restoresPublishedVersionWithoutLeavingTwoActivePublishedRows() throws Exception {
		FormVersion deletedPublishedVersion = buildFormVersion(10, 5, 1, true, false, false);
		deletedPublishedVersion.setIsDeleted(true);
		FormVersion currentPublishedVersion = buildFormVersion(12, 5, 2, true, false, false);
		Question question = buildTextQuestion(100, "QREF-RESTORE");

		when(formVersionRepository.findOne(10, true)).thenReturn(deletedPublishedVersion);
		when(formVersionRepository.findByFormIdAndIsPublished(5, true, false))
				.thenReturn(List.of(deletedPublishedVersion, currentPublishedVersion));
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(10, false))
				.thenReturn(List.of(buildFormQuestion(deletedPublishedVersion, question, 1)));
		when(formVersionRepository.save(any(FormVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(formVersionRepository.saveAll(any())).thenAnswer(invocation -> toFormVersionList(invocation.getArgument(0)));

		FormVersionDto dto = new FormVersionDto();
		dto.setId(10);
		dto.setIsDeleted(false);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormVersionDto> response = formVersionBusiness.updateDeleted(request, Locale.FRENCH);

		assertThat(deletedPublishedVersion.getIsDeleted()).isFalse();
		assertThat(deletedPublishedVersion.getIsPublished()).isTrue();
		assertThat(currentPublishedVersion.getIsPublished()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(10);
	}

	@Test
	void custom_duplicateQuestion_relinksDraftToNewQuestionCopyKeepingQuestionRef() throws Exception {
		FormVersion draftVersion = buildFormVersion(10, 5, 2, false, false, false);
		Question originalQuestion = buildTextQuestion(100, "QREF-DRAFT");
		originalQuestion.setQuestionChrono(45);
		originalQuestion.setScore(3);
		FormQuestions targetLink = buildFormQuestion(draftVersion, originalQuestion, 1);

		Answer originalAnswer = buildAnswer(originalQuestion, "Bonne reponse", 1, true);
		originalAnswer.setAllowAdditionalComment(true);
		originalAnswer.setAdditionalCommentRequired(true);
		originalAnswer.setAdditionalCommentPlaceholder("Precisez");

		AtomicReference<Question> duplicatedQuestion = new AtomicReference<>();
		AtomicReference<List<Answer>> duplicatedAnswers = new AtomicReference<>();

		when(formVersionRepository.findOne(10, false)).thenReturn(draftVersion);
		when(questionRepository.findOne(100, false)).thenReturn(originalQuestion);
		when(formQuestionsRepository.findByFormVersionId(10, false)).thenReturn(List.of(targetLink));
		when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
			Question savedQuestion = invocation.getArgument(0);
			savedQuestion.setId(101);
			duplicatedQuestion.set(savedQuestion);
			return savedQuestion;
		});
		when(answerRepository.findByQuestionId(100, false)).thenReturn(List.of(originalAnswer));
		when(answerRepository.saveAll(any())).thenAnswer(invocation -> {
			List<Answer> answers = toAnswerList(invocation.getArgument(0));
			duplicatedAnswers.set(answers);
			return answers;
		});
		when(formQuestionsRepository.save(any(FormQuestions.class))).thenAnswer(invocation -> invocation.getArgument(0));

		FormVersionDto dto = new FormVersionDto();
		dto.setAction("duplicateQuestion");
		dto.setId(10);
		dto.setQuestionId(100);

		Request<FormVersionDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormVersionDto> response = formVersionBusiness.custom(request, Locale.FRENCH);

		assertThat(duplicatedQuestion.get()).isNotNull();
		assertThat(duplicatedQuestion.get().getId()).isEqualTo(101);
		assertThat(duplicatedQuestion.get().getQuestionRef()).isEqualTo("QREF-DRAFT");
		assertThat(duplicatedQuestion.get().getQuestionText()).isEqualTo(originalQuestion.getQuestionText());
		assertThat(duplicatedQuestion.get().getQuestionChrono()).isEqualTo(45);
		assertThat(duplicatedQuestion.get().getScore()).isEqualTo(3);
		assertThat(targetLink.getQuestion()).isSameAs(duplicatedQuestion.get());
		assertThat(targetLink.getFormVersion()).isSameAs(draftVersion);
		assertThat(duplicatedAnswers.get()).hasSize(1);
		assertThat(duplicatedAnswers.get().getFirst().getQuestion()).isSameAs(duplicatedQuestion.get());
		assertThat(duplicatedAnswers.get().getFirst().getAnswerText()).isEqualTo("Bonne reponse");
		assertThat(duplicatedAnswers.get().getFirst().getAdditionalCommentPlaceholder()).isEqualTo("Precisez");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(10);
	}

	private FormVersion buildFormVersion(
			Integer id,
			Integer formId,
			Integer versionNumber,
			Boolean isPublished,
			Boolean isLocked,
			Boolean randomQuestions) {
		Form form = new Form();
		form.setId(formId);

		FormVersion formVersion = new FormVersion();
		formVersion.setId(id);
		formVersion.setForm(form);
		formVersion.setVersionNumber(versionNumber);
		formVersion.setIsPublished(isPublished);
		formVersion.setIsLocked(isLocked);
		formVersion.setRandomQuestions(randomQuestions);
		formVersion.setIsDeleted(false);
		return formVersion;
	}

	private Question buildTextQuestion(Integer id, String questionRef) {
		Question question = new Question();
		question.setId(id);
		question.setQuestionRef(questionRef);
		question.setQuestionText("Explain Java basics");
		question.setQuestionType(QuestionType.TEXT.getValue());
		question.setIsDeleted(false);
		return question;
	}

	private FormQuestions buildFormQuestion(FormVersion formVersion, Question question, Integer order) {
		FormQuestions formQuestion = new FormQuestions();
		formQuestion.setFormVersion(formVersion);
		formQuestion.setQuestion(question);
		formQuestion.setQuestionOrder(order);
		formQuestion.setIsDeleted(false);
		return formQuestion;
	}

	private Answer buildAnswer(Question question, String answerText, Integer order, Boolean isCorrect) {
		Answer answer = new Answer();
		answer.setQuestion(question);
		answer.setAnswerText(answerText);
		answer.setAnswerType("TEXT");
		answer.setAnswerOrder(order);
		answer.setIsCorrect(isCorrect);
		answer.setIsDeleted(false);
		return answer;
	}

	private List<FormVersion> toFormVersionList(Iterable<FormVersion> iterable) {
		List<FormVersion> versions = new ArrayList<>();
		for (FormVersion version : iterable) {
			versions.add(version);
		}
		return versions;
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
}