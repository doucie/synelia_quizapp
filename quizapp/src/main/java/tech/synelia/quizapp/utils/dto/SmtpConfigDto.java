package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.customize._SmtpConfigDto;

@Data
@EqualsAndHashCode(callSuper = false)
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class SmtpConfigDto extends _SmtpConfigDto implements Cloneable {

    private Integer id;
    private String  host;
    private Integer port;
    private String  username;
    private String  password;
    private Boolean smtpAuth;
    private Boolean starttlsEnable;
    private Boolean starttlsRequired;
    private Integer connectionTimeout;
    private Integer timeout;
    private Integer writeTimeout;
    private String  senderName;
    private String  senderEmail;
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
    private SearchParam<String>  hostParam;
    private SearchParam<Integer> portParam;
    private SearchParam<String>  usernameParam;
    private SearchParam<String>  senderNameParam;
    private SearchParam<String>  senderEmailParam;
    private SearchParam<Boolean> smtpAuthParam;
    private SearchParam<Boolean> starttlsEnableParam;
    private SearchParam<Boolean> isActiveParam;
    private SearchParam<String>  createdAtParam;
    private SearchParam<Integer> createdByParam;
    private SearchParam<String>  updatedAtParam;
    private SearchParam<Integer> updatedByParam;
    private SearchParam<Boolean> isDeletedParam;
    private SearchParam<String>  searchStringParam;

    public SmtpConfigDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
