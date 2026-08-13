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
@Table(name = "evaluation_grid_template_item")
public class EvaluationGridTemplateItem implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "evaluation_grid_template_version_id", nullable = false)
	private Integer evaluationGridTemplateVersionId;

	@Column(name = "criterion_order", nullable = false)
	private Integer criterionOrder;

	@Column(name = "label", nullable = false, length = 255)
	private String label;

	@Column(name = "criterion_type", nullable = false, length = 20)
	private String criterionType;

	@Column(name = "max_score")
	private Double maxScore;

	@Column(name = "weight")
	private Double weight;

	@Column(name = "is_required", nullable = false)
	private Boolean isRequired;

	@Column(name = "config_json", length = 65535)
	private String configJson;

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

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
