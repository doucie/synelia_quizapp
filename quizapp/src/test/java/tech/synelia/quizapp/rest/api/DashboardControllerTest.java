package tech.synelia.quizapp.rest.api;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.repository.AnswerRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.CandidateAnswerRepository;
import tech.synelia.quizapp.dao.repository.CandidateAskRepository;
import tech.synelia.quizapp.dao.repository.CandidateInterviewRepository;
import tech.synelia.quizapp.dao.repository.CandidateTokenRepository;
import tech.synelia.quizapp.dao.repository.DecisionRepository;
import tech.synelia.quizapp.dao.repository.DepartmentsRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.EvaluationsRepository;
import tech.synelia.quizapp.dao.repository.FormQuestionsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.dao.repository.InterviewParticipantRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.dao.repository.InvitationCodeRepository;
import tech.synelia.quizapp.dao.repository.NotificationsRepository;
import tech.synelia.quizapp.dao.repository.QuestionRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.dao.repository.SpecialitiesRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

	@Mock
	private UserRepository userRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;
	@Mock
	private InterviewsRepository interviewsRepository;
	@Mock
	private EvaluationsRepository evaluationsRepository;
	@Mock
	private CampaignsRepository campaignsRepository;
	@Mock
	private QuestionRepository questionRepository;
	@Mock
	private AnswerRepository answerRepository;
	@Mock
	private DepartmentsRepository departmentsRepository;
	@Mock
	private SpecialitiesRepository specialitiesRepository;
	@Mock
	private SourceTokenRepository sourceTokenRepository;
	@Mock
	private EntityPermissionRepository entityPermissionRepository;
	@Mock
	private CandidateAnswerRepository candidateAnswerRepository;
	@Mock
	private CandidateAskRepository candidateAskRepository;
	@Mock
	private CandidateInterviewRepository candidateInterviewRepository;
	@Mock
	private CandidateTokenRepository candidateTokenRepository;
	@Mock
	private InterviewParticipantRepository interviewParticipantRepository;
	@Mock
	private DecisionRepository decisionRepository;
	@Mock
	private NotificationsRepository notificationsRepository;
	@Mock
	private CampaignFormRepository campaignFormRepository;
	@Mock
	private FormRepository formRepository;
	@Mock
	private FormVersionRepository formVersionRepository;
	@Mock
	private FormQuestionsRepository formQuestionsRepository;
	@Mock
	private InvitationCodeRepository invitationCodeRepository;

	@InjectMocks
	private DashboardController dashboardController;

	@Test
	void checkDependencies_forCampaignsReadsFormsThroughCampaignFormLinks() {
		Form linkedForm = new Form();
		linkedForm.setId(7);
		linkedForm.setFormName("Formulaire partage");

		when(campaignFormRepository.findActiveFormsByCampaignId(11)).thenReturn(List.of(linkedForm));
		when(sourceTokenRepository.findByCampaignId(11, false)).thenReturn(List.of());
		when(interviewsRepository.findByCampaignId(11, false)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 11)).thenReturn(List.of());

		DependencyInfoDto info = dashboardController.checkDependencies("campaigns", 11);

		assertThat(info.getDependencies()).hasSize(1);
		assertThat(info.getDependencies().get(0).getEntityType()).isEqualTo("forms");
		assertThat(info.getDependencies().get(0).getCount()).isEqualTo(1);
		verify(campaignFormRepository).findActiveFormsByCampaignId(11);
		verifyNoInteractions(formRepository);
	}

	@Test
	void checkParent_forFormsReadsDeletedCampaignParentsThroughCampaignFormLinks() {
		Form deletedForm = new Form();
		deletedForm.setId(7);

		Campaigns firstDeletedCampaign = new Campaigns();
		firstDeletedCampaign.setId(11);
		firstDeletedCampaign.setCampaignTitle("Campagne Alpha");

		Campaigns secondDeletedCampaign = new Campaigns();
		secondDeletedCampaign.setId(12);
		secondDeletedCampaign.setCampaignTitle("Campagne Beta");

		when(formRepository.findOne(7, true)).thenReturn(deletedForm);
		when(campaignFormRepository.findByFormId(7)).thenReturn(List.of(
				buildCampaignForm(101, buildCampaignReference(11), deletedForm, true),
				buildCampaignForm(102, buildCampaignReference(12), deletedForm, true),
				buildCampaignForm(103, buildCampaignReference(11), deletedForm, false)));
		when(campaignsRepository.findOne(11, true)).thenReturn(firstDeletedCampaign);
		when(campaignsRepository.findOne(12, true)).thenReturn(secondDeletedCampaign);

		DependencyInfoDto info = dashboardController.checkParent("forms", 7);

		assertThat(info.getDeletedParents()).hasSize(2);
		assertThat(info.getDeletedParents())
				.extracting(DependencyInfoDto.DeletedParent::getParentId, DependencyInfoDto.DeletedParent::getParentName)
				.containsExactlyInAnyOrder(
						org.assertj.core.groups.Tuple.tuple(11, "Campagne Alpha"),
						org.assertj.core.groups.Tuple.tuple(12, "Campagne Beta"));
		verify(campaignFormRepository).findByFormId(7);
	}

	private Campaigns buildCampaignReference(Integer id) {
		Campaigns campaign = new Campaigns();
		campaign.setId(id);
		return campaign;
	}

	private CampaignForm buildCampaignForm(Integer id, Campaigns campaign, Form form, boolean isDeleted) {
		CampaignForm campaignForm = new CampaignForm();
		campaignForm.setId(id);
		campaignForm.setCampaigns(campaign);
		campaignForm.setForm(form);
		campaignForm.setIsDeleted(isDeleted);
		return campaignForm;
	}
}