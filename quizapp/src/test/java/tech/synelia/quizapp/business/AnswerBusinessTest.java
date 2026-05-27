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

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.Answer;
import tech.synelia.quizapp.dao.entity.FormQuestions;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Question;
import tech.synelia.quizapp.dao.repository.AnswerRepository;
import tech.synelia.quizapp.dao.repository.CandidateAnswerRepository;
import tech.synelia.quizapp.dao.repository.FormQuestionsRepository;
import tech.synelia.quizapp.dao.repository.QuestionRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.AnswerDto;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class AnswerBusinessTest {

	@Mock
	private AnswerRepository answerRepository;
	@Mock
	private QuestionRepository questionRepository;
	@Mock
	private CandidateAnswerRepository candidateAnswerRepository;
	@Mock
	private FormQuestionsRepository formQuestionsRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private AnswerBusiness answerBusiness;

	@Test
	void update_allowsAdditionalCommentMetadataChangeEvenWhenQuestionIsLinkedToLockedVersion() throws Exception {
		Question question = new Question();
		question.setId(7);

		Answer existingAnswer = new Answer();
		existingAnswer.setId(11);
		existingAnswer.setQuestion(question);
		existingAnswer.setAnswerText("Reponse originale");
		existingAnswer.setAnswerType("TEXT");
		existingAnswer.setAnswerOrder(1);
		existingAnswer.setIsCorrect(false);
		existingAnswer.setAllowAdditionalComment(false);
		existingAnswer.setAdditionalCommentRequired(false);
		existingAnswer.setIsDeleted(false);

		FormVersion lockedVersion = new FormVersion();
		lockedVersion.setVersionNumber(4);
		lockedVersion.setIsLocked(true);
		FormQuestions lockedLink = new FormQuestions();
		lockedLink.setFormVersion(lockedVersion);

		when(answerRepository.findOne(11, false)).thenReturn(existingAnswer);
		lenient().when(formQuestionsRepository.findByQuestionId(7, false)).thenReturn(List.of(lockedLink));
		when(answerRepository.saveAll(any())).thenAnswer(invocation -> toAnswerList(invocation.getArgument(0)));

		AnswerDto dto = new AnswerDto();
		dto.setId(11);
		dto.setAnswerText("");
		dto.setAnswerType("");
		dto.setAllowAdditionalComment(true);
		dto.setAdditionalCommentRequired(true);
		dto.setAdditionalCommentPlaceholder("Precisez votre reponse");

		Request<AnswerDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<AnswerDto> response = answerBusiness.update(request, Locale.FRENCH);

		assertThat(existingAnswer.getAllowAdditionalComment()).isTrue();
		assertThat(existingAnswer.getAdditionalCommentRequired()).isTrue();
		assertThat(existingAnswer.getAdditionalCommentPlaceholder()).isEqualTo("Precisez votre reponse");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(11);
	}

	@Test
	void update_rejectsStructuralAnswerChangeWhenQuestionIsLinkedToLockedVersion() {
		Question question = new Question();
		question.setId(7);

		Answer existingAnswer = new Answer();
		existingAnswer.setId(11);
		existingAnswer.setQuestion(question);
		existingAnswer.setAnswerText("Reponse originale");
		existingAnswer.setAnswerType("TEXT");
		existingAnswer.setIsDeleted(false);

		FormVersion lockedVersion = new FormVersion();
		lockedVersion.setVersionNumber(4);
		lockedVersion.setIsLocked(true);
		FormQuestions lockedLink = new FormQuestions();
		lockedLink.setFormVersion(lockedVersion);

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_REQUEST_FAIL");
		failureStatus.setMessage("Cette reponse est rattachee a un formulaire verrouille (version 4). Creez d'abord une nouvelle version.");

		when(answerRepository.findOne(11, false)).thenReturn(existingAnswer);
		when(formQuestionsRepository.findByQuestionId(7, false)).thenReturn(List.of(lockedLink));
		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenReturn(failureStatus);

		AnswerDto dto = new AnswerDto();
		dto.setId(11);
		dto.setAnswerText("Reponse modifiee");

		Request<AnswerDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> answerBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(answerRepository, never()).saveAll(any());
	}

	private List<Answer> toAnswerList(Iterable<Answer> iterable) {
		List<Answer> answers = new ArrayList<>();
		for (Answer answer : iterable) {
			answers.add(answer);
		}
		return answers;
	}
}
