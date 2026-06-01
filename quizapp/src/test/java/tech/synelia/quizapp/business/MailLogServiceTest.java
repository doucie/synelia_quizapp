package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import java.util.Date;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.business.MailLogService.MailLogContext;
import tech.synelia.quizapp.dao.entity.MailLog;
import tech.synelia.quizapp.dao.repository.MailLogRepository;

@ExtendWith(MockitoExtension.class)
class MailLogServiceTest {

	@Mock
	private MailLogRepository mailLogRepository;

	@InjectMocks
	private MailLogService mailLogService;

	@Test
	void logEmailResult_persistsRuntimeContext() {
		Date confirmedAt = new Date();
		MailLogContext mailLogContext = MailLogContext.builder()
				.applicationId(9)
				.applicationProgressId(45)
				.interviewId(17)
				.decisionId(71)
				.notificationRuleId(99)
				.eventCode("FINAL_DECISION_EMAIL")
				.requiresConfirmation(true)
				.confirmedAt(confirmedAt)
				.confirmedBy(12)
				.build();

		mailLogService.logEmailResult(
				"candidate@example.test",
				33,
				77,
				5,
				"Decision finale",
				"Body preview",
				true,
				null,
				mailLogContext);

		ArgumentCaptor<MailLog> mailLogCaptor = ArgumentCaptor.forClass(MailLog.class);
		verify(mailLogRepository).save(mailLogCaptor.capture());
		MailLog savedMailLog = mailLogCaptor.getValue();
		assertThat(savedMailLog.getRecipientEmail()).isEqualTo("candidate@example.test");
		assertThat(savedMailLog.getApplicationId()).isEqualTo(9);
		assertThat(savedMailLog.getApplicationProgressId()).isEqualTo(45);
		assertThat(savedMailLog.getInterviewId()).isEqualTo(17);
		assertThat(savedMailLog.getDecisionId()).isEqualTo(71);
		assertThat(savedMailLog.getNotificationRuleId()).isEqualTo(99);
		assertThat(savedMailLog.getEventCode()).isEqualTo("FINAL_DECISION_EMAIL");
		assertThat(savedMailLog.getRequiresConfirmation()).isTrue();
		assertThat(savedMailLog.getConfirmedAt()).isEqualTo(confirmedAt);
		assertThat(savedMailLog.getConfirmedBy()).isEqualTo(12);
		assertThat(savedMailLog.getSearchString()).contains("FINAL_DECISION_EMAIL", "45", "71");
	}

	@Test
	void logEmailResult_withoutContextKeepsLegacyDefaults() {
		mailLogService.logEmailResult(
				"candidate@example.test",
				null,
				77,
				null,
				"Invitation",
				"Body preview",
				false,
				"SMTP indisponible");

		ArgumentCaptor<MailLog> mailLogCaptor = ArgumentCaptor.forClass(MailLog.class);
		verify(mailLogRepository).save(mailLogCaptor.capture());
		MailLog savedMailLog = mailLogCaptor.getValue();
		assertThat(savedMailLog.getEventCode()).isEqualTo("LEGACY_UNCLASSIFIED");
		assertThat(savedMailLog.getRequiresConfirmation()).isFalse();
		assertThat(savedMailLog.getApplicationId()).isNull();
		assertThat(savedMailLog.getApplicationProgressId()).isNull();
		assertThat(savedMailLog.getInterviewId()).isNull();
		assertThat(savedMailLog.getDecisionId()).isNull();
	}
}