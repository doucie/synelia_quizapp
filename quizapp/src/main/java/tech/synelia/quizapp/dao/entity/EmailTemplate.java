package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.*;

@Data
@ToString
@Entity
@Table(name = "email_template")
public class EmailTemplate implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "template_key", nullable = false, length = 50)
    private String templateKey;

    @Column(name = "subject_template", nullable = false, length = 500)
    private String subjectTemplate;

    @Column(name = "body_template", nullable = false, columnDefinition = "TEXT")
    private String bodyTemplate;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "available_variables", columnDefinition = "TEXT")
    private String availableVariables;

    @Column(name = "action_type", length = 50)
    private String actionType;

    @Column(name = "preset_id")
    private Integer presetId;

    @Column(name = "is_active")
    private Boolean isActive;

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

    public EmailTemplate() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
