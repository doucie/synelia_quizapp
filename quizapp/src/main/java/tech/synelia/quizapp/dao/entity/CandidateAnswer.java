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
@Table(name="candidate_answer")
public class CandidateAnswer implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer    id           ;

    @Column(name="free_text_response", length=65535)
    private String     freeTextResponse ;

    @Column(name="is_selected")
    private Boolean    isSelected   ;

    @Column(name="manual_is_correct")
    private Boolean    manualIsCorrect ;

    @Column(name="manual_correction_comment", length=65535)
    private String     manualCorrectionComment ;

    @Column(name="manual_correction_score")
    private Integer    manualCorrectionScore ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="manual_corrected_at")
    private Date       manualCorrectedAt ;

    @Column(name="manual_corrected_by")
    private Integer    manualCorrectedBy ;

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
    @JoinColumn(name="application_id", referencedColumnName="id")
    private Applications applications ;

    @ManyToOne
    @JoinColumn(name="application_quiz_attempt_id", referencedColumnName="id")
    private ApplicationQuizAttempt applicationQuizAttempt ;

    @ManyToOne
    @JoinColumn(name="question_id", referencedColumnName="id")
    private Question question      ;

    @ManyToOne
    @JoinColumn(name="answer_id", referencedColumnName="id")
    private Answer answer          ;

    public CandidateAnswer() {
		super();
    }

	@Override
	public java.lang.Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
