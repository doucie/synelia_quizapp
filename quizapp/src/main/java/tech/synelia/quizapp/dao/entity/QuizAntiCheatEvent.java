package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@Entity
@Table(name = "quiz_anti_cheat_event")
public class QuizAntiCheatEvent implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "event_type", nullable = false, length = 30)
	private String eventType;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "occurred_at", nullable = false)
	private Date occurredAt;

	@Column(name = "metadata", length = 500)
	private String metadata;

	@Column(name = "created_by")
	private Integer createdBy;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at")
	private Date createdAt;

	@Column(name = "updated_by")
	private Integer updatedBy;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "updated_at")
	private Date updatedAt;

	@Column(name = "is_deleted")
	private Boolean isDeleted;

	@Column(name = "search_string", columnDefinition = "TEXT")
	private String searchString;

	@ManyToOne
	@JoinColumn(name = "application_quiz_attempt_id", referencedColumnName = "id")
	private ApplicationQuizAttempt applicationQuizAttempt;

	public QuizAntiCheatEvent() {
		super();
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
