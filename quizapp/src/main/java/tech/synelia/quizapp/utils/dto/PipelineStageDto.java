package tech.synelia.quizapp.utils.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._PipelineStageDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class PipelineStageDto extends _PipelineStageDto implements Cloneable {

    private Integer id;
    private String  stageType;
    private String  stageLabel;
    private Integer stageOrder;
    private Boolean isRequired;
    private Boolean isEliminatory;
    private Boolean isActive;
    private Boolean isLocked;
    private String  configJson;
    private Integer evaluationGridTemplateVersionId;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // FK
    private Integer pipelineTemplateId;
    // Flattened
    private String  pipelineTemplateName;

    // Champ utilitaire pour le reorder
    private List<Integer> orderedStageIds;

    // Champs pour les intervalles de dates
    private String dateCreationDe;
    private String dateCreationA;
    private String dateModificationDe;
    private String dateModificationA;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  stageTypeParam;
    private SearchParam<String>  stageLabelParam;
    private SearchParam<Integer> stageOrderParam;
    private SearchParam<Boolean> isRequiredParam;
    private SearchParam<Boolean> isEliminatoryParam;
    private SearchParam<Boolean> isActiveParam;
    private SearchParam<String>  configJsonParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;
    private SearchParam<Integer> pipelineTemplateIdParam;

    public PipelineStageDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
