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
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.dto.FormDto;

@ExtendWith(MockitoExtension.class)
class FormRepositoryCriteriaTest {

	@Mock
	private EntityManager em;
	@Mock
	private TypedQuery<Form> typedQuery;

	@Test
	void getAllByCriteria_filtersCampaignIdThroughCampaignFormLinks() throws Exception {
		FormRepository formRepository = mock(FormRepository.class, CALLS_REAL_METHODS);
		when(em.createQuery(anyString(), eq(Form.class))).thenReturn(typedQuery);
		when(typedQuery.getResultList()).thenReturn(List.of());

		FormDto dto = new FormDto();
		dto.setCampaignId(11);

		Request<FormDto> request = new Request<FormDto>();
		request.setData(dto);

		formRepository.getAllByCriteria(request, em, Locale.FRENCH);

		ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
		verify(em).createQuery(queryCaptor.capture(), eq(Form.class));
		verify(typedQuery).setParameter("campaignId_0", 11);

		assertThat(queryCaptor.getValue())
				.contains("exists (select cf.id from CampaignForm cf")
				.contains("cf.form.id = e.id")
				.contains("cf.isDeleted = false")
				.contains("cf.campaigns.isDeleted = false")
				.contains("cf.campaigns.id = :campaignId_0")
				.doesNotContain("e.campaigns.id = :campaignId_0");
	}
}