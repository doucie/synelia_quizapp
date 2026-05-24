package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._AnswerDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class AnswerDto extends _AnswerDto implements Cloneable {

    private Integer    id                   ;
    private String     answerText           ;
    private String     answerType           ;
    private Boolean    allowAdditionalComment ;
    private Boolean    additionalCommentRequired ;
    private String     additionalCommentPlaceholder ;
    private Integer    answerOrder          ;
    private Boolean    isCorrect            ;
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
    private Integer    questionId           ;

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<String>   answerTextParam        ;
    private SearchParam<String>   answerTypeParam        ;
    private SearchParam<Integer>  answerOrderParam       ;
    private SearchParam<Boolean>  isCorrectParam         ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    private SearchParam<Integer>  questionIdParam        ;

    public AnswerDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
