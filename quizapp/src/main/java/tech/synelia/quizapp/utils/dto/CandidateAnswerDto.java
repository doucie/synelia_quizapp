package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;

import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._CandidateAnswerDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class CandidateAnswerDto extends _CandidateAnswerDto implements Cloneable {

    private Integer    id                   ;
    private String     freeTextResponse     ;
    private Boolean    isSelected           ;
    private Boolean    manualIsCorrect      ;
    private String     manualCorrectionComment ;
    private Integer    manualCorrectionScore ;
    private String     manualCorrectedAt    ;
    private Integer    manualCorrectedBy    ;
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
    private Integer    applicationId        ;
    private Integer    applicationQuizAttemptId ;
    private Integer    questionId           ;
    private String     questionText         ;
    private String     questionType         ;
    private String     applicationQuizAttemptQuizStatus ;
    private String     applicationQuizAttemptManualCorrectionStatus ;
    private Double     applicationQuizAttemptScore ;
    private Double     applicationQuizAttemptScorePercent ;
    private String     applicationQuizAttemptLastActivityAt ;
    private String     applicationQuizAttemptStartedAt ;
    private String     applicationQuizAttemptCompletedAt ;
    private Integer    questionScore        ;
    private Boolean    manualCorrectionRequired ;
    private String     answerText           ;
    private Integer    answerId             ;
    private Integer    answerOrder          ;
    private String     action               ;

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<String>   freeTextResponseParam  ;
    private SearchParam<Boolean>  isSelectedParam        ;
    private SearchParam<Boolean>  manualIsCorrectParam   ;
    private SearchParam<String>   manualCorrectionCommentParam ;
    private SearchParam<Integer>  manualCorrectionScoreParam ;
    private SearchParam<String>   manualCorrectedAtParam ;
    private SearchParam<Integer>  manualCorrectedByParam ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    private SearchParam<Integer>  applicationIdParam     ;
    private SearchParam<Integer>  applicationQuizAttemptIdParam ;
    private SearchParam<Integer>  questionIdParam        ;
    private SearchParam<Integer>  answerIdParam          ;

    public CandidateAnswerDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
