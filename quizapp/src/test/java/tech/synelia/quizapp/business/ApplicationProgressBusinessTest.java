package tech.synelia.quizapp.business;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.ApplicationProgress;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;

@ExtendWith(MockitoExtension.class)
class ApplicationProgressBusinessTest {

	@Mock
	private ApplicationProgressRepository applicationProgressRepository;
	@Mock
	private ApplicationsRepository applicationsRepository;

	@InjectMocks
	private ApplicationProgressBusiness applicationProgressBusiness;

	@Test
	void syncApplicationStatus_writesMirrorsFromCurrentStageWithoutLegacyStatus() {
		Applications application = new Applications();
		application.setId(15);
		application.setIsDeleted(false);

		PipelineStage stage = new PipelineStage();
		stage.setStageType("QUIZ");
		stage.setStageLabel("Test technique");

		ApplicationProgress currentStage = new ApplicationProgress();
		currentStage.setId(30);
		currentStage.setApplications(application);
		currentStage.setPipelineStage(stage);
		currentStage.setProgressStatus("IN_PROGRESS");

		when(applicationProgressRepository.findCurrentStage(15)).thenReturn(currentStage);
		when(applicationsRepository.findOne(15, false)).thenReturn(application);
		when(applicationsRepository.save(application)).thenAnswer(invocation -> invocation.getArgument(0));

		applicationProgressBusiness.syncApplicationStatus(15);

		assertThat(application.getCurrentPipelineStageType()).isEqualTo("QUIZ");
		assertThat(application.getCurrentPipelineStageLabel()).isEqualTo("Test technique");
		assertThat(application.getCurrentPipelineProgressStatus()).isEqualTo("IN_PROGRESS");
		verify(applicationsRepository).save(application);
	}

	@Test
	void syncApplicationStatus_fallsBackToFirstPendingStage() {
		Applications application = new Applications();
		application.setId(15);
		application.setIsDeleted(false);

		PipelineStage quizStage = new PipelineStage();
		quizStage.setStageType("QUIZ");
		quizStage.setStageLabel("Test technique");

		ApplicationProgress pendingStage = new ApplicationProgress();
		pendingStage.setId(31);
		pendingStage.setApplications(application);
		pendingStage.setPipelineStage(quizStage);
		pendingStage.setProgressStatus("PENDING");

		when(applicationProgressRepository.findCurrentStage(15)).thenReturn(null);
		when(applicationProgressRepository.findPendingByApplicationId(15)).thenReturn(List.of(pendingStage));
		when(applicationsRepository.findOne(15, false)).thenReturn(application);
		when(applicationsRepository.save(application)).thenAnswer(invocation -> invocation.getArgument(0));

		applicationProgressBusiness.syncApplicationStatus(15);

		assertThat(application.getCurrentPipelineStageType()).isEqualTo("QUIZ");
		assertThat(application.getCurrentPipelineStageLabel()).isEqualTo("Test technique");
		assertThat(application.getCurrentPipelineProgressStatus()).isEqualTo("PENDING");
		verify(applicationsRepository).save(application);
	}

	@Test
	void syncApplicationStatus_noCurrentStageClearsMirrors() {
		Applications application = new Applications();
		application.setId(15);
		application.setIsDeleted(false);
		application.setCurrentPipelineStageType("QUIZ");
		application.setCurrentPipelineStageLabel("Test technique");
		application.setCurrentPipelineProgressStatus("PENDING");

		when(applicationProgressRepository.findCurrentStage(15)).thenReturn(null);
		when(applicationProgressRepository.findPendingByApplicationId(15)).thenReturn(List.of());
		when(applicationsRepository.findOne(15, false)).thenReturn(application);
		when(applicationsRepository.save(application)).thenAnswer(invocation -> invocation.getArgument(0));

		applicationProgressBusiness.syncApplicationStatus(15);

		assertThat(application.getCurrentPipelineStageType()).isNull();
		assertThat(application.getCurrentPipelineStageLabel()).isNull();
		assertThat(application.getCurrentPipelineProgressStatus()).isNull();
		verify(applicationsRepository).save(application);
	}

