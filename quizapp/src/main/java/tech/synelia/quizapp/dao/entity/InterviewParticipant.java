package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

/**
 * InterviewParticipant — état de session d'un participant à un entretien.
 * Remplace InterviewCrud (table renommée interview_participant par V1_014).
 * Ne contient que les champs d'état de session (pas de permissions).
 */
@Data
@ToString
@Entity
@Table(name="interview_participant")
public class InterviewParticipant implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Integer id;

    @Column(name="is_online")
    private Boolean isOnline;

    @Column(name="has_finished")
    private Boolean hasFinished;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="last_ping_at")
    private Date lastPingAt;

    // --- [ Foreign keys ] ---
    @ManyToOne
    @JoinColumn(name="user_id", referencedColumnName="id")
    private User user;

    @ManyToOne
    @JoinColumn(name="interview_id", referencedColumnName="id")
    private Interviews interviews;

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

    public InterviewParticipant() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
