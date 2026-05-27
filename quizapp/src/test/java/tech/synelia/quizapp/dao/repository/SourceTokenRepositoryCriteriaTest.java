package tech.synelia.quizapp.dao.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.SourceTokenDto;

@ExtendWith(MockitoExtension.class)
class SourceTokenRepositoryCriteriaTest {

	@Mock
	private EntityManager em;
	@Mock
	private TypedQuery<SourceToken> typedQuery;

	@Test
	void getAllByCriteria_filtersFormIdThroughAssignedForm() throws Exception {
		SourceTokenRepository sourceTokenRepository = mock(SourceTokenRepository.class, CALLS_REAL_METHODS);
		when(em.createQuery(anyString(), eq(SourceToken.class))).thenReturn(typedQuery);
		when(typedQuery.getResultList()).thenReturn(List.of());

		SourceTokenDto dto = new SourceTokenDto();
		dto.setFormId(7);

		Request<SourceTokenDto> request = new Request<SourceTokenDto>();
		request.setData(dto);

		sourceTokenRepository.getAllByCriteria(request, em, Locale.FRENCH);

		ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
		verify(em).createQuery(queryCaptor.capture(), eq(SourceToken.class));
		verify(typedQuery).setParameter("formId_0", 7);

		assertThat(queryCaptor.getValue()).contains("e.form.id = :formId_0");
	}
}