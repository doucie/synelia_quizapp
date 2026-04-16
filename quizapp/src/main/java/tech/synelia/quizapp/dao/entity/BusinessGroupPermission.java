package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@Entity
@Table(name="business_group_permission")
public class BusinessGroupPermission implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer id;

    @Column(name="functionality", nullable=false, length=100)
    private String functionality;

    // --- [ Foreign keys ] ---
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

    public BusinessGroupPermission() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
