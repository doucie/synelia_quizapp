package tech.synelia.quizapp.utils.dto;

import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._LegalTextDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class LegalTextDto extends _LegalTextDto implements Cloneable {

    private Integer id;
    private String  textKey;
    private String  title;
    private String  content;
    private String  description;
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
    private SearchParam<String>  textKeyParam;
    private SearchParam<String>  titleParam;
    private SearchParam<String>  contentParam;
    private SearchParam<String>  descriptionParam;
    private SearchParam<Boolean> isActiveParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public LegalTextDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
