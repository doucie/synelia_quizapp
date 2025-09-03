
/*
 * Java dto for entity table campaign_crud 
 * Created on 2025-08-22 ( Time 11:38:24 )
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
import tech.synelia.quizapp.utils.dto.customize._CampaignCrudDto;

/**
 * DTO for table "campaign_crud"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class CampaignCrudDto extends _CampaignCrudDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private Boolean    canUpdate            ;
    private Boolean    canDelete            ;
    private Boolean    canEvaluate          ;
    private Boolean    follow               ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    private Integer    campaignId           ;
    private Integer    userId               ;

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
	private SearchParam<Boolean>  followParam           ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  campaignIdParam       ;                     
	private SearchParam<Integer>  userIdParam           ;                     
	private SearchParam<String>   userFirstNameParam    ;                     
	private SearchParam<String>   userLastNameParam     ;                     
    /**
     * Default constructor
     */
    public CampaignCrudDto()
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
