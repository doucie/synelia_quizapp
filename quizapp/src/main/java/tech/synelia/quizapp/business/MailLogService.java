package tech.synelia.quizapp.business;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.MailLog;
import tech.synelia.quizapp.dao.repository.MailLogRepository;
import tech.synelia.quizapp.utils.Utilities;

@Log
@Component
public class MailLogService {

	private static final String EVENT_CODE_LEGACY_UNCLASSIFIED = "LEGACY_UNCLASSIFIED";
	private static final String STATUS_SENT = "SENT";
	private static final String STATUS_FAILED = "FAILED";

	@Getter
	@Builder
	public static class MailLogContext {
		private final Integer applicationId;
		private final Integer applicationProgressId;
		private final Integer interviewId;
		private final Integer decisionId;
		private final Integer notificationRuleId;
		private final String eventCode;
		private final Boolean requiresConfirmation;
		private final Date confirmedAt;
		private final Integer confirmedBy;
	}

	@Autowired
	private MailLogRepository mailLogRepository;

	public void logBulkEmailResult(Map<String, String> from, List<Map<String, String>> toRecipients, String subject,
			String bodyPreview, boolean success, String errorMessage) {
		logBulkEmailResult(from, toRecipients, subject, bodyPreview, success, errorMessage, null);
	}

	public void logBulkEmailResult(Map<String, String> from, List<Map<String, String>> toRecipients, String subject,
			String bodyPreview, boolean success, String errorMessage, MailLogContext mailLogContext) {
		if (toRecipients == null || toRecipients.isEmpty()) {
			return;
		}

		Integer senderUserId = extractUserId(from);
		for (Map<String, String> recipient : toRecipients) {
			logEmailResult(
				recipient != null ? recipient.get("email") : null,
				extractUserId(recipient),
				senderUserId,
				null,
				subject,
				bodyPreview,
				success,
				errorMessage,
				mailLogContext);
		}
	}

	public void logEmailResult(String recipientEmail, Integer recipientUserId, Integer senderUserId,
			Integer emailTemplateId, String subject, String bodyPreview, boolean success, String errorMessage) {
		logEmailResult(recipientEmail, recipientUserId, senderUserId, emailTemplateId, subject, bodyPreview, success,
				errorMessage, null);
	}

	public void logEmailResult(String recipientEmail, Integer recipientUserId, Integer senderUserId,
			Integer emailTemplateId, String subject, String bodyPreview, boolean success, String errorMessage,
			MailLogContext mailLogContext) {
		if (recipientEmail == null || recipientEmail.isBlank()) {
			return;
		}

		try {
			Date now = Utilities.getCurrentDate();
			MailLog mailLog = new MailLog();
			mailLog.setRecipientEmail(recipientEmail.trim());
			mailLog.setRecipientUserId(recipientUserId);
			mailLog.setSenderUserId(senderUserId);
			mailLog.setEmailTemplateId(emailTemplateId);
			mailLog.setSubject(truncate(subject, 500));
			mailLog.setBodyPreview(truncate(bodyPreview, 4000));
			mailLog.setStatus(success ? STATUS_SENT : STATUS_FAILED);
			mailLog.setErrorMessage(truncate(errorMessage, 4000));
			mailLog.setSentAt(success ? now : null);
			mailLog.setCreatedAt(now);
			mailLog.setCreatedBy(senderUserId);
			mailLog.setUpdatedAt(success ? now : null);
			mailLog.setUpdatedBy(success ? senderUserId : null);
			mailLog.setIsDeleted(false);
			applyMailLogContext(mailLog, mailLogContext);
			mailLog.setSearchString(buildSearchString(mailLog));
			mailLogRepository.save(mailLog);
		} catch (Exception e) {
			log.warning("Unable to persist mail_log entry: " + e.getMessage());
		}
	}

	private void applyMailLogContext(MailLog mailLog, MailLogContext mailLogContext) {
		if (mailLog == null) {
			return;
		}

		mailLog.setEventCode(resolveEventCode(mailLogContext));
		mailLog.setRequiresConfirmation(resolveRequiresConfirmation(mailLogContext));
		if (mailLogContext == null) {
			return;
		}

		mailLog.setApplicationId(mailLogContext.getApplicationId());
		mailLog.setApplicationProgressId(mailLogContext.getApplicationProgressId());
		mailLog.setInterviewId(mailLogContext.getInterviewId());
		mailLog.setDecisionId(mailLogContext.getDecisionId());
		mailLog.setNotificationRuleId(mailLogContext.getNotificationRuleId());
		mailLog.setConfirmedAt(mailLogContext.getConfirmedAt());
		mailLog.setConfirmedBy(mailLogContext.getConfirmedBy());
	}

	private String resolveEventCode(MailLogContext mailLogContext) {
		if (mailLogContext == null || mailLogContext.getEventCode() == null || mailLogContext.getEventCode().isBlank()) {
			return EVENT_CODE_LEGACY_UNCLASSIFIED;
		}
		return mailLogContext.getEventCode().trim();
	}

	private Boolean resolveRequiresConfirmation(MailLogContext mailLogContext) {
		return mailLogContext != null && mailLogContext.getRequiresConfirmation() != null
				? mailLogContext.getRequiresConfirmation()
				: Boolean.FALSE;
	}

	private Integer extractUserId(Map<String, String> actorData) {
		if (actorData == null) {
			return null;
		}

		String rawValue = actorData.get("userId");
		if (rawValue == null || rawValue.isBlank()) {
			rawValue = actorData.get("id");
		}
		if (rawValue == null || rawValue.isBlank() || !Utilities.isNumeric(rawValue.trim())) {
			return null;
		}
		return Integer.valueOf(rawValue.trim());
	}

	private String buildSearchString(MailLog mailLog) {
		StringBuilder builder = new StringBuilder();
		append(builder, mailLog.getRecipientEmail());
		append(builder, mailLog.getSubject());
		append(builder, mailLog.getStatus());
		append(builder, mailLog.getEventCode());
		append(builder, mailLog.getBodyPreview());
		append(builder, mailLog.getErrorMessage());
		append(builder, stringify(mailLog.getApplicationId()));
		append(builder, stringify(mailLog.getApplicationProgressId()));
		append(builder, stringify(mailLog.getInterviewId()));
		append(builder, stringify(mailLog.getDecisionId()));
		append(builder, stringify(mailLog.getNotificationRuleId()));
		if (mailLog.getRecipientUserId() != null) {
			append(builder, String.valueOf(mailLog.getRecipientUserId()));
		}
		if (mailLog.getSenderUserId() != null) {
			append(builder, String.valueOf(mailLog.getSenderUserId()));
		}
		return builder.toString().trim();
	}

	private void append(StringBuilder builder, String value) {
		if (value == null || value.isBlank()) {
			return;
		}
		if (!builder.isEmpty()) {
			builder.append(' ');
		}
		builder.append(value.trim());
	}

	private String stringify(Integer value) {
		return value != null ? String.valueOf(value) : null;
	}

	private String truncate(String value, int maxLength) {
		if (value == null) {
			return null;
		}
		return value.length() <= maxLength ? value : value.substring(0, maxLength);
	}
}