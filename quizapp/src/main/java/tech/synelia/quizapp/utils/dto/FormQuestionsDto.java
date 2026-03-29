package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._FormQuestionsDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class FormQuestionsDto extends _FormQuestionsDto implements Cloneable {

    private Integer    id                   ;
    private Integer    questionOrder        ;
    private Integer    chronoOverride       ;
    private String     createdAt            ;
    private Integer    createdBy            ;
    private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    private Integer    formVersionId        ;
    private Integer    questionId           ;

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<Integer>  questionOrderParam     ;
    private SearchParam<Integer>  chronoOverrideParam    ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    private SearchParam<Integer>  formVersionIdParam     ;
    private SearchParam<Integer>  questionIdParam        ;

    public FormQuestionsDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
