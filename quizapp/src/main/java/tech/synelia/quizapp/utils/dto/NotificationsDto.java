
/*
 * Java dto for entity table notifications 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
import tech.synelia.quizapp.utils.dto.customize._NotificationsDto;

/**
 * DTO for table "notifications"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class NotificationsDto extends _NotificationsDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     notifType            ;
    private Integer    notifActor           ;
    private String     notifLink            ;
    private Boolean    isRead               ;
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
    private String     objectTableName      ;
    private Integer    objectTableId        ;
    private Integer    userId               ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------
	private String userFirstName;
	private String userLastName;

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   notifTypeParam        ;                     
	private SearchParam<Integer>  notifActorParam       ;                     
	private SearchParam<String>   notifLinkParam        ;                     
	private SearchParam<Boolean>  isReadParam           ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<String>   objectTableNameParam  ;                     
	private SearchParam<Integer>  objectTableIdParam    ;                     
	private SearchParam<Integer>  userIdParam           ;                     
	private SearchParam<String>   userFirstNameParam    ;                     
	private SearchParam<String>   userLastNameParam     ;                     
    /**
     * Default constructor
     */
    public NotificationsDto()
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
