package tech.synelia.quizapp.utils.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._PipelineTemplateDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class PipelineTemplateDto extends _PipelineTemplateDto implements Cloneable {

    private Integer id;
    private String  templateName;
    private String  templateDesc;
    private Boolean isDefault;
    private Boolean isActive;
    private Boolean isLocked;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private Boolean autoDuplicated;
    private Integer newTemplateId;
    private String  searchString;

    // Liste des étapes (pour retourner le template complet)
    private List<PipelineStageDto> stages;

    // Champs pour les intervalles de dates
    private String dateCreationDe;
    private String dateCreationA;
    private String dateModificationDe;
    private String dateModificationA;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  templateNameParam;
    private SearchParam<String>  templateDescParam;
    private SearchParam<Boolean> isDefaultParam;
    private SearchParam<Boolean> isActiveParam;
    private SearchParam<Boolean> isLockedParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public PipelineTemplateDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
