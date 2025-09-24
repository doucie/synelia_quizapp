
/*
 * Java dto for entity table departments 
 * Created on 2025-08-22 ( Time 11:38:26 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.dto;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._DepartmentsDto;

/**
 * DTO for table "departments"
 *
 * @author Geo
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class DepartmentsDto extends _DepartmentsDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     departmentName       ;
    private String     departmentDesc       ;
	private String     createdAt            ;
    private Integer    createdBy            ;
	private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    
    // Champs pour les intervalles de dates (recherche avancée)
    private String     dateCreationDe       ; // Date de création - début
    private String     dateCreationA        ; // Date de création - fin
    private String     dateModificationDe   ; // Date de modification - début
    private String     dateModificationA    ; // Date de modification - fin
    
    // Champs pour la suppression en cascade
    private Boolean    cascadeDelete        ; // Indique si on veut supprimer en cascade
    private Integer    associatedSpecialitiesCount; // Nombre de spécialités associées
    private List<String> associatedSpecialitiesNames; // Noms des spécialités associées

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------

	// Search param
	private SearchParam<Integer>  idParam               ;                     
	private SearchParam<String>   departmentNameParam   ;                     
	private SearchParam<String>   departmentDescParam   ;                     
	private SearchParam<String>   createdAtParam        ;                     
	private SearchParam<Integer>  createdByParam        ;                     
	private SearchParam<String>   updatedAtParam        ;                     
	private SearchParam<Integer>  updatedByParam        ;                     
	private SearchParam<Boolean>  isDeletedParam        ;                     
	private SearchParam<String>   searchStringParam     ;                     
    /**
     * Default constructor
     */
    public DepartmentsDto()
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
