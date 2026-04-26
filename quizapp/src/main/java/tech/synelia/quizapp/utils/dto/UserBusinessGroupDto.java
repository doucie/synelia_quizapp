package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class UserBusinessGroupDto implements Cloneable {

    private Integer    id                   ;
    private Integer    userId               ;
    private Integer    businessGroupId      ;
    private String     createdAt            ;
    private Integer    createdBy            ;
    private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private Boolean    isModerator          ;

    // Search parameters
    private SearchParam<Integer> idParam              ;
    private SearchParam<Integer> userIdParam           ;
    private SearchParam<Integer> businessGroupIdParam ;
    private SearchParam<String>  createdAtParam       ;
    private SearchParam<Integer> createdByParam       ;
    private SearchParam<String>  updatedAtParam       ;
    private SearchParam<Integer> updatedByParam       ;
    private SearchParam<Boolean> isDeletedParam       ;
    private SearchParam<Boolean> isModeratorParam     ;

    public UserBusinessGroupDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
