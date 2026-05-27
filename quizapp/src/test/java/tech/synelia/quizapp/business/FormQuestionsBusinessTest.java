package tech.synelia.quizapp.business;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.persistence.EntityManager;
import tech.synelia.quizapp.dao.entity.FormQuestions;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Question;
import tech.synelia.quizapp.dao.repository.FormQuestionsRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.dao.repository.QuestionRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.FormQuestionsDto;

@ExtendWith(MockitoExtension.class)
class FormQuestionsBusinessTest {

	@Mock
	private FormQuestionsRepository formQuestionsRepository;
	@Mock
	private FormVersionRepository formVersionRepository;
	@Mock
	private QuestionRepository questionRepository;
	@Mock
	private FormBusiness formBusiness;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;
	@Mock
	private EntityManager em;

	@InjectMocks
	private FormQuestionsBusiness formQuestionsBusiness;

	@Test
	void create_allowsReusingQuestionOrderWhenOnlySoftDeletedRowsHaveThatOrder() throws Exception {
		FormVersion draftVersion = new FormVersion();
		draftVersion.setId(10);
		draftVersion.setVersionNumber(2);
		draftVersion.setIsLocked(false);

		Question question = new Question();
		question.setId(100);
		question.setQuestionChrono(60);

		when(formVersionRepository.findOne(10, false)).thenReturn(draftVersion);
		when(questionRepository.findOne(100, false)).thenReturn(question);
		when(formQuestionsRepository.findByFormVersionIdAndQuestionOrder(10, 1, false)).thenReturn(List.of());
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionsList(invocation.getArgument(0)));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setFormVersionId(10);
		dto.setQuestionId(100);
		dto.setQuestionOrder(1);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormQuestionsDto> response = formQuestionsBusiness.create(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		verify(formQuestionsRepository).findByFormVersionIdAndQuestionOrder(10, 1, false);
		verify(formQuestionsRepository).saveAll(any());
	}

