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
public interface PipelineTemplateTransformer {

    PipelineTemplateTransformer INSTANCE = Mappers.getMapper(PipelineTemplateTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "entity.isActive", target = "isActive"),
        @Mapping(source = "entity.isDefault", target = "isDefault"),
        @Mapping(source = "entity.isLocked", target = "isLocked"),
        @Mapping(source = "entity.isDeleted", target = "isDeleted"),
    })
    PipelineTemplateDto toDto(PipelineTemplate entity) throws ParseException;

    @Named("toLiteDto")
    default PipelineTemplateDto toLiteDto(PipelineTemplate entity) {
        if (entity == null) return null;
        PipelineTemplateDto dto = new PipelineTemplateDto();
        dto.setId(entity.getId());
        dto.setTemplateName(entity.getTemplateName());
        dto.setIsDefault(entity.getIsDefault());
        dto.setIsActive(entity.getIsActive());
        dto.setIsLocked(entity.getIsLocked());
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<PipelineTemplateDto> toDtos(List<PipelineTemplate> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<PipelineTemplateDto> toLiteDtos(List<PipelineTemplate> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<PipelineTemplateDto> dtos = new ArrayList<>();
        for (PipelineTemplate entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.templateName", target = "templateName"),
        @Mapping(source = "dto.templateDesc", target = "templateDesc"),
        @Mapping(source = "dto.isDefault", target = "isDefault"),
        @Mapping(source = "dto.isActive", target = "isActive"),
        @Mapping(source = "dto.isLocked", target = "isLocked"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
    })
    PipelineTemplate toEntity(PipelineTemplateDto dto) throws ParseException;
}
