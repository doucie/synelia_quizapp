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
@Table(name="question")
public class Question implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer    id           ;

    @Column(name="question_ref", length=36)
    private String     questionRef  ;

    @Column(name="question_text", nullable=false, length=65535)
    private String     questionText ;

    @Column(name="question_chrono")
    private Integer    questionChrono ;

    @Column(name="question_type", length=20)
    private String     questionType ;

    @Column(name="score")
    private Integer    score        ;

    @Column(name="difficulty_level", length=20)
    private String     difficultyLevel ;

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

    @ManyToOne
    @JoinColumn(name="speciality_id", referencedColumnName="id")
    private Specialities specialities ;

    public Question() {
		super();
    }

	@Override
	public java.lang.Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
