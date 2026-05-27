package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
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

import tech.synelia.quizapp.dao.entity.FormQuestions;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Question;
import tech.synelia.quizapp.dao.entity.Specialities;
import tech.synelia.quizapp.dao.repository.AnswerRepository;
import tech.synelia.quizapp.dao.repository.FormQuestionsRepository;
import tech.synelia.quizapp.dao.repository.QuestionRepository;
import tech.synelia.quizapp.dao.repository.SpecialitiesRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.QuestionDto;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class QuestionBusinessTest {

	@Mock
	private QuestionRepository questionRepository;
	@Mock
	private SpecialitiesRepository specialitiesRepository;
	@Mock
	private FormQuestionsRepository formQuestionsRepository;
	@Mock
	private AnswerRepository answerRepository;
	@Mock
	private FormBusiness formBusiness;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private QuestionBusiness questionBusiness;

	@Test
	void create_generatesServerManagedQuestionRefEvenWhenClientProvidesOne() throws Exception {
		Specialities specialities = new Specialities();
		specialities.setId(1);
		when(specialitiesRepository.findOne(1, false)).thenReturn(specialities);

		AtomicReference<Question> persistedQuestion = new AtomicReference<>();
		when(questionRepository.saveAll(any())).thenAnswer(invocation -> {
			Iterable<Question> iterable = invocation.getArgument(0);
			List<Question> questions = toQuestionList(iterable);
			Question savedQuestion = questions.getFirst();
			savedQuestion.setId(42);
			persistedQuestion.set(savedQuestion);
			return questions;
		});

		QuestionDto dto = new QuestionDto();
		dto.setQuestionText("Quel est le type de retour ?");
		dto.setQuestionType("text");
		dto.setSpecialityId(1);
		dto.setQuestionRef("client-managed-ref");

		Request<QuestionDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<QuestionDto> response = questionBusiness.create(request, Locale.FRENCH);

		assertThat(persistedQuestion.get()).isNotNull();
		assertThat(persistedQuestion.get().getQuestionRef())
				.isNotBlank()
				.isNotEqualTo("client-managed-ref");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(42);
	}

	@Test
	void update_rejectsManualQuestionRefMutation() throws Exception {
		Question existingQuestion = new Question();
		existingQuestion.setId(7);
		existingQuestion.setQuestionRef("server-owned-ref");

		when(questionRepository.findOne(7, false)).thenReturn(existingQuestion);

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_REQUEST_FAIL");
		failureStatus.setMessage("questionRef est gere par le serveur et ne peut pas etre modifie manuellement.");
		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenReturn(failureStatus);

		QuestionDto dto = new QuestionDto();
		dto.setId(7);
		dto.setQuestionRef("tampered-ref");

		Request<QuestionDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> questionBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(questionRepository, never()).saveAll(any());
	}

	@Test
	void update_allowsNonStructuralQuestionMetadataChangeEvenWhenLinkedToLockedVersion() throws Exception {
		Question existingQuestion = new Question();
		existingQuestion.setId(7);
		existingQuestion.setQuestionRef("server-owned-ref");
		existingQuestion.setQuestionText("Texte original");
		existingQuestion.setQuestionType("TEXT");
		existingQuestion.setDifficultyLevel("EASY");
		existingQuestion.setQuestionChrono(30);
		existingQuestion.setScore(2);
		existingQuestion.setIsDeleted(false);

		Specialities existingSpeciality = new Specialities();
		existingSpeciality.setId(1);
		existingQuestion.setSpecialities(existingSpeciality);

		Specialities updatedSpeciality = new Specialities();
		updatedSpeciality.setId(3);

		FormVersion lockedVersion = new FormVersion();
		lockedVersion.setVersionNumber(4);
		lockedVersion.setIsLocked(true);
		FormQuestions lockedLink = new FormQuestions();
		lockedLink.setFormVersion(lockedVersion);

		when(questionRepository.findOne(7, false)).thenReturn(existingQuestion);
		lenient().when(formQuestionsRepository.findByQuestionId(7, false)).thenReturn(List.of(lockedLink));
		when(specialitiesRepository.findOne(3, false)).thenReturn(updatedSpeciality);
		when(questionRepository.saveAll(any())).thenAnswer(invocation -> toQuestionList(invocation.getArgument(0)));

		QuestionDto dto = new QuestionDto();
		dto.setId(7);
		dto.setQuestionRef("");
		dto.setQuestionText("");
		dto.setQuestionType("");
		dto.setSpecialityId(3);
		dto.setDifficultyLevel("hard");

		Request<QuestionDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<QuestionDto> response = questionBusiness.update(request, Locale.FRENCH);

		assertThat(existingQuestion.getSpecialities()).isSameAs(updatedSpeciality);
		assertThat(existingQuestion.getDifficultyLevel()).isEqualTo("HARD");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
	}

	@Test
	void update_rejectsStructuralQuestionChangeWhenLinkedToLockedVersion() {
		Question existingQuestion = new Question();
		existingQuestion.setId(7);
		existingQuestion.setQuestionRef("server-owned-ref");
		existingQuestion.setQuestionText("Texte original");
		existingQuestion.setQuestionType("TEXT");
		existingQuestion.setIsDeleted(false);

		FormVersion lockedVersion = new FormVersion();
		lockedVersion.setVersionNumber(4);
		lockedVersion.setIsLocked(true);
		FormQuestions lockedLink = new FormQuestions();
		lockedLink.setFormVersion(lockedVersion);

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_DATA_NOT_DELETABLE");
		failureStatus.setMessage("Cette question est dans un formulaire verrouille (version 4)");

		when(questionRepository.findOne(7, false)).thenReturn(existingQuestion);
		when(formQuestionsRepository.findByQuestionId(7, false)).thenReturn(List.of(lockedLink));
		when(functionalError.DATA_NOT_DELETABLE(anyString(), any(Locale.class))).thenReturn(failureStatus);

		QuestionDto dto = new QuestionDto();
		dto.setId(7);
		dto.setQuestionText("Texte modifie");

		Request<QuestionDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InternalErrorException exception = assertThrows(
				InternalErrorException.class,
				() -> questionBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(questionRepository, never()).saveAll(any());
	}

	@Test
	void update_allowsRevertOfIsolatedDraftQuestionInPlace() throws Exception {
		Question draftQuestion = new Question();
		draftQuestion.setId(7);
		draftQuestion.setQuestionRef("QREF-REVERT");
		draftQuestion.setQuestionText("Texte modifie sur brouillon");
		draftQuestion.setQuestionType("TEXT");
		draftQuestion.setIsDeleted(false);

		FormVersion unlockedDraftVersion = new FormVersion();
		unlockedDraftVersion.setVersionNumber(2);
		unlockedDraftVersion.setIsLocked(false);
		FormQuestions draftLink = new FormQuestions();
		draftLink.setFormVersion(unlockedDraftVersion);

		when(questionRepository.findOne(7, false)).thenReturn(draftQuestion);
		when(formQuestionsRepository.findByQuestionId(7, false)).thenReturn(List.of(draftLink));
		when(questionRepository.saveAll(any())).thenAnswer(invocation -> toQuestionList(invocation.getArgument(0)));

		QuestionDto dto = new QuestionDto();
		dto.setId(7);
		dto.setQuestionRef("");
		dto.setQuestionType("");
		dto.setDifficultyLevel("");
		dto.setQuestionText("Texte original");

		Request<QuestionDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<QuestionDto> response = questionBusiness.update(request, Locale.FRENCH);

		assertThat(draftQuestion.getId()).isEqualTo(7);
		assertThat(draftQuestion.getQuestionRef()).isEqualTo("QREF-REVERT");
		assertThat(draftQuestion.getQuestionText()).isEqualTo("Texte original");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(7);
	}

	private List<Question> toQuestionList(Iterable<Question> iterable) {
		List<Question> questions = new ArrayList<>();
		for (Question question : iterable) {
			questions.add(question);
		}
		return questions;
	}
}