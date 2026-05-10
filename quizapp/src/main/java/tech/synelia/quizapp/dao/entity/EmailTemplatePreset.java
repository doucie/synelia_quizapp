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
@Table(name = "email_template_preset")
public class EmailTemplatePreset implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", nullable = false, columnDefinition = "ENUM('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC')")
    private String category;

    @Column(name = "html_structure", nullable = false, columnDefinition = "TEXT")
    private String htmlStructure;

    @Column(name = "preview_image", length = 500)
    private String previewImage;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;

    public EmailTemplatePreset() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
