package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.CampaignFormDto;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class CampaignFormBusinessTest {

	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private FormRepository formRepository;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private CampaignFormBusiness campaignFormBusiness;

	@Test
	void create_rejectsDuplicateActiveLink() {
		Campaigns campaign = buildCampaign(5, "Campagne data");
		Form form = buildForm(9, "Quiz Java", "Description Java");
		CampaignForm existingLink = buildCampaignForm(100, campaign, form, false);

		when(campaignsRepository.findOne(5, false)).thenReturn(campaign);
		when(formRepository.findOne(9, false)).thenReturn(form);
		when(campaignFormRepository.findByCampaignId(5)).thenReturn(List.of(existingLink));

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_REQUEST_FAIL");
		failureStatus.setMessage("Cette campagne est deja liee a ce formulaire.");
		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CampaignFormDto dto = new CampaignFormDto();
		dto.setCampaignId(5);
		dto.setFormId(9);

		Request<CampaignFormDto> request = new Request<CampaignFormDto>();
		request.setUser(44);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> campaignFormBusiness.create(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(campaignFormRepository, never()).saveAll(any());
	}

	@Test
	void create_defaultsAssignmentOrderAndBuildsSearchString() throws Exception {
		Campaigns campaign = buildCampaign(5, "Campagne produit");
		Form form = buildForm(9, "Quiz Angular", "Evaluation partagee");

		when(campaignsRepository.findOne(5, false)).thenReturn(campaign);
		when(formRepository.findOne(9, false)).thenReturn(form);
		when(campaignFormRepository.findByCampaignId(5)).thenReturn(List.of());
		when(campaignFormRepository.saveAll(any())).thenAnswer(invocation -> {
			List<CampaignForm> links = toCampaignFormList(invocation.getArgument(0));
			links.getFirst().setId(501);
			return links;
		});

		CampaignFormDto dto = new CampaignFormDto();
		dto.setCampaignId(5);
		dto.setFormId(9);

		Request<CampaignFormDto> request = new Request<CampaignFormDto>();
		request.setUser(44);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<CampaignFormDto> response = campaignFormBusiness.create(request, Locale.FRENCH);

		ArgumentCaptor<Iterable<CampaignForm>> captor = ArgumentCaptor.forClass(Iterable.class);
		verify(campaignFormRepository).saveAll(captor.capture());
		List<CampaignForm> savedItems = toCampaignFormList(captor.getValue());
		assertThat(savedItems).hasSize(1);
		assertThat(savedItems.getFirst().getAssignmentOrder()).isEqualTo(1);
		assertThat(savedItems.getFirst().getSearchString()).contains("Campagne produit", "Quiz Angular");
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(501);
	}

	@Test
	void create_doesNotMutateLegacyFormCampaignProjectionWhenFormBecomesShared() throws Exception {
		Campaigns sharedCampaign = buildCampaign(5, "Campagne partagee");
		Form form = buildForm(9, "Quiz Angular", "Evaluation partagee");

		when(campaignsRepository.findOne(5, false)).thenReturn(sharedCampaign);
		when(formRepository.findOne(9, false)).thenReturn(form);
		when(campaignFormRepository.findByCampaignId(5)).thenReturn(List.of());
		when(campaignFormRepository.saveAll(any())).thenAnswer(invocation -> {
			List<CampaignForm> links = toCampaignFormList(invocation.getArgument(0));
			links.getFirst().setId(501);
			return links;
		});

		CampaignFormDto dto = new CampaignFormDto();
		dto.setCampaignId(5);
		dto.setFormId(9);

		Request<CampaignFormDto> request = new Request<CampaignFormDto>();
		request.setUser(44);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		campaignFormBusiness.create(request, Locale.FRENCH);

		verify(formRepository, never()).saveAll(any());
	}

	private Campaigns buildCampaign(Integer id, String title) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		campaign.setCampaignTitle(title);
		campaign.setIsDeleted(false);
		return campaign;
	}

	private Form buildForm(Integer id, String name, String desc) {
		Form form = new Form();
		form.setId(id);
		form.setFormName(name);
		form.setFormDesc(desc);
		form.setIsActive(true);
		form.setIsDeleted(false);
		return form;
	}

	private CampaignForm buildCampaignForm(Integer id, Campaigns campaign, Form form, boolean isDeleted) {
		CampaignForm link = new CampaignForm();
		link.setId(id);
		link.setCampaigns(campaign);
		link.setForm(form);
		link.setIsDeleted(isDeleted);
		return link;
	}

	private List<CampaignForm> toCampaignFormList(Iterable<CampaignForm> iterable) {
		List<CampaignForm> links = new ArrayList<CampaignForm>();
		iterable.forEach(links::add);
		return links;
	}

}