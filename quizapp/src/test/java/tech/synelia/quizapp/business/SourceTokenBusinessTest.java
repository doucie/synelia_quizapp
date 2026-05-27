package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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

import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.SourceTokenDto;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@ExtendWith(MockitoExtension.class)
class SourceTokenBusinessTest {

	@Mock
	private SourceTokenRepository sourceTokenRepository;
	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private FormRepository formRepository;
	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FunctionalError functionalError;

	@InjectMocks
	private SourceTokenBusiness sourceTokenBusiness;

	@Test
	void create_acceptsSharedFormWhenExplicitCampaignLinkExists() throws Exception {
		Request<SourceTokenDto> request = buildRequest(buildCreateDto(11, 7, "portal-main"));
		Campaigns campaign = buildCampaign(11);
		Form sharedForm = buildForm(7);
		AtomicReference<List<SourceToken>> savedTokens = new AtomicReference<List<SourceToken>>();

		when(campaignsRepository.findOne(11, false)).thenReturn(campaign);
		when(formRepository.findOne(7, false)).thenReturn(sharedForm);
		when(campaignFormRepository.countActiveLinksByCampaignIdAndFormId(11, 7)).thenReturn(1L);
		when(sourceTokenRepository.findBySourceTokenNameAndCampaignId("portal-main", 11, false)).thenReturn(null);
		when(sourceTokenRepository.findByTokenString(anyString(), eq(false))).thenReturn(null);
		when(sourceTokenRepository.saveAll(any())).thenAnswer(invocation -> captureAndReturnSavedTokens(invocation.getArgument(0), savedTokens));

		Response<SourceTokenDto> response = sourceTokenBusiness.create(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(savedTokens.get()).hasSize(1);
		assertThat(savedTokens.get().get(0).getCampaigns().getId()).isEqualTo(11);
		assertThat(savedTokens.get().get(0).getForm().getId()).isEqualTo(7);
	}

	@Test
	void create_rejectsFormWithoutExplicitCampaign() throws Exception {
		Request<SourceTokenDto> request = buildRequest(buildCreateDto(null, 7, "portal-main"));
		Form sharedForm = buildForm(7);

		mockRequestFail();
		when(formRepository.findOne(7, false)).thenReturn(sharedForm);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> sourceTokenBusiness.create(request, Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("Une campagne doit etre selectionnee");
	}

	@Test
	void update_acceptsSharedFormWhenExistingCampaignLinkExists() throws Exception {
		SourceToken existingToken = buildSourceToken(15, buildCampaign(11), null);
		Request<SourceTokenDto> request = buildRequest(buildUpdateDto(15, null, 7));
		Form sharedForm = buildForm(7);
		AtomicReference<List<SourceToken>> savedTokens = new AtomicReference<List<SourceToken>>();

		when(sourceTokenRepository.findOne(15, false)).thenReturn(existingToken);
		when(formRepository.findOne(7, false)).thenReturn(sharedForm);
		when(campaignFormRepository.countActiveLinksByCampaignIdAndFormId(11, 7)).thenReturn(1L);
		when(sourceTokenRepository.saveAll(any())).thenAnswer(invocation -> captureAndReturnSavedTokens(invocation.getArgument(0), savedTokens));

		Response<SourceTokenDto> response = sourceTokenBusiness.update(request, Locale.FRENCH);

		assertThat(response.isHasError()).isFalse();
		assertThat(response.getItems()).hasSize(1);
		assertThat(savedTokens.get()).hasSize(1);
		assertThat(savedTokens.get().get(0).getCampaigns().getId()).isEqualTo(11);
		assertThat(savedTokens.get().get(0).getForm().getId()).isEqualTo(7);
	}

	@Test
	void update_rejectsExistingFormWhenCampaignIsCleared() throws Exception {
		SourceToken existingToken = buildSourceToken(15, buildCampaign(11), buildForm(7));
		Request<SourceTokenDto> request = buildRequest(buildUpdateDto(15, 0, null));

		mockRequestFail();
		when(sourceTokenRepository.findOne(15, false)).thenReturn(existingToken);

		InvalidEntityException exception = assertThrows(
				InvalidEntityException.class,
				() -> sourceTokenBusiness.update(request, Locale.FRENCH));

		assertThat(exception.getStatus().getMessage()).contains("Une campagne doit etre selectionnee");
	}

	@Test
	void getFullInfos_exposesCampaignFormMetadata() throws Exception {
		SourceTokenDto dto = new SourceTokenDto();
		dto.setCampaignId(11);
		dto.setFormId(7);

		Campaigns primaryCampaign = buildCampaign(11);
		Campaigns sharedCampaign = buildCampaign(12);
		Form sharedForm = buildForm(7);

		when(campaignFormRepository.countActiveLinksByCampaignIdAndFormId(11, 7)).thenReturn(1L);
		when(campaignFormRepository.findByFormId(7)).thenReturn(List.of(
				buildCampaignForm(101, primaryCampaign, sharedForm, false),
				buildCampaignForm(102, sharedCampaign, sharedForm, false),
				buildCampaignForm(103, buildCampaign(13), sharedForm, true)));

		SourceTokenDto enrichedDto = sourceTokenBusiness.getFullInfos(dto, 10, false, Locale.FRENCH);

		assertThat(enrichedDto.getCampaignFormLinkActive()).isTrue();
		assertThat(enrichedDto.getLinkedCampaignCount()).isEqualTo(2);
		assertThat(enrichedDto.getFormShared()).isTrue();
	}

	private void mockRequestFail() {
		when(functionalError.REQUEST_FAIL(anyString(), any(Locale.class))).thenAnswer(invocation -> {
			Status status = new Status();
			status.setCode("FUNC_REQUEST_FAIL");
			status.setMessage(invocation.getArgument(0));
			return status;
		});
	}

	private Request<SourceTokenDto> buildRequest(SourceTokenDto dto) {
		Request<SourceTokenDto> request = new Request<SourceTokenDto>();
		request.setUser(99);
		request.setIsSimpleLoading(true);
		request.setDatas(List.of(dto));
		return request;
	}

	private SourceTokenDto buildCreateDto(Integer campaignId, Integer formId, String sourceTokenName) {
		SourceTokenDto dto = new SourceTokenDto();
		dto.setCampaignId(campaignId);
		dto.setFormId(formId);
		dto.setSourceTokenName(sourceTokenName);
		return dto;
	}

	private SourceTokenDto buildUpdateDto(Integer id, Integer campaignId, Integer formId) {
		SourceTokenDto dto = new SourceTokenDto();
		dto.setId(id);
		dto.setCampaignId(campaignId);
		dto.setFormId(formId);
		return dto;
	}

	private Campaigns buildCampaign(Integer id) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
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

	private SourceToken buildSourceToken(Integer id, Campaigns campaign, Form form) {
		SourceToken sourceToken = new SourceToken();
		sourceToken.setId(id);
		sourceToken.setCampaigns(campaign);
		sourceToken.setForm(form);
		sourceToken.setTokenString("token-value");
		sourceToken.setIsDeleted(false);
		return sourceToken;
	}

	private CampaignForm buildCampaignForm(Integer id, Campaigns campaign, Form form, boolean isDeleted) {
		CampaignForm campaignForm = new CampaignForm();
		campaignForm.setId(id);
		campaignForm.setCampaigns(campaign);
		campaignForm.setForm(form);
		campaignForm.setIsDeleted(isDeleted);
		return campaignForm;
	}

	private List<SourceToken> captureAndReturnSavedTokens(Iterable<SourceToken> tokens, AtomicReference<List<SourceToken>> target) {
		List<SourceToken> savedTokens = new ArrayList<SourceToken>();
		int nextId = 100;
		for (SourceToken token : tokens) {
			if (token.getId() == null) {
				token.setId(nextId++);
			}
			savedTokens.add(token);
		}
		target.set(savedTokens);
		return savedTokens;
	}
}