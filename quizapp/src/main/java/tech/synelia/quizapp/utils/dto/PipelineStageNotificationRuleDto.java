package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._PipelineStageNotificationRuleDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class PipelineStageNotificationRuleDto extends _PipelineStageNotificationRuleDto implements Cloneable {

    private Integer id;
    private String  triggerCode;
    private String  outcomeCode;
    private Integer emailTemplateId;
    private Boolean isRequired;
    private Boolean isAutomatic;
    private Boolean requiresManualConfirmation;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // FK
    private Integer pipelineStageId;
    // Flattened
    private String  pipelineStageLabel;
    private String  emailTemplateName;

    // Champs pour les intervalles de dates
    private String dateCreationDe;
    private String dateCreationA;
    private String dateModificationDe;
    private String dateModificationA;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  triggerCodeParam;
    private SearchParam<String>  outcomeCodeParam;
    private SearchParam<Integer> emailTemplateIdParam;
    private SearchParam<Boolean> isRequiredParam;
    private SearchParam<Boolean> isAutomaticParam;
    private SearchParam<Boolean> requiresManualConfirmationParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;
    private SearchParam<Integer> pipelineStageIdParam;

    public PipelineStageNotificationRuleDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
