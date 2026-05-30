package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._QuestionDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class QuestionDto extends _QuestionDto implements Cloneable {

    private Integer    id                   ;
    private String     questionRef          ;
    private String     questionText         ;
    private Integer    questionChrono       ;
    private String     questionType         ;
    private Integer    score                ;
    private String     difficultyLevel      ;
    private Boolean    allAnswersJustificationRequired ;
    private Boolean    manualCorrectionRequired ;
    private String     freeTextResponsePlaceholder ;
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

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<String>   questionRefParam       ;
    private SearchParam<String>   questionTextParam      ;
    private SearchParam<Integer>  questionChronoParam    ;
    private SearchParam<String>   questionTypeParam      ;
    private SearchParam<Integer>  scoreParam             ;
    private SearchParam<String>   difficultyLevelParam   ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    private SearchParam<Integer>  specialityIdParam      ;

    public QuestionDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
