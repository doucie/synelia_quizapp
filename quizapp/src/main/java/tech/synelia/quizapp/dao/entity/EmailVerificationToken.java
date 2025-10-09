/*
 * Created on 2025-10-08
 * Entity for email verification tokens
 */

package tech.synelia.quizapp.dao.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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

/**
 * Persistent class for entity stored in table "email_verification_tokens"
 *
 * @author Generated
 */
@Data
@ToString
@Entity
@Table(name="email_verification_tokens")
public class EmailVerificationToken implements Serializable, Cloneable {

    private static final long serialVersionUID = 1L;

    //----------------------------------------------------------------------
    // ENTITY PRIMARY KEY ( BASED ON A SINGLE FIELD )
    //----------------------------------------------------------------------
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //----------------------------------------------------------------------
    // ENTITY DATA FIELDS
    //----------------------------------------------------------------------
    @Column(name="email", nullable=false, length=255)
    private String email;

    @Column(name="token", nullable=false, length=255, unique=true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name="token_type", nullable=false)
    private TokenType tokenType = TokenType.APPLICATION_VERIFICATION;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="expires_at", nullable=false)
    private Date expiresAt;

    @Column(name="is_used", nullable=false)
    private Boolean isUsed = false;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_at", nullable=false, updatable=false)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="used_at")
    private Date usedAt;

    //----------------------------------------------------------------------
    // ENTITY RELATIONSHIPS
    //----------------------------------------------------------------------
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="application_id")
    private Applications application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;

    //----------------------------------------------------------------------
    // ENUM FOR TOKEN TYPES
    //----------------------------------------------------------------------
    public enum TokenType {
        APPLICATION_VERIFICATION,
        PASSWORD_RESET,
        USER_REGISTRATION
    }

    //----------------------------------------------------------------------
    // CONSTRUCTORS
    //----------------------------------------------------------------------
    public EmailVerificationToken() {
        this.createdAt = new Date();
        this.isUsed = false;
    }

    public EmailVerificationToken(String email, String token, TokenType tokenType, Date expiresAt) {
        this();
        this.email = email;
        this.token = token;
        this.tokenType = tokenType;
        this.expiresAt = expiresAt;
    }

    //----------------------------------------------------------------------
    // BUSINESS METHODS
    //----------------------------------------------------------------------
    public boolean isExpired() {
        return new Date().after(this.expiresAt);
    }

    public void markAsUsed() {
        this.isUsed = true;
        this.usedAt = new Date();
    }
}