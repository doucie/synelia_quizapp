package tech.synelia.quizapp.utils.dto.customize;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class _FormVersionDto {
	// Custom fields for custom actions
	private String action; // "fork" or "duplicateQuestion"
	private Integer questionId; // for duplicateQuestion action

	public String getAction() { return action; }
	public void setAction(String action) { this.action = action; }
	public Integer getQuestionId() { return questionId; }
	public void setQuestionId(Integer questionId) { this.questionId = questionId; }
}
