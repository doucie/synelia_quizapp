
/*
 * Java dto for entity table campaigns 
 * Created on 2025-08-22 ( Time 11:38:25 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.dto;

// import java.util.Date;
// import java.util.List;
// import java.util.Date;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._CampaignsDto;

/**
 * DTO for table "campaigns"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class CampaignsDto extends _CampaignsDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     campaignTitle        ;
    private String     campaignDesc         ;
    private String     campaignStatus       ;
	private String     campaignStart        ;
	private String     campaignEnd          ;
    private Integer    maxApply             ;
    private Boolean    allCanEvaluate       ;
    private Integer    totalQuestions       ;
    private Boolean    isTimed              ;
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
    private Integer    specialityId         ;
    private Integer    creatorId            ;
    private Integer    pipelineTemplateId   ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------
	private String userFirstName;
	private String userLastName;
	private String creatorName;  // Nom complet du créateur (username ou firstName + lastName)
	private String specialityName;
	private String pipelineTemplateName;

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   campaignTitleParam    ;                     
	private SearchParam<String>   campaignDescParam     ;                     
	private SearchParam<String>   campaignStatusParam   ;                     
	private SearchParam<String>   campaignStartParam    ;                     
	private SearchParam<String>   campaignEndParam      ;                     
	private SearchParam<Integer>  maxApplyParam         ;                     
	private SearchParam<Boolean>  allCanEvaluateParam   ;                     
	private SearchParam<Integer>  totalQuestionsParam   ;                     
	private SearchParam<Boolean>  isTimedParam          ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  specialityIdParam     ;                     
	private SearchParam<Integer>  creatorIdParam        ;                     
	private SearchParam<String>   userFirstNameParam    ;                     
	private SearchParam<String>   userLastNameParam     ;                     
    /**
     * Default constructor
     */
    public CampaignsDto()
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
