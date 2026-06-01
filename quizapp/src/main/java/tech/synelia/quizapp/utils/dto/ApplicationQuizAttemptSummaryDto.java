package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class ApplicationQuizAttemptSummaryDto {

	private Integer id;
	private String quizToken;
	private String quizStatus;
	private String manualCorrectionStatus;
	private Double score;
	private Double scorePercent;
	private Integer totalQuestions;
	private Integer timeElapsed;
	private Boolean timedSnapshot;
	private Integer totalTimeAllowedSnapshot;
	private String lastActivityAt;
	private String startedAt;
	private String completedAt;
	private String createdAt;
	private String updatedAt;
}