package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.entity.Specialities;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.dao.repository.PipelineTemplateRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.dao.repository.SpecialitiesRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.CampaignsDto;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class CampaignsBusinessTest {

	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private PermissionService permissionService;
	@Mock
	private EntityPermissionRepository entityPermissionRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private FormRepository formRepository;
	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FormBusiness formBusiness;
	@Mock
	private SpecialitiesRepository specialitiesRepository;
	@Mock
	private InterviewsRepository interviewsRepository;
	@Mock
	private SourceTokenRepository sourceTokenRepository;
	@Mock
	private PipelineTemplateRepository pipelineTemplateRepository;
	@Mock
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private CampaignPublicAccessService campaignPublicAccessService;
	@Mock
	private FunctionalError functionalError;
	@Mock
	private TechnicalError technicalError;
	@Mock
	private ExceptionUtils exceptionUtils;

	@InjectMocks
	private CampaignsBusiness campaignsBusiness;

	@Test
	void getPublicAvailableCampaigns_enrichesDirectApplyAndRecruiterCodeModes() throws Exception {
		Campaigns directCampaign = buildCampaign(11, false);
		directCampaign.setCampaignTitle("Campagne directe");
		directCampaign.setFormAssignmentStrategy("SEQUENTIAL");

		Campaigns tokenCampaign = buildCampaign(12, false);
		tokenCampaign.setCampaignTitle("Campagne avec code");
		tokenCampaign.setFormAssignmentStrategy("SOURCE_TOKEN");

		when(campaignsRepository.findByCampaignStatus("OPEN", false)).thenReturn(List.of(directCampaign, tokenCampaign));
		when(campaignPublicAccessService.canBeListedPublicly(directCampaign)).thenReturn(true);
		when(campaignPublicAccessService.canBeListedPublicly(tokenCampaign)).thenReturn(true);
		when(campaignPublicAccessService.requiresSourceToken(directCampaign)).thenReturn(false);
		when(campaignPublicAccessService.requiresSourceToken(tokenCampaign)).thenReturn(true);

		Response<CampaignsDto> response = campaignsBusiness.getPublicAvailableCampaigns(Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(2);
		assertThat(response.getItems())
				.extracting(CampaignsDto::getCampaignTitle, CampaignsDto::getPublicApplyEnabled, CampaignsDto::getRequiresSourceToken)
				.containsExactly(
					tuple("Campagne directe", true, false),
					tuple("Campagne avec code", false, true));
	}

	@Test
	void update_rejectsTimeAllFormsChangeWhenAssignedFormVersionsExist() {
		Campaigns existingCampaign = buildCampaign(11, false);

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "UPDATE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(applicationsRepository.countAssignedFormVersionByCampaignId(11, false)).thenReturn(2L);

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_REQUEST_FAIL");
		failureStatus.setMessage("Le chronometrage campagne ne peut pas etre modifie en place lorsqu'il existe deja des candidatures rattachees a une version de formulaire.");
		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);
		dto.setCampaignTitle("");
		dto.setCampaignDesc("");
		dto.setCampaignStatus("");
		dto.setCampaignStart("");
		dto.setCampaignEnd("");
		dto.setFormAssignmentStrategy("");
		dto.setFormAssignmentExhaustionPolicy("");
		dto.setSearchString("");
		dto.setTimeAllForms(true);

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> campaignsBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(campaignsRepository, never()).saveAll(any());
		verifyNoInteractions(formBusiness);
	}

	@Test
	void update_allowsTimeAllFormsChangeWhenNoAssignedFormVersionExists() throws Exception {
		Campaigns existingCampaign = buildCampaign(11, false);

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "UPDATE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(applicationsRepository.countAssignedFormVersionByCampaignId(11, false)).thenReturn(0L);
		when(campaignsRepository.saveAll(any())).thenAnswer(invocation -> toCampaignList(invocation.getArgument(0)));

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);
		dto.setCampaignTitle("");
		dto.setCampaignDesc("");
		dto.setCampaignStatus("");
		dto.setCampaignStart("");
		dto.setCampaignEnd("");
		dto.setFormAssignmentStrategy("");
		dto.setFormAssignmentExhaustionPolicy("");
		dto.setSearchString("");
		dto.setTimeAllForms(true);

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<CampaignsDto> response = campaignsBusiness.update(request, Locale.FRENCH);

		assertThat(existingCampaign.getTimeAllForms()).isTrue();
		assertThat(existingCampaign.getIsTimed()).isTrue();
		assertThat(response.getItems()).hasSize(1);
		assertThat(response.getItems().getFirst().getId()).isEqualTo(11);
		verifyNoInteractions(formBusiness);
	}

	@Test
	void update_allowsDraftPublicationWhenCampaignHasCampaignFormLink() throws Exception {
		Campaigns existingCampaign = buildCampaign(11, false);
		existingCampaign.setSpecialities(buildSpeciality(3));
		existingCampaign.setPipelineTemplate(buildPipelineTemplate(5));

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "UPDATE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(campaignFormRepository.findActiveFormsByCampaignId(11)).thenReturn(List.of(buildForm(7)));
		when(campaignsRepository.saveAll(any())).thenAnswer(invocation -> toCampaignList(invocation.getArgument(0)));

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);
		dto.setCampaignTitle("");
		dto.setCampaignDesc("");
		dto.setCampaignStatus("OPEN");
		dto.setCampaignStart("");
		dto.setCampaignEnd("");
		dto.setFormAssignmentStrategy("");
		dto.setFormAssignmentExhaustionPolicy("");
		dto.setSearchString("");

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));

		Response<CampaignsDto> response = campaignsBusiness.update(request, Locale.FRENCH);

		assertThat(existingCampaign.getCampaignStatus()).isEqualTo("OPEN");
		assertThat(response.getItems()).hasSize(1);
		verify(campaignFormRepository).findActiveFormsByCampaignId(11);
	}

	@Test
	void update_rejectsDraftPublicationWhenCampaignHasNoActiveCampaignFormLink() {
		Campaigns existingCampaign = buildCampaign(11, false);
		existingCampaign.setSpecialities(buildSpeciality(3));
		existingCampaign.setPipelineTemplate(buildPipelineTemplate(5));

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "UPDATE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(campaignFormRepository.findActiveFormsByCampaignId(11)).thenReturn(List.of());

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_DISALLOWED_OPERATION");
		failureStatus.setMessage("Publication de campagne impossible: au moins un formulaire rattache");
		when(functionalError.DISALLOWED_OPERATION(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);
		dto.setCampaignTitle("");
		dto.setCampaignDesc("");
		dto.setCampaignStatus("OPEN");
		dto.setCampaignStart("");
		dto.setCampaignEnd("");
		dto.setFormAssignmentStrategy("");
		dto.setFormAssignmentExhaustionPolicy("");
		dto.setSearchString("");

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> campaignsBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		verify(campaignFormRepository).findActiveFormsByCampaignId(11);
		verify(campaignsRepository, never()).saveAll(any());
	}

	@Test
	void delete_detachesCampaignFormLinksBeforeDeletingCampaign() throws Exception {
		Campaigns existingCampaign = buildCampaign(11, false);
		CampaignForm campaignFormLink = buildCampaignForm(31, existingCampaign, buildForm(7));

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "DELETE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 11)).thenReturn(List.of());
		when(campaignFormRepository.findByCampaignId(11)).thenReturn(List.of(campaignFormLink));
		when(interviewsRepository.findByCampaignId(11, false)).thenReturn(List.of());
		when(applicationsRepository.countByCampaignId(11, false)).thenReturn(0L);
		when(sourceTokenRepository.findByCampaignId(11, false)).thenReturn(List.of());

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		Response<CampaignsDto> response = campaignsBusiness.delete(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(existingCampaign.getIsDeleted()).isTrue();
		assertThat(campaignFormLink.getIsDeleted()).isTrue();
		verify(campaignFormRepository).saveAll(any());
		verifyNoInteractions(formRepository);
	}

	@Test
	void delete_rejectsWhenCampaignHasInterviewDependency() {
		Campaigns existingCampaign = buildCampaign(11, false);
		CampaignForm campaignFormLink = buildCampaignForm(31, existingCampaign, buildForm(7));

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "DELETE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 11)).thenReturn(List.of());
		when(campaignFormRepository.findByCampaignId(11)).thenReturn(List.of(campaignFormLink));
		when(interviewsRepository.findByCampaignId(11, false)).thenReturn(List.of(new Interviews()));

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_DATA_NOT_DELETABLE");
		failureStatus.setMessage("(1)");
		when(functionalError.DATA_NOT_DELETABLE(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InternalErrorException exception = assertThrows(
				InternalErrorException.class,
				() -> campaignsBusiness.delete(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		assertThat(existingCampaign.getIsDeleted()).isFalse();
		assertThat(campaignFormLink.getIsDeleted()).isFalse();
		verify(campaignFormRepository, never()).saveAll(any());
		verify(campaignsRepository, never()).saveAll(any());
	}

	@Test
	void delete_rejectsWhenCampaignHasApplicationHistory() {
		Campaigns existingCampaign = buildCampaign(11, false);
		CampaignForm campaignFormLink = buildCampaignForm(31, existingCampaign, buildForm(7));

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "DELETE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 11)).thenReturn(List.of());
		when(campaignFormRepository.findByCampaignId(11)).thenReturn(List.of(campaignFormLink));
		when(interviewsRepository.findByCampaignId(11, false)).thenReturn(List.of());
		when(applicationsRepository.countByCampaignId(11, false)).thenReturn(2L);

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_DATA_NOT_DELETABLE");
		failureStatus.setMessage("(2)");
		when(functionalError.DATA_NOT_DELETABLE(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InternalErrorException exception = assertThrows(
				InternalErrorException.class,
				() -> campaignsBusiness.delete(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		assertThat(existingCampaign.getIsDeleted()).isFalse();
		assertThat(campaignFormLink.getIsDeleted()).isFalse();
		verify(campaignFormRepository, never()).saveAll(any());
		verify(campaignsRepository, never()).saveAll(any());
	}

	@Test
	void delete_rejectsWhenCampaignHasSourceTokenDependency() {
		Campaigns existingCampaign = buildCampaign(11, false);
		CampaignForm campaignFormLink = buildCampaignForm(31, existingCampaign, buildForm(7));

		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "ADMIN")).thenReturn(false);
		when(permissionService.hasEntityPermission(99, "CAMPAIGN", 11, "DELETE")).thenReturn(true);
		when(campaignsRepository.findOne(11, false)).thenReturn(existingCampaign);
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 11)).thenReturn(List.of());
		when(campaignFormRepository.findByCampaignId(11)).thenReturn(List.of(campaignFormLink));
		when(interviewsRepository.findByCampaignId(11, false)).thenReturn(List.of());
		when(applicationsRepository.countByCampaignId(11, false)).thenReturn(0L);
		when(sourceTokenRepository.findByCampaignId(11, false)).thenReturn(List.of(new SourceToken()));

		Status failureStatus = new Status();
		failureStatus.setCode("FUNC_DATA_NOT_DELETABLE");
		failureStatus.setMessage("(1)");
		when(functionalError.DATA_NOT_DELETABLE(anyString(), any(Locale.class))).thenReturn(failureStatus);

		CampaignsDto dto = new CampaignsDto();
		dto.setId(11);

		Request<CampaignsDto> request = new Request<>();
		request.setUser(99);
		request.setDatas(List.of(dto));

		InternalErrorException exception = assertThrows(
				InternalErrorException.class,
				() -> campaignsBusiness.delete(request, Locale.FRENCH));

		assertThat(exception.getStatus()).isSameAs(failureStatus);
		assertThat(existingCampaign.getIsDeleted()).isFalse();
		assertThat(campaignFormLink.getIsDeleted()).isFalse();
		verify(campaignFormRepository, never()).saveAll(any());
		verify(campaignsRepository, never()).saveAll(any());
	}

	private Campaigns buildCampaign(Integer id, Boolean timeAllForms) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		campaign.setCampaignTitle("Campagne Java");
		campaign.setCampaignStatus("DRAFT");
		campaign.setIsArchived(false);
		campaign.setTimeAllForms(timeAllForms);
		campaign.setIsTimed(timeAllForms);
		campaign.setIsDeleted(false);
		return campaign;
	}

	private Form buildForm(Integer id) {
		Form form = new Form();
		form.setId(id);
		form.setFormName("Formulaire partage");
		form.setIsDeleted(false);
		return form;
	}

	private CampaignForm buildCampaignForm(Integer id, Campaigns campaign, Form form) {
		CampaignForm campaignForm = new CampaignForm();
		campaignForm.setId(id);
		campaignForm.setCampaigns(campaign);
		campaignForm.setForm(form);
		campaignForm.setIsDeleted(false);
		return campaignForm;
	}

	private Specialities buildSpeciality(Integer id) {
		Specialities speciality = new Specialities();
		speciality.setId(id);
		return speciality;
	}

	private PipelineTemplate buildPipelineTemplate(Integer id) {
		PipelineTemplate pipelineTemplate = new PipelineTemplate();
		pipelineTemplate.setId(id);
		return pipelineTemplate;
	}

	private List<Campaigns> toCampaignList(Iterable<Campaigns> iterable) {
		List<Campaigns> campaigns = new ArrayList<>();
		for (Campaigns campaign : iterable) {
			campaigns.add(campaign);
		}
		return campaigns;
	}
}