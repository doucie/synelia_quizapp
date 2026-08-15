package tech.synelia.quizapp.utils.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class EvaluationGridTemplateDto implements Cloneable {

    private Integer id;
    private String  templateName;
    private String  templateDesc;
    private Boolean isActive;
    private Boolean isDeleted;
    private List<EvaluationGridTemplateVersionDto> versions;

    public EvaluationGridTemplateDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
