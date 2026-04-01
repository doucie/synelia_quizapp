package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.*;

@Data
@ToString
@Entity
@Table(name = "legal_text")
public class LegalText implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "text_key", nullable = false, length = 50)
    private String textKey;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "description", length = 500)
    private String description;

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

    public LegalText() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
