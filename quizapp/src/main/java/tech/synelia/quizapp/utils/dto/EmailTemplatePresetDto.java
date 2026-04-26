package tech.synelia.quizapp.utils.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class EmailTemplatePresetDto implements Cloneable {

    private Integer id;
    private String name;
    private String category;
    private String htmlStructure;
    private String previewImage;
    private String description;
    private Boolean isDeleted;
    private String createdAt;
    private String updatedAt;

    public EmailTemplatePresetDto() {
        super();
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
