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
@Table(name = "pipeline_stage")
public class PipelineStage implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "stage_type", nullable = false, length = 50)
    private String stageType;

    @Column(name = "stage_label", nullable = false, length = 255)
    private String stageLabel;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired;

    @Column(name = "is_eliminatory", nullable = false)
    private Boolean isEliminatory;

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

    @ManyToOne
    @JoinColumn(name = "pipeline_template_id", referencedColumnName = "id")
    private PipelineTemplate pipelineTemplate;

    public PipelineStage() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
