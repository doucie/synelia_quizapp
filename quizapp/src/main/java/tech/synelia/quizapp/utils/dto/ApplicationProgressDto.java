package tech.synelia.quizapp.utils.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._ApplicationProgressDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class ApplicationProgressDto extends _ApplicationProgressDto implements Cloneable {

    private Integer id;
    private String  progressStatus;
    private String  startedAt;
    private String  completedAt;
    private Double  score;
    private String  notes;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // FK
    private Integer applicationId;
    private Integer pipelineStageId;
    private Integer decidedById;

    // Flattened depuis PipelineStage
    private String  stageName;
    private String  stageType;
    private Integer stageOrder;

    // Flattened depuis Application
    private String  candidateFirstName;
    private String  candidateLastName;

    // Flattened depuis User (decidedBy)
    private String  decidedByFirstName;
    private String  decidedByLastName;

    // Migration pipeline
    private Integer campaignId;
    private Integer newTemplateId;
    private List<Integer> migratableApplicationIds;

    // Champs pour les intervalles de dates
    private String dateCreationDe;
    private String dateCreationA;
    private String dateModificationDe;
    private String dateModificationA;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  progressStatusParam;
    private SearchParam<String>  startedAtParam;
    private SearchParam<String>  completedAtParam;
    private SearchParam<Double>  scoreParam;
    private SearchParam<String>  notesParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;
    private SearchParam<Integer> applicationIdParam;
    private SearchParam<Integer> pipelineStageIdParam;
    private SearchParam<Integer> decidedByIdParam;

    public ApplicationProgressDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
