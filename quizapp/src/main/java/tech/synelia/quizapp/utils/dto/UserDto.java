
/*
 * Java dto for entity table user 
 * Created on 2025-08-22 ( Time 11:38:28 )
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

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.customize._UserDto;

/**
 * DTO for table "user"
 *
 * @author Geo
 */
@Data
@EqualsAndHashCode(callSuper = true) // <--- Added EqualsAndHashCode
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class UserDto extends _UserDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     firstName            ;
    private String     lastName             ;
    private String     username             ;
    private String     email                ;
    private String     phone                ;
    private String     password             ;
    private Boolean    isDefaultPassword    ;
    private String     userRole             ;
    private Boolean    isOnline             ;
    private Boolean    isLocked             ;
	private String     lastConnectionDate   ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private Boolean    adminMode            ;
    private String     searchString         ;
    private Integer    pageSizePreference   ;

    // Champs pour les intervalles de dates (recherche avancée)
    private String     dateCreationDe       ; // Date de création - début
    private String     dateCreationA        ; // Date de création - fin
    private String     dateModificationDe   ; // Date de modification - début
    private String     dateModificationA    ; // Date de modification - fin

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   firstNameParam        ;                     
	private SearchParam<String>   lastNameParam         ;                     
	private SearchParam<String>   usernameParam         ;                     
	private SearchParam<String>   emailParam            ;                     
	private SearchParam<String>   phoneParam            ;                     
	private SearchParam<String>   passwordParam         ;                     
	private SearchParam<Boolean>  isDefaultPasswordParam;                     
	private SearchParam<String>   userRoleParam         ;                     
	private SearchParam<Boolean>  isOnlineParam         ;                     
	private SearchParam<Boolean>  isLockedParam         ;                     
	private SearchParam<String>   lastConnectionDateParam;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<Boolean>  adminModeParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
	private SearchParam<Integer>  pageSizePreferenceParam;                     
    /**
     * Default constructor
     */
    public UserDto()
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
