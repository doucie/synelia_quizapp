package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.AuditEvent;
import tech.synelia.quizapp.dao.repository.AuditEventRepository;

@ExtendWith(MockitoExtension.class)
class AuditEventServiceTest {

	@Mock
	private AuditEventRepository auditEventRepository;

	@InjectMocks
	private AuditEventService auditEventService;

	@Test
	void recordEvent_persistsRoundScopedAuditPayload() {
		auditEventService.recordEvent(
				9,
				45,
				"DECISION",
				"71",
				"DECISION_CANCELLED",
				12,
				"Audit mismatch",
				"{\"before\":true}",
				"{\"after\":true}");

		ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
		verify(auditEventRepository).save(auditCaptor.capture());
		AuditEvent savedAudit = auditCaptor.getValue();
		assertThat(savedAudit.getApplicationId()).isEqualTo(9);
		assertThat(savedAudit.getApplicationProgressId()).isEqualTo(45);
		assertThat(savedAudit.getEntityType()).isEqualTo("DECISION");
		assertThat(savedAudit.getEntityId()).isEqualTo("71");
		assertThat(savedAudit.getActionType()).isEqualTo("DECISION_CANCELLED");
		assertThat(savedAudit.getActorUserId()).isEqualTo(12);
		assertThat(savedAudit.getJustification()).isEqualTo("Audit mismatch");
		assertThat(savedAudit.getBeforeStateJson()).isEqualTo("{\"before\":true}");
		assertThat(savedAudit.getAfterStateJson()).isEqualTo("{\"after\":true}");
		assertThat(savedAudit.getCreatedAt()).isNotNull();
	}
}