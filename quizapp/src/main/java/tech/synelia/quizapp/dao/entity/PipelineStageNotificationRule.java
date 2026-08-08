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
@Table(name = "pipeline_stage_notification_rule")
public class PipelineStageNotificationRule implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "pipeline_stage_id", referencedColumnName = "id")
    private PipelineStage pipelineStage;

    @Column(name = "trigger_code", nullable = false, length = 80)
    private String triggerCode;

    @Column(name = "outcome_code", length = 80)
    private String outcomeCode;

    @Column(name = "email_template_id")
    private Integer emailTemplateId;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "is_automatic", nullable = false)
    private Boolean isAutomatic = false;

    @Column(name = "requires_manual_confirmation", nullable = false)
    private Boolean requiresManualConfirmation = false;

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
    private Boolean isDeleted = false;

    @Column(name = "search_string", columnDefinition = "TEXT")
    private String searchString;

    public PipelineStageNotificationRule() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
