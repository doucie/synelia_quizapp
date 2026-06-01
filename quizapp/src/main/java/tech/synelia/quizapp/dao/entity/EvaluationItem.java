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
@Table(name = "evaluation_item")
public class EvaluationItem implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "score_value")
	private Double scoreValue;

	@Column(name = "text_value", length = 65535)
	private String textValue;

	@Column(name = "weight_snapshot")
	private Double weightSnapshot;

	@Column(name = "max_score_snapshot")
	private Double maxScoreSnapshot;

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
	@JoinColumn(name = "evaluation_id", referencedColumnName = "id")
	private Evaluations evaluation;

	@ManyToOne
	@JoinColumn(name = "pipeline_stage_evaluation_criterion_id", referencedColumnName = "id")
	private PipelineStageEvaluationCriterion pipelineStageEvaluationCriterion;

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}