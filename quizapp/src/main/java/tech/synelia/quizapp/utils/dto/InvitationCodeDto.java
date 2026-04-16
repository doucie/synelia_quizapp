package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._InvitationCodeDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class InvitationCodeDto extends _InvitationCodeDto implements Cloneable {

    private Long    id;
    private String  email;
    private String  role;
    private String  code;
    private Boolean isUsed;
    private String  expiredAt;
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
    private SearchParam<Long>    idParam;
    private SearchParam<String>  emailParam;
    private SearchParam<String>  roleParam;
    private SearchParam<String>  codeParam;
    private SearchParam<Boolean> isUsedParam;
    private SearchParam<String>  expiredAtParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public InvitationCodeDto() { super(); }

    @Override
    public Object clone() throws CloneNotSupportedException { return super.clone(); }
}
