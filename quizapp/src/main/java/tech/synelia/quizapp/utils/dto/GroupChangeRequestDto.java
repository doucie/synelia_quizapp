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
public class GroupChangeRequestDto implements Cloneable {

    private Integer    id                   ;
    private Integer    userId               ;
    private Integer    targetGroupId        ;
    private String     reason               ;
    private String     status               ;
    private String     requestedAt          ;
    private String     processedAt          ;
    private Integer    processedBy          ;
    private String     createdAt            ;
    private Integer    createdBy            ;
    private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;

    // Transient display fields
    private String     userName             ;
    private String     userEmail            ;
    private String     targetGroupName      ;

    // Search parameters
    private SearchParam<Integer> idParam              ;
    private SearchParam<Integer> userIdParam           ;
    private SearchParam<Integer> targetGroupIdParam   ;
    private SearchParam<String>  statusParam          ;
    private SearchParam<String>  requestedAtParam     ;
    private SearchParam<String>  processedAtParam     ;
    private SearchParam<Integer> processedByParam     ;
    private SearchParam<String>  createdAtParam       ;
    private SearchParam<Integer> createdByParam       ;
    private SearchParam<String>  updatedAtParam       ;
    private SearchParam<Integer> updatedByParam       ;
    private SearchParam<Boolean> isDeletedParam       ;

    public GroupChangeRequestDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
