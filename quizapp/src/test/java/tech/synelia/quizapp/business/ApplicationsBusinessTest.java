package tech.synelia.quizapp.business;

import java.lang.reflect.Method;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;

@ExtendWith(MockitoExtension.class)
class ApplicationsBusinessTest {

	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FormVersionRepository formVersionRepository;

	@InjectMocks
	private ApplicationsBusiness applicationsBusiness;

	@Test
	@SuppressWarnings("unchecked")
	void getPublishedFormVersionsForCampaign_preservesCampaignFormAssignmentOrder() throws Exception {
		Form secondAssignedForm = buildForm(20, "Formulaire B");
		Form firstAssignedForm = buildForm(10, "Formulaire A");
		FormVersion secondAssignedPublishedVersion = buildPublishedVersion(200, secondAssignedForm, 3);
		FormVersion firstAssignedPublishedVersion = buildPublishedVersion(100, firstAssignedForm, 5);

		when(campaignFormRepository.findActiveFormsByCampaignId(44)).thenReturn(List.of(secondAssignedForm, firstAssignedForm));
		when(formVersionRepository.findByFormIdAndIsPublished(20, true, false)).thenReturn(List.of(secondAssignedPublishedVersion));
		when(formVersionRepository.findByFormIdAndIsPublished(10, true, false)).thenReturn(List.of(firstAssignedPublishedVersion));

		Method method = ApplicationsBusiness.class.getDeclaredMethod("getPublishedFormVersionsForCampaign", Integer.class);
		method.setAccessible(true);

		List<FormVersion> publishedVersions = (List<FormVersion>) method.invoke(applicationsBusiness, 44);

		assertThat(publishedVersions)
				.extracting(version -> version.getForm().getId())
				.containsExactly(20, 10);
	}

	private Form buildForm(Integer id, String formName) {
		Form form = new Form();
		form.setId(id);
		form.setFormName(formName);
		form.setIsDeleted(false);
		return form;
	}

	private FormVersion buildPublishedVersion(Integer id, Form form, Integer versionNumber) {
		FormVersion formVersion = new FormVersion();
		formVersion.setId(id);
		formVersion.setForm(form);
		formVersion.setVersionNumber(versionNumber);
		formVersion.setIsPublished(true);
		formVersion.setIsDeleted(false);
		return formVersion;
	}
}