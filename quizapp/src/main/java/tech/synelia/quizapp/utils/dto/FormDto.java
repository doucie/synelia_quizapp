package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._FormDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class FormDto extends _FormDto implements Cloneable {

    private Integer    id                   ;
    private String     formName             ;
    private String     formDesc             ;
    private Boolean    isActive             ;
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

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<String>   formNameParam          ;
    private SearchParam<String>   formDescParam          ;
    private SearchParam<Boolean>  isActiveParam          ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    private SearchParam<Integer>  campaignIdParam        ;

    public FormDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
