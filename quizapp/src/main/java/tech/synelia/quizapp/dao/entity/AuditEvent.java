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
@Table(name = "audit_event")
public class AuditEvent implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "application_id")
	private Integer applicationId;

	@Column(name = "application_progress_id")
	private Integer applicationProgressId;

	@Column(name = "entity_type", nullable = false, length = 100)
	private String entityType;

	@Column(name = "entity_id", nullable = false, length = 100)
	private String entityId;

	@Column(name = "action_type", nullable = false, length = 100)
	private String actionType;

	@Column(name = "actor_user_id")
	private Integer actorUserId;

	@Column(name = "justification", columnDefinition = "TEXT")
	private String justification;

	@Column(name = "before_state_json", columnDefinition = "LONGTEXT")
	private String beforeStateJson;

	@Column(name = "after_state_json", columnDefinition = "LONGTEXT")
	private String afterStateJson;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at", nullable = false)
	private Date createdAt;

	public AuditEvent() {
		super();
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}