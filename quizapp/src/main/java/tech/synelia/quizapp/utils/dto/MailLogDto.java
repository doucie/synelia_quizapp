package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.customize._MailLogDto;

@Data
@ToString
@EqualsAndHashCode(callSuper = false)
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class MailLogDto extends _MailLogDto implements Cloneable {

	private Integer id;
	private String recipientEmail;
	private Integer recipientUserId;
	private Integer senderUserId;
	private Integer emailTemplateId;
	private String subject;
	private String bodyPreview;
	private String status;
	private String errorMessage;
	private String sentAt;
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

	private SearchParam<Integer> idParam;
	private SearchParam<String> recipientEmailParam;
	private SearchParam<Integer> recipientUserIdParam;
	private SearchParam<Integer> senderUserIdParam;
	private SearchParam<Integer> emailTemplateIdParam;
	private SearchParam<String> subjectParam;
	private SearchParam<String> bodyPreviewParam;
	private SearchParam<String> statusParam;
	private SearchParam<String> errorMessageParam;
	private SearchParam<String> sentAtParam;
	private SearchParam<String> createdAtParam;
	private SearchParam<Integer> createdByParam;
	private SearchParam<String> updatedAtParam;
	private SearchParam<Integer> updatedByParam;
	private SearchParam<Boolean> isDeletedParam;
	private SearchParam<String> searchStringParam;

	public MailLogDto() {
		super();
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}