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
@Table(name = "application_quiz_attempt")
public class ApplicationQuizAttempt implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "quiz_token", length = 64)
	private String quizToken;

	@Column(name = "quiz_status", nullable = false, length = 20)
	private String quizStatus;

	@Column(name = "screening_mode", nullable = false, length = 30)
	private String screeningMode;

	@Column(name = "screening_threshold")
	private Double screeningThreshold;

	@Column(name = "screening_result", length = 30)
	private String screeningResult;

	@Column(name = "score")
	private Double score;

	@Column(name = "score_percent")
	private Double scorePercent;

	@Column(name = "manual_correction_status", nullable = false, length = 20)
	private String manualCorrectionStatus;

	@Column(name = "total_questions")
	private Integer totalQuestions;

	@Column(name = "time_elapsed")
	private Integer timeElapsed;

	@Column(name = "timed_snapshot")
	private Boolean timedSnapshot;

	@Column(name = "total_time_allowed_snapshot")
	private Integer totalTimeAllowedSnapshot;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "last_activity_at")
	private Date lastActivityAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "started_at")
	private Date startedAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "completed_at")
	private Date completedAt;

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

	@Column(name = "search_string", length = 65535)
	private String searchString;

	@ManyToOne
	@JoinColumn(name = "application_id", referencedColumnName = "id")
	private Applications applications;

	@ManyToOne
	@JoinColumn(name = "application_progress_id", referencedColumnName = "id")
	private ApplicationProgress applicationProgress;

	@ManyToOne
	@JoinColumn(name = "form_version_id", referencedColumnName = "id")
	private FormVersion formVersion;

	public ApplicationQuizAttempt() {
		super();
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}