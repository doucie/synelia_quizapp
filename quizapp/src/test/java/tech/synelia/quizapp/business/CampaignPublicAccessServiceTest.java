package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class CampaignPublicAccessServiceTest {

	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FormVersionRepository formVersionRepository;
	@Mock
	private FunctionalError functionalError;

	@InjectMocks
	private CampaignPublicAccessService campaignPublicAccessService;

	@Test
	void ensureSourceTokenAllowsApplications_acceptsSharedFormWhenCampaignFormLinkExists() {
		Campaigns campaign = buildCampaign(11, "SOURCE_TOKEN");
		Form sharedForm = buildForm(7);
		SourceToken sourceToken = buildSourceToken(campaign, sharedForm);
		FormVersion publishedVersion = buildPublishedVersion(sharedForm, 3);

		when(campaignFormRepository.findActiveFormsByCampaignId(11)).thenReturn(List.of(sharedForm));
		when(campaignFormRepository.countActiveLinksByCampaignIdAndFormId(11, 7)).thenReturn(1L);
		when(formVersionRepository.findByFormIdAndIsPublished(7, true, false)).thenReturn(List.of(publishedVersion));

		assertDoesNotThrow(() -> campaignPublicAccessService.ensureSourceTokenAllowsApplications(sourceToken, 0, Locale.FRENCH));
	}

	@Test
	void ensureSourceTokenAllowsApplications_rejectsSourceTokenFormWithoutActiveCampaignFormLink() {
		Campaigns campaign = buildCampaign(11, "SOURCE_TOKEN");
		Form sharedForm = buildForm(7);
		SourceToken sourceToken = buildSourceToken(campaign, sharedForm);
		FormVersion publishedVersion = buildPublishedVersion(sharedForm, 3);

		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenAnswer(invocation -> {
			Status status = new Status();
			status.setCode("FUNC_REQUEST_FAIL");
			status.setMessage(invocation.getArgument(0));
			return status;
		});
		when(campaignFormRepository.findActiveFormsByCampaignId(11)).thenReturn(List.of(sharedForm));
		when(campaignFormRepository.countActiveLinksByCampaignIdAndFormId(11, 7)).thenReturn(0L);
		when(formVersionRepository.findByFormIdAndIsPublished(7, true, false)).thenReturn(List.of(publishedVersion));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> campaignPublicAccessService.ensureSourceTokenAllowsApplications(sourceToken, 0, Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("ne correspond pas a la campagne");
	}

	private Campaigns buildCampaign(Integer id, String formAssignmentStrategy) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		campaign.setCampaignStatus("OPEN");
		campaign.setFormAssignmentStrategy(formAssignmentStrategy);
		campaign.setPipelineTemplate(buildPipelineTemplate(5));
		campaign.setIsDeleted(false);
		return campaign;
	}

	private PipelineTemplate buildPipelineTemplate(Integer id) {
		PipelineTemplate pipelineTemplate = new PipelineTemplate();
		pipelineTemplate.setId(id);
		return pipelineTemplate;
	}

	private Form buildForm(Integer id) {
		Form form = new Form();
		form.setId(id);
		form.setFormName("Formulaire partage");
		form.setIsDeleted(false);
		return form;
	}

	private SourceToken buildSourceToken(Campaigns campaign, Form form) {
		SourceToken sourceToken = new SourceToken();
		sourceToken.setCampaigns(campaign);
		sourceToken.setForm(form);
		sourceToken.setIsDeleted(false);
		return sourceToken;
	}

	private FormVersion buildPublishedVersion(Form form, Integer versionNumber) {
		FormVersion formVersion = new FormVersion();
		formVersion.setId(versionNumber);
		formVersion.setForm(form);
		formVersion.setVersionNumber(versionNumber);
		formVersion.setIsPublished(true);
		formVersion.setIsDeleted(false);
		return formVersion;
	}
}