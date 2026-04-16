
/*
 * Java dto for entity table interview_crud 
 * Created on 2025-08-22 ( Time 11:38:26 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.customize._InterviewCrudDto;

/**
 * DTO for table "interview_crud"
 *
 * @author Geo
 */
@Data
@EqualsAndHashCode(callSuper = false)
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class InterviewCrudDto extends _InterviewCrudDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private Boolean    canUpdate            ;
    private Boolean    canDelete            ;
    private Boolean    canEvaluate          ;
    private Boolean    isAdmin              ;
    private Boolean    follow               ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    // Champs pour les intervalles de dates (recherche avancee)
    private String     dateCreationDe       ;
    private String     dateCreationA        ;
    private String     dateModificationDe   ;
    private String     dateModificationA    ;
    private Integer    interviewId          ;
    private Integer    userId               ;
    @JsonProperty("isOnline")
    private Boolean    isOnline             ;
    @JsonProperty("hasFinished")
    private Boolean    hasFinished          ;
    @JsonProperty("lastPingAt")
    private String     lastPingAt           ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------
	private String userFirstName;
	private String userLastName;

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<Boolean>  canUpdateParam        ;                     
	private SearchParam<Boolean>  canDeleteParam        ;                     
	private SearchParam<Boolean>  canEvaluateParam      ;                     
	private SearchParam<Boolean>  isAdminParam          ;                     
	private SearchParam<Boolean>  followParam           ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  interviewIdParam      ;                     
	private SearchParam<Integer>  userIdParam           ;                     
	private SearchParam<String>   userFirstNameParam    ;                     
	private SearchParam<String>   userLastNameParam     ;                     
	private SearchParam<Boolean>  isOnlineParam         ;                     
	private SearchParam<Boolean>  hasFinishedParam      ;                     
	private SearchParam<String>   lastPingAtParam       ;                     
    /**
     * Default constructor
     */
    public InterviewCrudDto()
    {
        super();
    }
    
	//----------------------------------------------------------------------
    // clone METHOD
    //----------------------------------------------------------------------
	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
