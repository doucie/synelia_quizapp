package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.*;

@Data
@ToString
@Entity
@Table(name = "smtp_config")
public class SmtpConfig implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "host", nullable = false, length = 255)
    private String host;

    @Column(name = "port", nullable = false)
    private Integer port;

    @Column(name = "username", length = 255)
    private String username;

    @Column(name = "password_encrypted", length = 500)
    private String passwordEncrypted;

    @Column(name = "smtp_auth")
    private Boolean smtpAuth;

    @Column(name = "starttls_enable")
    private Boolean starttlsEnable;

    @Column(name = "starttls_required")
    private Boolean starttlsRequired;

    @Column(name = "connection_timeout")
    private Integer connectionTimeout;

    @Column(name = "timeout")
    private Integer timeout;

    @Column(name = "write_timeout")
    private Integer writeTimeout;

    @Column(name = "sender_name", length = 255)
    private String senderName;

    @Column(name = "sender_email", length = 255)
    private String senderEmail;

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

    public SmtpConfig() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
