
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
    private Float      totalEvaluationScore ;
    private Integer    totalEvaluationNumber ;
    private Double     totalEvaluationPercentage ;
    private String     applicationStatus    ;
    private String     quizToken            ;
    private String     quizStatus           ;
    private Integer    quizLevel            ;
    private Integer    totalQuestions       ;
    private Integer    quizScorePercent     ;
    private String     quizManualCorrectionStatus ;
    private Integer    timeElapsed          ;
    private String     interviewDate        ;
    private String     interviewStatus      ;
    private Boolean    applicationAbandoned ;
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
    private Integer    sourceTokenId        ;
    private Integer    formVersionId        ;
    private Integer    questionId           ;
    private Integer    answerId             ;
    private List<Integer> selectedAnswerIds ;
    private String     freeTextResponse     ;

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
	private SearchParam<Float>    totalEvaluationScoreParam ;                     
	private SearchParam<Integer>  totalEvaluationNumberParam ;                     
	private SearchParam<Double>   totalEvaluationPercentageParam ;                     
	private SearchParam<String>   applicationStatusParam;                     
	private SearchParam<String>   quizTokenParam        ;                     
	private SearchParam<String>   quizStatusParam       ;                     
	private SearchParam<Integer>  quizLevelParam        ;                     
	private SearchParam<Integer>  totalQuestionsParam   ;                     
	private SearchParam<Integer>  quizScorePercentParam ;                     
    private SearchParam<String>   quizManualCorrectionStatusParam ;                     
	private SearchParam<Integer>  timeElapsedParam      ;                     
	private SearchParam<String>   interviewDateParam    ;                     
	private SearchParam<String>   interviewStatusParam  ;                     
	private SearchParam<Boolean>  applicationAbandonedParam ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  sourceTokenIdParam    ;                     
	private SearchParam<Integer>  formVersionIdParam    ;                     
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
