/*
 * Java dto for entity table decisions
 * Created on 2025-10-27 ( Time 12:00:00 )
 * Generator tool : Synelia Tools
 */

package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;

/**
 * DTO for table "decisions"
 *
 * @author Synelia
 */
@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class DecisionDto implements Cloneable{

    private Integer    id                   ; // Primary Key

    private String     decisionType         ;
    private Boolean    isCancel             ;
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

    // Foreign keys
    private Integer    applicationId        ;
    private Integer    userId               ;
    private Integer    pipelineStageId      ;
    private Boolean    sendDecisionEmail    ;

    // Search parameters
    private SearchParam<String>  decisionTypeParam ;
    private SearchParam<Boolean> isCancelParam ;
    private SearchParam<String>  createdAtParam ;
    private SearchParam<Integer> createdByParam ;
    private SearchParam<String>  updatedAtParam ;
    private SearchParam<Integer> updatedByParam ;
    private SearchParam<Boolean> isDeletedParam ;
    private SearchParam<String>  searchStringParam ;
    private SearchParam<Integer> applicationIdParam ;
    private SearchParam<Integer> userIdParam ;

    //----------------------------------------------------------------------
    // CONSTRUCTOR(S)
    //----------------------------------------------------------------------
    public DecisionDto() {
        super();
    }

    //----------------------------------------------------------------------
    // clone METHOD
    //----------------------------------------------------------------------
    @Override
    public java.lang.Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}