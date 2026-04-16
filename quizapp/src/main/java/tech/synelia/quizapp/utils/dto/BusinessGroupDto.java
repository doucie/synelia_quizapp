package tech.synelia.quizapp.utils.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._BusinessGroupDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class BusinessGroupDto extends _BusinessGroupDto implements Cloneable {

    private Integer id;
    private String  groupName;
    private String  groupDesc;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // Liste des fonctionnalités du groupe (pour retourner le groupe complet)
    private List<String> functionalities;

    // Champs pour les intervalles de dates
    private String dateCreationDe;
    private String dateCreationA;
    private String dateModificationDe;
    private String dateModificationA;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  groupNameParam;
    private SearchParam<String>  groupDescParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public BusinessGroupDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
