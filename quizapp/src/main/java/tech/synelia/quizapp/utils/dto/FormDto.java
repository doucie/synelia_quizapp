package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.customize._FormDto;

@Data
@ToString
@EqualsAndHashCode(callSuper = false)
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class FormDto extends _FormDto implements Cloneable {

    private Integer    id                   ;
    private String     formName             ;
    private String     formDesc             ;
    private Boolean    isActive             ;
    private Boolean    isTimed              ;
    private String     createdAt            ;
    private Integer    createdBy            ;
    private String     updatedAt            ;
    private Integer    updatedBy            ;
    private Boolean    isDeleted            ;
    private String     searchString         ;
    // Champs pour les intervalles de dates (recherche avancee)
    private String     dateCreationDe       ;
    private String     dateCreationA        ;
    private String     dateModificationDe   ;
    private String     dateModificationA    ;
    @JsonProperty(value = "filterCampaignId", access = JsonProperty.Access.WRITE_ONLY)
    private Integer    filterCampaignId     ;

    // Search param
    private SearchParam<Integer>  idParam               ;
    private SearchParam<String>   formNameParam          ;
    private SearchParam<String>   formDescParam          ;
    private SearchParam<Boolean>  isActiveParam          ;
    private SearchParam<Boolean>  isTimedParam           ;
    private SearchParam<String>   createdAtParam         ;
    private SearchParam<Integer>  createdByParam         ;
    private SearchParam<String>   updatedAtParam         ;
    private SearchParam<Integer>  updatedByParam         ;
    private SearchParam<Boolean>  isDeletedParam         ;
    private SearchParam<String>   searchStringParam      ;
    @JsonProperty("filterCampaignIdParam")
    private SearchParam<Integer>  filterCampaignIdParam  ;

    public FormDto() {
        super();
    }

	@Override
	public Object clone() throws CloneNotSupportedException {
		return super.clone();
	}
}