	@Test
	void syncApplicationStatus_skipsSaveWhenMirrorsUnchanged() {
		Applications application = new Applications();
		application.setId(15);
		application.setIsDeleted(false);
		application.setCurrentPipelineStageType("QUIZ");
		application.setCurrentPipelineStageLabel("Test technique");
		application.setCurrentPipelineProgressStatus("PENDING");

		PipelineStage stage = new PipelineStage();
		stage.setStageType("QUIZ");
		stage.setStageLabel("Test technique");

		ApplicationProgress currentStage = new ApplicationProgress();
		currentStage.setId(30);
		currentStage.setApplications(application);
		currentStage.setPipelineStage(stage);
		currentStage.setProgressStatus("PENDING");

		when(applicationProgressRepository.findCurrentStage(15)).thenReturn(currentStage);
		when(applicationsRepository.findOne(15, false)).thenReturn(application);

		applicationProgressBusiness.syncApplicationStatus(15);

		verify(applicationsRepository, never()).save(application);
	}

	@Test
	void listProgressOccurrences_returnsAllOccurrencesInStageOrder() {
		Applications application = new Applications();
		application.setId(15);
		application.setIsDeleted(false);

		PipelineStage quiz1Stage = buildStage(2, "QUIZ");
		PipelineStage interviewStage = buildStage(3, "INTERVIEW");
		PipelineStage quiz2Stage = buildStage(4, "QUIZ");

		ApplicationProgress quiz1Progress = buildProgress(30, application, quiz1Stage, "COMPLETED");
		ApplicationProgress interviewProgress = buildProgress(31, application, interviewStage, "COMPLETED");
		ApplicationProgress quiz2Progress = buildProgress(32, application, quiz2Stage, "PENDING");

		when(applicationProgressRepository.findByApplicationIdOrderByStageOrder(15))
				.thenReturn(List.of(quiz1Progress, interviewProgress, quiz2Progress));

		List<ApplicationProgress> occurrences = applicationProgressBusiness.listProgressOccurrences(15, "QUIZ");

		assertThat(occurrences).hasSize(2);
		assertThat(occurrences.get(0).getId()).isEqualTo(30);
		assertThat(occurrences.get(1).getId()).isEqualTo(32);
	}

	@Test
	void resolveProgressByStageType_prefersNextPendingRoundOccurrence() {
		Applications application = new Applications();
		application.setId(15);
		application.setIsDeleted(false);

		PipelineStage quiz1Stage = buildStage(2, "QUIZ");
		PipelineStage interviewStage = buildStage(3, "INTERVIEW");
		PipelineStage quiz2Stage = buildStage(4, "QUIZ");
		PipelineStage decisionStage = buildStage(5, "DECISION");

		ApplicationProgress quiz1Progress = buildProgress(30, application, quiz1Stage, "COMPLETED");
		ApplicationProgress interviewProgress = buildProgress(31, application, interviewStage, "COMPLETED");
		ApplicationProgress quiz2Progress = buildProgress(32, application, quiz2Stage, "PENDING");
		ApplicationProgress decisionProgress = buildProgress(33, application, decisionStage, "PENDING");

		when(applicationProgressRepository.findByApplicationIdOrderByStageOrder(15))
				.thenReturn(List.of(quiz1Progress, interviewProgress, quiz2Progress, decisionProgress));
		when(applicationProgressRepository.findCurrentStage(15)).thenReturn(null);
		when(applicationProgressRepository.findPendingByApplicationId(15))
				.thenReturn(List.of(quiz2Progress, decisionProgress));

		ApplicationProgress resolved = applicationProgressBusiness.resolveProgressByStageType(15, "QUIZ");

		assertThat(resolved).isNotNull();
		assertThat(resolved.getId()).isEqualTo(32);
	}

	private PipelineStage buildStage(int stageOrder, String stageType) {
		PipelineStage stage = new PipelineStage();
		stage.setStageOrder(stageOrder);
		stage.setStageType(stageType);
		return stage;
	}

	private ApplicationProgress buildProgress(Integer id, Applications application, PipelineStage stage, String status) {
		ApplicationProgress progress = new ApplicationProgress();
		progress.setId(id);
		progress.setApplications(application);
		progress.setPipelineStage(stage);
		progress.setProgressStatus(status);
		return progress;
	}
}
