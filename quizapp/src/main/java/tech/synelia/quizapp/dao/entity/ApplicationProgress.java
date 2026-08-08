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
@Table(name = "application_progress")
public class ApplicationProgress implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "progress_status", nullable = false, length = 20)
    private String progressStatus;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "started_at")
    private Date startedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "completed_at")
    private Date completedAt;

    @Column(name = "score")
    private Double score;

    @Column(name = "notes", length = 65535)
    private String notes;

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
    @JoinColumn(name = "pipeline_stage_id", referencedColumnName = "id")
    private PipelineStage pipelineStage;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "validated_at")
    private Date validatedAt;

    @ManyToOne
    @JoinColumn(name = "validated_by", referencedColumnName = "id")
    private User validatedBy;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "skipped_at")
    private Date skippedAt;

    @ManyToOne
    @JoinColumn(name = "skipped_by", referencedColumnName = "id")
    private User skippedBy;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "reopened_at")
    private Date reopenedAt;

    @ManyToOne
    @JoinColumn(name = "reopened_by", referencedColumnName = "id")
    private User reopenedBy;

    public ApplicationProgress() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
