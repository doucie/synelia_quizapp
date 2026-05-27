package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.customize._CampaignFormDto;

@Data
@ToString
@EqualsAndHashCode(callSuper = false)
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class CampaignFormDto extends _CampaignFormDto implements Cloneable {

	private Integer id;
	private Integer assignmentOrder;
	private String createdAt;
	private Integer createdBy;
	private String updatedAt;
	private Integer updatedBy;
	private Boolean isDeleted;
	private String searchString;
	private String dateCreationDe;
	private String dateCreationA;
	private String dateModificationDe;
	private String dateModificationA;
	private Integer campaignId;
	private Integer formId;

	private SearchParam<Integer> idParam;
	private SearchParam<Integer> assignmentOrderParam;
	private SearchParam<String> createdAtParam;
	private SearchParam<Integer> createdByParam;
	private SearchParam<String> updatedAtParam;
	private SearchParam<Integer> updatedByParam;
	private SearchParam<Boolean> isDeletedParam;
	private SearchParam<String> searchStringParam;
	private SearchParam<Integer> campaignIdParam;
	private SearchParam<Integer> formIdParam;

	public CampaignFormDto() {
		super();
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}