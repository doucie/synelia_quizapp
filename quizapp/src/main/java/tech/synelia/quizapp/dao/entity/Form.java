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
@Table(name="form")
public class Form implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer    id           ;

    @Column(name="form_name", nullable=false, length=255)
    private String     formName     ;

    @Column(name="form_desc", length=65535)
    private String     formDesc     ;

    @Column(name="is_active")
    private Boolean    isActive     ;

    @Column(name="is_timed", nullable=false, columnDefinition="BOOLEAN DEFAULT FALSE")
    private Boolean    isTimed      ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_at")
    private Date       createdAt    ;

    @Column(name="created_by")
    private Integer    createdBy    ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="updated_at")
    private Date       updatedAt    ;

    @Column(name="updated_by")
    private Integer    updatedBy    ;

    @Column(name="is_deleted")
    private Boolean    isDeleted    ;

    @Column(name="search_string", length=65535)
    private String     searchString ;

    public Form() {
		super();
    }

	@Override
	public java.lang.Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
