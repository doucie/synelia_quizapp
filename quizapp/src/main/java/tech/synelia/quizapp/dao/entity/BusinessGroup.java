package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@Entity
@Table(name="business_group")
public class BusinessGroup implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer id;

    @Column(name="group_name", nullable=false, length=100)
    private String groupName;

    @Column(name="group_desc", length=65535)
    private String groupDesc;

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

    @Column(name="search_string", length=65535)
    private String searchString;

    public BusinessGroup() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