	@Test
	void create_insertsQuestionIntoOccupiedOrderAndShiftsOtherActiveLinks() throws Exception {
		FormVersion draftVersion = new FormVersion();
		draftVersion.setId(10);
		draftVersion.setVersionNumber(2);
		draftVersion.setIsLocked(false);

		Question question = new Question();
		question.setId(100);
		question.setQuestionChrono(60);

		FormQuestions firstLink = buildFormQuestion(1, draftVersion, 1);
		FormQuestions secondLink = buildFormQuestion(2, draftVersion, 2);

		when(formVersionRepository.findOne(10, false)).thenReturn(draftVersion);
		when(questionRepository.findOne(100, false)).thenReturn(question);
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(10, false)).thenAnswer(invocation -> sortByQuestionOrder(firstLink, secondLink));
		when(formQuestionsRepository.findByFormVersionIdAndQuestionOrder(eq(10), anyInt(), eq(false))).thenAnswer(invocation -> {
			Integer order = invocation.getArgument(1);
			return findByOrder(order, firstLink, secondLink);
		});
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionsList(invocation.getArgument(0)));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setFormVersionId(10);
		dto.setQuestionId(100);
		dto.setQuestionOrder(2);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormQuestionsDto> response = formQuestionsBusiness.create(request, Locale.FRENCH);
		ArgumentCaptor<Iterable<FormQuestions>> savedLinksCaptor = ArgumentCaptor.forClass(Iterable.class);
		verify(formQuestionsRepository, atLeastOnce()).saveAll(savedLinksCaptor.capture());
		List<Iterable<FormQuestions>> capturedSaves = savedLinksCaptor.getAllValues();
		List<FormQuestions> savedLinks = toFormQuestionsList(capturedSaves.get(capturedSaves.size() - 1));

		assertThat(response.getItems()).hasSize(1);
		assertThat(savedLinks).hasSize(1);
		assertThat(savedLinks.getFirst().getQuestionOrder()).isEqualTo(2);
		assertThat(secondLink.getQuestionOrder()).isEqualTo(3);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(10, false);
	}

	@Test
	void delete_compactsActiveQuestionOrdersAfterSoftDeletingALink() throws Exception {
		FormVersion draftVersion = new FormVersion();
		draftVersion.setId(10);
		draftVersion.setVersionNumber(2);
		draftVersion.setIsLocked(false);

		FormQuestions firstLink = buildFormQuestion(1, draftVersion, 1);
		FormQuestions deletedLink = buildFormQuestion(2, draftVersion, 2);
		FormQuestions thirdLink = buildFormQuestion(3, draftVersion, 3);

		when(formQuestionsRepository.findOne(2, false)).thenReturn(deletedLink);
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(10, false)).thenAnswer(invocation -> sortByQuestionOrder(firstLink, thirdLink));
		when(formQuestionsRepository.save(any(FormQuestions.class))).thenAnswer(invocation -> invocation.getArgument(0));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setId(2);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		formQuestionsBusiness.delete(request, Locale.FRENCH);

		assertThat(deletedLink.getIsDeleted()).isTrue();
		assertThat(firstLink.getQuestionOrder()).isEqualTo(1);
		assertThat(thirdLink.getQuestionOrder()).isEqualTo(2);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(10, false);
	}

	@Test
	void update_movesQuestionIntoOccupiedOrderAndShiftsOtherActiveLinks() throws Exception {
		FormVersion draftVersion = new FormVersion();
		draftVersion.setId(10);
		draftVersion.setVersionNumber(2);
		draftVersion.setIsLocked(false);

		Question targetQuestion = new Question();
		targetQuestion.setId(100);
		targetQuestion.setQuestionChrono(60);

		FormQuestions firstLink = buildFormQuestion(1, draftVersion, 1);
		FormQuestions secondLink = buildFormQuestion(2, draftVersion, 2);
		FormQuestions movedLink = buildFormQuestion(3, draftVersion, 3);
		movedLink.setQuestion(targetQuestion);

		when(formQuestionsRepository.findOne(3, false)).thenReturn(movedLink);
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(10, false)).thenAnswer(invocation -> sortByQuestionOrder(firstLink, secondLink, movedLink));
		when(formQuestionsRepository.findByFormVersionIdAndQuestionOrder(eq(10), anyInt(), eq(false))).thenAnswer(invocation -> {
			Integer order = invocation.getArgument(1);
			return findByOrder(order, firstLink, secondLink, movedLink);
		});
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionsList(invocation.getArgument(0)));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setId(3);
		dto.setQuestionOrder(2);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormQuestionsDto> response = formQuestionsBusiness.update(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		assertThat(movedLink.getQuestionOrder()).isEqualTo(2);
		assertThat(secondLink.getQuestionOrder()).isEqualTo(3);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(10, false);
	}

	@Test
	void update_movesQuestionToAnotherVersionAndNormalizesSourceAndTargetOrders() throws Exception {
		FormVersion sourceVersion = new FormVersion();
		sourceVersion.setId(10);
		sourceVersion.setVersionNumber(2);
		sourceVersion.setIsLocked(false);

		FormVersion targetVersion = new FormVersion();
		targetVersion.setId(20);
		targetVersion.setVersionNumber(3);
		targetVersion.setIsLocked(false);

		Question targetQuestion = new Question();
		targetQuestion.setId(100);
		targetQuestion.setQuestionChrono(60);

		FormQuestions sourceFirstLink = buildFormQuestion(1, sourceVersion, 1);
		FormQuestions movedLink = buildFormQuestion(3, sourceVersion, 2);
		movedLink.setQuestion(targetQuestion);
		FormQuestions sourceTrailingLink = buildFormQuestion(4, sourceVersion, 3);
		FormQuestions targetFirstLink = buildFormQuestion(5, targetVersion, 1);
		FormQuestions targetSecondLink = buildFormQuestion(6, targetVersion, 2);

		when(formQuestionsRepository.findOne(3, false)).thenReturn(movedLink);
		when(formVersionRepository.findOne(20, false)).thenReturn(targetVersion);
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(anyInt(), eq(false))).thenAnswer(invocation -> {
			Integer formVersionId = invocation.getArgument(0);
			if (Integer.valueOf(20).equals(formVersionId)) {
				return sortByQuestionOrder(targetFirstLink, targetSecondLink);
			}
			if (Integer.valueOf(10).equals(formVersionId)) {
				return sortByQuestionOrder(sourceFirstLink, sourceTrailingLink);
			}
			return List.of();
		});
		when(formQuestionsRepository.findByFormVersionIdAndQuestionOrder(eq(20), anyInt(), eq(false))).thenAnswer(invocation -> {
			Integer order = invocation.getArgument(1);
			return findByOrder(order, targetFirstLink, targetSecondLink);
		});
		when(formQuestionsRepository.save(any(FormQuestions.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionsList(invocation.getArgument(0)));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setId(3);
		dto.setFormVersionId(20);
		dto.setQuestionOrder(2);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormQuestionsDto> response = formQuestionsBusiness.update(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		assertThat(movedLink.getFormVersion()).isSameAs(targetVersion);
		assertThat(movedLink.getQuestionOrder()).isEqualTo(2);
		assertThat(targetSecondLink.getQuestionOrder()).isEqualTo(3);
		assertThat(sourceTrailingLink.getQuestionOrder()).isEqualTo(2);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(20, false);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(10, false);
	}

	@Test
	void updateDeleted_restoresQuestionIntoOccupiedOrderAndShiftsOtherActiveLinks() throws Exception {
		FormVersion draftVersion = new FormVersion();
		draftVersion.setId(10);
		draftVersion.setVersionNumber(2);
		draftVersion.setIsLocked(false);

		Question restoredQuestion = new Question();
		restoredQuestion.setId(200);
		restoredQuestion.setQuestionChrono(60);

		FormQuestions firstLink = buildFormQuestion(1, draftVersion, 1);
		FormQuestions secondActiveLink = buildFormQuestion(2, draftVersion, 2);
		FormQuestions restoredLink = buildFormQuestion(4, draftVersion, 2);
		restoredLink.setIsDeleted(true);
		restoredLink.setQuestion(restoredQuestion);

		when(formQuestionsRepository.findOne(4, true)).thenReturn(restoredLink);
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(10, false)).thenAnswer(invocation -> sortByQuestionOrder(firstLink, secondActiveLink));
		when(formQuestionsRepository.findByFormVersionIdAndQuestionOrder(eq(10), anyInt(), eq(false))).thenAnswer(invocation -> {
			Integer order = invocation.getArgument(1);
			return findByOrder(order, firstLink, secondActiveLink);
		});
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionsList(invocation.getArgument(0)));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setId(4);
		dto.setIsDeleted(false);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormQuestionsDto> response = formQuestionsBusiness.updateDeleted(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		assertThat(restoredLink.getIsDeleted()).isFalse();
		assertThat(restoredLink.getQuestionOrder()).isEqualTo(2);
		assertThat(secondActiveLink.getQuestionOrder()).isEqualTo(3);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(10, false);
	}

	@Test
	void updateDeleted_restoresQuestionIntoAnotherVersionAndShiftsTargetOrders() throws Exception {
		FormVersion sourceVersion = new FormVersion();
		sourceVersion.setId(10);
		sourceVersion.setVersionNumber(2);
		sourceVersion.setIsLocked(false);

		FormVersion targetVersion = new FormVersion();
		targetVersion.setId(20);
		targetVersion.setVersionNumber(3);
		targetVersion.setIsLocked(false);

		Question restoredQuestion = new Question();
		restoredQuestion.setId(200);
		restoredQuestion.setQuestionChrono(60);

		FormQuestions restoredLink = buildFormQuestion(4, sourceVersion, 2);
		restoredLink.setIsDeleted(true);
		restoredLink.setQuestion(restoredQuestion);
		FormQuestions targetFirstLink = buildFormQuestion(5, targetVersion, 1);
		FormQuestions targetSecondLink = buildFormQuestion(6, targetVersion, 2);

		when(formQuestionsRepository.findOne(4, true)).thenReturn(restoredLink);
		when(formVersionRepository.findOne(20, false)).thenReturn(targetVersion);
		when(formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(20, false)).thenAnswer(invocation -> sortByQuestionOrder(targetFirstLink, targetSecondLink));
		when(formQuestionsRepository.findByFormVersionIdAndQuestionOrder(eq(20), anyInt(), eq(false))).thenAnswer(invocation -> {
			Integer order = invocation.getArgument(1);
			return findByOrder(order, targetFirstLink, targetSecondLink);
		});
		when(formQuestionsRepository.saveAll(any())).thenAnswer(invocation -> toFormQuestionsList(invocation.getArgument(0)));

		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setId(4);
		dto.setFormVersionId(20);
		dto.setQuestionOrder(2);
		dto.setIsDeleted(false);

		Request<FormQuestionsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<FormQuestionsDto> response = formQuestionsBusiness.updateDeleted(request, Locale.FRENCH);

		assertThat(response.getItems()).hasSize(1);
		assertThat(restoredLink.getIsDeleted()).isFalse();
		assertThat(restoredLink.getFormVersion()).isSameAs(targetVersion);
		assertThat(restoredLink.getQuestionOrder()).isEqualTo(2);
		assertThat(targetSecondLink.getQuestionOrder()).isEqualTo(3);
		verify(formQuestionsRepository).findByFormVersionIdOrderByQuestionOrder(20, false);
	}

	private FormQuestions buildFormQuestion(int id, FormVersion formVersion, int questionOrder) {
		FormQuestions formQuestion = new FormQuestions();
		formQuestion.setId(id);
		formQuestion.setFormVersion(formVersion);
		formQuestion.setQuestionOrder(questionOrder);
		formQuestion.setIsDeleted(false);
		return formQuestion;
	}

	private List<FormQuestions> sortByQuestionOrder(FormQuestions... formQuestions) {
		List<FormQuestions> items = new ArrayList<>();
		for (FormQuestions formQuestion : formQuestions) {
			items.add(formQuestion);
		}
		items.sort(Comparator.comparing(FormQuestions::getQuestionOrder));
		return items;
	}

	private List<FormQuestions> findByOrder(Integer order, FormQuestions... formQuestions) {
		List<FormQuestions> matches = new ArrayList<>();
		for (FormQuestions formQuestion : formQuestions) {
			if (formQuestion != null
					&& !Boolean.TRUE.equals(formQuestion.getIsDeleted())
					&& formQuestion.getQuestionOrder() != null
					&& formQuestion.getQuestionOrder().equals(order)) {
				matches.add(formQuestion);
			}
		}
		return matches;
	}

	private List<FormQuestions> toFormQuestionsList(Iterable<FormQuestions> iterable) {
		List<FormQuestions> items = new ArrayList<>();
		for (FormQuestions item : iterable) {
			items.add(item);
		}
		return items;
	}
}