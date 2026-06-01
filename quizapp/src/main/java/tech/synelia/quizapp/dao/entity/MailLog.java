package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@Entity
@Table(name = "mail_log")
public class MailLog implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "recipient_email", nullable = false, length = 255)
	private String recipientEmail;

	@Column(name = "application_id")
	private Integer applicationId;

	@Column(name = "application_progress_id")
	private Integer applicationProgressId;

	@Column(name = "interview_id")
	private Integer interviewId;

	@Column(name = "decision_id")
	private Integer decisionId;

	@Column(name = "notification_rule_id")
	private Integer notificationRuleId;

	@Column(name = "event_code", nullable = false, length = 80)
	private String eventCode = "LEGACY_UNCLASSIFIED";

	@Column(name = "requires_confirmation", nullable = false)
	private Boolean requiresConfirmation = Boolean.FALSE;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "confirmed_at")
	private Date confirmedAt;

	@Column(name = "confirmed_by")
	private Integer confirmedBy;

	@Column(name = "recipient_user_id")
	private Integer recipientUserId;

	@Column(name = "sender_user_id")
	private Integer senderUserId;

	@Column(name = "email_template_id")
	private Integer emailTemplateId;

	@Column(name = "subject", nullable = false, length = 500)
	private String subject;

	@Column(name = "body_preview", columnDefinition = "TEXT")
	private String bodyPreview;

	@Column(name = "status", nullable = false, length = 20)
	private String status;

	@Column(name = "error_message", columnDefinition = "TEXT")
	private String errorMessage;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "sent_at")
	private Date sentAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at")
	private Date createdAt;

	@Column(name = "created_by")
	private Integer createdBy;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "updated_at")
	private Date updatedAt;

	@Column(name = "updated_by")
	private Integer updatedBy;

	@Column(name = "is_deleted")
	private Boolean isDeleted;

	@Column(name = "search_string", columnDefinition = "TEXT")
	private String searchString;

	public MailLog() {
		super();
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}