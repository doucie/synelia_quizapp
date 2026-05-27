package tech.synelia.quizapp.utils.dto.customize;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import java.util.List;

@JsonInclude(Include.NON_NULL)
public class _FormDto {
	private String action;
	private List<Integer> formIds;

	public String getAction() { return action; }
	public void setAction(String action) { this.action = action; }
	public List<Integer> getFormIds() { return formIds; }
	public void setFormIds(List<Integer> formIds) { this.formIds = formIds; }
}
