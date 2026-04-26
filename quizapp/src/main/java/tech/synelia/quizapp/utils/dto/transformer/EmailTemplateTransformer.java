package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.*;

@Mapper
public interface EmailTemplateTransformer {

    EmailTemplateTransformer INSTANCE = Mappers.getMapper(EmailTemplateTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
    })
    EmailTemplateDto toDto(EmailTemplate entity) throws ParseException;

    @Named("toLiteDto")
    default EmailTemplateDto toLiteDto(EmailTemplate entity) {
        if (entity == null) return null;
        EmailTemplateDto dto = new EmailTemplateDto();
        dto.setId(entity.getId());
        dto.setTemplateKey(entity.getTemplateKey());
        dto.setSubjectTemplate(entity.getSubjectTemplate());
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<EmailTemplateDto> toDtos(List<EmailTemplate> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<EmailTemplateDto> toLiteDtos(List<EmailTemplate> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<EmailTemplateDto> dtos = new ArrayList<>();
        for (EmailTemplate entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.templateKey", target = "templateKey"),
        @Mapping(source = "dto.subjectTemplate", target = "subjectTemplate"),
        @Mapping(source = "dto.bodyTemplate", target = "bodyTemplate"),
        @Mapping(source = "dto.description", target = "description"),
        @Mapping(source = "dto.availableVariables", target = "availableVariables"),
        @Mapping(source = "dto.actionType", target = "actionType"),
        @Mapping(source = "dto.presetId", target = "presetId"),
        @Mapping(source = "dto.isActive", target = "isActive"),
        @Mapping(source = "dto.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "dto.searchString", target = "searchString"),
    })
    EmailTemplate toEntity(EmailTemplateDto dto) throws ParseException;
}
