
/*
 * Java dto for entity table interviews 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
import tech.synelia.quizapp.utils.dto.customize._InterviewsDto;

/**
 * DTO for table "interviews"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class InterviewsDto extends _InterviewsDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     interviewLocation    ;
	private String     interviewDate        ;
    private String     interviewStatus      ;
	private String     meetLink             ;
	private String     evaluationRoomCode ;
	private String     interviewNote        ;
	private Boolean    interviewMailSent    ;
    private String     interviewType        ;
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
    private Integer    campaignId           ;
    private Integer    applicationId        ;
	private Integer    applicationProgressId;
	private Integer    pipelineStageId      ;
	private String     pipelineStageType    ;
	private String     pipelineStageLabel   ;
	private Integer    pipelineStageOrder   ;
	private Integer    interviewRound       ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   interviewLocationParam;                     
	private SearchParam<String>   interviewDateParam    ;                     
	private SearchParam<String>   interviewStatusParam  ;                     
	private SearchParam<String>   meetLinkParam         ;                     
	private SearchParam<String>   evaluationRoomCodeParam ;                     
	private SearchParam<String>   interviewNoteParam    ;                     
	private SearchParam<Boolean>  interviewMailSentParam;                     
	private SearchParam<String>   interviewTypeParam    ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  campaignIdParam       ;                     
	private SearchParam<Integer>  applicationIdParam    ;                     
    /**
     * Default constructor
     */
    public InterviewsDto()
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
