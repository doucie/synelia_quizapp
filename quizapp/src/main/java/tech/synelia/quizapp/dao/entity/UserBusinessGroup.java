package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@Entity
@Table(name="user_business_group")
public class UserBusinessGroup implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer id;

    // --- [ Foreign keys ] ---
    // user_id (used as FK in a link)
    @ManyToOne
    @JoinColumn(name="user_id", referencedColumnName="id")
    private User user;

    // business_group_id (used as FK in a link)
    @ManyToOne
    @JoinColumn(name="business_group_id", referencedColumnName="id")
    private BusinessGroup businessGroup;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_at")
    private Date createdAt;

    @Column(name="created_by")
    private Integer createdBy;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="updated_at")
    private Date updatedAt;

    @Column(name="updated_by")
    private Integer updatedBy;

    @Column(name="is_deleted")
    private Boolean isDeleted;

    @Column(name="is_moderator")
    private Boolean isModerator;

    public UserBusinessGroup() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
