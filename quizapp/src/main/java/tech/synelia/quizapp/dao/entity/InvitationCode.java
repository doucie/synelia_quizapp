package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.*;

@Data
@ToString
@Entity
@Table(name = "invitation_code")
public class InvitationCode implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "role", nullable = false, length = 30)
    private String role;

    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "is_used")
    private Boolean isUsed;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "expired_at", nullable = false)
    private Date expiredAt;

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

    public InvitationCode() { super(); }

    @Override
    public Object clone() throws CloneNotSupportedException { return super.clone(); }
}
