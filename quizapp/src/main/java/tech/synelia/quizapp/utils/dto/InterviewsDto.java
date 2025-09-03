
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
	private String     interviewStart       ;
	private String     interviewEnd         ;
    private String     interviewType        ;
    private Integer    markedOutOf          ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    private Integer    campaignId           ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   interviewLocationParam;                     
	private SearchParam<String>   interviewStartParam   ;                     
	private SearchParam<String>   interviewEndParam     ;                     
	private SearchParam<String>   interviewTypeParam    ;                     
	private SearchParam<Integer>  markedOutOfParam      ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  campaignIdParam       ;                     
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
