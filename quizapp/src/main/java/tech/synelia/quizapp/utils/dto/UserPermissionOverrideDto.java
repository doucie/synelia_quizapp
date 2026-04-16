package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._UserPermissionOverrideDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class UserPermissionOverrideDto extends _UserPermissionOverrideDto implements Cloneable {

    private Integer id;
    private String  functionality;
    private Boolean isAllowed;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;

    // Foreign keys
    private Integer userId;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  functionalityParam;
    private SearchParam<Boolean> isAllowedParam;
    private SearchParam<Integer> userIdParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;

    public UserPermissionOverrideDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
