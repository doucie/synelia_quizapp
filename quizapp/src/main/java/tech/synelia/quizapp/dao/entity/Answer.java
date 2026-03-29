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
@Table(name="answer")
public class Answer implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer    id           ;

    @Column(name="answer_text", nullable=false, length=65535)
    private String     answerText   ;

    @Column(name="answer_type", length=20)
    private String     answerType   ;

    @Column(name="answer_order")
    private Integer    answerOrder  ;

    @Column(name="is_correct")
    private Boolean    isCorrect    ;

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
    @JoinColumn(name="question_id", referencedColumnName="id")
    private Question question      ;

    public Answer() {
		super();
    }

	@Override
	public java.lang.Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
