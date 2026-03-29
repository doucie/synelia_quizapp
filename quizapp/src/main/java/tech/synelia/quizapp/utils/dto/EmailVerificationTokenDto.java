/*
 * Java dto for entity table email_verification_tokens
 * Created on 2025-10-08
 */

package tech.synelia.quizapp.utils.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.ToString;
import tech.synelia.quizapp.dao.entity.EmailVerificationToken.TokenType;

/**
 * DTO for table "email_verification_tokens"
 *
 * @author Generated
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class EmailVerificationTokenDto implements Cloneable {

    private Integer    id                   ; // Primary Key
    private String     email                ;
    private String     token                ;
    private TokenType  tokenType            ;
    private String     expiresAt            ;
    private Boolean    isUsed               ;
    private String     createdAt            ;
    private String     usedAt               ;
    private Integer    applicationId        ; // Référence vers l'application
    private Integer    userId               ; // Référence vers l'utilisateur

    //----------------------------------------------------------------------
    // CONSTRUCTORS
    //----------------------------------------------------------------------
    public EmailVerificationTokenDto() {
    }

    public EmailVerificationTokenDto(String email, String token, TokenType tokenType, Date expiresAt) {
        this.email = email;
        this.token = token;
        this.tokenType = tokenType;
        this.expiresAt = expiresAt != null ? expiresAt.toString() : null;
        this.isUsed = false;
    }

    //----------------------------------------------------------------------
    // BUSINESS METHODS
    //----------------------------------------------------------------------
    public boolean isExpired() {
        if (expiresAt == null) return true;
        try {
            Date expiryDate = new Date(Long.parseLong(expiresAt));
            return new Date().after(expiryDate);
        } catch (Exception e) {
            return true;
        }
    }
}