package tech.synelia.quizapp.business;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tech.synelia.quizapp.dao.entity.AuditEvent;
import tech.synelia.quizapp.dao.repository.AuditEventRepository;
import tech.synelia.quizapp.utils.Utilities;

@Component
public class AuditEventService {

	@Autowired
	private AuditEventRepository auditEventRepository;

	public void recordEvent(
			Integer applicationId,
			Integer applicationProgressId,
			String entityType,
			String entityId,
			String actionType,
			Integer actorUserId,
			String justification,
			String beforeStateJson,
			String afterStateJson) {
		if (!Utilities.notBlank(entityType) || !Utilities.notBlank(entityId) || !Utilities.notBlank(actionType)) {
			return;
		}

		AuditEvent auditEvent = new AuditEvent();
		auditEvent.setApplicationId(applicationId);
		auditEvent.setApplicationProgressId(applicationProgressId);
		auditEvent.setEntityType(entityType.trim());
		auditEvent.setEntityId(entityId.trim());
		auditEvent.setActionType(actionType.trim());
		auditEvent.setActorUserId(actorUserId);
		auditEvent.setJustification(normalizeOptionalText(justification));
		auditEvent.setBeforeStateJson(normalizeOptionalText(beforeStateJson));
		auditEvent.setAfterStateJson(normalizeOptionalText(afterStateJson));
		auditEvent.setCreatedAt(new Date());
		auditEventRepository.save(auditEvent);
	}

	private String normalizeOptionalText(String value) {
		return Utilities.notBlank(value) ? value.trim() : null;
	}
}