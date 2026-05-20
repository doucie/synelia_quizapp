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
public interface PipelineStageTransformer {

    PipelineStageTransformer INSTANCE = Mappers.getMapper(PipelineStageTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "entity.pipelineTemplate.id", target = "pipelineTemplateId"),
        @Mapping(source = "entity.pipelineTemplate.templateName", target = "pipelineTemplateName"),
    })
    PipelineStageDto toDto(PipelineStage entity) throws ParseException;

    @Named("toLiteDto")
    default PipelineStageDto toLiteDto(PipelineStage entity) {
        if (entity == null) return null;
        PipelineStageDto dto = new PipelineStageDto();
        dto.setId(entity.getId());
        dto.setStageType(entity.getStageType());
        dto.setStageLabel(entity.getStageLabel());
        dto.setStageOrder(entity.getStageOrder());
        dto.setIsRequired(entity.getIsRequired());
        dto.setIsEliminatory(entity.getIsEliminatory());
        dto.setEmailRequired(entity.getEmailRequired());
        dto.setEmailAutomatic(entity.getEmailAutomatic());
        if (entity.getPipelineTemplate() != null) {
            dto.setPipelineTemplateId(entity.getPipelineTemplate().getId());
        }
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<PipelineStageDto> toDtos(List<PipelineStage> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<PipelineStageDto> toLiteDtos(List<PipelineStage> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<PipelineStageDto> dtos = new ArrayList<>();
        for (PipelineStage entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.stageType", target = "stageType"),
        @Mapping(source = "dto.stageLabel", target = "stageLabel"),
        @Mapping(source = "dto.stageOrder", target = "stageOrder"),
        @Mapping(source = "dto.isRequired", target = "isRequired"),
        @Mapping(source = "dto.isEliminatory", target = "isEliminatory"),
        @Mapping(source = "dto.emailRequired", target = "emailRequired"),
        @Mapping(source = "dto.emailAutomatic", target = "emailAutomatic"),
        @Mapping(source = "dto.configJson", target = "configJson"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "pipelineTemplate", target = "pipelineTemplate"),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "searchString", ignore = true),
    })
    PipelineStage toEntity(PipelineStageDto dto, PipelineTemplate pipelineTemplate) throws ParseException;
}
