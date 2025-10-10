
/*
 * Java dto for entity table applications 
 * Created on 2025-08-22 ( Time 11:38:24 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.dto;

import java.util.Date;
import java.util.List;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._ApplicationsDto;

/**
 * DTO for table "applications"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class ApplicationsDto extends _ApplicationsDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     candidateFirstName   ;
    private String     candidateLastName    ;
    private String     candidateEmail       ;
    private String     candidatePhone       ;
    private String     candidateCvPath      ;
    private String     candidateBirthDate   ; // Date de naissance du candidat
    private String     motivationLetter     ; // Lettre de motivation du candidat
    private Boolean    emailVerified        ;
    private Integer    quizScore            ;
    private Float      evaluationScore      ;
    private String     applicationStatus    ;
    private String     visitToken           ;
    private String     quizToken            ;
    private String     quizStatus           ;
    private Integer    quizLevel            ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    private Integer    sourceTokenId        ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   candidateFirstNameParam;                     
	private SearchParam<String>   candidateLastNameParam;                     
	private SearchParam<String>   candidateEmailParam   ;                     
	private SearchParam<String>   candidatePhoneParam   ;                     
	private SearchParam<String>   candidateCvPathParam  ;                     
	private SearchParam<String>   candidateBirthDateParam;                     
	private SearchParam<String>   motivationLetterParam ;                     
	private SearchParam<Boolean>  emailVerifiedParam    ;                     
	private SearchParam<Integer>  quizScoreParam        ;                     
	private SearchParam<Float>    evaluationScoreParam  ;                     
	private SearchParam<String>   applicationStatusParam;                     
	private SearchParam<String>   visitTokenParam       ;                     
	private SearchParam<String>   quizTokenParam        ;                     
	private SearchParam<String>   quizStatusParam       ;                     
	private SearchParam<Integer>  quizLevelParam        ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  sourceTokenIdParam    ;                     
    /**
     * Default constructor
     */
    public ApplicationsDto()
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
