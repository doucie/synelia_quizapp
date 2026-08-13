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
@Table(name = "evaluation_grid_template_version")
public class EvaluationGridTemplateVersion implements Serializable, Cloneable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Integer id;

	@Column(name = "evaluation_grid_template_id", nullable = false)
	private Integer evaluationGridTemplateId;

	@Column(name = "version_number", nullable = false)
	private Integer versionNumber;

	@Column(name = "version_label", length = 255)
	private String versionLabel;

	@Column(name = "is_published", nullable = false)
	private Boolean isPublished;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "published_at")
	private Date publishedAt;

	@Column(name = "content_hash", length = 64)
	private String contentHash;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "locked_at")
	private Date lockedAt;

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
