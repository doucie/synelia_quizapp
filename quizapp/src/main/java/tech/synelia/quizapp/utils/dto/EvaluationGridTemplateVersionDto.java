package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class EvaluationGridTemplateVersionDto implements Cloneable {

    private Integer id;
    private Integer evaluationGridTemplateId;
    private Integer versionNumber;
    private String  versionLabel;
    private Boolean isPublished;
    private String  publishedAt;
    private String  lockedAt;
    private Boolean isDeleted;

    public EvaluationGridTemplateVersionDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
