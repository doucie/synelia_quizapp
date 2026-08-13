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
public class EvaluationItemDto implements Cloneable {

	private Integer id;
	private Integer evaluationGridTemplateItemId;
	private Integer criterionOrder;
	private String label;
	private String criterionType;
	private Double scoreValue;
	private String textValue;
	private Double weightSnapshot;
	private Double maxScoreSnapshot;

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}