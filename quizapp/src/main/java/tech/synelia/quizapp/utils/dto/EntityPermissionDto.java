package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._EntityPermissionDto;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = false)
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class EntityPermissionDto extends _EntityPermissionDto implements Cloneable {

    private Integer id;
    private String  entityType;
    private Integer entityId;
    private String  permissionKey;
    private Boolean granted;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // Foreign keys
    private Integer userId;
    private Integer businessGroupId;
    private String  systemRole;
    private String  userFirstName;
    private String  userLastName;
    private String  userEmail;
    private String  userName;
    private String  userRole;

    // Search params
    private SearchParam<Integer> idParam;
    private SearchParam<String>  entityTypeParam;
    private SearchParam<Integer> entityIdParam;
    private SearchParam<String>  permissionKeyParam;
    private SearchParam<Integer> userIdParam;
    private SearchParam<Integer> businessGroupIdParam;
    private SearchParam<String>  systemRoleParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public EntityPermissionDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
