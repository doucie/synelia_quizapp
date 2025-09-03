
/*
 * Java dto for entity table candidate_ask 
 * Created on 2025-08-22 ( Time 11:38:25 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.dto;

import java.util.Date;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._CandidateAskDto;

/**
 * DTO for table "candidate_ask"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class CandidateAskDto extends _CandidateAskDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     requestType          ;
    private Boolean    isVerified           ;
    private String     firstName            ;
    private String     lastName             ;
    private String     newEmail             ;
    private String     newPhone             ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    private Integer    applicationId        ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   requestTypeParam      ;                     
	private SearchParam<Boolean>  isVerifiedParam       ;                     
	private SearchParam<String>   firstNameParam        ;                     
	private SearchParam<String>   lastNameParam         ;                     
	private SearchParam<String>   newEmailParam         ;                     
	private SearchParam<String>   newPhoneParam         ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  applicationIdParam    ;                     
    /**
     * Default constructor
     */
    public CandidateAskDto()
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
