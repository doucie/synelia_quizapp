package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.customize._InterviewParticipantDto;

/**
 * DTO for table "interview_participant"
 */
@Data
@EqualsAndHashCode(callSuper = false)
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class InterviewParticipantDto extends _InterviewParticipantDto implements Cloneable{

    private Integer    id                   ; // Primary Key

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
    private Integer    interviewId          ;
    private Integer    userId               ;
    @JsonProperty("isOnline")
    private Boolean    isOnline             ;
    @JsonProperty("hasFinished")
    private Boolean    hasFinished          ;
    @JsonProperty("lastPingAt")
    private String     lastPingAt           ;

    //----------------------------------------------------------------------
    // ENTITY LINKS FIELD ( RELATIONSHIP )
    //----------------------------------------------------------------------
	private String userFirstName;
	private String userLastName;

	// Search param
	private SearchParam<Integer>  idParam               ;
	private SearchParam<String>   createdAtParam        ;
	private SearchParam<Integer>  createdByParam        ;
	private SearchParam<String>   updatedAtParam        ;
	private SearchParam<Integer>  updatedByParam        ;
	private SearchParam<Boolean>  isDeletedParam        ;
	private SearchParam<String>   searchStringParam     ;
	private SearchParam<Integer>  interviewIdParam      ;
	private SearchParam<Integer>  userIdParam           ;
	private SearchParam<String>   userFirstNameParam    ;
	private SearchParam<String>   userLastNameParam     ;
	private SearchParam<Boolean>  isOnlineParam         ;
	private SearchParam<Boolean>  hasFinishedParam      ;
	private SearchParam<String>   lastPingAtParam       ;

    public InterviewParticipantDto()
    {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
