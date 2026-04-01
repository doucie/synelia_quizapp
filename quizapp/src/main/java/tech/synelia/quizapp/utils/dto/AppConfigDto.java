package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._AppConfigDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class AppConfigDto extends _AppConfigDto implements Cloneable {

    private Long    id;
    private String  configName;
    private String  companyName;
    private String  logoHtml;
    private String  primaryColor;
    private String  colorScheme;
    private Boolean isActive;
    private String  createdAt;
    private Integer createdBy;
    private String  updatedAt;
    private Integer updatedBy;
    private Boolean isDeleted;
    private String  searchString;

    // Search params
    private SearchParam<Long>    idParam;
    private SearchParam<String>  configNameParam;
    private SearchParam<String>  companyNameParam;
    private SearchParam<String>  primaryColorParam;
    private SearchParam<String>  colorSchemeParam;
    private SearchParam<Boolean> isActiveParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public AppConfigDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
