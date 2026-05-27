package tech.synelia.quizapp.utils.dto.customize;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class _FormVersionDto {
	// Custom fields for custom actions
	private String action; // "fork", "publish", "duplicateQuestion" or "ensureEditableQuestion"
	private Integer questionId; // request target question id, or response editable question id

	public String getAction() { return action; }
	public void setAction(String action) { this.action = action; }
	public Integer getQuestionId() { return questionId; }
	public void setQuestionId(Integer questionId) { this.questionId = questionId; }
}
