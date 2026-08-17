package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._FormVersionDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class FormVersionDto extends _FormVersionDto implements Cloneable {

    private Integer    id                   ;
    private Integer    versionNumber        ;
    private Boolean    isPublished          ;
    private Boolean    isLocked             ;
    private Boolean    randomQuestions      ;
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
    private Integer    formId               ;
    private Boolean    autoVersionCreated   ;
    private Integer    newVersionNumber     ;

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<Integer>  versionNumberParam     ;
    private SearchParam<Boolean>  isPublishedParam       ;
    private SearchParam<Boolean>  isLockedParam          ;
    private SearchParam<Boolean>  randomQuestionsParam   ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    private SearchParam<Integer>  formIdParam            ;

    public FormVersionDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
