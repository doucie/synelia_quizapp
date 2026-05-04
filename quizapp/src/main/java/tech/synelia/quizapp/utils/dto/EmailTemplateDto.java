package tech.synelia.quizapp.utils.dto;

import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._EmailTemplateDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class EmailTemplateDto extends _EmailTemplateDto implements Cloneable {

    private Integer id;
    private String  templateKey;
    private String  subjectTemplate;
    private String  bodyTemplate;
    private String  editableVariablesJson;
    private String  description;
    private String  availableVariables;
    private String  actionType;
    private Integer presetId;
    private Boolean isActive;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // Champs pour les intervalles de dates (recherche avancee)
    private String     dateCreationDe       ;
    private String     dateCreationA        ;
    private String     dateModificationDe   ;
    private String     dateModificationA    ;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  templateKeyParam;
    private SearchParam<String>  subjectTemplateParam;
    private SearchParam<String>  bodyTemplateParam;
    private SearchParam<String>  editableVariablesJsonParam;
    private SearchParam<String>  descriptionParam;
    private SearchParam<Boolean> isActiveParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public EmailTemplateDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
